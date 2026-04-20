import pytest


@pytest.mark.asyncio
async def test_add_academic_record(client, student_token):
    r = await client.post(
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
    assert r.status_code == 201
    data = r.json()
    assert data["score_percent"] == 40.0
    assert data["performance_level"] == "weak"


@pytest.mark.asyncio
async def test_score_percent_strong(client, student_token):
    r = await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "CS101",
            "subject_name": "CS",
            "marks_obtained": 80,
            "max_marks": 100,
            "semester": 3,
        },
    )
    assert r.status_code == 201
    assert r.json()["performance_level"] == "strong"


@pytest.mark.asyncio
async def test_score_percent_moderate(client, student_token):
    r = await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "CS201",
            "subject_name": "DS",
            "marks_obtained": 60,
            "max_marks": 100,
            "semester": 3,
        },
    )
    assert r.status_code == 201
    assert r.json()["performance_level"] == "moderate"


@pytest.mark.asyncio
async def test_score_percent_weak_boundary_40(client, student_token):
    r = await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "WEAK40",
            "subject_name": "Weak Boundary",
            "marks_obtained": 40,
            "max_marks": 100,
            "semester": 3,
        },
    )
    assert r.status_code == 201
    assert r.json()["performance_level"] == "weak"


@pytest.mark.asyncio
async def test_score_percent_boundary_75_is_strong(client, student_token):
    r = await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "B75",
            "subject_name": "Boundary 75",
            "marks_obtained": 75,
            "max_marks": 100,
            "semester": 3,
        },
    )
    assert r.status_code == 201
    assert r.json()["performance_level"] == "strong"


@pytest.mark.asyncio
async def test_score_percent_boundary_50_is_moderate(client, student_token):
    r = await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "B50",
            "subject_name": "Boundary 50",
            "marks_obtained": 50,
            "max_marks": 100,
            "semester": 3,
        },
    )
    assert r.status_code == 201
    assert r.json()["performance_level"] == "moderate"


@pytest.mark.asyncio
async def test_add_duplicate_record(client, student_token):
    payload = {
        "subject_code": "DBMS101",
        "subject_name": "DBMS",
        "marks_obtained": 50,
        "max_marks": 100,
        "semester": 3,
    }
    await client.post("/api/v1/academic/records", headers={"Authorization": f"Bearer {student_token}"}, json=payload)
    r = await client.post("/api/v1/academic/records", headers={"Authorization": f"Bearer {student_token}"}, json=payload)
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_marks_exceed_max(client, student_token):
    r = await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "PHY101",
            "subject_name": "Phy",
            "marks_obtained": 110,
            "max_marks": 100,
            "semester": 3,
        },
    )
    assert r.status_code in (400, 422)


@pytest.mark.asyncio
async def test_get_academic_records(client, student_token):
    r = await client.get("/api/v1/academic/records", headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    assert "records" in r.json()
