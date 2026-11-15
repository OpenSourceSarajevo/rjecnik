from typing import Annotated, Any, Literal

from fastapi import APIRouter, Body, Query
from postgrest.exceptions import APIError
from pydantic import BaseModel

from app.auth import AdminOnly
from app.db import AdminDb
from app.stubs import not_implemented

router = APIRouter(prefix="/words/ignored", tags=["ignored-words"], dependencies=AdminOnly)

RANGE_NOT_SATISFIABLE = "PGRST103"

IgnoreType = Literal["ostalo", "ime", "strana_riječ", "skraćenica"]


class IgnoredWord(BaseModel):
    id: int
    headword: str
    # Plain str when reading: a few legacy rows still hold English types (e.g. "foreign")
    type: str
    inserted_at: str | None = None
    updated_at: str | None = None


class IgnoredWordPage(BaseModel):
    items: list[IgnoredWord]
    total: int


@router.get("")
def list_ignored_words(
    db: AdminDb,
    q: str = "",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> IgnoredWordPage:
    """Newest first, optionally filtered by a headword substring."""
    query = (
        db.table("words_ignore")
        .select("*", count="exact")
        .order("inserted_at", desc=True)
        .order("id", desc=True)  # stable paging when rows share inserted_at (bulk imports)
    )
    if q:
        query = query.ilike("headword", f"%{q}%")
    start = (page - 1) * page_size
    try:
        res = query.range(start, start + page_size - 1).execute()
    except APIError as e:
        if e.code != RANGE_NOT_SATISFIABLE:
            raise
        # Page past the end: PostgREST refuses the range, so count separately
        count = db.table("words_ignore").select("id", count="exact", head=True)
        if q:
            count = count.ilike("headword", f"%{q}%")
        return IgnoredWordPage(items=[], total=count.execute().count or 0)
    return IgnoredWordPage(items=res.data, total=res.count or 0)


@router.post("")
def bulk_add_ignored_words(body: Annotated[dict[str, Any], Body()]) -> list[dict[str, Any]]:
    """Upsert many headwords with one ignore type: {headwords: [...], type}."""
    not_implemented()


@router.patch("/{ignored_id}")
def update_ignored_word(ignored_id: int, body: Annotated[dict[str, Any], Body()]) -> dict[str, Any]:
    """Change the ignore type: {type}."""
    not_implemented()


@router.delete("/{ignored_id}")
def delete_ignored_word(ignored_id: int) -> dict[str, Any]:
    not_implemented()
