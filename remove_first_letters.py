#!/usr/bin/env python3
"""
Script to remove redundant first_letter fields from all puzzle entries
"""

import json

def remove_first_letters():
    """Remove first_letter field from all entries since it's redundant."""
    print("🔧 Removing redundant first_letter fields from puzzle.json...")
    
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
    
    removed_count = 0
    
    for entry in puzzle_data:
        if 'first_letter' in entry:
            del entry['first_letter']
            removed_count += 1
    
    # Save the updated data
    if removed_count > 0:
        with open('puzzle.json', 'w', encoding='utf-8') as f:
            json.dump(puzzle_data, f, indent=2, ensure_ascii=False)
        print(f"\n🎉 Successfully removed first_letter field from {removed_count} entries!")
        print("✅ The game will now use the actual first letter of each word directly.")
    else:
        print("\n✅ No first_letter fields found to remove")

if __name__ == '__main__':
    remove_first_letters()