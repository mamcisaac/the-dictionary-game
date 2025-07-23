#!/usr/bin/env python3
"""
Validate that no definitions contain their own word or obvious roots.
This ensures game fairness.
"""

import json
import re

def check_for_root_issues():
    """Check all words for definitions containing the word or its root"""
    with open('puzzle.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues = []
    
    for entry in data:
        word = entry['word'].lower()
        
        # Create list of roots to check
        roots_to_check = [word]
        
        # Add common root variations
        if len(word) > 4:
            # Remove common suffixes to find root
            if word.endswith('s') and len(word) > 3:
                roots_to_check.append(word[:-1])
            if word.endswith('es') and len(word) > 4:
                roots_to_check.append(word[:-2])
            if word.endswith('ed') and len(word) > 4:
                roots_to_check.append(word[:-2])
                roots_to_check.append(word[:-1])  # Sometimes just remove 'd'
            if word.endswith('ing') and len(word) > 5:
                roots_to_check.append(word[:-3])
                roots_to_check.append(word[:-3] + 'e')  # restore dropped 'e'
            if word.endswith('ly') and len(word) > 4:
                roots_to_check.append(word[:-2])
            if word.endswith('tion') and len(word) > 6:
                roots_to_check.append(word[:-4])
                roots_to_check.append(word[:-3])  # Sometimes just 'ion'
            if word.endswith('ment') and len(word) > 6:
                roots_to_check.append(word[:-4])
        
        # Check each definition
        for i, definition in enumerate(entry['definitions']):
            def_lower = definition.lower()
            
            for root in roots_to_check:
                if len(root) >= 3:  # Only check meaningful roots
                    # Use word boundary to avoid false matches
                    pattern = r'\b' + re.escape(root) + r'\b'
                    if re.search(pattern, def_lower):
                        issues.append({
                            'word': entry['word'],
                            'definition_index': i,
                            'definition': definition,
                            'found_root': root
                        })
                        break  # Only report once per definition
    
    return issues

def main():
    print("Checking for definitions containing their own roots...\n")
    
    issues = check_for_root_issues()
    
    if not issues:
        print("✅ Great! No definitions contain their own word or root.")
    else:
        print(f"⚠️  Found {len(issues)} definitions with root issues:\n")
        
        current_word = None
        for issue in issues:
            if issue['word'] != current_word:
                if current_word:
                    print()  # Add spacing between words
                current_word = issue['word']
                print(f"{issue['word'].upper()}:")
            
            print(f"  Definition {issue['definition_index'] + 1}: \"{issue['definition']}\"")
            print(f"    → Contains root: '{issue['found_root']}'")
        
        print(f"\nTotal issues: {len(issues)} definitions across {len(set(i['word'] for i in issues))} words")
        print("\nThese definitions should be rewritten to not contain the word or its root.")

if __name__ == "__main__":
    main()