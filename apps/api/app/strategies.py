"""Strategies for processing a word from words_new (found in ingested texts).

Each strategy has its own endpoint and request body (routers/new_words.py). It applies
the change to words_v2 or words_ignore, then the router removes the processed row from
words_new. The steps are not one
transaction (PostgREST has none), same as the admin app's handlers they replace.
"""

from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
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
    model_config = ConfigDict(populate_by_name=True)

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


def frequency_only(db: Client, user: User, new_word: dict) -> dict:
    """The word is already in the dictionary under the same headword: count it."""
    word = _get_word(db, new_word["headword"])
    return _update_word(
        db, user, word["headword"], {"frequency": word["frequency"] + new_word["count"]}
    )


def existing_form(db: Client, user: User, new_word: dict, b: HeadwordBody) -> dict:
    """The word is an already listed form of another headword: count it there."""
    word = _get_word(db, b.headword)
    return _update_word(db, user, b.headword, {"frequency": word["frequency"] + new_word["count"]})


def new_form(db: Client, user: User, new_word: dict, b: NewFormBody) -> dict:
    """The word is a new form of another headword: save that headword's updated forms."""
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


def new_definition(db: Client, user: User, new_word: dict, b: NewDefinitionBody) -> dict:
    """The word adds a meaning to an existing headword."""
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


def new_headword(db: Client, user: User, new_word: dict, b: NewHeadwordBody) -> dict:
    """The word becomes a new dictionary entry."""
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


def ignore(db: Client, new_word: dict, b: IgnoreBody) -> None:
    """The word should not be processed again (name, abbreviation, ...)."""
    db.table("words_ignore").upsert(
        {"headword": new_word["headword"], "type": b.type, "updated_at": now_iso()},
        on_conflict="headword",
    ).execute()


def load_new_word(db: Client, new_word_id: int) -> dict[str, Any]:
    res = db.table("words_new").select("*").eq("id", new_word_id).limit(1).execute()
    if not res.data:
        raise _not_found()
    return res.data[0]


def delete_new_word(db: Client, new_word_id: int) -> None:
    """Remove a processed (or discarded) word from words_new."""
    res = db.table("words_new").delete().eq("id", new_word_id).execute()
    if not res.data:
        raise _not_found()
