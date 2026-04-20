from sqlalchemy import Integer, SmallInteger, String, DateTime, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Student(Base):
    __tablename__ = "students"

    student_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    roll_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    semester: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    interests: Mapped[list] = mapped_column(ARRAY(Text), default=list)
    career_goal: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="student")
    academic_records: Mapped[list["AcademicRecord"]] = relationship("AcademicRecord", back_populates="student")
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship("AttendanceRecord", back_populates="student")
    skill_gap: Mapped["SkillGap"] = relationship("SkillGap", back_populates="student", uselist=False)
    learning_paths: Mapped[list["LearningPath"]] = relationship("LearningPath", back_populates="student")
    progress_records: Mapped[list["Progress"]] = relationship("Progress", back_populates="student")
    faculty_assignments: Mapped[list["FacultyStudent"]] = relationship("FacultyStudent", back_populates="student")
