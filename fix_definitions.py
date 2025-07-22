#!/usr/bin/env python3
import json
import re

def fix_purpose_function_corruption():
    """Fix definitions corrupted with 'that serves a specific purpose or function'"""
    
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    fixed_count = 0
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        
        for i, defn in enumerate(definitions):
            # Fix the corruption pattern
            if 'that serves a specific purpose or function' in defn:
                # Remove the corrupted part
                fixed_defn = defn.replace(' that serves a specific purpose or function', '')
                
                # Add proper punctuation if missing
                if fixed_defn and fixed_defn[-1] not in '.?!':
                    fixed_defn += '.'
                
                definitions[i] = fixed_defn
                fixed_count += 1
                print(f"Fixed {word}: '{defn}' -> '{fixed_defn}'")
            
            # Also fix truncated "purpose or function" at the end
            elif defn.endswith('purpose or function'):
                # This is likely a truncated definition, try to clean it up
                if '. ' in defn:
                    # Keep only the part before the corruption
                    parts = defn.split('. ')
                    clean_parts = [p for p in parts if 'purpose or function' not in p]
                    if clean_parts:
                        fixed_defn = '. '.join(clean_parts) + '.'
                        definitions[i] = fixed_defn
                        fixed_count += 1
                        print(f"Fixed truncated {word}: '{defn}' -> '{fixed_defn}'")
    
    # Write the fixed data back
    with open('puzzle_fixed.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nTotal fixes applied: {fixed_count}")
    print("Fixed data saved to puzzle_fixed.json")
    print("\nTo apply the fixes, run:")
    print("  mv puzzle_fixed.json puzzle.json")

if __name__ == "__main__":
    fix_purpose_function_corruption()