// Global word list for validation
let validWords = new Set();

// Load word list from cornerstone
async function loadWordList() {
    try {
        const response = await fetch('../cornerstone/words_alpha.txt');
        if (!response.ok) {
            console.error('Failed to load word list, using fallback');
            return;
        }
        const text = await response.text();
        const words = text.trim().split('\n').map(word => word.toLowerCase());
        validWords = new Set(words);
        console.log(`Loaded ${validWords.size} valid words`);
    } catch (error) {
        console.error('Error loading word list:', error);
        // Fallback: accept any word if we can't load the list
        validWords = null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const clueList = document.getElementById("clue-list");
    const guessInput = document.getElementById("guess-input");
    const guessButton = document.getElementById("guess-button");
    const clueButton = document.getElementById("clue-button");
    const giveUpButton = document.getElementById("give-up-button");
    const startGameButton = document.getElementById("start-game-button");
    const inputContainer = document.getElementById("input-container");
		const messageDisplay = document.getElementById("message");
    const myword = document.getElementById("my-word");
    const scoreContainer = document.getElementById("score-container");
    const currentScoreElement = document.getElementById("current-score");
    const wordPatternElement = document.getElementById("word-pattern");
    const statsButton = document.getElementById("stats-button");
    const statsModal = document.getElementById("stats-modal");
    const closeModal = document.querySelector(".close");
    const settingsButton = document.getElementById("settings-button");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsModal = document.querySelector(".close-settings");
    const showWordLengthSetting = document.getElementById("show-word-length");
    const autoClueSetting = document.getElementById("auto-clue");
    const resetStatsButton = document.getElementById("reset-stats");
    const helpButton = document.getElementById("help-button");
    const helpModal = document.getElementById("help-modal");
    const closeHelpModal = document.querySelector(".close-help");
    const progressFill = document.getElementById("progress-fill");
    const clueCounter = document.getElementById("clue-counter");
    
    // Load word list on startup
    loadWordList();
    
    // Standardized to exactly 7 paid clues for all words (2 are given free at start)
    function calculateAvailableClues() {
        if (!puzzleData) return 0;
        return 7; // 7 paid clues + 2 free (first definition + first letter) = 9 total
    }
    
    
    // Update progress bar with dynamic limits
    function updateProgressBar() {
        const availableClues = calculateAvailableClues();
        const progressPercentage = availableClues > 0 ? (cluesUsed / availableClues) * 100 : 0;
        progressFill.style.width = Math.min(progressPercentage, 100) + '%';
        clueCounter.textContent = `${cluesUsed}/${availableClues} clues`;
    }
    
    // Settings object
    let gameSettings = {
        showWordLength: false,
        autoClue: false,
        theme: 'default'
    };
    
    // Load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('dictionaryGameSettings');
        if (savedSettings) {
            gameSettings = JSON.parse(savedSettings);
        }
        applySettings();
    }
    
    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('dictionaryGameSettings', JSON.stringify(gameSettings));
    }
    
    // Apply settings to UI
    function applySettings() {
        showWordLengthSetting.checked = gameSettings.showWordLength;
        autoClueSetting.checked = gameSettings.autoClue;
        
        // Update word pattern display based on settings if game is active
        if (gameStarted && puzzleData) {
            updateWordPatternDisplay();
        }
    }
    
    // Update word pattern display based on current settings
    function updateWordPatternDisplay() {
        if (!puzzleData) return;
        
        if (gameSettings.showWordLength) {
            // Show only revealed letters with consistent spacing: "c o n s t"
            const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
            const revealedWithSpacing = revealedPart.split('').join(' ');
            wordPatternElement.innerHTML = revealedWithSpacing;
        } else {
            // Show full pattern with consistent spacing: "c o n s t _ _ _"
            const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
            const revealedWithSpacing = revealedPart.split('').join(' ');
            const hiddenLetters = '_ '.repeat(puzzleData.word.length - lettersRevealed).trim();
            const pattern = revealedWithSpacing + (hiddenLetters ? ' ' + hiddenLetters : '');
            wordPatternElement.innerHTML = pattern;
        }
        
        // Always show the element (don't hide it completely)
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
    let puzzleData = null;
    let gameStarted = false;
    let cluesGiven = [];
    let currentScore = 100;
    let cluesUsed = 0;
    let gameStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        totalScore: 0,
        bestScore: 0,
        currentStreak: 0,
        bestStreak: 0
    };

    // Initially hide the input container until the game starts
    inputContainer.style.display = "none";

    async function fetchPuzzle() {
        const response = await fetch("puzzle.json");
        puzzleData = await response.json();
        var randomIndex = Math.floor(Math.random() * puzzleData.length);

        puzzleData = puzzleData[randomIndex]; // For this example, we're using the first puzzle
        
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
    }
    
    // If all clues used, disable button
    if (cluesUsed >= availableClues) {
        clueButton.disabled = true;
        clueButton.textContent = "All Clues Used";
    }
    
    // Build a queue of 7 paid clues (2 were given free at start)
    const clueQueue = [];
    
    // Add all available definitions (after the primary one shown at start)
    for (let i = 1; i < puzzleData.definitions.length && i <= 4; i++) {
        clueQueue.push({
            type: 'definition',
            content: `Definition ${i + 1}: ${puzzleData.definitions[i]}`,
            index: i
        });
    }
    
    // If we have fewer than 3 additional definitions, try to fill with synonyms/antonyms
    if (clueQueue.length < 3) {
        if (puzzleData.synonyms && puzzleData.synonyms.length > 0 && !cluesGiven.includes('synonyms')) {
            clueQueue.push({
                type: 'synonyms',
                content: `Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`,
                marker: 'synonyms'
            });
        }
        if (clueQueue.length < 3 && puzzleData.antonyms && puzzleData.antonyms.length > 0 && !cluesGiven.includes('antonyms')) {
            clueQueue.push({
                type: 'antonyms',
                content: `Antonyms: ${puzzleData.antonyms.slice(0, 3).join(', ')}`,
                marker: 'antonyms'
            });
        }
    }
    
    // Add examples (at least 2)
    for (let i = 0; i < Math.min(2, puzzleData.examples.length); i++) {
        clueQueue.push({
            type: 'example',
            content: i === 0 ? `Sample sentence: ${puzzleData.examples[i]}` : `Another example: ${puzzleData.examples[i]}`,
            index: i
        });
    }
    
    // Calculate how many letter reveals we can do
    const maxLetterReveals = Math.min(puzzleData.word.length - 1, 3);
    
    // If word is too short for 3 letter reveals, add extra examples or definitions
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
    
    // Add letter reveals
    for (let i = 0; i < maxLetterReveals; i++) {
        clueQueue.push({
            type: 'letter',
            letterCount: i + 2 // Starting from 2 since first letter is shown
        });
    }
    
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

function startGame() {
    // If a game is already in progress, treat as giving up
    if (gameStarted) {
        recordGameResult(false); // Record as a loss
        updateClueDisplay(`You gave up. The word was: ${puzzleData.word}`);
    }
    
    gameStarted = true;
    guessButton.disabled = false;
    clueButton.disabled = false;
    clueButton.textContent = "Need a Clue?"; // Reset button text
		giveUpButton.disabled = false; 
		
    // Reset scoring
    currentScore = 100;
    cluesUsed = 0;
    currentScoreElement.textContent = currentScore;
    scoreContainer.style.display = "block";
    
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
    
    // Apply settings after game setup
    setTimeout(() => applySettings(), 100);

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
    
    // Check if guess is empty
    if (!guess) {
        messageDisplay.innerHTML = "Please enter a word to guess!";
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
    
    if (guess === targetWord) {
        // Reveal the complete word in the pattern display
        wordPatternElement.innerHTML = puzzleData.word.toUpperCase().split('').join(' ');
        
        // Final score is just current score
        const finalScore = currentScore;
        messageDisplay.innerHTML = `Congratulations! The word was: ${puzzleData.word}. You scored ${finalScore} points!`;
        messageDisplay.style.color = "#81b29a"; // Success color
        recordGameResult(true, finalScore); // Record win with bonus
        gameStarted = false; // Indicate the game has ended
        guessButton.disabled = true; // Disable the Guess button
        clueButton.disabled = true; // Disable the Clue button
        giveUpButton.disabled = true; // Disable the Give Up button
    } else {
        // Wrong guess penalty: 1 point base + number of clues used
        // Examples: 0 clues = 1 pt, 3 clues = 4 pts, 7 clues = 8 pts
        const wrongGuessPenalty = 1 + cluesUsed;
        currentScore = Math.max(0, currentScore - wrongGuessPenalty);
        currentScoreElement.textContent = currentScore;
        
        // If score hits 0 from wrong guesses, game over
        if (currentScore === 0) {
            clueButton.disabled = true;
            clueButton.textContent = "No More Clues (Score: 0)";
            messageDisplay.innerHTML = `Game Over! The word was: ${puzzleData.word}. Your score: 0`;
            messageDisplay.style.color = "#e07a5f";
            recordGameResult(false, 0);
            gameStarted = false;
            guessButton.disabled = true;
            giveUpButton.disabled = true;
            // Reveal the complete word in the pattern display
            wordPatternElement.innerHTML = puzzleData.word.toUpperCase().split('').join(' ');
            return;
        }
        
        // Calculate similarity for better feedback
        const similarity = calculateSimilarity(guess, targetWord);
        let feedback = "Not quite. Try again!";
        
        // Only provide detailed feedback for meaningful guesses (2+ characters)
        if (guess.length >= 2) {
            if (similarity > 0.7) {
                feedback = "Very close! You're almost there!";
            } else if (similarity > 0.5) {
                feedback = "Getting warmer! Keep trying!";
            } else if (guess.length !== targetWord.length) {
                const lengthDiff = targetWord.length - guess.length;
                if (lengthDiff > 0) {
                    feedback = `Try a longer word (need ${lengthDiff} more letters)`;
                } else {
                    feedback = `Try a shorter word (${Math.abs(lengthDiff)} letters too many)`;
                }
            } else if (!guess.startsWith(puzzleData.word.substring(0, lettersRevealed).toLowerCase())) {
                feedback = `Your guess should start with "${puzzleData.word.substring(0, lettersRevealed).toUpperCase()}"`;
            } else if (targetWord.includes(guess.charAt(guess.length - 1))) {
                feedback = "Your last letter appears somewhere in the word!";
            } else {
                feedback = "Keep trying! Check the definition again.";
            }
        } else if (guess.length === 1) {
            // Special handling for single character guesses
            if (targetWord.includes(guess)) {
                feedback = "That letter is in the word!";
            } else {
                feedback = "That letter is not in the word.";
            }
        }
        
        // Add penalty information to feedback
        const penaltyInfo = ` (-${wrongGuessPenalty} points)`;
        messageDisplay.innerHTML = feedback + penaltyInfo;
        messageDisplay.style.color = "#e07a5f"; // Error color

        // Auto-reveal clue if setting is enabled and guess was substantial
        if (gameSettings.autoClue && guess.length >= 2) {
            const newClue = getNextClue();
            if (newClue !== "No more clues available." || !cluesGiven.includes('no-more-clues')) {
                updateClueDisplay(newClue);
                if (newClue === "No more clues available.") {
                    cluesGiven.push('no-more-clues');
                }
            }
        }
    }
    
    // Animation for feedback message
    messageDisplay.style.transform = "scale(1.1)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);

    guessInput.value = ""; // Clear the guess input field
}


guessButton.addEventListener("click", handleGuess);
clueButton.addEventListener("click", () => {
    if (gameStarted) {
        const newClue = getNextClue();
        if (newClue !== "No more clues available." || !cluesGiven.includes('no-more-clues')) {
            updateClueDisplay(newClue);
            if (newClue === "No more clues available.") {
                cluesGiven.push('no-more-clues');
            }
        }
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

// Settings modal event listeners
settingsButton.addEventListener("click", () => {
    settingsModal.style.display = "block";
});

closeSettingsModal.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

// Settings change listeners
showWordLengthSetting.addEventListener("change", (e) => {
    gameSettings.showWordLength = e.target.checked;
    saveSettings();
    applySettings();
});

autoClueSetting.addEventListener("change", (e) => {
    gameSettings.autoClue = e.target.checked;
    saveSettings();
    applySettings();
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
    if (event.target === settingsModal) {
        settingsModal.style.display = "none";
    }
});

// Load settings and stats on page load
loadSettings();
loadStats();
updateStatsDisplay();

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
    if (event.target === settingsModal) {
        settingsModal.style.display = "none";
    }
});

// Load settings and stats on page load
loadSettings();
loadStats();
updateStatsDisplay();
});


function addClueWithAnimation(clue) {
    const clueItem = document.createElement("li");
    clueItem.textContent = clue;
    clueItem.style.opacity = "0";
    clueList.appendChild(clueItem);
    setTimeout(() => {
        clueItem.style.opacity = "1";
    }, 100);
}

function displayMessageWithAnimation(message, isSuccess) {
    messageDisplay.style.color = isSuccess ? "#81b29a" : "#e07a5f";
    messageDisplay.textContent = message;
    messageDisplay.style.transform = "scale(1.05)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);
}
