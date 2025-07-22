#!/usr/bin/env python3
import json

def calculate_total_clues(word_data):
    """Calculate total clues for a word based on the given formula."""
    clues = 0
    
    # Count definitions (max 4)
    definitions = word_data.get('definitions', [])
    clues += min(len(definitions), 4)
    
    # Count examples (max 3)
    examples = word_data.get('examples', [])
    clues += min(len(examples), 3)
    
    # Check if synonyms exist (1 point if not empty)
    if word_data.get('synonyms', []):
        clues += 1
    
    # Check if antonyms exist (1 point if not empty)
    if word_data.get('antonyms', []):
        clues += 1
    
    # Letter reveals (word length - 1, max 4)
    word = word_data.get('word', '')
    letter_reveals = len(word) - 1
    clues += min(letter_reveals, 4)
    
    return clues

# Load the puzzle data
with open('puzzle.json', 'r') as f:
    data = json.load(f)

# Find the 8-clue words
eight_clue_words = ['duration', 'gateway', 'jones']

print("=== DETAILED ANALYSIS OF 8-CLUE WORDS ===\n")

for word_data in data:
    if word_data.get('word') in eight_clue_words:
        word = word_data.get('word')
        print(f"{word.upper()}:")
        print(f"  Total clues: {calculate_total_clues(word_data)}")
        print(f"  - Definitions: {len(word_data.get('definitions', []))} (contributes: {min(len(word_data.get('definitions', [])), 4)})")
        print(f"  - Examples: {len(word_data.get('examples', []))} (contributes: {min(len(word_data.get('examples', [])), 3)})")
        print(f"  - Has synonyms: {bool(word_data.get('synonyms', []))} (contributes: {1 if word_data.get('synonyms', []) else 0})")
        print(f"  - Has antonyms: {bool(word_data.get('antonyms', []))} (contributes: {1 if word_data.get('antonyms', []) else 0})")
        print(f"  - Word length: {len(word)} (letter reveals: {len(word) - 1}, contributes: {min(len(word) - 1, 4)})")
        
        print(f"\n  Definitions:")
        for i, defn in enumerate(word_data.get('definitions', []), 1):
            print(f"    {i}. {defn}")
        
        print(f"\n  Examples:")
        for i, example in enumerate(word_data.get('examples', []), 1):
            print(f"    {i}. {example}")
        
        if word_data.get('synonyms'):
            print(f"\n  Synonyms: {', '.join(word_data.get('synonyms', []))}")
        
        if word_data.get('antonyms'):
            print(f"\n  Antonyms: {', '.join(word_data.get('antonyms', []))}")
        
        print("\n" + "="*50 + "\n")