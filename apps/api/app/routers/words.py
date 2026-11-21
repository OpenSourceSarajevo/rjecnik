from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Body, HTTPException, Query
from postgrest.exceptions import APIError
from pydantic import BaseModel

from app.auth import Admin, AdminOnly
from app.db import RANGE_NOT_SATISFIABLE, AdminDb, Db
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


class WordSummary(BaseModel):
    id: int
    headword: str
    definitions: list[dict[str, Any]]


class SearchResults(BaseModel):
    items: list[WordSummary]
    has_more: bool


class WordDetail(Word):
    """Full row for the admin app, including the editor note and audit columns."""

    note: str | None = None
    # Set by a database trigger on every write (see docs/data-quality.md)
    quality: int | None = None
    quality_breakdown: dict[str, Any] | None = None
    created_by: str | None = None
    created_at: str | None = None
    updated_by: str | None = None
    updated_at: str | None = None


class DefinitionInput(BaseModel):
    # Nullable fields are still required keys, matching the admin app's form payload
    type: str | None
    gender: str | None
    examples: list[str] | None
    definition: str
    part_of_speech: str | None
    pronunciation_ipa: str | None
    pronunciation_audio: str | None
    synonyms: list[str] | None = None
    antonyms: list[str] | None = None


class WordFormInput(BaseModel):
    form: str
    name: str
    value: str
    category: str


class WordInput(BaseModel):
    headword: str
    definitions: list[DefinitionInput]
    forms: list[WordFormInput] | None = None
    alternatives: list[str] | None = None
    origins: list[str] | None = None
    synonyms: list[str] | None = None
    antonyms: list[str] | None = None
    frequency: int | None = None
    note: str | None = None


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


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
    db: Db,
    q: str = "",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> SearchResults:
    """Fuzzy search that ignores diacritics and tolerates typos; exact matches come first."""
    res = db.rpc(
        "search_words_ranked",
        # One extra row tells us whether another page exists
        {"search_term": q, "limit_value": page_size + 1, "offset_value": (page - 1) * page_size},
    ).execute()
    return SearchResults(
        items=[WordSummary(**row) for row in res.data[:page_size]],
        has_more=len(res.data) > page_size,
    )


# PostgREST caps a single select at 1000 rows
HEADWORDS_BATCH_SIZE = 1000


@router.get("/headwords")
def list_headwords(db: Db) -> list[str]:
    """Every headword, for the public sitemap."""
    headwords: list[str] = []
    while True:
        start = len(headwords)
        try:
            res = (
                db.table("words_v2")
                .select("headword")
                .order("id")
                .range(start, start + HEADWORDS_BATCH_SIZE - 1)
                .execute()
            )
        except APIError as e:
            # The previous batch ended exactly on the last row
            if e.code != RANGE_NOT_SATISFIABLE:
                raise
            return headwords
        headwords.extend(row["headword"] for row in res.data)
        if len(res.data) < HEADWORDS_BATCH_SIZE:
            return headwords


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


@router.post("", status_code=201)
def create_word(db: AdminDb, user: Admin, body: WordInput) -> WordDetail:
    now = now_iso()
    values = body.model_dump(exclude_unset=True)
    values |= {
        "created_by": user.email,
        "created_at": now,
        "updated_by": user.email,
        "updated_at": now,
    }
    res = db.table("words_v2").insert(values).execute()
    return WordDetail(**res.data[0])


@router.patch("/{word_id:int}")
def update_word(db: AdminDb, user: Admin, word_id: int, body: WordInput) -> WordDetail:
    # Only fields present in the request are written; omitted optional fields stay as they are
    values = body.model_dump(exclude_unset=True)
    values |= {"updated_by": user.email, "updated_at": now_iso()}
    res = db.table("words_v2").update(values).eq("id", word_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Riječ nije pronađena")
    return WordDetail(**res.data[0])


@router.post("/{word_id:int}/chat", dependencies=AdminOnly)
def chat_about_word(word_id: int, body: Annotated[dict[str, Any], Body()]) -> dict[str, Any]:
    """AI-assisted editing turn for a word (rate-limited, stored in ai_chat_requests)."""
    not_implemented()
