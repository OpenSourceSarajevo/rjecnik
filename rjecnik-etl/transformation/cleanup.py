import pandas as pd

from split_and_clean import split_and_clean
from get_word_origin import get_word_origin
from get_type import get_type_and_gender, is_imenica, is_glagol, is_pridjev, is_prilog, is_zamjenica, is_prijedlog, is_veznik, is_rijecca, is_uzvik, is_broj, has_no_type, is_prefiks, is_skracenica

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
    
    im_df = im_df.apply(get_type_and_gender, axis=1)
    im_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    im_df.to_csv("rjecnik_stage_03_im.csv", index=False)
    im_df_count = len(im_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_im.csv", im_df_count)

    gl_df = df[df['descriptors'].apply(is_glagol)]
    gl_df.columns = ['word', 'descriptors', 'meaning', 'origin']
    gl_df.to_csv("rjecnik_stage_03_gl.csv", index=False)
    gl_df_count = len(gl_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_gl.csv", gl_df_count)

    pril_df = df[df['descriptors'].apply(is_prilog)]
    pril_df = pril_df.apply(get_type_and_gender, axis=1)
    pril_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    pril_df.to_csv("rjecnik_stage_03_pril.csv", index=False)
    pril_df_count = len(pril_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_pril.csv", pril_df_count)

    prid_df = df[df['descriptors'].apply(is_pridjev)]
    prid_df = prid_df.apply(get_type_and_gender, axis=1)
    prid_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    prid_df.to_csv("rjecnik_stage_03_prid.csv", index=False)
    prid_df_count = len(prid_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_prid.csv", prid_df_count)

    zamj_df = df[df['descriptors'].apply(is_zamjenica)]
    zamj_df = zamj_df.apply(get_type_and_gender, axis=1)
    zamj_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    zamj_df.to_csv("rjecnik_stage_03_zamj.csv", index=False)
    zamj_df_count = len(zamj_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_zamj.csv", zamj_df_count)

    prijed_df = df[df['descriptors'].apply(is_prijedlog)]
    prijed_df = prijed_df.apply(get_type_and_gender, axis=1)
    prijed_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    prijed_df.to_csv("rjecnik_stage_03_prijed.csv", index=False)
    prijed_df_count = len(prijed_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_prijed.csv", prijed_df_count)

    broj_df = df[df['descriptors'].apply(is_broj)]
    broj_df = broj_df.apply(get_type_and_gender, axis=1)
    broj_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    broj_df.to_csv("rjecnik_stage_03_broj.csv", index=False)
    broj_df_count = len(broj_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_broj.csv", broj_df_count)

    vezn_df = df[df['descriptors'].apply(is_veznik)]
    vezn_df = vezn_df.apply(get_type_and_gender, axis=1)
    vezn_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    vezn_df.to_csv("rjecnik_stage_03_vezn.csv", index=False)
    vezn_df_count = len(vezn_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_vezn.csv", vezn_df_count)

    uzv_df = df[df['descriptors'].apply(is_uzvik)]
    uzv_df = uzv_df.apply(get_type_and_gender, axis=1)
    uzv_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    uzv_df.to_csv("rjecnik_stage_03_uzv.csv", index=False)
    uzv_df_count = len(uzv_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_uzv.csv", uzv_df_count)

    rijecca_df = df[df['descriptors'].apply(is_rijecca)]
    rijecca_df = rijecca_df.apply(get_type_and_gender, axis=1)
    rijecca_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    rijecca_df.to_csv("rjecnik_stage_03_rijecca.csv", index=False)
    rijecca_df_count = len(rijecca_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_rijecca.csv", rijecca_df_count)

    no_type_df = df[df['descriptors'].apply(has_no_type)]
    no_type_df.columns = ['word', 'descriptors', 'meaning', 'origin']
    no_type_df.to_csv("rjecnik_stage_03_no_type.csv", index=False)
    no_type_df_count = len(no_type_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_no_type.csv", no_type_df_count)

    pref_type_df = df[df['descriptors'].apply(is_prefiks)]
    pref_type_df = pref_type_df.apply(get_type_and_gender, axis=1)
    pref_type_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    pref_type_df.to_csv("rjecnik_stage_03_pref.csv", index=False)
    pref_type_df_count = len(pref_type_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_pref.csv", pref_type_df_count)

    skrac_type_df = df[df['descriptors'].apply(is_skracenica)]
    skrac_type_df = skrac_type_df.apply(get_type_and_gender, axis=1)
    skrac_type_df.columns = ['word', 'descriptors', 'meaning', 'origin', 'type', 'gender']
    skrac_type_df.to_csv("rjecnik_stage_03_skrac.csv", index=False)
    skrac_type_df_count = len(skrac_type_df)
    print("Data cleaned and saved to", "rjecnik_stage_03_skrac.csv", skrac_type_df_count)

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