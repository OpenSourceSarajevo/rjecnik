from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import dashboard, health, ignored_words, new_words, words

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

ROUTERS = (health, words, dashboard, ignored_words, new_words)

for module in ROUTERS:
    app.include_router(module.router, prefix="/api")
