import re
import sys
import pandas as pd

def multiple_dashes(row):
    word, descriptors, meaning = row["word"], row["descriptors"], row["meaning"]

    meaning = str(meaning)

    pattern = r'-'
    if re.search(pattern, meaning):
        print(word, " | - ", meaning)
        return True

    return False

def multiple_words(row):
    word, descriptors, meaning = row["word"], row["descriptors"], row["meaning"]

    meaning = str(meaning)

    pattern = r'(gl\.|im\.|prid\.|pril\.|vezn\.|uzv\.|prijed\.)'
    if re.search(pattern, meaning):
        print(word, descriptors, meaning)
        return True

    return False

def invalid_descriptor(row):
    word, descriptors, meaning = row["word"], row["descriptors"], row["meaning"]

    if pd.isna(descriptors):
        return False
    
    descriptors = str(descriptors)

    keywords = [
        'br\.', 'broj', 'gl\.', 'im\.', 'lič\. zamj\.', 'neodr\. zamj\.', 
        'neprom\. prid\.', 'odr\. zamj\.', 'pokaz\. zamj\.', 'poim\. prid\.', 
        'pom\. gl\.', 'prid\.', 'prij\.', 'prijed\.', 'pril\.', 'prisv\. prid\.', 
        'prisv\. zamj\.', 'red\. broj', 'riječca', 'up\. zamj\.', 'upit\. zamj\.', 
        'uzv\.', 'uzvik', 'vezn\.', 'vl\. im\.', 'zamj\.', 'zb\. im\.', 'zbir\. broj',
        'pref\.', 'skrać\.'
    ]
    
    pattern = r'^(%s)' % '|'.join(keywords)

    if not re.search(pattern, descriptors):
        print(word, descriptors, meaning)
        return True

    return False

if __name__ == "__main__":
    df = pd.read_csv('rjecnik_stage_01.csv', on_bad_lines='warn')

    sys.stdout = open('multiple_dashes.txt', 'w', encoding="utf-8")
    cleaned_df = df[df.apply(multiple_dashes, axis=1)]
    print(len(cleaned_df))

    sys.stdout = open('invalid_descriptor.txt', 'w', encoding="utf-8")
    cleaned_df = df[df.apply(invalid_descriptor, axis=1)]
    print(len(cleaned_df))

    sys.stdout = open('multiple_words.txt', 'w', encoding="utf-8")
    cleaned_df = df[df.apply(multiple_words, axis=1)]
    print(len(cleaned_df))

    sys.stdout.close()

