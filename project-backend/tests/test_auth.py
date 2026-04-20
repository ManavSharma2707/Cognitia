import pytest


@pytest.mark.asyncio
async def test_register_student_success(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newstu@test.com",
            "password": "password123",
            "full_name": "New Student",
            "role": "student",
            "department": "CS",
            "roll_number": "R999",
            "semester": 2,
        },
    )
    assert r.status_code == 201
    assert "user_id" in r.json()


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {
        "email": "dup@test.com",
        "password": "password123",
        "full_name": "Dup",
        "role": "faculty",
        "department": "CS",
    }
    await client.post("/api/v1/auth/register", json=payload)
    r = await client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_register_invalid_role(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "x@test.com",
            "password": "password123",
            "full_name": "X",
            "role": "admin",
            "department": "CS",
        },
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_register_missing_roll_number(client):
    r = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "y@test.com",
            "password": "password123",
            "full_name": "Y",
            "role": "student",
            "department": "CS",
            "semester": 1,
        },
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client, student_token):
    assert len(student_token) > 10


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "stu@test.com",
            "password": "password123",
            "full_name": "Student",
            "role": "student",
            "department": "CS",
            "roll_number": "R001",
            "semester": 3,
        },
    )
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "stu@test.com", "password": "wrongpass"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client, student_token):
    r = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    assert r.json()["role"] == "student"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401
