import pytest


@pytest.mark.asyncio
async def test_faculty_get_students(client, faculty_token):
    r = await client.get(
        "/api/v1/faculty/students",
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert r.status_code == 200
    assert "students" in r.json()


@pytest.mark.asyncio
async def test_student_cannot_access_faculty_endpoint(client, student_token):
    r = await client.get(
        "/api/v1/faculty/students",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_faculty_unassigned_student_detail(client, faculty_token):
    r = await client.get(
        "/api/v1/faculty/students/99999",
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert r.status_code in (403, 404)
