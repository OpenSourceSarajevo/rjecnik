import pytest

KUCA = {
    "id": 1,
    "headword": "kuća",
    "definitions": [{"definition": "zgrada"}],
    "frequency": 10,
    "note": "provjeriti",
}


def definition(**overrides):
    return {
        "type": "imenica",
        "gender": "ženski",
        "examples": [],
        "definition": "zgrada",
        "part_of_speech": None,
        "pronunciation_ipa": None,
        "pronunciation_audio": None,
        **overrides,
    }


@pytest.fixture
def words(db):
    db.tables["words_v2"] = [
        dict(KUCA),
        {"id": 2, "headword": "kućanica", "definitions": [], "frequency": 0},
        {"id": 3, "headword": "A/a", "definitions": [], "frequency": 0},
    ]
    return db


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_get_by_headword_hides_note(client, words):
    r = client.get("/api/words/headword/kuća")
    assert r.status_code == 200
    assert r.json()["headword"] == "kuća"
    assert "note" not in r.json()


def test_get_by_headword_with_slash(client, words):
    assert client.get("/api/words/headword/A/a").json()["id"] == 3


def test_get_by_headword_missing(client, words):
    assert client.get("/api/words/headword/nema").status_code == 404


def test_search_pages_and_has_more(client, words):
    first = client.get("/api/words/search", params={"q": "kuć", "page_size": 1}).json()
    second = client.get("/api/words/search", params={"q": "kuć", "page": 2, "page_size": 1}).json()
    assert [w["headword"] for w in first["items"]] == ["kuća"]
    assert first["has_more"] is True
    assert [w["headword"] for w in second["items"]] == ["kućanica"]
    assert second["has_more"] is False


def test_get_by_id_requires_admin(client, words):
    assert client.get("/api/words/1").status_code == 401


def test_get_by_id_includes_note(admin, words):
    assert admin.get("/api/words/1").json()["note"] == "provjeriti"


def test_non_numeric_id_does_not_match_id_route(admin, words):
    assert admin.get("/api/words/kuća").status_code == 404


def test_create_word_sets_audit_columns(admin, db):
    r = admin.post("/api/words", json={"headword": "nova", "definitions": [definition()]})
    assert r.status_code == 201
    row = db.tables["words_v2"][0]
    assert row["created_by"] == row["updated_by"] == "editor@test"


def test_create_duplicate_headword(admin, words):
    r = admin.post("/api/words", json={"headword": "kuća", "definitions": [definition()]})
    assert r.status_code == 409


def test_definition_nullable_fields_are_required(admin, db):
    r = admin.post("/api/words", json={"headword": "x", "definitions": [{"definition": "y"}]})
    assert r.status_code == 422


def test_update_only_writes_sent_fields(admin, words):
    r = admin.patch("/api/words/1", json={"headword": "kuća", "definitions": [definition()]})
    assert r.status_code == 200
    row = words.tables["words_v2"][0]
    assert row["note"] == "provjeriti"  # not sent, so unchanged
    assert row["frequency"] == 10
    assert row["updated_by"] == "editor@test"


def test_update_missing_word(admin, words):
    r = admin.patch("/api/words/99", json={"headword": "x", "definitions": [definition()]})
    assert r.status_code == 404
