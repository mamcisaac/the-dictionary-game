/**
 * API Client Implementations
 * Handles all external API calls for word data generation
 */

const https = require('https');

/**
 * Make HTTPS request and return parsed JSON
 */
async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Rate limiting helper
 */
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Datamuse API Client
 * Free API for word relationships, definitions, and metadata
 */
class DatamuseClient {
    constructor() {
        this.baseUrl = 'https://api.datamuse.com/words';
        this.rateLimit = 100; // ms between requests
    }

    async getDefinitions(word) {
        await delay(this.rateLimit);
        const url = `${this.baseUrl}?sp=${encodeURIComponent(word)}&md=d&max=1`;
        const results = await makeRequest(url);
        
        if (results && results[0] && results[0].defs) {
            return results[0].defs.map(def => {
                // Remove part of speech prefix (e.g., "n\t" or "v\t")
                return def.replace(/^[a-z]+\t/, '');
            });
        }
        return [];
    }

    async getSynonyms(word, limit = 6) {
        await delay(this.rateLimit);
        const url = `${this.baseUrl}?rel_syn=${encodeURIComponent(word)}&max=${limit}`;
        const results = await makeRequest(url);
        return results.map(item => item.word);
    }

    async getAntonyms(word, limit = 4) {
        await delay(this.rateLimit);
        const url = `${this.baseUrl}?rel_ant=${encodeURIComponent(word)}&max=${limit}`;
        const results = await makeRequest(url);
        return results.map(item => item.word);
    }

    async getRelatedWords(word) {
        // Get various related words for better context
        await delay(this.rateLimit);
        const url = `${this.baseUrl}?ml=${encodeURIComponent(word)}&max=10`;
        const results = await makeRequest(url);
        return results.map(item => item.word);
    }
}

/**
 * Wordnik API Client
 * Requires API key for example sentences
 */
class WordnikClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.wordnik.com/v4/word.json';
        this.rateLimit = 200; // ms between requests (stricter limit)
    }

    async getExamples(word, limit = 5) {
        if (!this.apiKey) {
            console.warn('No Wordnik API key provided, skipping examples');
            return [];
        }

        await delay(this.rateLimit);
        const url = `${this.baseUrl}/${encodeURIComponent(word)}/examples?limit=${limit}&api_key=${this.apiKey}`;
        
        try {
            const data = await makeRequest(url);
            if (data && data.examples) {
                return data.examples
                    .filter(ex => ex.text && ex.text.length > 10 && ex.text.length < 150)
                    .map(ex => ex.text);
            }
        } catch (error) {
            console.error(`Error fetching examples for ${word}:`, error.message);
        }
        
        return [];
    }

    async getDefinitions(word) {
        if (!this.apiKey) {
            return [];
        }

        await delay(this.rateLimit);
        const url = `${this.baseUrl}/${encodeURIComponent(word)}/definitions?limit=5&api_key=${this.apiKey}`;
        
        try {
            const data = await makeRequest(url);
            if (Array.isArray(data)) {
                return data
                    .filter(def => def.text)
                    .map(def => def.text);
            }
        } catch (error) {
            console.error(`Error fetching Wordnik definitions for ${word}:`, error.message);
        }
        
        return [];
    }
}

/**
 * Free Dictionary API Client
 * Free API for definitions with example sentences
 */
class FreeDictionaryClient {
    constructor() {
        this.baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
        this.rateLimit = 300; // ms between requests (conservative)
    }

    async getExamples(word) {
        await delay(this.rateLimit);
        const url = `${this.baseUrl}/${encodeURIComponent(word)}`;
        
        try {
            const data = await makeRequest(url);
            if (!Array.isArray(data) || data.length === 0) {
                return [];
            }

            const examples = [];
            
            // Extract examples from all meanings and definitions
            for (const entry of data) {
                if (entry.meanings) {
                    for (const meaning of entry.meanings) {
                        if (meaning.definitions) {
                            for (const def of meaning.definitions) {
                                if (def.example) {
                                    // Replace the word (case-insensitive) with [blank]
                                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                                    const blankedExample = def.example.replace(regex, '[blank]');
                                    examples.push(blankedExample);
                                }
                            }
                        }
                    }
                }
            }
            
            return examples;
        } catch (error) {
            // Silently fail - no examples is better than bad examples
            return [];
        }
    }
}

/**
 * Fallback example generator using templates
 * Only used when API examples are unavailable or poor quality
 */
class FallbackExampleGenerator {
    constructor() {
        // High-quality templates that work for different parts of speech
        this.templates = {
            noun: [
                "The [blank] was exactly what they needed.",
                "She studied the [blank] carefully before making a decision.",
                "A new [blank] appeared in the morning newspaper.",
                "The children were fascinated by the [blank].",
                "He wrote a book about the history of [blank]."
            ],
            verb: [
                "They decided to [blank] the project next week.",
                "She learned how to [blank] during her training.",
                "The team will [blank] the results tomorrow.",
                "He refused to [blank] without proper authorization.",
                "We need to [blank] before the deadline."
            ],
            adjective: [
                "The [blank] solution surprised everyone.",
                "It was a [blank] day for the celebration.",
                "Her [blank] approach solved the problem.",
                "The [blank] design won first prize.",
                "They found a [blank] alternative to the original plan."
            ],
            general: [
                "The concept of [blank] has evolved over time.",
                "Understanding [blank] requires careful study.",
                "The importance of [blank] cannot be overstated.",
                "They discussed [blank] at the conference.",
                "The book explains [blank] in simple terms."
            ]
        };
    }

    generate(word, partOfSpeech = 'general') {
        const templates = this.templates[partOfSpeech] || this.templates.general;
        // Return 2-3 diverse examples
        const selected = [];
        const indices = new Set();
        
        while (selected.length < 3 && indices.size < templates.length) {
            const idx = Math.floor(Math.random() * templates.length);
            if (!indices.has(idx)) {
                indices.add(idx);
                selected.push(templates[idx]);
            }
        }
        
        return selected;
    }
}

module.exports = {
    DatamuseClient,
    WordnikClient,
    FreeDictionaryClient,
    FallbackExampleGenerator,
    delay
};