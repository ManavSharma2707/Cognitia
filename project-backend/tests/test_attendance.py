import pytest


@pytest.mark.asyncio
async def test_attendance_at_risk(client, student_token):
    r = await client.post(
        "/api/v1/attendance/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"subject_code": "MATH101", "subject_name": "Math", "attendance_pct": 60, "semester": 3},
    )
    assert r.status_code == 201
    assert r.json()["at_risk"] is True


@pytest.mark.asyncio
async def test_attendance_not_at_risk_exactly_75(client, student_token):
    r = await client.post(
        "/api/v1/attendance/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"subject_code": "CS101", "subject_name": "CS", "attendance_pct": 75.0, "semester": 3},
    )
    assert r.status_code == 201
    assert r.json()["at_risk"] is False


@pytest.mark.asyncio
async def test_attendance_pct_out_of_range(client, student_token):
    r = await client.post(
        "/api/v1/attendance/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"subject_code": "X", "subject_name": "X", "attendance_pct": 105, "semester": 3},
    )
    assert r.status_code in (400, 422)
