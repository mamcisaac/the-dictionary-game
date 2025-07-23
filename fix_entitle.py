#!/usr/bin/env python3
"""Fix the 'entitle' entry with better definitions and examples"""

import json

# Load the puzzle data
with open('puzzle.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find and update the 'entitle' entry
for entry in data:
    if entry['word'] == 'entitle':
        # Improve definitions to be clearer and more comprehensive
        entry['definitions'] = [
            "To give someone the right or privilege to do or have something.",
            "To give a name or title to a book, article, movie, or other work.",
            "To furnish with proper grounds for seeking or claiming something.",
            "To give an official title or designation to someone.",
            "To qualify someone for something; to make eligible."
        ]
        
        # Add helpful synonyms
        entry['synonyms'] = [
            "authorize",
            "qualify",
            "permit",
            "empower"
        ]
        
        # Add contrasting antonyms
        entry['antonyms'] = [
            "disqualify",
            "prohibit",
            "forbid"
        ]
        
        # Improve examples with clear context
        entry['examples'] = [
            "A passport [blank]s the bearer to travel to other countries.",
            "She decided to [blank] her new novel 'The Secret Garden'.",
            "Your membership [blank]s you to use all club facilities.",
            "The award [blank]s the winner to a cash prize.",
            "Being a citizen [blank]s you to vote in elections."
        ]
        
        print("Updated 'entitle' entry successfully!")
        break

# Save the updated data
with open('puzzle.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    
print("puzzle.json has been updated with improved 'entitle' definitions.")