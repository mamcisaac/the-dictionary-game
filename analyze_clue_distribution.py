#!/usr/bin/env python3
import json
from collections import Counter

def calculate_clues_for_word(word_data):
    """Calculate the number of clues for a word based on current game logic"""
    clues = 0
    
    # Definitions (max 4)
    if 'definitions' in word_data:
        clues += min(len(word_data['definitions']), 4)
    
    # Examples (max 3)
    if 'examples' in word_data:
        clues += min(len(word_data['examples']), 3)
    
    # Synonyms (1 if present)
    if 'synonyms' in word_data and len(word_data['synonyms']) > 0:
        clues += 1
    
    # Antonyms (1 if present)
    if 'antonyms' in word_data and len(word_data['antonyms']) > 0:
        clues += 1
    
    # Letter reveals (word length - 1, max 4)
    if 'word' in word_data:
        clues += min(len(word_data['word']) - 1, 4)
    
    # Total capped at 15
    return min(clues, 15)

def analyze_puzzle_data():
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    print(f"Total words in puzzle.json: {len(data)}")
    print()
    
    # Calculate clue counts for all words
    clue_counts = []
    clue_distribution = Counter()
    
    for word_data in data:
        clue_count = calculate_clues_for_word(word_data)
        clue_counts.append((word_data['word'], clue_count))
        clue_distribution[clue_count] += 1
    
    # Print distribution
    print("Current clue distribution:")
    for clues in sorted(clue_distribution.keys()):
        print(f"  {clues} clues: {clue_distribution[clues]} words ({clue_distribution[clues]/len(data)*100:.1f}%)")
    
    print()
    
    # Show words with more than 9 clues
    words_over_9 = [(word, count) for word, count in clue_counts if count > 9]
    print(f"\nWords with more than 9 clues: {len(words_over_9)}")
    
    # Analyze what would need to be removed
    print("\nBreakdown of clue types for words with >9 clues:")
    sample_size = min(10, len(words_over_9))
    for i in range(sample_size):
        word, clue_count = words_over_9[i]
        word_data = next(w for w in data if w['word'] == word)
        
        defs = min(len(word_data.get('definitions', [])), 4)
        exams = min(len(word_data.get('examples', [])), 3)
        syns = 1 if word_data.get('synonyms', []) else 0
        ants = 1 if word_data.get('antonyms', []) else 0
        letters = min(len(word) - 1, 4)
        
        print(f"  {word}: {clue_count} clues (defs={defs}, examples={exams}, syn={syns}, ant={ants}, letters={letters})")

def propose_9_clue_distribution():
    """Propose optimal distribution for exactly 9 clues"""
    print("\n\nPROPOSED STANDARDIZATION TO 9 CLUES:")
    print("=====================================")
    
    print("\nOption 1 - Balanced approach:")
    print("  3 definitions")
    print("  2 examples")
    print("  1 synonym (if available)")
    print("  1 antonym (if available)")
    print("  2 letter reveals")
    print("  Total: 9 clues")
    
    print("\nOption 2 - Definition-heavy:")
    print("  4 definitions")
    print("  2 examples")
    print("  1 synonym (if available)")
    print("  0 antonyms")
    print("  2 letter reveals")
    print("  Total: 9 clues")
    
    print("\nOption 3 - Example-heavy:")
    print("  2 definitions")
    print("  3 examples")
    print("  1 synonym (if available)")
    print("  1 antonym (if available)")
    print("  2 letter reveals")
    print("  Total: 9 clues")
    
    print("\nFallback handling:")
    print("- If synonyms/antonyms not available, allocate those slots to:")
    print("  - Additional definitions (up to max)")
    print("  - Additional examples (up to max)")
    print("  - Additional letter reveals (up to max)")

if __name__ == "__main__":
    analyze_puzzle_data()
    propose_9_clue_distribution()