import pytest


@pytest.mark.asyncio
async def test_admin_list_users(client, admin_token):
    r = await client.get("/api/v1/users/", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert "total" in r.json()


@pytest.mark.asyncio
async def test_non_admin_list_users(client, student_token):
    r = await client.get("/api/v1/users/", headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_admin_deactivate_nonexistent(client, admin_token):
    r = await client.patch(
        "/api/v1/users/99999/deactivate",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 404
