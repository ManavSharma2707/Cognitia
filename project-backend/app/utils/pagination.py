from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20


def apply_pagination(query, page: int, limit: int):
    """Apply OFFSET/LIMIT to any SQLAlchemy select() statement."""
    return query.offset((page - 1) * limit).limit(limit)
