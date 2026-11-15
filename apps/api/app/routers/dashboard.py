from fastapi import APIRouter
from pydantic import BaseModel

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
