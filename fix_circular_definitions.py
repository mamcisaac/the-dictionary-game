#!/usr/bin/env python3
"""
Script to detect and help fix circular definitions in puzzle.json
where a word's definition contains its own root form.
"""

import json
import re
from typing import List, Dict, Set, Tuple

def get_word_root(word: str) -> str:
    """Extract the root form of a word by removing common suffixes."""
    word = word.lower().strip()
    
    # Remove common suffixes to get root forms
    suffixes = [
        'ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment', 
        'ity', 'ous', 'ful', 'less', 'able', 'ible', 'ize', 'ise',
        's', 'es', 'ies'  # plural forms
    ]
    
    for suffix in sorted(suffixes, key=len, reverse=True):  # Try longer suffixes first
        if word.endswith(suffix) and len(word) > len(suffix) + 2:  # Keep at least 3 chars
            potential_root = word[:-len(suffix)]
            # Handle some irregular forms
            if suffix in ['ies'] and potential_root.endswith('i'):
                potential_root = potential_root[:-1] + 'y'
            elif suffix in ['es'] and potential_root.endswith(('s', 'x', 'z', 'ch', 'sh')):
                continue  # These need 'es' for plural
            return potential_root
    
    return word

def check_circular_definition(word: str, definition: str) -> bool:
    """Check if a definition contains the root form of the word."""
    word_root = get_word_root(word)
    definition_lower = definition.lower()
    
    # Remove punctuation and split into words
    definition_words = re.findall(r'\b[a-zA-Z]+\b', definition_lower)
    
    # Check if word root appears in definition
    for def_word in definition_words:
        def_word_root = get_word_root(def_word)
        if word_root == def_word_root and len(word_root) > 2:  # Check shorter roots too
            return True
    
    # Also check for direct word matches
    word_pattern = r'\b' + re.escape(word.lower()) + r'\b'
    if re.search(word_pattern, definition_lower):
        return True
    
    # Check for common circular patterns
    circular_patterns = [
        f"who {word_root}",
        f"that {word_root}",
        f"which {word_root}",
        f"one who {word_root}",
        f"someone who {word_root}",
        f"a person who {word_root}",
        f"to {word_root}",
        f"the act of {word_root}",
        f"the process of {word_root}"
    ]
    
    for pattern in circular_patterns:
        if pattern in definition_lower:
            return True
        
    return False

def find_circular_definitions(puzzle_data: List[Dict]) -> List[Tuple[str, str, str]]:
    """Find all circular definitions in the puzzle data."""
    circular_defs = []
    
    for entry in puzzle_data:
        word = entry['word']
        for i, definition in enumerate(entry.get('definitions', [])):
            if check_circular_definition(word, definition):
                circular_defs.append((word, definition, f"definition_{i}"))
    
    return circular_defs

def suggest_better_definition(word: str, bad_definition: str) -> str:
    """Suggest a better definition for common circular definition patterns."""
    word_lower = word.lower()
    
    # Common word-specific fixes (avoiding circular definitions)
    fixes = {
        'runner': 'An athlete who competes in foot races or someone who moves rapidly on foot',
        'walker': 'A person who travels on foot at a steady pace, or a mobility aid device',
        'singer': 'A person who performs vocal music with their voice',
        'writer': 'An author who creates written works such as books, articles, or scripts',
        'player': 'A participant in a sport, game, or musical performance',
        'worker': 'An employee or person engaged in physical or mental labor',
        'teacher': 'An educator who instructs and guides students in learning',
        'driver': 'A person who controls and operates a motor vehicle',
        'dancer': 'A performer who expresses ideas through choreographed body movements',
        'speaker': 'Someone who addresses an audience or a device that produces sound',
        'reader': 'A person who interprets written text or someone who enjoys books',
        'helper': 'An assistant who provides support or aid to others',
        'maker': 'A creator or manufacturer who produces goods or crafts',
        'keeper': 'A guardian or caretaker responsible for maintaining something',
        'holder': 'A container, support, or person who possesses something',
        'opener': 'A tool designed to access sealed containers or locked objects',
        'cleaner': 'A substance or device used to remove dirt, stains, or impurities',
        'heater': 'An appliance that generates warmth or raises ambient temperature',
        'cooler': 'A container or device that preserves low temperatures',
        'rubber': 'A tough elastic polymeric substance made from latex or produced synthetically',
        'view': 'To look at or observe something; to see or watch',
        'law': 'A system of rules that are created and enforced through social or governmental institutions',
        'post': 'An upright pole or pillar used for support or marking a boundary',
        'before': 'At an earlier time; previously or in advance',
        'because': 'For the reason that; since; due to the fact that',
        'input': 'Data or information entered into a computer or system',
        'effort': 'A vigorous or determined attempt; physical or mental exertion',
        'generally': 'In most cases; usually; as a rule',
        'heat': 'The quality of being hot; thermal energy that causes temperature to rise',
        'chemical': 'A substance with a distinct molecular composition that is produced by or used in chemistry',
        'contrast': 'The state of being strikingly different from something else in juxtaposition',
        'telephone': 'An electronic device used for voice communication over long distances',
        'news': 'Recent information about current events or developments',
        'reply': 'To respond or answer to a question, statement, or message',
        'fitness': 'The state of being physically healthy and in good condition',
        'forest': 'A large area of land covered with trees and undergrowth'
    }
    
    if word_lower in fixes:
        return fixes[word_lower]
    
    # Generic patterns based on word endings
    if word.endswith('er'):
        base_word = word[:-2]
        return f"A person or device that performs the action of {base_word}ing"
    elif word.endswith('ing'):
        return f"The action or process of {word[:-3]}e" if word.endswith('ing') else f"The action or process of {word[:-3]}"
    
    return f"[NEEDS MANUAL REVIEW] {bad_definition}"

def main():
    """Main function to analyze and fix circular definitions."""
    print("🔍 Analyzing puzzle.json for circular definitions...")
    
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
    
    # Find circular definitions
    circular_defs = find_circular_definitions(puzzle_data)
    
    if not circular_defs:
        print("✅ No circular definitions found!")
        return
    
    print(f"⚠️  Found {len(circular_defs)} potential circular definitions:")
    print("=" * 80)
    
    for i, (word, definition, location) in enumerate(circular_defs, 1):
        print(f"{i}. Word: '{word}'")
        print(f"   Problem: {definition}")
        print(f"   Suggested fix: {suggest_better_definition(word, definition)}")
        print("-" * 80)
    
    # Auto-fix known cases
    print(f"\n🤖 Attempting to auto-fix known cases...")
    
    if True:  # Always try to fix
        fixed_count = 0
        for entry in puzzle_data:
            word = entry['word']
            for i, definition in enumerate(entry.get('definitions', [])):
                if check_circular_definition(word, definition):
                    new_def = suggest_better_definition(word, definition)
                    if not new_def.startswith('[NEEDS MANUAL REVIEW]'):
                        entry['definitions'][i] = new_def
                        fixed_count += 1
                        print(f"✅ Fixed '{word}': {definition[:50]}... → {new_def[:50]}...")
        
        if fixed_count > 0:
            # Save the fixed data
            with open('puzzle.json', 'w', encoding='utf-8') as f:
                json.dump(puzzle_data, f, indent=2, ensure_ascii=False)
            print(f"\n🎉 Auto-fixed {fixed_count} definitions and saved to puzzle.json")
        else:
            print("\n💡 No auto-fixes were applied (all need manual review)")
    
    print("\n📝 Manual review recommended for remaining cases!")
    print("Consider using authoritative dictionary sources for proper definitions.")

if __name__ == '__main__':
    main()