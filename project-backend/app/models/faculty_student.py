from sqlalchemy import Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class FacultyStudent(Base):
    __tablename__ = "faculty_student"
    __table_args__ = (UniqueConstraint("faculty_id", "student_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    faculty_id: Mapped[int] = mapped_column(Integer, ForeignKey("faculty.faculty_id"), nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.student_id"), nullable=False)
    assigned_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    faculty: Mapped["Faculty"] = relationship("Faculty", back_populates="student_assignments")
    student: Mapped["Student"] = relationship("Student", back_populates="faculty_assignments")
