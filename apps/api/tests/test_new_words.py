import pytest

FORM = {"form": "A sg", "name": "akuzativ", "value": "kuću", "category": "padež"}


@pytest.fixture
def tables(db):
    db.tables.update(
        {
            "words_new": [
                {"id": 1, "headword": "kuću", "count": 3, "examples": [], "is_new": True},
                {"id": 2, "headword": "kuća", "count": 2, "examples": [], "is_new": True},
            ],
            "words_v2": [
                {
                    "id": 50,
                    "headword": "kuća",
                    "frequency": 10,
                    "definitions": [{"definition": "zgrada"}],
                    "forms": [],
                }
            ],
            "words_ignore": [],
        }
    )
    return db


def kuca(db):
    return next(w for w in db.tables["words_v2"] if w["headword"] == "kuća")


def remaining(db):
    return [w["id"] for w in db.tables["words_new"]]


def test_requires_admin(client, tables):
    assert client.post("/api/words/new/1/ignore").status_code == 401


def test_list_filters_unassigned(admin, tables):
    tables.tables["words_new"][0]["strategy"] = "Ignore"
    body = admin.get("/api/words/new", params={"strategy": "none"}).json()
    assert [w["id"] for w in body["items"]] == [2]


def test_assign_and_clear_strategy(admin, tables):
    r = admin.patch("/api/words/new/1/strategy/New%20Form")
    assert (r.json()["strategy"], r.json()["assigned_to"]) == ("New Form", "editor@test")
    r = admin.patch("/api/words/new/1/strategy/null")
    assert (r.json()["strategy"], r.json()["assigned_to"]) == (None, None)


def test_assign_unknown_strategy(admin, tables):
    assert admin.patch("/api/words/new/1/strategy/Bogus").status_code == 422


def test_mine_lists_only_my_words(admin, tables):
    tables.tables["words_new"][1]["assigned_to"] = "editor@test"
    assert [w["id"] for w in admin.get("/api/words/new/mine").json()] == [2]


def test_frequency_only(admin, tables):
    assert admin.post("/api/words/new/2/frequency-only").status_code == 200
    assert kuca(tables)["frequency"] == 12
    assert remaining(tables) == [1]


def test_frequency_only_unknown_headword(admin, tables):
    assert admin.post("/api/words/new/1/frequency-only").status_code == 404
    assert remaining(tables) == [1, 2]


def test_existing_form(admin, tables):
    assert (
        admin.post("/api/words/new/1/existing-form", json={"headword": "kuća"}).status_code == 200
    )
    assert kuca(tables)["frequency"] == 13
    assert remaining(tables) == [2]


def test_new_form(admin, tables):
    r = admin.post("/api/words/new/1/new-form", json={"headword": "kuća", "forms": [FORM]})
    assert r.status_code == 200
    assert kuca(tables)["forms"] == [FORM]
    assert kuca(tables)["updated_by"] == "editor@test"


def test_new_form_requires_forms(admin, tables):
    r = admin.post("/api/words/new/1/new-form", json={"headword": "kuća", "forms": []})
    assert r.status_code == 422
    assert remaining(tables) == [1, 2]


@pytest.mark.parametrize("update_frequency, expected", [(True, 13), (False, 10)])
def test_new_definition(admin, tables, update_frequency, expected):
    body = {
        "headword": "kuća",
        "definition": {"definition": "dom", "examples": ["x"]},
        "updateFrequency": update_frequency,
    }
    assert admin.post("/api/words/new/1/new-definition", json=body).status_code == 200
    assert [d["definition"] for d in kuca(tables)["definitions"]] == ["zgrada", "dom"]
    assert kuca(tables)["frequency"] == expected


def test_new_definition_rejects_blank(admin, tables):
    body = {"headword": "kuća", "definition": {"definition": "  "}}
    assert admin.post("/api/words/new/1/new-definition", json=body).status_code == 422


def test_new_headword(admin, tables):
    r = admin.post("/api/words/new/1/new-headword", json={"definitions": [{"definition": "oblik"}]})
    assert r.status_code == 201
    assert (r.json()["headword"], r.json()["frequency"]) == ("kuću", 3)
    assert remaining(tables) == [2]


@pytest.mark.parametrize("body, expected_type", [({"type": "ime"}, "ime"), (None, "ostalo")])
def test_ignore(admin, tables, body, expected_type):
    assert admin.post("/api/words/new/1/ignore", json=body).status_code == 204
    assert tables.tables["words_ignore"][0]["type"] == expected_type
    assert remaining(tables) == [2]


def test_ignore_updates_existing_entry(admin, tables):
    tables.tables["words_ignore"].append({"id": 9, "headword": "kuću", "type": "ostalo"})
    admin.post("/api/words/new/1/ignore", json={"type": "ime"})
    assert [(w["headword"], w["type"]) for w in tables.tables["words_ignore"]] == [("kuću", "ime")]


def test_remove(admin, tables):
    assert admin.delete("/api/words/new/1").status_code == 204
    assert admin.delete("/api/words/new/1").status_code == 404
