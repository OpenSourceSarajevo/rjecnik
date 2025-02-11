CREATE TABLE words_v2 (
    id SERIAL PRIMARY KEY,
    headword TEXT UNIQUE NOT NULL,
    origins TEXT[],
    definitions JSONB NOT NULL,
    forms JSONB NULL,
    alternatives TEXT[],
    synonyms TEXT[],
    antonyms TEXT[],
    frequency INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE words_v2
ALTER COLUMN headword
SET DATA TYPE VARCHAR COLLATE bosnian;