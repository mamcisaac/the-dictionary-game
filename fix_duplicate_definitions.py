#!/usr/bin/env python3
"""
Script to identify and fix duplicate definitions in puzzle.json
"""

import json
from collections import OrderedDict


def find_and_fix_duplicate_definitions(data):
    """
    Find words with duplicate definitions and remove duplicates.
    Returns the cleaned data and a report of changes.
    """
    words_with_duplicates = []
    
    for entry in data:
        word = entry['word']
        original_definitions = entry['definitions']
        
        # Use OrderedDict to preserve order while removing duplicates
        seen = OrderedDict()
        unique_definitions = []
        
        for definition in original_definitions:
            if definition not in seen:
                seen[definition] = True
                unique_definitions.append(definition)
        
        # Check if there were duplicates
        if len(unique_definitions) < len(original_definitions):
            duplicate_count = len(original_definitions) - len(unique_definitions)
            words_with_duplicates.append({
                'word': word,
                'original_count': len(original_definitions),
                'unique_count': len(unique_definitions),
                'duplicates_removed': duplicate_count
            })
            
            # Update the entry with unique definitions
            entry['definitions'] = unique_definitions
    
    return data, words_with_duplicates


def main():
    # Read the puzzle.json file
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    print(f"Total words in puzzle.json: {len(data)}")
    print("Scanning for duplicate definitions...\n")
    
    # Find and fix duplicates
    cleaned_data, report = find_and_fix_duplicate_definitions(data)
    
    # Print report
    if report:
        print(f"Found {len(report)} word(s) with duplicate definitions:\n")
        for item in report:
            print(f"  - {item['word']}:")
            print(f"    Original definitions: {item['original_count']}")
            print(f"    Unique definitions: {item['unique_count']}")
            print(f"    Duplicates removed: {item['duplicates_removed']}\n")
        
        # Write the cleaned data back to the file
        with open('puzzle.json', 'w') as f:
            json.dump(cleaned_data, f, indent=2)
        
        print(f"Successfully removed duplicates from {len(report)} word(s).")
        print("Updated puzzle.json has been saved.")
    else:
        print("No duplicate definitions found!")
        print("puzzle.json is already clean.")


if __name__ == "__main__":
    main()