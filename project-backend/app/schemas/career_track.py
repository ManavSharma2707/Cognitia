from pydantic import BaseModel, ConfigDict

from app.schemas.module import ModuleResponse


class CareerTrackSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    track_id: int
    domain: str
    description: str | None
    module_count: int


class CareerTrackListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    tracks: list[CareerTrackSummary]


class CareerTrackModulesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    track_id: int
    domain: str
    modules: list[ModuleResponse]


class AddTrackModuleRequest(BaseModel):
    module_id: int
    sequence_order: int


class AddTrackModuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    track_id: int
    module_id: int
    sequence_order: int
