import pytest

DISTRIBUTION = {"green": 1, "yellow": 1, "red": 1, "unscored": 1, "total": 4}


@pytest.fixture
def quality_db(db):
    db.tables["quality_settings"] = [{"id": True, "green_threshold": 100, "yellow_threshold": 50}]
    db.tables["words_v2"] = [
        {"id": 1, "headword": "kuća", "definitions": [], "quality": 100},
        {"id": 2, "headword": "kuhati", "definitions": [], "quality": 60},
        {"id": 3, "headword": "a", "definitions": [], "quality": 20},
        {"id": 4, "headword": "novo", "definitions": [], "quality": None},
    ]
    db.rpc_handlers["quality_distribution"] = lambda _: DISTRIBUTION
    return db


def calls(db, name):
    return [p for n, p in db.rpc_calls if n == name]


def test_requires_admin(client, quality_db):
    assert client.get("/api/quality/distribution").status_code == 401


def test_rules_cannot_be_edited(admin, quality_db):
    assert admin.put("/api/quality/config", json={}).status_code in (404, 405)
    assert admin.post("/api/quality/dry-run", json={}).status_code == 404


def test_distribution(admin, quality_db):
    assert admin.get("/api/quality/distribution").json() == DISTRIBUTION


def test_preview_scores_unsaved_word(admin, quality_db):
    breakdown = {
        "score": 40,
        "level": "red",
        "earned": 40,
        "possible": 100,
        "untyped": True,
        "rules": [
            {
                "key": "definition",
                "label": "Značenje",
                "word_type": None,
                "points": 40,
                "earned": 40,
                "passed": 1,
                "total": 1,
                "not_applicable": 0,
            }
        ],
    }
    quality_db.rpc_handlers["word_quality"] = lambda _: breakdown
    word = {"definitions": [{"definition": "zgrada"}], "forms": []}
    body = admin.post("/api/quality/preview", json=word).json()
    assert body["score"] == 40
    assert calls(quality_db, "word_quality")[0]["word"]["definitions"] == word["definitions"]


@pytest.mark.parametrize(
    ("level", "expected"), [("green", [1]), ("yellow", [2]), ("red", [3]), (None, [3, 2, 1])]
)
def test_words_by_level(admin, quality_db, level, expected):
    body = admin.get("/api/quality/words", params={"level": level} if level else {}).json()
    assert [w["id"] for w in body["items"]] == expected
    assert body["total"] == len(expected)
    if level:
        assert {w["level"] for w in body["items"]} == {level}


def test_words_highest_first(admin, quality_db):
    body = admin.get("/api/quality/words", params={"order": "desc"}).json()
    assert [w["id"] for w in body["items"]] == [1, 2, 3]


def test_scores(admin, quality_db):
    body = admin.get("/api/quality/scores", params={"ids": "1,4,99"}).json()
    assert body == [
        {"id": 1, "quality": 100, "level": "green"},
        {"id": 4, "quality": None, "level": None},
    ]


@pytest.mark.parametrize("ids", ["1,x", ",".join(str(i) for i in range(101))])
def test_scores_validation(admin, quality_db, ids):
    assert admin.get("/api/quality/scores", params={"ids": ids}).status_code == 422


def test_word_detail_includes_quality(admin, db):
    db.tables["words_v2"] = [
        {"id": 1, "headword": "kuća", "definitions": [], "quality": 95, "quality_breakdown": {}}
    ]
    assert admin.get("/api/words/1").json()["quality"] == 95
