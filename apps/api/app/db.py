from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def get_db() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)
