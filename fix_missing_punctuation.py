#!/usr/bin/env python3
"""
Fix missing punctuation in puzzle.json definitions.
Adds a period (.) to definitions that don't end with proper punctuation.
"""

import json
import re


def needs_punctuation(definition):
    """
    Check if a definition needs punctuation added.
    Returns True if punctuation should be added, False otherwise.
    """
    # Strip whitespace
    definition = definition.strip()
    
    # If empty, skip
    if not definition:
        return False
    
    # Check if it already ends with punctuation
    if definition[-1] in '.!?:;':
        return False
    
    # Check for common abbreviations that shouldn't have a period added
    # (these already have their own period)
    abbreviations = ['etc.', 'e.g.', 'i.e.', 'vs.', 'Dr.', 'Mr.', 'Mrs.', 'Ms.', 
                    'Prof.', 'Jr.', 'Sr.', 'Ph.D.', 'M.D.', 'B.A.', 'M.A.', 
                    'B.S.', 'M.S.', 'U.S.', 'U.K.', 'U.N.', 'E.U.']
    
    for abbr in abbreviations:
        if definition.endswith(abbr):
            return False
    
    # Check if it ends with other abbreviations (pattern: capital letter followed by period)
    if re.search(r'[A-Z]\.$', definition):
        return False
    
    return True


def fix_missing_punctuation(input_file='puzzle.json', output_file='puzzle.json'):
    """
    Fix missing punctuation in puzzle.json definitions.
    """
    # Read the JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Statistics
    total_definitions = 0
    fixed_definitions = 0
    
    # Process each word entry
    for entry in data:
        if 'definitions' in entry and isinstance(entry['definitions'], list):
            for i, definition in enumerate(entry['definitions']):
                total_definitions += 1
                
                if needs_punctuation(definition):
                    # Add a period to the end
                    entry['definitions'][i] = definition.strip() + '.'
                    fixed_definitions += 1
                    print(f"Fixed: {entry['word']} - '{definition}' -> '{entry['definitions'][i]}'")
    
    # Write the updated JSON back to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print(f"\nSummary:")
    print(f"Total definitions processed: {total_definitions}")
    print(f"Definitions fixed: {fixed_definitions}")
    print(f"File saved: {output_file}")


if __name__ == "__main__":
    fix_missing_punctuation()