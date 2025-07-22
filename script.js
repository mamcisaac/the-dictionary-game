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
    
    // Calculate total available clues for current word with reasonable caps
    function calculateAvailableClues() {
        if (!puzzleData) return 0;
        
        let totalClues = 0;
        
        // Cap definitions at 4 to avoid excessive primary clues
        totalClues += puzzleData.definitions ? Math.min(puzzleData.definitions.length, 4) : 0;
        
        // Cap examples at 3 to prevent bloat
        totalClues += puzzleData.examples ? Math.min(puzzleData.examples.length, 3) : 0;
        
        // Synonyms as one clue (if any exist)
        totalClues += puzzleData.synonyms && puzzleData.synonyms.length > 0 ? 1 : 0;
        
        // Antonyms as one clue (if any exist)  
        totalClues += puzzleData.antonyms && puzzleData.antonyms.length > 0 ? 1 : 0;
        
        // Letter reveals capped at 4 additional letters (max 5 total including first)
        const maxLetterReveals = Math.min(puzzleData.word ? puzzleData.word.length - 1 : 0, 4);
        totalClues += maxLetterReveals;
        
        // Cap total clues at 15 to maintain challenge
        return Math.min(totalClues, 15);
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
    
    // Adaptive scoring based on available clues
    const availableClues = calculateAvailableClues();
    
    // Calculate adaptive penalty: fewer available clues = lower penalties
    // Base penalty scales from 15 (many clues) down to 5 (few clues)
    const adjustedPenalty = Math.max(5, Math.min(15, Math.round(100 / availableClues)));
    
    currentScore = Math.max(0, currentScore - adjustedPenalty);
    currentScoreElement.textContent = currentScore;
    updateProgressBar();
    
    // If score hits 0, disable clue button to prevent further clue requests
    if (currentScore === 0) {
        clueButton.disabled = true;
        clueButton.textContent = "No More Clues (Score: 0)";
    }
    
    // If all clues used, disable button
    if (cluesUsed >= availableClues) {
        clueButton.disabled = true;
        clueButton.textContent = "All Clues Used";
    }
    
    if (currentClueIndex >= Math.min(puzzleData.definitions.length, 4) || currentClueIndex > 2) {
        // Give up to 3 example sentences
        if (cluesGiven.includes('example') === false && puzzleData.examples.length > 0) {
            cluesGiven.push('example');
            return `Sample sentence: ${puzzleData.examples[0]}`;
        } else if (cluesGiven.includes('example') && puzzleData.examples.length > 1 && !cluesGiven.includes('example2')) {
            cluesGiven.push('example2');
            return `Another sample sentence: ${puzzleData.examples[1]}`;
        } else if (cluesGiven.includes('example2') && puzzleData.examples.length > 2 && !cluesGiven.includes('example3')) {
            cluesGiven.push('example3');
            return `Third example: ${puzzleData.examples[2]}`;
        // Give synonyms if not already given and available, limited to 4
        } else if (cluesGiven.includes('synonyms') === false && puzzleData.synonyms.length > 0) {
            const synonyms = puzzleData.synonyms.slice(0, 4).join(', ');
            cluesGiven.push('synonyms');
            return `Synonyms: ${synonyms}`;
        // Give antonyms if not already given and available, limited to 3
        } else if (cluesGiven.includes('antonyms') === false && puzzleData.antonyms.length > 0) {
            const antonyms = puzzleData.antonyms.slice(0, 3).join(', ');
            cluesGiven.push('antonyms');
            return `Antonyms: ${antonyms}`;
        // Reveal letters if other clues have been exhausted (max 4 additional letters)
        } else if (lettersRevealed < puzzleData.word.length - 1 && lettersRevealed < 5) {
            lettersRevealed++;
            cluesGiven.push(`letters${lettersRevealed}`); // Ensure unique entry for each state of letters revealed
            
            // Update word pattern display with new revealed letters
            updateWordPatternDisplay();
            
            const revealedPart = puzzleData.word.substring(0, lettersRevealed);
            return `The word starts with: ${revealedPart}`;
        }
    } else {
        // Provide a secondary definition if the index is valid
        return `Secondary Definition: ${puzzleData.definitions[currentClueIndex++]}`;
    }
    return "No more clues available.";
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
        // Adaptive score penalty for wrong guesses (less than clue penalty)
        if (guess.length >= 2) { // Only penalize substantial guesses
            const availableClues = calculateAvailableClues();
            
            // Adaptive wrong guess penalty: fewer clues = smaller penalties
            // Base penalty scales from 5 (many clues) down to 2 (few clues)
            const adjustedPenalty = Math.max(2, Math.min(5, Math.round(30 / availableClues)));
            
            currentScore = Math.max(0, currentScore - adjustedPenalty);
            currentScoreElement.textContent = currentScore;
            
            // If score hits 0 from wrong guesses, disable clue button
            if (currentScore === 0) {
                clueButton.disabled = true;
                clueButton.textContent = "No More Clues (Score: 0)";
            }
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
        
        messageDisplay.innerHTML = feedback;
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
