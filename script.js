// Global word list for validation
let validWords = new Set();


// Global puzzle data
let puzzleData = null;
let puzzleDataList = [];

// Global clue tracking for the menu system
let cluesGivenByType = {
    definitions: 1,      // Start at 1 (primary shown free)
    wordLength: false,   // Has word length been revealed?
    examples: 0,         // Number of examples shown
    synonyms: false,     // Have synonyms been shown?
    antonyms: false,     // Have antonyms been shown?
    lettersRevealed: 1   // Start at 1 (first letter shown)
};

// Global DOM element references for functions used outside DOMContentLoaded
let clueList, messageDisplay, clueMenu, clueOptions, currentScoreElement, progressFill, clueCounter;

// Global game statistics
let gameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    bestScore: 0,
    currentStreak: 0,
    bestStreak: 0
};

// Global game state variables
let currentScore = 100;
let cluesUsed = 0;

// Load word dictionary from Cornerstone (JSON is faster than text parsing)
async function loadWordList() {
    try {
        const response = await fetch('../Cornerstone/words_dictionary.json');
        if (!response.ok) {
            console.warn('Word dictionary not found in Cornerstone, word validation disabled');
            validWords = null;
            return;
        }
        const wordsDict = await response.json();
        validWords = new Set(Object.keys(wordsDict).map(word => word.toLowerCase()));
        console.log(`Loaded ${validWords.size} valid words from Cornerstone dictionary`);
    } catch (error) {
        console.warn('Error loading word dictionary from Cornerstone:', error);
        // Fallback: accept any word if we can't load the list
        validWords = null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    clueList = document.getElementById("clue-list");
    const guessInput = document.getElementById("guess-input");
    const guessButton = document.getElementById("guess-button");
    const clueButton = document.getElementById("clue-button");
    const giveUpButton = document.getElementById("give-up-button");
    const startGameButton = document.getElementById("start-game-button");
    const inputContainer = document.getElementById("input-container");
		messageDisplay = document.getElementById("message");
    const myword = document.getElementById("my-word");
    const scoreContainer = document.getElementById("score-container");
    currentScoreElement = document.getElementById("current-score");
    const wordPatternElement = document.getElementById("word-pattern");
    const statsButton = document.getElementById("stats-button");
    const statsModal = document.getElementById("stats-modal");
    const closeModal = document.querySelector(".close");
    const resetStatsButton = document.getElementById("reset-stats");
    const helpButton = document.getElementById("help-button");
    const helpModal = document.getElementById("help-modal");
    const closeHelpModal = document.querySelector(".close-help");
    progressFill = document.getElementById("progress-fill");
    clueCounter = document.getElementById("clue-counter");
    const guessCostPreview = document.getElementById("guess-cost-preview");
    
    // Load word list on startup
    loadWordList();
    
    // Track number of guesses made
    let guessCount = 0;
    
    // Track guessed words to prevent duplicates
    let guessedWords = new Set();
    
    // Function to update clue display
    function updateClueDisplay(newClue) {
        const clueItem = document.createElement("li");
        clueItem.textContent = newClue;
        clueItem.style.opacity = "0";
        clueItem.style.transition = "opacity 0.5s ease-in-out";
        clueList.appendChild(clueItem);
        
        // Animation to fade in the clue
        setTimeout(() => {
            clueItem.style.opacity = "1";
        }, 100);
    }
    
    
    // Update button text and cost previews with current costs
    function updateButtonCosts() {
        if (!gameStarted || !puzzleData) {
            guessCostPreview.style.display = "none";
            return;
        }
        
        // Update clue button text based on availability
        if (!clueButton.disabled) {
            const available = getAvailableClues();
            const hasAnyClues = Object.values(available).some(count => count > 0);
            if (hasAnyClues && currentScore > 2) {
                clueButton.textContent = "Get a Clue";
            } else {
                clueButton.disabled = true;
                clueButton.textContent = "No More Clues";
            }
        }
        
        // Update guess button cost (first guess free, then flat 3 points)
        if (!guessButton.disabled) {
            guessButton.textContent = "Guess";
            if (guessCount === 0) {
                guessCostPreview.textContent = "🆓 First guess free!";
                guessCostPreview.className = "cost-preview free";
            } else {
                guessCostPreview.textContent = "💰 -3 points";
                guessCostPreview.className = "cost-preview";
            }
            guessCostPreview.style.display = "block";
        } else {
            guessCostPreview.style.display = "none";
        }
    }
    
    // Standardized to exactly 7 paid clues for all words (2 are given free at start)
    
    
    // Update progress bar with dynamic limits
    
    // Update word pattern display based on current clues
    function updateWordPatternDisplay() {
        if (!puzzleData) return;
        
        // Always show revealed letters
        const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
        const revealedWithSpacing = revealedPart.split('').join(' ');
        
        // Show full pattern if word length has been revealed
        if (cluesGivenByType.wordLength) {
            const hiddenLetters = '_ '.repeat(puzzleData.word.length - lettersRevealed).trim();
            const pattern = revealedWithSpacing + (hiddenLetters ? ' ' + hiddenLetters : '');
            wordPatternElement.innerHTML = pattern;
        } else {
            // Show only revealed letters
            wordPatternElement.innerHTML = revealedWithSpacing;
        }
        
        // Always show the element
        wordPatternElement.style.display = 'block';
    }
    
    // Load stats from localStorage
    function loadStats() {
        const savedStats = localStorage.getItem('dictionaryGameStats');
        if (savedStats) {
            gameStats = JSON.parse(savedStats);
        }
    }
    
    // Save stats to localStorage
    function saveStats() {
        localStorage.setItem('dictionaryGameStats', JSON.stringify(gameStats));
    }
    
    // Update stats display
    function updateStatsDisplay() {
        document.getElementById('games-played').textContent = gameStats.gamesPlayed;
        document.getElementById('games-won').textContent = gameStats.gamesWon;
        const winRate = gameStats.gamesPlayed > 0 ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) : 0;
        document.getElementById('win-rate').textContent = winRate + '%';
        const avgScore = gameStats.gamesWon > 0 ? Math.round(gameStats.totalScore / gameStats.gamesWon) : 0;
        document.getElementById('avg-score').textContent = avgScore;
        document.getElementById('best-score').textContent = gameStats.bestScore;
        document.getElementById('current-streak').textContent = gameStats.currentStreak;
        document.getElementById('best-streak').textContent = gameStats.bestStreak;
    }
    
    // Record game result
    function recordGameResult(won, score = 0) {
        gameStats.gamesPlayed++;
        if (won) {
            gameStats.gamesWon++;
            gameStats.totalScore += score;
            gameStats.currentStreak++;
            if (gameStats.currentStreak > gameStats.bestStreak) {
                gameStats.bestStreak = gameStats.currentStreak;
            }
            if (score > gameStats.bestScore) {
                gameStats.bestScore = score;
            }
        } else {
            gameStats.currentStreak = 0;
        }
        saveStats();
        updateStatsDisplay();
    }
    

    // Event listener for pressing 'Enter' in the guess input
    guessInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && gameStarted) {
            event.preventDefault(); // Avoid form submission or other default actions
            handleGuess();
        }
    });

		let lettersRevealed = 1; 
    let currentClueIndex = 0;
    let gameStarted = false;
    let cluesGiven = [];

    // Initially hide the input container until the game starts
    inputContainer.style.display = "none";

    // Store the full puzzle list for Phase 1 features
    let currentPuzzleIndex = -1;

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

function getNextClue() {
    cluesUsed++;
    
    // Fixed scoring: 7 paid clues, each costs 5 points
    const availableClues = calculateAvailableClues();
    const adjustedPenalty = 5; // 5 points per clue
    
    // Prevent score from going below 1 from clues alone (preserve ability to guess)
    currentScore = Math.max(1, currentScore - adjustedPenalty);
    currentScoreElement.textContent = currentScore;
    updateProgressBar();
    
    // If score hits 1, disable clue button but keep guess option
    if (currentScore === 1) {
        clueButton.disabled = true;
        clueButton.textContent = "No More Clues (Min Score)";
    } else {
        // Update button costs if not disabled
        updateButtonCosts();
    }
    
    // If all clues used, disable button
    if (cluesUsed >= availableClues) {
        clueButton.disabled = true;
        clueButton.textContent = "All Clues Used";
    }
    
    // Update button costs after using a clue
    updateButtonCosts();
    
    // Build a queue of 7 paid clues (2 were given free at start)
    const clueQueue = [];
    
    // Intelligent clue distribution based on word content
    const wordLength = puzzleData.word.length;
    
    // Add available definitions (up to 2 additional ones)
    const maxDefinitions = Math.min(puzzleData.definitions.length - 1, 2);
    
    // Add all available definitions (after the primary one shown at start)
    for (let i = 1; i <= maxDefinitions && i < puzzleData.definitions.length; i++) {
        clueQueue.push({
            type: 'definition',
            content: `Definition ${i + 1}: ${puzzleData.definitions[i]}`,
            index: i,
            priority: 8
        });
    }
    
    // Add synonyms/antonyms strategically - earlier for easier words, later for harder words
    if (puzzleData.synonyms && puzzleData.synonyms.length > 0 && !cluesGiven.includes('synonyms')) {
        clueQueue.push({
            type: 'synonyms',
            content: `💡 Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`,
            marker: 'synonyms',
            priority: 6
        });
    }
    if (puzzleData.antonyms && puzzleData.antonyms.length > 0 && !cluesGiven.includes('antonyms')) {
        clueQueue.push({
            type: 'antonyms',
            content: `🔄 Antonyms: ${puzzleData.antonyms.slice(0, 3).join(', ')}`,
            marker: 'antonyms',
            priority: 5
        });
    }
    
    // Add examples
    const numExamples = Math.min(2, puzzleData.examples.length);
    for (let i = 0; i < numExamples; i++) {
        clueQueue.push({
            type: 'example',
            content: i === 0 ? `📝 Sample sentence: ${puzzleData.examples[i]}` : `📝 Example ${i + 1}: ${puzzleData.examples[i]}`,
            index: i,
            priority: 7 // Medium priority
        });
    }
    
    // Calculate how many letter reveals we can do (max 40% of word length)
    const maxLetterReveals = Math.min(puzzleData.word.length - 1, Math.floor(puzzleData.word.length * 0.4));
    
    // If we have fewer letter reveals available, add extra content to fill clue slots
    const targetLetterReveals = Math.min(3, maxLetterReveals); // Still aim for up to 3 if possible
    if (maxLetterReveals < 3) {
        const extraCluesNeeded = 3 - maxLetterReveals;
        
        // Try to add extra examples first
        for (let i = 2; i < puzzleData.examples.length && clueQueue.length < 7 - maxLetterReveals; i++) {
            clueQueue.push({
                type: 'example',
                content: `Example ${i + 1}: ${puzzleData.examples[i]}`,
                index: i
            });
        }
        
        // If still need more, add any remaining definitions
        for (let i = 4; i < puzzleData.definitions.length && clueQueue.length < 7 - maxLetterReveals; i++) {
            clueQueue.push({
                type: 'definition',
                content: `Additional definition: ${puzzleData.definitions[i]}`,
                index: i
            });
        }
        
        // Last resort: add synonyms/antonyms if not already added
        if (clueQueue.length < 7 - maxLetterReveals && puzzleData.synonyms && puzzleData.synonyms.length > 0 && !clueQueue.some(c => c.type === 'synonyms')) {
            clueQueue.push({
                type: 'synonyms',
                content: `Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`,
                marker: 'synonyms'
            });
        }
    }
    
    // Add letter reveals with strategic priority - later for easy words, earlier for hard words
    for (let i = 0; i < maxLetterReveals; i++) {
        clueQueue.push({
            type: 'letter',
            letterCount: i + 2, // Starting from 2 since first letter is shown
            priority: 4
        });
    }
    
    // Sort clue queue by priority (highest first) for optimal clue ordering
    clueQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Ensure we have exactly 7 paid clues
    while (clueQueue.length < 7) {
        // Fill remaining slots with any available content
        if (currentClueIndex < puzzleData.definitions.length) {
            clueQueue.push({
                type: 'definition',
                content: `Extra definition: ${puzzleData.definitions[currentClueIndex]}`,
                index: currentClueIndex
            });
            currentClueIndex++;
        } else {
            clueQueue.push({
                type: 'none',
                content: 'No additional clue available for this word.'
            });
        }
    }
    
    // Get the current clue from our queue
    const currentClue = clueQueue[cluesUsed - 1];
    
    if (currentClue.type === 'letter') {
        lettersRevealed = currentClue.letterCount;
        cluesGiven.push(`letters${lettersRevealed}`);
        updateWordPatternDisplay();
        const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
        return `The word starts with: ${revealedPart}`;
    } else {
        if (currentClue.marker) {
            cluesGiven.push(currentClue.marker);
        }
        if (currentClue.type === 'definition' && currentClue.index !== undefined) {
            currentClueIndex = Math.max(currentClueIndex, currentClue.index + 1);
        }
        return currentClue.content;
    }
}


function startGame() {
    // If a game is already in progress, treat as giving up
    if (gameStarted) {
        recordGameResult(false); // Record as a loss
        updateClueDisplay(`You gave up. The word was: ${puzzleData.word}`);
    }
    
    gameStarted = true;
    guessButton.disabled = false;
    clueButton.disabled = false;
    clueButton.textContent = "Get a Clue"; // Reset button text
		giveUpButton.disabled = false; 
		
    // Reset scoring
    currentScore = 100;
    cluesUsed = 0;
    guessCount = 0; // Reset guess counter
    guessedWords.clear(); // Reset guessed words
    currentScoreElement.textContent = currentScore;
    scoreContainer.style.display = "block";
    
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
    clueList.innerHTML = ''; // Clear the list for a new game
    document.getElementById("message").innerHTML = ''; // Clear any previous messages
    guessInput.value = ''; // Clear guess input
    inputContainer.style.display = "block"; // Show the input container
    myword.style.display = "block"; // Show the input container
    fetchPuzzle().then(() => {
        // Display the primary definition
        // Assuming puzzleData is already fetched and contains the word and primary definition
    const definition = puzzleData.definitions[0]; // Get the primary definition of the word
    
    // Display the formatted message in the primary-definition element
    document.getElementById("primary-definition").innerHTML = `${definition}`;
        
        
        // Initialize word pattern display
        updateWordPatternDisplay();

    // Reset game state variables
    currentClueIndex = 1; // Start from the second definition for the next clue
    lettersRevealed = 1;
    cluesGiven = []; // Reset clues given
    
    // Update progress bar after puzzle is loaded
    updateProgressBar();
    
    // Initialize button costs
    updateButtonCosts();

    });
}
    
			
// Function to calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// Calculate Levenshtein distance between two strings
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

function handleGuess() {
    if (!gameStarted) return;
    const guess = guessInput.value.trim().toLowerCase();
    const targetWord = puzzleData.word.toLowerCase();
    
    // Check if guess is empty or single character
    if (!guess) {
        messageDisplay.innerHTML = "Please enter a word to guess!";
        messageDisplay.style.color = "#e07a5f";
        return;
    }
    
    // Block single character guesses
    if (guess.length === 1) {
        messageDisplay.innerHTML = "Please enter a word (not a single letter).";
        messageDisplay.style.color = "#e07a5f";
        return;
    }
    
    // Validate guess: must start with correct letter
    const firstLetter = puzzleData.word[0].toLowerCase();
    if (guess[0] !== firstLetter) {
        messageDisplay.innerHTML = `Your guess must start with the letter '${firstLetter.toUpperCase()}'!`;
        messageDisplay.style.color = "#e07a5f";
        guessInput.value = ''; // Clear invalid input
        return;
    }
    
    // Validate guess: must be a real English word (if word list loaded)
    if (validWords && validWords.size > 0 && !validWords.has(guess)) {
        messageDisplay.innerHTML = `"${guess}" is not a valid English word. Try again!`;
        messageDisplay.style.color = "#e07a5f";
        return;
    }
    
    // Check for duplicate guess
    if (guessedWords.has(guess)) {
        messageDisplay.innerHTML = `You already guessed "${guess}"! Try a different word.`;
        messageDisplay.style.color = "#f4a261"; // Orange color for warning
        return;
    }
    
    // Add guess to set of guessed words
    guessedWords.add(guess);
    
    // Charge for guess (first guess is free, then flat 3 points)
    guessCount++;
    if (guessCount > 1) {
        const guessCost = 3; // Flat penalty for balanced gameplay
        currentScore = Math.max(0, currentScore - guessCost);
        currentScoreElement.textContent = currentScore;
        
        // If score hits 0 from guess cost, game over
        if (currentScore === 0) {
            clueButton.disabled = true;
            clueButton.textContent = "No More Clues (Score: 0)";
            messageDisplay.innerHTML = `Game Over! The word was: ${puzzleData.word}. Your score: 0`;
            messageDisplay.style.color = "#e07a5f";
            recordGameResult(false, 0);
            gameStarted = false;
            guessButton.disabled = true;
            guessButton.textContent = "Guess";
            giveUpButton.disabled = true;
            wordPatternElement.innerHTML = puzzleData.word.toUpperCase().split('').join(' ');
            return;
        }
    }
    
    if (guess === targetWord) {
        // Reveal the complete word in the pattern display
        wordPatternElement.innerHTML = puzzleData.word.toUpperCase().split('').join(' ');
        
        messageDisplay.innerHTML = `Congratulations! The word was: ${puzzleData.word}. You scored ${currentScore} points!`;
        messageDisplay.style.color = "#81b29a"; // Success color
        recordGameResult(true, currentScore); // Record win
        gameStarted = false; // Indicate the game has ended
        guessButton.disabled = true; // Disable the Guess button
        guessButton.textContent = "Guess"; // Reset button text
        clueButton.disabled = true; // Disable the Clue button
        clueButton.textContent = "Need a Clue?"; // Reset button text
        giveUpButton.disabled = true; // Disable the Give Up button
    } else {
        // Wrong guess - no additional penalty since guess already cost points
        
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
                feedback = `📏 Try a longer word`;
            } else {
                feedback = `📏 Try a shorter word`;
            }
        } else if (!guess.startsWith(puzzleData.word.substring(0, lettersRevealed).toLowerCase())) {
            feedback = `🎯 Your guess should start with "${puzzleData.word.substring(0, lettersRevealed).toUpperCase()}"`;
        } else if (guess.length === targetWord.length && similarity < 0.3) {
            feedback = "🤔 Right length, but very different word. Review the definition and try a different approach!";
        } else {
            const encouragement = guessCount <= 2 ? "You've got this!" : guessCount <= 4 ? "Don't give up!" : "Think about the definition!";
            feedback = `💭 Not quite right. ${encouragement}`;
        }
        
        // Don't show penalty in feedback - it's shown in buttons
        messageDisplay.innerHTML = feedback;
        messageDisplay.style.color = "#e07a5f"; // Error color
        
        // Update button costs after wrong guess
        updateButtonCosts();

    }
    
    // Animation for feedback message
    messageDisplay.style.transform = "scale(1.1)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);

    guessInput.value = ""; // Clear the guess input field
}

guessButton.addEventListener("click", handleGuess);
// Get clue menu element references
clueMenu = document.getElementById("clue-menu");
clueOptions = document.getElementById("clue-options");

// Show clue menu when clicking the clue button
clueButton.addEventListener("click", () => {
    if (gameStarted) {
        showClueMenu();
    }
});

// Close clue menu when clicking outside
document.addEventListener("click", (event) => {
    if (!clueButton.contains(event.target) && !clueMenu.contains(event.target)) {
        clueMenu.style.display = "none";
    }
});

giveUpButton.addEventListener("click", () => {
    if (gameStarted) {
        updateClueDisplay(`The word was: ${puzzleData.word}`);
        recordGameResult(false); // Record loss
        guessButton.disabled = true; // Optionally disable the Guess button
        clueButton.disabled = true; // Optionally disable the Clue button
        giveUpButton.disabled = true; 
      	gameStarted = false; // Indicate the game has ended

    }
});

startGameButton.addEventListener("click", startGame);

// Stats modal event listeners
statsButton.addEventListener("click", () => {
    updateStatsDisplay();
    statsModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
    statsModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === statsModal) {
        statsModal.style.display = "none";
    }
});


resetStatsButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
        gameStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        saveStats();
        updateStatsDisplay();
    }
});

// Help modal event listeners
helpButton.addEventListener("click", () => {
    helpModal.style.display = "block";
});

closeHelpModal.addEventListener("click", () => {
    helpModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === helpModal) {
        helpModal.style.display = "none";
    }
});

// Load stats on page load
loadStats();
updateStatsDisplay();


});

// Global function for calculating available clues
function calculateAvailableClues() {
    if (!puzzleData) return 0;
    return 7; // 7 paid clues + 2 free (first definition + first letter) = 9 total
}

// Global function for updating progress bar
function updateProgressBar() {
    const availableClues = calculateAvailableClues();
    const progressPercentage = availableClues > 0 ? (cluesUsed / availableClues) * 100 : 0;
    progressFill.style.width = Math.min(progressPercentage, 100) + '%';
    clueCounter.textContent = `${cluesUsed}/${availableClues} clues`;
}

// ========================
// PHASE 1 INITIALIZATION
// ========================


function addClueWithAnimation(clue) {
    const clueItem = document.createElement("li");
    clueItem.textContent = clue;
    clueItem.style.opacity = "0";
    clueList.appendChild(clueItem);
    setTimeout(() => {
        clueItem.style.opacity = "1";
    }, 100);
}

// ========================
// NEW CLUE MENU SYSTEM
// ========================

// Calculate available clues for current word
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

// Check if player can afford a clue
function canAffordClue(cost) {
    return currentScore > cost; // Must have more than cost to maintain min score of 1
}

// Show the clue menu with available options
function showClueMenu() {
    const available = getAvailableClues();
    clueOptions.innerHTML = ''; // Clear previous options
    
    // Define clue types with costs and icons
    const clueTypes = [
        { type: 'definition', name: 'Another Definition', cost: 2, icon: '📖', count: available.definitions },
        { type: 'wordLength', name: 'Word Length', cost: 3, icon: '📏', count: available.wordLength },
        { type: 'example', name: 'Sample Sentence', cost: 4, icon: '📝', count: available.examples },
        { type: 'synonyms', name: 'Synonyms', cost: 5, icon: '💡', count: available.synonyms },
        { type: 'antonyms', name: 'Antonyms', cost: 5, icon: '🔄', count: available.antonyms },
        { type: 'letter', name: 'Reveal Letter', cost: 7, icon: '🔤', count: available.letters }
    ];
    
    // Create menu options
    clueTypes.forEach(clueType => {
        if (clueType.count > 0) { // Only show if available
            const option = document.createElement('div');
            option.className = 'clue-option';
            
            const affordable = canAffordClue(clueType.cost);
            if (!affordable) {
                option.classList.add('disabled');
            }
            
            option.innerHTML = `
                <span class="clue-icon">${clueType.icon}</span>
                <span class="clue-name">${clueType.name}</span>
                <span class="clue-info">
                    <span class="clue-cost">${clueType.cost} pts</span>
                    <span class="clue-remaining">${clueType.count} left</span>
                </span>
            `;
            
            if (affordable) {
                option.addEventListener('click', () => purchaseClue(clueType.type, clueType.cost));
            }
            
            clueOptions.appendChild(option);
        }
    });
    
    // Show message if no clues available
    if (clueOptions.children.length === 0) {
        clueOptions.innerHTML = '<div class="no-clues">No more clues available!</div>';
    }
    
    // Show the menu
    clueMenu.style.display = 'block';
}

// Purchase and reveal a specific clue type
function purchaseClue(type, cost) {
    // Deduct points
    currentScore = Math.max(1, currentScore - cost);
    currentScoreElement.textContent = currentScore;
    cluesUsed++; // Increment total clues counter
    updateProgressBar();
    
    // Get and display the clue
    const clueContent = getClueContent(type);
    if (clueContent) {
        updateClueDisplay(clueContent);
        
        // Update button states
        updateButtonCosts();
        
        // Check if score is too low for more clues
        if (currentScore <= 2) { // Can't afford cheapest clue
            clueButton.disabled = true;
            clueButton.textContent = "No More Clues";
        }
    }
    
    // Hide the menu
    clueMenu.style.display = 'none';
}

// Get the actual clue content based on type
function getClueContent(type) {
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
                updateWordPatternDisplay();
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
            
        case 'synonyms':
            if (!cluesGivenByType.synonyms && puzzleData.synonyms && puzzleData.synonyms.length > 0) {
                content = `💡 Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`;
                cluesGivenByType.synonyms = true;
            }
            break;
            
        case 'antonyms':
            if (!cluesGivenByType.antonyms && puzzleData.antonyms && puzzleData.antonyms.length > 0) {
                content = `🔄 Antonyms: ${puzzleData.antonyms.slice(0, 3).join(', ')}`;
                cluesGivenByType.antonyms = true;
            }
            break;
            
        case 'letter':
            if (cluesGivenByType.lettersRevealed < puzzleData.word.length) {
                cluesGivenByType.lettersRevealed++;
                lettersRevealed = cluesGivenByType.lettersRevealed;
                updateWordPatternDisplay();
                const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
                content = `🔤 The word starts with: ${revealedPart}`;
            }
            break;
    }
    
    return content;
}

function displayMessageWithAnimation(message, isSuccess) {
    messageDisplay.style.color = isSuccess ? "#81b29a" : "#e07a5f";
    messageDisplay.textContent = message;
    messageDisplay.style.transform = "scale(1.05)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);
}

// ========================
// PHASE 1 FEATURES
// ========================

// Generate deterministic word for date
function getDailyWord(dateString) {
    // Use date as seed for consistent word selection
    const seed = dateString.split('-').join('');
    const hash = seed.split('').reduce((a, b) => (a * 31 + b.charCodeAt(0)) % 1000, 0);
    // Make sure puzzleDataList is loaded
    if (!puzzleDataList || puzzleDataList.length === 0) {
        console.error("Puzzle data not loaded yet!");
        return 0; // Fallback to first puzzle
    }
    return hash % puzzleDataList.length;
}

// ========================
// GAME INTEGRATION FUNCTIONS
// ========================

function startGameWithSpecificWord(wordIndex) {
    currentPuzzleIndex = wordIndex;
    puzzleData = puzzleDataList[wordIndex];
    
    // Reset game state
    cluesGiven = [];
    currentScore = 100;
    cluesUsed = 0;
    guessCount = 0;
    guessedWords.clear(); // Reset guessed words
    gameStarted = true;
    // Game start time tracking removed
    
    // Update display
    updateScore();
    updateProgressBar();
    updateButtonCosts();
    
    // Show initial clues
    myword.style.display = "block";
    wordPatternElement.textContent = puzzleData.word[0].toUpperCase() + " _ ".repeat(puzzleData.word.length - 1);
    document.getElementById("primary-definition").textContent = puzzleData.definitions[0];
    
    // Update UI state
    startGameButton.textContent = "New Game";
    inputContainer.style.display = "block";
    scoreContainer.style.display = "block";
    guessInput.focus();
    
    // Clear previous messages
    messageDisplay.textContent = "";
    clueList.innerHTML = "";
    
    console.log(`Started game with word: ${puzzleData.word}`);
}

console.log("Game loaded successfully");
