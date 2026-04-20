from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_student
from app.db.session import get_db
from app.models.user import User
from app.repositories.student_repository import get_student_by_user_id
from app.schemas.career_track import CareerTrackListResponse, CareerTrackModulesResponse
from app.schemas.learning_path import LearningPathGenerateResponse, LearningPathHistoryResponse, LearningPathResponse
from app.services.recommendation_service import (
    generate_learning_path,
    get_active_career_tracks,
    get_career_track_modules_detail,
    get_current_learning_path,
    get_learning_path_history,
)

router = APIRouter()


@router.get("/learning-path", response_model=LearningPathResponse)
async def get_path(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await get_current_learning_path(db, student.student_id)


@router.post("/learning-path/generate", response_model=LearningPathGenerateResponse, status_code=201)
async def gen_path(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await generate_learning_path(db, student.student_id)


@router.get("/learning-path/history", response_model=LearningPathHistoryResponse)
async def path_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = await get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await get_learning_path_history(db, student.student_id)


@router.get("/career-tracks", response_model=CareerTrackListResponse)
async def career_tracks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_active_career_tracks(db)


@router.get("/career-tracks/{track_id}/modules", response_model=CareerTrackModulesResponse)
async def career_track_modules(
    track_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_career_track_modules_detail(db, track_id)
