/**
 * Mobile Tab Navigation Management
 * Handles tab switching for mobile layout
 */

const MobileTabs = {
    init() {
        // Only initialize on mobile
        if (window.innerWidth > 767) return;
        
        this.tabNav = document.getElementById('mobile-tab-navigation');
        this.gameShell = document.querySelector('.game-shell');
        this.gameInfoModal = document.getElementById('game-info-modal');
        this.statsModal = document.getElementById('stats-modal');
        
        if (!this.tabNav) return;
        
        // Show tab navigation
        this.tabNav.style.display = 'flex';
        
        // Setup tab click handlers
        this.setupTabHandlers();
        
        // Setup mobile game action handlers
        this.setupMobileActions();
    },
    
    setupTabHandlers() {
        const tabs = this.tabNav.querySelectorAll('.mobile-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    },
    
    switchTab(tabName) {
        // Update active tab
        const tabs = this.tabNav.querySelectorAll('.mobile-tab');
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
                    <div class="stat-value">${stats.winRate}%</div>
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
    
    setupMobileActions() {
        // Connect mobile buttons to game actions
        const mobileNewGame = document.getElementById('mobile-new-game');
        const mobileGiveUp = document.getElementById('mobile-give-up');
        
        if (mobileNewGame) {
            mobileNewGame.addEventListener('click', () => {
                // Switch to game tab
                this.switchTab('game');
                // Trigger new game
                document.getElementById('start-game-button')?.click();
            });
        }
        
        if (mobileGiveUp) {
            mobileGiveUp.addEventListener('click', () => {
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
    module.exports = MobileTabs;
} else {
    window.MobileTabs = MobileTabs;
}