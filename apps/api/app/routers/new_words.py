from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app import strategies
from app.auth import Admin, AdminOnly
from app.db import AdminDb, fetch_page
from app.routers.words import WordDetail

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


# One endpoint per strategy. Each applies the change, then removes the word from words_new
# and returns the dictionary word it created or updated.


def get_new_word(db: AdminDb, new_word_id: int) -> dict[str, Any]:
    return strategies.load_new_word(db, new_word_id)


NewWordRow = Annotated[dict[str, Any], Depends(get_new_word)]


def _processed(db: AdminDb, new_word: dict[str, Any], word: dict[str, Any]) -> WordDetail:
    strategies.delete_new_word(db, new_word["id"])
    return WordDetail(**word)


@router.post("/{new_word_id}/frequency-only")
def apply_frequency_only(db: AdminDb, user: Admin, new_word: NewWordRow) -> WordDetail:
    """Already in the dictionary under the same headword: add its count to the frequency."""
    return _processed(db, new_word, strategies.frequency_only(db, user, new_word))


@router.post("/{new_word_id}/existing-form")
def apply_existing_form(
    db: AdminDb, user: Admin, new_word: NewWordRow, body: strategies.HeadwordBody
) -> WordDetail:
    """A known form of another headword: add its count to that headword."""
    return _processed(db, new_word, strategies.existing_form(db, user, new_word, body))


@router.post("/{new_word_id}/new-form")
def apply_new_form(
    db: AdminDb, user: Admin, new_word: NewWordRow, body: strategies.NewFormBody
) -> WordDetail:
    """A new form of another headword: save that headword's complete form list."""
    return _processed(db, new_word, strategies.new_form(db, user, new_word, body))


@router.post("/{new_word_id}/new-definition")
def apply_new_definition(
    db: AdminDb, user: Admin, new_word: NewWordRow, body: strategies.NewDefinitionBody
) -> WordDetail:
    """A new meaning of an existing headword: append a definition."""
    return _processed(db, new_word, strategies.new_definition(db, user, new_word, body))


@router.post("/{new_word_id}/new-headword", status_code=201)
def apply_new_headword(
    db: AdminDb, user: Admin, new_word: NewWordRow, body: strategies.NewHeadwordBody
) -> WordDetail:
    """Not in the dictionary yet: add it as a new headword."""
    return _processed(db, new_word, strategies.new_headword(db, user, new_word, body))


@router.post("/{new_word_id}/ignore", status_code=204)
def apply_ignore(
    db: AdminDb, new_word: NewWordRow, body: strategies.IgnoreBody | None = None
) -> None:
    """Add it to the ignore list so it is skipped in future ingestions."""
    strategies.ignore(db, new_word, body or strategies.IgnoreBody())
    strategies.delete_new_word(db, new_word["id"])


@router.delete("/{new_word_id}", status_code=204)
def remove_new_word(db: AdminDb, new_word_id: int) -> None:
    """Discard it (e.g. an OCR error)."""
    strategies.delete_new_word(db, new_word_id)
