#!/usr/bin/env python3
import json

def analyze_short_definitions():
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    short_defs = []
    single_def_words = []
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        
        # Check for single definition words
        if len(definitions) == 1:
            single_def_words.append({
                'word': word,
                'definition': definitions[0]
            })
        
        # Check for short definitions
        for i, defn in enumerate(definitions):
            if len(defn) < 20:
                short_defs.append({
                    'word': word,
                    'index': i,
                    'definition': defn,
                    'length': len(defn)
                })
    
    # Print findings
    print("SHORT DEFINITIONS ANALYSIS")
    print("=" * 50)
    
    print(f"\n1. WORDS WITH SINGLE DEFINITION ({len(single_def_words)}):")
    for item in single_def_words:
        print(f"\n{item['word'].upper()}:")
        print(f"  Definition: '{item['definition']}'")
    
    print(f"\n\n2. VERY SHORT DEFINITIONS (<20 chars) - Total: {len(short_defs)}")
    print("\nShortest definitions first:")
    
    # Sort by length and show the shortest ones
    sorted_defs = sorted(short_defs, key=lambda x: x['length'])
    
    # Group by word to see patterns
    words_with_short_defs = {}
    for item in sorted_defs:
        if item['word'] not in words_with_short_defs:
            words_with_short_defs[item['word']] = []
        words_with_short_defs[item['word']].append(item)
    
    # Show top 20 shortest definitions
    print("\nTop 20 shortest definitions:")
    for item in sorted_defs[:20]:
        print(f"  {item['word']}: '{item['definition']}' ({item['length']} chars)")
    
    # Show words with multiple short definitions
    print("\n\nWords with multiple short definitions:")
    multi_short = [(word, items) for word, items in words_with_short_defs.items() if len(items) > 1]
    multi_short.sort(key=lambda x: len(x[1]), reverse=True)
    
    for word, items in multi_short[:10]:
        print(f"\n{word.upper()} ({len(items)} short definitions):")
        for item in items:
            print(f"  - '{item['definition']}' ({item['length']} chars)")
    
    return single_def_words, short_defs

if __name__ == "__main__":
    analyze_short_definitions()