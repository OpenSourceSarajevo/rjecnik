import re
from PyPDF2 import PdfReader
import fitz

def is_bold(font):
    return font == "TimesNewRomanPS-BoldMT"

def contains_numbers(string):
    return re.search(r'\d', string)

def extract_bold_text(pdf_path, start_page, end_page):
    document = fitz.open(pdf_path)
    bold_text = {'A'} # Placeholder for python set

    for page_num in range(start_page, end_page):
        page = document.load_page(page_num)
        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if block['type'] == 0:  # Block contains text
                for line in block["lines"]:
                    for span in line["spans"]:
                        if is_bold(span["font"]) and not contains_numbers(span["text"]):
                            words = span['text'].split()
                            if words:
                                bold_text.add(words[0].strip())

    bold_text.remove("A")
    return bold_text

def read_pdf(file_path, start_page, end_page):
    
    paragraphs = []
    with open(file_path, 'rb') as file:
        reader = PdfReader(file)
        for page_num in range(start_page, end_page):
            bold_text = extract_bold_text(file_path, page_num, page_num + 1)
            
            page = reader.pages[page_num]
            text = page.extract_text()

            if text:
                lines = text.split('\n')
                entry = ""
                for line in lines:
                    if not contains_numbers(line):
                        words = line.split()

                        if words and words[0] in bold_text and entry:
                            bold_text.remove(words[0])
                            paragraphs.append(entry)
                            entry = ""
                        
                        entry += line.replace("\n", " ")
                            
                # Add last entry
                paragraphs.append(entry)
    
    return paragraphs