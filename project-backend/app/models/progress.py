from sqlalchemy import Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("student_id", "module_id", "path_id"),)

    progress_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id"), nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.module_id"), nullable=False)
    path_id: Mapped[int] = mapped_column(Integer, ForeignKey("learning_paths.path_id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="not_started")
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="progress_records")
    module: Mapped["Module"] = relationship("Module")
    learning_path: Mapped["LearningPath"] = relationship("LearningPath", back_populates="progress_records")
