from app.schemas.academic import (
	AcademicRecordCreate,
	AcademicRecordCreateResponse,
	AcademicRecordResponse,
	AcademicRecordsListResponse,
)
from app.schemas.attendance import AttendanceRecordCreate, AttendanceRecordResponse
from app.schemas.auth import LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse
from app.schemas.career_track import (
	AddTrackModuleRequest,
	AddTrackModuleResponse,
	CareerTrackListResponse,
	CareerTrackModulesResponse,
	CareerTrackSummary,
)
from app.schemas.common import MessageResponse
from app.schemas.faculty import FacultyStudentListResponse, FacultyStudentSummary
from app.schemas.learning_path import (
	LearningPathGenerateResponse,
	LearningPathHistoryItem,
	LearningPathHistoryResponse,
	LearningPathModuleItem,
	LearningPathResponse,
)
from app.schemas.module import ModuleResponse
from app.schemas.progress import (
	ProgressModuleStatus,
	ProgressSummaryResponse,
	ProgressUpdateRequest,
	ProgressUpdateResponse,
)
from app.schemas.skill_gap import SkillGapRecalcResponse, SkillGapResponse, WeakSubjectDetail
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate, StudentProfileUpdateResponse
from app.schemas.subject_skill_mapping import MappingCreate, MappingResponse
from app.schemas.user import (
	DeactivateResponse,
	FacultyStudentAssignmentRequest,
	FacultyStudentAssignmentResponse,
	UserListResponse,
	UserSummary,
)

__all__ = [
	"AcademicRecordCreate",
	"AcademicRecordCreateResponse",
	"AcademicRecordResponse",
	"AcademicRecordsListResponse",
	"AddTrackModuleRequest",
	"AddTrackModuleResponse",
	"AttendanceRecordCreate",
	"AttendanceRecordResponse",
	"CareerTrackListResponse",
	"CareerTrackModulesResponse",
	"CareerTrackSummary",
	"DeactivateResponse",
	"FacultyStudentAssignmentRequest",
	"FacultyStudentAssignmentResponse",
	"FacultyStudentListResponse",
	"FacultyStudentSummary",
	"LearningPathGenerateResponse",
	"LearningPathHistoryItem",
	"LearningPathHistoryResponse",
	"LearningPathModuleItem",
	"LearningPathResponse",
	"LoginRequest",
	"LoginResponse",
	"MappingCreate",
	"MappingResponse",
	"MeResponse",
	"MessageResponse",
	"ModuleResponse",
	"ProgressModuleStatus",
	"ProgressSummaryResponse",
	"ProgressUpdateRequest",
	"ProgressUpdateResponse",
	"RegisterRequest",
	"RegisterResponse",
	"SkillGapRecalcResponse",
	"SkillGapResponse",
	"StudentProfileResponse",
	"StudentProfileUpdate",
	"StudentProfileUpdateResponse",
	"UserListResponse",
	"UserSummary",
	"WeakSubjectDetail",
]
