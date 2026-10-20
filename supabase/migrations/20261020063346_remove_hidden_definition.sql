UPDATE words_v2
SET definitions = (
  SELECT jsonb_agg(elem - 'hidden_definition' ORDER BY ord)
  FROM jsonb_array_elements(definitions) WITH ORDINALITY AS t(elem, ord)
)
WHERE jsonb_typeof(definitions) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(definitions) AS elem
    WHERE elem ? 'hidden_definition'
  );
