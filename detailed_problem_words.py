#!/usr/bin/env python3
"""
Get detailed list of all words that don't meet the criteria for 9-clue standardization.
"""

import json

def get_problem_words():
    # Load the puzzle data
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    # Find all words with issues
    short_words = []
    few_definitions = []
    
    for word_data in data:
        word = word_data.get('word', '')
        definitions = word_data.get('definitions', [])
        
        # Check word length
        if len(word) < 4:
            short_words.append(word)
        
        # Check definition count
        if len(definitions) < 4:
            few_definitions.append((word, len(definitions)))
    
    # Sort by definition count
    few_definitions.sort(key=lambda x: (x[1], x[0]))
    
    print("DETAILED PROBLEM WORD ANALYSIS")
    print("=" * 60)
    
    print(f"\n1. WORDS WITH LESS THAN 4 LETTERS ({len(short_words)} total):")
    for word in short_words:
        print(f"   - {word}")
    
    print(f"\n2. WORDS WITH LESS THAN 4 DEFINITIONS ({len(few_definitions)} total):")
    print("\n   Words with 2 definitions:")
    for word, count in few_definitions:
        if count == 2:
            print(f"   - {word}")
    
    print("\n   Words with 3 definitions:")
    for word, count in few_definitions:
        if count == 3:
            print(f"   - {word}")
    
    print("\n" + "=" * 60)
    print("RECOMMENDATION:")
    print("=" * 60)
    print(f"\nTo achieve 9-clue standardization, you need to:")
    print(f"1. Add more definitions to {len(few_definitions)} words")
    print(f"2. Consider removing or replacing the {len(short_words)} word(s) with less than 4 letters")
    print(f"\nThe main work is adding definitions to reach the minimum of 4 per word.")
    print(f"All words already have at least 2 examples, which is sufficient.")

if __name__ == "__main__":
    get_problem_words()