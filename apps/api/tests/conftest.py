import copy
import os
import time
from collections.abc import Callable
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec

# Settings are required at import time; tests never talk to Supabase.
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")

from fastapi.testclient import TestClient  # noqa: E402
from postgrest.exceptions import APIError  # noqa: E402

from app import auth  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.db import get_admin_db, get_db  # noqa: E402
from app.main import app  # noqa: E402

ADMIN = auth.User(id="u1", email="editor@test", permission=auth.ADMIN_PERMISSION, token="t")


class _Result:
    def __init__(self, data: list[dict[str, Any]], count: int | None = None):
        self.data = data
        self.count = count


class FakeQuery:
    """In-memory stand-in for the postgrest query builder (the subset the API uses)."""

    def __init__(self, db: "FakeDb", table: str):
        self.db, self.table = db, table
        self.op, self.values, self.on_conflict = "select", None, None
        self.filters: list[Any] = []
        self.orders: list[tuple[str, bool]] = []
        self.window: tuple[int, int] | None = None
        self.count = False
        self.one = False
        self.negate_next = False

    # filters / modifiers
    def select(self, *_: Any, count: str | None = None, **__: Any) -> "FakeQuery":
        self.count = count == "exact"
        return self

    def eq(self, col: str, val: Any) -> "FakeQuery":
        self.filters.append(lambda r: r.get(col) == val)
        return self

    @property
    def not_(self) -> "FakeQuery":
        self.negate_next = True
        return self

    def is_(self, col: str, val: str) -> "FakeQuery":
        negate, self.negate_next = self.negate_next, False
        self.filters.append(lambda r: (r.get(col) is None) != negate)
        return self

    def gte(self, col: str, val: Any) -> "FakeQuery":
        self.filters.append(lambda r: r.get(col) is not None and r[col] >= val)
        return self

    def lt(self, col: str, val: Any) -> "FakeQuery":
        self.filters.append(lambda r: r.get(col) is not None and r[col] < val)
        return self

    def in_(self, col: str, values: list[Any]) -> "FakeQuery":
        self.filters.append(lambda r: r.get(col) in values)
        return self

    def ilike(self, col: str, pattern: str) -> "FakeQuery":
        needle = pattern.strip("%").lower()
        self.filters.append(lambda r: needle in str(r.get(col, "")).lower())
        return self

    def order(self, col: str, desc: bool = False) -> "FakeQuery":
        self.orders.append((col, desc))
        return self

    def range(self, start: int, end: int) -> "FakeQuery":
        self.window = (start, end)
        return self

    def single(self) -> "FakeQuery":
        self.one = True
        return self

    def limit(self, n: int) -> "FakeQuery":
        self.window = (0, n - 1)
        return self

    # writes
    def update(self, values: dict) -> "FakeQuery":
        self.op, self.values = "update", values
        return self

    def insert(self, values: dict) -> "FakeQuery":
        self.op, self.values = "insert", values
        return self

    def upsert(self, values: dict | list, on_conflict: str) -> "FakeQuery":
        self.op, self.values, self.on_conflict = "upsert", values, on_conflict
        return self

    def delete(self) -> "FakeQuery":
        self.op = "delete"
        return self

    def execute(self) -> _Result:
        rows = self.db.tables.setdefault(self.table, [])
        matched = [r for r in rows if all(f(r) for f in self.filters)]

        if self.op == "select":
            for col, desc in reversed(self.orders):
                matched.sort(key=lambda r: (r.get(col) is None, r.get(col)), reverse=desc)
            total = len(matched)
            if self.window:
                start, end = self.window
                if start > 0 and start >= total:
                    raise APIError(
                        {"code": "PGRST103", "message": "Requested range not satisfiable"}
                    )
                matched = matched[start : end + 1]
            if self.one:
                return _Result(copy.deepcopy(matched[0]))  # type: ignore[arg-type]
            return _Result(copy.deepcopy(matched), total if self.count else None)

        if self.op == "update":
            for r in matched:
                r.update(self.values)
            return _Result(copy.deepcopy(matched))

        if self.op == "delete":
            self.db.tables[self.table] = [r for r in rows if r not in matched]
            return _Result(matched)

        new_rows = self.values if isinstance(self.values, list) else [self.values]
        out = []
        for values in new_rows:
            existing = (
                [r for r in rows if r.get(self.on_conflict) == values[self.on_conflict]]
                if self.op == "upsert"
                else []
            )
            if existing:
                existing[0].update(values)
                out.append(existing[0])
            else:
                if any(r.get("headword") == values.get("headword") for r in rows):
                    raise APIError({"code": "23505", "message": "duplicate key"})
                row = {"id": self.db.next_id(), **values}
                rows.append(row)
                out.append(row)
        return _Result(copy.deepcopy(out))


class FakeDb:
    def __init__(self, tables: dict[str, list[dict]] | None = None):
        self.tables = copy.deepcopy(tables or {})
        self._id = 1000
        self.rpc_calls: list[tuple[str, dict]] = []
        # Database functions other than search, by name: params -> returned data
        self.rpc_handlers: dict[str, Callable[[dict], Any]] = {}

    def next_id(self) -> int:
        self._id += 1
        return self._id

    def table(self, name: str) -> FakeQuery:
        return FakeQuery(self, name)

    def rpc(self, name: str, params: dict) -> Any:
        self.rpc_calls.append((name, params))
        if name in self.rpc_handlers:
            data = self.rpc_handlers[name](params)
            return type("Rpc", (), {"execute": lambda _: _Result(copy.deepcopy(data))})()
        q = FakeQuery(self, "words_v2")
        start = params["offset_value"]
        q.window = (start, start + params["limit_value"] - 1)
        q.order("headword")
        if params["search_term"]:
            q.ilike("headword", f"%{params['search_term']}%")
        return q


@pytest.fixture
def db() -> FakeDb:
    return FakeDb()


@pytest.fixture
def client(db: FakeDb):
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_admin_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def admin(client: TestClient) -> TestClient:
    """Client whose requests are treated as coming from a signed-in admin."""
    app.dependency_overrides[auth.require_admin] = lambda: ADMIN
    return client


# --- Tokens -----------------------------------------------------------------

SIGNING_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())
KID = "test-key"


class FakeJwks:
    def get_signing_key_from_jwt(self, token: str):
        if jwt.get_unverified_header(token).get("kid") != KID:
            raise jwt.PyJWKClientError("unknown kid")
        return type("Key", (), {"key": SIGNING_KEY.public_key()})()


@pytest.fixture
def jwks(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(auth, "get_jwks_client", lambda: FakeJwks())


def make_token(key: Any = None, alg: str = "ES256", **overrides: Any) -> str:
    now = int(time.time())
    claims = {
        "sub": "u1",
        "email": "editor@test",
        "aud": "authenticated",
        "iss": f"{get_settings().supabase_url}/auth/v1",
        "iat": now,
        "exp": now + 600,
        "user_permission": auth.ADMIN_PERMISSION,
        **overrides,
    }
    claims = {k: v for k, v in claims.items() if v is not None}
    return jwt.encode(claims, key or SIGNING_KEY, algorithm=alg, headers={"kid": KID})
