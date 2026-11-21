from datetime import datetime, timedelta

import pytest

STATS = {"new_words": 2, "edited_words": 5, "total_changes": 7, "average_daily_changes": 7.0}


@pytest.fixture
def activity_db(db):
    db.rpc_handlers["word_activity_stats"] = lambda _: STATS
    return db


def rpc_params(db):
    [params] = [p for n, p in db.rpc_calls if n == "word_activity_stats"]
    return datetime.fromisoformat(params["start_at"]), datetime.fromisoformat(params["end_at"])


def test_requires_admin(client, activity_db):
    assert client.get("/api/dashboard/activity").status_code == 401


def test_defaults_to_last_24_hours(admin, activity_db):
    body = admin.get("/api/dashboard/activity").json()
    assert body["total_changes"] == 7
    start, end = rpc_params(activity_db)
    assert end - start == timedelta(hours=24)


def test_custom_range(admin, activity_db):
    params = {"start": "2026-11-01T00:00:00+01:00", "end": "2026-11-08T00:00:00+01:00"}
    body = admin.get("/api/dashboard/activity", params=params).json()
    assert body["new_words"] == 2
    start, end = rpc_params(activity_db)
    assert (start.isoformat(), end.isoformat()) == (
        "2026-11-01T00:00:00+01:00",
        "2026-11-08T00:00:00+01:00",
    )


@pytest.mark.parametrize(
    "params",
    [
        {"start": "2026-11-08T00:00:00Z", "end": "2026-11-01T00:00:00Z"},
        {"start": "2024-01-01T00:00:00Z", "end": "2026-01-01T00:00:00Z"},
        {"start": "2026-11-01T00:00:00", "end": "2026-11-08T00:00:00Z"},
        {"start": "nije datum"},
    ],
)
def test_invalid_range(admin, activity_db, params):
    assert admin.get("/api/dashboard/activity", params=params).status_code == 422
    assert not activity_db.rpc_calls
