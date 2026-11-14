from typing import Annotated, Any

from fastapi import APIRouter, Body, Query

from app.auth import AdminOnly
from app.stubs import not_implemented

router = APIRouter(prefix="/words/ignored", tags=["ignored-words"], dependencies=AdminOnly)


@router.get("")
def list_ignored_words(
    q: str = "",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, Any]:
    """Paginated words_ignore, filtered by headword."""
    not_implemented()


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
