"""Word data quality: scores, previews and quality-based word lists (read-only).

The rules live in the quality_rules table and are changed through migrations; the scoring
itself is done in Postgres (score_word, see docs/data-quality.md).
"""

from typing import Annotated, Any, Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.auth import AdminOnly
from app.db import AdminDb, fetch_page

router = APIRouter(prefix="/quality", tags=["quality"], dependencies=AdminOnly)

Level = Literal["green", "yellow", "red"]


class Distribution(BaseModel):
    green: int
    yellow: int
    red: int
    unscored: int = 0
    total: int


class RuleResult(BaseModel):
    key: str
    label: str
    word_type: str | None
    points: float
    earned: float
    passed: int
    total: int
    not_applicable: int


class QualityBreakdown(BaseModel):
    score: int
    level: Level
    earned: float
    possible: float
    untyped: bool
    rules: list[RuleResult]


class WordToScore(BaseModel):
    """An unsaved word, as the editor holds it."""

    definitions: list[dict[str, Any]]
    forms: list[dict[str, Any]] | None = None
    origins: list[str] | None = None
    alternatives: list[str] | None = None


class QualityWord(BaseModel):
    id: int
    headword: str
    definitions: list[dict[str, Any]]
    quality: int | None
    level: Level | None


class QualityWordPage(BaseModel):
    items: list[QualityWord]
    total: int


class WordScore(BaseModel):
    id: int
    quality: int | None
    level: Level | None


def get_thresholds(db: AdminDb) -> tuple[int, int]:
    """(green, yellow) score thresholds from the settings."""
    row = (
        db.table("quality_settings")
        .select("green_threshold, yellow_threshold")
        .single()
        .execute()
        .data
    )
    return row["green_threshold"], row["yellow_threshold"]


def level_of(quality: int | None, thresholds: tuple[int, int]) -> Level | None:
    if quality is None:
        return None
    green, yellow = thresholds
    return "green" if quality >= green else "yellow" if quality >= yellow else "red"


@router.get("/distribution")
def get_distribution(db: AdminDb) -> Distribution:
    """Number of green, yellow, red and not yet scored words."""
    return Distribution(**db.rpc("quality_distribution", {}).execute().data)


@router.post("/preview")
def preview(db: AdminDb, body: WordToScore) -> QualityBreakdown:
    """Score a word the editor has not saved yet."""
    res = db.rpc("word_quality", {"word": body.model_dump(mode="json")}).execute()
    return QualityBreakdown(**res.data)


@router.get("/words")
def list_words_by_quality(
    db: AdminDb,
    level: Level | None = None,
    q: str = "",
    order: Literal["asc", "desc"] = "asc",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> QualityWordPage:
    """Scored words, lowest quality first by default, optionally only one colour."""
    green, yellow = thresholds = get_thresholds(db)

    def build():
        query = (
            db.table("words_v2")
            .select("id, headword, definitions, quality", count="exact")
            .not_.is_("quality", "null")
        )
        if level == "green":
            query = query.gte("quality", green)
        elif level == "yellow":
            query = query.gte("quality", yellow).lt("quality", green)
        elif level == "red":
            query = query.lt("quality", yellow)
        if q.strip():
            query = query.ilike("headword", f"%{q.strip()}%")
        return query.order("quality", desc=order == "desc").order("headword")

    rows, total = fetch_page(build, page, page_size)
    items = [QualityWord(**row, level=level_of(row["quality"], thresholds)) for row in rows]
    return QualityWordPage(items=items, total=total)


@router.get("/scores")
def get_scores(db: AdminDb, ids: str) -> list[WordScore]:
    """Scores for a page of words, e.g. search results. `ids` is comma-separated."""
    try:
        id_list = [int(i) for i in ids.split(",") if i.strip()]
    except ValueError as e:
        raise HTTPException(status_code=422, detail="Neispravan popis id-eva") from e
    if not id_list:
        return []
    if len(id_list) > 100:
        raise HTTPException(status_code=422, detail="Najviše 100 id-eva")
    thresholds = get_thresholds(db)
    res = db.table("words_v2").select("id, quality").in_("id", id_list).execute()
    return [
        WordScore(id=row["id"], quality=row["quality"], level=level_of(row["quality"], thresholds))
        for row in res.data
    ]
