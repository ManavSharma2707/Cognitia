import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.v1.router import api_v1_router
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(
    title="Learning Path Recommendation API",
    version="1.0.0",
    description="Personalized Adaptive Learning Path Recommendation System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    message = str(exc).lower()

    if "students_roll_number_key" in message:
        detail = "Roll number already registered"
    elif "users_email_key" in message:
        detail = "Email already registered"
    else:
        detail = "Request violates database constraints."

    logger.warning("Integrity error: %s", exc)
    return JSONResponse(status_code=409, content={"detail": detail})


@app.exception_handler(SQLAlchemyError)
async def db_error_handler(request: Request, exc: SQLAlchemyError):
    logger.error("Database error: %s", exc)
    return JSONResponse(status_code=503, content={"detail": "Database temporarily unavailable."})


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred."})


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
