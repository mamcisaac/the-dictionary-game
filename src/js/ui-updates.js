/**
 * UI Updates Module
 * Handles all UI updates for The Dictionary Game
 * Extracted from script.js for modular architecture
 * 
 * Dependencies: 
 * - DOMUtils for element access
 * - Components for UI component interactions
 * - GameState for accessing game variables
 * - Game variables (gameStarted, puzzleData, currentScore, etc.)
 */

/**
 * Update clue display using ClueStripe component
 * @param {string} newClue - The clue text to display
 * @param {string} clueType - Optional clue type for categorization
 */
function updateClueDisplay(newClue, clueType = null) {
    const clueList = DOMUtils.get('clueList');
    if (!clueList) return;
    
    // Parse clue to get icon and content
    const iconMap = {
        '📖': 'definition',
        '📏': 'wordLength',
        '📝': 'example',
        '💡': 'synonym',
        '🔄': 'antonym',
        '🔤': 'letter'
    };
    
    let icon = '💡';
    let detectedType = clueType;
    
    for (const [emoji, type] of Object.entries(iconMap)) {
        if (newClue.includes(emoji)) {
            icon = emoji;
            if (!detectedType) detectedType = type;
            break;
        }
    }
    
    // Remove icon from content
    const content = newClue.replace(/^[📖📏📝💡🔄🔤]\s*/, '');
    
    const clueStripe = Components.ClueStripe.create(icon, content, 'hint-taken', null, detectedType);
    clueList.appendChild(clueStripe);
}

/**
 * Update button costs and availability
 * Shows current costs for clues and guess button
 */
function updateButtonCosts() {
    const guessButton = DOMUtils.get('guessButton');
    const guessCostPreview = DOMUtils.get('#guess-cost-preview');
    
    if (!gameStarted || !puzzleData) {
        if (guessCostPreview) {
            guessCostPreview.style.display = "none";
        }
        return;
    }
    
    // Update clue deck to reflect available clues
    if (Components && Components.ClueDeck) {
        Components.ClueDeck.renderCards();
    }
    
    // Update guess button cost (first guess free, then flat 3 points)
    if (guessButton && !guessButton.disabled && guessCostPreview) {
        guessButton.textContent = "Guess";
        const costValueElement = guessCostPreview.querySelector('.cost-preview-value');
        if (costValueElement) {
            if (guessCount === 0) {
                costValueElement.textContent = "🆓 First guess free!";
                guessCostPreview.className = "cost-preview-sidebar free";
            } else {
                costValueElement.textContent = "💰 -3 points";
                guessCostPreview.className = "cost-preview-sidebar";
            }
        }
        guessCostPreview.style.display = "block";
    } else if (guessCostPreview) {
        guessCostPreview.style.display = "none";
    }
}

/**
 * Update word pattern display based on current clues
 * Shows revealed letters and word length if available
 */
function updateWordPatternDisplay() {
    const wordPatternElement = DOMUtils.get('wordPattern');
    if (!puzzleData || !wordPatternElement) return;
    
    // Get letters revealed from game state
    const lettersRevealed = cluesGivenByType ? cluesGivenByType.lettersRevealed : 1;
    
    // Always show revealed letters
    const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
    const revealedWithSpacing = revealedPart.split('').join(' ');
    
    // Show full pattern if word length has been revealed
    if (cluesGivenByType && cluesGivenByType.wordLength) {
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

/**
 * Update progress bar with animation
 * Shows how many clues have been used vs available
 */
function updateProgressBar() {
    const availableClues = calculateAvailableClues();
    
    // Use the animated ScoreMeter component
    if (Components && Components.ScoreMeter) {
        Components.ScoreMeter.setProgress(cluesUsed, availableClues, true);
    }
    
    // Update unopened clues count
    updateUnopenedCluesCount();
}

/**
 * Update the count of remaining unopened clues
 * Displays how many clues are still available
 */
function updateUnopenedCluesCount() {
    const cluesRemainingElement = DOMUtils.get('#clues-remaining-count');
    if (!cluesRemainingElement || typeof getAvailableClues !== 'function') return;
    
    const available = getAvailableClues();
    const totalRemaining = Object.values(available).reduce((sum, count) => sum + count, 0);
    
    cluesRemainingElement.textContent = totalRemaining;
}

/**
 * Animate score changes with smooth counting
 * Provides visual feedback for score updates
 * @param {HTMLElement} element - The score display element
 * @param {number} newScore - The new score value
 */
function animateScoreUpdate(element, newScore) {
    try {
        if (!element) return;
        
        const oldScore = parseInt(element.textContent) || 0;
        const duration = 600; // 0.6s per spec
        const startTime = performance.now();
        
        // Add updating class for visual feedback
        element.classList.add('updating');
        
        const animate = (currentTime) => {
            try {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out function
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                const currentValue = Math.round(oldScore + (newScore - oldScore) * easeOut);
                element.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = newScore;
                    element.classList.remove('updating');
                    
                    // Update mobile score if game info modal is open
                    if (typeof GameInfoModal !== 'undefined' && GameInfoModal.isVisible()) {
                        GameInfoModal.updateScoreTab();
                    }
                }
            } catch (error) {
                console.error("Error in score animation frame:", error);
                // Fallback: set final value immediately
                if (element) {
                    element.textContent = newScore;
                    element.classList.remove('updating');
                }
            }
        };
        
        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            element.textContent = newScore;
            // Update mobile score if game info modal is open
            if (typeof GameInfoModal !== 'undefined' && GameInfoModal.isVisible()) {
                GameInfoModal.updateScoreTab();
            }
            return;
        }
        
        requestAnimationFrame(animate);
        
    } catch (error) {
        console.error("Error in score animation setup:", error);
        
        // Fallback: set value directly
        if (element) {
            element.textContent = newScore;
        }
    }
}

/**
 * Update difficulty indicator display
 * Shows the difficulty level of the current word
 */
function updateDifficultyIndicator() {
    if (!gameScoring || !puzzleData) return;
    
    const breakdown = gameScoring.getScoreBreakdown();
    const difficultyElement = DOMUtils.get('difficultyScore');
    const difficultyFill = DOMUtils.get('difficultyFill');
    const difficultySection = DOMUtils.get('.difficulty-section');
    
    if (difficultyElement && difficultyFill && difficultySection) {
        const difficulty = breakdown.difficulty;
        const percentage = Math.round(difficulty * 100);
        
        // Set difficulty level per spec: 0-0.3 = low, 0.3-0.6 = medium, >0.6 = high
        let difficultyLevel = 'low';
        if (difficulty > 0.6) {
            difficultyLevel = 'high';
        } else if (difficulty > 0.3) {
            difficultyLevel = 'medium';
        }
        
        difficultyElement.textContent = difficulty.toFixed(2);
        difficultyFill.style.width = `${percentage}%`;
        difficultyFill.setAttribute('data-difficulty', difficultyLevel);
        difficultySection.style.display = 'block';
    }
}

/**
 * Update guess count display
 * Shows how many guesses the player has made
 */
function updateGuessCount() {
    const guessCountElement = DOMUtils.get('guessCount');
    if (guessCountElement && typeof guessCount !== 'undefined') {
        guessCountElement.textContent = guessCount;
    }
}

/**
 * Update score badge in real-time with animation
 * Updates both the score badge and main score display
 */
function updateScoreBadge() {
    const scoreBadge = DOMUtils.get('currentScoreBadge');
    if (scoreBadge && typeof currentScore !== 'undefined') {
        scoreBadge.textContent = currentScore;
    }
    
    // Animate main score number
    const scoreNumber = DOMUtils.get('currentScore');
    if (scoreNumber) {
        scoreNumber.classList.add('updating');
        setTimeout(() => scoreNumber.classList.remove('updating'), 300);
    }
}

/**
 * Start game timer
 * Initializes the game timer and starts updating it
 */
function startGameTimer() {
    gameStartTime = Date.now();
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(updateGameTimer, 1000);
    updateGameTimer();
}

/**
 * Stop game timer
 * Stops the game timer interval
 */
function stopGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

/**
 * Update game timer display
 * Updates the elapsed time display
 */
function updateGameTimer() {
    const timeElapsedElement = DOMUtils.get('timeElapsed');
    if (!gameStartTime || !timeElapsedElement) return;
    
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timeElapsedElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Start periodic score update timer
 * Handles time-based score decay and updates
 */
function startScoreUpdateTimer() {
    setInterval(() => {
        if (gameStarted && gameScoring && typeof currentScore !== 'undefined') {
            const newScore = gameScoring.getCurrentScore();
            if (newScore !== currentScore) {
                currentScore = newScore;
                const currentScoreElement = DOMUtils.get('currentScore');
                if (currentScoreElement) {
                    animateScoreUpdate(currentScoreElement, currentScore);
                }
                updateScoreBadge();
            }
        }
    }, 5000); // Update every 5 seconds
}

// Helper function for calculating available clues (dependency)
function calculateAvailableClues() {
    if (!puzzleData || typeof getAvailableClues !== 'function') return 0;
    const available = getAvailableClues();
    return Object.values(available).reduce((sum, count) => sum + count, 0);
}

// Export functions for use in other modules
const UIUpdates = {
    updateClueDisplay,
    updateButtonCosts,
    updateWordPatternDisplay,
    updateProgressBar,
    updateUnopenedCluesCount,
    animateScoreUpdate,
    updateDifficultyIndicator,
    updateGuessCount,
    updateScoreBadge,
    startGameTimer,
    stopGameTimer,
    updateGameTimer,
    startScoreUpdateTimer
};

// Module export handling
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUpdates;
} else {
    // Make functions available globally for compatibility
    window.UIUpdates = UIUpdates;
    
    // Also make individual functions available globally (for backward compatibility)
    Object.assign(window, UIUpdates);
}

console.log('✅ UI Updates module loaded successfully');