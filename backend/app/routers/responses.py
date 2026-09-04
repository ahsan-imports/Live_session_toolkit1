from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from .. import models, schemas
from ..database import get_db
from ..ws_manager import manager

router = APIRouter(prefix="/questions", tags=["responses"])


def _normalise(value: str | None) -> str:
    return " ".join((value or "").strip().lower().split())


def _evaluate(question: models.Question, payload: schemas.ResponseSubmit) -> bool | None:
    if question.mode != "quiz" or not question.has_correct_answer:
        return None
    qtype = question.question_type
    settings = question.settings or {}

    if qtype in {"multiple_choice", "dropdown"}:
        option = next((o for o in question.options if o.id == payload.option_id), None)
        return bool(option and option.is_correct)
    if qtype == "checkboxes":
        selected = set(payload.selected_option_ids)
        correct = {o.id for o in question.options if o.is_correct}
        return selected == correct
    if qtype in {"short_answer", "paragraph"}:
        expected = settings.get("correct_answer")
        if expected is None:
            return None
        return _normalise(payload.text_answer) == _normalise(str(expected))
    if qtype in {"linear_scale", "rating"}:
        expected = settings.get("correct_value")
        if expected is None or payload.numeric_answer is None:
            return None
        return int(payload.numeric_answer) == int(expected)
    if qtype in {"multiple_choice_grid", "checkbox_grid"}:
        expected = settings.get("correct_grid")
        if not isinstance(expected, dict):
            return None
        return payload.grid_answers == expected
    return None


@router.post("/{question_id}/responses", response_model=schemas.ResponseOut, status_code=status.HTTP_201_CREATED)
async def submit_response(question_id: str, payload: schemas.ResponseSubmit, db: DBSession = Depends(get_db)):
    question = db.get(models.Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    activity = question.activity
    if not activity.is_launched or activity.is_closed:
        raise HTTPException(status_code=400, detail="This question is not currently open")
    participant = db.get(models.Participant, payload.participant_id)
    if participant is None or participant.session_id != activity.session_id:
        raise HTTPException(status_code=404, detail="Participant not found in this session")

    existing = db.query(models.ResponseRecord).filter(
        models.ResponseRecord.question_id == question.id,
        models.ResponseRecord.participant_id == participant.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already answered this question")

    if payload.option_id:
        option = db.get(models.Option, payload.option_id)
        if option is None or option.question_id != question.id:
            raise HTTPException(status_code=400, detail="That option does not belong to this question")
    for oid in payload.selected_option_ids:
        option = db.get(models.Option, oid)
        if option is None or option.question_id != question.id:
            raise HTTPException(status_code=400, detail="One or more selected options are invalid")

    if question.question_type in {"short_answer", "paragraph"} and not (payload.text_answer or "").strip():
        raise HTTPException(status_code=400, detail="Please enter an answer")
    if question.question_type in {"linear_scale", "rating"} and payload.numeric_answer is None:
        raise HTTPException(status_code=400, detail="Please select a value")
    if question.question_type == "file_upload" and not payload.file_url:
        raise HTTPException(status_code=400, detail="Please upload a file")

    answer_data = {
        "text_answer": payload.text_answer,
        "selected_option_ids": payload.selected_option_ids,
        "numeric_answer": payload.numeric_answer,
        "grid_answers": payload.grid_answers,
        "file_url": payload.file_url,
    }
    response = models.ResponseRecord(
        question_id=question.id,
        participant_id=participant.id,
        option_id=payload.option_id,
        answer_data=answer_data,
        is_correct=_evaluate(question, payload),
    )
    db.add(response)
    db.commit()
    db.refresh(response)

    counts = {opt.id: 0 for opt in question.options}
    for r in question.responses:
        if r.option_id in counts:
            counts[r.option_id] += 1
        for oid in (r.answer_data or {}).get("selected_option_ids", []):
            if oid in counts:
                counts[oid] += 1

    await manager.broadcast(activity.session.code, {
        "event": "response_submitted",
        "question_id": question.id,
        "total_responses": len(question.responses),
        "option_counts": counts,
    })
    return response
