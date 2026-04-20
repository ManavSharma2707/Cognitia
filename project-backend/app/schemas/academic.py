from pydantic import BaseModel, ConfigDict, model_validator


class AcademicRecordCreate(BaseModel):
    subject_code: str
    subject_name: str
    marks_obtained: float
    max_marks: float = 100.0
    semester: int

    @model_validator(mode="after")
    def check_marks(self):
        if self.marks_obtained < 0:
            raise ValueError("marks_obtained cannot be negative")
        if self.marks_obtained > self.max_marks:
            raise ValueError("marks_obtained cannot exceed max_marks")
        if self.max_marks <= 0:
            raise ValueError("max_marks must be positive")
        if not (1 <= self.semester <= 10):
            raise ValueError("semester must be between 1 and 10")
        return self


class AcademicRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    record_id: int
    subject_code: str
    subject_name: str
    marks_obtained: float
    max_marks: float
    score_percent: float
    performance_level: str
    semester: int


class AcademicRecordCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    record_id: int
    subject_code: str
    score_percent: float
    performance_level: str
    message: str


class AcademicRecordsListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    records: list[AcademicRecordResponse]
