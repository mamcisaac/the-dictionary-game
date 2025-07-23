/**
 * Main Entry Point for The Dictionary Game
 * Coordinates initialization and module loading
 */

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 The Dictionary Game - Initializing...');
    
    // Initialize game state
    GameState.initializeScoring();
    GameState.loadWordList();
    
    // Initialize UI components
    Components.GuessCard.init();
    Components.ScoreMeter.init();
    Components.ClueDeck.init();
    Components.StatModal.init();
    
    console.log('✅ Game initialized successfully');
});