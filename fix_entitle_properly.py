#!/usr/bin/env python3
"""Fix the 'entitle' entry to remove ALL instances of 'title' from definitions"""

import json

# Load the puzzle data
with open('puzzle.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find and update the 'entitle' entry
for entry in data:
    if entry['word'] == 'entitle':
        # Fix definitions to remove 'title' completely
        entry['definitions'] = [
            "To give someone the right or privilege to do or have something.",
            "To give a name or heading to a book, article, movie, or other work.",
            "To furnish with proper grounds for seeking or claiming something.",
            "To give an official designation or rank to someone.",
            "To qualify someone for something; to make eligible."
        ]
        
        print("Fixed 'entitle' definitions to remove all instances of 'title'")
        print("\nNew definitions:")
        for i, d in enumerate(entry['definitions'], 1):
            print(f"{i}. {d}")
        break

# Save the updated data
with open('puzzle.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    
print("\npuzzle.json has been updated successfully.")