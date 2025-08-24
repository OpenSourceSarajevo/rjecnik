
CREATE TYPE word_processing_strategy AS ENUM (
    'Frequency Only', 
    'New Example', 
    'New Definition', 
    'New Form', 
    'Existing Form', 
    'New Headword', 
    'Ignore', 
    'Remove');

ALTER TABLE words_new
ADD COLUMN assigned_to text;

ALTER TABLE words_new
ADD COLUMN strategy word_processing_strategy NULL;