from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WeakSubjectDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    subject_code: str
    subject_name: str
    score_percent: float


class SkillGapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    gap_id: int
    student_id: int
    weak_subject_count: int
    moderate_subject_count: int
    attendance_at_risk: bool
    weak_subjects: list[WeakSubjectDetail]
    generated_at: datetime


class SkillGapRecalcResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str
    weak_subject_count: int
    updated_at: datetime
