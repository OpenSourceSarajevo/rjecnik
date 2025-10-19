UPDATE words_v2
SET definitions = (
  SELECT jsonb_agg(
           elem || jsonb_build_object('definition', '')
         )
  FROM jsonb_array_elements(definitions) elem
);