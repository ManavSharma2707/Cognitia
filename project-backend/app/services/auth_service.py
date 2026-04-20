from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.faculty_repository import create_faculty
from app.repositories.student_repository import create_student, get_student_by_roll_number
from app.repositories.user_repository import create_user, get_user_by_email, get_user_by_id
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    MeResponse,
    RegisterRequest,
    RegisterResponse,
)


async def register(db: AsyncSession, data: RegisterRequest) -> RegisterResponse:
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    if data.role == "student" and data.roll_number:
        existing_student = await get_student_by_roll_number(db, data.roll_number)
        if existing_student:
            raise HTTPException(status_code=409, detail="Roll number already registered")

    pw_hash = hash_password(data.password)
    user = await create_user(db, data.email, pw_hash, data.full_name, data.role)

    if data.role == "student":
        await create_student(db, user.user_id, data.roll_number, data.department, data.semester)
    elif data.role == "faculty":
        await create_faculty(db, user.user_id, data.department)

    await db.commit()
    return RegisterResponse(
        user_id=user.user_id,
        email=user.email,
        role=user.role,
        message="Account created successfully",
    )


async def login(db: AsyncSession, data: LoginRequest) -> LoginResponse:
    user = await get_user_by_email(db, data.email)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.user_id), "role": user.role})
    return LoginResponse(access_token=token, token_type="bearer", role=user.role, user_id=user.user_id)


async def get_me(db: AsyncSession, user_id: int) -> MeResponse:
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return MeResponse(user_id=user.user_id, email=user.email, full_name=user.full_name, role=user.role)
