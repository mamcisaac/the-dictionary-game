#!/usr/bin/env python3
import json
from collections import defaultdict

def analyze_improvements():
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    print("REMAINING IMPROVEMENT OPPORTUNITIES")
    print("=" * 50)
    
    # Statistics
    total_words = len(data)
    no_synonyms = 0
    no_antonyms = 0
    few_examples = 0
    short_definitions = 0
    single_definition = 0
    few_clues = 0
    
    # Detailed analysis
    words_needing_synonyms = []
    words_needing_antonyms = []
    words_needing_examples = []
    words_with_few_clues = []
    
    for entry in data:
        word = entry.get('word', '')
        synonyms = entry.get('synonyms', [])
        antonyms = entry.get('antonyms', [])
        definitions = entry.get('definitions', [])
        examples = entry.get('examples', [])
        
        # Calculate total clues
        total_clues = len(definitions) + (1 if synonyms else 0) + (1 if antonyms else 0) + len(examples)
        
        # Check for missing synonyms
        if not synonyms:
            no_synonyms += 1
            if len(definitions) >= 3:  # Priority: words with multiple definitions
                words_needing_synonyms.append((word, len(definitions)))
        
        # Check for missing antonyms (only for words that could have them)
        if not antonyms and word not in ['the', 'a', 'an', 'to', 'of', 'in', 'for']:
            no_antonyms += 1
            # Check if word is adjective/verb that might have antonyms
            if any(d.lower().startswith(('having', 'being', 'to make', 'to become', 'not', 'more', 'less')) for d in definitions):
                words_needing_antonyms.append(word)
        
        # Check for few examples
        if len(examples) < 2:
            few_examples += 1
            if len(examples) == 0:
                words_needing_examples.append(word)
        
        # Check for very short definitions
        if any(len(d) < 20 for d in definitions):
            short_definitions += 1
        
        # Check for single definition
        if len(definitions) == 1:
            single_definition += 1
        
        # Check for words with very few total clues
        if total_clues < 5:
            few_clues += 1
            words_with_few_clues.append((word, total_clues))
    
    # Print findings
    print(f"\n📊 STATISTICS:")
    print(f"Total words: {total_words}")
    print(f"Words without synonyms: {no_synonyms} ({no_synonyms/total_words*100:.1f}%)")
    print(f"Words without antonyms: {no_antonyms} ({no_antonyms/total_words*100:.1f}%)")
    print(f"Words with <2 examples: {few_examples} ({few_examples/total_words*100:.1f}%)")
    print(f"Words with short definitions: {short_definitions}")
    print(f"Words with only 1 definition: {single_definition}")
    print(f"Words with <5 total clues: {few_clues}")
    
    print(f"\n🎯 TOP PRIORITIES FOR IMPROVEMENT:")
    
    print(f"\n1. ENRICH SYNONYMS (High impact on gameplay):")
    sorted_syn = sorted(words_needing_synonyms, key=lambda x: x[1], reverse=True)[:10]
    for word, def_count in sorted_syn:
        print(f"   - {word} ({def_count} definitions but no synonyms)")
    
    print(f"\n2. ADD EXAMPLES (Improves hint quality):")
    for word in words_needing_examples[:10]:
        print(f"   - {word} (no examples)")
    
    print(f"\n3. WORDS WITH VERY FEW CLUES (Critical for gameplay):")
    sorted_clues = sorted(words_with_few_clues, key=lambda x: x[1])[:10]
    for word, clue_count in sorted_clues:
        print(f"   - {word} (only {clue_count} total clues)")
    
    print(f"\n4. POTENTIAL ANTONYM CANDIDATES:")
    for word in words_needing_antonyms[:10]:
        print(f"   - {word}")
    
    # Game balance analysis
    print(f"\n🎮 GAME BALANCE ANALYSIS:")
    clue_distribution = defaultdict(int)
    for entry in data:
        total = len(entry['definitions']) + (1 if entry['synonyms'] else 0) + (1 if entry['antonyms'] else 0) + len(entry['examples'])
        clue_distribution[total] += 1
    
    print("Clue count distribution:")
    for clues in sorted(clue_distribution.keys()):
        print(f"   {clues} clues: {clue_distribution[clues]} words")
    
    print(f"\n💡 RECOMMENDATIONS:")
    print("1. Focus on enriching the 528 words without synonyms (Issue #1)")
    print("2. Add examples to words with 0-1 examples for better hints")
    print("3. Enrich words with <5 total clues to improve game balance")
    print("4. Consider adding more definitions to single-definition words")
    print("5. Add antonyms where semantically appropriate")

if __name__ == "__main__":
    analyze_improvements()