CREATE OR REPLACE FUNCTION search_words_ranked(
  search_term TEXT,
  limit_value INT,
  offset_value INT
)
RETURNS TABLE(id INT, headword VARCHAR, definitions JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.headword, w.definitions
  FROM words_v2 w
  WHERE search_term = '' OR w.headword ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE 
      WHEN w.headword = search_term THEN 0
      WHEN w.headword ILIKE search_term || '%' THEN 1
      ELSE 2
    END,
    w.headword
  LIMIT limit_value
  OFFSET offset_value;
END;
$$ LANGUAGE plpgsql;
