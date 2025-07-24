# Dictionary Game Generation Scripts

High-quality word data generation and validation scripts for The Dictionary Game.

## Overview

These scripts ensure the puzzle data contains:
- Non-cyclical definitions (no using the root word)
- No name-based definitions that give away answers
- High-quality example sentences with proper grammar
- Comprehensive synonyms and antonyms
- Proper ordering for game difficulty (esoteric definitions first)

## Scripts

### 1. `generate-word-data.js`
Main generation script that fetches and improves word data.

**Features:**
- Fetches definitions from Datamuse API
- Fetches synonyms/antonyms from Datamuse API
- Generates high-quality example sentences
- Filters out cyclical and name-based definitions
- Manual overrides for common problematic words
- Progress tracking and detailed logging

**Usage:**
```bash
node scripts/generate-word-data.js
```

**Configuration:**
- Edit `config/api-keys.json` to add Wordnik API key for real examples
- Without Wordnik key, uses high-quality fallback templates

### 2. `validate-puzzle-data.js`
Comprehensive validation of puzzle data quality.

**Checks for:**
- Cyclical definitions (word using itself)
- Name-based definitions
- Duplicate definitions
- Bad example sentences
- Missing required data

**Usage:**
```bash
node scripts/validate-puzzle-data.js
```

### 3. `check-improvements.js`
Quick utility to check specific words after generation.

**Usage:**
```bash
node scripts/check-improvements.js
```

## API Configuration

Edit `scripts/config/api-keys.json`:
```json
{
  "wordnik": {
    "apiKey": "YOUR_API_KEY_HERE",
    "note": "Get your free API key from https://developer.wordnik.com/"
  },
  "datamuse": {
    "apiKey": null,
    "note": "Datamuse API is free and doesn't require a key"
  }
}
```

## Quality Standards

### Definitions
- Must not contain the root word or variations
- No name-based definitions ("Alternative form of X")
- Length: 10-200 characters
- Clear, common language preferred

### Example Sentences
- Must contain exactly one [blank] placeholder
- Length: 10-150 characters, 6-25 words
- Proper grammar and punctuation
- No formatting artifacts or special characters
- Natural, everyday language

### Generation Process
1. Fetch data from APIs
2. Apply quality filters
3. Validate against standards
4. Use fallbacks when needed
5. Save with backup

## Logs and Reports

- Generation logs: `scripts/generation-log-YYYY-MM-DD.txt`
- Validation reports: `scripts/validation-report-YYYY-MM-DD.json`
- Backups: `src/data/puzzle-backup-YYYY-MM-DD.json`

## Maintenance

Run monthly or when adding new words:
1. `node scripts/validate-puzzle-data.js` - Check current quality
2. `node scripts/generate-word-data.js` - Improve data
3. `node scripts/validate-puzzle-data.js` - Verify improvements

## Implementation Notes

The game uses esoteric-first ordering:
- First shown: 2nd definition (more challenging)
- Then: 3rd definition (if exists)
- Finally: 1st definition (most common)

This makes the game more interesting by not revealing the obvious definition immediately.