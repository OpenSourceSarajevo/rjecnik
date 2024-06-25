import pandas as pd

origin_mapping = {
    'tur': 'turski',
    'ar': 'arapski',
    'lat': 'latinski',
    'grč': 'grčki',
    'fr': 'francuski',
    'engl': 'engleski',
    'njem': 'njemački',
    'crkv': 'crkveno',
    'csl': 'crkvenoslavenski',
    'mađ': 'mađarski',
    'hebr': 'hebrejski',
    'perz': 'perzijski',
    'šp': 'španski',
    'peruan': 'peruanski',
    'rus': 'ruski',
    'prasl': 'pravoslavenski',
    'stsl': 'staroslavenski',
    'šved': 'švedski',
    'tal': 'talijanski',
    'sanskrt': 'sanskirt',
    'nlat': 'novolatisnki',
    'malaj': 'malajski',
    'haić': 'haićanski',
    'slav': 'slavenski',
    "alb": "albanski",
    "rum": "rumunski",
    "hrv": "hrvatski",
    "mlet": "mletački",
    "kelt": "keltski"
}

def get_word_origin(row):
    try:
        word, descriptors, meaning = row["word"], row["descriptors"], row["meaning"]

        if pd.isna(descriptors):
            return pd.Series([word, descriptors, meaning, ''])
    
        origin_matches = []
        for abbr in origin_mapping:
            abbr_dot_front = "." + abbr
            abbd_dot_back = abbr + "."
            if abbr_dot_front in descriptors or abbd_dot_back in descriptors:
                origin_matches.append(abbr)
                descriptors = descriptors.replace(abbr, '').strip()
                descriptors = descriptors.replace('(.)', '')
                descriptors = descriptors.replace('( .)', '')


        origins_full_words = []
        for abbr in origin_matches:
            if abbr in origin_mapping:
                origins_full_words.append(origin_mapping[abbr])
            else:
                origins_full_words.append(abbr)

        origin = ', '.join(origins_full_words)
       
    except ValueError:
        word, descriptors, meaning, origin = row["word"], row["descriptors"], row["meaning"], ''
    return pd.Series([word, descriptors, meaning, origin])