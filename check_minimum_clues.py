#!/usr/bin/env python3
import json

def check_minimum_clues():
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    print("Checking for words that might not support 9 clues...\n")
    
    problematic_words = []
    
    for word_data in data:
        word = word_data['word']
        
        # Calculate maximum possible clues
        max_possible = 0
        max_possible += len(word_data.get('definitions', []))
        max_possible += len(word_data.get('examples', []))
        max_possible += 1 if word_data.get('synonyms', []) else 0
        max_possible += 1 if word_data.get('antonyms', []) else 0
        max_possible += len(word) - 1  # letter reveals
        
        if max_possible < 9:
            problematic_words.append({
                'word': word,
                'max_possible': max_possible,
                'definitions': len(word_data.get('definitions', [])),
                'examples': len(word_data.get('examples', [])),
                'synonyms': len(word_data.get('synonyms', [])),
                'antonyms': len(word_data.get('antonyms', [])),
                'word_length': len(word)
            })
    
    if problematic_words:
        print(f"Found {len(problematic_words)} words that cannot reach 9 clues:")
        for w in problematic_words[:10]:  # Show first 10
            print(f"  '{w['word']}': max {w['max_possible']} clues "
                  f"(def={w['definitions']}, ex={w['examples']}, "
                  f"syn={w['synonyms']}, ant={w['antonyms']}, "
                  f"letters={w['word_length']-1})")
    else:
        print("Good news! All words can support at least 9 clues.")
    
    # Check distribution of word lengths
    print("\n\nWord length distribution:")
    length_counts = {}
    for word_data in data:
        length = len(word_data['word'])
        length_counts[length] = length_counts.get(length, 0) + 1
    
    for length in sorted(length_counts.keys()):
        print(f"  {length} letters: {length_counts[length]} words")
    
    # Identify words that would benefit most from 9-clue standardization
    print("\n\nWords currently with exactly 9 clues (no change needed):")
    words_with_9 = []
    for word_data in data:
        current_clues = 0
        current_clues += min(len(word_data.get('definitions', [])), 4)
        current_clues += min(len(word_data.get('examples', [])), 3)
        current_clues += 1 if word_data.get('synonyms', []) else 0
        current_clues += 1 if word_data.get('antonyms', []) else 0
        current_clues += min(len(word_data['word']) - 1, 4)
        current_clues = min(current_clues, 15)
        
        if current_clues == 9:
            words_with_9.append(word_data['word'])
    
    print(f"  Total: {len(words_with_9)} words")
    if words_with_9[:5]:
        print(f"  Examples: {', '.join(words_with_9[:5])}")

if __name__ == "__main__":
    check_minimum_clues()