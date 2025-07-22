#!/usr/bin/env python3
import json

def load_puzzle_data():
    with open('puzzle.json', 'r') as f:
        return json.load(f)

def find_suspicious_synonyms():
    data = load_puzzle_data()
    
    # Words that are commonly misassigned
    time_adjectives = {'quick', 'fast', 'rapid', 'swift', 'brief', 'short', 'slow', 'long'}
    size_adjectives = {'big', 'small', 'large', 'tiny', 'huge', 'little', 'vast', 'narrow', 'wide'}
    
    print("CHECKING FOR MISMATCHED SYNONYMS:\n")
    
    issues_found = []
    
    for entry in data:
        word = entry.get('word', '')
        synonyms = entry.get('synonyms', [])
        definitions = entry.get('definitions', [])
        
        # Check if word has time/size adjectives but doesn't seem related
        word_lower = word.lower()
        
        # Check time adjectives
        time_syns = [s for s in synonyms if s in time_adjectives]
        if time_syns and word_lower not in ['time', 'moment', 'period', 'duration', 'instant', 'speed', 'temporary', 'report']:
            # Check if any definition mentions time/speed/duration
            time_related = any(any(t in d.lower() for t in ['time', 'duration', 'speed', 'quick', 'fast', 'brief', 'moment', 'temporary']) 
                              for d in definitions)
            if not time_related:
                issues_found.append({
                    'word': word,
                    'issue': 'time_synonyms',
                    'synonyms': time_syns,
                    'definitions': definitions[:2]  # First 2 definitions
                })
        
        # Check size adjectives
        size_syns = [s for s in synonyms if s in size_adjectives]
        if size_syns and word_lower not in ['size', 'scale', 'amount', 'quantity', 'dimension']:
            # Check if any definition mentions size
            size_related = any(any(t in d.lower() for t in ['size', 'large', 'small', 'big', 'dimension', 'scale']) 
                              for d in definitions)
            if not size_related:
                issues_found.append({
                    'word': word,
                    'issue': 'size_synonyms',
                    'synonyms': size_syns,
                    'definitions': definitions[:2]
                })
    
    # Print findings
    for issue in issues_found[:20]:  # Show first 20 issues
        print(f"\n{issue['word'].upper()}:")
        print(f"  Issue: Has {issue['issue'].replace('_', ' ')} but definitions don't match")
        print(f"  Suspicious synonyms: {issue['synonyms']}")
        print(f"  First definition: {issue['definitions'][0][:100]}...")
        
    print(f"\n\nTotal suspicious entries found: {len(issues_found)}")

if __name__ == "__main__":
    find_suspicious_synonyms()