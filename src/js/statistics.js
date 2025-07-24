/**
 * Statistics Module for The Dictionary Game
 * Handles game statistics tracking, persistence, and display
 */

/**
 * Statistics Manager - handles all statistics-related functionality
 */
const Statistics = {
    /**
     * Load statistics from localStorage
     * @returns {Object} The loaded statistics object
     */
    loadStats() {
        const savedStats = localStorage.getItem('dictionaryGameStats');
        if (savedStats) {
            try {
                const parsed = JSON.parse(savedStats);
                // Ensure all required properties exist with defaults
                gameStats = {
                    gamesPlayed: parsed.gamesPlayed || 0,
                    gamesWon: parsed.gamesWon || 0,
                    totalScore: parsed.totalScore || 0,
                    bestScore: parsed.bestScore || 0,
                    currentStreak: parsed.currentStreak || 0,
                    bestStreak: parsed.bestStreak || 0
                };
            } catch (error) {
                console.warn('Failed to parse saved statistics, using defaults:', error);
                this.resetStats();
            }
        } else {
            // Initialize with default values
            this.resetStats();
        }
        return gameStats;
    },

    /**
     * Save current statistics to localStorage
     * @param {Object} stats - Optional stats object to save, defaults to global gameStats
     */
    saveStats(stats = gameStats) {
        try {
            localStorage.setItem('dictionaryGameStats', JSON.stringify(stats));
        } catch (error) {
            console.error('Failed to save statistics to localStorage:', error);
        }
    },

    /**
     * Reset statistics to default values
     */
    resetStats() {
        gameStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        this.saveStats();
    },

    /**
     * Update the statistics display in the UI
     * Updates all statistics elements and generates the heat map calendar
     */
    updateStatsDisplay() {
        // Update basic statistics
        const gamesPlayedEl = document.getElementById('games-played');
        const gamesWonEl = document.getElementById('games-won');
        const winRateEl = document.getElementById('win-rate');
        const avgScoreEl = document.getElementById('avg-score');
        const bestScoreEl = document.getElementById('best-score');
        const currentStreakEl = document.getElementById('current-streak');
        const bestStreakEl = document.getElementById('best-streak');

        if (gamesPlayedEl) gamesPlayedEl.textContent = gameStats.gamesPlayed;
        if (gamesWonEl) gamesWonEl.textContent = gameStats.gamesWon;
        
        // Calculate and display win rate
        const winRate = gameStats.gamesPlayed > 0 
            ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) 
            : 0;
        if (winRateEl) winRateEl.textContent = winRate + '%';
        
        // Calculate and display average score
        const avgScore = gameStats.gamesWon > 0 
            ? Math.round(gameStats.totalScore / gameStats.gamesWon) 
            : 0;
        if (avgScoreEl) avgScoreEl.textContent = avgScore;
        
        if (bestScoreEl) bestScoreEl.textContent = gameStats.bestScore;
        if (currentStreakEl) currentStreakEl.textContent = gameStats.currentStreak;
        if (bestStreakEl) bestStreakEl.textContent = gameStats.bestStreak;
        
        // Generate heat-map calendar when stats modal is updated
        this.generateHeatMapCalendar();
    },

    /**
     * Record the result of a completed game
     * @param {boolean} won - Whether the player won the game
     * @param {number} score - The final score (default: 0)
     */
    recordGameResult(won, score = 0) {
        gameStats.gamesPlayed++;
        
        if (won) {
            gameStats.gamesWon++;
            gameStats.totalScore += score;
            gameStats.currentStreak++;
            
            // Update best streak if current streak is better
            if (gameStats.currentStreak > gameStats.bestStreak) {
                gameStats.bestStreak = gameStats.currentStreak;
            }
            
            // Update best score if this score is better
            if (score > gameStats.bestScore) {
                gameStats.bestScore = score;
            }

            // Record daily win for heat map
            this.recordDailyWin();
        } else {
            // Reset streak on loss
            gameStats.currentStreak = 0;
        }
        
        // Save and update display
        this.saveStats();
        this.updateStatsDisplay();
        
        // Enable stats button after first game
        const statsButton = document.getElementById('stats-button');
        if (gameStats.gamesPlayed === 1 && statsButton) {
            statsButton.disabled = false;
            statsButton.setAttribute('aria-disabled', 'false');
        }
    },

    /**
     * Record a win for today's date (used for heat map calendar)
     */
    recordDailyWin() {
        const today = new Date().toISOString().split('T')[0];
        const dailyWins = JSON.parse(localStorage.getItem('dictionaryGameDailyWins') || '{}');
        
        dailyWins[today] = (dailyWins[today] || 0) + 1;
        
        try {
            localStorage.setItem('dictionaryGameDailyWins', JSON.stringify(dailyWins));
        } catch (error) {
            console.error('Failed to save daily wins:', error);
        }
    },

    /**
     * Generate and render the heat map calendar showing daily wins
     * Creates a 52-week calendar grid showing game activity
     */
    generateHeatMapCalendar() {
        const heatMapGrid = document.getElementById('heat-map-grid');
        if (!heatMapGrid) return;
        
        const dailyWins = JSON.parse(localStorage.getItem('dictionaryGameDailyWins') || '{}');
        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364); // Show last 365 days
        
        // Clear existing grid
        heatMapGrid.innerHTML = '';
        
        // Generate calendar grid (52 weeks)
        for (let week = 0; week < 52; week++) {
            const weekDiv = document.createElement('div');
            weekDiv.className = 'heat-map-week';
            
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                if (currentDate > endDate) break;
                
                const dateString = currentDate.toISOString().split('T')[0];
                const wins = dailyWins[dateString] || 0;
                
                const dayDiv = document.createElement('div');
                dayDiv.className = 'heat-map-day';
                dayDiv.setAttribute('data-wins', Math.min(wins, 4).toString());
                dayDiv.title = `${dateString}: ${wins} win${wins !== 1 ? 's' : ''}`;
                
                weekDiv.appendChild(dayDiv);
            }
            
            heatMapGrid.appendChild(weekDiv);
        }
    },

    /**
     * Get current statistics object
     * @returns {Object} Current game statistics with calculated values
     */
    getStats() {
        const winRate = gameStats.gamesPlayed > 0 
            ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) 
            : null; // Use null to indicate no games played yet
            
        return { 
            ...gameStats,
            winRate: winRate
        };
    },

    /**
     * Get daily wins data
     * @returns {Object} Daily wins data from localStorage
     */
    getDailyWins() {
        return JSON.parse(localStorage.getItem('dictionaryGameDailyWins') || '{}');
    },

    /**
     * Calculate win percentage
     * @returns {number} Win percentage (0-100)
     */
    getWinPercentage() {
        return gameStats.gamesPlayed > 0 
            ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) 
            : 0;
    },

    /**
     * Calculate average score
     * @returns {number} Average score across all wins
     */
    getAverageScore() {
        return gameStats.gamesWon > 0 
            ? Math.round(gameStats.totalScore / gameStats.gamesWon) 
            : 0;
    },

    /**
     * Initialize statistics system
     * Loads saved statistics and sets up the UI
     */
    init() {
        this.loadStats();
        this.updateStatsDisplay();
        
        // Enable stats button if games have been played
        const statsButton = document.getElementById('stats-button');
        if (gameStats.gamesPlayed > 0 && statsButton) {
            statsButton.disabled = false;
            statsButton.setAttribute('aria-disabled', 'false');
        }
    }
};

// Make Statistics globally available
window.Statistics = Statistics;