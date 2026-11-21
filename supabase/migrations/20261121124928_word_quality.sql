-- Word data quality: a 0–100 score per word, calculated from configurable, weighted rules.
-- Rules and formula settings are data (quality_rules, quality_settings), changed only through
-- migrations; score_word() is the only place that knows how a rule kind is checked.
-- See docs/data-quality.md.

CREATE TABLE quality_rules (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  -- NULL = applies to every word; otherwise only to words with a definition of this type
  word_type TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('definition_field', 'definition_list', 'word_list', 'forms_grid')),
  params JSONB NOT NULL DEFAULT '{}',
  points NUMERIC(6, 2) NOT NULL CHECK (points >= 0),
  -- share = partial credit, all = all or nothing
  credit TEXT NOT NULL DEFAULT 'share' CHECK (credit IN ('share', 'all')),
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exactly one row
CREATE TABLE quality_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  -- Points possible for a word without any typed definition, so it can't look better than a
  -- typed word that is missing its type-specific data
  untyped_possible NUMERIC(6, 2) NOT NULL DEFAULT 100 CHECK (untyped_possible >= 0),
  green_threshold INT NOT NULL DEFAULT 100 CHECK (green_threshold BETWEEN 0 AND 100),
  yellow_threshold INT NOT NULL DEFAULT 50 CHECK (yellow_threshold BETWEEN 0 AND 100),
  -- Form values meaning "this form does not exist"; they count as filled
  not_applicable_markers TEXT[] NOT NULL DEFAULT ARRAY['-', 'n/a'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (yellow_threshold <= green_threshold)
);

INSERT INTO quality_settings DEFAULT VALUES;

INSERT INTO quality_rules (sort_order, key, label, word_type, kind, params, points, credit, active) VALUES
  (10, 'definition', 'Značenje', NULL, 'definition_field', '{"field": "definition"}', 40, 'share', true),
  (20, 'type', 'Vrsta riječi', NULL, 'definition_field', '{"field": "type"}', 10, 'share', true),
  (30, 'example', 'Primjer', NULL, 'definition_list', '{"field": "examples", "min": 1}', 20, 'share', true),

  (100, 'noun_gender', 'Rod', 'imenica', 'definition_field', '{"field": "gender"}', 10, 'share', true),
  (110, 'noun_cases', 'Padeži', 'imenica', 'forms_grid',
    '{"category": "padež", "forms": ["jednina", "množina"], "names": ["nominativ", "genitiv", "dativ", "akuzativ", "vokativ", "instrumental", "lokativ"]}',
    15, 'share', true),
  (120, 'noun_synonyms', 'Sinonimi', 'imenica', 'word_list', '{"from": "definitions", "field": "synonyms", "min": 1}', 5, 'all', true),

  (200, 'verb_tenses', 'Glagolska vremena', 'glagol', 'forms_grid',
    '{"category": "glagolsko vrijeme", "forms": ["1. lice jednine", "2. lice jednine", "3. lice jednine", "1. lice množine", "2. lice množine", "3. lice množine"], "names": ["prezent", "perfekt", "futur i", "aorist", "imperfekt"]}',
    25, 'share', true),
  (210, 'verb_synonyms', 'Sinonimi', 'glagol', 'word_list', '{"from": "definitions", "field": "synonyms", "min": 1}', 5, 'all', true),

  (300, 'adjective_comparative', 'Komparativ', 'pridjev', 'forms_grid',
    '{"category": "komparacija", "forms": ["muški", "ženski", "srednji"], "names": ["komparativ"]}', 5, 'share', true),
  (310, 'adjective_superlative', 'Superlativ', 'pridjev', 'forms_grid',
    '{"category": "komparacija", "forms": ["muški", "ženski", "srednji"], "names": ["superlativ"]}', 5, 'share', true),
  (320, 'adjective_synonyms', 'Sinonimi', 'pridjev', 'word_list', '{"from": "definitions", "field": "synonyms", "min": 1}', 10, 'all', true),
  (330, 'adjective_antonyms', 'Antonimi', 'pridjev', 'word_list', '{"from": "definitions", "field": "antonyms", "min": 1}', 10, 'all', true),

  (400, 'adverb_synonyms', 'Sinonimi', 'prilog', 'word_list', '{"from": "definitions", "field": "synonyms", "min": 1}', 10, 'all', true),

  (500, 'pronoun_cases', 'Padeži', 'zamjenica', 'forms_grid',
    '{"category": "padež", "forms": ["jednina", "množina"], "names": ["nominativ", "genitiv", "dativ", "akuzativ", "vokativ", "instrumental", "lokativ"]}',
    15, 'share', false),
  (510, 'number_cases', 'Padeži', 'broj', 'forms_grid',
    '{"category": "padež", "forms": ["jednina", "množina"], "names": ["nominativ", "genitiv", "dativ", "akuzativ", "vokativ", "instrumental", "lokativ"]}',
    15, 'share', false);

ALTER TABLE quality_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_settings ENABLE ROW LEVEL SECURITY;

-- Readable by everyone, so the scoring trigger works for whichever role writes a word. There are
-- no write policies: rules and settings are changed through migrations only.
CREATE POLICY "Enable read for everyone" ON quality_rules FOR SELECT USING (true);
CREATE POLICY "Enable read for everyone" ON quality_settings FOR SELECT USING (true);

-- Number of non-blank strings in a JSON array (0 for anything else)
CREATE OR REPLACE FUNCTION quality_list_count(value JSONB)
RETURNS INT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN jsonb_typeof(value) = 'array' THEN (
      SELECT count(*)::int FROM jsonb_array_elements(value) e
      WHERE jsonb_typeof(e) <> 'string' OR btrim(e #>> '{}') <> ''
    )
    ELSE 0
  END
$$;

-- Scores one word against the given rules and settings (both as JSON, so a different
-- configuration can be tried without saving it). `word` needs definitions and forms; word_list rules with
-- "from": "word" read the named top-level array (e.g. origins, alternatives).
CREATE OR REPLACE FUNCTION score_word(word JSONB, rules JSONB, settings JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  defs JSONB := CASE WHEN jsonb_typeof(word -> 'definitions') = 'array' THEN word -> 'definitions' ELSE '[]' END;
  form_list JSONB := CASE WHEN jsonb_typeof(word -> 'forms') = 'array' THEN word -> 'forms' ELSE '[]' END;
  markers TEXT[] := ARRAY(
    SELECT lower(btrim(m)) FROM jsonb_array_elements_text(coalesce(settings -> 'not_applicable_markers', '[]')) m
  );
  types TEXT[] := ARRAY(
    SELECT DISTINCT lower(btrim(d ->> 'type')) FROM jsonb_array_elements(defs) d
    WHERE coalesce(btrim(d ->> 'type'), '') <> ''
  );
  untyped BOOLEAN;
  rule JSONB;
  params JSONB;
  rule_type TEXT;
  scoped JSONB;
  field TEXT;
  min_items INT;
  form_values JSONB;
  total INT;
  passed INT;
  not_applicable INT;
  points NUMERIC;
  earned NUMERIC;
  sum_earned NUMERIC := 0;
  sum_possible NUMERIC := 0;
  results JSONB := '[]';
  score INT;
BEGIN
  untyped := cardinality(types) = 0;

  FOR rule IN SELECT r FROM jsonb_array_elements(coalesce(rules, '[]')) r LOOP
    CONTINUE WHEN NOT coalesce((rule ->> 'active')::boolean, true);

    rule_type := lower(nullif(btrim(rule ->> 'word_type'), ''));
    CONTINUE WHEN rule_type IS NOT NULL AND NOT rule_type = ANY (types);

    params := coalesce(rule -> 'params', '{}');
    field := params ->> 'field';
    min_items := coalesce((params ->> 'min')::int, 1);
    not_applicable := 0;

    -- Per-definition rules look only at definitions of the rule's type
    IF rule_type IS NULL OR rule ->> 'kind' = 'forms_grid' THEN
      scoped := defs;
    ELSE
      SELECT coalesce(jsonb_agg(d), '[]') INTO scoped
      FROM jsonb_array_elements(defs) d WHERE lower(btrim(d ->> 'type')) = rule_type;
    END IF;

    CASE rule ->> 'kind'
      WHEN 'definition_field' THEN
        total := jsonb_array_length(scoped);
        SELECT count(*) INTO passed FROM jsonb_array_elements(scoped) d
        WHERE coalesce(btrim(d ->> field), '') <> '';

      WHEN 'definition_list' THEN
        total := jsonb_array_length(scoped);
        SELECT count(*) INTO passed FROM jsonb_array_elements(scoped) d
        WHERE quality_list_count(d -> field) >= min_items;

      WHEN 'word_list' THEN
        total := 1;
        IF params ->> 'from' = 'word' THEN
          passed := (quality_list_count(word -> field) >= min_items)::int;
        ELSE
          passed := (
            (SELECT coalesce(sum(quality_list_count(d -> field)), 0) FROM jsonb_array_elements(scoped) d) >= min_items
          )::int;
        END IF;

      WHEN 'forms_grid' THEN
        -- "form|name" -> value for the rule's category, ignoring blank values
        SELECT coalesce(jsonb_object_agg(
          lower(btrim(f ->> 'form')) || '|' || lower(btrim(f ->> 'name')), btrim(f ->> 'value')
        ), '{}') INTO form_values
        FROM jsonb_array_elements(form_list) f
        WHERE lower(btrim(f ->> 'category')) = lower(btrim(params ->> 'category'))
          AND coalesce(btrim(f ->> 'value'), '') <> '';

        SELECT count(*), count(value), count(*) FILTER (WHERE lower(value) = ANY (markers))
        INTO total, passed, not_applicable
        FROM (
          SELECT form_values ->> (lower(btrim(fm)) || '|' || lower(btrim(nm))) AS value
          FROM jsonb_array_elements_text(coalesce(params -> 'forms', '[]')) fm
          CROSS JOIN jsonb_array_elements_text(coalesce(params -> 'names', '[]')) nm
        ) cells;

      ELSE
        -- Unknown kinds are skipped rather than failing every write to words_v2
        CONTINUE;
    END CASE;

    points := coalesce((rule ->> 'points')::numeric, 0);
    earned := CASE
      WHEN total = 0 THEN 0
      WHEN rule ->> 'credit' = 'all' THEN CASE WHEN passed = total THEN points ELSE 0 END
      ELSE points * passed / total
    END;

    sum_earned := sum_earned + earned;
    sum_possible := sum_possible + points;
    results := results || jsonb_build_object(
      'key', rule ->> 'key',
      'label', rule ->> 'label',
      'word_type', rule_type,
      'points', points,
      'earned', round(earned, 2),
      'passed', passed,
      'total', total,
      'not_applicable', not_applicable
    );
  END LOOP;

  IF untyped THEN
    sum_possible := greatest(sum_possible, coalesce((settings ->> 'untyped_possible')::numeric, 0));
  END IF;

  -- floor, so only a word that passes every rule reaches 100
  score := CASE WHEN sum_possible > 0 THEN floor(100 * sum_earned / sum_possible) ELSE 0 END;

  RETURN jsonb_build_object(
    'score', score,
    'level', CASE
      WHEN score >= coalesce((settings ->> 'green_threshold')::int, 100) THEN 'green'
      WHEN score >= coalesce((settings ->> 'yellow_threshold')::int, 50) THEN 'yellow'
      ELSE 'red'
    END,
    'earned', round(sum_earned, 2),
    'possible', sum_possible,
    'untyped', untyped,
    'rules', results
  );
END;
$$;

-- The saved configuration as score_word() takes it
CREATE OR REPLACE FUNCTION quality_config()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'rules', coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.sort_order, r.id) FROM quality_rules r), '[]'),
    'settings', (SELECT to_jsonb(s) FROM quality_settings s)
  )
$$;

-- Scores a word (saved or not) with the saved configuration
CREATE OR REPLACE FUNCTION word_quality(word JSONB)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT score_word(word, c -> 'rules', c -> 'settings') FROM quality_config() c
$$;

ALTER TABLE words_v2
ADD COLUMN quality SMALLINT,
ADD COLUMN quality_breakdown JSONB;

CREATE INDEX words_v2_quality_idx ON words_v2 (quality, headword);

CREATE OR REPLACE FUNCTION words_v2_set_quality()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.quality_breakdown := word_quality(to_jsonb(NEW) - 'quality_breakdown');
  NEW.quality := (NEW.quality_breakdown ->> 'score')::smallint;
  RETURN NEW;
END;
$$;

CREATE TRIGGER words_v2_set_quality
BEFORE INSERT OR UPDATE ON words_v2
FOR EACH ROW EXECUTE FUNCTION words_v2_set_quality();

-- Rescores one batch of words (by id) after the rules changed; returns the last id done, or
-- NULL when there is nothing left. Batches keep each call short.
CREATE OR REPLACE FUNCTION recalculate_word_quality(after_id INT DEFAULT 0, batch_size INT DEFAULT 2000)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  last_id INT;
BEGIN
  SELECT max(id) INTO last_id FROM (
    SELECT id FROM words_v2 WHERE id > after_id ORDER BY id LIMIT batch_size
  ) batch;

  IF last_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- The trigger does the scoring
  UPDATE words_v2 SET quality = NULL WHERE id > after_id AND id <= last_id;
  RETURN last_id;
END;
$$;

-- Green/yellow/red counts of the stored scores
CREATE OR REPLACE FUNCTION quality_distribution()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'green', count(*) FILTER (WHERE w.quality >= s.green_threshold),
    'yellow', count(*) FILTER (WHERE w.quality < s.green_threshold AND w.quality >= s.yellow_threshold),
    'red', count(*) FILTER (WHERE w.quality < s.yellow_threshold),
    'unscored', count(*) FILTER (WHERE w.quality IS NULL),
    'total', count(*)
  )
  FROM words_v2 w CROSS JOIN quality_settings s
$$;

-- Rescoring is run from SQL (after a migration changes the rules), never through the API;
-- counting every word is for signed-in users only
REVOKE EXECUTE ON FUNCTION recalculate_word_quality(INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION quality_distribution() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION quality_distribution() TO authenticated;

-- Score every existing word (the migration runs without the API's statement timeout)
UPDATE words_v2 SET quality = NULL;
