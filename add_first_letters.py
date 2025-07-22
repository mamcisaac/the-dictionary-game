#!/usr/bin/env python3
"""
Script to add missing first_letter fields to all puzzle entries
"""

import json

def add_first_letters():
    """Add first_letter field to all entries based on the actual first letter of the word."""
    print("🔧 Adding first_letter fields to puzzle.json...")
    
    # Load the puzzle data
    try:
        with open('puzzle.json', 'r', encoding='utf-8') as f:
            puzzle_data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: puzzle.json not found!")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in puzzle.json: {e}")
        return
    
    updated_count = 0
    
    for entry in puzzle_data:
        word = entry.get('word', '')
        
        if word and 'first_letter' not in entry:
            # Add the first_letter field
            entry['first_letter'] = word[0].upper()
            updated_count += 1
            print(f"✅ Added first_letter '{word[0].upper()}' for word '{word}'")
    
    # Save the updated data
    if updated_count > 0:
        with open('puzzle.json', 'w', encoding='utf-8') as f:
            json.dump(puzzle_data, f, indent=2, ensure_ascii=False)
        print(f"\n🎉 Successfully added first_letter field to {updated_count} entries!")
    else:
        print("\n✅ No updates needed - all entries already have first_letter field")

if __name__ == '__main__':
    add_first_letters()