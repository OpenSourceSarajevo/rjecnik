CREATE TABLE words_new (
  id SERIAL PRIMARY KEY,
  headword TEXT NOT NULL,
  examples TEXT[] NOT NULL,
  count INTEGER NOT NULL,
  is_new BOOLEAN NOT NULL DEFAULT true,
  inserted_at TIMESTAMP DEFAULT now()
);