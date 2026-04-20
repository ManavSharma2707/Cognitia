from sqlalchemy import Integer, Boolean, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class LearningPath(Base):
    __tablename__ = "learning_paths"

    path_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id"), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    completion_pct: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.00)
    generated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="learning_paths")
    path_modules: Mapped[list["LearningPathModule"]] = relationship("LearningPathModule", back_populates="path", cascade="all, delete-orphan")
    progress_records: Mapped[list["Progress"]] = relationship("Progress", back_populates="learning_path")
