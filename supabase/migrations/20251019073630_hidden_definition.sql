UPDATE words_v2
SET definitions = (
  SELECT jsonb_agg(
           elem - 'definition' || jsonb_build_object('hidden_definition', elem->'description')
         )
  FROM jsonb_array_elements(definitions) AS elem
)