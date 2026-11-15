from typing import Annotated, Any

from fastapi import APIRouter, Body, HTTPException, Query
from pydantic import BaseModel

from app.auth import AdminOnly
from app.db import AdminDb, Db
from app.stubs import not_implemented

router = APIRouter(prefix="/words", tags=["words"])

WORD_COLUMNS = (
    "id, headword, origins, definitions, forms, alternatives, synonyms, antonyms, frequency"
)


class Word(BaseModel):
    id: int
    headword: str
    origins: list[str] | None = None
    definitions: list[dict[str, Any]]
    forms: dict[str, Any] | list[Any] | None = None
    alternatives: list[str] | None = None
    synonyms: list[str] | None = None
    antonyms: list[str] | None = None
    frequency: int | None = None


class WordDetail(Word):
    """Full row for the admin app, including the editor note and audit columns."""

    note: str | None = None
    created_by: str | None = None
    created_at: str | None = None
    updated_by: str | None = None
    updated_at: str | None = None


class WordPage(BaseModel):
    items: list[Word]
    limit: int
    offset: int


@router.get("")
def list_words(
    db: Db,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> WordPage:
    res = (
        db.table("words_v2")
        .select(WORD_COLUMNS)
        .order("headword")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return WordPage(items=res.data, limit=limit, offset=offset)


# Fixed paths must come before /{word_id}, otherwise they're matched as an id.
@router.get("/search")
def search_words(
    q: str = "",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, Any]:
    """Ranked search via the search_words_ranked RPC."""
    not_implemented()


# :path so headwords containing "/" (e.g. "A/a") still match
@router.get("/headword/{headword:path}")
def get_word_by_headword(db: Db, headword: str) -> Word:
    res = db.table("words_v2").select(WORD_COLUMNS).eq("headword", headword).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Riječ nije pronađena")
    return Word(**res.data[0])


@router.get("/{word_id:int}", dependencies=AdminOnly)
def get_word(db: AdminDb, word_id: int) -> WordDetail:
    res = db.table("words_v2").select("*").eq("id", word_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Riječ nije pronađena")
    return WordDetail(**res.data[0])


@router.post("", status_code=201, dependencies=AdminOnly)
def create_word(body: Annotated[dict[str, Any], Body()]) -> Word:
    not_implemented()


@router.patch("/{word_id:int}", dependencies=AdminOnly)
def update_word(word_id: int, body: Annotated[dict[str, Any], Body()]) -> Word:
    not_implemented()


@router.post("/{word_id:int}/chat", dependencies=AdminOnly)
def chat_about_word(word_id: int, body: Annotated[dict[str, Any], Body()]) -> dict[str, Any]:
    """AI-assisted editing turn for a word (rate-limited, stored in ai_chat_requests)."""
    not_implemented()
