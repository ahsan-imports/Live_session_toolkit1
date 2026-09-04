from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from .. import models, schemas
from ..database import get_db
from ..deps import get_owned_session
from .activities import _build_activity_results

router = APIRouter(prefix="/sessions/{session_id}/results", tags=["results"])


@router.get("", response_model=schemas.SessionResultsOut)
def get_session_results(
    session: models.LiveSession = Depends(get_owned_session),
    db: DBSession = Depends(get_db),
):
    activity_results = [_build_activity_results(a) for a in session.activities]

    leaderboard: dict[str, schemas.LeaderboardEntryOut] = {}
    for participant in session.participants:
        correct = 0
        answered = 0
        for response in participant.responses:
            if response.question.has_correct_answer:
                answered += 1
                if response.is_correct:
                    correct += 1
        leaderboard[participant.id] = schemas.LeaderboardEntryOut(
            participant_id=participant.id,
            display_name=participant.display_name,
            correct_count=correct,
            total_answered=answered,
        )

    ranked = sorted(leaderboard.values(), key=lambda e: e.correct_count, reverse=True)

    return schemas.SessionResultsOut(
        session_id=session.id,
        title=session.title,
        activities=activity_results,
        leaderboard=ranked,
    )
