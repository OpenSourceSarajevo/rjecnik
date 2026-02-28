CREATE TABLE words_ignore (
  id SERIAL PRIMARY KEY,
  headword TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'ostalo',
  inserted_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
