#!/usr/bin/env python3
import json
import re
from collections import defaultdict

def load_puzzle_data():
    with open('puzzle.json', 'r') as f:
        return json.load(f)

def check_synonym_relevance(word, synonyms):
    """Check if synonyms seem related to the word"""
    issues = []
    
    # Common patterns that indicate mismatched synonyms
    suspicious_patterns = {
        'time_words': ['quick', 'fast', 'rapid', 'swift', 'brief', 'short', 'long', 'slow'],
        'size_words': ['big', 'small', 'large', 'tiny', 'huge', 'little', 'vast', 'narrow'],
        'quality_words': ['good', 'bad', 'nice', 'poor', 'excellent', 'terrible'],
    }
    
    # Check if word is a noun/verb but has adjective synonyms
    for category, words in suspicious_patterns.items():
        if any(syn in words for syn in synonyms) and word not in words:
            # Check if the word could reasonably have these synonyms
            if category == 'time_words' and word not in ['moment', 'instant', 'duration', 'period', 'time', 'speed']:
                issues.append(f"Has time-related synonyms: {[s for s in synonyms if s in words]}")
            elif category == 'size_words' and word not in ['size', 'amount', 'quantity', 'scale']:
                issues.append(f"Has size-related synonyms: {[s for s in synonyms if s in words]}")
    
    return issues

def check_antonym_pairs(synonyms, antonyms):
    """Check if any synonyms appear as antonyms"""
    overlap = set(synonyms) & set(antonyms)
    if overlap:
        return [f"Words appear in both synonyms and antonyms: {list(overlap)}"]
    return []

def check_definition_relevance(word, definitions):
    """Check if definitions contain the word or seem relevant"""
    issues = []
    
    # Check for empty or very short definitions
    for i, defn in enumerate(definitions):
        if len(defn) < 10:
            issues.append(f"Definition {i+1} is suspiciously short: '{defn}'")
        
        # Check if definition might be for a different word
        if '[blank]' not in defn and word.lower() not in defn.lower():
            # Look for other common words that might indicate wrong definition
            common_words = ['the', 'a', 'an', 'to', 'of', 'in', 'for', 'with', 'on', 'at']
            content_words = [w for w in defn.lower().split() if w not in common_words and len(w) > 3]
            if content_words and not any(w in word.lower() or word.lower() in w for w in content_words[:5]):
                # Skip this check for very short words
                if len(word) > 2:
                    pass  # Could flag but might have too many false positives
    
    return issues

def check_examples_format(examples):
    """Check if examples follow the [blank] format"""
    issues = []
    for i, example in enumerate(examples):
        if '[blank]' not in example:
            issues.append(f"Example {i+1} missing [blank] placeholder: '{example[:50]}...'")
    return []  # Don't report these as they might be intentional

def analyze_puzzle_quality():
    data = load_puzzle_data()
    report = defaultdict(list)
    
    print(f"Analyzing {len(data)} puzzle entries...\n")
    
    for entry in data:
        word = entry.get('word', '')
        synonyms = entry.get('synonyms', [])
        antonyms = entry.get('antonyms', [])
        definitions = entry.get('definitions', [])
        examples = entry.get('examples', [])
        
        issues = []
        
        # Check synonyms
        syn_issues = check_synonym_relevance(word, synonyms)
        if syn_issues:
            issues.extend(syn_issues)
        
        # Check synonym/antonym overlap
        overlap_issues = check_antonym_pairs(synonyms, antonyms)
        if overlap_issues:
            issues.extend(overlap_issues)
        
        # Check definitions
        def_issues = check_definition_relevance(word, definitions)
        if def_issues:
            issues.extend(def_issues)
        
        # Check for empty synonym/antonym lists (might need enrichment)
        if not synonyms and len(definitions) > 2:
            issues.append("No synonyms provided despite multiple definitions")
        
        if issues:
            report[word] = issues
    
    # Print report
    if report:
        print(f"Found potential issues in {len(report)} entries:\n")
        
        # Sort by number of issues
        sorted_report = sorted(report.items(), key=lambda x: len(x[1]), reverse=True)
        
        for word, issues in sorted_report[:50]:  # Show top 50 problematic entries
            print(f"\n{word.upper()}:")
            for issue in issues:
                print(f"  - {issue}")
    else:
        print("No major quality issues found!")
    
    # Summary statistics
    print(f"\n\nSUMMARY:")
    print(f"Total entries: {len(data)}")
    print(f"Entries with issues: {len(report)}")
    print(f"Entries without synonyms: {sum(1 for e in data if not e.get('synonyms'))}")
    print(f"Entries without antonyms: {sum(1 for e in data if not e.get('antonyms'))}")
    print(f"Entries without examples: {sum(1 for e in data if not e.get('examples'))}")

if __name__ == "__main__":
    analyze_puzzle_quality()