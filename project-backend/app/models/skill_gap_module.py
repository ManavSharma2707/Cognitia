from sqlalchemy import Integer, SmallInteger, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SkillGapModule(Base):
    __tablename__ = "skill_gap_modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    gap_id: Mapped[int] = mapped_column(Integer, ForeignKey("skill_gaps.gap_id", ondelete="CASCADE"), nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.module_id"), nullable=False)
    source_subject_code: Mapped[str] = mapped_column(String(20), nullable=False)
    priority: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)

    skill_gap: Mapped["SkillGap"] = relationship("SkillGap", back_populates="gap_modules")
    module: Mapped["Module"] = relationship("Module")
