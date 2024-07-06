import re
import pandas as pd

def get_padezi(row):
    word, descriptors, meaning, origin, type, gender, alterantiv = row["word"], row["descriptors"], row["meaning"], row["origin"], row["type"], row["gender"], row["alternative"]

    patterns = {
        'jednina': {
            'genitiv': r'g\. jd\.\s*([^ ,.]*)',
            'dativ': r'dat\. jd\.\s*([^ ,.]*)',
            'lokativ': r'lok\. jd\.\s*([^ ,.]*)',
            'instrumental': r'instr\. jd\.\s*([^ ,.]*)',
            "vokativ": r'v\. jd\.\s*([^ ,.]*)',
            "akuzativ": r'ak\. jd\.\s*([^ ,.]*)',
            'dat.instr.lok.': r'dat\.instr\.lok\. jd\.\s*([^ ,.]*)',
            'dat.lok.': r'dat\.lok\. jd\.\s*([^ ,.]*)',
            'instr.lok.': r'\sinstr\.lok\. jd\.\s*([^ ,.]*)',
        },
        'mnozina': {
            "nominativ": r'n\. mn\.\s*([^ ,.]*)',
            'genitiv': r'g\. mn\.\s*([^ ,.]*)',
            'dativ': r'dat\. mn\.\s*([^ ,.]*)',
            'lokativ': r'lok\. mn\.\s*([^ ,.]*)',
            'instrumental': r'instr\. mn\.\s*([^ ,.]*)',
            "vokativ": r'v\. mn\.\s*([^ ,.]*)',
            "akuzativ": r'ak\. mn\.\s*([^ ,.]*)',
            'dat.instr.lok.': r'dat\.instr\.lok\. mn\.\s*([^ ,.]*)',
            'dat.lok.': r'dat\.lok\. mn\.\s*([^ ,.]*)',
            'instr.lok.': r'\sinstr\.lok\. mn\.\s*([^ ,.]*)',
        }
    }  

    results = {
        'jednina': {},
        'mnozina': {}
    } 

    results["jednina"]["nominativ"] = word
    
    # Process matches for both jednina and mnozina
    for form, pattern_dict in patterns.items():
        for case, pattern in pattern_dict.items():
            matches = re.findall(pattern, descriptors)
            for match in matches:
                if case == 'dat.instr.lok.':
                    results[form]["dativ"] = match
                    results[form]["instrumental"] = match
                    results[form]["lokativ"] = match
                elif case == 'dat.lok.':
                    results[form]["dativ"] = match
                    results[form]["lokativ"] = match
                elif case == 'instr.lok.':
                    results[form]["instrumental"] = match
                    results[form]["lokativ"] = match
                else:
                    results[form][case] = match

    formatted_result = []
    
    if results['jednina']:
        properties = [f'{case}: {word}' for case, word in results['jednina'].items() if word != '']
        formatted_result.append(f'jednina: {{ {", ".join(properties)} }}')

    if results['mnozina']:
        properties = [f'{case}: {word}' for case, word in results['mnozina'].items() if word != '']
        formatted_result.append(f'mnozina: {{ {", ".join(properties)} }}')

    forms = '[ ' + ', '.join(f'{item}' for item in formatted_result) + ' ]'

    return pd.Series([word, descriptors, meaning, origin, type, gender, alterantiv, forms])

def get_glagolsko_vrijeme(row):
    word, descriptors, meaning, origin, type, gender, alterantiv = row["word"], row["descriptors"], row["meaning"], row["origin"], row["type"], row["gender"], row["alternative"]

    patterns = {
        'prezent': r'prez\.\s*([^ ,.]*)',
        'imperativ': r'imp\.\s*([^ ,.]*)',
        'imperfekt': r'impf\.\s*([^ ,.]*)',
    }  

    results = {} 
    
    # Process matches for both jednina and mnozina
    for case, pattern in patterns.items():
        matches = re.findall(pattern, descriptors)
        for match in matches:
            results[case] = match
    
    if not results:
        return pd.Series([word, descriptors, meaning, origin, type, gender, alterantiv, ""])
    
    formatted_result = ', '.join([f'{case}: {word}' for case, word in results.items()])
    forms = f'[ {{{formatted_result}}} ]'

    return pd.Series([word, descriptors, meaning, origin, type, gender, alterantiv, forms])