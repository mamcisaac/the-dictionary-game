#!/usr/bin/env python3
"""
Fix definitions that start with conjunctions or relative pronouns.
"""

import json
import re
from typing import Dict, List, Tuple

def fix_definition(word: str, definition: str) -> str:
    """
    Fix a definition that starts with a conjunction or relative pronoun.
    Returns the fixed definition.
    """
    
    # Pattern to match problematic starts
    problematic_pattern = r'^(that|which|or|and|where|when|who|whose|whom|but|because|although|though|while|if|unless|since|as|so|nor|yet|for|after|before|until|whether|whereas)\s'
    
    # Check if definition starts with a problematic word (case-insensitive)
    match = re.match(problematic_pattern, definition, re.IGNORECASE)
    if not match:
        return definition
    
    # Get the problematic starting word
    start_word = match.group(1).lower()
    
    # Handle specific patterns based on the starting word and context
    if start_word == "that":
        if re.match(r'^that which\s', definition, re.IGNORECASE):
            # "That which..." pattern - convert to noun phrase
            return f"Something {definition[5:]}"
        elif re.match(r'^that upon which\s', definition, re.IGNORECASE):
            # "That upon which..." pattern
            return f"Something {definition[5:]}"
        elif re.match(r'^that part of\s', definition, re.IGNORECASE):
            # "That part of..." pattern
            return f"The part of{definition[13:]}"
        elif re.match(r'^that (has|is|can|was|were|are|have|had|will|would|could|should|may|might)\s', definition, re.IGNORECASE):
            # "That has/is/can..." pattern - describing a characteristic
            return f"Something {definition[5:]}"
        else:
            # General "That..." pattern
            return f"Something {definition[5:]}"
    
    elif start_word == "which":
        # "Which..." pattern - add "Something" prefix
        return f"Something {definition}"
    
    elif start_word == "for":
        if re.match(r'^for the reason', definition, re.IGNORECASE):
            # "For the reason..." pattern
            return f"Because of the reason{definition[14:]}"
        elif re.match(r'^for all of', definition, re.IGNORECASE):
            # "For all of..." pattern
            return f"Throughout{definition[10:]}"
        elif re.match(r'^for information', definition, re.IGNORECASE):
            # "For information..." pattern
            return f"Used {definition}"
        else:
            # General "For..." pattern
            return f"Used {definition}"
    
    elif start_word == "as":
        if re.match(r'^as a result of', definition, re.IGNORECASE):
            # "As a result of..." pattern
            return f"Following or resulting from something"
        elif re.match(r'^as is known', definition, re.IGNORECASE):
            # "As is known..." pattern
            return definition[3:].capitalize()
        elif re.match(r'^as long as', definition, re.IGNORECASE):
            # "As long as..." pattern
            return f"During the time that something continues"
        elif re.match(r'^as soon as', definition, re.IGNORECASE):
            # "As soon as..." pattern
            return "Immediately when something happens"
        elif re.match(r'^as a rule', definition, re.IGNORECASE):
            # "As a rule..." pattern
            return definition[11:].strip().capitalize()
        elif re.match(r'^as if performed', definition, re.IGNORECASE):
            # "As if performed..." pattern
            return f"In a manner {definition[3:]}"
        elif re.match(r'^as a (subject|topic|matter) of', definition, re.IGNORECASE):
            # "As a subject/topic/matter of..." pattern
            return f"In the context of being {definition[3:]}"
        else:
            # General "As..." pattern
            return f"In the manner of {definition[3:]}"
    
    elif start_word == "after":
        # "After..." pattern
        return f"Following {definition[6:]}"
    
    elif start_word == "before":
        # "Before..." pattern
        return f"Prior to when {definition[7:]}"
    
    elif start_word == "when":
        if "smiling" in definition.lower()[:20]:
            # "When smiling..." pattern (specific case for 'apple')
            return f"The area visible {definition}"
        elif re.match(r'^when or that', definition, re.IGNORECASE):
            # "When or that..." pattern
            return "At the time or in the case that"
        elif re.match(r'^when a relief pitcher', definition, re.IGNORECASE):
            # Special case for baseball "save" definition
            return f"A situation {definition}"
        else:
            # General "When..." pattern
            return f"At the time {definition[5:]}"
    
    elif start_word == "where":
        # "Where..." pattern
        return f"A place {definition}"
    
    elif start_word == "whose":
        # "Whose..." pattern
        return f"Something {definition}"
    
    elif start_word == "so":
        if re.match(r'^so that', definition, re.IGNORECASE):
            # "So that..." pattern
            return f"In order {definition[3:]}"
        elif re.match(r'^so as to', definition, re.IGNORECASE):
            # "So as to..." pattern
            return f"In such a way as to{definition[8:]}"
        elif re.match(r'^so scholarly', definition, re.IGNORECASE):
            # "So scholarly..." pattern
            return f"Extremely {definition[3:]}"
        else:
            # General "So..." pattern
            return f"To such an extent; {definition}"
    
    elif start_word == "if":
        if re.match(r'^if not', definition, re.IGNORECASE):
            # "If not..." pattern
            return definition.capitalize()
        else:
            # General "If..." pattern
            return f"In the case {definition[3:]}"
    
    elif start_word == "unless":
        # "Unless..." pattern - these are usually okay as is
        return definition
    
    elif start_word == "while":
        # "While..." pattern
        return f"During the time; {definition}"
    
    elif start_word == "until":
        # "Until..." pattern
        return f"Up to the time {definition[6:]}"
    
    elif start_word == "since":
        if re.match(r'^when or that', definition, re.IGNORECASE):
            # "When or that" pattern under 'since'
            return "At the time or in the case that"
        else:
            # General "Since..." pattern
            return f"From the time {definition[6:]}"
    
    elif start_word == "during":
        # "During..." pattern
        return f"Throughout {definition[7:]}"
    
    elif start_word == "because":
        if re.match(r'^for the reason', definition, re.IGNORECASE):
            # Already has "For the reason"
            return definition.capitalize()
        else:
            # General "Because..." pattern
            return definition.capitalize()
    
    else:
        # Generic fix for other conjunctions
        return f"Used to indicate {definition}"


def process_puzzle_file(input_file: str, output_file: str) -> Tuple[int, List[str]]:
    """
    Process the puzzle.json file and fix problematic definitions.
    Returns the count of fixed definitions and a list of changes made.
    """
    
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    changes = []
    fixed_count = 0
    
    for entry in data:
        word = entry['word']
        for i, definition in enumerate(entry['definitions']):
            fixed_def = fix_definition(word, definition)
            if fixed_def != definition:
                changes.append(f"{word} [{i}]:\n  Old: {definition}\n  New: {fixed_def}")
                entry['definitions'][i] = fixed_def
                fixed_count += 1
    
    # Write the fixed data
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    return fixed_count, changes


def main():
    """Main function to run the script."""
    
    input_file = "puzzle.json"
    output_file = "puzzle.json"  # Overwrite the original file
    
    print("Fixing definitions that start with conjunctions or relative pronouns...")
    print("-" * 80)
    
    try:
        fixed_count, changes = process_puzzle_file(input_file, output_file)
        
        print(f"\nFixed {fixed_count} definitions:\n")
        for change in changes:
            print(change)
            print()
        
        print(f"\nTotal definitions fixed: {fixed_count}")
        print(f"Updated file saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())