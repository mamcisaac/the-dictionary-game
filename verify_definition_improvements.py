#!/usr/bin/env python3
import json

def verify_improvements():
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    short_defs = 0
    very_short_defs = 0
    single_def_words = 0
    
    for entry in data:
        definitions = entry.get('definitions', [])
        
        if len(definitions) == 1:
            single_def_words += 1
            
        for defn in definitions:
            if len(defn) < 20:
                very_short_defs += 1
            elif len(defn) < 30:
                short_defs += 1
    
    print("DEFINITION QUALITY VERIFICATION")
    print("=" * 50)
    print(f"Words with single definition: {single_def_words}")
    print(f"Definitions under 20 chars: {very_short_defs}")
    print(f"Definitions under 30 chars: {short_defs}")
    
    # Check specific improvements
    print("\nSPECIFIC IMPROVEMENTS VERIFIED:")
    
    # Check evaluation and density
    for entry in data:
        if entry['word'] in ['evaluation', 'density']:
            print(f"\n{entry['word'].upper()}: Now has {len(entry['definitions'])} definitions")
            
    # Check some expanded definitions
    samples = ['view', 'good', 'little', 'heat']
    for entry in data:
        if entry['word'] in samples:
            print(f"\n{entry['word'].upper()} definitions:")
            for defn in entry['definitions']:
                if len(defn) > 20:
                    print(f"  ✓ '{defn[:50]}...' ({len(defn)} chars)")
                else:
                    print(f"  ✗ '{defn}' ({len(defn)} chars - still short)")

if __name__ == "__main__":
    verify_improvements()