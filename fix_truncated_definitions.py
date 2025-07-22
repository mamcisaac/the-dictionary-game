#!/usr/bin/env python3
"""
Fix truncated definitions in puzzle.json.

This script identifies and fixes definitions that appear to be cut off mid-sentence,
often missing the beginning of the sentence. It looks for patterns where definitions:
1. Start with lowercase letters (like "n excursion" instead of "An excursion")
2. Are missing articles at the beginning ("chance of occurring" instead of "A chance of occurring")
3. Start with partial words ("d, receive or absorb" likely should be "To hold, receive or absorb")
"""

import json
import re
from typing import List, Dict, Tuple

def load_puzzle_data(filename: str = 'puzzle.json') -> List[Dict]:
    """Load the puzzle data from JSON file."""
    with open(filename, 'r') as f:
        return json.load(f)

def save_puzzle_data(data: List[Dict], filename: str = 'puzzle.json'):
    """Save the puzzle data to JSON file."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def find_truncated_definitions(data: List[Dict]) -> List[Dict]:
    """Find definitions that appear to be truncated."""
    truncated_patterns = []
    
    for entry in data:
        word = entry['word']
        for i, definition in enumerate(entry.get('definitions', [])):
            if not definition:
                continue
            
            # High-confidence fixes first
            
            # Fix the specific lowercase case
            if definition.startswith('the meaning that a human assigns'):
                truncated_patterns.append({
                    'word': word,
                    'index': i,
                    'definition': definition,
                    'suggested': 'The' + definition[3:],
                    'type': 'needs_capitalization',
                    'confidence': 'high'
                })
                continue
            
            # Check for definitions that clearly need articles (high confidence)
            # These are noun phrases starting with specific common nouns
            if re.match(r'^(Part|Type|Form|Kind|Piece|Member|Portion|Section|Example|Instance|Result|Effect|Cause|Method|Way|Means|Process|State|Condition|Quality|Characteristic|Feature|Aspect|Element|Factor|Component|Device|Instrument|Tool|System|Mechanism|Structure|Building|Place|Location|Area|Region|Zone|Space|Room|Substance|Material|Object|Item|Thing|Person|Individual|Group|Collection|Set|Series|List|Number|Amount|Quantity|Proof|Evidence) (of|that|which|where|who|whose) ', definition):
                first_word = definition.split()[0].lower()
                if first_word[0] in 'aeiou':
                    suggested = 'An ' + definition
                else:
                    suggested = 'A ' + definition
                    
                truncated_patterns.append({
                    'word': word,
                    'index': i,
                    'definition': definition,
                    'suggested': suggested,
                    'type': 'missing_article',
                    'confidence': 'high'
                })
                continue
                
            # Check for specific truncation patterns mentioned by user
            # Pattern: 'n excursion' (missing 'A')
            if re.match(r'^n [a-z]', definition):
                truncated_patterns.append({
                    'word': word,
                    'index': i,
                    'definition': definition,
                    'suggested': 'An ' + definition[2:],
                    'type': 'truncated_an',
                    'confidence': 'high'
                })
                continue
            
            # Pattern: 'd, receive' (missing 'To hol')
            if re.match(r'^d, [a-z]', definition):
                truncated_patterns.append({
                    'word': word,
                    'index': i,
                    'definition': definition,
                    'suggested': 'To hold, ' + definition[3:],
                    'type': 'truncated_hold',
                    'confidence': 'high'
                })
                continue
                
            # Medium confidence fixes
            
            # Check for other lowercase starts (but not the special case we already fixed)
            if (definition[0].islower() and 
                not definition.startswith('the meaning that a human assigns')):
                truncated_patterns.append({
                    'word': word,
                    'index': i,
                    'definition': definition,
                    'suggested': definition[0].upper() + definition[1:],
                    'type': 'needs_capitalization',
                    'confidence': 'medium'
                })
                continue
                
            # Check for simple verb definitions that might need 'To' (very selective)
            # Only for very obvious cases like "Begin to be; turn into."
            if re.match(r'^(Begin|Start|Cease|Continue) ', definition):
                truncated_patterns.append({
                    'word': word,
                    'index': i,
                    'definition': definition,
                    'suggested': 'To ' + definition.lower(),
                    'type': 'missing_to_verb',
                    'confidence': 'medium'
                })
                continue
    
    return truncated_patterns

def apply_fixes(data: List[Dict], fixes: List[Dict]) -> Tuple[List[Dict], int]:
    """Apply the suggested fixes to the data."""
    fix_count = 0
    
    # Create a mapping for quick lookup
    fix_map = {}
    for fix in fixes:
        key = (fix['word'], fix['index'])
        fix_map[key] = fix['suggested']
    
    # Apply fixes
    for entry in data:
        word = entry['word']
        definitions = entry.get('definitions', [])
        for i in range(len(definitions)):
            key = (word, i)
            if key in fix_map:
                definitions[i] = fix_map[key]
                fix_count += 1
    
    return data, fix_count

def main(auto_apply=False):
    """Main function to fix truncated definitions."""
    print("Loading puzzle data...")
    data = load_puzzle_data()
    
    print("Finding truncated definitions...")
    truncated = find_truncated_definitions(data)
    
    if not truncated:
        print("No truncated definitions found!")
        return
    
    # Group by type for reporting
    types = {}
    for item in truncated:
        t = item['type']
        if t not in types:
            types[t] = []
        types[t].append(item)
    
    print(f"\nFound {len(truncated)} potentially truncated or improperly formatted definitions:")
    
    # Group by confidence level
    high_confidence = [item for item in truncated if item.get('confidence') == 'high']
    medium_confidence = [item for item in truncated if item.get('confidence') == 'medium']
    
    if high_confidence:
        print(f"\nHigh confidence fixes ({len(high_confidence)} items):")
        for item in high_confidence:
            print(f"  {item['word']} [{item['index']}] ({item['type']}):")
            print(f"    Current:   {item['definition'][:80]}...")
            print(f"    Suggested: {item['suggested'][:80]}...")
    
    if medium_confidence:
        print(f"\nMedium confidence fixes ({len(medium_confidence)} items):")
        for item in medium_confidence[:5]:  # Show first 5 medium confidence
            print(f"  {item['word']} [{item['index']}] ({item['type']}):")
            print(f"    Current:   {item['definition'][:80]}...")
            print(f"    Suggested: {item['suggested'][:80]}...")
    
    # Also group by type for detailed breakdown
    print(f"\nBreakdown by type:")
    for t, items in types.items():
        confidence_counts = {}
        for item in items:
            conf = item.get('confidence', 'unknown')
            confidence_counts[conf] = confidence_counts.get(conf, 0) + 1
        
        conf_str = ', '.join([f"{conf}: {count}" for conf, count in confidence_counts.items()])
        print(f"  {t}: {len(items)} items ({conf_str})")
    
    # Apply fixes (auto or with confirmation)
    should_apply = auto_apply
    if not auto_apply:
        try:
            response = input("\nDo you want to apply these fixes? (yes/no): ")
            should_apply = response.lower() in ['yes', 'y']
        except (EOFError, KeyboardInterrupt):
            print("\nNo user input available, showing fixes only.")
            should_apply = False
    
    if should_apply:
        print("\nApplying fixes...")
        data, fix_count = apply_fixes(data, truncated)
        
        # Save the updated data
        save_puzzle_data(data)
        print(f"Successfully fixed {fix_count} definitions!")
        print("Updated puzzle.json saved.")
    else:
        print("No changes applied. Review the suggestions above.")

if __name__ == "__main__":
    main()