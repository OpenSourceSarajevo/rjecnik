import pandas as pd

from utils import is_bold, contains_numbers, extract_bold_text, read_pdf

begin_page=4
end_page=661

def pdf_to_excel(pdf_path, excel_path):
    data = read_pdf(pdf_path, begin_page, end_page)
    df = pd.DataFrame(data, columns=["Words"])
    df.to_excel(excel_path, index=False, engine='openpyxl')

if __name__ == "__main__":
    pdf_path = "rjecnik.pdf"
    excel_path = "rjecnik.xlsx"

    pdf_to_excel(pdf_path, excel_path)

    print(f"Converted {pdf_path} to {excel_path}")
        