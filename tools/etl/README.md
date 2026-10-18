# Rječnik ETL


> [!NOTE] 
> This project is a collection of scripts used to extract, clean, and load the initial data. Along side VSCode Regex/Replace option they were written to minimize the manual work needed to be performed on the data set. It served its purpose and trying to use it to recreate the loaded data would waste your time. 


### Prerequisites
- [Python 3.9+](https://www.python.org/downloads)

1. Install python requirements:

```bash
py -m pip install -r requirements.txt
```

```bash
python -m pip install -r requirements.txt
```

2. Download the pdf file

* [Rječnik bosanskog jezika - Institut za jezik Sarajevo 2007](https://archive.org/details/RjenikBosanskogJezikaInstitutZaJezikSarajevo2007.)

## Data Extraction:

```bash
python ./extration/pdf2word.py
```

```bash
python ./extration/pdf2excel.py
```

```bash
python ./extration/pdf2csv.py
```

## Data Transofrmations:

```bash
python ./transofrmation/append_hyphened_lines.py
```

```bash
python ./transofrmation/append_parenthese_se_lines.py
```

```bash
python ./transofrmation/format_alfabet.py
```

```bash
python ./transofrmation/remove_apostrophe.py
```

```bash
python ./transofrmation/cleanup.py
```

* Before running the cleanup script allot of manual changes needed to be performed 

## Data Load:

```bash
python ./load/load.py
```