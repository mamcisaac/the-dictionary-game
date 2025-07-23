/**
 * Game Logic Module
 * Core game functions for The Dictionary Game
 */

/**
 * Start a new game
 * Initializes game state, fetches puzzle, and sets up UI
 */
async function startGame() {
    // If a game is already in progress, treat as giving up
    if (gameStarted) {
        Statistics.recordGameResult(false); // Record as a loss
        updateClueDisplay(formatString(i18n.messages.gaveUp, { word: puzzleData.word }));
    }
    
    // Hide empty state and show game UI
    const emptyState = document.getElementById("empty-state");
    const introText = document.getElementById("intro-text");
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    
    if (emptyState) emptyState.style.display = "none";
    if (introText) introText.style.display = "block";
    if (sidebarPlaceholder) sidebarPlaceholder.style.display = "none";
    
    // Show clue deck
    if (typeof Components !== 'undefined' && Components.ClueDeck) {
        Components.ClueDeck.show();
    }
    
    // Enable buttons
    const giveUpButton = document.getElementById("give-up-button");
    const statsButton = document.getElementById("stats-button");
    
    if (giveUpButton) {
        giveUpButton.disabled = false;
        giveUpButton.setAttribute('aria-disabled', 'false');
    }
    if (statsButton) {
        statsButton.disabled = false;
        statsButton.setAttribute('aria-disabled', 'false');
    }
    
    gameStarted = true;
    const guessButton = document.getElementById("guess-button");
    if (guessButton) guessButton.disabled = false;
    
    // Reset game state
    cluesUsed = 0;
    guessCount = 0;
    const guessedWords = new Set(); // Local to this game session
    
    const scoreContainer = document.getElementById("score-container");
    if (scoreContainer) scoreContainer.style.display = "block";
    
    // Reset clue tracking for new menu system
    cluesGivenByType = {
        definitions: 1,      // Primary definition shown free
        wordLength: false,
        examples: 0,
        synonyms: false,
        antonyms: false,
        lettersRevealed: 1   // First letter shown free
    };
    
    // Clear all previous game UI elements immediately
    if (clueList) clueList.innerHTML = '';
    const messageEl = document.getElementById("message");
    if (messageEl) messageEl.innerHTML = '';
    
    const guessInput = document.getElementById("guess-input");
    if (guessInput) guessInput.value = '';
    
    const inputContainer = DOMUtils.get("inputSection");
    const myword = document.getElementById("my-word");
    if (inputContainer) inputContainer.style.display = "block";
    if (myword) myword.style.display = "block";
    
    try {
        await fetchPuzzle();
        
        // Initialize new scoring system
        if (gameScoring) {
            gameScoring.initializeGame(puzzleData);
            currentScore = gameScoring.getCurrentScore();
        } else {
            currentScore = 100; // Fallback
        }
        
        // Update all score displays immediately
        if (typeof animateScoreUpdate === 'function' && currentScoreElement) {
            animateScoreUpdate(currentScoreElement, currentScore);
        }
        if (typeof updateScoreBadge === 'function') {
            updateScoreBadge();
        }
        
        // Display the primary definition as a ClueStripe
        const definition = puzzleData.definitions[0];
        if (clueList && typeof Components !== 'undefined' && Components.ClueStripe) {
            clueList.innerHTML = '';
            const definitionStripe = Components.ClueStripe.create('📖', `Definition: ${definition}`, 'hint-taken', null, 'definition');
            clueList.appendChild(definitionStripe);
        }
        
        // Initialize word pattern display
        if (typeof updateWordPatternDisplay === 'function') {
            updateWordPatternDisplay();
        }

        // Reset game state variables
        let currentClueIndex = 1; // Start from the second definition for the next clue
        let lettersRevealed = 1;
        let cluesGiven = []; // Reset clues given
        
        // Update progress bar after puzzle is loaded
        if (typeof updateProgressBar === 'function') {
            updateProgressBar();
        }
        
        // Update unopened clues count
        if (typeof updateUnopenedCluesCount === 'function') {
            updateUnopenedCluesCount();
        }
        
        // Initialize button costs
        if (typeof updateButtonCosts === 'function') {
            updateButtonCosts();
        }
        
        // Update difficulty display
        if (typeof updateDifficultyIndicator === 'function') {
            updateDifficultyIndicator();
        }
        
        // Update clue deck
        if (typeof Components !== 'undefined' && Components.ClueDeck) {
            Components.ClueDeck.renderCards();
        }
        
        // Start game timer and reset guess count display
        if (typeof startGameTimer === 'function') {
            startGameTimer();
        }
        if (typeof updateGuessCount === 'function') {
            updateGuessCount();
        }
        
    } catch (error) {
        console.error('Error starting game:', error);
        if (messageEl) {
            messageEl.innerHTML = 'Error loading puzzle. Please try again.';
            messageEl.style.color = '#e07a5f';
        }
    }
}

/**
 * Handle a player's guess
 * Validates the guess and provides feedback
 */
function handleGuess() {
    if (!gameStarted) return;
    
    const guessInput = document.getElementById("guess-input");
    const messageDisplay = document.getElementById("message");
    
    if (!guessInput || !puzzleData) return;
    
    const guess = guessInput.value.trim().toLowerCase();
    const targetWord = puzzleData.word.toLowerCase();
    
    // Check if guess is empty or single character
    if (!guess) {
        // Shake input and show toast
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 500);
        if (typeof Components !== 'undefined' && Components.Toast) {
            Components.Toast.show("Please type a word.", 'error');
        }
        return;
    }
    
    // Block single character guesses
    if (guess.length === 1) {
        if (messageDisplay) {
            messageDisplay.innerHTML = "Please enter a word (not a single letter).";
            messageDisplay.style.color = "#e07a5f";
        }
        return;
    }
    
    // Validate guess: must start with correct letter
    const firstLetter = puzzleData.word[0].toLowerCase();
    if (guess[0] !== firstLetter) {
        if (messageDisplay) {
            messageDisplay.innerHTML = `Your guess must start with the letter '${firstLetter.toUpperCase()}'!`;
            messageDisplay.style.color = "#e07a5f";
        }
        guessInput.value = ''; // Clear invalid input
        return;
    }
    
    // Validate guess: must be a real English word (if word list loaded)
    if (validWords && validWords.size > 0 && !validWords.has(guess)) {
        if (typeof Components !== 'undefined' && Components.Toast) {
            Components.Toast.show("Not in dictionary.", 'error');
        }
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 500);
        return;
    }
    
    // Check for duplicate guess (using a session-based set)
    if (!window.gameSessionGuesses) {
        window.gameSessionGuesses = new Set();
    }
    
    if (window.gameSessionGuesses.has(guess)) {
        if (messageDisplay) {
            messageDisplay.innerHTML = `You already guessed "${guess}"! Try a different word.`;
            messageDisplay.style.color = "#f4a261"; // Orange color for warning
        }
        return;
    }
    
    // Add guess to set of guessed words
    window.gameSessionGuesses.add(guess);
    
    // Charge for guess (first guess is free, then flat 3 points)
    guessCount++;
    if (typeof updateGuessCount === 'function') {
        updateGuessCount();
    }
    
    // Use new scoring system for guess processing
    let guessResult = null;
    if (gameScoring) {
        guessResult = gameScoring.makeGuess(guess === puzzleData.word.toLowerCase());
        currentScore = gameScoring.getCurrentScore();
    } else {
        // Fallback scoring
        if (guessCount === 1) {
            // First guess is free
        } else {
            currentScore = Math.max(0, currentScore - 3);
        }
    }
    
    if (typeof animateScoreUpdate === 'function' && currentScoreElement) {
        animateScoreUpdate(currentScoreElement, currentScore);
    }
    if (typeof updateScoreBadge === 'function') {
        updateScoreBadge();
    }
    
    if (guessResult) {
        console.log(`Guess ${guessResult.guessNumber}: Bonus=${guessResult.bonus}, Penalty=${guessResult.penalty}, Score=${currentScore}`);
    }
    
    if (guess === targetWord) {
        // Reveal the complete word in the pattern display
        const wordPatternElement = document.getElementById("word-pattern");
        if (wordPatternElement) {
            wordPatternElement.innerHTML = puzzleData.word.toUpperCase().split('').join(' ');
        }
        
        // Get detailed score breakdown for victory display
        let finalScore = currentScore;
        if (gameScoring) {
            const scoreBreakdown = gameScoring.getScoreBreakdown();
            finalScore = scoreBreakdown.finalScore;
            console.log('Score Breakdown:', scoreBreakdown);
        }
        
        if (messageDisplay) {
            messageDisplay.innerHTML = `Congratulations! The word was: ${puzzleData.word}. You scored ${finalScore}/1000 points!`;
            messageDisplay.style.color = "var(--dg-accent)"; // Success color
        }
        
        // Trigger victory celebration
        if (typeof Components !== 'undefined' && Components.Victory) {
            Components.Victory.triggerVictory(finalScore, puzzleData.word);
        }
        
        Statistics.recordGameResult(true, finalScore);
        
        gameStarted = false; // Indicate the game has ended
        
        const guessButton = document.getElementById("guess-button");
        const giveUpButton = document.getElementById("give-up-button");
        
        if (guessButton) {
            guessButton.disabled = true;
            guessButton.textContent = "Guess";
        }
        if (giveUpButton) {
            giveUpButton.disabled = true;
        }
        
        if (typeof stopGameTimer === 'function') {
            stopGameTimer();
        }
        
    } else {
        // Wrong guess - provide feedback
        
        // Calculate similarity for better feedback
        const similarity = calculateSimilarity(guess, targetWord);
        let feedback = "Not quite. Try again!";
        
        // Provide enhanced, specific feedback for all word guesses
        if (similarity > 0.8) {
            feedback = "🎯 Extremely close! You're on the right track!";
        } else if (similarity > 0.6) {
            feedback = "🔥 Very close! You're almost there!";
        } else if (similarity > 0.4 && guessCount > 1) {
            feedback = "🌡️ Getting warmer! Keep trying!";
        } else if (guess.length !== targetWord.length) {
            if (guess.length < targetWord.length) {
                feedback = "📏 Try a longer word";
            } else {
                feedback = "📏 Try a shorter word";
            }
        } else if (!guess.startsWith(puzzleData.word.substring(0, cluesGivenByType.lettersRevealed).toLowerCase())) {
            feedback = `🎯 Your guess should start with "${puzzleData.word.substring(0, cluesGivenByType.lettersRevealed).toUpperCase()}"`;
        } else if (guess.length === targetWord.length && similarity < 0.3) {
            feedback = "🤔 Right length, but very different word. Review the definition and try a different approach!";
        } else {
            const encouragement = guessCount <= 2 ? "You've got this!" : guessCount <= 4 ? "Don't give up!" : "Think about the definition!";
            feedback = `💭 Not quite right. ${encouragement}`;
        }
        
        if (messageDisplay) {
            messageDisplay.innerHTML = feedback;
            messageDisplay.style.color = "#e07a5f"; // Error color
            
            // Animation for feedback message
            messageDisplay.style.transform = "scale(1.1)";
            setTimeout(() => {
                messageDisplay.style.transform = "scale(1)";
            }, 150);
        }
        
        // Update button costs after wrong guess
        if (typeof updateButtonCosts === 'function') {
            updateButtonCosts();
        }
    }

    guessInput.value = ""; // Clear the guess input field
}

/**
 * Fetch puzzle data from JSON file
 * @param {number|null} specificIndex - Optional specific puzzle index
 */
async function fetchPuzzle(specificIndex = null) {
    const response = await fetch("puzzle.json");
    puzzleDataList = await response.json();
    
    if (specificIndex !== null && specificIndex >= 0 && specificIndex < puzzleDataList.length) {
        currentPuzzleIndex = specificIndex;
    } else {
        currentPuzzleIndex = Math.floor(Math.random() * puzzleDataList.length);
    }

    puzzleData = puzzleDataList[currentPuzzleIndex];
}

/**
 * Purchase and reveal a specific clue type
 * @param {string} type - The type of clue to purchase
 * @param {number} cost - The cost of the clue
 */
function purchaseClue(type, cost) {
    // Use new scoring system
    let clueResult = null;
    if (gameScoring) {
        clueResult = gameScoring.purchaseClue(type, puzzleData);
        currentScore = gameScoring.getCurrentScore();
    } else {
        // Fallback scoring
        currentScore = Math.max(0, currentScore - cost);
    }
    
    if (typeof animateScoreUpdate === 'function' && currentScoreElement) {
        animateScoreUpdate(currentScoreElement, currentScore);
    }
    if (typeof updateScoreBadge === 'function') {
        updateScoreBadge();
    }
    
    cluesUsed++; // Increment total clues counter
    
    if (typeof updateProgressBar === 'function') {
        updateProgressBar();
    }
    
    if (clueResult) {
        console.log(`Purchased ${type} clue: Cost=${clueResult.cost}, Remaining entropy=${clueResult.remainingEntropy.toFixed(2)} bits`);
    }
    
    // Get and display the clue
    const clueContent = getClueContent(type);
    if (clueContent && typeof updateClueDisplay === 'function') {
        updateClueDisplay(clueContent, type);
        
        // Update button states
        if (typeof updateButtonCosts === 'function') {
            updateButtonCosts();
        }
    }
    
    // Update clue deck after purchase
    if (typeof Components !== 'undefined' && Components.ClueDeck) {
        Components.ClueDeck.renderCards();
    }
}

/**
 * Get the actual clue content based on type
 * @param {string} type - The type of clue to get content for
 * @returns {string} The clue content string
 */
function getClueContent(type) {
    if (!puzzleData) return '';
    
    let content = '';
    
    switch(type) {
        case 'definition':
            if (cluesGivenByType.definitions < puzzleData.definitions.length) {
                const defIndex = cluesGivenByType.definitions;
                content = `📖 Definition ${defIndex + 1}: ${puzzleData.definitions[defIndex]}`;
                cluesGivenByType.definitions++;
            }
            break;
            
        case 'wordLength':
            if (!cluesGivenByType.wordLength) {
                // Show full word pattern
                cluesGivenByType.wordLength = true;
                if (typeof updateWordPatternDisplay === 'function') {
                    updateWordPatternDisplay();
                }
                content = `📏 The word has ${puzzleData.word.length} letters`;
            }
            break;
            
        case 'example':
            if (cluesGivenByType.examples < puzzleData.examples.length) {
                const exIndex = cluesGivenByType.examples;
                content = `📝 Example: ${puzzleData.examples[exIndex]}`;
                cluesGivenByType.examples++;
            }
            break;
            
        case 'synonym':
            if (!cluesGivenByType.synonyms && puzzleData.synonyms && puzzleData.synonyms.length > 0) {
                content = `💡 Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`;
                cluesGivenByType.synonyms = true;
            }
            break;
            
        case 'antonym':
            if (!cluesGivenByType.antonyms && puzzleData.antonyms && puzzleData.antonyms.length > 0) {
                content = `🔄 Antonyms: ${puzzleData.antonyms.slice(0, 3).join(', ')}`;
                cluesGivenByType.antonyms = true;
            }
            break;
            
        case 'letter':
            if (cluesGivenByType.lettersRevealed < puzzleData.word.length) {
                cluesGivenByType.lettersRevealed++;
                let lettersRevealed = cluesGivenByType.lettersRevealed;
                if (typeof updateWordPatternDisplay === 'function') {
                    updateWordPatternDisplay();
                }
                const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
                content = `🔤 The word starts with: ${revealedPart}`;
            }
            break;
    }
    
    return content;
}

/**
 * Calculate available clues for current word
 * @returns {Object} Object containing counts of available clues by type
 */
function getAvailableClues() {
    if (!puzzleData) return {
        definitions: 0,
        wordLength: 0,
        examples: 0,
        synonyms: 0,
        antonyms: 0,
        letters: 0
    };
    
    const available = {
        definitions: Math.max(0, puzzleData.definitions.length - cluesGivenByType.definitions),
        wordLength: !cluesGivenByType.wordLength ? 1 : 0,
        examples: Math.max(0, puzzleData.examples.length - cluesGivenByType.examples),
        synonyms: (puzzleData.synonyms && puzzleData.synonyms.length > 0 && !cluesGivenByType.synonyms) ? 1 : 0,
        antonyms: (puzzleData.antonyms && puzzleData.antonyms.length > 0 && !cluesGivenByType.antonyms) ? 1 : 0,
        letters: Math.max(0, puzzleData.word.length - cluesGivenByType.lettersRevealed)
    };
    
    return available;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity ratio between 0 and 1
 */
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} The Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

/**
 * Check if player can afford a clue
 * @param {number} cost - The cost of the clue
 * @returns {boolean} Whether the player can afford the clue
 */
function canAffordClue(cost) {
    return currentScore >= cost; // New scoring system allows going to 0
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        startGame,
        handleGuess,
        fetchPuzzle,
        purchaseClue,
        getClueContent,
        getAvailableClues,
        calculateSimilarity,
        levenshteinDistance,
        canAffordClue
    };
} else {
    // Make available globally
    window.GameLogic = {
        startGame,
        handleGuess,
        fetchPuzzle,
        purchaseClue,
        getClueContent,
        getAvailableClues,
        calculateSimilarity,
        levenshteinDistance,
        canAffordClue
    };
}