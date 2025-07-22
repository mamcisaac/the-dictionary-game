#!/usr/bin/env python3
import json

def enrich_single_definition_words():
    """Add additional definitions to words that only have one definition"""
    
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    enrichments = {
        'evaluation': [
            'Determination of the value of a variable or expression.',
            'The process of judging or assessing the worth, quality, or importance of something.',
            'A systematic analysis to determine merit, worth, or significance.',
            'The act of appraising or estimating the nature, ability, or quality of something.'
        ],
        'density': [
            'A measure of the mass of matter contained by a unit volume.',
            'The degree of compactness of a substance or object.',
            'The quantity of things or people in a given area or space.',
            'In statistics, the distribution of a variable within a given range.'
        ]
    }
    
    fixes_applied = 0
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        
        # Check if this word needs enrichment
        if word.lower() in enrichments and len(definitions) <= 1:
            # Replace with enriched definitions
            old_count = len(definitions)
            entry['definitions'] = enrichments[word.lower()]
            new_count = len(entry['definitions'])
            fixes_applied += 1
            print(f"Enriched {word}: {old_count} -> {new_count} definitions")
            print(f"  New definitions:")
            for defn in entry['definitions']:
                print(f"    - {defn}")
    
    # Save the updated data
    with open('puzzle.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nTotal words enriched: {fixes_applied}")

if __name__ == "__main__":
    enrich_single_definition_words()