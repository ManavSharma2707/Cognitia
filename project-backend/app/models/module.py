from sqlalchemy import Integer, SmallInteger, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Module(Base):
    __tablename__ = "modules"

    module_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    domain: Mapped[str] = mapped_column(String(100), nullable=False)
    level: Mapped[str] = mapped_column(String(20), nullable=False)
    estimated_hours: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=5)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
