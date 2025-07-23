// Internationalization strings for The Dictionary Game
// Default language: English (en-US)

const i18n = {
    // Game UI
    gameTitle: "The Dictionary Game",
    skipToContent: "Skip to main content",
    
    // Intro and prompts
    introText: "Guess the word from its clues.",
    guessPlaceholder: "Enter your guess",
    guessAriaLabel: "Enter your guess here",
    
    // Buttons
    guessButton: "Guess",
    getClueButton: "Get a Clue",
    newGameButton: "New Game",
    revealAnswerButton: "Reveal Answer",
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
        gaveUp: "Answer revealed. The word was: {word}",
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
                content: 'Click "Get a Clue" to see available clue types and their <strong>dynamic costs</strong>.'
            },
            4: {
                title: "Clue types",
                content: "Definitions, word length, examples, synonyms/antonyms, and letter reveals. <strong>Costs vary by information value.</strong>"
            },
            5: {
                title: "Smart Scoring",
                content: "Your score depends on <strong>word difficulty</strong>, clue efficiency, and solving speed. Harder words = higher potential scores!"
            }
        },
        advanced: {
            title: "Advanced Scoring System",
            sections: {
                difficulty: {
                    title: "Difficulty-Aware Scoring",
                    content: "Each word has a difficulty score (0-1) based on length, rarity, and complexity. Harder words offer <strong>300-600 base points</strong>, while easier words start lower."
                },
                clues: {
                    title: "Dynamic Clue Costs",
                    content: "Clue costs are calculated using <strong>information theory</strong>:<br>• Additional Definition: ~10 pts<br>• Word Length: ~13 pts<br>• Example Sentence: ~18 pts<br>• Synonyms/Antonyms: ~20 pts<br>• Letter Reveal: ~56 pts (decreases as more revealed)"
                },
                bonuses: {
                    title: "Bonuses & Penalties",
                    content: "<strong>First Guess Bonus:</strong> +50 points for perfect insight<br><strong>Guess Penalties:</strong> Free for guesses 1-5, then -5 points each<br><strong>Time Decay:</strong> Gentle quadratic decay encourages momentum"
                },
                final: {
                    title: "Final Score",
                    content: "All scores are normalized to <strong>0-1000 scale</strong> for fair comparison across different words and sessions. Perfect scores on hardest words can reach 1000!"
                }
            }
        }
    },
    
    // ARIA labels and descriptions
    aria: {
        gameClues: "Game clues",
        gameFeedback: "Game feedback",
        firstClueDescription: "First clue for the word you're guessing"
    },
    
    // Tooltips
    tooltips: {
        clueCost: "Cost deducted from score"
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
        celebration: "🎉 Victory! You scored {score}/1000 points on \"{word}\"!",
        breakdown: {
            baseScore: "Base Score",
            difficulty: "Difficulty",
            firstGuessBonus: "First Guess Bonus",
            cluesCost: "Clues Cost",
            guessPenalty: "Guess Penalty", 
            timeDecay: "Time Decay",
            rawScore: "Raw Score",
            finalScore: "Final Score"
        }
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