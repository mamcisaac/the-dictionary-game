#!/usr/bin/env node
/**
 * Puzzle Data Validation Script
 * Comprehensive validation of puzzle.json quality
 */

const fs = require('fs');
const path = require('path');
const { hasCyclicalReference, isNameBasedDefinition } = require('./lib/word-utils');
const { validateExample } = require('./lib/example-validators');

// Load puzzle data
const puzzlePath = path.join(__dirname, '..', 'src', 'data', 'puzzle.json');
const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf8'));

// Issue tracking
const issues = {
    cyclical: [],
    nameBased: [],
    duplicates: [],
    badExamples: [],
    missingData: [],
    other: []
};

let totalIssues = 0;

/**
 * Validate a single word entry
 */
function validateWordEntry(entry, index) {
    const { word, definitions = [], synonyms = [], antonyms = [], examples = [] } = entry;
    const wordIssues = [];
    
    // Check for missing required data
    if (!word) {
        issues.missingData.push(`Entry ${index}: Missing word`);
        totalIssues++;
        return;
    }
    
    if (!definitions || definitions.length === 0) {
        issues.missingData.push(`${word}: No definitions`);
        totalIssues++;
    }
    
    if (!examples || examples.length === 0) {
        issues.missingData.push(`${word}: No examples`);
        totalIssues++;
    }
    
    // Validate definitions
    definitions.forEach((def, idx) => {
        // Check for cyclical references
        if (hasCyclicalReference(word, def)) {
            issues.cyclical.push(`${word}: Definition ${idx + 1} contains "${def}"`);
            totalIssues++;
        }
        
        // Check for name-based definitions
        if (isNameBasedDefinition(def)) {
            issues.nameBased.push(`${word}: Definition ${idx + 1} is name-based: "${def}"`);
            totalIssues++;
        }
        
        // Check definition quality
        if (def.length < 10) {
            issues.other.push(`${word}: Definition ${idx + 1} too short (${def.length} chars)`);
            totalIssues++;
        }
        
        if (def.length > 200) {
            issues.other.push(`${word}: Definition ${idx + 1} too long (${def.length} chars)`);
            totalIssues++;
        }
    });
    
    // Check for duplicate definitions
    const uniqueDefs = new Set(definitions.map(d => d.toLowerCase().trim()));
    if (uniqueDefs.size < definitions.length) {
        issues.duplicates.push(`${word}: Has duplicate definitions`);
        totalIssues++;
    }
    
    // Validate examples
    examples.forEach((ex, idx) => {
        if (!validateExample(ex, word)) {
            issues.badExamples.push(`${word}: Example ${idx + 1}: "${ex}"`);
            totalIssues++;
        }
    });
    
    // Check for duplicate synonyms
    const uniqueSyns = new Set(synonyms.map(s => s.toLowerCase()));
    if (uniqueSyns.size < synonyms.length) {
        issues.duplicates.push(`${word}: Has duplicate synonyms`);
        totalIssues++;
    }
    
    // Check if word appears in its own synonyms
    if (synonyms.some(syn => syn.toLowerCase() === word.toLowerCase())) {
        issues.other.push(`${word}: Appears in its own synonyms`);
        totalIssues++;
    }
}

/**
 * Generate detailed report
 */
function generateReport() {
    console.log('🔍 Puzzle Data Validation Report');
    console.log('================================\n');
    
    console.log(`📊 Summary:`);
    console.log(`  - Total words: ${puzzleData.length}`);
    console.log(`  - Total issues: ${totalIssues}`);
    console.log(`  - Words with issues: ${new Set([
        ...issues.cyclical.map(i => i.split(':')[0]),
        ...issues.nameBased.map(i => i.split(':')[0]),
        ...issues.duplicates.map(i => i.split(':')[0]),
        ...issues.badExamples.map(i => i.split(':')[0]),
        ...issues.missingData.map(i => i.split(':')[0]),
        ...issues.other.map(i => i.split(':')[0])
    ]).size}`);
    
    // Detailed issues
    if (issues.cyclical.length > 0) {
        console.log(`\n🔄 Cyclical Definitions (${issues.cyclical.length}):`);
        issues.cyclical.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
        if (issues.cyclical.length > 10) {
            console.log(`  ... and ${issues.cyclical.length - 10} more`);
        }
    }
    
    if (issues.nameBased.length > 0) {
        console.log(`\n📛 Name-Based Definitions (${issues.nameBased.length}):`);
        issues.nameBased.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
        if (issues.nameBased.length > 10) {
            console.log(`  ... and ${issues.nameBased.length - 10} more`);
        }
    }
    
    if (issues.badExamples.length > 0) {
        console.log(`\n❌ Bad Examples (${issues.badExamples.length}):`);
        issues.badExamples.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
        if (issues.badExamples.length > 10) {
            console.log(`  ... and ${issues.badExamples.length - 10} more`);
        }
    }
    
    if (issues.duplicates.length > 0) {
        console.log(`\n👥 Duplicates (${issues.duplicates.length}):`);
        issues.duplicates.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
        if (issues.duplicates.length > 10) {
            console.log(`  ... and ${issues.duplicates.length - 10} more`);
        }
    }
    
    if (issues.missingData.length > 0) {
        console.log(`\n📭 Missing Data (${issues.missingData.length}):`);
        issues.missingData.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
        if (issues.missingData.length > 10) {
            console.log(`  ... and ${issues.missingData.length - 10} more`);
        }
    }
    
    if (issues.other.length > 0) {
        console.log(`\n⚠️  Other Issues (${issues.other.length}):`);
        issues.other.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
        if (issues.other.length > 10) {
            console.log(`  ... and ${issues.other.length - 10} more`);
        }
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, `validation-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Overall status
    console.log('\n🎯 Overall Status:');
    if (totalIssues === 0) {
        console.log('  ✅ All validations passed! Puzzle data is high quality.');
    } else if (totalIssues < 50) {
        console.log('  ⚠️  Minor issues found. Consider running generate-word-data.js to fix.');
    } else {
        console.log('  ❌ Significant issues found. Run generate-word-data.js to improve quality.');
    }
}

/**
 * Check specific problematic examples mentioned by user
 */
function checkKnownIssues() {
    console.log('\n🔍 Checking Known Issues:');
    
    // Check "evaluation" examples
    const evaluation = puzzleData.find(entry => entry.word === 'evaluation');
    if (evaluation) {
        console.log('\n📍 Evaluation examples:');
        evaluation.examples?.forEach((ex, idx) => {
            console.log(`  ${idx + 1}. "${ex}"`);
            if (ex.includes('The situation became') || ex.includes('She felt')) {
                console.log(`     ❌ Bad template detected!`);
            }
        });
    }
    
    // Check for other problematic patterns
    const problematicWords = [];
    puzzleData.forEach(entry => {
        if (entry.examples?.some(ex => 
            ex.includes('The situation became [blank]') || 
            ex.includes('She felt [blank]'))) {
            problematicWords.push(entry.word);
        }
    });
    
    if (problematicWords.length > 0) {
        console.log(`\n⚠️  Words using problematic templates: ${problematicWords.join(', ')}`);
    }
}

// Main execution
console.clear();
puzzleData.forEach((entry, index) => validateWordEntry(entry, index));
checkKnownIssues();
generateReport();