#!/usr/bin/env python3
import json

def find_9_clue_words():
    """Find all words that have exactly 9 total clues"""
    
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    nine_clue_words = []
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        synonyms = entry.get('synonyms', [])
        antonyms = entry.get('antonyms', [])
        examples = entry.get('examples', [])
        
        # Calculate total clues
        # Count definitions individually, but synonyms/antonyms as single clues
        total_clues = (
            len(definitions) + 
            (1 if synonyms else 0) + 
            (1 if antonyms else 0) + 
            len(examples)
        )
        
        if total_clues == 9:
            nine_clue_words.append({
                'word': word,
                'definitions': len(definitions),
                'synonyms': len(synonyms),
                'antonyms': len(antonyms),
                'examples': len(examples),
                'breakdown': f"{len(definitions)}d + {'1s' if synonyms else '0s'} + {'1a' if antonyms else '0a'} + {len(examples)}e"
            })
    
    # Print results
    print(f"WORDS WITH EXACTLY 9 CLUES: {len(nine_clue_words)}")
    print("=" * 70)
    print(f"{'Word':<20} {'Defs':<6} {'Syns':<6} {'Ants':<6} {'Exs':<6} {'Breakdown':<15}")
    print("-" * 70)
    
    # Sort by word for easier reading
    nine_clue_words.sort(key=lambda x: x['word'])
    
    for item in nine_clue_words:
        print(f"{item['word']:<20} {item['definitions']:<6} {item['synonyms']:<6} {item['antonyms']:<6} {item['examples']:<6} {item['breakdown']:<15}")
    
    # Analyze patterns
    print(f"\n\nPATTERN ANALYSIS:")
    patterns = {}
    for item in nine_clue_words:
        pattern = item['breakdown']
        if pattern not in patterns:
            patterns[pattern] = []
        patterns[pattern].append(item['word'])
    
    print(f"\nMost common patterns:")
    for pattern, words in sorted(patterns.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"  {pattern}: {len(words)} words")
        if len(words) <= 5:
            print(f"    Examples: {', '.join(words)}")
        else:
            print(f"    Examples: {', '.join(words[:5])}...")
    
    return nine_clue_words

if __name__ == "__main__":
    find_9_clue_words()