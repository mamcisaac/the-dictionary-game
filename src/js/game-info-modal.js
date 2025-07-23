/**
 * Game Info Modal Module
 * Handles the mobile game info modal with tabs for clues and score information
 */

const GameInfoModal = {
    modal: null,
    currentTab: 'clues',
    
    /**
     * Initialize the game info modal
     */
    init() {
        this.modal = document.getElementById('game-info-modal');
        this.bindEvents();
        console.log('✅ Game Info Modal initialized');
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Clues button to open modal
        const cluesButton = document.getElementById('clues-button');
        if (cluesButton) {
            cluesButton.addEventListener('click', () => this.show());
        }
        
        // Close button
        const closeButton = document.getElementById('close-game-info');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }
        
        // Tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Close on backdrop click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    },
    
    /**
     * Show the game info modal
     */
    show() {
        if (!this.modal) return;
        
        this.modal.style.display = 'flex';
        this.updateContent();
        
        // Focus management
        const firstTab = this.modal.querySelector('.tab-button.active');
        if (firstTab) {
            firstTab.focus();
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Hide the game info modal
     */
    hide() {
        if (!this.modal) return;
        
        this.modal.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to clues button
        const cluesButton = document.getElementById('clues-button');
        if (cluesButton) {
            cluesButton.focus();
        }
    },
    
    /**
     * Check if modal is visible
     */
    isVisible() {
        return this.modal && this.modal.style.display === 'flex';
    },
    
    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update tab panels
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            if (panel.id === `${tabName}-tab`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Update content
        this.updateContent();
    },
    
    /**
     * Update modal content with current game data
     */
    updateContent() {
        if (this.currentTab === 'clues') {
            this.updateCluesTab();
        } else if (this.currentTab === 'score') {
            this.updateScoreTab();
        }
    },
    
    /**
     * Update the clues tab with current clue deck
     */
    updateCluesTab() {
        // Trigger ClueDeck to re-render cards
        if (typeof Components !== 'undefined' && Components.ClueDeck) {
            Components.ClueDeck.renderCards();
        }
    },
    
    /**
     * Update the score tab with current score data
     */
    updateScoreTab() {
        // Sync score data from desktop to mobile
        this.syncElement('current-score', 'current-score-mobile');
        this.syncElement('clue-counter', 'clue-counter-mobile');
        this.syncElement('difficulty-score', 'difficulty-score-mobile');
        this.syncElement('guess-count', 'guess-count-mobile');
        this.syncElement('time-elapsed', 'time-elapsed-mobile');
        
        // Sync progress bars
        const progressFill = document.getElementById('progress-fill');
        const progressFillMobile = document.getElementById('progress-fill-mobile');
        if (progressFill && progressFillMobile) {
            progressFillMobile.style.width = progressFill.style.width;
        }
        
        const difficultyFill = document.getElementById('difficulty-fill');
        const difficultyFillMobile = document.getElementById('difficulty-fill-mobile');
        if (difficultyFill && difficultyFillMobile) {
            difficultyFillMobile.style.width = difficultyFill.style.width;
        }
    },
    
    /**
     * Sync content between desktop and mobile elements
     */
    syncElement(sourceId, targetId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        
        if (source && target) {
            target.textContent = source.textContent;
        }
    },
    
    /**
     * Enable the clues button when game starts
     */
    enableCluesButton() {
        const cluesButton = document.getElementById('clues-button');
        if (cluesButton) {
            cluesButton.disabled = false;
            cluesButton.setAttribute('aria-disabled', 'false');
        }
    },
    
    /**
     * Disable the clues button when game ends
     */
    disableCluesButton() {
        const cluesButton = document.getElementById('clues-button');
        if (cluesButton) {
            cluesButton.disabled = true;
            cluesButton.setAttribute('aria-disabled', 'true');
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameInfoModal;
} else {
    window.GameInfoModal = GameInfoModal;
}