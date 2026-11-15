import pytest


@pytest.fixture
def ignored(db):
    # Same inserted_at, as after a bulk import
    db.tables["words_ignore"] = [
        {"id": i, "headword": f"rijec{i}", "type": "ime", "inserted_at": "2026-01-01T00:00:00"}
        for i in range(1, 6)
    ] + [{"id": 6, "headword": "dr", "type": "abbreviation", "inserted_at": "2025-01-01T00:00:00"}]
    return db


def test_requires_admin(client, ignored):
    assert client.get("/api/words/ignored").status_code == 401


def test_pages_cover_every_row_once(admin, ignored):
    ids = []
    for page in (1, 2, 3):
        body = admin.get("/api/words/ignored", params={"page": page, "page_size": 2}).json()
        assert body["total"] == 6
        ids += [w["id"] for w in body["items"]]
    assert sorted(ids) == [1, 2, 3, 4, 5, 6]
    assert len(set(ids)) == 6


def test_page_past_end_is_empty(admin, ignored):
    body = admin.get("/api/words/ignored", params={"page": 9, "page_size": 2}).json()
    assert body == {"items": [], "total": 6}


def test_legacy_type_values_are_readable(admin, ignored):
    body = admin.get("/api/words/ignored", params={"q": "dr"}).json()
    assert body["items"][0]["type"] == "abbreviation"


def test_bulk_add_dedupes_and_trims(admin, db):
    r = admin.post(
        "/api/words/ignored", json={"headwords": [" Ana ", "Ana", "Kenan"], "type": "ime"}
    )
    assert r.status_code == 201
    assert r.json()["count"] == 2
    assert [w["headword"] for w in db.tables["words_ignore"]] == ["Ana", "Kenan"]


@pytest.mark.parametrize(
    "body",
    [
        {"headwords": [], "type": "ime"},
        {"headwords": ["  "], "type": "ime"},
        {"headwords": ["x"], "type": "foreign"},
    ],
)
def test_bulk_add_validation(admin, db, body):
    assert admin.post("/api/words/ignored", json=body).status_code == 422


def test_update_type(admin, ignored):
    r = admin.patch("/api/words/ignored/6", json={"type": "skraćenica"})
    assert r.status_code == 200
    assert r.json()["type"] == "skraćenica"


def test_delete(admin, ignored):
    assert admin.delete("/api/words/ignored/6").status_code == 204
    assert admin.delete("/api/words/ignored/6").status_code == 404
