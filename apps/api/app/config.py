from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Rječnik API"
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:3000"]

    supabase_url: str
    supabase_anon_key: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
