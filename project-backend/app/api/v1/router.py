from fastapi import APIRouter

from app.api.v1.routers import (
    academic,
    admin_mappings,
    admin_tracks,
    analysis,
    attendance,
    auth,
    faculty,
    progress,
    recommendations,
    students,
    users,
)

api_v1_router = APIRouter()
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(students.router, prefix="/students", tags=["Students"])
api_v1_router.include_router(academic.router, prefix="/academic", tags=["Academic"])
api_v1_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_v1_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_v1_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_v1_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
api_v1_router.include_router(faculty.router, prefix="/faculty", tags=["Faculty"])
api_v1_router.include_router(admin_mappings.router, prefix="/admin/mappings", tags=["Admin"])
api_v1_router.include_router(admin_tracks.router, prefix="/admin/tracks", tags=["Admin"])
