/**
 * Word Utilities
 * Helper functions for word analysis and variation detection
 */

/**
 * Get all possible variations of a word for cyclical detection
 * This is more comprehensive than the previous version
 */
function getWordVariations(word) {
    const variations = new Set([word.toLowerCase()]);
    const wordLower = word.toLowerCase();
    
    // CRITICAL: Add common variations of the base word itself
    // This ensures we catch "printing" when the word is "print"
    variations.add(wordLower + 'ing');
    variations.add(wordLower + 'ed');
    variations.add(wordLower + 's');
    variations.add(wordLower + 'er');
    variations.add(wordLower + 'ers');
    variations.add(wordLower + 'ings');
    variations.add(wordLower + 'able');
    variations.add(wordLower + 'ment');
    
    // Handle words ending in 'e' - remove 'e' before adding suffix
    if (wordLower.endsWith('e')) {
        const rootNoE = wordLower.slice(0, -1);
        variations.add(rootNoE + 'ing');
        variations.add(rootNoE + 'ed');
        variations.add(rootNoE + 'er');
        variations.add(rootNoE + 'able');
    }
    
    // Handle words ending in 'y' - change 'y' to 'i' before suffix
    if (wordLower.endsWith('y') && wordLower.length > 2) {
        const rootNoY = wordLower.slice(0, -1);
        variations.add(rootNoY + 'ies');
        variations.add(rootNoY + 'ied');
        variations.add(rootNoY + 'ier');
        variations.add(rootNoY + 'iest');
        variations.add(rootNoY + 'ying');
    }
    
    // Handle words that might double final consonant
    if (wordLower.match(/[^aeiou][aeiou][^aeiou]$/)) {
        const lastChar = wordLower[wordLower.length - 1];
        variations.add(wordLower + lastChar + 'ing');
        variations.add(wordLower + lastChar + 'ed');
        variations.add(wordLower + lastChar + 'er');
    }
    
    // Common suffixes - comprehensive list
    const suffixes = [
        // Verb forms
        's', 'es', 'ed', 'ing', 'er', 'ers', 'est',
        // Noun forms
        'tion', 'sion', 'ment', 'ness', 'ity', 'ty', 'ance', 'ence',
        // Adjective forms
        'able', 'ible', 'ful', 'less', 'ous', 'ious', 'al', 'ial', 'ic',
        // Adverb forms
        'ly',
        // Other common endings
        'y', 'ies', 'ied', 'ier', 'iest', 'ify', 'ize', 'ise', 'en', 'ened'
    ];
    
    // Process suffixes
    for (const suffix of suffixes) {
        if (wordLower.endsWith(suffix) && wordLower.length > suffix.length + 2) {
            const root = wordLower.slice(0, -suffix.length);
            variations.add(root);
            
            // After finding a root, generate common variations of that root
            // This catches cases like "development" -> "develop" -> "developing"
            if (suffix === 'ment' || suffix === 'tion' || suffix === 'sion' || 
                suffix === 'ity' || suffix === 'ness' || suffix === 'ance' || suffix === 'ence') {
                // Add common verb forms
                variations.add(root + 'ing');
                variations.add(root + 'ed');
                variations.add(root + 's');
                variations.add(root + 'er');
                
                // Handle verbs ending in 'e'
                if (root.endsWith('e')) {
                    const rootNoE = root.slice(0, -1);
                    variations.add(rootNoE + 'ing');
                    variations.add(rootNoE + 'ed');
                }
            }
            
            // Handle special cases
            // hairy -> hair (y removal)
            if (suffix === 'y' && root.length > 2) {
                variations.add(root);
            }
            
            // happier -> happy -> happi -> happy (ier to y conversion)
            if (suffix === 'ier' || suffix === 'iest') {
                variations.add(root + 'y');
                if (root.endsWith('i')) {
                    variations.add(root.slice(0, -1) + 'y');
                }
            }
            
            // flies -> fly (ies to y conversion)
            if (suffix === 'ies') {
                variations.add(root + 'y');
            }
            
            // running -> run (double consonant)
            if ((suffix === 'ing' || suffix === 'ed') && root.match(/(.)\1$/)) {
                variations.add(root.slice(0, -1));
            }
        }
    }
    
    // Common prefixes
    const prefixes = [
        'un', 're', 'pre', 'dis', 'over', 'under', 'mis', 'out', 'up',
        'anti', 'de', 'non', 'in', 'im', 'il', 'ir', 'inter', 'fore',
        'sub', 'super', 'trans', 'ultra', 'extra', 'meta'
    ];
    
    for (const prefix of prefixes) {
        if (wordLower.startsWith(prefix) && wordLower.length > prefix.length + 2) {
            variations.add(wordLower.slice(prefix.length));
        }
    }
    
    // Handle compound words and special patterns
    // information -> inform
    if (wordLower.endsWith('ation') && wordLower.length > 6) {
        variations.add(wordLower.slice(0, -5));
        variations.add(wordLower.slice(0, -5) + 'e');
    }
    
    // publicity -> public
    if (wordLower.endsWith('ity') && wordLower.length > 4) {
        const root = wordLower.slice(0, -3);
        variations.add(root);
        if (root.endsWith('ic')) {
            variations.add(root.slice(0, -2));
        }
    }
    
    // Add partial matches for compound detection
    // e.g., "woodworking" should detect "wood" and "work"
    if (wordLower.length > 6) {
        for (let i = 3; i <= wordLower.length - 3; i++) {
            const part1 = wordLower.slice(0, i);
            const part2 = wordLower.slice(i);
            if (part1.length >= 3) variations.add(part1);
            if (part2.length >= 3) variations.add(part2);
        }
    }
    
    return variations;
}

/**
 * Check if a definition contains cyclical references to the word
 */
function hasCyclicalReference(word, definition) {
    const defLower = definition.toLowerCase();
    const variations = getWordVariations(word);
    
    for (const variant of variations) {
        // Check for word boundaries to avoid false positives
        // e.g., "other" shouldn't match "the"
        const regex = new RegExp(`\\b${variant}\\b`, 'i');
        if (regex.test(defLower)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check if a definition is name-based or gives away the answer
 */
function isNameBasedDefinition(definition) {
    const problematicPatterns = [
        /alternative (form|spelling) of \w+/i,
        /^\w+ name:/i,
        /^(a |an )?(male|female|given|first|last|sur|family) (given )?name/i,
        /^(a |an )?place ?name/i,
        /obsolete (form|spelling) of/i,
        /archaic (form|spelling) of/i,
        /misspelling of/i,
        /surname:/i,
        /forename:/i,
        /^(a |an )?diminutive of/i,
        /^(a |an )?nickname for/i,
        /informal (form|spelling) of/i
    ];
    
    return problematicPatterns.some(pattern => pattern.test(definition));
}

/**
 * Extract part of speech from various definition formats
 */
function extractPartOfSpeech(definition) {
    // Common part of speech indicators
    const patterns = {
        noun: /^(\(noun\)|n\.|noun:|a |an |the )/i,
        verb: /^(\(verb\)|v\.|verb:|to )/i,
        adjective: /^(\(adj\)|adj\.|adjective:|describing )/i,
        adverb: /^(\(adv\)|adv\.|adverb:|in a \w+ manner)/i
    };
    
    for (const [pos, pattern] of Object.entries(patterns)) {
        if (pattern.test(definition)) {
            return pos;
        }
    }
    
    // Guess based on definition structure
    if (/^(a |an |the )/.test(definition)) return 'noun';
    if (/^to /.test(definition)) return 'verb';
    if (/ing |ed |ous |ful |less |able |ible /.test(definition)) return 'adjective';
    
    return 'unknown';
}

/**
 * Clean and normalize a definition
 */
function cleanDefinition(definition) {
    // Remove part of speech prefixes
    let cleaned = definition.replace(/^[a-z]+\t/, '');
    
    // Remove parenthetical part of speech indicators
    cleaned = cleaned.replace(/^\([^)]+\)\s*/, '');
    
    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    // Ensure ends with period
    if (!cleaned.match(/[.!?]$/)) {
        cleaned += '.';
    }
    
    return cleaned;
}

/**
 * Score a definition based on quality criteria
 */
function scoreDefinition(word, definition) {
    let score = 100;
    
    // Penalize cyclical references
    if (hasCyclicalReference(word, definition)) score -= 50;
    
    // Penalize name-based definitions
    if (isNameBasedDefinition(definition)) score -= 40;
    
    // Penalize overly technical definitions
    if (/\([^)]*technical[^)]*\)/i.test(definition)) score -= 20;
    if (/\b(genus|species|phylum|chemistry|physics|mathematics)\b/i.test(definition)) score -= 15;
    
    // Penalize very short or very long definitions
    const words = definition.split(/\s+/).length;
    if (words < 3) score -= 20;
    if (words > 30) score -= 10;
    
    // Penalize definitions with too many uncommon words
    const uncommonWords = definition.match(/\b\w{10,}\b/g) || [];
    score -= uncommonWords.length * 5;
    
    // Bonus for clear, common language
    if (/\b(used|common|type|kind|person|thing|action|quality)\b/i.test(definition)) score += 5;
    
    return Math.max(0, score);
}

module.exports = {
    getWordVariations,
    hasCyclicalReference,
    isNameBasedDefinition,
    extractPartOfSpeech,
    cleanDefinition,
    scoreDefinition
};