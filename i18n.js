// Internationalization strings for The Dictionary Game
// Default language: English (en-US)

const i18n = {
    // Game UI
    gameTitle: "The Dictionary Game",
    skipToContent: "Skip to main content",
    
    // Intro and prompts
    introText: "I am thinking of a word.<br>Can you guess what it is?",
    guessPlaceholder: "Enter your guess",
    guessAriaLabel: "Enter your guess here",
    
    // Buttons
    guessButton: "Guess",
    getClueButton: "Get a Clue",
    newGameButton: "New Game",
    giveUpButton: "Give Up",
    statsButton: "Stats",
    helpButton: "Help",
    resetStatsButton: "Reset Statistics",
    
    // Button aria labels
    helpAriaLabel: "Open help and tutorial",
    closeModalAriaLabel: "Close help modal",
    
    // Clue shop
    clueShopHeader: "Choose a Clue Type",
    clueTypes: {
        definition: "Additional Definition",
        wordLength: "Word Length",
        example: "Example Sentence", 
        synonym: "Synonym",
        antonym: "Antonym",
        letter: "Reveal Letter"
    },
    
    // Clue icons
    clueIcons: {
        definition: "📖",
        wordLength: "📏",
        example: "📝",
        synonym: "💡",
        antonym: "🔄", 
        letter: "🔤"
    },
    
    // Game messages
    messages: {
        alreadyGuessed: "You already guessed that!",
        invalidWord: "Please enter a valid English word.",
        correctGuess: "Congratulations! The word was: {word}. You scored {score} points!",
        gameOver: "Game Over! The word was: {word}. Your score: 0",
        gaveUp: "You gave up. The word was: {word}",
        wrongGuess: "Wrong guess! Try again.",
        startWithLetter: 'Your guess should start with "{letter}"',
        tryLonger: "Try a longer word",
        tryShorter: "Try a shorter word",
        gettingCloser: "Getting closer!",
        farAway: "Far away...",
        wordLength: "The word has {length} letters",
        noMoreClues: "No more clues available!"
    },
    
    // Scoring
    scoring: {
        currentScore: "{score} pts",
        scoreLabel: "Score",
        cluesUsed: "Clues Used",
        cluesRemaining: "{count} unopened clues",
        noMoreCluesMinScore: "No More Clues (Min Score)"
    },
    
    // Statistics
    stats: {
        header: "Game Statistics",
        gamesPlayed: "Games Played",
        gamesWon: "Games Won", 
        winRate: "Win Rate",
        avgScore: "Average Score",
        bestScore: "Best Score",
        currentStreak: "Current Streak",
        bestStreak: "Best Streak",
        winHistory: "Win History",
        legendLess: "Less",
        legendMore: "More"
    },
    
    // Help content
    help: {
        title: "How to Play",
        quickGuide: "Quick Guide",
        steps: {
            1: {
                title: "Start",
                content: "Click <strong>New Game</strong> to see the word's first letter and one definition."
            },
            2: {
                title: "Guess", 
                content: "Enter any word beginning with that letter and press <strong>Enter</strong>."
            },
            3: {
                title: "Need a hint?",
                content: 'Click "Get a Clue" to see available clue types and their costs (2-7 points).'
            },
            4: {
                title: "Clue types",
                content: "Definitions, word length, examples, synonyms/antonyms, and letter reveals."
            },
            5: {
                title: "Scoring",
                content: "You begin with 100 points. Clues cost 2-7 points each. After the first free guess, each extra guess costs 3 points."
            }
        }
    },
    
    // ARIA labels and descriptions
    aria: {
        gameClues: "Game clues",
        gameFeedback: "Game feedback",
        firstClueDescription: "First clue for the word you're guessing"
    },
    
    // Console messages (for developers)
    console: {
        gameLoaded: "Game loaded successfully",
        wordDictionaryLoaded: "Loaded {count} valid words from Cornerstone dictionary",
        wordDictionaryNotFound: "Word dictionary not found in Cornerstone, word validation disabled",
        wordDictionaryError: "Error loading word dictionary from Cornerstone:",
        startedGame: "Started game with word: {word}",
        puzzleDataNotLoaded: "Puzzle data not loaded yet!"
    },
    
    // Victory messages
    victory: {
        celebration: "🎉 Victory! You scored {score} points on \"{word}\"!"
    }
};

// Helper function to format strings with placeholders
function formatString(template, replacements) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return replacements[key] !== undefined ? replacements[key] : match;
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { i18n, formatString };
} else {
    window.i18n = i18n;
    window.formatString = formatString;
}