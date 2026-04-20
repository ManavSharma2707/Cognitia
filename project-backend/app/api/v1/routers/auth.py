import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse
from app.services.auth_service import get_me, login, register

router = APIRouter()
logger = logging.getLogger("audit")


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register_user(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await register(db, data)


@router.post("/login", response_model=LoginResponse)
async def login_user(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await login(db, data)
    except Exception:
        logger.warning("Failed login attempt: email=%s ip=%s", data.email, request.client.host)
        raise


@router.get("/me", response_model=MeResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_me(db, current_user.user_id)
