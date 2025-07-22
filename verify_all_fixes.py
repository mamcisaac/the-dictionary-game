#!/usr/bin/env python3
import json

def verify_all_fixes():
    """Verify that all definition quality fixes have been applied"""
    
    with open('puzzle.json', 'r') as f:
        data = json.load(f)
    
    print("VERIFICATION REPORT")
    print("=" * 50)
    
    # Check for the original corruption pattern
    corruption_found = 0
    truncated_found = 0
    missing_punct = 0
    double_spaces = 0
    typos_found = 0
    conjunction_starts = 0
    duplicates = 0
    
    for entry in data:
        word = entry.get('word', '')
        definitions = entry.get('definitions', [])
        
        # Check each definition
        unique_defs = set()
        for i, defn in enumerate(definitions):
            # Check for original corruption
            if 'that serves a specific purpose or function' in defn:
                corruption_found += 1
                print(f"❌ CORRUPTION STILL PRESENT in {word}: {defn[:50]}...")
            
            # Check for truncation patterns (very basic check)
            if defn and defn[0].islower() and not defn.startswith(('e.g.', 'i.e.', 'etc.')):
                truncated_found += 1
            
            # Check for missing punctuation
            if defn and defn[-1] not in '.?!:;)':
                missing_punct += 1
            
            # Check for double spaces
            if '  ' in defn:
                double_spaces += 1
            
            # Check for typos
            if ' adn ' in defn or ' teh ' in defn or ' taht ' in defn:
                typos_found += 1
            
            # Check for conjunction starts
            if defn.lower().startswith(('that ', 'which ', 'as ', 'or ', 'and ', 'so ')):
                conjunction_starts += 1
            
            # Check for duplicates
            if defn in unique_defs:
                duplicates += 1
                print(f"❌ DUPLICATE in {word}: {defn[:50]}...")
            unique_defs.add(defn)
    
    # Print summary
    print(f"\n📊 VERIFICATION RESULTS:")
    print(f"✅ Original corruption ('purpose or function'): {corruption_found} remaining")
    print(f"⚠️  Potential truncated definitions: {truncated_found}")
    print(f"⚠️  Missing punctuation: {missing_punct}")
    print(f"⚠️  Double spaces: {double_spaces}")
    print(f"⚠️  Common typos: {typos_found}")
    print(f"⚠️  Conjunction starts: {conjunction_starts}")
    print(f"⚠️  Duplicate definitions: {duplicates}")
    
    total_issues = corruption_found + truncated_found + missing_punct + double_spaces + typos_found + conjunction_starts + duplicates
    print(f"\n🎯 TOTAL REMAINING ISSUES: {total_issues}")
    
    if total_issues == 0:
        print("\n🎉 ALL ISSUES HAVE BEEN SUCCESSFULLY FIXED! 🎉")
    elif corruption_found == 0 and duplicates == 0:
        print(f"\n✅ Major issues fixed! {total_issues} minor issues remain.")
    else:
        print(f"\n❌ Critical issues still present. Review needed.")

if __name__ == "__main__":
    verify_all_fixes()