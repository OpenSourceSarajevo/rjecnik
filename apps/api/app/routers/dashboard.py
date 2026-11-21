from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import AwareDatetime, BaseModel

from app.auth import AdminOnly
from app.db import AdminDb

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=AdminOnly)


class Totals(BaseModel):
    words: int
    definitions: int
    forms: int


class TypeCount(BaseModel):
    type: str
    count: int


class DashboardStats(BaseModel):
    stats: Totals
    type_breakdown: list[TypeCount]


@router.get("/stats")
def get_stats(db: AdminDb) -> DashboardStats:
    """Word totals (words_dashboard_stats) and definition counts per type (words_by_type)."""
    totals = db.table("words_dashboard_stats").select("*").single().execute()
    by_type = db.table("words_by_type").select("*").execute()
    return DashboardStats(stats=totals.data, type_breakdown=by_type.data)


# Longest range the dashboard asks for (a custom range of about a year)
MAX_ACTIVITY_RANGE = timedelta(days=400)


class Activity(BaseModel):
    start: datetime
    end: datetime
    new_words: int
    # Distinct words with at least one edit in the range
    edited_words: int
    total_changes: int
    average_daily_changes: float


@router.get("/activity")
def get_activity(
    db: AdminDb, start: AwareDatetime | None = None, end: AwareDatetime | None = None
) -> Activity:
    """Words created and edited in [start, end); the last 24 hours by default."""
    end = end or datetime.now(UTC)
    start = start or end - timedelta(hours=24)
    if start >= end:
        raise HTTPException(status_code=422, detail="Početak mora biti prije kraja")
    if end - start > MAX_ACTIVITY_RANGE:
        raise HTTPException(status_code=422, detail="Raspon može biti najviše 400 dana")
    res = db.rpc(
        "word_activity_stats", {"start_at": start.isoformat(), "end_at": end.isoformat()}
    ).execute()
    return Activity(start=start, end=end, **res.data)
