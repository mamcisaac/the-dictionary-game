#!/usr/bin/env python3
import json
from collections import Counter

def calculate_9_clue_distribution(word_data, strategy="balanced"):
    """Calculate how to distribute exactly 9 clues for a word"""
    
    available = {
        'definitions': len(word_data.get('definitions', [])),
        'examples': len(word_data.get('examples', [])),
        'synonyms': 1 if word_data.get('synonyms', []) else 0,
        'antonyms': 1 if word_data.get('antonyms', []) else 0,
        'letters': len(word_data['word']) - 1  # actual available letter reveals
    }
    
    if strategy == "balanced":
        # Start with base allocation
        allocated = {
            'definitions': min(3, available['definitions']),
            'examples': min(2, available['examples']),
            'synonyms': available['synonyms'],
            'antonyms': available['antonyms'],
            'letters': min(2, available['letters'])
        }
    elif strategy == "definition_heavy":
        allocated = {
            'definitions': min(4, available['definitions']),
            'examples': min(2, available['examples']),
            'synonyms': available['synonyms'],
            'antonyms': 0,  # Skip antonyms in this strategy
            'letters': min(2, available['letters'])
        }
    else:  # example_heavy
        allocated = {
            'definitions': min(2, available['definitions']),
            'examples': min(3, available['examples']),
            'synonyms': available['synonyms'],
            'antonyms': available['antonyms'],
            'letters': min(2, available['letters'])
        }
    
    # Calculate current total
    total = sum(allocated.values())
    
    # If we have fewer than 9, try to add more
    while total < 9:
        added = False
        
        # Priority order for adding more clues
        if allocated['definitions'] < min(4, available['definitions']):
            allocated['definitions'] += 1
            added = True
        elif allocated['examples'] < min(3, available['examples']):
            allocated['examples'] += 1
            added = True
        elif allocated['letters'] < min(4, available['letters']):
            allocated['letters'] += 1
            added = True
        elif strategy != "definition_heavy" and allocated['antonyms'] < available['antonyms']:
            allocated['antonyms'] = 1
            added = True
        
        if not added:
            break
            
        total = sum(allocated.values())
    
    # If we have more than 9, trim down
    while total > 9:
        # Priority order for removing clues (reverse of adding)
        if allocated['letters'] > 2:
            allocated['letters'] -= 1
        elif allocated['antonyms'] > 0:
            allocated['antonyms'] = 0
        elif allocated['synonyms'] > 0:
            allocated['synonyms'] = 0
        elif allocated['examples'] > 2:
            allocated['examples'] -= 1
        elif allocated['definitions'] > 2:
            allocated['definitions'] -= 1
        else:
            # Last resort - trim whatever we can
            if allocated['letters'] > 0:
                allocated['letters'] -= 1
            elif allocated['examples'] > 0:
                allocated['examples'] -= 1
            elif allocated['definitions'] > 0:
                allocated['definitions'] -= 1
        
        total = sum(allocated.values())
    
    return allocated

def analyze_standardization_impact():
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    strategies = ["balanced", "definition_heavy", "example_heavy"]
    
    for strategy in strategies:
        print(f"\n{'='*60}")
        print(f"STRATEGY: {strategy.upper()}")
        print(f"{'='*60}")
        
        total_changes = 0
        words_losing_clues = 0
        words_gaining_clues = 0
        unchanged = 0
        
        # Track what types of clues are most often cut
        cuts = Counter()
        adds = Counter()
        
        # Analyze impact on all words
        for word_data in data:
            current_clues = {
                'definitions': min(len(word_data.get('definitions', [])), 4),
                'examples': min(len(word_data.get('examples', [])), 3),
                'synonyms': 1 if word_data.get('synonyms', []) else 0,
                'antonyms': 1 if word_data.get('antonyms', []) else 0,
                'letters': min(len(word_data['word']) - 1, 4)
            }
            
            new_allocation = calculate_9_clue_distribution(word_data, strategy)
            
            current_total = min(sum(current_clues.values()), 15)
            new_total = sum(new_allocation.values())
            
            if new_total < current_total:
                words_losing_clues += 1
            elif new_total > current_total:
                words_gaining_clues += 1
            else:
                unchanged += 1
            
            # Track what's being cut or added
            for clue_type in current_clues:
                diff = new_allocation[clue_type] - current_clues[clue_type]
                if diff < 0:
                    cuts[clue_type] += abs(diff)
                elif diff > 0:
                    adds[clue_type] += diff
        
        print(f"\nImpact Summary:")
        print(f"  Words losing clues: {words_losing_clues} ({words_losing_clues/len(data)*100:.1f}%)")
        print(f"  Words gaining clues: {words_gaining_clues} ({words_gaining_clues/len(data)*100:.1f}%)")
        print(f"  Words unchanged: {unchanged} ({unchanged/len(data)*100:.1f}%)")
        
        print(f"\nMost commonly cut clue types:")
        for clue_type, count in cuts.most_common():
            print(f"  {clue_type}: {count} total cuts")
        
        print(f"\nMost commonly added clue types:")
        for clue_type, count in adds.most_common():
            print(f"  {clue_type}: {count} total additions")
        
        # Show a few examples
        print(f"\nExample transformations:")
        examples_shown = 0
        for word_data in data[:50]:  # Check first 50 words
            current_clues = {
                'definitions': min(len(word_data.get('definitions', [])), 4),
                'examples': min(len(word_data.get('examples', [])), 3),
                'synonyms': 1 if word_data.get('synonyms', []) else 0,
                'antonyms': 1 if word_data.get('antonyms', []) else 0,
                'letters': min(len(word_data['word']) - 1, 4)
            }
            
            new_allocation = calculate_9_clue_distribution(word_data, strategy)
            
            current_total = min(sum(current_clues.values()), 15)
            new_total = sum(new_allocation.values())
            
            if current_total != new_total and examples_shown < 5:
                print(f"\n  '{word_data['word']}': {current_total} → {new_total} clues")
                print(f"    Current: def={current_clues['definitions']}, ex={current_clues['examples']}, "
                      f"syn={current_clues['synonyms']}, ant={current_clues['antonyms']}, let={current_clues['letters']}")
                print(f"    New:     def={new_allocation['definitions']}, ex={new_allocation['examples']}, "
                      f"syn={new_allocation['synonyms']}, ant={new_allocation['antonyms']}, let={new_allocation['letters']}")
                examples_shown += 1

def recommend_implementation():
    print(f"\n\n{'='*60}")
    print("IMPLEMENTATION RECOMMENDATIONS")
    print(f"{'='*60}")
    
    print("\n1. MODIFY script.js calculateAvailableClues() function:")
    print("""
function calculateAvailableClues() {
    if (!puzzleData) return 0;
    
    // Fixed 9 clues for all words
    return 9;
}
""")
    
    print("\n2. MODIFY getNextClue() function to use new distribution:")
    print("""
- Change clue order to match 9-clue distribution
- First 3 clues: definitions
- Next 2 clues: examples
- Next 1 clue: synonyms (if available)
- Next 1 clue: antonyms (if available)
- Final 2 clues: letter reveals
- Use fallback logic when synonyms/antonyms not available
""")
    
    print("\n3. UPDATE scoring system:")
    print("""
- With fixed 9 clues, scoring becomes simpler
- Each clue costs ~11 points (100/9)
- Wrong guesses could cost 5 points
- This maintains balance between clue usage and guessing
""")
    
    print("\n4. BENEFITS of 9-clue standardization:")
    print("- Consistent difficulty across all words")
    print("- Predictable game experience")
    print("- Simpler scoring system")
    print("- Fair comparison between games")
    print("- Cleaner progress bar (always out of 9)")
    
    print("\n5. POTENTIAL ISSUES to address:")
    print("- Some simple words might feel over-clued")
    print("- Some complex words might feel under-clued")
    print("- Need to ensure all words have enough content for 9 clues")

if __name__ == "__main__":
    analyze_standardization_impact()
    recommend_implementation()