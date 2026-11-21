# Word data quality

Every word in `words_v2` has a data quality score from 0 to 100. The score shows how complete the word's data is, judged by weighted rules that depend on the word type: a noun is checked for its cases and gender, a verb for its tenses, a preposition only for the basics.

The rules and their weights are **data, not code**. They live in the `quality_rules` table and are changed **only through migrations**: nobody can edit them from the admin app or the API, and row-level security blocks writes from signed-in users. Changing a weight, switching a rule off or scoring a new field (for example IPA pronunciation) is a short SQL migration that ends by rescoring every word; no app code changes and no app deploy.

- [How a score is calculated](#how-a-score-is-calculated)
- [Rules](#rules)
- [Check kinds](#check-kinds)
- [Settings](#settings)
- [Default rules](#default-rules)
- [When scores are recalculated](#when-scores-are-recalculated)
- [Where the score is shown](#where-the-score-is-shown)
- [Changing the rules](#changing-the-rules)
- [API](#api)
- [Database reference](#database-reference)
- [Limitations](#limitations)

## How a score is calculated

1. Collect the word types of the word: the distinct `type` values of its definitions (a word can have several, e.g. a noun and a verb meaning).
2. Pick the rules that apply: every **active** rule without a word type, plus every active rule whose word type is one of the word's types.
3. Each rule earns between 0 and its points (see [credit](#rules)).
4. Add up the points earned and the points possible.

```
score = floor(100 × earned / possible)
```

- **Rounded down**, so only a word that passes every rule reaches 100.
- **Untyped words**: when no definition has a type, type-specific rules can't apply, so the word would be scored on the core rules alone and look better than a typed word that is missing its forms. Instead, possible points are raised to `untyped_possible` (100 by default).
- **Several types**: possible points add up. A word with a noun and a verb definition can earn the noun rules and the verb rules.
- **No definitions**: scores 0.

The score is turned into a colour (level) with the [thresholds](#settings): **green** from 100, **yellow** from 50, **red** below 50 by default.

### Example

A verb with one definition, a type, no example and 12 of the 30 tense cells filled:

| Rule | Points | Earned |
| --- | --- | --- |
| Značenje | 40 | 40 (1 of 1 definitions) |
| Vrsta riječi | 10 | 10 (1 of 1) |
| Primjer | 20 | 0 (0 of 1) |
| Glagolska vremena | 25 | 10 (12 of 30 cells) |
| Sinonimi (glagol) | 5 | 0 |
| **Total** | **100** | **60 → 60%, yellow** |

## Rules

A rule is a row in `quality_rules`:

| Column | Example | Meaning |
| --- | --- | --- |
| `key` | `noun_cases` | Stable id, lowercase letters, digits and `_`. Used in breakdowns and to target the rule in migrations. |
| `label` | `Padeži` | Shown in the editor checklist. Bosnian. |
| `word_type` | `imenica` | `NULL` applies to every word; otherwise only to words with a definition of this type. |
| `kind` | `forms_grid` | Which [check](#check-kinds) runs. |
| `params` | `{"category": "padež", …}` | Inputs for the check; the shape depends on `kind`. |
| `points` | `15` | Weight. |
| `credit` | `share` | `share`: partial credit (points × share passing). `all`: all or nothing (points only when everything passes). |
| `active` | `true` | Inactive rules are ignored completely, including in possible points. |
| `sort_order` | `110` | Order in the editor checklist. |

**Per-definition scope**: rules that look at definitions (`definition_field`, `definition_list`, and `word_list` with `"from": "definitions"`) only look at the definitions of the rule's word type. A `noun_gender` rule ignores the verb definitions of a word that is both. Rules without a word type look at all definitions.

## Check kinds

The scoring engine (`score_word` in Postgres) knows four kinds of check. Everything else is configuration.

### `definition_field`

Share of definitions where a text field is filled (not empty or only spaces).

```json
{ "field": "pronunciation_ipa" }
```

Works with any text field stored on a definition: `definition`, `type`, `gender`, `part_of_speech`, `pronunciation_ipa`, `pronunciation_audio`, or one added later.

### `definition_list`

Share of definitions whose list has at least `min` non-empty items.

```json
{ "field": "examples", "min": 1 }
```

Lists on a definition: `examples`, `synonyms`, `antonyms`.

### `word_list`

Passes when there are at least `min` items in total, so it is effectively all or nothing.

```json
{ "from": "definitions", "field": "synonyms", "min": 1 }
{ "from": "word", "field": "origins", "min": 1 }
```

- `"from": "definitions"` counts items across the definitions in the rule's scope ("at least one synonym on any noun definition").
- `"from": "word"` reads a top-level array of the word, e.g. `origins` or `alternatives`.

### `forms_grid`

Share of filled cells in a grid of forms. The cells are every combination of `forms` × `names` in one `category`. A cell is filled when `words_v2.forms` has an entry with that category, form and name, and a non-blank value.

```json
{
  "category": "padež",
  "forms": ["jednina", "množina"],
  "names": ["nominativ", "genitiv", "dativ", "akuzativ", "vokativ", "instrumental", "lokativ"]
}
```

Matching ignores case and surrounding spaces, so `"Futur I"` matches `"futur i"`.

**Missing vs. not applicable**: a cell with no entry (or a blank value) counts as **missing**. A cell whose value is a [not-applicable marker](#settings) (`-` or `n/a` by default) counts as **filled**, so a noun without a plural, or a verb that has no aorist because of its aspect, loses no points. The checklist shows how many cells were marked, e.g. `12/14 (6 n/a)`.

How the editor stores forms today:

| Category | `form` | `name` |
| --- | --- | --- |
| `padež` | `jednina`, `množina` | `nominativ` … `lokativ` |
| `glagolsko vrijeme` | `1. lice jednine` … `3. lice množine` | `prezent`, `perfekt`, `aorist`, `imperfekt`, `pluskvamperfekt`, `futur i`, `futur ii` |
| `komparacija` | `muški`, `ženski`, `srednji` | `komparativ`, `superlativ` |

The editor has quick-fill tools for cases and tenses. Comparison has no tool yet: add it as generic forms with the values above, or let the AI fill add it.

## Settings

One row in `quality_settings`:

| Setting | Default | Meaning |
| --- | --- | --- |
| `green_threshold` | 100 | Lowest score shown as green. |
| `yellow_threshold` | 50 | Lowest score shown as yellow; below is red. Can't be above the green threshold. |
| `untyped_possible` | 100 | Points possible for a word without any typed definition. |
| `not_applicable_markers` | `-`, `n/a` | Form values meaning "this form does not exist"; matched case-insensitively. |

## Default rules

Seeded by the migration `20261121124928_word_quality.sql`. Each word type can earn 70 core points plus about 30 type-specific points.

| Key | Label | Word type | Kind | Points | Credit |
| --- | --- | --- | --- | --- | --- |
| `definition` | Značenje | all | `definition_field` `definition` | 40 | share |
| `type` | Vrsta riječi | all | `definition_field` `type` | 10 | share |
| `example` | Primjer | all | `definition_list` `examples` ≥ 1 | 20 | share |
| `noun_gender` | Rod | imenica | `definition_field` `gender` | 10 | share |
| `noun_cases` | Padeži | imenica | `forms_grid` 7 cases × 2 numbers | 15 | share |
| `noun_synonyms` | Sinonimi | imenica | `word_list` `synonyms` | 5 | all |
| `verb_tenses` | Glagolska vremena | glagol | `forms_grid` prezent, perfekt, futur I, aorist, imperfekt × 6 persons | 25 | share |
| `verb_synonyms` | Sinonimi | glagol | `word_list` `synonyms` | 5 | all |
| `adjective_comparison` | Komparacija | pridjev | `forms_grid` komparativ, superlativ × muški | 10 | share |
| `adjective_comparison_genders` | Komparacija (ženski i srednji rod) | pridjev | `forms_grid` komparativ, superlativ × ženski, srednji | 5 | share |
| `adjective_synonyms` | Sinonimi | pridjev | `word_list` `synonyms` | 10 | all |
| `adjective_antonyms` | Antonimi | pridjev | `word_list` `antonyms` | 10 | all |
| `adverb_synonyms` | Sinonimi | prilog | `word_list` `synonyms` | 10 | all |
| `pronoun_cases` | Padeži | zamjenica | `forms_grid` cases | 15 | share, **inactive** |
| `number_cases` | Padeži | broj | `forms_grid` cases | 15 | share, **inactive** |

Points possible with these rules: imenica 100, glagol 100, pridjev 105, prilog 80, other types 70, words without a type 100. Pluskvamperfekt and futur II are stored but not scored. Not scored at all: origins, alternatives, pronunciation, frequency and the editor note (an open note doesn't affect the score).

## When scores are recalculated

Scores are stored in `words_v2.quality` (the score) and `words_v2.quality_breakdown` (the full result, per rule).

| Event | What happens |
| --- | --- |
| A word is inserted or updated, by anyone | The `words_v2_set_quality` trigger rescores that row before it is written. This includes the admin app, the API, the ingestion strategies and the AI fill scripts. |
| A migration changes rules or settings | The migration ends with `UPDATE words_v2 SET quality = NULL;`, which makes the trigger rescore every word (see [Changing the rules](#changing-the-rules)). |
| Rules or settings are changed by hand in the SQL editor | Nothing happens automatically; rescore with the loop below. |

Rescoring all ~45,000 words takes roughly 10–15 seconds. Migrations have no statement timeout, so a single `UPDATE` is fine there. From the SQL editor, rescore in batches with `recalculate_word_quality(after_id, batch_size)`, which scores one batch and returns the last id it did (`NULL` when done):

```sql
DO $$
DECLARE last_id INT := 0;
BEGIN
  LOOP
    last_id := recalculate_word_quality(last_id, 5000);
    EXIT WHEN last_id IS NULL;
  END LOOP;
END $$;
```

## Where the score is shown

- **Kontrolna tabla** (`/kontrolna-tabla`): *Riječi po kvaliteti* shows how many words are green (*Potpuna*), yellow (*Djelimična*) and red (*Nepotpuna*), and how many are not scored yet.
- **Rječnik** (`/rjecnik`): a *Kvaliteta* column with a coloured dot and percentage. The quality filter lists only words of that colour, lowest score first. Without the filter the list keeps the normal search order.
- **Word editor** (adding and editing a word): the *Kvaliteta podataka* panel under the toolbar shows the score of the word **as it is being edited**, before it is saved. Expand it for the checklist: each rule with its passing count and points. The panel asks the API to score the draft about half a second after the last change.

## Changing the rules

Create a migration (`supabase migration new quality_rules_<what>`), change `quality_rules` and `quality_settings` with plain SQL, and end it by rescoring every word:

```sql
-- Change a weight
UPDATE quality_rules SET points = 10, updated_at = now() WHERE key = 'noun_synonyms';

-- Turn a rule on or off (inactive rules keep their configuration)
UPDATE quality_rules SET active = true, updated_at = now() WHERE key = 'pronoun_cases';

-- Change a threshold or the not-applicable markers
UPDATE quality_settings SET green_threshold = 95, updated_at = now();

-- Remove a rule
DELETE FROM quality_rules WHERE key = 'adverb_synonyms';

-- Rescore every word with the new rules (always last)
UPDATE words_v2 SET quality = NULL;
```

Scores are relative to the points possible, so raising one rule's points lowers the share of every other rule for that word type.

### See the effect before applying it

Run the migration's statements in a transaction on a local database (`supabase db reset` with a copy of the data), or in the SQL editor, and roll it back:

```sql
BEGIN;
SELECT quality_distribution();  -- before
-- … the migration's statements, including the final UPDATE …
SELECT quality_distribution();  -- after
ROLLBACK;
```

The final `UPDATE` locks every word for those 10–15 seconds, so prefer a local database over production.

### Score a new field, e.g. IPA pronunciation

Once IPA is being added to words:

```sql
INSERT INTO quality_rules (sort_order, key, label, word_type, kind, params, points, credit)
VALUES (40, 'ipa', 'Izgovor (IPA)', NULL, 'definition_field', '{"field": "pronunciation_ipa"}', 5, 'share');

UPDATE words_v2 SET quality = NULL;
```

Every word's possible points go up by 5, and the editor checklist shows the new rule. Audio works the same way with `pronunciation_audio`. Any field stored on definitions, or a new form category, needs no code change.

### Score a new kind of form, e.g. adjective declension

Add a `forms_grid` rule with the category, forms and names the editor stores:

```sql
INSERT INTO quality_rules (sort_order, key, label, word_type, kind, params, points, credit)
VALUES (
  340, 'adjective_declension', 'Deklinacija', 'pridjev', 'forms_grid',
  '{"category": "pridjevska deklinacija", "forms": ["muški", "ženski", "srednji"], "names": ["nominativ", "genitiv", "dativ", "akuzativ", "vokativ", "instrumental", "lokativ"]}',
  10, 'share'
);
```

### Add a new check kind

Needed only when a new feature stores data in a shape none of the four kinds can read (for example a nested object). In a migration:

1. Replace `score_word` with a version that has a new `WHEN '<kind>'` branch setting `total`, `passed` and (optionally) `not_applicable`.
2. Add the kind to the `quality_rules.kind` check constraint.

Unknown kinds are skipped by `score_word` instead of failing, so a rule can never block writes to `words_v2`.

### See the current rules

```sql
SELECT key, label, word_type, kind, params, points, credit, active
FROM quality_rules ORDER BY sort_order;

SELECT quality_config();  -- rules and settings as JSON
```

## API

All endpoints are under `/api/quality`, need the `Dictionary.ReadWrite` permission and only read. Typed functions are on `api.quality` from `@rjecnik/api`.

| Method | Path | `api.quality.` | Purpose |
| --- | --- | --- | --- |
| GET | `/distribution` | `distribution()` | Green/yellow/red/unscored counts of the stored scores. |
| POST | `/preview` | `preview(word)` | Score an unsaved word (`definitions`, `forms`, `origins`, `alternatives`); returns the full breakdown. |
| GET | `/words` | `words(params)` | Scored words, lowest first; `level`, `q` (headword contains), `order`, `page`, `page_size`. |
| GET | `/scores?ids=1,2,3` | `scores(ids)` | Score and level of up to 100 words. |

`GET /api/words/{id}` also returns `quality` and `quality_breakdown`. The public endpoints don't expose quality.

### Breakdown format

`quality_breakdown`, `/preview` and `score_word` return:

```json
{
  "score": 60,
  "level": "yellow",
  "earned": 60,
  "possible": 100,
  "untyped": false,
  "rules": [
    {
      "key": "verb_tenses",
      "label": "Glagolska vremena",
      "word_type": "glagol",
      "points": 25,
      "earned": 10,
      "passed": 12,
      "total": 30,
      "not_applicable": 0
    }
  ]
}
```

`passed`/`total` count definitions for definition rules, form cells for `forms_grid`, and are `0/1` or `1/1` for `word_list`. Only rules that apply to the word are listed.

## Database reference

All in `supabase/migrations/20261121124928_word_quality.sql`.

| Object | Purpose |
| --- | --- |
| `quality_rules`, `quality_settings` | Configuration. Readable by everyone (the trigger needs them for any role that writes words); no write policies, so only migrations and the SQL editor can change them. |
| `words_v2.quality`, `words_v2.quality_breakdown` | Stored score and breakdown; `words_v2_quality_idx` on `(quality, headword)`. |
| `score_word(word, rules, settings)` | The engine. Pure (`IMMUTABLE`): scores a word with a configuration passed in as JSON. |
| `word_quality(word)` | `score_word` with the saved configuration. |
| `quality_config()` | Saved rules and settings as JSON. |
| `recalculate_word_quality(after_id, batch_size)` | Rescore one batch of words. |
| `quality_distribution()` | Counts of the stored scores. |
| `words_v2_set_quality` (trigger) | Scores each row on insert and update. |

`recalculate_word_quality` can't be called through the API at all (SQL only), and `quality_distribution` only by signed-in users.

## Limitations

- There is no screen for editing rules; every change is a migration. The engine and tables are ready for an admin editor if one is added later.
- Words written while a rescore is running are scored by the trigger with the configuration current at that moment, so they are always consistent.
- Word types and form categories are matched exactly, ignoring case and surrounding spaces. A typo in a rule's word type or category means the rule never applies or never finds any forms; check the editor checklist of a sample word after a change.
