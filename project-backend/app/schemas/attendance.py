from pydantic import BaseModel, ConfigDict, field_validator


class AttendanceRecordCreate(BaseModel):
    subject_code: str
    subject_name: str
    attendance_pct: float
    semester: int

    @field_validator("attendance_pct")
    @classmethod
    def check_pct(cls, v):
        if not (0 <= v <= 100):
            raise ValueError("attendance_pct must be between 0 and 100")
        return v

    @field_validator("semester")
    @classmethod
    def check_semester(cls, v):
        if not (1 <= v <= 10):
            raise ValueError("semester must be between 1 and 10")
        return v


class AttendanceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    attendance_id: int
    subject_code: str
    attendance_pct: float
    at_risk: bool
