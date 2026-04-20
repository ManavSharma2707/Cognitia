from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class UserListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total: int
    users: list[UserSummary]


class DeactivateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str
    user_id: int
