// Simple Scoring System for The Dictionary Game
// Start with 100 points, deduct for guesses and clues

class GameScoring {
    constructor() {
        this.maxScore = 100;
        this.guessCount = 0;
        this.totalCluesCost = 0;
        
        // Static clue costs
        this.clueCosts = {
            definition: 2,
            wordLength: 3,
            example: 5,
            synonym: 5,
            antonym: 5,
            letter: 10
        };
    }

    // Initialize scoring for a new game
    initializeGame(puzzleData) {
        this.guessCount = 0;
        this.totalCluesCost = 0;
        console.log(`Game initialized with word: ${puzzleData.word}`);
    }

    // Process a clue purchase
    purchaseClue(clueType, puzzleData) {
        const cost = this.clueCosts[clueType] || 0;
        this.totalCluesCost += cost;
        
        return {
            cost: cost,
            totalCluesCost: this.totalCluesCost
        };
    }

    // Process a guess
    makeGuess(isCorrect = false) {
        this.guessCount++;
        
        return {
            guessNumber: this.guessCount,
            guessCost: this.guessCount > 1 ? 1 : 0, // First guess is free
            isCorrect: isCorrect
        };
    }

    // Get current score
    getCurrentScore() {
        // Start at 100, subtract guess costs (first is free) and clue costs
        const guessCost = Math.max(0, this.guessCount - 1);
        const score = this.maxScore - guessCost - this.totalCluesCost;
        return Math.max(0, score); // Never go below 0
    }

    // Get final score (same as current score in this simple system)
    getFinalScore() {
        return this.getCurrentScore();
    }

    // Get detailed score breakdown
    getScoreBreakdown() {
        const guessCost = Math.max(0, this.guessCount - 1);
        const currentScore = this.getCurrentScore();
        
        return {
            maxScore: this.maxScore,
            guessCount: this.guessCount,
            guessCost: guessCost,
            cluesCost: this.totalCluesCost,
            finalScore: currentScore
        };
    }

    // Get all clue costs for menu display
    getAllClueCosts(puzzleData) {
        return { ...this.clueCosts };
    }

    // Calculate clue cost (for compatibility)
    calculateClueCost(clueType, puzzleData) {
        return this.clueCosts[clueType] || 0;
    }
}

// Export for use in the main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameScoring;
} else {
    window.GameScoring = GameScoring;
}