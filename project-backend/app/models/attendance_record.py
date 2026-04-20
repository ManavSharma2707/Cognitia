from sqlalchemy import Integer, SmallInteger, String, Numeric, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    attendance_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id"), nullable=False)
    subject_code: Mapped[str] = mapped_column(String(20), nullable=False)
    subject_name: Mapped[str] = mapped_column(String(150), nullable=False)
    attendance_pct: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    at_risk: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    semester: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    recorded_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="attendance_records")
