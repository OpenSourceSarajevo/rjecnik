from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, StringConstraints

from app.auth import AdminOnly
from app.db import AdminDb, fetch_page
from app.routers.words import now_iso

router = APIRouter(prefix="/words/ignored", tags=["ignored-words"], dependencies=AdminOnly)

IgnoreType = Literal["ostalo", "ime", "strana_riječ", "skraćenica"]


class IgnoredWord(BaseModel):
    id: int
    headword: str
    # Plain str when reading: a few legacy rows still hold English types (e.g. "foreign")
    type: str
    inserted_at: str | None = None
    updated_at: str | None = None


class BulkIgnore(BaseModel):
    headwords: list[Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]] = Field(
        min_length=1
    )
    type: IgnoreType


class IgnoreUpdate(BaseModel):
    type: IgnoreType


class BulkIgnoreResult(BaseModel):
    items: list[IgnoredWord]
    count: int


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

    def build():
        query = (
            db.table("words_ignore")
            .select("*", count="exact")
            .order("inserted_at", desc=True)
            .order("id", desc=True)  # stable paging when rows share inserted_at (bulk imports)
        )
        return query.ilike("headword", f"%{q}%") if q else query

    items, total = fetch_page(build, page, page_size)
    return IgnoredWordPage(items=items, total=total)


@router.post("", status_code=201)
def bulk_add_ignored_words(db: AdminDb, body: BulkIgnore) -> BulkIgnoreResult:
    """Add headwords to the ignore list, or change their type if they are already on it."""
    now = now_iso()
    rows = [
        {"headword": h, "type": body.type, "updated_at": now}
        for h in dict.fromkeys(body.headwords)  # dedupe, keep order
    ]
    res = db.table("words_ignore").upsert(rows, on_conflict="headword").execute()
    return BulkIgnoreResult(items=res.data, count=len(res.data))


@router.patch("/{ignored_id}")
def update_ignored_word(db: AdminDb, ignored_id: int, body: IgnoreUpdate) -> IgnoredWord:
    res = (
        db.table("words_ignore")
        .update({"type": body.type, "updated_at": now_iso()})
        .eq("id", ignored_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Riječ nije pronađena")
    return IgnoredWord(**res.data[0])


@router.delete("/{ignored_id}", status_code=204)
def delete_ignored_word(db: AdminDb, ignored_id: int) -> None:
    res = db.table("words_ignore").delete().eq("id", ignored_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Riječ nije pronađena")
