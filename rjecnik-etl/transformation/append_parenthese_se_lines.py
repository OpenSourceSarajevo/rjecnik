def append_parenthese_se_lines(file_path):
     with open(file_path, 'r', encoding="utf-8") as infile:
        lines = infile.readlines()

        processed_lines = []
        previous_line = None

        for line in lines:
            line = line.rstrip('\n')
            stripped_line = line.strip('"')

            if stripped_line.startswith('(se)') and previous_line is not None:
                previous_line += stripped_line
            else:
                if previous_line is not None:
                    processed_lines.append(f'"{previous_line}"\n')
                previous_line = stripped_line

        if previous_line is not None:
            processed_lines.append(f'"{previous_line}"\n')

        with open(file_path, 'w', encoding="utf-8") as outfile:
            outfile.writelines(processed_lines)

if __name__ == "__main__":
    file_path = 'rjecnik.csv'
    append_parenthese_se_lines(file_path)
    
    print("Data cleaned and saved to", file_path)