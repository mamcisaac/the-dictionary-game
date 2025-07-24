/**
 * Popup Management System
 * Handles clue selection, score display, and help popups
 */

const Popup = {
    activePopup: null,
    
    init() {
        this.setupCluePopup();
        this.setupScorePopup();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup-overlay')) {
                this.close();
            }
        });
        
        // Close buttons
        document.querySelectorAll('.popup-close').forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activePopup) {
                this.close();
            }
        });
        
        // Tab switching
        document.querySelectorAll('.popup-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        // Reset stats button in popup
        const resetStatsPopup = document.getElementById('reset-stats-popup');
        if (resetStatsPopup) {
            resetStatsPopup.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all statistics?')) {
                    Statistics.resetStats();
                    this.updateStatsDisplay();
                }
            });
        }
    },
    
    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.popup-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Add active class to selected tab and pane
        const selectedTab = document.querySelector(`.popup-tab[data-tab="${tabName}"]`);
        const selectedPane = document.getElementById(`${tabName}-tab`);
        
        if (selectedTab && selectedPane) {
            selectedTab.classList.add('active');
            selectedPane.classList.add('active');
        }
        
    },
    
    setupCluePopup() {
        const clueBtn = document.getElementById('clue-button');
        if (clueBtn) {
            clueBtn.addEventListener('click', () => {
                console.log('Clue button clicked');
                this.showCluePopup();
            });
        } else {
            console.warn('Clue button not found');
        }
    },
    
    setupScorePopup() {
        const scoreBtn = document.getElementById('score-button');
        if (scoreBtn) {
            scoreBtn.addEventListener('click', () => {
                console.log('Score button clicked');
                this.showScorePopup();
            });
        } else {
            console.warn('Score button not found');
        }
    },
    
    showCluePopup() {
        // Check if game has started
        if (!window.gameStarted) {
            const messageArea = document.getElementById('message');
            if (messageArea) {
                messageArea.textContent = 'Please start a new game first!';
                messageArea.style.color = 'var(--amber-400)';
            }
            return;
        }
        
        const popup = document.getElementById('clue-popup');
        if (!popup) return;
        
        // Populate clue grid
        this.populateClueGrid();
        
        // Show popup
        this.show(popup);
    },
    
    populateClueGrid() {
        const clueGrid = document.getElementById('clue-grid');
        if (!clueGrid || !window.gameStarted || !window.puzzleData) return;
        
        // Get all clue types, both available and unavailable
        const available = getAvailableClues();
        const dynamicCosts = gameScoring ? gameScoring.getAllClueCosts(window.puzzleData) : {};
        
        const allClueTypes = [
            { type: 'definition', label: 'Definition', cost: dynamicCosts.definition || 10, icon: '📖', available: available.definitions > 0 },
            { type: 'wordLength', label: 'Length', cost: dynamicCosts.wordLength || 5, icon: '📏', available: available.wordLength },
            { type: 'example', label: 'Example', cost: dynamicCosts.example || 15, icon: '📝', available: available.examples > 0 },
            { type: 'synonym', label: 'Synonym', cost: dynamicCosts.synonym || 20, icon: '💡', available: available.synonyms > 0 },
            { type: 'antonym', label: 'Antonym', cost: dynamicCosts.antonym || 20, icon: '🔄', available: available.antonyms > 0 },
            { type: 'letter', label: 'Letter', cost: dynamicCosts.letter || 25, icon: '🔤', available: available.letters > 0 }
        ];
        
        clueGrid.innerHTML = '';
        
        allClueTypes.forEach(clueType => {
            const card = this.createClueCard(clueType);
            clueGrid.appendChild(card);
        });
    },
    
    createClueCard(clueType) {
        const card = document.createElement('button');
        card.className = 'clue-card-popup';
        card.setAttribute('data-clue-type', clueType.type);
        
        // Check if already used or unavailable
        const cluesObj = window.cluesGivenByType || {};
        let isUsed = false;
        
        // Different logic for different clue types
        if (clueType.type === 'definition') {
            // For definitions, check if we've used all available definitions
            const totalDefinitions = window.puzzleData?.definitions?.length || 0;
            isUsed = cluesObj.definitions >= totalDefinitions;
        } else if (clueType.type === 'example') {
            // For examples, check if we've used all available examples  
            const totalExamples = window.puzzleData?.examples?.length || 0;
            isUsed = cluesObj.examples >= totalExamples;
        } else {
            // For boolean clues (wordLength, synonyms, antonyms) or letters
            isUsed = cluesObj[clueType.type] === true || 
                     (clueType.type === 'letter' && cluesObj.lettersRevealed >= (window.puzzleData?.word?.length || 0));
        }
        
        const isAvailable = clueType.available;
        const canAfford = (window.currentScore || 0) >= (clueType.cost || 0);
        
        // Disable if used or unavailable
        const isDisabled = isUsed || !isAvailable || !canAfford;
        
        if (isDisabled) {
            card.classList.add('disabled');
            card.disabled = true;
        }
        
        // Determine cost display
        let costDisplay;
        if (isUsed) {
            costDisplay = 'Used';
        } else if (!isAvailable) {
            costDisplay = 'None left';
        } else if (clueType.cost === 0) {
            costDisplay = 'Free';
        } else {
            costDisplay = `-${clueType.cost}`;
        }
        
        card.innerHTML = `
            <div class="clue-icon">${clueType.icon}</div>
            <div class="clue-name">${clueType.label}</div>
            <div class="clue-cost">${costDisplay}</div>
        `;
        
        if (!isDisabled) {
            card.addEventListener('click', () => {
                this.handleClueSelection(clueType.type);
            });
        }
        
        return card;
    },
    
    handleClueSelection(clueType) {
        // Close popup immediately
        this.close();
        
        // Trigger clue purchase (which reveals the clue)
        if (window.purchaseClue || typeof purchaseClue === 'function') {
            // Get the cost from the ClueDeck component
            const clueTypes = Components.ClueDeck?.getAvailableClueTypes();
            const selectedClue = clueTypes?.find(c => c.type === clueType);
            const cost = selectedClue?.cost || 0;
            
            purchaseClue(clueType, cost);
        }
        
        // Return focus to input
        const input = document.getElementById('guess-input');
        if (input) {
            input.focus();
        }
    },
    
    showScorePopup() {
        const popup = document.getElementById('score-popup');
        if (!popup) return;
        
        // Update score display
        this.updateScoreDisplay();
        
        // Update stats display
        this.updateStatsDisplay();
        
        // Show popup
        this.show(popup);
    },
    
    updateScoreDisplay() {
        // Update current game score
        const elements = {
            score: document.getElementById('current-score-popup'),
            clues: document.getElementById('clue-counter-popup'),
            guesses: document.getElementById('guess-count-popup'),
            time: document.getElementById('time-elapsed-popup'),
            difficulty: document.getElementById('difficulty-popup')
        };
        
        if (elements.score) {
            elements.score.textContent = window.currentScore || 0;
        }
        
        if (elements.clues) {
            // Count actual clues used
            const cluesObj = window.cluesGivenByType || {};
            let usedClues = 0;
            
            // Count each type of clue properly
            if (cluesObj.definitions > 1) usedClues += cluesObj.definitions - 1; // -1 because first is free
            if (cluesObj.wordLength) usedClues += 1;
            if (cluesObj.examples > 0) usedClues += cluesObj.examples;
            if (cluesObj.synonyms) usedClues += 1;
            if (cluesObj.antonyms) usedClues += 1;
            if (cluesObj.lettersRevealed > 1) usedClues += cluesObj.lettersRevealed - 1; // -1 because first is free
            
            // Get total available clues
            const available = window.getAvailableClues ? window.getAvailableClues() : {};
            const totalAvailable = Object.values(available).reduce((sum, count) => sum + count, 0);
            
            elements.clues.textContent = `${usedClues}`;
        }
        
        if (elements.guesses) {
            elements.guesses.textContent = window.guessCount || 0;
        }
        
        if (elements.time) {
            // Calculate elapsed time from game start
            if (window.gameStartTime) {
                const elapsed = Math.floor((Date.now() - window.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                elements.time.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                elements.time.textContent = '0:00';
            }
        }
        
    },
    
    updateStatsDisplay() {
        const stats = Statistics.getStats();
        
        const elements = {
            gamesPlayed: document.getElementById('games-played-popup'),
            gamesWon: document.getElementById('games-won-popup'),
            winRate: document.getElementById('win-rate-popup'),
            avgScore: document.getElementById('avg-score-popup'),
            bestScore: document.getElementById('best-score-popup'),
            currentStreak: document.getElementById('current-streak-popup'),
            bestStreak: document.getElementById('best-streak-popup')
        };
        
        if (elements.gamesPlayed) {
            elements.gamesPlayed.textContent = stats.gamesPlayed;
        }
        
        if (elements.gamesWon) {
            elements.gamesWon.textContent = stats.gamesWon;
        }
        
        if (elements.winRate) {
            elements.winRate.textContent = (stats.winRate !== null && stats.winRate !== undefined) ? `${stats.winRate}%` : '--';
        }
        
        if (elements.avgScore) {
            const avgScore = Statistics.getAverageScore();
            elements.avgScore.textContent = avgScore;
        }
        
        if (elements.bestScore) {
            elements.bestScore.textContent = stats.bestScore;
        }
        
        if (elements.currentStreak) {
            elements.currentStreak.textContent = stats.currentStreak;
        }
        
        if (elements.bestStreak) {
            elements.bestStreak.textContent = stats.bestStreak;
        }
    },
    
    
    show(popup) {
        if (!popup) return;
        
        // Hide any active popup
        if (this.activePopup) {
            this.close();
        }
        
        // Show new popup
        popup.style.display = 'flex';
        this.activePopup = popup;
        
        // Add body class to prevent scrolling
        document.body.classList.add('popup-open');
        
        // Focus management
        const firstFocusable = popup.querySelector('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    },
    
    close() {
        if (this.activePopup) {
            this.activePopup.style.display = 'none';
            this.activePopup = null;
            
            // Remove body class
            document.body.classList.remove('popup-open');
            
            // Return focus to game
            const input = document.getElementById('guess-input');
            if (input && document.activeElement.tagName !== 'INPUT') {
                input.focus();
            }
        }
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Popup;
} else {
    window.Popup = Popup;
}