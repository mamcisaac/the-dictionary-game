#!/usr/bin/env node
/**
 * Rebuild Puzzle Definitions using Datamuse API
 * 
 * Fetches clean, non-cyclical definitions for all words in puzzle.json
 * Filters out definitions that contain the root word or its variations
 */

const fs = require('fs');
const https = require('https');

// Load current puzzle data
const puzzleData = JSON.parse(fs.readFileSync('./src/data/puzzle.json', 'utf8'));

// Rate limiting
const RATE_LIMIT = 1000; // requests per hour for Datamuse
let requestCount = 0;
let startTime = Date.now();

// Word variation detection
function getWordVariations(word) {
    const variations = new Set([word.toLowerCase()]);
    
    // Common suffixes to try removing
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment', 'able', 'ible'];
    
    for (const suffix of suffixes) {
        if (word.toLowerCase().endsWith(suffix) && word.length > suffix.length + 2) {
            variations.add(word.toLowerCase().slice(0, -suffix.length));
        }
    }
    
    // Add common prefixes
    const prefixes = ['un', 're', 'pre', 'dis', 'mis', 'over', 'under', 'out', 'up'];
    for (const prefix of prefixes) {
        if (word.toLowerCase().startsWith(prefix) && word.length > prefix.length + 2) {
            variations.add(word.toLowerCase().slice(prefix.length));
        }
    }
    
    return variations;
}

// Check if definition contains the word or its variations
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

// Check rate limit
function checkRateLimit() {
    const elapsed = Date.now() - startTime;
    if (elapsed < 3600000 && requestCount >= RATE_LIMIT) {
        const waitTime = 3600000 - elapsed;
        console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime/1000/60)} minutes...`);
        return new Promise(resolve => setTimeout(resolve, waitTime));
    }
    return Promise.resolve();
}

// Fetch definition from Datamuse
async function fetchDatamuseDefinition(word) {
    await checkRateLimit();
    
    return new Promise((resolve, reject) => {
        const url = `https://api.datamuse.com/words?sp=${word.toLowerCase()}&md=d&max=5`;
        
        https.get(url, { headers: { 'User-Agent': 'DictionaryGame-DefinitionBuilder/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                requestCount++;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed[0] && parsed[0].defs) {
                        // Try to find a good definition that's not cyclical
                        for (const defEntry of parsed[0].defs) {
                            let def = defEntry.includes('\t') ? defEntry.split('\t')[1] : defEntry;
                            def = def.trim();
                            
                            // Clean up the definition
                            def = def.charAt(0).toUpperCase() + def.slice(1);
                            if (!def.endsWith('.')) def += '.';
                            
                            // Check if it's cyclical
                            if (!isCyclical(word, def)) {
                                resolve(def);
                                return;
                            }
                        }
                        // If all definitions are cyclical, return null
                        resolve(null);
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

// Process all words
async function rebuildDefinitions() {
    console.log(`🚀 Rebuilding definitions for ${puzzleData.length} words...`);
    
    const results = [];
    let processed = 0;
    let improved = 0;
    let failed = 0;
    
    for (const entry of puzzleData) {
        const word = entry.word;
        console.log(`[${processed + 1}/${puzzleData.length}] Processing: ${word}`);
        
        try {
            const newDefinition = await fetchDatamuseDefinition(word);
            
            if (newDefinition) {
                // Keep the same structure but update the primary definition
                const updatedEntry = {
                    ...entry,
                    definitions: [newDefinition, ...entry.definitions.slice(1)]
                };
                results.push(updatedEntry);
                
                if (newDefinition !== entry.definitions[0]) {
                    console.log(`  ✅ Updated: ${newDefinition.substring(0, 50)}...`);
                    improved++;
                } else {
                    console.log(`  ⚪ Unchanged`);
                }
            } else {
                // Keep original if we can't find a better definition
                results.push(entry);
                console.log(`  ⚠️  No suitable definition found, keeping original`);
                failed++;
            }
            
            processed++;
            
            // Small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            results.push(entry); // Keep original on error
            failed++;
            processed++;
        }
    }
    
    // Save the updated puzzle data
    fs.writeFileSync('./src/data/puzzle.json', JSON.stringify(results, null, 2));
    
    console.log('\n✅ COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   Total words: ${processed}`);
    console.log(`   Improved definitions: ${improved}`);
    console.log(`   Failed/unchanged: ${failed}`);
    console.log(`   Success rate: ${Math.round((improved / processed) * 100)}%`);
    console.log(`\n📁 Updated puzzle.json saved`);
}

// Run the script
rebuildDefinitions().catch(console.error);