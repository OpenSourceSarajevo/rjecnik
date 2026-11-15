"""Strategies for processing a word from words_new (found in ingested texts).

Each strategy validates its own request body, applies the change to words_v2 or
words_ignore, then removes the processed row from words_new. The steps are not one
transaction (PostgREST has none), same as the admin app's handlers they replace.
"""

from collections.abc import Callable
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, Field, ValidationError, field_validator
from supabase import Client

from app.auth import User
from app.routers.ignored_words import IgnoreType
from app.routers.words import WordFormInput, now_iso


class HeadwordBody(BaseModel):
    """Target an existing dictionary word."""

    headword: str = Field(min_length=1)


class NewFormBody(HeadwordBody):
    forms: list[WordFormInput] = Field(min_length=1)


class DraftDefinition(BaseModel):
    type: str | None = None
    gender: str | None = None
    definition: str
    examples: list[str] | None = None

    @field_validator("definition")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("definicija ne smije biti prazna")
        return v


class NewDefinitionBody(HeadwordBody):
    definition: DraftDefinition
    update_frequency: bool = Field(default=False, alias="updateFrequency")


class NewHeadwordBody(BaseModel):
    definitions: list[dict[str, Any]] = Field(min_length=1)
    forms: list[WordFormInput] | None = None
    origins: list[str] | None = None
    alternatives: list[str] | None = None
    synonyms: list[str] | None = None
    antonyms: list[str] | None = None


class IgnoreBody(BaseModel):
    type: IgnoreType = "ostalo"


def _parse[T: BaseModel](model: type[T], body: dict[str, Any] | None) -> T:
    try:
        return model.model_validate(body or {})
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=e.errors(include_url=False, include_context=False, include_input=False),
        ) from e


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Riječ nije pronađena")


def _get_word(db: Client, headword: str) -> dict[str, Any]:
    res = db.table("words_v2").select("*").eq("headword", headword).limit(1).execute()
    if not res.data:
        raise _not_found()
    return res.data[0]


def _update_word(db: Client, user: User, headword: str, values: dict[str, Any]) -> dict[str, Any]:
    values |= {"updated_by": user.email, "updated_at": now_iso()}
    res = db.table("words_v2").update(values).eq("headword", headword).execute()
    if not res.data:
        raise _not_found()
    return res.data[0]


def frequency_only(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """The word is already in the dictionary under the same headword: count it."""
    word = _get_word(db, new_word["headword"])
    return _update_word(
        db, user, word["headword"], {"frequency": word["frequency"] + new_word["count"]}
    )


def existing_form(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """The word is an already listed form of another headword: count it there."""
    b = _parse(HeadwordBody, body)
    word = _get_word(db, b.headword)
    return _update_word(db, user, b.headword, {"frequency": word["frequency"] + new_word["count"]})


def new_form(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """The word is a new form of another headword: save that headword's updated forms."""
    b = _parse(NewFormBody, body)
    word = _get_word(db, b.headword)
    return _update_word(
        db,
        user,
        b.headword,
        {
            "frequency": word["frequency"] + new_word["count"],
            # The client sends the headword's complete form list, including the new one
            "forms": [f.model_dump() for f in b.forms],
        },
    )


def new_definition(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """The word adds a meaning to an existing headword."""
    b = _parse(NewDefinitionBody, body)
    word = _get_word(db, b.headword)
    definition = {
        "type": b.definition.type or None,
        "gender": b.definition.gender or None,
        "examples": b.definition.examples or [],
        "definition": b.definition.definition,
        "part_of_speech": None,
        "pronunciation_ipa": None,
        "pronunciation_audio": None,
        "synonyms": [],
        "antonyms": [],
    }
    frequency = word["frequency"] + (new_word["count"] if b.update_frequency else 0)
    return _update_word(
        db,
        user,
        b.headword,
        {"definitions": [*word["definitions"], definition], "frequency": frequency},
    )


def new_headword(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """The word becomes a new dictionary entry."""
    b = _parse(NewHeadwordBody, body)
    now = now_iso()
    values = b.model_dump() | {
        "headword": new_word["headword"],
        "frequency": new_word["count"],
        "created_by": user.email,
        "created_at": now,
        "updated_by": user.email,
        "updated_at": now,
    }
    return db.table("words_v2").insert(values).execute().data[0]


def ignore(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """The word should not be processed again (name, abbreviation, ...)."""
    b = _parse(IgnoreBody, body)
    db.table("words_ignore").upsert(
        {"headword": new_word["headword"], "type": b.type, "updated_at": now_iso()},
        on_conflict="headword",
    ).execute()
    return None


def remove(db: Client, user: User, new_word: dict, body: dict | None) -> dict | None:
    """Discard the word (e.g. an OCR error)."""
    return None


Handler = Callable[[Client, User, dict, dict | None], dict | None]

HANDLERS: dict[str, Handler] = {
    "Frequency Only": frequency_only,
    "Existing Form": existing_form,
    "New Form": new_form,
    "New Definition": new_definition,
    "New Headword": new_headword,
    "Ignore": ignore,
    "Remove": remove,
}


def apply(
    db: Client, user: User, new_word_id: int, strategy: str, body: dict | None
) -> dict | None:
    """Apply a strategy and delete the processed words_new row; returns the affected word."""
    res = db.table("words_new").select("*").eq("id", new_word_id).limit(1).execute()
    if not res.data:
        raise _not_found()
    word = HANDLERS[strategy](db, user, res.data[0], body)
    db.table("words_new").delete().eq("id", new_word_id).execute()
    return word
