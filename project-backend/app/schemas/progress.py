from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class ProgressUpdateRequest(BaseModel):
    status: Literal["not_started", "in_progress", "completed"]


class ProgressUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    progress_id: int
    module_id: int
    status: str
    updated_at: datetime
    new_completion_pct: float


class ProgressModuleStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    module_id: int
    title: str
    category: str
    domain: str
    status: str
    updated_at: datetime


class ProgressSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    path_id: int
    completion_pct: float
    total_modules: int
    completed: int
    in_progress: int
    not_started: int
    modules: list[ProgressModuleStatus]
