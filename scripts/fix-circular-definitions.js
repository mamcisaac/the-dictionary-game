#!/usr/bin/env node

const fs = require('fs');
const { hasCyclicalReference } = require('./lib/word-utils.js');

// Load puzzle data
const data = JSON.parse(fs.readFileSync('src/data/puzzle.json', 'utf8'));

let totalFixed = 0;
let wordsFixed = 0;

// Process each puzzle
data.forEach(puzzle => {
    const originalCount = puzzle.definitions.length;
    puzzle.definitions = puzzle.definitions.filter(def => 
        !hasCyclicalReference(puzzle.word, def)
    );
    
    if (puzzle.definitions.length < originalCount) {
        const removed = originalCount - puzzle.definitions.length;
        console.log(`${puzzle.word}: Removed ${removed} circular definition(s)`);
        totalFixed += removed;
        wordsFixed++;
    }
});

// Save the cleaned data
fs.writeFileSync('src/data/puzzle.json', JSON.stringify(data, null, 2));

console.log(`\nTotal: Fixed ${totalFixed} circular definitions in ${wordsFixed} words`);
console.log('✅ puzzle.json has been cleaned of circular definitions');