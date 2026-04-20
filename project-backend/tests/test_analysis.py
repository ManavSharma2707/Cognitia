import pytest


@pytest.mark.asyncio
async def test_skill_gap_recalculate(client, student_token):
    await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "WEAKSUBJ",
            "subject_name": "Weak Subject",
            "marks_obtained": 30,
            "max_marks": 100,
            "semester": 3,
        },
    )
    r = await client.post(
        "/api/v1/analysis/skill-gap/recalculate",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 200
    assert r.json()["weak_subject_count"] >= 1


@pytest.mark.asyncio
async def test_skill_gap_summary(client, student_token):
    await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "MATH101",
            "subject_name": "Math",
            "marks_obtained": 40,
            "max_marks": 100,
            "semester": 3,
        },
    )
    await client.post(
        "/api/v1/analysis/skill-gap/recalculate",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    r = await client.get(
        "/api/v1/analysis/skill-gap",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "weak_subject_count" in data
    assert "attendance_at_risk" in data
