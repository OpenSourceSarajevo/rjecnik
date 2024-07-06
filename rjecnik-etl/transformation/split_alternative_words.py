import re
import pandas as pd

def split_alternative_words(row):
    word = row["word"]

    origin = row.get("origin")
    origin = origin if not pd.isna(origin) else ""
    
    type = row.get("type")
    type = type if not pd.isna(type) else ""

    gender = row.get("gender")
    gender = gender if not pd.isna(gender) else ""

    alternative_words = ""
    words_to_ignore = ["A/a", "B/b", "C/c", "Č/č", 
                       "Ć/ć", "D/d", "Đ/đ", "Dž/dž",
                       "E/e", "F/f", "G/g", "H/h", 
                       "I/i", "J/j", "K/k", "L/l", 
                       "Lj/lj", "M/m", "N/n", "Nj/nj", 
                       "O/o", "P/p", "R/r", "S/s", "Š/š",
                       "T/t", "U/u", "V/v", "Z/z", "Ž/ž"]
    
    if word in words_to_ignore:
        return pd.Series([word, row["descriptors"], row["meaning"], origin, type, gender, alternative_words])

    if re.search("/", word):
        alternatives = word.split("/")
        word = alternatives[0]
        alternatives = set(alternatives)

        alternatives.remove(word)
        alternatives = list(alternatives)

        alternative_words = ",".join(alternatives)
        

    return pd.Series([word, row["descriptors"], row["meaning"], origin, type, gender, alternative_words])