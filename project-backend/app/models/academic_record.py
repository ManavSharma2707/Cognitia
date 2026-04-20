from sqlalchemy import Integer, SmallInteger, String, Numeric, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class AcademicRecord(Base):
    __tablename__ = "academic_records"
    __table_args__ = (UniqueConstraint("student_id", "subject_code", "semester"),)

    record_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id"), nullable=False)
    subject_code: Mapped[str] = mapped_column(String(20), nullable=False)
    subject_name: Mapped[str] = mapped_column(String(150), nullable=False)
    marks_obtained: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    max_marks: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=100)
    score_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    performance_level: Mapped[str | None] = mapped_column(String(10), nullable=True)
    semester: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    recorded_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="academic_records")
