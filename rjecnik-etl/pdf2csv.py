import pandas as pd

from utils import is_bold, contains_numbers, extract_bold_text, read_pdf

begin_page=4
end_page=661

def pdf_to_csv(pdf_path, csv_path):
    data = read_pdf(pdf_path, begin_page, end_page)
    print(data)
    df = pd.DataFrame(data, columns=["Words"])
    df.to_csv(csv_path, index=False, quoting=0)

if __name__ == "__main__":
    pdf_path = "rjecnik.pdf"
    csv_path = "rjecnik.csv"

    pdf_to_csv(pdf_path, csv_path)

    print(f"Converted {pdf_path} to {csv_path}")
        