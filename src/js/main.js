/**
 * Main Entry Point for The Dictionary Game
 * Coordinates initialization and module loading
 */

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 The Dictionary Game - Initializing...');
    
    // Initialize core systems in order
    DOMUtils.init();
    GameState.initializeScoring();
    GameState.loadWordList();
    Statistics.init();
    
    // Initialize UI systems
    ModalManager.init();
    Popup.init();
    Components.GuessCard.init();
    Components.ScoreMeter.init();
    Components.ClueDeck.init();
    
    // UI Updates module - start periodic score updates
    if (typeof startScoreUpdateTimer === 'function') {
        startScoreUpdateTimer();
    }
    
    // Initialize event handling (must be last)
    EventHandlers.init();
    
    // Auto-start the first game and show help modal for first-time users
    const isFirstTime = !localStorage.getItem('dictionaryGameStats');
    await startGame();
    if (isFirstTime) {
        showHelpModal();
    }
    
    console.log('✅ Game initialized successfully');
    console.log('📊 DOM Cache:', DOMUtils.getCacheStats());
});