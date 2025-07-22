#!/usr/bin/env python3
"""
Analyze puzzle.json to check if all words meet the following criteria:
1. At least 4 definitions
2. At least 2 examples
3. At least 4 letters (to allow 3 letter reveals after the first letter)
"""

import json
from collections import defaultdict

def analyze_puzzle_data():
    # Load the puzzle data
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    # Initialize counters and lists for problematic words
    problems = {
        'less_than_4_definitions': [],
        'less_than_2_examples': [],
        'less_than_4_letters': [],
        'no_definitions': [],
        'no_examples': []
    }
    
    total_words = len(data)
    definition_counts = []
    example_counts = []
    
    # Analyze each word
    for word_data in data:
        word = word_data.get('word', '')
        
        # Check word length
        if len(word) < 4:
            problems['less_than_4_letters'].append(word)
        
        # Count definitions
        definitions = word_data.get('definitions', [])
        def_count = len(definitions)
        definition_counts.append(def_count)
        
        if def_count == 0:
            problems['no_definitions'].append(word)
        elif def_count < 4:
            problems['less_than_4_definitions'].append((word, def_count))
        
        # Count examples
        examples = word_data.get('examples', [])
        ex_count = len(examples)
        example_counts.append(ex_count)
        
        if ex_count == 0:
            problems['no_examples'].append(word)
        elif ex_count < 2:
            problems['less_than_2_examples'].append((word, ex_count))
    
    # Print comprehensive report
    print("PUZZLE.JSON ANALYSIS REPORT")
    print("=" * 50)
    print(f"\nTotal words analyzed: {total_words}")
    
    # Word length analysis
    print(f"\n1. WORD LENGTH ANALYSIS (minimum 4 letters required)")
    print(f"   - Words with less than 4 letters: {len(problems['less_than_4_letters'])}")
    if problems['less_than_4_letters']:
        print(f"   - Problematic words: {', '.join(problems['less_than_4_letters'][:10])}")
        if len(problems['less_than_4_letters']) > 10:
            print(f"     ... and {len(problems['less_than_4_letters']) - 10} more")
    
    # Definition analysis
    print(f"\n2. DEFINITION ANALYSIS (minimum 4 definitions required)")
    print(f"   - Words with NO definitions: {len(problems['no_definitions'])}")
    print(f"   - Words with less than 4 definitions: {len(problems['less_than_4_definitions'])}")
    print(f"   - Average definitions per word: {sum(definition_counts) / len(definition_counts):.2f}")
    print(f"   - Min definitions: {min(definition_counts)}")
    print(f"   - Max definitions: {max(definition_counts)}")
    
    if problems['less_than_4_definitions']:
        print("\n   Examples of words with insufficient definitions:")
        for word, count in problems['less_than_4_definitions'][:10]:
            print(f"     - '{word}': {count} definition(s)")
        if len(problems['less_than_4_definitions']) > 10:
            print(f"     ... and {len(problems['less_than_4_definitions']) - 10} more")
    
    # Example analysis
    print(f"\n3. EXAMPLE ANALYSIS (minimum 2 examples required)")
    print(f"   - Words with NO examples: {len(problems['no_examples'])}")
    print(f"   - Words with less than 2 examples: {len(problems['less_than_2_examples'])}")
    print(f"   - Average examples per word: {sum(example_counts) / len(example_counts):.2f}")
    print(f"   - Min examples: {min(example_counts)}")
    print(f"   - Max examples: {max(example_counts)}")
    
    if problems['less_than_2_examples']:
        print("\n   Examples of words with insufficient examples:")
        for word, count in problems['less_than_2_examples'][:10]:
            print(f"     - '{word}': {count} example(s)")
        if len(problems['less_than_2_examples']) > 10:
            print(f"     ... and {len(problems['less_than_2_examples']) - 10} more")
    
    # Summary of feasibility
    print("\n" + "=" * 50)
    print("FEASIBILITY SUMMARY FOR 9-CLUE STANDARDIZATION:")
    print("=" * 50)
    
    total_problematic = (len(problems['less_than_4_letters']) + 
                        len(problems['less_than_4_definitions']) + 
                        len(problems['less_than_2_examples']))
    
    print(f"\nTotal words with at least one issue: {total_problematic}")
    print(f"Percentage of words that meet ALL criteria: {((total_words - total_problematic) / total_words) * 100:.1f}%")
    
    # Breakdown by issue type
    print("\nBreakdown by issue type:")
    print(f"- Length issues (<4 letters): {len(problems['less_than_4_letters'])} words ({(len(problems['less_than_4_letters']) / total_words) * 100:.1f}%)")
    print(f"- Definition issues (<4 defs): {len(problems['less_than_4_definitions'])} words ({(len(problems['less_than_4_definitions']) / total_words) * 100:.1f}%)")
    print(f"- Example issues (<2 examples): {len(problems['less_than_2_examples'])} words ({(len(problems['less_than_2_examples']) / total_words) * 100:.1f}%)")
    
    # Check for words with multiple issues
    multi_issue_words = []
    all_words = [word_data.get('word', '') for word_data in data]
    for word in all_words:
        issue_count = 0
        issues = []
        if word in problems['less_than_4_letters']:
            issue_count += 1
            issues.append("length")
        if any(w == word for w, _ in problems['less_than_4_definitions']):
            issue_count += 1
            issues.append("definitions")
        if any(w == word for w, _ in problems['less_than_2_examples']):
            issue_count += 1
            issues.append("examples")
        
        if issue_count > 1:
            multi_issue_words.append((word, issues))
    
    if multi_issue_words:
        print(f"\n{len(multi_issue_words)} words have MULTIPLE issues:")
        for word, issues in multi_issue_words[:5]:
            print(f"  - '{word}': {', '.join(issues)}")
        if len(multi_issue_words) > 5:
            print(f"  ... and {len(multi_issue_words) - 5} more")
    
    # Distribution analysis
    print("\n" + "=" * 50)
    print("DISTRIBUTION ANALYSIS:")
    print("=" * 50)
    
    # Definition distribution
    def_distribution = defaultdict(int)
    for count in definition_counts:
        def_distribution[count] += 1
    
    print("\nDefinition count distribution:")
    for i in range(0, min(10, max(def_distribution.keys()) + 1)):
        if i in def_distribution:
            print(f"  {i} definitions: {def_distribution[i]} words")
    if max(def_distribution.keys()) >= 10:
        print(f"  10+ definitions: {sum(def_distribution[k] for k in def_distribution if k >= 10)} words")
    
    # Example distribution
    ex_distribution = defaultdict(int)
    for count in example_counts:
        ex_distribution[count] += 1
    
    print("\nExample count distribution:")
    for i in range(0, min(10, max(ex_distribution.keys()) + 1)):
        if i in ex_distribution:
            print(f"  {i} examples: {ex_distribution[i]} words")
    if max(ex_distribution.keys()) >= 10:
        print(f"  10+ examples: {sum(ex_distribution[k] for k in ex_distribution if k >= 10)} words")

if __name__ == "__main__":
    analyze_puzzle_data()