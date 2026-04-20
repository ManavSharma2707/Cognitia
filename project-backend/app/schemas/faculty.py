from pydantic import BaseModel, ConfigDict


class FacultyStudentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    student_id: int
    full_name: str
    roll_number: str
    department: str
    semester: int
    weak_subject_count: int
    attendance_at_risk: bool
    completion_pct: float


class FacultyStudentListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total: int
    students: list[FacultyStudentSummary]
