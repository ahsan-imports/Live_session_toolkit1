from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix="/uploads", tags=["uploads"])
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_SIZE = 10 * 1024 * 1024
ALLOWED = {"image/", "application/pdf", "text/", "application/zip"}


def _allowed(content_type: str | None) -> bool:
    return bool(content_type) and any(content_type.startswith(prefix) for prefix in ALLOWED)


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if not _allowed(file.content_type):
        raise HTTPException(status_code=400, detail="File type is not supported")
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File is too large (10 MB maximum)")
    suffix = Path(file.filename or "upload.bin").suffix[:12]
    name = f"{uuid4().hex}{suffix}"
    path = UPLOAD_DIR / name
    path.write_bytes(data)
    return {"url": f"/uploads/{name}", "filename": file.filename or name}
