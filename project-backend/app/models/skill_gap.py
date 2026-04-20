from sqlalchemy import Integer, SmallInteger, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    gap_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id"), unique=True, nullable=False)
    weak_subject_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    moderate_subject_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    attendance_at_risk: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    generated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="skill_gap")
    gap_modules: Mapped[list["SkillGapModule"]] = relationship("SkillGapModule", back_populates="skill_gap", cascade="all, delete-orphan")
