import re
import json
import os

def parse_readme(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split content by "### " which seems to denote questions based on the view_file output
    # The first split might be empty or contain header info, so we skip it if it doesn't look like a question
    sections = re.split(r'\n### ', content)
    
    questions = []
    
    # Regex to find the question ID from the table of contents or just auto-increment
    # The view_file showed questions starting with "### " followed by the question text.
    # Options are lines starting with "- [ ]" or "- [x]"
    
    for section in sections:
        if not section.strip():
            continue
            
        lines = section.strip().split('\n')
        question_text_lines = []
        options = []
        correct_answers = []
        images = []
        
        is_question_part = True
        
        for line in lines:
            line = line.strip()
            
            # Check for images
            img_match = re.search(r'!\[.*?\]\((.*?)\)', line)
            if img_match:
                images.append(img_match.group(1))
            
            # Check for options
            if line.startswith('- [ ]') or line.startswith('- [x]'):
                is_question_part = False
                option_text = line[5:].strip()
                options.append(option_text)
                if line.startswith('- [x]'):
                    correct_answers.append(option_text)
            elif line.startswith('**[⬆ Back to Top]'):
                break
            elif is_question_part:
                # Ignore empty lines at the start
                if not question_text_lines and not line:
                    continue
                question_text_lines.append(line)

        if options:
            question_text = '\n'.join(question_text_lines).strip()
            
            # Determine type
            q_type = "Multiple Choice" if len(correct_answers) > 1 else "Single Choice"
            
            questions.append({
                "id": len(questions) + 1,
                "question": question_text,
                "options": options,
                "answer": correct_answers,
                "type": q_type,
                "images": images
            })

    return questions

def main():
    readme_path = 'README.md'
    if not os.path.exists(readme_path):
        print(f"Error: {readme_path} not found.")
        return

    questions = parse_readme(readme_path)
    
    with open('questions.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2)
    
    print(f"Successfully extracted {len(questions)} questions to questions.json")

if __name__ == "__main__":
    main()
