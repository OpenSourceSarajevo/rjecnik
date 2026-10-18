import re


def remove_apostrophe_from_beginning(file_path):
    with open(file_path, 'r', encoding="utf-8") as infile:
        lines = infile.readlines()

        processed_lines = []

        for line in lines:
            line = line.rstrip('\n')
            stripped_line = line.strip('"')

            if stripped_line.startswith("'"):
                stripped_line = stripped_line[1:]  # Remove the leading single quote
            processed_lines.append(f'"{stripped_line}"\n')

        with open(file_path, 'w', encoding="utf-8") as outfile:
            outfile.writelines(processed_lines)

if __name__ == "__main__":
    file_path = 'rjecnik.csv'
    remove_apostrophe_from_beginning(file_path)

    print("Data cleaned and saved to", file_path)