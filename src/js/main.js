/**
 * Main Entry Point for The Dictionary Game
 * Coordinates initialization and module loading
 */

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 The Dictionary Game - Initializing...');
    
    // Initialize core systems in order
    DOMUtils.init();
    GameState.initializeScoring();
    GameState.loadWordList();
    
    // Initialize UI systems
    ModalManager.init();
    Components.GuessCard.init();
    Components.ScoreMeter.init();
    Components.ClueDeck.init();
    Components.StatModal.init();
    
    // Initialize event handling (must be last)
    EventHandlers.init();
    
    console.log('✅ Game initialized successfully');
    console.log('📊 DOM Cache:', DOMUtils.getCacheStats());
});