#!/usr/bin/env python3
"""
Script to fix formatting issues in puzzle.json:
1. Add missing spaces after punctuation (., , : ;) when followed by a letter
2. Replace multiple consecutive spaces with single spaces  
3. Fix common typos: "adn" → "and", "teh" → "the", "taht" → "that"
"""

import json
import re
import sys


def fix_punctuation_spacing(text):
    """Add space after punctuation marks when followed directly by a letter."""
    # Pattern to match punctuation followed directly by a letter
    # Negative lookbehind to avoid matching decimal numbers like 3.50
    pattern = r'(?<!\d)([.,:;])([a-zA-Z])'
    
    # Replace with punctuation + space + letter
    fixed = re.sub(pattern, r'\1 \2', text)
    
    # Fix cases like ". W" at end of line (trailing single letter that should be attached)
    fixed = re.sub(r'\. ([A-Z])$', r'.\1', fixed)
    
    return fixed


def fix_multiple_spaces(text):
    """Replace multiple consecutive spaces with single space."""
    return re.sub(r'  +', ' ', text)


def fix_common_typos(text):
    """Fix common typos."""
    # Word boundary ensures we only match whole words
    typo_map = {
        r'\badn\b': 'and',
        r'\bteh\b': 'the', 
        r'\btaht\b': 'that'
    }
    
    for typo, correction in typo_map.items():
        text = re.sub(typo, correction, text, flags=re.IGNORECASE)
    
    return text


def process_text(text):
    """Apply all formatting fixes to a text string."""
    # Apply fixes in order
    text = fix_punctuation_spacing(text)
    text = fix_multiple_spaces(text)
    text = fix_common_typos(text)
    
    return text


def process_puzzle_data(data):
    """Process the puzzle data structure, fixing formatting in all text fields."""
    for entry in data:
        # Process definitions
        if 'definitions' in entry:
            entry['definitions'] = [process_text(defn) for defn in entry['definitions']]
        
        # Process examples
        if 'examples' in entry:
            entry['examples'] = [process_text(example) for example in entry['examples']]
        
        # Process any other text fields that might exist
        for key in ['word', 'synonyms', 'antonyms']:
            if key in entry:
                if isinstance(entry[key], list):
                    entry[key] = [process_text(item) for item in entry[key]]
                elif isinstance(entry[key], str):
                    entry[key] = process_text(entry[key])
    
    return data


def main():
    """Main function to process puzzle.json file."""
    input_file = 'puzzle.json'
    
    try:
        # Read the JSON file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Process the data
        processed_data = process_puzzle_data(data)
        
        # Write back to the same file
        with open(input_file, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully processed {input_file}")
        print("Formatting fixes applied:")
        print("- Added spaces after punctuation marks")
        print("- Replaced multiple spaces with single spaces")
        print("- Fixed common typos (adn→and, teh→the, taht→that)")
        
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()