/**
 * Tab Navigation Management
 * Handles tab switching for all screen sizes
 */

const Tabs = {
    init() {
        this.tabNav = document.getElementById('tab-navigation');
        this.gameShell = document.querySelector('.game-shell');
        this.gameInfoModal = document.getElementById('game-info-modal');
        this.statsModal = document.getElementById('stats-modal');
        
        if (!this.tabNav) return;
        
        // Setup tab click handlers
        this.setupTabHandlers();
        
        // Setup game action handlers
        this.setupGameActions();
        
        // Handle responsive layout
        this.handleResponsive();
        window.addEventListener('resize', () => this.handleResponsive());
    },
    
    handleResponsive() {
        // Tab navigation is always visible now
        // Just adjust positioning via CSS
    },
    
    setupTabHandlers() {
        const tabs = this.tabNav.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    },
    
    switchTab(tabName) {
        // Update active tab
        const tabs = this.tabNav.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Handle tab content
        switch(tabName) {
            case 'game':
                this.showGame();
                break;
            case 'clues':
                this.showClues();
                break;
            case 'score':
                this.showScore();
                break;
            case 'stats':
                this.showStats();
                break;
            case 'options':
                this.showOptions();
                break;
        }
    },
    
    showGame() {
        this.gameShell.style.display = 'block';
        this.gameInfoModal.classList.remove('active');
        this.gameInfoModal.style.display = 'none';
        if (this.statsModal) {
            this.statsModal.setAttribute('data-open', 'false');
        }
    },
    
    showClues() {
        this.gameShell.style.display = 'none';
        this.gameInfoModal.classList.add('active');
        this.gameInfoModal.style.display = 'block';
        
        // Activate clues tab panel
        const panels = this.gameInfoModal.querySelectorAll('.tab-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById('clues-tab')?.classList.add('active');
        
        // Update clue deck
        if (typeof Components !== 'undefined' && Components.ClueDeck) {
            Components.ClueDeck.renderCards();
        }
    },
    
    showScore() {
        this.gameShell.style.display = 'none';
        this.gameInfoModal.classList.add('active');
        this.gameInfoModal.style.display = 'block';
        
        // Activate score tab panel
        const panels = this.gameInfoModal.querySelectorAll('.tab-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById('score-tab')?.classList.add('active');
    },
    
    showStats() {
        this.gameShell.style.display = 'none';
        this.gameInfoModal.classList.add('active');
        this.gameInfoModal.style.display = 'block';
        
        // Activate stats tab panel
        const panels = this.gameInfoModal.querySelectorAll('.tab-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        const statsTab = document.getElementById('stats-tab');
        if (statsTab) {
            statsTab.classList.add('active');
            this.populateStatsTab();
        }
    },
    
    showOptions() {
        this.gameShell.style.display = 'none';
        this.gameInfoModal.classList.add('active');
        this.gameInfoModal.style.display = 'block';
        
        // Activate options tab panel
        const panels = this.gameInfoModal.querySelectorAll('.tab-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById('options-tab')?.classList.add('active');
    },
    
    populateStatsTab() {
        const statsContent = document.querySelector('.stats-content-mobile');
        if (!statsContent || !window.Statistics) return;
        
        const stats = window.Statistics.getStats();
        
        statsContent.innerHTML = `
            <div class="mobile-stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.gamesPlayed}</div>
                    <div class="stat-label">Games Played</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.gamesWon}</div>
                    <div class="stat-label">Games Won</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.winRate !== null ? stats.winRate + '%' : '--'}</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.bestScore}</div>
                    <div class="stat-label">Best Score</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.currentStreak}</div>
                    <div class="stat-label">Current Streak</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.bestStreak}</div>
                    <div class="stat-label">Best Streak</div>
                </div>
            </div>
        `;
    },
    
    setupGameActions() {
        // Connect tab buttons to game actions
        const tabNewGame = document.getElementById('tab-new-game');
        const tabGiveUp = document.getElementById('tab-give-up');
        
        if (tabNewGame) {
            tabNewGame.addEventListener('click', () => {
                // Switch to game tab
                this.switchTab('game');
                // Trigger new game
                document.getElementById('start-game-button')?.click();
            });
        }
        
        if (tabGiveUp) {
            tabGiveUp.addEventListener('click', () => {
                // Switch to game tab
                this.switchTab('game');
                // Trigger give up
                document.getElementById('give-up-button')?.click();
            });
        }
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tabs;
} else {
    window.Tabs = Tabs;
}