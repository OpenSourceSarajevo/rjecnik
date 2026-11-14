from typing import Any

from fastapi import APIRouter

from app.auth import AdminOnly
from app.stubs import not_implemented

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=AdminOnly)


@router.get("/stats")
def get_stats() -> dict[str, Any]:
    """Word totals (words_dashboard_stats) and counts per type (words_by_type)."""
    not_implemented()
