import pandas as pd

from split_and_clean import split_and_clean
from get_word_origin import get_word_origin
from split_alternative_words import split_alternative_words
from get_type import get_type_and_gender, get_type_glagol, is_imenica, is_glagol, is_pridjev, is_prilog, is_zamjenica, is_prijedlog, is_veznik, is_rijecca, is_uzvik, is_broj, has_no_type, is_prefiks, is_skracenica
from get_forms import get_padezi, get_glagolsko_vrijeme

def set_forms_empty(row):
    return pd.Series([row["word"], row["descriptors"], row["meaning"], row["origin"], row["type"], row["gender"], row["alternative"], ""])

def process_and_save(data, file, get_type = get_type_and_gender, get_forms = None):
    data = data.apply(get_type, axis=1)
    data.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    
    data = data.apply(split_alternative_words, axis=1)
    data.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender', "alternative"]

    if get_forms is not None:
        data = data.apply(get_forms, axis=1)
    else:
        data = data.apply(set_forms_empty, axis=1)
    
    data.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender', "alternative", "forms"]

    data.to_csv(file, index=False)

    data_count = len(data)
    print("Data cleaned and saved to", file, data_count)
    return data_count

if __name__ == "__main__":
    # Stage 01
    df = pd.read_csv('rjecnik.csv', on_bad_lines='warn')

    cleaned_df = df['Words'].apply(split_and_clean)
    cleaned_df.columns = ['word', 'descriptors', 'meaning']

    cleaned_df.to_csv("rjecnik_stage_01.csv", index=False)

    print("Data cleaned and saved to", "rjecnik_stage_01.csv")

    # Stage 02
    df = pd.read_csv('rjecnik_stage_01.csv', on_bad_lines='warn')

    cleaned_df = df.apply(get_word_origin, axis=1)
    cleaned_df.columns = ['word', 'descriptors', 'meaning', 'origin']

    cleaned_df.to_csv("rjecnik_stage_02.csv", index=False)
    cleaned_df_count = len(cleaned_df)
    print("Data cleaned and saved to", "rjecnik_stage_02.csv", cleaned_df_count)

    # Stage 03
    df = pd.read_csv('rjecnik_stage_02.csv', on_bad_lines='warn')

    im_df = df[df['descriptors'].apply(is_imenica)]
    im_df_count = process_and_save(im_df, "rjecnik_stage_03_im.csv", get_forms=get_padezi)

    gl_df = df[df['descriptors'].apply(is_glagol)]
    gl_df_count = process_and_save(gl_df, "rjecnik_stage_03_gl.csv", get_type=get_type_glagol, get_forms=get_glagolsko_vrijeme)

    pril_df = df[df['descriptors'].apply(is_prilog)]
    pril_df_count = process_and_save(pril_df, "rjecnik_stage_03_pril.csv")

    prid_df = df[df['descriptors'].apply(is_pridjev)]
    prid_df_count = process_and_save(prid_df, "rjecnik_stage_03_prid.csv")

    zamj_df = df[df['descriptors'].apply(is_zamjenica)]
    zamj_df_count = process_and_save(zamj_df, "rjecnik_stage_03_zamj.csv", get_forms=get_padezi)

    prijed_df = df[df['descriptors'].apply(is_prijedlog)]
    prijed_df_count = process_and_save(prijed_df, "rjecnik_stage_03_prijed.csv")
    
    broj_df = df[df['descriptors'].apply(is_broj)]
    broj_df_count = process_and_save(broj_df, "rjecnik_stage_03_broj.csv", get_forms=get_padezi)

    vezn_df = df[df['descriptors'].apply(is_veznik)]
    vezn_df_count = process_and_save(vezn_df, "rjecnik_stage_03_vezn.csv")

    uzv_df = df[df['descriptors'].apply(is_uzvik)]
    uzv_df_count = process_and_save(uzv_df, "rjecnik_stage_03_uzv.csv")

    rijecca_df = df[df['descriptors'].apply(is_rijecca)]
    rijecca_df_count = process_and_save(rijecca_df, "rjecnik_stage_03_rijecca.csv")

    no_type_df = df[df['descriptors'].apply(has_no_type)]
    no_type_df.columns = ['word', 'descriptors', 'meaning', 'origin']
    no_type_df.to_csv("rjecnik_stage_03_no_type.csv", index=False)

    no_type_df = pd.read_csv('rjecnik_stage_03_no_type.csv', on_bad_lines='warn')
    no_type_df_count = process_and_save(no_type_df, "rjecnik_stage_03_no_type.csv")

    pref_type_df = df[df['descriptors'].apply(is_prefiks)]
    pref_type_df_count = process_and_save(pref_type_df, "rjecnik_stage_03_pref.csv")
    
    skrac_type_df = df[df['descriptors'].apply(is_skracenica)]
    skrac_type_df_count = process_and_save(skrac_type_df, "rjecnik_stage_03_skrac.csv")

    type_counts = [
        im_df_count,
        gl_df_count,
        prid_df_count,
        pril_df_count,
        prijed_df_count,
        uzv_df_count,
        vezn_df_count,
        rijecca_df_count,
        broj_df_count,
        zamj_df_count,
        no_type_df_count,
        pref_type_df_count
    ]
    type_count_sum = sum(type_counts)

    print("Total words: ", cleaned_df_count)
    print("Split sum: ", type_count_sum)
    print("Difference: ", cleaned_df_count - type_count_sum)