from docx import Document

from utils import is_bold, contains_numbers, extract_bold_text, read_pdf

begin_page=4
end_page=661

def pdf_to_word(pdf_path, word_path):
    paragraphs = read_pdf(pdf_path, begin_page, end_page)
    
    doc = Document()
    for paragraph in paragraphs:
        doc.add_paragraph(paragraph)
    doc.save(word_path)
    

if __name__ == "__main__":
    pdf_path = "rjecnik.pdf"
    word_path = "rjecnik.docx"

    pdf_to_word(pdf_path, word_path)
    
    print(f"Converted {pdf_path} to {word_path}")
        