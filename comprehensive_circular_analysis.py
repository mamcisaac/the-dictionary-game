#!/usr/bin/env python3
import json
import re

def get_word_forms(word):
    """Generate possible forms of a word"""
    forms = [word]
    word_lower = word.lower()
    
    # Irregular verbs
    irregular = {
        'find': ['found', 'finding', 'finds'],
        'make': ['made', 'making', 'makes', 'maker'],
        'take': ['took', 'taken', 'taking', 'takes', 'taker'],
        'give': ['gave', 'given', 'giving', 'gives', 'giver'],
        'get': ['got', 'gotten', 'getting', 'gets', 'getter'],
        'come': ['came', 'coming', 'comes', 'comer'],
        'go': ['went', 'gone', 'going', 'goes', 'goer'],
        'see': ['saw', 'seen', 'seeing', 'sees', 'seer'],
        'know': ['knew', 'known', 'knowing', 'knows', 'knower'],
        'think': ['thought', 'thinking', 'thinks', 'thinker'],
        'output': ['outputting', 'outputs', 'outputted'],
        'input': ['inputting', 'inputs', 'inputted'],
        'keep': ['kept', 'keeping', 'keeps', 'keeper'],
        'send': ['sent', 'sending', 'sends', 'sender'],
        'save': ['saved', 'saving', 'saves', 'saver'],
        'build': ['built', 'building', 'builds', 'builder'],
        'write': ['wrote', 'written', 'writing', 'writes', 'writer'],
        'read': ['read', 'reading', 'reads', 'reader'],
        'run': ['ran', 'running', 'runs', 'runner'],
        'begin': ['began', 'begun', 'beginning', 'begins', 'beginner'],
        'break': ['broke', 'broken', 'breaking', 'breaks', 'breaker'],
        'speak': ['spoke', 'spoken', 'speaking', 'speaks', 'speaker'],
        'drive': ['drove', 'driven', 'driving', 'drives', 'driver'],
        'choose': ['chose', 'chosen', 'choosing', 'chooses', 'chooser'],
        'rise': ['rose', 'risen', 'rising', 'rises', 'riser'],
        'fall': ['fell', 'fallen', 'falling', 'falls'],
        'grow': ['grew', 'grown', 'growing', 'grows', 'grower'],
        'throw': ['threw', 'thrown', 'throwing', 'throws', 'thrower'],
        'draw': ['drew', 'drawn', 'drawing', 'draws', 'drawer'],
        'fly': ['flew', 'flown', 'flying', 'flies', 'flyer'],
        'swim': ['swam', 'swum', 'swimming', 'swims', 'swimmer'],
        'ring': ['rang', 'rung', 'ringing', 'rings', 'ringer'],
        'sing': ['sang', 'sung', 'singing', 'sings', 'singer'],
        'bring': ['brought', 'bringing', 'brings', 'bringer'],
        'buy': ['bought', 'buying', 'buys', 'buyer'],
        'catch': ['caught', 'catching', 'catches', 'catcher'],
        'teach': ['taught', 'teaching', 'teaches', 'teacher'],
        'fight': ['fought', 'fighting', 'fights', 'fighter'],
        'seek': ['sought', 'seeking', 'seeks', 'seeker'],
        'win': ['won', 'winning', 'wins', 'winner'],
        'lose': ['lost', 'losing', 'loses', 'loser'],
        'pay': ['paid', 'paying', 'pays', 'payer'],
        'meet': ['met', 'meeting', 'meets'],
        'lead': ['led', 'leading', 'leads', 'leader'],
        'feed': ['fed', 'feeding', 'feeds', 'feeder'],
        'hold': ['held', 'holding', 'holds', 'holder'],
        'stand': ['stood', 'standing', 'stands'],
        'understand': ['understood', 'understanding', 'understands'],
        'mean': ['meant', 'meaning', 'means'],
        'leave': ['left', 'leaving', 'leaves', 'leaver'],
        'feel': ['felt', 'feeling', 'feels'],
        'bring': ['brought', 'bringing', 'brings'],
        'tell': ['told', 'telling', 'tells', 'teller'],
        'sell': ['sold', 'selling', 'sells', 'seller'],
        'sit': ['sat', 'sitting', 'sits', 'sitter'],
        'set': ['set', 'setting', 'sets', 'setter'],
        'hit': ['hit', 'hitting', 'hits', 'hitter'],
        'put': ['put', 'putting', 'puts', 'putter'],
        'cut': ['cut', 'cutting', 'cuts', 'cutter'],
        'let': ['let', 'letting', 'lets'],
        'read': ['read', 'reading', 'reads', 'reader'],
        'beat': ['beat', 'beaten', 'beating', 'beats', 'beater'],
        'become': ['became', 'becoming', 'becomes'],
        'begin': ['began', 'begun', 'beginning', 'begins'],
        'drink': ['drank', 'drunk', 'drinking', 'drinks', 'drinker'],
        'eat': ['ate', 'eaten', 'eating', 'eats', 'eater'],
        'forget': ['forgot', 'forgotten', 'forgetting', 'forgets'],
        'forgive': ['forgave', 'forgiven', 'forgiving', 'forgives'],
        'freeze': ['froze', 'frozen', 'freezing', 'freezes', 'freezer'],
        'hide': ['hid', 'hidden', 'hiding', 'hides', 'hider'],
        'ride': ['rode', 'ridden', 'riding', 'rides', 'rider'],
        'shake': ['shook', 'shaken', 'shaking', 'shakes', 'shaker'],
        'steal': ['stole', 'stolen', 'stealing', 'steals', 'stealer'],
        'tear': ['tore', 'torn', 'tearing', 'tears'],
        'wake': ['woke', 'woken', 'waking', 'wakes'],
        'wear': ['wore', 'worn', 'wearing', 'wears', 'wearer']
    }
    
    if word_lower in irregular:
        forms.extend(irregular[word_lower])
    
    # Regular forms
    if word.endswith('e'):
        forms.extend([word + 'd', word[:-1] + 'ing', word + 's', word + 'r'])
    elif word.endswith('y'):
        forms.extend([word[:-1] + 'ied', word[:-1] + 'ies', word[:-1] + 'ying', word[:-1] + 'ier'])
    else:
        forms.extend([word + 'ed', word + 'ing', word + 's', word + 'er', word + 'est'])
        if word.endswith(('t', 'p', 'g')) and len(word) > 2:
            # Double consonant for words like "put->putting"
            forms.extend([word + word[-1] + 'ing', word + word[-1] + 'ed', word + word[-1] + 'er'])
    
    # Noun forms
    if word.endswith('y') and len(word) > 2:
        forms.append(word[:-1] + 'ies')
    elif word.endswith(('s', 'x', 'z', 'ch', 'sh')):
        forms.append(word + 'es')
    else:
        forms.append(word + 's')
    
    # Common suffixes
    forms.extend([
        word + 'ness', word + 'ment', word + 'tion', word + 'sion',
        word + 'ity', word + 'ful', word + 'less', word + 'able',
        word + 'ible', word + 'ly', word + 'ish', word + 'ize',
        word + 'ise', word + 'ist', word + 'ism'
    ])
    
    return list(set(forms))

def check_circular_comprehensive(word, definition):
    """Check if definition contains any form of the word"""
    def_lower = definition.lower()
    found_patterns = []
    
    # Get all possible forms
    word_forms = get_word_forms(word)
    
    for form in word_forms:
        # Use word boundary matching
        pattern = r'\b' + re.escape(form.lower()) + r'\b'
        if re.search(pattern, def_lower):
            found_patterns.append({
                'type': 'word_form',
                'original': word,
                'found': form,
                'context': get_context(definition, form)
            })
    
    # Check for "act of [word]ing" patterns
    action_patterns = [
        f"act of {word}",
        f"process of {word}",
        f"action of {word}",
        f"state of being {word}",
        f"quality of being {word}",
        f"condition of being {word}",
        f"one who {word}",
        f"that which {word}",
        f"person who {word}",
        f"thing that {word}"
    ]
    
    for pattern in action_patterns:
        if pattern.lower() in def_lower:
            found_patterns.append({
                'type': 'formulaic',
                'original': word,
                'found': pattern,
                'context': pattern
            })
    
    return found_patterns

def get_context(text, word, context_len=40):
    """Get context around the word in text"""
    index = text.lower().find(word.lower())
    if index == -1:
        return text[:80] + "..."
    
    start = max(0, index - context_len)
    end = min(len(text), index + len(word) + context_len)
    
    context = text[start:end]
    if start > 0:
        context = "..." + context
    if end < len(text):
        context = context + "..."
    
    return context

# Load data
print("Loading puzzle.json...")
with open('src/data/puzzle.json', 'r') as f:
    data = json.load(f)

print(f"Analyzing {len(data)} words for circular definitions...")

all_circular = []

for i, entry in enumerate(data):
    if i % 100 == 0:
        print(f"  Processing word {i}/{len(data)}...", end='\r')
    
    word = entry['word']
    definitions = entry['definitions']
    
    for def_idx, definition in enumerate(definitions):
        patterns = check_circular_comprehensive(word, definition)
        for pattern in patterns:
            all_circular.append({
                'word': word,
                'definition': definition,
                'def_index': def_idx,
                'pattern': pattern
            })

print(f"\n\nFound {len(all_circular)} circular definitions across {len(set(item['word'] for item in all_circular))} words")
print("="*100)

# Group by word
by_word = {}
for item in all_circular:
    word = item['word']
    if word not in by_word:
        by_word[word] = []
    by_word[word].append(item)

# Sort by number of circular definitions
sorted_words = sorted(by_word.items(), key=lambda x: (-len(x[1]), x[0]))

# Show detailed results
print("\nDETAILED RESULTS:")
print("="*100)

for word, items in sorted_words[:50]:  # Show top 50
    print(f"\n{'='*100}")
    print(f"WORD: {word} ({len(items)} circular definition(s))")
    print(f"{'='*100}")
    
    # Group by definition
    by_def = {}
    for item in items:
        def_idx = item['def_index']
        if def_idx not in by_def:
            by_def[def_idx] = {
                'definition': item['definition'],
                'patterns': []
            }
        by_def[def_idx]['patterns'].append(item['pattern'])
    
    for def_idx, def_info in sorted(by_def.items()):
        print(f"\nDefinition #{def_idx + 1}: {def_info['definition']}")
        print("Circular patterns found:")
        for pattern in def_info['patterns']:
            print(f"  - {pattern['original']} → {pattern['found']} (type: {pattern['type']})")
            if pattern['type'] == 'word_form':
                print(f"    Context: {pattern['context']}")

# Summary statistics
print(f"\n\n{'='*100}")
print("SUMMARY STATISTICS:")
print(f"{'='*100}")
print(f"Total words analyzed: {len(data)}")
print(f"Words with circular definitions: {len(by_word)}")
print(f"Total circular patterns found: {len(all_circular)}")

# Pattern type breakdown
pattern_types = {}
for item in all_circular:
    ptype = item['pattern']['type']
    pattern_types[ptype] = pattern_types.get(ptype, 0) + 1

print(f"\nPattern types:")
for ptype, count in sorted(pattern_types.items(), key=lambda x: -x[1]):
    print(f"  {ptype}: {count}")

# Most common circular patterns
form_counts = {}
for item in all_circular:
    transform = f"{item['pattern']['original']} → {item['pattern']['found']}"
    form_counts[transform] = form_counts.get(transform, 0) + 1

print(f"\nMost common transformations:")
for transform, count in sorted(form_counts.items(), key=lambda x: -x[1])[:20]:
    print(f"  {transform}: {count} occurrences")

# Save full report
with open('circular_definitions_detailed.json', 'w') as f:
    json.dump({
        'summary': {
            'total_words': len(data),
            'words_with_circular': len(by_word),
            'total_patterns': len(all_circular)
        },
        'by_word': {word: [{'definition': item['definition'], 
                            'pattern': item['pattern']} for item in items]
                     for word, items in by_word.items()}
    }, f, indent=2)

print(f"\nFull report saved to circular_definitions_detailed.json")