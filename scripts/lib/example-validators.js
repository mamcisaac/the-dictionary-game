/**
 * Example Sentence Validators
 * Ensures high-quality example sentences for the game
 */

/**
 * Check if an example sentence is high quality
 */
function validateExample(example, word) {
    // Basic checks
    if (!example || typeof example !== 'string') return false;
    if (example.length < 10 || example.length > 150) return false;
    
    // Must contain exactly one [blank] placeholder
    const blankCount = (example.match(/\[blank\]/gi) || []).length;
    if (blankCount !== 1) return false;
    
    // Check for formatting artifacts
    const badPatterns = [
        /[_*]/,                          // Markdown formatting
        /\[(?!blank\])[^\]]+\]/,        // Other brackets
        /\.\.\./,                        // Ellipsis (often indicates truncation)
        /\betc\b/i,                      // Often indicates incomplete lists
        /\bi\.e\.|e\.g\./i,             // Academic abbreviations
        /^\W/,                           // Starting with non-word character
        /\w{20,}/,                       // Very long words (likely errors)
        /<[^>]+>/,                       // HTML tags
        /\burl\b|http/i,                 // URLs
        /[@#$%^&*+=]/,                   // Special characters
    ];
    
    if (badPatterns.some(pattern => pattern.test(example))) {
        return false;
    }
    
    // Avoid generic templates
    const genericPatterns = [
        /^The situation became \[blank\]/i,
        /^She felt \[blank\] after/i,
        /^The \[blank\] was very/i,
        /^It was \[blank\] that/i,
        /^The \[blank\] of the/i,
        /^He was \[blank\] to/i,
        /^They were \[blank\] by/i,
    ];
    
    if (genericPatterns.some(pattern => pattern.test(example))) {
        return false;
    }
    
    // Grammar check - ensure proper sentence structure
    if (!example.match(/^[A-Z]/)) return false;  // Must start with capital
    if (!example.match(/[.!?]$/)) return false;  // Must end with punctuation
    
    // Word count check (good sentences are typically 8-20 words)
    const wordCount = example.split(/\s+/).length;
    if (wordCount < 6 || wordCount > 25) return false;
    
    return true;
}

/**
 * Score an example based on quality criteria
 */
function scoreExample(example, word) {
    if (!validateExample(example, word)) return 0;
    
    let score = 100;
    
    // Prefer natural sentence lengths (10-15 words ideal)
    const wordCount = example.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 15) score += 10;
    else if (wordCount < 8 || wordCount > 20) score -= 10;
    
    // Penalize overly simple sentences
    if (!/[,;:]/.test(example)) score -= 5;  // No punctuation variety
    
    // Penalize sentences that might be confusing
    if (/\bpronoun\b|\bverb\b|\bnoun\b|\badjective\b/i.test(example)) score -= 20;
    
    // Bonus for clear context
    const contextWords = ['because', 'when', 'after', 'before', 'while', 'during'];
    if (contextWords.some(word => example.toLowerCase().includes(word))) score += 5;
    
    // Check blank placement (middle is usually better than beginning/end)
    const blankPosition = example.indexOf('[blank]') / example.length;
    if (blankPosition > 0.2 && blankPosition < 0.8) score += 5;
    
    return Math.max(0, score);
}

/**
 * Convert various example formats to our standard [blank] format
 */
function standardizeExample(example, word) {
    let standardized = example;
    
    // Common placeholder formats to replace
    const placeholders = [
        new RegExp(`\\b${word}\\b`, 'gi'),           // The actual word
        /\b_+\b/g,                                    // Underscores
        /\*{2,}[^*]+\*{2,}/g,                        // **word**
        /\{[^}]+\}/g,                                 // {word}
        /\[[^\]]+\](?!\s*\[blank\])/g,              // [word] but not [blank]
    ];
    
    // Replace all placeholders with [blank]
    placeholders.forEach(pattern => {
        standardized = standardized.replace(pattern, '[blank]');
    });
    
    // Clean up multiple blanks
    standardized = standardized.replace(/\[blank\](\s+\[blank\])+/g, '[blank]');
    
    // Ensure proper capitalization and punctuation
    standardized = standardized.charAt(0).toUpperCase() + standardized.slice(1);
    if (!standardized.match(/[.!?]$/)) {
        standardized += '.';
    }
    
    return standardized;
}

/**
 * Filter and improve example sentences
 */
function filterExamples(examples, word) {
    if (!examples || !Array.isArray(examples)) return [];
    
    // Standardize and score examples
    const processed = examples
        .map(ex => standardizeExample(ex, word))
        .filter(ex => validateExample(ex, word))
        .map(ex => ({
            text: ex,
            score: scoreExample(ex, word)
        }))
        .sort((a, b) => b.score - a.score);
    
    // Remove duplicates
    const unique = [];
    const seen = new Set();
    
    for (const ex of processed) {
        const normalized = ex.text.toLowerCase().replace(/[.!?,]/g, '');
        if (!seen.has(normalized)) {
            seen.add(normalized);
            unique.push(ex.text);
        }
    }
    
    // Return top 4-5 examples
    return unique.slice(0, 5);
}

/**
 * Generate high-quality fallback examples
 */
function generateFallbackExamples(word, partOfSpeech = 'general') {
    const templates = {
        noun: [
            `The [blank] caught everyone's attention at the meeting.`,
            `She wrote an article about the importance of [blank].`,
            `The museum's new exhibit features a rare [blank].`,
            `Students learned about [blank] in their science class.`,
            `The company specializes in manufacturing [blank].`
        ],
        verb: [
            `They decided to [blank] the project after careful consideration.`,
            `She learned how to [blank] during her apprenticeship.`,
            `The instructions explain how to [blank] safely.`,
            `He promised to [blank] the task by Friday.`,
            `The team will [blank] the new system next month.`
        ],
        adjective: [
            `The [blank] weather made the outdoor event perfect.`,
            `Her [blank] attitude impressed the interview panel.`,
            `The [blank] design won the architecture award.`,
            `Critics praised the film's [blank] cinematography.`,
            `The [blank] solution solved the problem efficiently.`
        ],
        adverb: [
            `She [blank] completed the marathon despite the rain.`,
            `The pianist played the sonata [blank].`,
            `He [blank] agreed to help with the project.`,
            `The changes were [blank] implemented across all departments.`,
            `They [blank] discovered the error in the calculations.`
        ]
    };
    
    const selectedTemplates = templates[partOfSpeech] || templates.noun;
    
    // Randomly select 3-4 diverse examples
    const indices = [];
    while (indices.length < Math.min(4, selectedTemplates.length)) {
        const idx = Math.floor(Math.random() * selectedTemplates.length);
        if (!indices.includes(idx)) {
            indices.push(idx);
        }
    }
    
    return indices.map(i => selectedTemplates[i]);
}

module.exports = {
    validateExample,
    scoreExample,
    standardizeExample,
    filterExamples,
    generateFallbackExamples
};