CREATE OR REPLACE VIEW words_dashboard_stats AS
SELECT
  COUNT(*) AS words,
  COALESCE(SUM(jsonb_array_length(definitions)), 0) AS definitions,
  COALESCE(SUM(CASE WHEN forms IS NOT NULL THEN jsonb_array_length(forms) ELSE 0 END), 0) AS forms
FROM words_v2; 

CREATE OR REPLACE VIEW words_by_type AS
WITH all_definitions AS (
  SELECT jsonb_array_elements(definitions) AS def
  FROM words_v2
),
normalized_definitions AS (
  SELECT
    CASE
      WHEN def ->> 'type' ILIKE '%imenica%' THEN 'imenica'
      WHEN def ->> 'type' ILIKE '%glagol%' THEN 'glagol'
      WHEN def ->> 'type' ILIKE '%pridjev%' THEN 'pridjev'
      WHEN def ->> 'type' ILIKE '%zamjenica%' THEN 'zamjenica'
      WHEN def ->> 'type' ILIKE '%broj%' THEN 'broj'
      WHEN def ->> 'type' IS NULL THEN 'Nema tipa'
      ELSE def ->> 'type'
    END AS type
  FROM all_definitions
)
SELECT
  type,
  COUNT(*) AS count
FROM normalized_definitions
GROUP BY type
ORDER BY count DESC;