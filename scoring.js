// Advanced Scoring System for The Dictionary Game
// Implements difficulty-aware, information-theoretic scoring

class GameScoring {
    constructor() {
        this.K = 12; // Points per bit of entropy constant
        this.startTime = null;
        this.baseScore = 0;
        this.rawScore = 0;
        this.informationEntropy = 0;
        this.initialEntropy = 0;
        this.difficulty = 0;
        this.guessCount = 0;
        this.totalCluesCost = 0;
        this.firstGuessBonus = 50;
    }

    // Initialize scoring for a new game
    initializeGame(puzzleData) {
        this.startTime = Date.now();
        this.difficulty = this.calculateDifficulty(puzzleData);
        this.baseScore = this.calculateBaseScore(this.difficulty);
        this.initialEntropy = this.calculateInitialEntropy(puzzleData.word);
        this.informationEntropy = this.initialEntropy;
        this.guessCount = 0;
        this.totalCluesCost = 0;
        this.rawScore = this.baseScore;

        console.log(`Game initialized: Difficulty=${this.difficulty.toFixed(3)}, Base=${this.baseScore}, Entropy=${this.initialEntropy.toFixed(2)} bits`);
    }

    // Calculate word difficulty (D) from 0 to 1
    calculateDifficulty(puzzleData) {
        const word = puzzleData.word.toLowerCase();
        
        // Length component (0 to 0.4)
        const lengthScore = Math.min(0.4, (word.length - 3) / 10);
        
        // Frequency component using Zipf approximation (0 to 0.4)
        // Common words like "the", "and" get low scores
        // Rare words get high scores
        const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
        const uncommonWords = ['juncture', 'ephemeral', 'serendipity', 'ubiquitous', 'facetious', 'surreptitious', 'perspicacious'];
        
        let frequencyScore = 0.2; // Default medium frequency
        if (commonWords.includes(word)) {
            frequencyScore = 0.05;
        } else if (uncommonWords.includes(word) || word.length > 8) {
            frequencyScore = 0.4;
        } else if (word.length > 6) {
            frequencyScore = 0.3;
        }
        
        // Obscurity flags (0 to 0.2)
        const obscurityScore = this.calculateObscurityScore(puzzleData);
        
        return Math.min(1.0, lengthScore + frequencyScore + obscurityScore);
    }

    // Calculate obscurity based on available data richness
    calculateObscurityScore(puzzleData) {
        let score = 0;
        
        // Few definitions suggest more obscure word
        if (puzzleData.definitions.length <= 2) score += 0.05;
        
        // No synonyms/antonyms suggest obscurity
        if (!puzzleData.synonyms || puzzleData.synonyms.length === 0) score += 0.05;
        if (!puzzleData.antonyms || puzzleData.antonyms.length === 0) score += 0.05;
        
        // Few examples suggest obscurity
        if (!puzzleData.examples || puzzleData.examples.length <= 2) score += 0.05;
        
        return score;
    }

    // Calculate base score (300-600 points)
    calculateBaseScore(difficulty) {
        return Math.round(600 * (0.5 + difficulty / 2));
    }

    // Calculate initial information entropy
    calculateInitialEntropy(word) {
        // Estimate dictionary size for words starting with this letter
        const firstLetter = word[0].toLowerCase();
        const letterFrequencies = {
            'a': 16000, 'b': 11000, 'c': 16000, 'd': 11000, 'e': 8000, 'f': 9000,
            'g': 8000, 'h': 9000, 'i': 8000, 'j': 2000, 'k': 2000, 'l': 8000,
            'm': 12000, 'n': 6000, 'o': 6000, 'p': 16000, 'q': 1000, 'r': 11000,
            's': 20000, 't': 16000, 'u': 6000, 'v': 5000, 'w': 8000, 'x': 500,
            'y': 2000, 'z': 1000
        };
        
        const candidateWords = letterFrequencies[firstLetter] || 5000;
        return Math.log2(candidateWords);
    }

    // Calculate information gain for different clue types
    calculateClueInformationGain(clueType, puzzleData) {
        const word = puzzleData.word;
        
        switch (clueType) {
            case 'definition':
                return 0.8; // Additional definition provides moderate information
                
            case 'wordLength':
                // Revealing length reduces search space significantly
                return 1.1;
                
            case 'example':
                // Example sentences provide context clues
                return 1.5;
                
            case 'synonyms':
            case 'antonyms':
                // Semantic relationships provide strong hints
                return 1.7;
                
            case 'letter':
                // Revealing a letter - calculate based on position and remaining entropy
                const remainingPositions = word.length - this.getRevealedLetterCount();
                if (remainingPositions <= 1) return 1.0; // Minimal gain if almost complete
                
                // Information gain decreases as more letters are revealed
                const positionEntropy = Math.log2(26); // ~4.7 bits per letter position
                const currentMultiplier = Math.max(0.2, remainingPositions / word.length);
                return positionEntropy * currentMultiplier;
                
            default:
                return 1.0;
        }
    }

    // Get current number of revealed letters (mock implementation)
    getRevealedLetterCount() {
        // This should track actual revealed letters in the game
        // For now, assume starting with 1 (first letter)
        return 1;
    }

    // Calculate dynamic clue cost
    calculateClueCost(clueType, puzzleData) {
        const informationGain = this.calculateClueInformationGain(clueType, puzzleData);
        // Production spec formula: Cost (pts) = ⌈bits × log10(2) × 10⌉
        return Math.ceil(informationGain * Math.log10(2) * 10);
    }

    // Process a clue purchase
    purchaseClue(clueType, puzzleData) {
        const cost = this.calculateClueCost(clueType, puzzleData);
        const informationGain = this.calculateClueInformationGain(clueType, puzzleData);
        
        this.totalCluesCost += cost;
        this.informationEntropy = Math.max(0, this.informationEntropy - informationGain);
        this.updateRawScore();
        
        return {
            cost: cost,
            informationGain: informationGain,
            remainingEntropy: this.informationEntropy
        };
    }

    // Process a guess
    makeGuess(isCorrect = false) {
        this.guessCount++;
        this.updateRawScore();
        
        return {
            guessNumber: this.guessCount,
            bonus: this.getGuessBonus(),
            penalty: this.getGuessPenalty(),
            isCorrect: isCorrect
        };
    }

    // Calculate guess bonus/penalty
    getGuessBonus() {
        return this.guessCount === 1 ? this.firstGuessBonus : 0;
    }

    getGuessPenalty() {
        return this.guessCount > 5 ? (this.guessCount - 5) * 5 : 0;
    }

    // Calculate time decay
    calculateTimeDecay() {
        if (!this.startTime) return 0;
        
        const elapsedSeconds = (Date.now() - this.startTime) / 1000;
        const decay = 0.001 * Math.pow(elapsedSeconds, 2);
        return Math.min(200, decay); // Capped at 200 points
    }

    // Update raw score
    updateRawScore() {
        const timeDecay = this.calculateTimeDecay();
        const guessBonus = this.getGuessBonus();
        const guessPenalty = this.getGuessPenalty();
        
        this.rawScore = this.baseScore
            + guessBonus
            - this.totalCluesCost
            - guessPenalty
            - timeDecay;
            
        this.rawScore = Math.max(0, this.rawScore); // Never go below 0
    }

    // Get current score for display
    getCurrentScore() {
        this.updateRawScore();
        return Math.round(this.rawScore);
    }

    // Calculate final normalized score (0-1000)
    getFinalScore() {
        this.updateRawScore();
        const normalizedScore = Math.round(1000 * this.rawScore / 600);
        return Math.max(0, Math.min(1000, normalizedScore));
    }

    // Get detailed score breakdown for post-game display
    getScoreBreakdown() {
        this.updateRawScore();
        
        return {
            baseScore: this.baseScore,
            difficulty: this.difficulty,
            firstGuessBonus: this.getGuessBonus(),
            cluesCost: this.totalCluesCost,
            guessPenalty: this.getGuessPenalty(),
            timeDecay: Math.round(this.calculateTimeDecay()),
            rawScore: Math.round(this.rawScore),
            finalScore: this.getFinalScore(),
            informationEntropy: this.informationEntropy,
            guessCount: this.guessCount
        };
    }

    // Get all available clue costs for menu display
    getAllClueCosts(puzzleData) {
        return {
            definition: this.calculateClueCost('definition', puzzleData),
            wordLength: this.calculateClueCost('wordLength', puzzleData),
            example: this.calculateClueCost('example', puzzleData),
            synonyms: this.calculateClueCost('synonyms', puzzleData),
            antonyms: this.calculateClueCost('antonyms', puzzleData),
            letter: this.calculateClueCost('letter', puzzleData)
        };
    }
}

// Export for use in the main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameScoring;
} else {
    window.GameScoring = GameScoring;
}