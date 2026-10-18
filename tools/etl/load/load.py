import os
import json
import re
from dotenv import load_dotenv
from supabase import create_client

import pandas as pd

def parse_string_to_dict(data):
    dict_data = {}
    # Regex to find top-level key-value pairs
    top_level_pattern = r'(\w+):\s*{([^}]*)}'
    top_level_matches = re.findall(top_level_pattern, data)
    
    if top_level_matches:
        for key, value in top_level_matches:
            sub_dict = {}
            # Regex to find sub-level key-value pairs
            sub_level_pattern = r'(\w+):\s*([\w]+)'
            sub_level_matches = re.findall(sub_level_pattern, value)
            for sub_key, sub_value in sub_level_matches:
                sub_dict[sub_key] = sub_value
            dict_data[key] = sub_dict
    else:
        # Handle simple key-value pairs
        simple_pattern = r'(\w+):\s*([\w]+)'
        simple_matches = re.findall(simple_pattern, data)
        for key, value in simple_matches:
            dict_data[key] = value
    
    return dict_data

def get_json(string):
    # Remove the square brackets and trim whitespace
    trimmed_data = string.strip("[]").strip()

    dict_data = parse_string_to_dict(trimmed_data)

    json_data = json.dumps(dict_data, ensure_ascii=False)
    return [json_data]

def load(row, supabase):
    word, descriptors, meaning, origin, type, gender, alternative, forms = row["word"], row["descriptors"], row["meaning"], row["origin"], row["type"], row["gender"], row["alternative"], row["forms"]

    descriptors = descriptors if not pd.isna(descriptors) else None
    meaning = meaning if not pd.isna(meaning) else None
    origin = [o.strip() for o in origin.split(",")] if not pd.isna(origin) else None
    alternative = [a.strip() for a in alternative.split(",")] if not pd.isna(alternative) else None
    gender = gender if not pd.isna(gender) else None
    type = type if not pd.isna(type) else None
    forms = get_json(forms) if not pd.isna(forms) else None
    
    try:
        _ = (
            supabase.table("words")
                .insert([{
                    "word": word, 
                    "meaning": meaning,
                    "origin": origin,
                    "type": type,
                    "gender": gender,
                    "alternative": alternative,
                    "forms": forms,
                    "descriptors": descriptors
                }])
                .execute()
        )

        return False
    except Exception as e:
        print(word, e)
        return True


if __name__ == "__main__":
    load_dotenv()

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)

    files = [
        'rjecnik_stage_03_broj.csv',
        'rjecnik_stage_03_gl.csv',
        'rjecnik_stage_03_im.csv',
        'rjecnik_stage_03_no_type.csv',
        'rjecnik_stage_03_pref.csv',
        'rjecnik_stage_03_prid.csv',
        'rjecnik_stage_03_prijed.csv',
         'rjecnik_stage_03_pril.csv',
         'rjecnik_stage_03_rijecca.csv',
         'rjecnik_stage_03_skrac.csv',
         'rjecnik_stage_03_uzv.csv',
         'rjecnik_stage_03_vezn.csv',
         'rjecnik_stage_03_zamj.csv'
    ]

    dfs = []
    for file in files:
        df = pd.read_csv(file, on_bad_lines='warn')
        dfs.append(df)

    data = pd.concat(dfs, ignore_index=True)
    data.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender', "alternative", "forms"]
    data.to_csv("load.csv", index=False)

    data = data[data.apply(load, supabase=supabase, axis=1)]
    data.to_csv("error.csv", index=False)

