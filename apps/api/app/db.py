from collections.abc import Callable
from functools import lru_cache
from typing import Annotated, Any

from fastapi import Depends
from postgrest.exceptions import APIError
from supabase import Client, ClientOptions, create_client

from app.auth import User, require_admin
from app.config import get_settings


@lru_cache
def get_db() -> Client:
    """Shared anon client for public reads."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_admin_db(user: Annotated[User, Depends(require_admin)]) -> Client:
    """Per-request client acting as the signed-in admin, so RLS and audit columns apply.

    Never use the service-role key here.
    """
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
        options=ClientOptions(
            headers={"Authorization": f"Bearer {user.token}"},
            auto_refresh_token=False,
            persist_session=False,
        ),
    )


Db = Annotated[Client, Depends(get_db)]
AdminDb = Annotated[Client, Depends(get_admin_db)]


RANGE_NOT_SATISFIABLE = "PGRST103"


def fetch_page(build: Callable[[], Any], page: int, page_size: int) -> tuple[list[Any], int]:
    """Run one page of a query built with count="exact"; returns (rows, total).

    `build` must return a fresh query each call. A page past the end makes PostgREST
    refuse the range, so the total is then fetched with a one-row query instead.
    """
    start = (page - 1) * page_size
    try:
        res = build().range(start, start + page_size - 1).execute()
    except APIError as e:
        if e.code != RANGE_NOT_SATISFIABLE:
            raise
        return [], build().limit(1).execute().count or 0
    return res.data, res.count or 0
