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
        if (typeof gameStarted === 'undefined' || !gameStarted) {
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
        if (!clueGrid || !window.Components?.ClueDeck) return;
        
        // Get available clues from ClueDeck
        const clueTypes = Components.ClueDeck.getAvailableClueTypes();
        
        clueGrid.innerHTML = '';
        
        clueTypes.forEach(clueType => {
            const card = this.createClueCard(clueType);
            clueGrid.appendChild(card);
        });
    },
    
    createClueCard(clueType) {
        const card = document.createElement('button');
        card.className = 'clue-card-popup';
        card.setAttribute('data-clue-type', clueType.type);
        
        // Check if already used
        const cluesObj = (typeof cluesGivenByType !== 'undefined') ? cluesGivenByType : {};
        const isUsed = cluesObj[clueType.type] === true || cluesObj[clueType.type] > 0;
        if (isUsed) {
            card.classList.add('used');
            card.disabled = true;
        }
        
        card.innerHTML = `
            <div class="clue-icon">${clueType.icon}</div>
            <div class="clue-name">${clueType.label}</div>
            <div class="clue-cost">${isUsed ? 'Used' : `-${clueType.cost || 0}`}</div>
        `;
        
        if (!isUsed) {
            card.addEventListener('click', () => {
                this.handleClueSelection(clueType.type);
            });
        }
        
        return card;
    },
    
    handleClueSelection(clueType) {
        // Close popup immediately
        this.close();
        
        // Trigger clue reveal
        if (window.revealClue) {
            revealClue(clueType);
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
            time: document.getElementById('time-elapsed-popup')
        };
        
        if (elements.score) {
            elements.score.textContent = (typeof currentScore !== 'undefined') ? currentScore : 0;
        }
        
        if (elements.clues) {
            const cluesObj = (typeof cluesGivenByType !== 'undefined') ? cluesGivenByType : {};
            const usedClues = Object.values(cluesObj).filter(val => val === true || val > 0).length;
            const totalClues = Object.keys(cluesObj).length;
            elements.clues.textContent = `${usedClues}/${totalClues}`;
        }
        
        if (elements.guesses) {
            elements.guesses.textContent = (typeof guessCount !== 'undefined') ? guessCount : 0;
        }
        
        if (elements.time && window.formatTime) {
            const elapsed = (typeof elapsedTime !== 'undefined') ? elapsedTime : 0;
            elements.time.textContent = formatTime(elapsed);
        }
    },
    
    updateStatsDisplay() {
        const stats = Statistics.getStats();
        
        const elements = {
            gamesPlayed: document.getElementById('games-played-popup'),
            winRate: document.getElementById('win-rate-popup'),
            bestScore: document.getElementById('best-score-popup'),
            currentStreak: document.getElementById('current-streak-popup')
        };
        
        if (elements.gamesPlayed) {
            elements.gamesPlayed.textContent = stats.gamesPlayed;
        }
        
        if (elements.winRate) {
            elements.winRate.textContent = `${stats.winRate}%`;
        }
        
        if (elements.bestScore) {
            elements.bestScore.textContent = stats.bestScore;
        }
        
        if (elements.currentStreak) {
            elements.currentStreak.textContent = stats.currentStreak;
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