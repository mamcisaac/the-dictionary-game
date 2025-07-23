/**
 * Event Handlers Module
 * Centralized event handling for The Dictionary Game
 */

const EventHandlers = {
    /**
     * Initialize all event listeners
     */
    init() {
        this.setupGameControls();
        this.setupModalHandlers();
        this.setupKeyboardNavigation();
        this.setupCustomEvents();
        console.log('✅ Event handlers initialized');
    },

    /**
     * Set up main game control events
     */
    setupGameControls() {
        // Guess input and button
        const guessInput = document.getElementById("guess-input");
        const guessButton = document.getElementById("guess-button");
        
        if (guessInput) {
            guessInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && gameStarted) {
                    event.preventDefault();
                    this.handleGuess();
                }
            });
        }

        if (guessButton) {
            guessButton.addEventListener("click", this.handleGuess);
        }

        // Game control buttons
        const startGameButton = document.getElementById("start-game-button");
        const giveUpButton = document.getElementById("give-up-button");
        const emptyStateNewGameBtn = document.getElementById("empty-state-new-game");

        if (startGameButton) {
            startGameButton.addEventListener("click", startGame);
        }

        if (emptyStateNewGameBtn) {
            emptyStateNewGameBtn.addEventListener("click", startGame);
        }

        if (giveUpButton) {
            giveUpButton.addEventListener("click", () => {
                if (gameStarted) {
                    const confirmGiveUp = confirm("Are you sure you want to reveal the answer? This will end the game with 0 points.");
                    if (confirmGiveUp) {
                        this.handleGiveUp();
                    }
                }
            });
        }

        // Details toggle in sidebar
        const detailsToggle = document.getElementById('details-toggle');
        const detailsSection = document.getElementById('details-section');
        
        if (detailsToggle && detailsSection) {
            detailsToggle.addEventListener('click', () => {
                const isExpanded = detailsToggle.getAttribute('aria-expanded') === 'true';
                detailsToggle.setAttribute('aria-expanded', !isExpanded);
                detailsSection.style.display = isExpanded ? 'none' : 'block';
                
                // Update toggle icon
                const icon = detailsToggle.querySelector('.toggle-icon');
                if (icon) {
                    icon.textContent = isExpanded ? '▼' : '▲';
                }
            });
        }
    },

    /**
     * Set up modal event handlers
     */
    setupModalHandlers() {
        // Stats modal
        const statsButton = document.getElementById("stats-button");
        const closeModal = document.querySelector(".close");
        const resetStatsButton = document.getElementById("reset-stats");
        const statsModal = document.getElementById("stats-modal");

        if (statsButton) {
            statsButton.addEventListener("click", () => {
                updateStatsDisplay();
                Components.StatModal.show();
            });
        }

        if (closeModal) {
            closeModal.addEventListener("click", () => {
                Components.StatModal.hide();
            });
        }

        if (resetStatsButton) {
            resetStatsButton.addEventListener("click", () => {
                if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
                    this.resetGameStats();
                }
            });
        }

        // Click outside to close stats modal
        if (statsModal) {
            window.addEventListener("click", (event) => {
                if (event.target === statsModal) {
                    Components.StatModal.hide();
                }
            });
        }

        // Help modal
        const helpButton = document.getElementById("help-button");
        const closeHelpModal = document.querySelector(".close-help");
        const helpModal = document.getElementById("help-modal");

        if (helpButton) {
            helpButton.addEventListener("click", showHelpModal);
        }

        if (closeHelpModal) {
            closeHelpModal.addEventListener("click", hideHelpModal);
        }

        // Click outside to close help modal
        if (helpModal) {
            window.addEventListener("click", (event) => {
                if (event.target === helpModal) {
                    hideHelpModal();
                }
            });
        }

        // Help icon in empty state
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("help-icon")) {
                if (helpModal) {
                    helpModal.style.display = "block";
                    const modalContent = document.querySelector('.modal-content');
                    if (modalContent) modalContent.focus();
                }
            }
        });
    },

    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
        // Global escape key handling
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // Close stats modal if open
                const statsModal = document.getElementById('stats-modal');
                if (statsModal && statsModal.getAttribute('data-open') === 'true') {
                    Components.StatModal.hide();
                    event.preventDefault();
                }
                
                // Close help modal if open
                const helpModal = document.getElementById('help-modal');
                if (helpModal && helpModal.style.display !== 'none') {
                    hideHelpModal();
                    event.preventDefault();
                }
            }
        });
    },

    /**
     * Set up custom events
     */
    setupCustomEvents() {
        // Clue purchase event
        document.addEventListener('cluePurchaseRequested', (event) => {
            const { type, cost } = event.detail;
            if (typeof purchaseClue === 'function') {
                purchaseClue(type, cost);
            }
        });
    },

    /**
     * Handle guess submission
     */
    handleGuess() {
        const guessInput = document.getElementById("guess-input");
        if (!guessInput || !gameStarted) return;

        const guess = guessInput.value.trim().toLowerCase();
        if (!guess) return;

        // Call the main game logic
        if (typeof handleGuess === 'function') {
            handleGuess();
        }
    },

    /**
     * Handle give up action
     */
    handleGiveUp() {
        if (!gameStarted || !puzzleData) return;

        gameStarted = false;
        currentScore = 0;
        
        // Show the answer
        const messageArea = document.getElementById("message");
        if (messageArea) {
            messageArea.textContent = `Answer revealed. The word was: ${puzzleData.word}`;
            messageArea.style.color = "var(--red-400)";
        }

        // Update UI state
        this.updateUIForGameEnd();
    },

    /**
     * Reset game statistics
     */
    resetGameStats() {
        gameStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            currentStreak: 0,
            bestStreak: 0
        };

        // Save to localStorage
        localStorage.setItem('dictionaryGameStats', JSON.stringify(gameStats));
        
        // Update display
        if (typeof updateStatsDisplay === 'function') {
            updateStatsDisplay();
        }

        // Show feedback
        Components.Toast.show("📊 Statistics reset successfully", "success");
    },

    /**
     * Update UI when game ends
     */
    updateUIForGameEnd() {
        const giveUpButton = document.getElementById("give-up-button");
        const guessButton = document.getElementById("guess-button");
        const inputSection = document.querySelector(".input-section");

        if (giveUpButton) {
            giveUpButton.disabled = true;
            giveUpButton.setAttribute('aria-disabled', 'true');
        }

        if (guessButton) {
            guessButton.disabled = true;
        }

        if (inputSection) {
            inputSection.style.display = "none";
        }

        // Hide clue decks
        Components.ClueDeck.hide();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventHandlers;
} else {
    window.EventHandlers = EventHandlers;
}