import re

def append_hyphened_lines(file_path):
     with open(file_path, 'r', encoding="utf-8") as infile:
        lines = infile.readlines()

        processed_lines = []

        for line in lines:
            line = line.rstrip('\n')
            stripped_line = line.strip('"')

            skip_words = ("domali", "nitrat", "omaći", "oročiti", "ukovati")
            if any(stripped_line.startswith(word) for word in skip_words):
                continue
        
            patterns = [
                r'(.*\bprid\..*?[\s.])(\b\w+[/\w]*\s+pril\..*)',
                r'(.*\bprid\..*?[\s.])(\b\w+\s+im\..*)',
                r'(.*\bim\..*?[\s\.])(\b\w+\s+im\..*)',
                r'(.*\bgl\..*?[\s\.])(\b\w+\s+im\..*)',
                r'(.*\bim\..*?[\s\.])(\b\w+\s+prid\..*)',
                r'(.*\bgl\..*?[\s\.])(\b\w+\s+gl\..*)',
                r'(.*\bprid\..*?[\s\.])(\b\w+\s+prid\..*)',
                r'(.*\bim\..*?[\s\.])(\b\w+\s+gl\..*)',
                r'(.*\bpril\..*?[\s\.])(\b\w+\s+prid\..*)',
                r'(.*\bpril\..*?[\s\.])(\b\w+\s+im\..*)',
                r'(.*\bgl\..*?[\s\.])(\b\w+\s+prid\..*)',
                r'(.*\bgl\..*?[\s\.])(\b\w+\s+pril\..*)',
                r'(.*\bpril\..*?[\s\.])(\b\w+\s+gl\..*)',
                r'(.*\bim\..*?[\s\.])(\b\w+\s+pril\..*)',
            ]

            matched = False
            for pattern in patterns:
                match = re.search(pattern, stripped_line)
                if match:
                    part1 = match.group(1).strip()  
                    part2 = match.group(2).strip()
                    
                    print(part1)
                    print(part2)
                    processed_lines.append(f'"{part1}"\n')
                    processed_lines.append(f'"{part2}"\n')
                    matched = True
                    break
            
            if not matched:
                processed_lines.append(f'"{stripped_line}"\n')

        with open(file_path, 'w', encoding="utf-8") as outfile:
            outfile.writelines(processed_lines)

if __name__ == "__main__":
    file_path = 'rjecnik.csv'
    append_hyphened_lines(file_path)

    print("Data cleaned and saved to", file_path)