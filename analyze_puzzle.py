#!/usr/bin/env python3
"""
Script to analyze puzzle.json and identify words that need enrichment.
Target: ~9 clues per word (2-4 definitions, 2 examples, 1-2 synonyms/antonyms)
"""

import json
import sys

# Priority words to focus on
PRIORITY_WORDS = {
    # Basic verbs
    "make", "take", "give", "come", "go", "see", "know", "get", "say", "think",
    # Common nouns  
    "time", "way", "day", "man", "thing", "world", "life", "hand", "part", "child",
    # Descriptive words
    "good", "new", "first", "last", "long", "great", "little", "own", "other", "old"
}

def analyze_word_clues(word_data):
    """Count total clues for a word (excluding letter reveals)"""
    definitions = len(word_data.get("definitions", []))
    synonyms = len(word_data.get("synonyms", []))
    antonyms = len(word_data.get("antonyms", []))
    examples = len(word_data.get("examples", []))
    
    total_clues = definitions + synonyms + antonyms + examples
    
    return {
        "word": word_data["word"],
        "definitions": definitions,
        "synonyms": synonyms, 
        "antonyms": antonyms,
        "examples": examples,
        "total_clues": total_clues,
        "is_priority": word_data["word"] in PRIORITY_WORDS,
        "needs_enrichment": total_clues < 8
    }

def suggest_synonyms_antonyms(word):
    """Suggest common synonyms and antonyms for basic words"""
    suggestions = {
        # Basic verbs
        "make": {"synonyms": ["create", "build", "produce", "form"], "antonyms": ["destroy", "break"]},
        "take": {"synonyms": ["grab", "seize", "obtain", "acquire"], "antonyms": ["give", "leave"]},
        "give": {"synonyms": ["provide", "offer", "grant", "donate"], "antonyms": ["take", "receive"]},
        "come": {"synonyms": ["arrive", "approach", "reach"], "antonyms": ["go", "leave"]},
        "go": {"synonyms": ["leave", "depart", "travel"], "antonyms": ["come", "stay"]},
        "see": {"synonyms": ["view", "observe", "watch", "notice"], "antonyms": ["ignore", "miss"]},
        "know": {"synonyms": ["understand", "realize", "recognize"], "antonyms": ["ignore", "forget"]},
        "get": {"synonyms": ["obtain", "receive", "acquire"], "antonyms": ["lose", "give"]},
        "say": {"synonyms": ["speak", "tell", "state", "declare"], "antonyms": ["listen", "whisper"]},
        "think": {"synonyms": ["consider", "ponder", "reflect"], "antonyms": ["ignore", "forget"]},
        
        # Common nouns
        "time": {"synonyms": ["moment", "period", "duration"], "antonyms": ["timeless", "eternal"]},
        "way": {"synonyms": ["path", "route", "method"], "antonyms": ["blockage", "barrier"]},
        "day": {"synonyms": ["daytime", "period"], "antonyms": ["night", "evening"]},
        "man": {"synonyms": ["male", "gentleman", "person"], "antonyms": ["woman", "female"]},
        "thing": {"synonyms": ["object", "item", "matter"], "antonyms": ["nothing", "void"]},
        "world": {"synonyms": ["earth", "globe", "planet"], "antonyms": ["heaven", "space"]},
        "life": {"synonyms": ["existence", "being", "living"], "antonyms": ["death", "lifeless"]},
        "hand": {"synonyms": ["palm", "fist", "grasp"], "antonyms": ["foot", "release"]},
        "part": {"synonyms": ["piece", "section", "portion"], "antonyms": ["whole", "complete"]},
        "child": {"synonyms": ["kid", "youth", "minor"], "antonyms": ["adult", "grown-up"]},
        
        # Descriptive words
        "good": {"synonyms": ["great", "excellent", "fine"], "antonyms": ["bad", "poor"]},
        "new": {"synonyms": ["fresh", "recent", "modern"], "antonyms": ["old", "ancient"]},
        "first": {"synonyms": ["initial", "primary", "earliest"], "antonyms": ["last", "final"]},
        "last": {"synonyms": ["final", "ultimate", "end"], "antonyms": ["first", "initial"]},
        "long": {"synonyms": ["lengthy", "extended", "tall"], "antonyms": ["short", "brief"]},
        "great": {"synonyms": ["excellent", "wonderful", "large"], "antonyms": ["small", "poor"]},
        "little": {"synonyms": ["small", "tiny", "minor"], "antonyms": ["big", "large"]},
        "own": {"synonyms": ["personal", "private", "possess"], "antonyms": ["shared", "borrowed"]},
        "other": {"synonyms": ["different", "alternative", "another"], "antonyms": ["same", "identical"]},
        "old": {"synonyms": ["ancient", "aged", "elderly"], "antonyms": ["new", "young"]},
        
        # Additional common words
        "big": {"synonyms": ["large", "huge", "enormous"], "antonyms": ["small", "tiny"]},
        "small": {"synonyms": ["little", "tiny", "minor"], "antonyms": ["big", "large"]},
        "high": {"synonyms": ["tall", "elevated", "lofty"], "antonyms": ["low", "short"]},
        "low": {"synonyms": ["short", "down", "below"], "antonyms": ["high", "tall"]},
        "right": {"synonyms": ["correct", "proper", "accurate"], "antonyms": ["wrong", "left"]},
        "wrong": {"synonyms": ["incorrect", "false", "mistaken"], "antonyms": ["right", "correct"]},
        "hard": {"synonyms": ["difficult", "tough", "solid"], "antonyms": ["easy", "soft"]},
        "easy": {"synonyms": ["simple", "effortless", "basic"], "antonyms": ["hard", "difficult"]},
        "hot": {"synonyms": ["warm", "heated", "burning"], "antonyms": ["cold", "cool"]},
        "cold": {"synonyms": ["cool", "chilly", "frozen"], "antonyms": ["hot", "warm"]},
        "fast": {"synonyms": ["quick", "rapid", "speedy"], "antonyms": ["slow", "sluggish"]},
        "slow": {"synonyms": ["sluggish", "gradual", "leisurely"], "antonyms": ["fast", "quick"]},
        "open": {"synonyms": ["accessible", "available", "unlocked"], "antonyms": ["closed", "shut"]},
        "close": {"synonyms": ["near", "shut", "tight"], "antonyms": ["open", "far"]},
        "start": {"synonyms": ["begin", "commence", "initiate"], "antonyms": ["end", "finish"]},
        "end": {"synonyms": ["finish", "conclude", "stop"], "antonyms": ["start", "begin"]},
        "win": {"synonyms": ["triumph", "succeed", "victory"], "antonyms": ["lose", "fail"]},
        "lose": {"synonyms": ["fail", "misplace", "forfeit"], "antonyms": ["win", "find"]},
        "love": {"synonyms": ["adore", "cherish", "affection"], "antonyms": ["hate", "dislike"]},
        "hate": {"synonyms": ["dislike", "despise", "loathe"], "antonyms": ["love", "like"]},
        "happy": {"synonyms": ["joyful", "cheerful", "glad"], "antonyms": ["sad", "unhappy"]},
        "sad": {"synonyms": ["unhappy", "sorrowful", "gloomy"], "antonyms": ["happy", "joyful"]},
        "young": {"synonyms": ["youthful", "juvenile", "new"], "antonyms": ["old", "elderly"]},
        "strong": {"synonyms": ["powerful", "mighty", "robust"], "antonyms": ["weak", "frail"]},
        "weak": {"synonyms": ["frail", "feeble", "fragile"], "antonyms": ["strong", "powerful"]},
        "full": {"synonyms": ["complete", "filled", "packed"], "antonyms": ["empty", "vacant"]},
        "empty": {"synonyms": ["vacant", "hollow", "void"], "antonyms": ["full", "filled"]},
        "rich": {"synonyms": ["wealthy", "abundant", "prosperous"], "antonyms": ["poor", "needy"]},
        "poor": {"synonyms": ["needy", "impoverished", "lacking"], "antonyms": ["rich", "wealthy"]},
        "clean": {"synonyms": ["pure", "spotless", "tidy"], "antonyms": ["dirty", "messy"]},
        "dirty": {"synonyms": ["messy", "filthy", "unclean"], "antonyms": ["clean", "pure"]},
        "light": {"synonyms": ["bright", "illuminated", "lightweight"], "antonyms": ["dark", "heavy"]},
        "dark": {"synonyms": ["dim", "gloomy", "shadowy"], "antonyms": ["light", "bright"]},
        "heavy": {"synonyms": ["weighty", "massive", "dense"], "antonyms": ["light", "weightless"]},
        "sharp": {"synonyms": ["pointed", "keen", "acute"], "antonyms": ["dull", "blunt"]},
        "dull": {"synonyms": ["blunt", "boring", "lifeless"], "antonyms": ["sharp", "bright"]},
        "wide": {"synonyms": ["broad", "extensive", "spacious"], "antonyms": ["narrow", "thin"]},
        "narrow": {"synonyms": ["thin", "tight", "limited"], "antonyms": ["wide", "broad"]},
        "thick": {"synonyms": ["dense", "heavy", "wide"], "antonyms": ["thin", "narrow"]},
        "thin": {"synonyms": ["narrow", "slim", "skinny"], "antonyms": ["thick", "wide"]},
        "deep": {"synonyms": ["profound", "intense", "low"], "antonyms": ["shallow", "surface"]},
        "shallow": {"synonyms": ["surface", "superficial", "low"], "antonyms": ["deep", "profound"]},
        
        # Additional common words from the puzzle
        "price": {"synonyms": ["cost", "value", "amount"], "antonyms": ["free", "worthless"]},
        "video": {"synonyms": ["film", "movie", "recording"], "antonyms": ["audio", "still"]},
        "guide": {"synonyms": ["lead", "direct", "manual"], "antonyms": ["follow", "mislead"]},
        "offer": {"synonyms": ["provide", "present", "propose"], "antonyms": ["withdraw", "refuse"]},
        "recent": {"synonyms": ["latest", "current", "fresh"], "antonyms": ["old", "ancient"]},
        "experience": {"synonyms": ["encounter", "undergo", "knowledge"], "antonyms": ["inexperience", "theory"]},
        "month": {"synonyms": ["period", "lunar"], "antonyms": ["year", "day"]},
        "vote": {"synonyms": ["ballot", "elect", "choose"], "antonyms": ["abstain", "ignore"]},
        "strategy": {"synonyms": ["plan", "approach", "tactic"], "antonyms": ["improvisation", "chaos"]},
        "opinion": {"synonyms": ["view", "belief", "judgment"], "antonyms": ["fact", "certainty"]},
        "morning": {"synonyms": ["dawn", "sunrise", "AM"], "antonyms": ["evening", "night"]},
        "winter": {"synonyms": ["cold", "snow", "hibernate"], "antonyms": ["summer", "warm"]},
        "teacher": {"synonyms": ["instructor", "educator", "professor"], "antonyms": ["student", "pupil"]},
        "driver": {"synonyms": ["operator", "pilot", "chauffeur"], "antonyms": ["passenger", "walker"]},
        "nation": {"synonyms": ["country", "state", "people"], "antonyms": ["individual", "local"]},
        "visitor": {"synonyms": ["guest", "tourist", "caller"], "antonyms": ["resident", "host"]},
        "difficult": {"synonyms": ["hard", "challenging", "tough"], "antonyms": ["easy", "simple"]},
        "comment": {"synonyms": ["remark", "note", "observation"], "antonyms": ["silence", "ignore"]},
        "management": {"synonyms": ["control", "administration", "leadership"], "antonyms": ["chaos", "mismanagement"]},
        "similar": {"synonyms": ["alike", "comparable", "related"], "antonyms": ["different", "opposite"]},
        "perhaps": {"synonyms": ["maybe", "possibly", "conceivably"], "antonyms": ["definitely", "certainly"]},
        "piano": {"synonyms": ["keyboard", "instrument", "keys"], "antonyms": ["loud", "forte"]},
        "require": {"synonyms": ["need", "demand", "necessitate"], "antonyms": ["optional", "provide"]},
        "calculate": {"synonyms": ["compute", "figure", "estimate"], "antonyms": ["guess", "approximate"]},
        "establish": {"synonyms": ["create", "found", "set up"], "antonyms": ["destroy", "abolish"]},
        "modify": {"synonyms": ["change", "alter", "adjust"], "antonyms": ["preserve", "maintain"]},
        "unless": {"synonyms": ["except", "if not", "without"], "antonyms": ["if", "when"]},
        "digital": {"synonyms": ["electronic", "computerized", "virtual"], "antonyms": ["analog", "physical"]},
        "privacy": {"synonyms": ["secrecy", "confidentiality", "solitude"], "antonyms": ["publicity", "openness"]}
    }
    
    return suggestions.get(word, {"synonyms": [], "antonyms": []})

def main():
    try:
        with open("/Users/michaelmcisaac/Github/the-dictionary-game/puzzle.json", "r") as f:
            puzzle_data = json.load(f)
        
        print("PUZZLE ENRICHMENT ANALYSIS")
        print("=" * 50)
        print()
        
        # Analyze all words
        all_analyses = []
        for word_data in puzzle_data:
            analysis = analyze_word_clues(word_data)
            all_analyses.append(analysis)
        
        # Filter words that need enrichment
        needs_enrichment = [w for w in all_analyses if w["needs_enrichment"]]
        priority_needs_enrichment = [w for w in needs_enrichment if w["is_priority"]]
        priority_borderline = [w for w in all_analyses if w["is_priority"] and w["total_clues"] == 8]
        
        print(f"SUMMARY:")
        print(f"Total words: {len(all_analyses)}")
        print(f"Words needing enrichment (< 8 clues): {len(needs_enrichment)}")
        print(f"Priority words needing enrichment: {len(priority_needs_enrichment)}")
        print(f"Priority words at exactly 8 clues: {len(priority_borderline)}")
        print()
        
        # Show priority words first
        if priority_needs_enrichment:
            print("PRIORITY WORDS NEEDING ENRICHMENT:")
            print("-" * 40)
            for word_analysis in sorted(priority_needs_enrichment, key=lambda x: x["total_clues"]):
                word = word_analysis["word"]
                suggestions = suggest_synonyms_antonyms(word)
                
                print(f"• {word.upper()} ({word_analysis['total_clues']} clues)")
                print(f"  Current: {word_analysis['definitions']}def, {word_analysis['synonyms']}syn, {word_analysis['antonyms']}ant, {word_analysis['examples']}ex")
                print(f"  Suggested synonyms: {', '.join(suggestions['synonyms'][:4])}")
                print(f"  Suggested antonyms: {', '.join(suggestions['antonyms'][:2])}")
                print()
        
        # Show priority words at exactly 8 clues
        if priority_borderline:
            print("PRIORITY WORDS AT EXACTLY 8 CLUES (could be enriched to 9-10):")
            print("-" * 60)
            for word_analysis in sorted(priority_borderline, key=lambda x: x["word"]):
                word = word_analysis["word"]
                suggestions = suggest_synonyms_antonyms(word)
                
                print(f"• {word.upper()} ({word_analysis['total_clues']} clues)")
                print(f"  Current: {word_analysis['definitions']}def, {word_analysis['synonyms']}syn, {word_analysis['antonyms']}ant, {word_analysis['examples']}ex")
                print(f"  Could add synonyms: {', '.join(suggestions['synonyms'][:3])}")
                print(f"  Could add antonyms: {', '.join(suggestions['antonyms'][:2])}")
                print()
        
        # Show other words needing enrichment (non-priority)
        other_needs_enrichment = [w for w in needs_enrichment if not w["is_priority"]]
        if other_needs_enrichment:
            print("OTHER WORDS NEEDING ENRICHMENT (showing first 50):")
            print("-" * 50)
            count = 0
            for word_analysis in sorted(other_needs_enrichment, key=lambda x: x["total_clues"]):
                if count >= 50:
                    break
                    
                word = word_analysis["word"]
                suggestions = suggest_synonyms_antonyms(word)
                
                print(f"• {word} ({word_analysis['total_clues']} clues)")
                print(f"  Current: {word_analysis['definitions']}def, {word_analysis['synonyms']}syn, {word_analysis['antonyms']}ant, {word_analysis['examples']}ex")
                if suggestions['synonyms'] or suggestions['antonyms']:
                    print(f"  Suggested synonyms: {', '.join(suggestions['synonyms'][:4])}")
                    print(f"  Suggested antonyms: {', '.join(suggestions['antonyms'][:2])}")
                print()
                count += 1
                
            if len(other_needs_enrichment) > 50:
                print(f"... and {len(other_needs_enrichment) - 50} more words")
        
        # Create complete word list by clue count
        print("COMPLETE WORD LIST BY CLUE COUNT:")
        print("-" * 40)
        
        # Group by clue count
        clue_groups = {}
        for word_analysis in needs_enrichment:
            clue_count = word_analysis["total_clues"]
            if clue_count not in clue_groups:
                clue_groups[clue_count] = []
            clue_groups[clue_count].append(word_analysis["word"])
        
        # Display groups
        for clue_count in sorted(clue_groups.keys()):
            words = sorted(clue_groups[clue_count])
            print(f"\n{clue_count} CLUES ({len(words)} words):")
            # Print words in rows of 8
            for i in range(0, len(words), 8):
                row = words[i:i+8]
                print(f"  {', '.join(row)}")
        
        print()
        print("ANALYSIS COMPLETE")
        print(f"Focus on the {len(priority_needs_enrichment)} priority words first, then work through the others.")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()