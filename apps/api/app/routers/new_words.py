from typing import Annotated, Any, Literal

from fastapi import APIRouter, Body, HTTPException, Query
from pydantic import BaseModel

from app.auth import Admin, AdminOnly
from app.db import AdminDb, fetch_page
from app.stubs import not_implemented

router = APIRouter(prefix="/words/new", tags=["new-words"], dependencies=AdminOnly)

Strategy = Literal[
    "Frequency Only",
    "New Definition",
    "New Form",
    "Existing Form",
    "New Headword",
    "Ignore",
    "Remove",
]


class NewWord(BaseModel):
    id: int
    headword: str
    examples: list[str]
    count: int
    is_new: bool
    created_at: str | None = None
    created_by: str | None = None
    assigned_to: str | None = None
    strategy: str | None = None


class NewWordPage(BaseModel):
    items: list[NewWord]
    total: int


@router.get("")
def list_new_words(
    db: AdminDb,
    headword: str | None = None,
    strategy: Annotated[
        str | None, Query(description='A strategy name, or "none" for unassigned words')
    ] = None,
    is_new: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> NewWordPage:
    """Newest first, then alphabetical."""

    def build():
        query = (
            db.table("words_new")
            .select("*", count="exact")
            .order("created_at", desc=True)
            .order("headword")
            .order("id")  # stable paging
        )
        if headword:
            query = query.ilike("headword", f"%{headword}%")
        if strategy == "none":
            query = query.is_("strategy", "null")
        elif strategy:
            query = query.eq("strategy", strategy)
        if is_new is not None:
            query = query.eq("is_new", is_new)
        return query

    items, total = fetch_page(build, page, page_size)
    return NewWordPage(items=items, total=total)


@router.get("/mine")
def list_my_new_words(db: AdminDb, user: Admin) -> list[NewWord]:
    """New words assigned to the signed-in editor, newest first."""
    res = (
        db.table("words_new")
        .select("*")
        .eq("assigned_to", user.email)
        .order("created_at", desc=True)
        .order("headword")
        .order("id")
        .execute()
    )
    return [NewWord(**row) for row in res.data]


@router.patch("/{new_word_id}/strategy/{strategy}")
def assign_strategy(
    db: AdminDb, user: Admin, new_word_id: int, strategy: Strategy | Literal["null"]
) -> NewWord:
    """Assign a strategy to the signed-in editor; "null" clears the strategy and assignee."""
    values = (
        {"strategy": None, "assigned_to": None}
        if strategy == "null"
        else {"strategy": strategy, "assigned_to": user.email}
    )
    res = db.table("words_new").update(values).eq("id", new_word_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Riječ nije pronađena")
    return NewWord(**res.data[0])


@router.post("/{new_word_id}/strategy/{strategy}")
def apply_strategy(
    new_word_id: int, strategy: str, body: Annotated[dict[str, Any] | None, Body()] = None
) -> dict[str, Any]:
    """Run the strategy (e.g. merge into words_v2) for this new word."""
    not_implemented()
