# Rječnik ETL

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

3. Convert the pdf file to word, excel or csv

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

### Manual Changes to CSV File

* [List of changes perfomed](./Changes.md)

```bash
python ./transofrmation/cleanup.py
```

```bash
python ./transofrmation/get_word_origin.py
```