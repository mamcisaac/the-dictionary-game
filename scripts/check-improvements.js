#!/usr/bin/env node
/**
 * Quick script to check improvements made to specific words
 */

const fs = require('fs');
const path = require('path');

// Load updated puzzle data
const puzzlePath = path.join(__dirname, '..', 'src', 'data', 'puzzle.json');
const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf8'));

// Words to check
const checkWords = ['evaluation', 'location', 'option', 'fitness', 'mission', 'information', 'free', 'like', 'over'];

console.log('🔍 Checking Improvements to Key Words\n');

checkWords.forEach(word => {
    const entry = puzzleData.find(e => e.word === word);
    if (entry) {
        console.log(`📌 ${word.toUpperCase()}`);
        console.log(`Definitions: ${entry.definitions?.length || 0}`);
        if (entry.definitions?.[0]) {
            console.log(`  1st: "${entry.definitions[0].substring(0, 60)}..."`);
        }
        console.log(`Examples: ${entry.examples?.length || 0}`);
        if (entry.examples?.[0]) {
            console.log(`  1st: "${entry.examples[0]}"`);
        }
        if (entry.examples?.some(ex => ex.includes('The situation became') || ex.includes('She felt'))) {
            console.log(`  ⚠️  Still has problematic template!`);
        } else {
            console.log(`  ✅ No problematic templates`);
        }
        console.log('');
    }
});