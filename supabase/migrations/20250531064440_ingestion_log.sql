CREATE TABLE ingestion_log (
  id SERIAL PRIMARY KEY,
  source TEXT,
  url TEXT,
  text_hash TEXT NOT NULL,
  user_email TEXT,
  word_count INTEGER NOT NULL,
  new_word_count INTEGER NOT NULL,
  sentence_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (text_hash)
);