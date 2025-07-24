#!/usr/bin/env node
/**
 * Main Word Data Generation Script
 * Generates high-quality definitions, synonyms, antonyms, and examples
 */

const fs = require('fs');
const path = require('path');
const { DatamuseClient, WordnikClient, FreeDictionaryClient, delay } = require('./lib/api-clients');
const { filterDefinitions, orderDefinitionsForGame, validateDefinitions } = require('./lib/definition-filters');
const { filterExamples } = require('./lib/example-validators');
const { extractPartOfSpeech } = require('./lib/word-utils');

// Load configuration
const configPath = path.join(__dirname, 'config', 'api-keys.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize API clients
const datamuse = new DatamuseClient();
const wordnik = new WordnikClient(config.wordnik.apiKey);
const freeDict = new FreeDictionaryClient();

// Load current puzzle data
const puzzlePath = path.join(__dirname, '..', 'src', 'data', 'puzzle.json');
const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf8'));

// Progress tracking
let processed = 0;
let improved = 0;
let failed = 0;
const startTime = Date.now();

// Logging
const logFile = path.join(__dirname, `generation-log-${new Date().toISOString().split('T')[0]}.txt`);
const log = (message) => {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
};

/**
 * Process a single word entry
 */
async function processWord(wordEntry, index) {
    const { word } = wordEntry;
    log(`[${index + 1}/${puzzleData.length}] Processing: ${word}`);
    
    try {
        const updates = {};
        let hasChanges = false;
        
        // 1. Fetch and filter definitions
        const datamuseDefinitions = await datamuse.getDefinitions(word);
        const wordnikDefinitions = config.wordnik.apiKey ? await wordnik.getDefinitions(word) : [];
        
        const allDefinitions = [...datamuseDefinitions, ...wordnikDefinitions];
        const filteredDefinitions = await filterDefinitions(word, allDefinitions);
        
        if (filteredDefinitions.length > 0) {
            const orderedDefinitions = orderDefinitionsForGame(filteredDefinitions);
            const validation = validateDefinitions(word, orderedDefinitions);
            
            if (validation.valid && 
                JSON.stringify(orderedDefinitions) !== JSON.stringify(wordEntry.definitions)) {
                updates.definitions = orderedDefinitions;
                hasChanges = true;
                log(`  ✅ Updated definitions (${orderedDefinitions.length} total)`);
            } else if (!validation.valid) {
                log(`  ⚠️  Definition issues: ${validation.issues.join(', ')}`);
            }
        }
        
        // 2. Fetch synonyms
        const synonyms = await datamuse.getSynonyms(word, 6);
        if (synonyms.length > 0 && 
            JSON.stringify(synonyms) !== JSON.stringify(wordEntry.synonyms)) {
            updates.synonyms = synonyms;
            hasChanges = true;
            log(`  ✅ Updated synonyms: ${synonyms.join(', ')}`);
        }
        
        // 3. Fetch antonyms
        const antonyms = await datamuse.getAntonyms(word, 4);
        if (antonyms.length > 0 && 
            JSON.stringify(antonyms) !== JSON.stringify(wordEntry.antonyms)) {
            updates.antonyms = antonyms;
            hasChanges = true;
            log(`  ✅ Updated antonyms: ${antonyms.join(', ')}`);
        }
        
        // 4. Fetch example sentences
        let examples = [];
        
        // Try Free Dictionary API first
        const freeDictExamples = await freeDict.getExamples(word);
        if (freeDictExamples.length > 0) {
            examples = filterExamples(freeDictExamples, word).slice(0, 5);
        }
        
        // Try Wordnik if we don't have enough examples and API key is available
        if (examples.length < 3 && config.wordnik.apiKey) {
            const wordnikExamples = await wordnik.getExamples(word, 10);
            const filteredWordnik = filterExamples(wordnikExamples, word);
            // Combine and deduplicate
            const combined = [...examples, ...filteredWordnik];
            examples = [...new Set(combined)].slice(0, 5);
        }
        
        // No fallback examples - bad examples are worse than no examples
        
        if (examples.length > 0 && 
            JSON.stringify(examples) !== JSON.stringify(wordEntry.examples)) {
            updates.examples = examples;
            hasChanges = true;
            log(`  ✅ Updated examples (${examples.length} total)`);
        }
        
        // Apply updates
        if (hasChanges) {
            Object.assign(wordEntry, updates);
            improved++;
            log(`  ✨ Improved ${Object.keys(updates).length} fields`);
        } else {
            log(`  ⏭️  No improvements needed`);
        }
        
        processed++;
        
    } catch (error) {
        failed++;
        log(`  ❌ Error: ${error.message}`);
    }
    
    // Rate limiting
    await delay(100);
}

/**
 * Main execution
 */
async function main() {
    log('🚀 Starting Word Data Generation');
    log(`📊 Processing ${puzzleData.length} words`);
    log(`🔧 Wordnik API: ${config.wordnik.apiKey ? 'Configured' : 'Not configured (examples will use fallback)'}`);
    log('');
    
    // Process in batches to show progress
    const batchSize = 10;
    for (let i = 0; i < puzzleData.length; i += batchSize) {
        const batch = puzzleData.slice(i, Math.min(i + batchSize, puzzleData.length));
        await Promise.all(
            batch.map((entry, idx) => processWord(entry, i + idx))
        );
        
        // Progress report every 50 words
        if ((i + batchSize) % 50 === 0) {
            const elapsed = (Date.now() - startTime) / 1000 / 60;
            const rate = processed / elapsed;
            const remaining = (puzzleData.length - processed) / rate;
            log(`\n📈 Progress: ${processed}/${puzzleData.length} (${(processed/puzzleData.length*100).toFixed(1)}%)`);
            log(`⏱️  Elapsed: ${elapsed.toFixed(1)}m | Remaining: ${remaining.toFixed(1)}m`);
            log(`📊 Improved: ${improved} | Failed: ${failed}\n`);
        }
    }
    
    // Save updated data
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'puzzle.json');
    fs.writeFileSync(outputPath, JSON.stringify(puzzleData, null, 2));
    
    // Final report
    const totalTime = (Date.now() - startTime) / 1000 / 60;
    log('\n✅ Generation Complete!');
    log(`📊 Summary:`);
    log(`  - Processed: ${processed} words`);
    log(`  - Improved: ${improved} words (${(improved/processed*100).toFixed(1)}%)`);
    log(`  - Failed: ${failed} words`);
    log(`  - Time: ${totalTime.toFixed(1)} minutes`);
    log(`  - Output: ${outputPath}`);
    
    // Create backup
    const backupPath = outputPath.replace('.json', `-backup-${new Date().toISOString().split('T')[0]}.json`);
    fs.copyFileSync(outputPath, backupPath);
    log(`  - Backup: ${backupPath}`);
}

// Run with error handling
main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});