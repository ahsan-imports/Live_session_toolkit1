from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session as DBSession

from . import models
from .database import get_db
from .security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(
    token: str = Depends(oauth2_scheme), db: DBSession = Depends(get_db)
) -> models.User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_error
    user = db.get(models.User, user_id)
    if user is None:
        raise credentials_error
    return user


def get_owned_session(
    session_id: str,
    db: DBSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> models.LiveSession:
    session = db.get(models.LiveSession, session_id)
    if session is None or session.facilitator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session
