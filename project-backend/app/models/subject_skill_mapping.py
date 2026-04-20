from sqlalchemy import Integer, SmallInteger, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SubjectSkillMapping(Base):
    __tablename__ = "subject_skill_mappings"

    map_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_code: Mapped[str] = mapped_column(String(20), nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.module_id"), nullable=False)
    priority: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    performance_level_trigger: Mapped[str | None] = mapped_column(String(10), nullable=True)

    module: Mapped["Module"] = relationship("Module")
