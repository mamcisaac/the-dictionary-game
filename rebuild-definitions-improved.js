#!/usr/bin/env node
/**
 * Improved Definition Rebuilder
 * 
 * Focuses on getting simple, common definitions while avoiding cyclical ones
 */

const fs = require('fs');
const https = require('https');

// Load current puzzle data
const puzzleData = JSON.parse(fs.readFileSync('./src/data/puzzle.json', 'utf8'));

let requestCount = 0;

// Word variation detection (improved)
function getWordVariations(word) {
    const variations = new Set([word.toLowerCase()]);
    
    // Add obvious variations
    const wordLower = word.toLowerCase();
    
    // Common suffixes - be more aggressive about detecting roots
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment', 'able', 'ible', 'y', 'ful', 'less'];
    for (const suffix of suffixes) {
        if (wordLower.endsWith(suffix) && wordLower.length > suffix.length + 2) {
            const root = wordLower.slice(0, -suffix.length);
            variations.add(root);
            // Also add common root variations
            if (root.endsWith('i') && suffix === 'y') variations.add(root.slice(0, -1)); // happy -> happi -> happ
        }
    }
    
    // Add the root without common prefixes
    const prefixes = ['un', 're', 'pre', 'dis', 'over', 'under', 'mis', 'out', 'up'];
    for (const prefix of prefixes) {
        if (wordLower.startsWith(prefix) && wordLower.length > prefix.length + 2) {
            variations.add(wordLower.slice(prefix.length));
        }
    }
    
    // Special cases for common word patterns
    if (wordLower.endsWith('y')) {
        variations.add(wordLower.slice(0, -1)); // hairy -> hair
    }
    if (wordLower.endsWith('ies')) {
        variations.add(wordLower.slice(0, -3) + 'y'); // flies -> fly
    }
    if (wordLower.endsWith('ied')) {
        variations.add(wordLower.slice(0, -3) + 'y'); // tried -> try
    }
    
    return variations;
}

// Check if definition is cyclical
function isCyclical(word, definition) {
    const variations = getWordVariations(word);
    const defWords = definition.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
    
    for (const defWord of defWords) {
        if (variations.has(defWord)) {
            return true;
        }
    }
    return false;
}

// Check if definition is too technical/specific
function isTechnical(definition) {
    const technicalIndicators = [
        '(networking)', '(computing)', '(mathematics)', '(physics)', '(chemistry)',
        '(biology)', '(medicine)', '(law)', '(music)', '(architecture)', '(geology)',
        '(linguistics)', '(philosophy)', '(psychology)', '(sociology)', '(economics)',
        'initialism', 'acronym', 'abbreviation', 'HTTP', 'API', 'SQL', 'URL',
        'bowled', 'cricket', 'innings', 'wicket', 'offside'
    ];
    
    return technicalIndicators.some(indicator => 
        definition.toLowerCase().includes(indicator.toLowerCase())
    );
}

// Score definition quality (higher is better)
function scoreDefinition(word, definition) {
    let score = 0;
    
    // Penalize cyclical definitions heavily
    if (isCyclical(word, definition)) return -1000;
    
    // Penalize technical definitions
    if (isTechnical(definition)) score -= 500;
    
    // Prefer shorter, simpler definitions
    if (definition.length < 100) score += 100;
    if (definition.length < 50) score += 50;
    
    // Prefer definitions that start with common words
    const firstWord = definition.toLowerCase().split(' ')[0];
    const commonStarters = ['a', 'an', 'the', 'to', 'having', 'being', 'showing'];
    if (commonStarters.includes(firstWord)) score += 50;
    
    // Penalize definitions with parenthetical notes at the start
    if (definition.startsWith('(')) score -= 200;
    
    // Prefer definitions without archaic/obsolete markers
    if (definition.includes('archaic') || definition.includes('obsolete')) score -= 300;
    
    return score;
}

// Fetch definition from Datamuse with better filtering
async function fetchBetterDefinition(word) {
    return new Promise((resolve, reject) => {
        const url = `https://api.datamuse.com/words?sp=${word.toLowerCase()}&md=d&max=10`;
        
        https.get(url, { headers: { 'User-Agent': 'DictionaryGame-DefinitionBuilder/2.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                requestCount++;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed[0] && parsed[0].defs) {
                        // Collect all definitions and score them
                        const candidates = [];
                        
                        for (const defEntry of parsed[0].defs) {
                            let def = defEntry.includes('\t') ? defEntry.split('\t')[1] : defEntry;
                            def = def.trim();
                            
                            if (def.length > 10) { // Skip very short definitions
                                def = def.charAt(0).toUpperCase() + def.slice(1);
                                if (!def.endsWith('.')) def += '.';
                                
                                const score = scoreDefinition(word, def);
                                if (score > -500) { // Only consider decent definitions
                                    candidates.push({ definition: def, score });
                                }
                            }
                        }
                        
                        // Sort by score and return the best one
                        candidates.sort((a, b) => b.score - a.score);
                        
                        if (candidates.length > 0) {
                            resolve(candidates[0].definition);
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Manual overrides for common words that often get poor definitions
const manualOverrides = {
    'free': 'Not under the control or in the power of another; able to act or be done as one wishes.',
    'like': 'To find agreeable, enjoyable, or satisfactory.',
    'over': 'Extending directly upward from; above.',
    'through': 'Moving in one side and out of the other side of.',
    'must': 'Be obliged to; should (expressing necessity).',
    'post': 'A piece of mail or a message sent through a postal system.',
    'other': 'Denoting a person or thing that is different or distinct from one already mentioned.',
    'want': 'To have a desire to possess or do something.',
    'make': 'To form, create, or construct something.',
    'take': 'To lay hold of something with one\'s hands; to grab.',
    'get': 'To obtain, acquire, or receive something.',
    'give': 'To freely transfer the possession of something to someone.',
    'go': 'To move from one place to another; to travel.',
    'come': 'To move toward or arrive at a particular place.',
    'see': 'To perceive with the eyes; to observe.',
    'know': 'To be aware of through observation, inquiry, or information.',
    'think': 'To have a particular opinion, belief, or idea about someone or something.',
    'look': 'To direct one\'s gaze toward someone or something.',
    'use': 'To take, hold, or deploy something as a means of accomplishing or achieving something.',
    'find': 'To discover or locate someone or something.',
    'work': 'Activity involving mental or physical effort done to achieve a purpose or result.',
    'call': 'To cry out to someone in order to summon them or attract their attention.',
    'try': 'To make an attempt or effort to do something.',
};

// Process a subset of words for testing
async function rebuildDefinitions() {
    console.log(`🚀 Rebuilding definitions with improved filtering...`);
    
    const results = [];
    let processed = 0;
    let improved = 0;
    let manualCount = 0;
    
    for (const entry of puzzleData) {
        const word = entry.word;
        console.log(`[${processed + 1}/${puzzleData.length}] Processing: ${word}`);
        
        let newDefinition = null;
        
        // Check manual overrides first
        if (manualOverrides[word.toLowerCase()]) {
            newDefinition = manualOverrides[word.toLowerCase()];
            console.log(`  🎯 Manual override: ${newDefinition.substring(0, 50)}...`);
            manualCount++;
        } else {
            try {
                newDefinition = await fetchBetterDefinition(word);
                
                if (newDefinition) {
                    console.log(`  ✅ API result: ${newDefinition.substring(0, 50)}...`);
                } else {
                    console.log(`  ⚠️  No suitable definition found`);
                }
                
                // Small delay to be nice to the API
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
            }
        }
        
        if (newDefinition && newDefinition !== entry.definitions[0]) {
            // Update the primary definition
            const updatedEntry = {
                ...entry,
                definitions: [newDefinition, ...entry.definitions.slice(1)]
            };
            results.push(updatedEntry);
            improved++;
        } else {
            // Keep original
            results.push(entry);
        }
        
        processed++;
        
        // Progress update every 50 words
        if (processed % 50 === 0) {
            console.log(`\n--- Progress: ${processed}/${puzzleData.length} ---`);
            console.log(`Improved: ${improved}, Manual: ${manualCount}, API calls: ${requestCount}`);
        }
    }
    
    // Save the updated puzzle data
    fs.writeFileSync('./src/data/puzzle.json', JSON.stringify(results, null, 2));
    
    console.log('\n✅ COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   Total words: ${processed}`);
    console.log(`   Improved definitions: ${improved}`);
    console.log(`   Manual overrides: ${manualCount}`);
    console.log(`   API calls made: ${requestCount}`);
    console.log(`   Success rate: ${Math.round((improved / processed) * 100)}%`);
}

// Run the script
rebuildDefinitions().catch(console.error);