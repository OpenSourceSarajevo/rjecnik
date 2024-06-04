import re

def format_alfabet_letters(file_path):
    with open(file_path, 'r', encoding="utf-8") as infile:
        lines = infile.readlines()

        processed_lines = []

        for line in lines:
            line = line.rstrip('\n')
            stripped_line = line.strip('"')

            pattern = re.compile(r'^\b([A-Z])\s([a-z])\b')
            # Replace the pattern with CapitalLetter/LowercaseLetter
            formatted_text = pattern.sub(r'\1/\2', stripped_line)

            processed_lines.append(f'"{formatted_text}"\n')

        with open(file_path, 'w', encoding="utf-8") as outfile:
            outfile.writelines(processed_lines)

def remove_single_letters(file_path):
    with open(file_path, 'r', encoding="utf-8") as infile:
        lines = infile.read()

        pattern = re.compile(r'^"[A-Z]"$\n', re.MULTILINE)

        # Remove lines matching the pattern
        modified_content = pattern.sub('', lines)

        with open(file_path, 'w', encoding="utf-8") as outfile:
            outfile.writelines(modified_content)

if __name__ == "__main__":
    file_path = 'rjecnik.csv'
    format_alfabet_letters(file_path)
    remove_single_letters(file_path)

    print("Data cleaned and saved to", file_path)