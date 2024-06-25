import re
import pandas as pd

def split_and_clean(row):
    try:
        row = row.strip()
        row = re.sub(r'\b(\w+)-(\w+)\b', r'\1\2', row)

        # Use pattern to replace dashes and spaces in word origins so they dont get split up, e.g
        # (ar. - tur.) -> (ar.tur)
        # (ar.- tur.) -> (ar.tur)
        # (ar. -tur.) -> (ar.tur)
        row = re.sub(r'\(\b(\w+.)\s*-\s*(\w+.)\b.\)', r'\1\2', row)

        pattern = re.compile(r'^\w+(\/\w+)* \(se\)\s*')
    
        if pattern.match(row):
            parts = re.split(r'(\w+ \(se\)\s*)', row, maxsplit=1)
            word, rest = [parts[0] + parts[1], parts[2]]
        else:
            word, rest = re.split(r' ', row, maxsplit=1)
        
        split_pattern = re.split(r' - |-', rest, 1)
        
        if len(split_pattern) == 2:
            descriptors, meaning = split_pattern
        else:
            descriptors, meaning = split_pattern[0], ''

        meaning = meaning.rstrip('.,;')

    except ValueError:
        word, descriptors, meaning = row, '', ''
    return pd.Series([word.strip(), descriptors.strip(), meaning.strip()])