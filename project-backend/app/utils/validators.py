from app.core.constants import (
    ATTENDANCE_RISK_THRESHOLD,
    ALLOWED_INTERESTS,
    MODERATE_THRESHOLD,
    STRONG_THRESHOLD,
    PerformanceLevel,
    ProgressStatus,
)


def validate_semester(v: int) -> int:
    if not (1 <= v <= 10):
        raise ValueError("semester must be between 1 and 10")
    return v


def validate_interests(v: list[str]) -> list[str]:
    invalid = [i for i in v if i not in ALLOWED_INTERESTS]
    if invalid:
        raise ValueError(f"Invalid interests: {invalid}. Allowed: {ALLOWED_INTERESTS}")
    return v


def validate_progress_status(v: str) -> str:
    allowed = [ProgressStatus.NOT_STARTED, ProgressStatus.IN_PROGRESS, ProgressStatus.COMPLETED]
    if v not in allowed:
        raise ValueError(f"status must be one of {allowed}")
    return v


def validate_score(marks: float, max_marks: float) -> None:
    if marks < 0:
        raise ValueError("marks_obtained cannot be negative")
    if marks > max_marks:
        raise ValueError("marks_obtained cannot exceed max_marks")


def validate_attendance_pct(v: float) -> float:
    if not (0 <= v <= 100):
        raise ValueError("attendance_pct must be between 0 and 100")
    return v


def compute_score_percent(marks: float, max_marks: float) -> float:
    return round(float(marks) / float(max_marks) * 100, 2)


def compute_performance_level(score_pct: float) -> str:
    if score_pct >= STRONG_THRESHOLD:
        return PerformanceLevel.STRONG
    if score_pct >= MODERATE_THRESHOLD:
        return PerformanceLevel.MODERATE
    return PerformanceLevel.WEAK


def compute_at_risk(attendance_pct: float) -> bool:
    return float(attendance_pct) < ATTENDANCE_RISK_THRESHOLD
