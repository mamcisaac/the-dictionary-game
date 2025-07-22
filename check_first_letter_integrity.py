#!/usr/bin/env python3
"""
Script to check if all words have the correct first_letter field
"""

import json

def check_first_letter_integrity():
    """Check if first_letter field matches the actual first letter of each word."""
    print("🔍 Checking first_letter field integrity...")
    
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
    
    mismatches = []
    missing_first_letter = []
    
    for i, entry in enumerate(puzzle_data):
        word = entry.get('word', '').lower()
        first_letter = entry.get('first_letter', '').lower()
        
        if not word:
            print(f"⚠️  Entry {i} has no word!")
            continue
            
        actual_first = word[0] if word else ''
        
        if 'first_letter' not in entry:
            missing_first_letter.append((i, word))
        elif first_letter != actual_first:
            mismatches.append((i, word, first_letter, actual_first))
    
    if missing_first_letter:
        print(f"\n⚠️  Found {len(missing_first_letter)} entries missing first_letter field:")
        for i, word in missing_first_letter[:5]:
            print(f"   Entry {i}: '{word}' - missing first_letter")
        if len(missing_first_letter) > 5:
            print(f"   ... and {len(missing_first_letter) - 5} more")
    
    if mismatches:
        print(f"\n❌ Found {len(mismatches)} first_letter mismatches:")
        for i, word, recorded, actual in mismatches:
            print(f"   Entry {i}: '{word}' - first_letter is '{recorded}' but should be '{actual}'")
    
    if not mismatches and not missing_first_letter:
        print("✅ All first_letter fields are correct!")
    
    # Check for specific problem words
    print("\n🔍 Looking for words containing 'charcuterie' or similar...")
    found_similar = False
    for i, entry in enumerate(puzzle_data):
        word = entry.get('word', '').lower()
        if 'charcut' in word or 'charcuterie' in word:
            print(f"   Found: '{entry.get('word')}' at index {i}")
            print(f"   First letter field: '{entry.get('first_letter', 'MISSING')}'")
            found_similar = True
    
    if not found_similar:
        print("   No words containing 'charcut' or 'charcuterie' found in the database")
    
    print(f"\n📊 Total entries: {len(puzzle_data)}")

if __name__ == '__main__':
    check_first_letter_integrity()