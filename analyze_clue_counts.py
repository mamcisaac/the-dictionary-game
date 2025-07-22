#!/usr/bin/env python3
import json
from collections import defaultdict, Counter

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

def analyze_puzzle_file():
    # Load the puzzle data
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    words_by_clue_count = defaultdict(list)
    total_words = 0
    
    # Analyze each word
    for word_data in data:
        total_words += 1
        word = word_data.get('word', '')
        clue_count = calculate_total_clues(word_data)
        words_by_clue_count[clue_count].append({
            'word': word,
            'definitions': len(word_data.get('definitions', [])),
            'examples': len(word_data.get('examples', [])),
            'has_synonyms': bool(word_data.get('synonyms', [])),
            'has_antonyms': bool(word_data.get('antonyms', [])),
            'word_length': len(word),
            'letter_reveals': min(len(word) - 1, 4)
        })
    
    # Find words with fewer than 10 clues
    words_under_10 = []
    for clue_count in range(0, 10):
        if clue_count in words_by_clue_count:
            words_under_10.extend([(clue_count, w) for w in words_by_clue_count[clue_count]])
    
    # Sort by clue count and then by word
    words_under_10.sort(key=lambda x: (x[0], x[1]['word']))
    
    # Print results
    print(f"=== ANALYSIS OF WORDS WITH FEWER THAN 10 CLUES ===\n")
    print(f"Total words in puzzle.json: {total_words}")
    print(f"Words with fewer than 10 clues: {len(words_under_10)}")
    print(f"Percentage: {(len(words_under_10) / total_words * 100):.2f}%\n")
    
    # Breakdown by clue count
    print("=== BREAKDOWN BY CLUE COUNT ===")
    clue_count_distribution = Counter([w[0] for w in words_under_10])
    for clue_count in sorted(clue_count_distribution.keys()):
        print(f"{clue_count} clues: {clue_count_distribution[clue_count]} words")
    
    # List all words with 9 clues
    print("\n=== WORDS WITH 9 CLUES ===")
    words_with_9 = [w for w in words_under_10 if w[0] == 9]
    for _, word_info in words_with_9:
        print(f"\n{word_info['word']}:")
        print(f"  - Definitions: {word_info['definitions']}")
        print(f"  - Examples: {word_info['examples']}")
        print(f"  - Has synonyms: {word_info['has_synonyms']}")
        print(f"  - Has antonyms: {word_info['has_antonyms']}")
        print(f"  - Word length: {word_info['word_length']} (letter reveals: {word_info['letter_reveals']})")
    
    # Pattern analysis
    print("\n=== PATTERN ANALYSIS ===")
    print("What's missing from words with 9 clues:")
    
    # Analyze missing components
    missing_patterns = defaultdict(int)
    for _, word_info in words_with_9:
        if word_info['definitions'] < 4:
            missing_patterns['fewer_than_4_definitions'] += 1
        if word_info['examples'] < 3:
            missing_patterns['fewer_than_3_examples'] += 1
        if not word_info['has_synonyms']:
            missing_patterns['no_synonyms'] += 1
        if not word_info['has_antonyms']:
            missing_patterns['no_antonyms'] += 1
        if word_info['letter_reveals'] < 4:
            missing_patterns['short_word'] += 1
    
    for pattern, count in sorted(missing_patterns.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(words_with_9) * 100)
        print(f"  - {pattern}: {count} words ({percentage:.1f}%)")
    
    # Additional insights
    print("\n=== ADDITIONAL INSIGHTS ===")
    
    # Check if any words have 8 or fewer clues
    if any(w[0] < 9 for w in words_under_10):
        print("Words with fewer than 9 clues found:")
        for clue_count in range(0, 9):
            if clue_count in clue_count_distribution:
                print(f"  - {clue_count} clues: {clue_count_distribution[clue_count]} words")
                for _, word_info in [(c, w) for c, w in words_under_10 if c == clue_count]:
                    print(f"    * {word_info['word']}")
    else:
        print("No words found with fewer than 9 clues.")
    
    # Common characteristics of 9-clue words
    print("\nCommon word lengths for 9-clue words:")
    length_distribution = Counter([w[1]['word_length'] for w in words_with_9])
    for length, count in sorted(length_distribution.items()):
        print(f"  - {length} letters: {count} words")

if __name__ == "__main__":
    analyze_puzzle_file()