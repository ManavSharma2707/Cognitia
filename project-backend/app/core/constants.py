class Role:
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class PerformanceLevel:
    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"


# Thresholds — SRS REQ-F-10, REQ-F-11
STRONG_THRESHOLD = 75.0
MODERATE_THRESHOLD = 50.0
ATTENDANCE_RISK_THRESHOLD = 75.0


class ModuleCategory:
    ACADEMIC_REMEDIATION = "Academic Remediation"
    CAREER_SKILL = "Career Skill"
    INTEREST_BASED = "Interest-Based"
    ATTENDANCE_RECOVERY = "Attendance Recovery"


class ModuleLevel:
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ProgressStatus:
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


ALLOWED_INTERESTS = [
    "Machine Learning",
    "Web Development",
    "DSA",
    "Data Science",
    "Cloud Computing",
    "UI/UX Design",
]
