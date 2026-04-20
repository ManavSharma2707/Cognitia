from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.faculty_student import FacultyStudent
from app.models.academic_record import AcademicRecord
from app.models.attendance_record import AttendanceRecord
from app.models.module import Module
from app.models.subject_skill_mapping import SubjectSkillMapping
from app.models.career_track import CareerTrack
from app.models.career_track_module import CareerTrackModule
from app.models.skill_gap import SkillGap
from app.models.skill_gap_module import SkillGapModule
from app.models.learning_path import LearningPath
from app.models.learning_path_module import LearningPathModule
from app.models.progress import Progress

__all__ = [
    "User", "Student", "Faculty", "FacultyStudent",
    "AcademicRecord", "AttendanceRecord", "Module",
    "SubjectSkillMapping", "CareerTrack", "CareerTrackModule",
    "SkillGap", "SkillGapModule", "LearningPath",
    "LearningPathModule", "Progress",
]
