from pydantic import BaseModel, ConfigDict


class ModuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    module_id: int
    title: str
    category: str
    domain: str
    level: str
    estimated_hours: int
    status: str | None = None
    sequence_order: int | None = None
