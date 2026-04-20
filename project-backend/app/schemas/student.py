from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.constants import ALLOWED_INTERESTS


class StudentProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    student_id: int
    user_id: int
    roll_number: str
    full_name: str
    department: str
    semester: int
    interests: list[str]
    career_goal: str | None
    created_at: datetime


class StudentProfileUpdate(BaseModel):
    department: str | None = None
    semester: int | None = None
    interests: list[str] | None = None
    career_goal: str | None = None

    @field_validator("semester")
    @classmethod
    def check_semester(cls, v):
        if v is not None and not (1 <= v <= 10):
            raise ValueError("semester must be between 1 and 10")
        return v

    @field_validator("interests")
    @classmethod
    def check_interests(cls, v):
        if v is not None:
            invalid = [i for i in v if i not in ALLOWED_INTERESTS]
            if invalid:
                raise ValueError(f"Invalid interests: {invalid}")
        return v


class StudentProfileUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str
    student_id: int
    updated_fields: list[str]
