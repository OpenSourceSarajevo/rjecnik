CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Lowercase and strip Bosnian diacritics, so "cevapi", "Ćevapi" and "ćevapi" compare equal.
-- đ becomes "dj", the usual way it is typed without diacritics.
CREATE OR REPLACE FUNCTION normalize_bs(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT replace(translate(lower(value), 'čćšž', 'ccsz'), 'đ', 'dj')
$$;

CREATE INDEX IF NOT EXISTS words_v2_headword_normalized_trgm_idx
ON words_v2
USING gin (public.normalize_bs(headword) extensions.gin_trgm_ops);

-- Ranks: exact match, same word without diacritics, prefix, substring, similar spelling (typos).
-- Within a rank, matching diacritics, closer spelling and shorter words come first.
CREATE OR REPLACE FUNCTION search_words_ranked(
  search_term TEXT,
  limit_value INT,
  offset_value INT
)
RETURNS TABLE(id INT, headword VARCHAR, definitions JSONB)
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions
AS $$
DECLARE
  raw TEXT := lower(trim(search_term));
  term TEXT := normalize_bs(trim(search_term));
  -- Escape LIKE wildcards so "%" and "_" are searched literally
  raw_pattern TEXT := replace(replace(replace(raw, '\', '\\'), '%', '\%'), '_', '\_');
  pattern TEXT := replace(replace(replace(term, '\', '\\'), '%', '\%'), '_', '\_');
BEGIN
  -- A separate query, because "term = '' OR ..." would keep the trigram index from being used
  IF term = '' THEN
    RETURN QUERY
    SELECT w.id, w.headword, w.definitions
    FROM words_v2 w
    ORDER BY w.headword
    LIMIT limit_value
    OFFSET offset_value;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT w.id, w.headword, w.definitions
  FROM words_v2 w
  WHERE normalize_bs(w.headword) LIKE '%' || pattern || '%'
     OR normalize_bs(w.headword) % term
  ORDER BY
    CASE
      WHEN lower(w.headword) = raw THEN 0
      WHEN normalize_bs(w.headword) = term THEN 1
      WHEN normalize_bs(w.headword) LIKE pattern || '%' THEN 2
      WHEN normalize_bs(w.headword) LIKE '%' || pattern || '%' THEN 3
      ELSE 4
    END,
    -- Prefer words whose diacritics match what was typed ("kuć" ranks "kuća" above "kuca")
    CASE WHEN lower(w.headword) LIKE '%' || raw_pattern || '%' THEN 0 ELSE 1 END,
    similarity(normalize_bs(w.headword), term) DESC,
    length(w.headword),
    w.headword
  LIMIT limit_value
  OFFSET offset_value;
END;
$$;
