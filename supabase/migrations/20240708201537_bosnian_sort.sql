CREATE COLLATION bosnian (
    provider = icu,
    locale = 'bs-Latn-BA-x-icu',
    deterministic = true
);

ALTER TABLE words
ALTER COLUMN word
SET DATA TYPE VARCHAR COLLATE bosnian;