from typing import Annotated, Any

from fastapi import APIRouter, Body, Query

from app.auth import AdminOnly
from app.stubs import not_implemented

router = APIRouter(prefix="/words/new", tags=["new-words"], dependencies=AdminOnly)


@router.get("")
def list_new_words(
    headword: str | None = None,
    strategy: str | None = None,
    is_new: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, Any]:
    """Paginated words_new with filters."""
    not_implemented()


@router.get("/mine")
def list_my_new_words() -> list[dict[str, Any]]:
    """words_new assigned to the current user."""
    not_implemented()


@router.patch("/{new_word_id}/strategy/{strategy}")
def assign_strategy(new_word_id: int, strategy: str) -> dict[str, Any]:
    """Assign a strategy to the current user; strategy "null" clears the assignment."""
    not_implemented()


@router.post("/{new_word_id}/strategy/{strategy}")
def apply_strategy(
    new_word_id: int, strategy: str, body: Annotated[dict[str, Any] | None, Body()] = None
) -> dict[str, Any]:
    """Run the strategy (e.g. merge into words_v2) for this new word."""
    not_implemented()
