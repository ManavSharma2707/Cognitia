import pytest


@pytest.mark.asyncio
async def test_progress_summary_no_path(client, faculty_token):
    r = await client.get(
        "/api/v1/progress/summary",
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_progress_summary_student(client, student_token):
    r = await client.get(
        "/api/v1/progress/summary",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code in (200, 404)


@pytest.mark.asyncio
async def test_update_module_wrong_role(client, faculty_token):
    r = await client.patch(
        "/api/v1/progress/modules/1",
        headers={"Authorization": f"Bearer {faculty_token}"},
        json={"status": "completed"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_update_module_invalid_status(client, student_token):
    r = await client.patch(
        "/api/v1/progress/modules/1",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"status": "done"},
    )
    assert r.status_code == 422
