#!/usr/bin/env python3
import json
import re
from collections import defaultdict

def load_puzzle_data():
    with open('puzzle.json', 'r') as f:
        return json.load(f)

def check_definition_quality(word, definitions):
    """Check various quality issues with definitions"""
    issues = []
    
    for i, defn in enumerate(definitions):
        # 1. Check for very short definitions
        if len(defn) < 10:
            issues.append(f"Definition {i+1} too short ({len(defn)} chars): '{defn}'")
        
        # 2. Check for missing punctuation
        if defn and defn[-1] not in '.?!:;)':
            issues.append(f"Definition {i+1} missing ending punctuation: '{defn[-20:]}'")
        
        # 3. Check for typos/formatting issues
        # Check for missing spaces after punctuation
        if re.search(r'[.,:;][a-zA-Z]', defn):
            issues.append(f"Definition {i+1} missing space after punctuation: '{defn[:50]}...'")
        
        # Check for double spaces
        if '  ' in defn:
            issues.append(f"Definition {i+1} has double spaces")
        
        # 4. Check for broken words/concatenations
        if re.search(r'[a-z][A-Z]', defn) and '[blank]' not in defn:
            issues.append(f"Definition {i+1} has possible word concatenation: '{defn[:50]}...'")
        
        # 5. Check for encoding issues
        if '\\u' in defn or '\u00ef' in defn:
            issues.append(f"Definition {i+1} has encoding issues")
        
        # 6. Check for incomplete sentences
        if defn.count('(') != defn.count(')'):
            issues.append(f"Definition {i+1} has mismatched parentheses")
        
        # 7. Check for definitions that seem cut off
        if len(defn) > 20 and not defn[-1] in '.?!:;)' and not defn.endswith('etc'):
            last_words = ' '.join(defn.split()[-3:])
            issues.append(f"Definition {i+1} may be cut off: '...{last_words}'")
        
        # 8. Check for placeholder text
        if any(placeholder in defn.lower() for placeholder in ['todo', 'fixme', 'xxx', 'tbd']):
            issues.append(f"Definition {i+1} contains placeholder text")
        
        # 9. Check for duplicate definitions
        for j, other_defn in enumerate(definitions[i+1:], i+1):
            if defn == other_defn:
                issues.append(f"Definition {i+1} is duplicate of definition {j+1}")
                break
        
        # 10. Check for definitions that don't make grammatical sense
        # Look for fragments that suggest something is wrong
        if defn.lower().startswith(('that ', 'which ', 'or ', 'and ')):
            issues.append(f"Definition {i+1} starts with conjunction/relative pronoun: '{defn[:30]}...'")
    
    return issues

def analyze_all_definitions():
    data = load_puzzle_data()
    all_issues = defaultdict(list)
    
    # Statistics
    total_definitions = 0
    definition_lengths = []
    
    print("Analyzing definitions for quality issues...\n")
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        
        total_definitions += len(definitions)
        definition_lengths.extend([len(d) for d in definitions])
        
        issues = check_definition_quality(word, definitions)
        if issues:
            all_issues[word] = issues
    
    # Print detailed report
    print(f"DEFINITION QUALITY REPORT")
    print(f"=" * 50)
    print(f"Total words analyzed: {len(data)}")
    print(f"Total definitions: {total_definitions}")
    print(f"Average definitions per word: {total_definitions/len(data):.1f}")
    print(f"Average definition length: {sum(definition_lengths)/len(definition_lengths):.1f} characters")
    print(f"Words with issues: {len(all_issues)}")
    print(f"\nMOST PROBLEMATIC ENTRIES:\n")
    
    # Sort by number of issues
    sorted_issues = sorted(all_issues.items(), key=lambda x: len(x[1]), reverse=True)
    
    # Show top 30 problematic entries
    for word, issues in sorted_issues[:30]:
        print(f"\n{word.upper()} ({len(issues)} issues):")
        # Show first 3 issues for each word
        for issue in issues[:3]:
            print(f"  - {issue}")
        if len(issues) > 3:
            print(f"  ... and {len(issues)-3} more issues")
    
    # Summary of issue types
    print(f"\n\nISSUE TYPE SUMMARY:")
    issue_counts = defaultdict(int)
    for issues in all_issues.values():
        for issue in issues:
            if "too short" in issue:
                issue_counts["Too short"] += 1
            elif "missing ending punctuation" in issue:
                issue_counts["Missing punctuation"] += 1
            elif "missing space" in issue:
                issue_counts["Missing space after punctuation"] += 1
            elif "double spaces" in issue:
                issue_counts["Double spaces"] += 1
            elif "concatenation" in issue:
                issue_counts["Word concatenation"] += 1
            elif "encoding" in issue:
                issue_counts["Encoding issues"] += 1
            elif "mismatched parentheses" in issue:
                issue_counts["Mismatched parentheses"] += 1
            elif "cut off" in issue:
                issue_counts["Possibly cut off"] += 1
            elif "duplicate" in issue:
                issue_counts["Duplicate definitions"] += 1
            elif "starts with conjunction" in issue:
                issue_counts["Starts with conjunction"] += 1
    
    for issue_type, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {issue_type}: {count}")
    
    # Find specific patterns
    print(f"\n\nSPECIFIC PATTERNS FOUND:")
    
    # Check for common typos
    typo_patterns = []
    for entry in data:
        for defn in entry.get('definitions', []):
            if 'teh' in defn.lower():
                typo_patterns.append(f"{entry['word']}: 'teh' instead of 'the'")
            if 'taht' in defn.lower():
                typo_patterns.append(f"{entry['word']}: 'taht' instead of 'that'")
            if 'adn' in defn.lower() and 'adn' not in entry['word'].lower():
                typo_patterns.append(f"{entry['word']}: 'adn' instead of 'and'")
    
    if typo_patterns:
        print("Common typos found:")
        for typo in typo_patterns[:10]:
            print(f"  - {typo}")
    
    return all_issues

if __name__ == "__main__":
    analyze_all_definitions()