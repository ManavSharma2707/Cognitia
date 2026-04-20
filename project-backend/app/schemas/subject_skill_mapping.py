from typing import Literal

from pydantic import BaseModel, ConfigDict


class MappingCreate(BaseModel):
    subject_code: str
    module_id: int
    priority: int = 1
    performance_level_trigger: Literal["weak", "moderate", "both"]


class MappingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    map_id: int
    subject_code: str
    module_id: int
    priority: int
