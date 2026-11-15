import time

import pytest
from fastapi.testclient import TestClient

from tests.conftest import OTHER_KEY, make_token

PROTECTED = "/api/dashboard/stats"


@pytest.fixture
def stats_db(db):
    db.tables["words_dashboard_stats"] = [{"words": 1, "definitions": 2, "forms": 3}]
    db.tables["words_by_type"] = [{"type": "imenica", "count": 2}]
    return db


def get(client: TestClient, token: str | None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return client.get(PROTECTED, headers=headers)


def test_valid_admin_token_is_accepted(client, jwks, stats_db):
    r = get(client, make_token())
    assert r.status_code == 200
    assert r.json()["stats"] == {"words": 1, "definitions": 2, "forms": 3}


def test_missing_token(client, jwks):
    assert get(client, None).status_code == 401


@pytest.mark.parametrize("permission", [None, "Dictionary.Read"])
def test_token_without_admin_permission(client, jwks, permission):
    assert get(client, make_token(user_permission=permission)).status_code == 403


@pytest.mark.parametrize(
    "token",
    [
        make_token(exp=int(time.time()) - 10),
        make_token(aud="anon"),
        make_token(iss="https://evil.example/auth/v1"),
        make_token(sub=None),
        make_token(key=OTHER_KEY),
        make_token(key="legacy-shared-secret-at-least-32-bytes", alg="HS256"),
        "not.a.jwt",
    ],
    ids=["expired", "audience", "issuer", "no-sub", "other-key", "hs256", "garbage"],
)
def test_invalid_tokens(client, jwks, token):
    assert get(client, token).status_code == 401


def test_public_routes_ignore_tokens(client):
    r = client.get("/api/health", headers={"Authorization": "Bearer junk"})
    assert r.status_code == 200
