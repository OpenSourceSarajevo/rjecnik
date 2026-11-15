from functools import lru_cache
from typing import Annotated

from fastapi import Depends
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
