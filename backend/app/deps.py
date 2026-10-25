from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, Worker


def get_current_user_id(x_user_id: str = Header(None, alias="X-User-Id")) -> int:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")
    try:
        return int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid X-User-Id header")


def get_current_user(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(allowed_roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Forbidden for current user role")
        return user
    return role_checker


def get_current_worker(user: User = Depends(require_role(["worker"])), db: Session = Depends(get_db)) -> Worker:
    worker = db.query(Worker).filter(Worker.user_id == user.id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found for user")
    return worker
