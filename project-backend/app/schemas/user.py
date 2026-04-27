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


class FacultyStudentAssignmentRequest(BaseModel):
    faculty_user_id: int
    student_user_id: int


class FacultyStudentAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str
    faculty_user_id: int
    student_user_id: int
    faculty_id: int
    student_id: int
