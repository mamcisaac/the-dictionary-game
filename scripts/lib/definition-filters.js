/**
 * Definition Quality Filters
 * Ensures high-quality definitions for the game
 */

const { hasCyclicalReference, isNameBasedDefinition, scoreDefinition, cleanDefinition } = require('./word-utils');

/**
 * Manual overrides for common words that often get poor API definitions
 */
const MANUAL_DEFINITIONS = {
    'free': [
        'Not under the control or in the power of another; able to act or be done as one wishes.',
        'Without cost or payment.',
        'Not physically bound or constrained.',
        'To release from captivity or obligation.'
    ],
    'like': [
        'To find agreeable, enjoyable, or satisfactory.',
        'Having the same characteristics or qualities as; similar to.',
        'In the manner of; similarly to.',
        'Such as; for example.'
    ],
    'over': [
        'Extending directly upward from; above.',
        'Across from one side to the other of.',
        'During the course of a period of time.',
        'More than; in excess of.'
    ],
    'about': [
        'On the subject of; concerning.',
        'Approximately; roughly.',
        'On all sides of; surrounding.',
        'In the area of; near.'
    ],
    'time': [
        'The indefinite continued progress of existence and events.',
        'A point of time as measured in hours and minutes.',
        'An instance or occasion.',
        'The rhythmic pattern of a piece of music.'
    ],
    'page': [
        'One side of a sheet of paper in a book or magazine.',
        'A young person employed as a personal attendant.',
        'To call out over a public address system.',
        'A section of stored data in computer memory.'
    ],
    'information': [
        'Facts provided or learned about something or someone.',
        'What is conveyed or represented by a particular arrangement or sequence of things.',
        'Data processed, stored, or transmitted by a computer.',
        'Knowledge obtained from investigation, study, or instruction.'
    ],
    'make': [
        'To form something by putting parts together or combining substances.',
        'To cause something to exist or come about.',
        'To force or require someone to do something.',
        'The manufacturer or trade name of a product.'
    ],
    'work': [
        'Activity involving mental or physical effort done to achieve a purpose.',
        'A task or tasks to be undertaken.',
        'To be engaged in physical or mental activity to achieve a result.',
        'To function or operate in a proper or particular way.'
    ],
    'good': [
        'To be desired or approved of; pleasing.',
        'Having the required qualities; of a high standard.',
        'Morally right; virtuous.',
        'Benefit or advantage to someone or something.'
    ]
};

/**
 * Filter and improve definitions for a word
 */
async function filterDefinitions(word, definitions = []) {
    // Check for manual override first
    if (MANUAL_DEFINITIONS[word.toLowerCase()]) {
        return MANUAL_DEFINITIONS[word.toLowerCase()];
    }
    
    // Score and filter definitions
    const scoredDefs = definitions
        .map(def => ({
            text: cleanDefinition(def),
            score: scoreDefinition(word, def)
        }))
        .filter(def => def.score > 30) // Minimum quality threshold
        .sort((a, b) => b.score - a.score);
    
    // Get unique, high-quality definitions
    const uniqueDefs = [];
    const seenDefs = new Set();
    
    for (const def of scoredDefs) {
        const normalized = def.text.toLowerCase().replace(/[.,!?]/g, '');
        if (!seenDefs.has(normalized)) {
            seenDefs.add(normalized);
            uniqueDefs.push(def.text);
        }
    }
    
    // Return top 4-6 definitions
    return uniqueDefs.slice(0, 6);
}

/**
 * Ensure definitions follow the esoteric-first ordering
 */
function orderDefinitionsForGame(definitions) {
    if (definitions.length <= 1) return definitions;
    
    // Simple heuristic: shorter definitions are often more common/obvious
    // Sort by length descending to put longer (often more esoteric) first
    const sorted = [...definitions].sort((a, b) => b.length - a.length);
    
    // If we have 3+ definitions, ensure good variety
    if (sorted.length >= 3) {
        // Put a medium-length one first (not too esoteric, not too obvious)
        const mid = Math.floor(sorted.length / 2);
        return [sorted[mid], ...sorted.slice(0, mid), ...sorted.slice(mid + 1)];
    }
    
    return sorted;
}

/**
 * Validate final definition set
 */
function validateDefinitions(word, definitions) {
    const issues = [];
    
    if (!definitions || definitions.length === 0) {
        issues.push('No definitions found');
    }
    
    // Check each definition
    definitions.forEach((def, index) => {
        if (hasCyclicalReference(word, def)) {
            issues.push(`Definition ${index + 1} contains cyclical reference`);
        }
        if (isNameBasedDefinition(def)) {
            issues.push(`Definition ${index + 1} is name-based`);
        }
        if (def.length < 10) {
            issues.push(`Definition ${index + 1} is too short`);
        }
        if (def.length > 200) {
            issues.push(`Definition ${index + 1} is too long`);
        }
    });
    
    // Check for duplicates
    const unique = new Set(definitions.map(d => d.toLowerCase()));
    if (unique.size < definitions.length) {
        issues.push('Contains duplicate definitions');
    }
    
    return {
        valid: issues.length === 0,
        issues
    };
}

module.exports = {
    filterDefinitions,
    orderDefinitionsForGame,
    validateDefinitions,
    MANUAL_DEFINITIONS
};