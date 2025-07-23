/**
 * Game State Management
 * Centralized state management for The Dictionary Game
 */

// Global word list for validation
let validWords = new Set();

// Global game state - use window object for cross-module access
window.gameStarted = false;
window.puzzleData = null;
window.puzzleDataList = [];

// Global clue tracking for the menu system
window.cluesGivenByType = {
    definitions: 1,      // Start at 1 (primary shown free)
    wordLength: false,   // Has word length been revealed?
    examples: 0,         // Number of examples shown
    synonyms: false,     // Have synonyms been shown?
    antonyms: false,     // Have antonyms been shown?
    lettersRevealed: 1   // Start at 1 (first letter shown)
};

// Global game state variables  
window.currentScore = 100;
window.cluesUsed = 0;
window.guessCount = 0;

// New scoring system - initialize later after GameScoring is loaded
let gameScoring;

// Global game statistics
let gameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    bestScore: 0,
    currentStreak: 0,
    bestStreak: 0
};

// Session-specific tracking
let guessedWords = new Set();

// Modal focus management
let helpModalPreviousFocus = null;

// DOM element references for functions used outside DOMContentLoaded
let clueList, messageDisplay, currentScoreElement, progressFill, clueCounter;
let timeElapsedElement, guessCountElement, gameStartTime, gameTimerInterval;

/**
 * Reset game state for a new game
 */
function resetGameState() {
    gameStarted = false;
    puzzleData = null;
    currentScore = 100;
    cluesUsed = 0;
    guessCount = 0;
    
    // Reset session tracking
    guessedWords.clear();
    
    // Reset clue tracking
    cluesGivenByType = {
        definitions: 1,
        wordLength: false,
        examples: 0,
        synonyms: false,
        antonyms: false,
        lettersRevealed: 1
    };
    
    // Clear timers
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
    gameStartTime = null;
}

/**
 * Initialize scoring system
 */
function initializeScoring() {
    if (typeof GameScoring !== 'undefined') {
        gameScoring = new GameScoring();
    }
}

/**
 * Load word dictionary for validation
 */
async function loadWordList() {
    try {
        const response = await fetch('src/data/words_dictionary.json');
        if (!response.ok) {
            console.warn('Word dictionary not found, word validation disabled');
            validWords = null;
            return;
        }
        const wordsDict = await response.json();
        validWords = new Set(Object.keys(wordsDict).map(word => word.toLowerCase()));
        console.log(`Loaded ${validWords.size} valid words from dictionary`);
    } catch (error) {
        console.warn('Error loading word dictionary:', error);
        validWords = null;
    }
}

/**
 * Get current game state snapshot
 */
function getGameState() {
    return {
        gameStarted,
        puzzleData,
        currentScore,
        cluesUsed,
        guessCount,
        cluesGivenByType: { ...cluesGivenByType },
        gameStats: { ...gameStats }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // State variables
        validWords,
        gameStarted,
        puzzleData,
        puzzleDataList,
        cluesGivenByType,
        currentScore,
        cluesUsed,
        guessCount,
        gameScoring,
        gameStats,
        // DOM references
        clueList,
        messageDisplay,
        currentScoreElement,
        progressFill,
        clueCounter,
        timeElapsedElement,
        guessCountElement,
        gameStartTime,
        gameTimerInterval,
        // Functions
        resetGameState,
        initializeScoring,
        loadWordList,
        getGameState
    };
} else {
    // Make available globally
    window.GameState = {
        resetGameState,
        initializeScoring,
        loadWordList,
        getGameState
    };
}