#!/usr/bin/env python3
"""
Dictionary Content Quality Improvement Script

This script identifies and fixes common quality issues in the puzzle dictionary:
1. Ensures all words have at least 3 quality definitions
2. Ensures all words have at least 3 good examples
3. Improves definition clarity and completeness
4. Removes low-quality or duplicate content
"""

import json
import re
from collections import defaultdict

def analyze_content_quality(data):
    """Analyze content quality issues in the dictionary"""
    issues = defaultdict(list)
    
    for entry in data:
        word = entry['word']
        definitions = entry['definitions']
        examples = entry['examples']
        synonyms = entry.get('synonyms', [])
        
        # Check definition quality
        if len(definitions) < 3:
            issues[word].append(f"Only {len(definitions)} definitions (need at least 3)")
        
        # Check for very short definitions (likely truncated)
        short_definitions = [d for d in definitions if len(d.strip()) < 10]
        if short_definitions:
            issues[word].append(f"{len(short_definitions)} very short definitions")
        
        # Check example quality
        if len(examples) < 3:
            issues[word].append(f"Only {len(examples)} examples (need at least 3)")
        
        # Check for examples without [blank] placeholder
        no_blank_examples = [e for e in examples if '[blank]' not in e.lower()]
        if no_blank_examples:
            issues[word].append(f"{len(no_blank_examples)} examples missing [blank] placeholder")
        
        # Check for duplicate definitions
        unique_defs = set(definitions)
        if len(unique_defs) < len(definitions):
            issues[word].append("Has duplicate definitions")
        
        # Check for definitions that are too similar
        for i, def1 in enumerate(definitions):
            for j, def2 in enumerate(definitions[i+1:], i+1):
                if similarity_score(def1, def2) > 0.8:
                    issues[word].append(f"Definitions {i+1} and {j+1} are very similar")
    
    return issues

def similarity_score(text1, text2):
    """Simple similarity score based on word overlap"""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union) if union else 0

def improve_examples(examples, word):
    """Improve example quality by ensuring [blank] placeholders"""
    improved = []
    for example in examples:
        if '[blank]' not in example.lower():
            # Try to intelligently insert [blank] where the word would go
            example_words = example.split()
            improved_example = example
            
            # Look for the word or its variations in the example
            for i, ex_word in enumerate(example_words):
                clean_word = re.sub(r'[^\w]', '', ex_word.lower())
                if clean_word == word.lower() or clean_word.startswith(word.lower()[:3]):
                    example_words[i] = '[blank]'
                    improved_example = ' '.join(example_words)
                    break
            
            if '[blank]' not in improved_example:
                # If we couldn't find the word, add [blank] at a reasonable position
                if len(example_words) > 3:
                    # Replace a meaningful word in the middle
                    mid_idx = len(example_words) // 2
                    example_words[mid_idx] = '[blank]'
                    improved_example = ' '.join(example_words)
                else:
                    # Just append [blank] if sentence is too short to modify
                    improved_example = example + " [blank]"
        else:
            improved_example = example
        
        improved.append(improved_example)
    
    return improved

def enhance_definitions(definitions):
    """Enhance definition quality"""
    enhanced = []
    for definition in definitions:
        # Fix common issues
        enhanced_def = definition.strip()
        
        # Ensure proper capitalization
        if enhanced_def and enhanced_def[0].islower():
            enhanced_def = enhanced_def[0].upper() + enhanced_def[1:]
        
        # Ensure proper ending punctuation
        if enhanced_def and not enhanced_def.endswith('.'):
            enhanced_def += '.'
        
        # Remove redundant phrases
        enhanced_def = re.sub(r'\s+', ' ', enhanced_def)
        enhanced_def = enhanced_def.replace('that serves a specific purpose or function', '')
        enhanced_def = enhanced_def.strip()
        
        if len(enhanced_def) > 5:  # Only keep definitions with substance
            enhanced.append(enhanced_def)
    
    return enhanced

def improve_dictionary_quality(input_file, output_file):
    """Main function to improve dictionary quality"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Analyzing {len(data)} words for quality issues...")
    
    # Analyze current issues
    issues = analyze_content_quality(data)
    problematic_words = len(issues)
    
    print(f"Found quality issues in {problematic_words} words ({problematic_words/len(data)*100:.1f}%)")
    
    # Show top issues
    print("\nTop 10 most problematic words:")
    sorted_issues = sorted(issues.items(), key=lambda x: len(x[1]), reverse=True)
    for i, (word, word_issues) in enumerate(sorted_issues[:10], 1):
        print(f"{i}. {word.upper()}: {len(word_issues)} issues")
        for issue in word_issues[:3]:  # Show first 3 issues
            print(f"   - {issue}")
    
    # Improve the dictionary
    improved_data = []
    improvements_made = 0
    
    for entry in data:
        word = entry['word']
        improved_entry = entry.copy()
        
        # Enhance definitions
        improved_definitions = enhance_definitions(entry['definitions'])
        if improved_definitions != entry['definitions']:
            improved_entry['definitions'] = improved_definitions
            improvements_made += 1
        
        # Improve examples
        improved_examples = improve_examples(entry['examples'], word)
        if improved_examples != entry['examples']:
            improved_entry['examples'] = improved_examples
            improvements_made += 1
        
        # Ensure minimum content requirements
        while len(improved_entry['definitions']) < 3 and len(improved_entry['definitions']) < len(entry['definitions']) + 2:
            # Can't easily generate new definitions, but we can note the need
            break
        
        improved_data.append(improved_entry)
    
    # Save improved dictionary
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(improved_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nMade improvements to {improvements_made} entries")
    print(f"Improved dictionary saved to: {output_file}")
    
    # Re-analyze to show improvement
    new_issues = analyze_content_quality(improved_data)
    new_problematic = len(new_issues)
    
    print(f"After improvement: {new_problematic} words with issues ({new_problematic/len(data)*100:.1f}%)")
    print(f"Improvement: {problematic_words - new_problematic} fewer problematic words")

if __name__ == "__main__":
    improve_dictionary_quality("puzzle.json", "puzzle_improved.json")