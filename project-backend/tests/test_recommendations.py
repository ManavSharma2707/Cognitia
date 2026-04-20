import pytest


@pytest.mark.asyncio
async def test_generate_path(client, student_token):
    await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "SUBJ001",
            "subject_name": "Subject 1",
            "marks_obtained": 35,
            "max_marks": 100,
            "semester": 3,
        },
    )
    r = await client.post(
        "/api/v1/recommendations/learning-path/generate",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 201
    assert r.json()["module_count"] > 0


@pytest.mark.asyncio
async def test_get_current_path(client, student_token):
    await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "SUBJ001",
            "subject_name": "Subject 1",
            "marks_obtained": 35,
            "max_marks": 100,
            "semester": 3,
        },
    )
    await client.post("/api/v1/recommendations/learning-path/generate", headers={"Authorization": f"Bearer {student_token}"})
    r = await client.get("/api/v1/recommendations/learning-path", headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code in (200, 404)


@pytest.mark.asyncio
async def test_no_duplicate_modules_in_path(client, student_token):
    await client.post(
        "/api/v1/academic/records",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "subject_code": "SUBJ001",
            "subject_name": "Subject 1",
            "marks_obtained": 35,
            "max_marks": 100,
            "semester": 3,
        },
    )
    await client.post("/api/v1/recommendations/learning-path/generate", headers={"Authorization": f"Bearer {student_token}"})
    r = await client.get("/api/v1/recommendations/learning-path", headers={"Authorization": f"Bearer {student_token}"})
    if r.status_code == 200:
        mods = r.json()["modules"]
        ids = [m["module_id"] for m in mods]
        assert len(ids) == len(set(ids)), "Duplicate module_ids found in learning path"


@pytest.mark.asyncio
async def test_path_history(client, student_token):
    r = await client.get(
        "/api/v1/recommendations/learning-path/history",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 200
    assert "paths" in r.json()


@pytest.mark.asyncio
async def test_get_career_tracks(client, student_token):
    r = await client.get(
        "/api/v1/recommendations/career-tracks",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert r.status_code == 200
    assert "tracks" in r.json()
