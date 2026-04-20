from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LearningPathModuleItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    module_id: int
    title: str
    category: str
    domain: str
    level: str
    estimated_hours: int
    status: str
    sequence_order: int


class LearningPathResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    path_id: int
    student_id: int
    generated_at: datetime
    completion_pct: float
    modules: list[LearningPathModuleItem]


class LearningPathGenerateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    path_id: int
    module_count: int
    generated_at: datetime
    message: str


class LearningPathHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    path_id: int
    generated_at: datetime
    completion_pct: float
    module_count: int
    is_current: bool


class LearningPathHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    paths: list[LearningPathHistoryItem]
