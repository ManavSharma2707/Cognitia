from pydantic import BaseModel, ConfigDict, EmailStr, model_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    roll_number: str | None = None
    department: str
    semester: int | None = None

    @model_validator(mode="after")
    def check_student_fields(self):
        if self.role == "student":
            if not self.roll_number:
                raise ValueError("roll_number is required for student role")
            if self.semester is None:
                raise ValueError("semester is required for student role")
            if not (1 <= self.semester <= 10):
                raise ValueError("semester must be between 1 and 10")
        if self.role not in ("student", "faculty"):
            raise ValueError("role must be 'student' or 'faculty'")
        if len(self.password) < 8:
            raise ValueError("password must be at least 8 characters")
        return self


class RegisterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    email: str
    role: str
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int


class MeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    email: str
    full_name: str
    role: str
