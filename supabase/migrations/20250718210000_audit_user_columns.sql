ALTER TABLE words_v2
ADD COLUMN created_by text,
ADD COLUMN updated_by text;

ALTER TABLE words_new
RENAME COLUMN inserted_at TO created_at;
ALTER TABLE words_new
ADD COLUMN created_by text;

ALTER TABLE ingestion_log
ADD COLUMN created_by text;
