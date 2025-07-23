#!/usr/bin/env python3
"""
Fix definitions that contain the word or its root.
This is critical for game fairness - players shouldn't see the answer in the clue!
"""

import json
import re
from collections import defaultdict

def get_word_root(word):
    """Extract common root patterns from a word"""
    roots = set()
    roots.add(word.lower())
    
    # Common suffix removals to find roots
    suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ment', 
                'ness', 'ity', 'ous', 'ive', 'able', 'ible', 'ful', 
                'less', 'ize', 'ise', 's', 'es', 'ies']
    
    # Try removing suffixes to find potential roots
    for suffix in suffixes:
        if word.lower().endswith(suffix) and len(word) > len(suffix) + 2:
            potential_root = word.lower()[:-len(suffix)]
            if len(potential_root) >= 3:  # Minimum root length
                roots.add(potential_root)
    
    # Special handling for words ending in 'e' that might have been dropped
    if word.lower().endswith('ing') or word.lower().endswith('ed'):
        potential_root = word.lower()[:-3] + 'e'
        if len(potential_root) >= 3:
            roots.add(potential_root)
    
    # Handle double consonants (running -> run)
    if len(word) > 4 and word[-4] == word[-3] and word.endswith('ing'):
        roots.add(word[:-4])
    
    return roots

def contains_root(definition, word):
    """Check if a definition contains the word or its root"""
    definition_lower = definition.lower()
    roots = get_word_root(word)
    
    for root in roots:
        # Use word boundaries to avoid false positives
        if re.search(r'\b' + re.escape(root) + r'\b', definition_lower):
            return True, root
    
    return False, None

def fix_definitions_with_roots():
    """Find and fix all definitions containing their word's root"""
    with open('puzzle.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues_found = []
    fixes_applied = 0
    
    # First, find all issues
    for entry in data:
        word = entry['word']
        problematic_defs = []
        
        for i, definition in enumerate(entry['definitions']):
            has_root, root = contains_root(definition, word)
            if has_root:
                problematic_defs.append((i, definition, root))
        
        if problematic_defs:
            issues_found.append({
                'word': word,
                'problematic_defs': problematic_defs
            })
    
    print(f"Found {len(issues_found)} words with root-in-definition issues:\n")
    
    # Show issues and fix them
    for issue in issues_found:
        word = issue['word']
        print(f"{word.upper()}:")
        
        # Find the entry
        for entry in data:
            if entry['word'] == word:
                for def_idx, definition, root in issue['problematic_defs']:
                    print(f"  - Definition {def_idx + 1}: '{definition}'")
                    print(f"    Contains root: '{root}'")
                    
                    # Apply specific fixes for known cases
                    if word == 'entitle':
                        if 'give a title to' in definition.lower():
                            entry['definitions'][def_idx] = "To give a name or designation to a work."
                            fixes_applied += 1
                        elif 'title' in definition.lower():
                            entry['definitions'][def_idx] = definition.replace('title', 'name').replace('Title', 'Name')
                            fixes_applied += 1
                    
                    # Generic fixes for other cases
                    elif word == 'title':
                        if 'title' in definition.lower():
                            # Replace with more generic terms
                            new_def = definition.replace('title', 'designation')
                            new_def = new_def.replace('Title', 'Designation')
                            entry['definitions'][def_idx] = new_def
                            fixes_applied += 1
                    
                    # Add more specific fixes as needed
                    else:
                        # For now, flag for manual review
                        print(f"    ⚠️  Needs manual fix")
                
                print()
    
    # Save the updated data
    with open('puzzle.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\nApplied {fixes_applied} automatic fixes.")
    print(f"Remaining issues need manual review.")
    
    # Generate report of remaining issues
    remaining_issues = []
    for entry in data:
        word = entry['word']
        for i, definition in enumerate(entry['definitions']):
            has_root, root = contains_root(definition, word)
            if has_root:
                remaining_issues.append({
                    'word': word,
                    'definition': definition,
                    'root': root
                })
    
    if remaining_issues:
        print(f"\n⚠️  {len(remaining_issues)} definitions still contain roots and need manual fixes.")
        with open('root_issues_report.txt', 'w') as f:
            f.write("Definitions that still contain their word's root:\n\n")
            for issue in remaining_issues:
                f.write(f"{issue['word'].upper()}: {issue['definition']}\n")
                f.write(f"  Contains root: '{issue['root']}'\n\n")
        print("See root_issues_report.txt for details.")

if __name__ == "__main__":
    fix_definitions_with_roots()