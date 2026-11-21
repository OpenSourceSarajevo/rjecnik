-- Activity log of dictionary words: one row per word created or edited, for the admin dashboard.
-- words_v2.updated_at only keeps the latest edit, which loses history for past date ranges.

CREATE TABLE word_activity (
  id BIGSERIAL PRIMARY KEY,
  word_id INT NOT NULL REFERENCES words_v2 (id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'edited')),
  changed_by TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX word_activity_changed_at_idx ON word_activity (changed_at);

ALTER TABLE word_activity ENABLE ROW LEVEL SECURITY;

-- Written only by the trigger below (SECURITY DEFINER), read by editors
CREATE POLICY "Enable read for users with Dictionary.ReadWrite"
ON word_activity
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'user_permission') = 'Dictionary.ReadWrite');

-- Columns whose changes are not edits: bookkeeping, scores and counts from text ingestion
CREATE OR REPLACE FUNCTION word_activity_content(word JSONB)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT word - ARRAY[
    'created_at', 'created_by', 'updated_at', 'updated_by',
    'quality', 'quality_breakdown', 'frequency'
  ]
$$;

CREATE OR REPLACE FUNCTION words_v2_log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND word_activity_content(to_jsonb(NEW)) = word_activity_content(to_jsonb(OLD)) THEN
    RETURN NULL;
  END IF;

  INSERT INTO word_activity (word_id, action, changed_by)
  VALUES (
    NEW.id,
    CASE TG_OP WHEN 'INSERT' THEN 'created' ELSE 'edited' END,
    -- The signed-in editor; scripts using the service role have no email, so use the row's columns
    coalesce(
      auth.jwt() ->> 'email',
      CASE TG_OP WHEN 'INSERT' THEN NEW.created_by ELSE NEW.updated_by END
    )
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER words_v2_log_activity
AFTER INSERT OR UPDATE ON words_v2
FOR EACH ROW EXECUTE FUNCTION words_v2_log_activity();

-- Backfill from the timestamps on the words: every creation, and the latest edit of each word
-- (earlier edits were never recorded). The columns hold UTC without a time zone.
INSERT INTO word_activity (word_id, action, changed_by, changed_at)
SELECT id, 'created', created_by, created_at AT TIME ZONE 'UTC'
FROM words_v2
WHERE created_at IS NOT NULL;

INSERT INTO word_activity (word_id, action, changed_by, changed_at)
SELECT id, 'edited', updated_by, updated_at AT TIME ZONE 'UTC'
FROM words_v2
WHERE updated_at > created_at + INTERVAL '1 second';

-- New words, edited words and changes in [start_at, end_at)
CREATE OR REPLACE FUNCTION word_activity_stats(start_at TIMESTAMPTZ, end_at TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  WITH period AS (
    SELECT * FROM word_activity WHERE changed_at >= start_at AND changed_at < end_at
  ),
  counts AS (
    SELECT
      count(*) FILTER (WHERE action = 'created') AS new_words,
      count(DISTINCT word_id) FILTER (WHERE action = 'edited') AS edited_words
    FROM period
  )
  SELECT jsonb_build_object(
    'new_words', new_words,
    'edited_words', edited_words,
    'total_changes', new_words + edited_words,
    -- Ranges shorter than a day count as one day
    'average_daily_changes', round(
      (new_words + edited_words) / greatest(extract(epoch FROM end_at - start_at) / 86400, 1),
      1
    )
  )
  FROM counts
$$;

REVOKE EXECUTE ON FUNCTION word_activity_stats(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION word_activity_stats(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
