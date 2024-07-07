import re
import pandas as pd


gender_mapping = {
    'm. r.': 'muški',
    'ž. r.': 'ženski',
    's. r.': 'srednji'
}

type_mapping = {
    'im.': 'imenica',
    'gl. im.': 'glagolska imenica',
    'zb. im.': 'zbirna imenica',
    'vl. im.': 'vlastita imenica',
    'br.': 'broj',
    'broj': 'broj',
    'lič. zamj.': 'lična zamjenica',
    'neodr. zamj.': 'neodređena zamjenica',
    'odr. zamj.': 'određena zamjenica',
    'neprom. prid.': 'nepromjenjivi pridjev',
    'pokaz. zamj.': 'pokazna zamjenica',
    'pom. gl.': 'pomočni glagol',
    'prid.': 'pridjev',
    'prij.': 'prijedlog',
    'prijed.': 'prijedlog',
    'pril.': 'prilog',
    'prisv. prid.': 'prisvojni pridjev',
    'prisv. zamj.': 'prisvojna zamjenica',
    'red. broj': 'redni broj',
    'riječca': 'riječca',
    'up. zamj.': 'upitna zamjenica',
    'upit. zamj.': 'upitna zamjenica',
    'uzv.': 'uzvik',
    'uzvik': 'uzvik',
    'vezn.': 'veznik',
    'zamj.': 'zamjenik',
    'zbir. broj': 'zbirni broj',
    'pref.': 'prefiks',
    'skrać': 'skraćenica',
    'poim\. prid\.': 'poimenični pridjev'
}

def is_imenica(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(gl\. im\.|im\.|zb\. im\.|vl\. im\.)'
    return bool(re.match(pattern, descriptors))

def get_type_and_gender(row):
    word, descriptors, meaning, origin = row["word"], row["descriptors"], row["meaning"], row["origin"]

    if pd.isna(descriptors):
        return pd.Series([word, descriptors, meaning, origin, '', ''])
    
    descriptors = descriptors.strip()
    
    gender = ''
    for abbr in gender_mapping:
        if abbr in descriptors or abbr in descriptors:
            gender = gender_mapping[abbr]
            descriptors = descriptors.replace(abbr, '').strip()

    type = ''
    for abbr in type_mapping:
        if descriptors.startswith(abbr):
            type = type_mapping[abbr]
            descriptors = descriptors.replace(abbr, '').strip()

    return pd.Series([word, descriptors, meaning, origin, type, gender])


def get_type_glagol(row):
    word, descriptors, meaning, origin = row["word"], row["descriptors"], row["meaning"], row["origin"]

    if pd.isna(descriptors):
        return pd.Series([word, descriptors, meaning, origin, '', ''])

    return pd.Series([word, descriptors, meaning, origin, "glagol", ""])


def is_pridjev(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(prid.|poim\. prid\.|neprom\. prid\.|prisv\. prid\.)'
    return bool(re.match(pattern, descriptors))

def is_prilog(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(pril.)'
    return bool(re.match(pattern, descriptors))

def is_glagol(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(gl\.(?! im\.)|pom\. gl\.)'
    return bool(re.match(pattern, descriptors))

def is_zamjenica(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(zamj\.|lič\. zamj\.|upit\. zamj\.|neodr\. zamj\.|prisv\. zamj\.|odr\. zamj\.|pokaz\. zamj\.|up\. zamj\.)'
    return bool(re.match(pattern, descriptors))

def is_prijedlog(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(prijed\.|prij\.)'
    return bool(re.match(pattern, descriptors))

def is_broj(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(broj|red\. broj|zbir\. broj|br\.)'
    return bool(re.match(pattern, descriptors))

def is_uzvik(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(uzv\.|uzvik)'
    return bool(re.match(pattern, descriptors))

def is_veznik(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(vezn\.)'
    return bool(re.match(pattern, descriptors))

def is_rijecca(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(riječca)'
    return bool(re.match(pattern, descriptors))

def has_no_type(descriptors):
    return pd.isna(descriptors)

def is_prefiks(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(pref\.)'
    return bool(re.match(pattern, descriptors))

def is_skracenica(descriptors):
    if pd.isna(descriptors):
        return False
    descriptors = str(descriptors)

    pattern = r'^(skrać\.)'
    return bool(re.match(pattern, descriptors))