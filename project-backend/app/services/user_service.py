from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import deactivate_user, get_user_by_id, list_users
from app.schemas.user import DeactivateResponse, UserListResponse, UserSummary


async def list_all_users(
    db: AsyncSession,
    page: int,
    limit: int,
    role_filter: str | None,
) -> UserListResponse:
    total, users = await list_users(db, page, limit, role_filter)
    return UserListResponse(total=total, users=[UserSummary.model_validate(u) for u in users])


async def deactivate_user_account(db: AsyncSession, user_id: int) -> DeactivateResponse:
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await deactivate_user(db, user_id)
    await db.commit()
    return DeactivateResponse(message="User deactivated", user_id=user_id)
