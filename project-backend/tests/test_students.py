import pytest


@pytest.mark.asyncio
async def test_get_student_profile(client, student_token):
    r = await client.get("/api/v1/students/profile", headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    assert "student_id" in r.json()


@pytest.mark.asyncio
async def test_get_profile_wrong_role(client, faculty_token):
    r = await client.get("/api/v1/students/profile", headers={"Authorization": f"Bearer {faculty_token}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_update_profile_valid_interests(client, student_token):
    r = await client.put(
        "/api/v1/students/profile",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"interests": ["Machine Learning", "DSA"]},
    )
    assert r.status_code == 200
    assert "interests" in r.json()["updated_fields"]


@pytest.mark.asyncio
async def test_update_profile_invalid_interest(client, student_token):
    r = await client.put(
        "/api/v1/students/profile",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"interests": ["InvalidInterest"]},
    )
    assert r.status_code in (400, 422)


@pytest.mark.asyncio
async def test_update_profile_invalid_semester(client, student_token):
    r = await client.put(
        "/api/v1/students/profile",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"semester": 11},
    )
    assert r.status_code in (400, 422)
