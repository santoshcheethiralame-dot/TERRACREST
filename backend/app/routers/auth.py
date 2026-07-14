import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import activity, models, schemas
from ..auth import create_access_token, create_refresh_token, get_current_user, verify_password
from ..config import settings
from ..database import get_db
from ..security import check_login_allowed, client_ip, record_login_failure, record_login_success

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.LoginResponse)
def login(body: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    username = body.username.strip().lower()
    ip = client_ip(request)

    # Brute-force lockout: too many recent failures for this username *or*
    # this IP blocks further attempts for a cooldown window.
    check_login_allowed(username, ip)

    user = db.query(models.User).filter(func.lower(models.User.username) == username).first()
    if user is None or not verify_password(body.password, user.password_hash):
        record_login_failure(username, ip)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credentials not recognised. Access is by admin-issued login only.")
    if not user.active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated. Contact your relationship manager.")

    record_login_success(username, ip)
    activity.log(db, kind="login", summary=f"{user.display_name} signed in", actor_id=user.id, actor_name=user.display_name)
    return schemas.LoginResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=schemas.UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=schemas.TokenPair)
def refresh(body: schemas.RefreshRequest):
    """Exchange a valid refresh token for a fresh access + refresh pair (sliding session)."""
    try:
        payload = jwt.decode(body.refreshToken, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not a refresh token")
    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    return schemas.TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
