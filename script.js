// Global word list for validation
let validWords = new Set();

// Global game state
let gameStarted = false;

// Global puzzle data
let puzzleData = null;
let puzzleDataList = [];

// Global clue tracking for the menu system
let cluesGivenByType = {
    definitions: 1,      // Start at 1 (primary shown free)
    wordLength: false,   // Has word length been revealed?
    examples: 0,         // Number of examples shown
    synonyms: false,     // Have synonyms been shown?
    antonyms: false,     // Have antonyms been shown?
    lettersRevealed: 1   // Start at 1 (first letter shown)
};

// Global DOM element references for functions used outside DOMContentLoaded
let clueList, messageDisplay, currentScoreElement, progressFill, clueCounter;
let timeElapsedElement, guessCountElement, gameStartTime, gameTimerInterval;

// Global game state variables  
let currentScore = 100;
let cluesUsed = 0;

// New scoring system - initialize later after GameScoring is loaded
let gameScoring;

// Component Library Utilities
const Components = {
    // GuessCard Component
    GuessCard: {
        element: null,
        init() {
            this.element = document.getElementById('guess-card');
        },
        setVariant(variant) {
            this.element?.setAttribute('data-variant', variant);
        },
        animateSuccess() {
            // Add performance optimization class
            this.element?.classList.add('animate-scale');
            
            this.setVariant('success');
            
            // Clean up after animation
            setTimeout(() => {
                this.setVariant('default');
                this.element?.classList.remove('animate-scale');
            }, 150); // Match motion duration
        },
        setLetter(letter) {
            const letterEl = document.getElementById('word-pattern');
            if (letterEl) letterEl.textContent = letter;
        },
        setDefinition(definition) {
            const defEl = document.getElementById('primary-definition');
            if (defEl) defEl.textContent = definition;
        }
    },

    // ClueStripe Component
    ClueStripe: {
        create(icon, content, variant = 'hint-taken', cost = null, clueType = null) {
            const stripe = document.createElement('div');
            stripe.className = 'clue-stripe';
            stripe.setAttribute('data-variant', variant);
            if (clueType) {
                stripe.setAttribute('data-clue-type', clueType);
            }
            
            stripe.innerHTML = `
                <div class="clue-stripe__icon">${icon}</div>
                <div class="clue-stripe__content">${content}</div>
                ${cost ? `<div class="clue-stripe__cost" data-tooltip="${i18n.tooltips.clueCost}">${cost} pts</div>` : ''}
            `;
            
            return stripe;
        }
    },

    // ScoreMeter Component
    ScoreMeter: {
        element: null,
        fillElement: null,
        init() {
            this.element = document.getElementById('clue-meter');
            this.fillElement = document.getElementById('progress-fill');
        },
        setProgress(current, max, animate = true) {
            const percentage = Math.min((current / max) * 100, 100);
            const counter = document.getElementById('clue-counter');
            
            if (this.fillElement) {
                if (animate) {
                    this.fillElement.classList.add('animate-progress');
                }
                
                // Animate the progress bar
                requestAnimationFrame(() => {
                    this.fillElement.style.width = `${percentage}%`;
                });
                
                // Clean up animation class after transition
                if (animate) {
                    setTimeout(() => {
                        this.fillElement?.classList.remove('animate-progress');
                    }, 500); // Match motion duration
                }
            }
            
            if (counter) {
                // Animate counter with number change
                this.animateNumber(counter, parseInt(counter.textContent), current, 300);
                counter.textContent = `${current}/${max}`;
            }
            
            // Set variant based on progress
            const variant = percentage > 75 ? 'danger' : 'default';
            this.element?.setAttribute('data-variant', variant);
        },
        
        animateNumber(element, from, to, duration) {
            const start = performance.now();
            
            const animate = (timestamp) => {
                const progress = Math.min((timestamp - start) / duration, 1);
                const current = Math.floor(from + (to - from) * progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }
    },

    // ClueDeck Component
    ClueDeck: {
        desktopElement: null,
        mobileElement: null,
        init() {
            this.desktopElement = document.getElementById('desktop-clue-deck');
            this.mobileElement = document.getElementById('mobile-clue-deck');
        },
        renderCards() {
            if (!gameStarted || !puzzleData) return;
            
            // Check if dependencies are available
            if (typeof getAvailableClues !== 'function' || !gameScoring) return;
            
            const available = getAvailableClues();
            const dynamicCosts = gameScoring.getAllClueCosts(puzzleData);
            
            const clueTypes = [
                { type: 'definition', name: 'Another Definition', cost: dynamicCosts.definition, icon: '📖', count: available.definitions },
                { type: 'wordLength', name: 'Word Length', cost: dynamicCosts.wordLength, icon: '📏', count: available.wordLength ? 1 : 0 },
                { type: 'example', name: 'Example Sentence', cost: dynamicCosts.example, icon: '📝', count: available.examples },
                { type: 'synonym', name: 'Synonym', cost: dynamicCosts.synonym, icon: '💡', count: available.synonyms },
                { type: 'antonym', name: 'Antonym', cost: dynamicCosts.antonym, icon: '🔄', count: available.antonyms },
                { type: 'letter', name: 'Reveal Letter', cost: dynamicCosts.letter, icon: '🔤', count: available.letters }
            ];
            
            // Create cards HTML
            const cardsHTML = clueTypes.map(clue => {
                const disabled = clue.count === 0 || (typeof currentScore !== 'undefined' && currentScore < clue.cost);
                const costLevel = clue.cost <= 15 ? 'low' : clue.cost <= 30 ? 'medium' : 'high';
                
                return `
                    <button class="clue-card ${disabled ? 'disabled' : ''}" 
                            data-type="${clue.type}"
                            data-cost="${clue.cost}"
                            data-cost-level="${costLevel}"
                            ${disabled ? 'disabled' : ''}
                            role="button"
                            aria-label="Purchase ${clue.name} for ${clue.cost} points"
                            tabindex="${disabled ? '-1' : '0'}">
                        <div class="clue-card-header">
                            <span class="clue-card-icon">${clue.icon}</span>
                            <span class="clue-card-title">${clue.name}</span>
                        </div>
                        <div class="clue-card-subtitle">
                            <span class="clue-card-cost">${clue.cost} pts</span>
                            <span class="clue-card-separator">•</span>
                            <span class="clue-card-remaining">${clue.count} left</span>
                        </div>
                    </button>
                `;
            }).join('');
            
            // Update desktop deck
            if (this.desktopElement) {
                const container = this.desktopElement.querySelector('.clue-cards-container');
                if (container) container.innerHTML = cardsHTML;
            }
            
            // Update mobile deck
            if (this.mobileElement) {
                this.mobileElement.innerHTML = `<div class="clue-cards-container">${cardsHTML}</div>`;
            }
            
            // Add click handlers
            document.querySelectorAll('.clue-card:not(.disabled)').forEach(card => {
                card.addEventListener('click', (e) => {
                    const type = card.dataset.type;
                    const cost = parseInt(card.dataset.cost);
                    this.purchaseClue(type, cost, card);
                });
            });
        },
        purchaseClue(type, cost, cardElement) {
            // Add purchase animation
            cardElement.classList.add('purchasing');
            setTimeout(() => cardElement.classList.remove('purchasing'), 300);
            
            // Purchase the clue
            purchaseClue(type, cost);
            
            // Re-render cards after purchase
            setTimeout(() => this.renderCards(), 100);
        },
        show() {
            if (this.desktopElement) this.desktopElement.style.display = 'block';
            if (this.mobileElement) this.mobileElement.style.display = 'flex';
            this.renderCards();
        },
        hide() {
            if (this.desktopElement) this.desktopElement.style.display = 'none';
            if (this.mobileElement) this.mobileElement.style.display = 'none';
        }
    },

    // Toast Component
    Toast: {
        show(message, variant = 'default', duration = 3000) {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('data-variant', variant);
            toast.innerHTML = `<div class="toast__message">${message}</div>`;
            
            container.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => toast.setAttribute('data-visible', 'true'), 100);
            
            // Auto-hide after duration
            setTimeout(() => {
                toast.setAttribute('data-visible', 'false');
                setTimeout(() => container.removeChild(toast), 300);
            }, duration);
        }
    },

    // StatModal Component
    StatModal: {
        element: null,
        init() {
            this.element = document.getElementById('stats-modal');
        },
        show() {
            this.element?.setAttribute('data-open', 'true');
        },
        hide() {
            this.element?.setAttribute('data-open', 'false');
        }
    },

    // Victory Component
    Victory: {
        confettiLoaded: false,
        
        async triggerVictory(score, word) {
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            // Show confetti if motion is allowed
            if (!prefersReducedMotion) {
                await this.loadConfetti();
                this.showConfetti();
            }
            
            // Show victory toast
            Components.Toast.show(
                `🎉 Victory! You scored ${score} points on "${word}"!`, 
                'success', 
                5000
            );
            
            // Animate the GuessCard
            Components.GuessCard.animateSuccess();
            
            // Show stats modal with victory focus
            setTimeout(() => {
                Components.StatModal.show();
            }, 1000);
        },
        
        async loadConfetti() {
            if (this.confettiLoaded) return;
            
            try {
                // Lazy load confetti library
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
                document.head.appendChild(script);
                
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
                
                this.confettiLoaded = true;
            } catch (error) {
                console.log('Failed to load confetti:', error);
            }
        },
        
        showConfetti() {
            if (typeof confetti === 'undefined') return;
            
            // Fire confetti from multiple points
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            
            const randomInRange = (min, max) => Math.random() * (max - min) + min;
            
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }
                
                const particleCount = 50 * (timeLeft / duration);
                
                // Fire from left side
                confetti({
                    particleCount,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#0F766E', '#12A174', '#D97706', '#F9FAFB']
                });
                
                // Fire from right side
                confetti({
                    particleCount,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#0F766E', '#12A174', '#D97706', '#F9FAFB']
                });
            }, 250);
        }
    },

    // Motion utilities
    Motion: {
        // Check if user prefers reduced motion
        prefersReducedMotion() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },
        
        // Respect motion preferences for animations
        animate(element, animation, options = {}) {
            if (this.prefersReducedMotion()) {
                // Skip animation, just apply final state
                if (options.onComplete) options.onComplete();
                return;
            }
            
            // Apply animation normally
            element.style.animation = animation;
            
            if (options.onComplete) {
                element.addEventListener('animationend', options.onComplete, { once: true });
            }
        }
    }
};

// Global game statistics
let gameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    bestScore: 0,
    currentStreak: 0,
    bestStreak: 0
};

// Initialize scoring system
gameScoring = new GameScoring();

// Load word dictionary from Cornerstone (JSON is faster than text parsing)
async function loadWordList() {
    try {
        const response = await fetch('../Cornerstone/words_dictionary.json');
        if (!response.ok) {
            console.warn('Word dictionary not found in Cornerstone, word validation disabled');
            validWords = null;
            return;
        }
        const wordsDict = await response.json();
        validWords = new Set(Object.keys(wordsDict).map(word => word.toLowerCase()));
        console.log(`Loaded ${validWords.size} valid words from Cornerstone dictionary`);
    } catch (error) {
        console.warn('Error loading word dictionary from Cornerstone:', error);
        // Fallback: accept any word if we can't load the list
        validWords = null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    clueList = document.getElementById("clue-list");
    const guessInput = document.getElementById("guess-input");
    const guessButton = document.getElementById("guess-button");
    // Clue button removed - using inline clue deck instead
    const giveUpButton = document.getElementById("give-up-button");
    const startGameButton = document.getElementById("start-game-button");
    const inputContainer = document.querySelector(".input-section");
		messageDisplay = document.getElementById("message");
    const myword = document.getElementById("my-word");
    const scoreContainer = document.getElementById("score-container");
    currentScoreElement = document.getElementById("current-score");
    const wordPatternElement = document.getElementById("word-pattern");
    const statsButton = document.getElementById("stats-button");
    const statsModal = document.getElementById("stats-modal");
    const closeModal = document.querySelector(".close");
    const resetStatsButton = document.getElementById("reset-stats");
    const helpButton = document.getElementById("help-button");
    const helpModal = document.getElementById("help-modal");
    const closeHelpModal = document.querySelector(".close-help");
    progressFill = document.getElementById("progress-fill");
    clueCounter = document.getElementById("clue-counter");
    const guessCostPreview = document.getElementById("guess-cost-preview");
    const emptyState = document.getElementById("empty-state");
    const emptyStateNewGameBtn = document.getElementById("empty-state-new-game");
    const introText = document.getElementById("intro-text");
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    
    // New sidebar elements
    const detailsToggle = document.getElementById("details-toggle");
    const detailsSection = document.getElementById("details-section");
    guessCountElement = document.getElementById("guess-count");
    timeElapsedElement = document.getElementById("time-elapsed");
    
    // Details toggle functionality
    if (detailsToggle) {
        detailsToggle.addEventListener('click', () => {
            const isExpanded = detailsToggle.getAttribute('aria-expanded') === 'true';
            detailsToggle.setAttribute('aria-expanded', !isExpanded);
            detailsSection.style.display = isExpanded ? 'none' : 'block';
        });
    }
    
    // Keyboard navigation setup
    setupKeyboardNavigation();
    
    // Initialize Components
    Components.GuessCard.init();
    Components.ScoreMeter.init();
    Components.ClueDeck.init();
    Components.StatModal.init();
    
    // Load word list on startup
    loadWordList();
    
    // Track number of guesses made
    let guessCount = 0;
    
    // Track guessed words to prevent duplicates
    let guessedWords = new Set();
    
    // Function to update clue display using ClueStripe component
    function updateClueDisplay(newClue, clueType = null) {
        // Parse clue to get icon and content
        const iconMap = {
            '📖': 'definition',
            '📏': 'wordLength',
            '📝': 'example',
            '💡': 'synonym',
            '🔄': 'antonym',
            '🔤': 'letter'
        };
        
        let icon = '💡';
        let detectedType = clueType;
        
        for (const [emoji, type] of Object.entries(iconMap)) {
            if (newClue.includes(emoji)) {
                icon = emoji;
                if (!detectedType) detectedType = type;
                break;
            }
        }
        
        // Remove icon from content
        const content = newClue.replace(/^[📖📏📝💡🔄🔤]\s*/, '');
        
        const clueStripe = Components.ClueStripe.create(icon, content, 'hint-taken', null, detectedType);
        clueList.appendChild(clueStripe);
    }
    
    
    // Update button text and cost previews with current costs
    function updateButtonCosts() {
        if (!gameStarted || !puzzleData) {
            guessCostPreview.style.display = "none";
            return;
        }
        
        // Update clue deck to reflect available clues
        Components.ClueDeck.renderCards();
        
        // Update guess button cost (first guess free, then flat 3 points)
        if (!guessButton.disabled) {
            guessButton.textContent = "Guess";
            if (guessCount === 0) {
                guessCostPreview.textContent = "🆓 First guess free!";
                guessCostPreview.className = "cost-preview free";
            } else {
                guessCostPreview.textContent = "💰 -3 points";
                guessCostPreview.className = "cost-preview";
            }
            guessCostPreview.style.display = "block";
        } else {
            guessCostPreview.style.display = "none";
        }
    }
    
    // Standardized to exactly 7 paid clues for all words (2 are given free at start)
    
    
    // Update progress bar with dynamic limits
    
    // Update word pattern display based on current clues
    function updateWordPatternDisplay() {
        if (!puzzleData) return;
        
        // Always show revealed letters
        const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
        const revealedWithSpacing = revealedPart.split('').join(' ');
        
        // Show full pattern if word length has been revealed
        if (cluesGivenByType.wordLength) {
            const hiddenLetters = '_ '.repeat(puzzleData.word.length - lettersRevealed).trim();
            const pattern = revealedWithSpacing + (hiddenLetters ? ' ' + hiddenLetters : '');
            wordPatternElement.innerHTML = pattern;
        } else {
            // Show only revealed letters
            wordPatternElement.innerHTML = revealedWithSpacing;
        }
        
        // Always show the element
        wordPatternElement.style.display = 'block';
    }
    
    // Load stats from localStorage
    function loadStats() {
        const savedStats = localStorage.getItem('dictionaryGameStats');
        if (savedStats) {
            gameStats = JSON.parse(savedStats);
        }
    }
    
    // Save stats to localStorage
    function saveStats() {
        localStorage.setItem('dictionaryGameStats', JSON.stringify(gameStats));
    }
    
    // Update stats display
    function updateStatsDisplay() {
        document.getElementById('games-played').textContent = gameStats.gamesPlayed;
        document.getElementById('games-won').textContent = gameStats.gamesWon;
        const winRate = gameStats.gamesPlayed > 0 ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) : 0;
        document.getElementById('win-rate').textContent = winRate + '%';
        const avgScore = gameStats.gamesWon > 0 ? Math.round(gameStats.totalScore / gameStats.gamesWon) : 0;
        document.getElementById('avg-score').textContent = avgScore;
        document.getElementById('best-score').textContent = gameStats.bestScore;
        document.getElementById('current-streak').textContent = gameStats.currentStreak;
        document.getElementById('best-streak').textContent = gameStats.bestStreak;
        
        // Generate heat-map calendar when stats modal is updated
        generateHeatMapCalendar();
    }
    
    // Record game result
    function recordGameResult(won, score = 0) {
        gameStats.gamesPlayed++;
        if (won) {
            gameStats.gamesWon++;
            gameStats.totalScore += score;
            gameStats.currentStreak++;
            if (gameStats.currentStreak > gameStats.bestStreak) {
                gameStats.bestStreak = gameStats.currentStreak;
            }
            if (score > gameStats.bestScore) {
                gameStats.bestScore = score;
            }
        } else {
            gameStats.currentStreak = 0;
        }
        saveStats();
        updateStatsDisplay();
        
        // Enable stats button after first game
        if (gameStats.gamesPlayed === 1) {
            statsButton.disabled = false;
            statsButton.setAttribute('aria-disabled', 'false');
        }
    }
    

    // Event listener for pressing 'Enter' in the guess input
    guessInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && gameStarted) {
            event.preventDefault(); // Avoid form submission or other default actions
            handleGuess();
        }
    });

		let lettersRevealed = 1; 
    let currentClueIndex = 0;
    let cluesGiven = [];

    // Initially hide the input container until the game starts
    inputContainer.style.display = "none";

    // Store the full puzzle list for Phase 1 features
    let currentPuzzleIndex = -1;

    async function fetchPuzzle(specificIndex = null) {
        const response = await fetch("puzzle.json");
        puzzleDataList = await response.json();
        
        if (specificIndex !== null && specificIndex >= 0 && specificIndex < puzzleDataList.length) {
            currentPuzzleIndex = specificIndex;
        } else {
            currentPuzzleIndex = Math.floor(Math.random() * puzzleDataList.length);
        }

        puzzleData = puzzleDataList[currentPuzzleIndex];
    }

function getNextClue() {
    cluesUsed++;
    
    // Fixed scoring: 7 paid clues, each costs 5 points
    const availableClues = calculateAvailableClues();
    const adjustedPenalty = 5; // 5 points per clue
    
    // Prevent score from going below 1 from clues alone (preserve ability to guess)
    currentScore = Math.max(1, currentScore - adjustedPenalty);
    currentScoreElement.textContent = currentScore;
    updateScoreBadge();
    updateProgressBar();
    
    // Update button costs
    updateButtonCosts();
    
    // Update button costs after using a clue
    updateButtonCosts();
    
    // Build a queue of 7 paid clues (2 were given free at start)
    const clueQueue = [];
    
    // Intelligent clue distribution based on word content
    const wordLength = puzzleData.word.length;
    
    // Add available definitions (up to 2 additional ones)
    const maxDefinitions = Math.min(puzzleData.definitions.length - 1, 2);
    
    // Add all available definitions (after the primary one shown at start)
    for (let i = 1; i <= maxDefinitions && i < puzzleData.definitions.length; i++) {
        clueQueue.push({
            type: 'definition',
            content: `Definition ${i + 1}: ${puzzleData.definitions[i]}`,
            index: i,
            priority: 8
        });
    }
    
    // Add synonyms/antonyms strategically - earlier for easier words, later for harder words
    if (puzzleData.synonyms && puzzleData.synonyms.length > 0 && !cluesGiven.includes('synonyms')) {
        clueQueue.push({
            type: 'synonyms',
            content: `💡 Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`,
            marker: 'synonyms',
            priority: 6
        });
    }
    if (puzzleData.antonyms && puzzleData.antonyms.length > 0 && !cluesGiven.includes('antonyms')) {
        clueQueue.push({
            type: 'antonyms',
            content: `🔄 Antonyms: ${puzzleData.antonyms.slice(0, 3).join(', ')}`,
            marker: 'antonyms',
            priority: 5
        });
    }
    
    // Add examples
    const numExamples = Math.min(2, puzzleData.examples.length);
    for (let i = 0; i < numExamples; i++) {
        clueQueue.push({
            type: 'example',
            content: i === 0 ? `📝 Sample sentence: ${puzzleData.examples[i]}` : `📝 Example ${i + 1}: ${puzzleData.examples[i]}`,
            index: i,
            priority: 7 // Medium priority
        });
    }
    
    // Calculate how many letter reveals we can do (max 40% of word length)
    const maxLetterReveals = Math.min(puzzleData.word.length - 1, Math.floor(puzzleData.word.length * 0.4));
    
    // If we have fewer letter reveals available, add extra content to fill clue slots
    const targetLetterReveals = Math.min(3, maxLetterReveals); // Still aim for up to 3 if possible
    if (maxLetterReveals < 3) {
        const extraCluesNeeded = 3 - maxLetterReveals;
        
        // Try to add extra examples first
        for (let i = 2; i < puzzleData.examples.length && clueQueue.length < 7 - maxLetterReveals; i++) {
            clueQueue.push({
                type: 'example',
                content: `Example ${i + 1}: ${puzzleData.examples[i]}`,
                index: i
            });
        }
        
        // If still need more, add any remaining definitions
        for (let i = 4; i < puzzleData.definitions.length && clueQueue.length < 7 - maxLetterReveals; i++) {
            clueQueue.push({
                type: 'definition',
                content: `Additional definition: ${puzzleData.definitions[i]}`,
                index: i
            });
        }
        
        // Last resort: add synonyms/antonyms if not already added
        if (clueQueue.length < 7 - maxLetterReveals && puzzleData.synonyms && puzzleData.synonyms.length > 0 && !clueQueue.some(c => c.type === 'synonyms')) {
            clueQueue.push({
                type: 'synonyms',
                content: `Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`,
                marker: 'synonyms'
            });
        }
    }
    
    // Add letter reveals with strategic priority - later for easy words, earlier for hard words
    for (let i = 0; i < maxLetterReveals; i++) {
        clueQueue.push({
            type: 'letter',
            letterCount: i + 2, // Starting from 2 since first letter is shown
            priority: 4
        });
    }
    
    // Sort clue queue by priority (highest first) for optimal clue ordering
    clueQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Ensure we have exactly 7 paid clues
    while (clueQueue.length < 7) {
        // Fill remaining slots with any available content
        if (currentClueIndex < puzzleData.definitions.length) {
            clueQueue.push({
                type: 'definition',
                content: `Extra definition: ${puzzleData.definitions[currentClueIndex]}`,
                index: currentClueIndex
            });
            currentClueIndex++;
        } else {
            clueQueue.push({
                type: 'none',
                content: 'No additional clue available for this word.'
            });
        }
    }
    
    // Get the current clue from our queue
    const currentClue = clueQueue[cluesUsed - 1];
    
    if (currentClue.type === 'letter') {
        lettersRevealed = currentClue.letterCount;
        cluesGiven.push(`letters${lettersRevealed}`);
        updateWordPatternDisplay();
        const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
        return `The word starts with: ${revealedPart}`;
    } else {
        if (currentClue.marker) {
            cluesGiven.push(currentClue.marker);
        }
        if (currentClue.type === 'definition' && currentClue.index !== undefined) {
            currentClueIndex = Math.max(currentClueIndex, currentClue.index + 1);
        }
        return currentClue.content;
    }
}


function startGame() {
    // If a game is already in progress, treat as giving up
    if (gameStarted) {
        recordGameResult(false); // Record as a loss
        updateClueDisplay(formatString(i18n.messages.gaveUp, { word: puzzleData.word }));
    }
    
    // Hide empty state and show game UI
    if (emptyState) emptyState.style.display = "none";
    if (introText) introText.style.display = "block";
    if (sidebarPlaceholder) sidebarPlaceholder.style.display = "none";
    
    // Show clue deck
    Components.ClueDeck.show();
    
    // Enable buttons
    giveUpButton.disabled = false;
    giveUpButton.setAttribute('aria-disabled', 'false');
    statsButton.disabled = false;
    statsButton.setAttribute('aria-disabled', 'false');
    
    gameStarted = true;
    guessButton.disabled = false; 
		
    // Reset game state
    cluesUsed = 0;
    guessCount = 0; // Reset guess counter
    guessedWords.clear(); // Reset guessed words
    scoreContainer.style.display = "block";
    
    // Reset clue tracking for new menu system
    cluesGivenByType = {
        definitions: 1,      // Primary definition shown free
        wordLength: false,
        examples: 0,
        synonyms: false,
        antonyms: false,
        lettersRevealed: 1   // First letter shown free
    };
    
    // Clear all previous game UI elements immediately
    clueList.innerHTML = ''; // Clear the list for a new game
    document.getElementById("message").innerHTML = ''; // Clear any previous messages
    guessInput.value = ''; // Clear guess input
    inputContainer.style.display = "block"; // Show the input container
    myword.style.display = "block"; // Show the input container
    fetchPuzzle().then(() => {
        // Initialize new scoring system
        gameScoring.initializeGame(puzzleData);
        currentScore = gameScoring.getCurrentScore();
        
        // Update all score displays immediately
        currentScoreElement.textContent = currentScore;
        updateScoreBadge();
        
        // Display the primary definition as a ClueStripe
        const definition = puzzleData.definitions[0]; // Get the primary definition of the word
        clueList.innerHTML = ''; // Clear previous clues
        const definitionStripe = Components.ClueStripe.create('📖', `Definition: ${definition}`, 'hint-taken', null, 'definition');
        clueList.appendChild(definitionStripe);
        
        
        // Initialize word pattern display
        updateWordPatternDisplay();

    // Reset game state variables
    currentClueIndex = 1; // Start from the second definition for the next clue
    lettersRevealed = 1;
    cluesGiven = []; // Reset clues given
    
    // Update progress bar after puzzle is loaded
    updateProgressBar();
    
    // Update unopened clues count
    updateUnopenedCluesCount();
    
    // Initialize button costs
    updateButtonCosts();
    
    // Update difficulty display
    updateDifficultyIndicator();
    
    // Update clue deck
    Components.ClueDeck.renderCards();
    
    // Start game timer and reset guess count display
    startGameTimer();
    updateGuessCount();

    });
}
    
			
// Function to calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function handleGuess() {
    if (!gameStarted) return;
    const guess = guessInput.value.trim().toLowerCase();
    const targetWord = puzzleData.word.toLowerCase();
    
    // Check if guess is empty or single character
    if (!guess) {
        // Shake input and show toast
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 500);
        Components.Toast.show("Please type a word.", 'error');
        return;
    }
    
    // Block single character guesses
    if (guess.length === 1) {
        messageDisplay.innerHTML = "Please enter a word (not a single letter).";
        messageDisplay.style.color = "#e07a5f";
        return;
    }
    
    // Validate guess: must start with correct letter
    const firstLetter = puzzleData.word[0].toLowerCase();
    if (guess[0] !== firstLetter) {
        messageDisplay.innerHTML = `Your guess must start with the letter '${firstLetter.toUpperCase()}'!`;
        messageDisplay.style.color = "#e07a5f";
        guessInput.value = ''; // Clear invalid input
        return;
    }
    
    // Validate guess: must be a real English word (if word list loaded)
    if (validWords && validWords.size > 0 && !validWords.has(guess)) {
        Components.Toast.show("Not in dictionary.", 'error');
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 500);
        return;
    }
    
    // Check for duplicate guess
    if (guessedWords.has(guess)) {
        messageDisplay.innerHTML = `You already guessed "${guess}"! Try a different word.`;
        messageDisplay.style.color = "#f4a261"; // Orange color for warning
        return;
    }
    
    // Add guess to set of guessed words
    guessedWords.add(guess);
    
    // Charge for guess (first guess is free, then flat 3 points)
    guessCount++;
    updateGuessCount(); // Update guess count display
    // Use new scoring system for guess processing
    const guessResult = gameScoring.makeGuess(guess === puzzleData.word.toLowerCase());
    currentScore = gameScoring.getCurrentScore();
    currentScoreElement.textContent = currentScore;
    updateScoreBadge();
    
    console.log(`Guess ${guessResult.guessNumber}: Bonus=${guessResult.bonus}, Penalty=${guessResult.penalty}, Score=${currentScore}`);
    
    if (guess === targetWord) {
        // Reveal the complete word in the pattern display
        wordPatternElement.innerHTML = puzzleData.word.toUpperCase().split('').join(' ');
        
        // Get detailed score breakdown for victory display
        const scoreBreakdown = gameScoring.getScoreBreakdown();
        const finalScore = scoreBreakdown.finalScore;
        
        messageDisplay.innerHTML = `Congratulations! The word was: ${puzzleData.word}. You scored ${finalScore}/1000 points!`;
        messageDisplay.style.color = "var(--dg-accent)"; // Success color
        
        // Show detailed breakdown in console for now
        console.log('Score Breakdown:', scoreBreakdown);
        
        // Trigger victory celebration
        Components.Victory.triggerVictory(finalScore, puzzleData.word);
        
        recordGameResult(true, finalScore); // Record win with normalized score
        gameStarted = false; // Indicate the game has ended
        guessButton.disabled = true; // Disable the Guess button
        guessButton.textContent = "Guess"; // Reset button text
        // Clue deck will update automatically
        giveUpButton.disabled = true; // Disable the Give Up button
        stopGameTimer(); // Stop the game timer
    } else {
        // Wrong guess - no additional penalty since guess already cost points
        
        // Calculate similarity for better feedback
        const similarity = calculateSimilarity(guess, targetWord);
        let feedback = "Not quite. Try again!";
        
        // Provide enhanced, specific feedback for all word guesses
        if (similarity > 0.8) {
            feedback = "🎯 Extremely close! You're on the right track!";
        } else if (similarity > 0.6) {
            feedback = "🔥 Very close! You're almost there!";
        } else if (similarity > 0.4 && guessCount > 1) {
            feedback = "🌡️ Getting warmer! Keep trying!";
        } else if (guess.length !== targetWord.length) {
            if (guess.length < targetWord.length) {
                feedback = `📏 Try a longer word`;
            } else {
                feedback = `📏 Try a shorter word`;
            }
        } else if (!guess.startsWith(puzzleData.word.substring(0, lettersRevealed).toLowerCase())) {
            feedback = `🎯 Your guess should start with "${puzzleData.word.substring(0, lettersRevealed).toUpperCase()}"`;
        } else if (guess.length === targetWord.length && similarity < 0.3) {
            feedback = "🤔 Right length, but very different word. Review the definition and try a different approach!";
        } else {
            const encouragement = guessCount <= 2 ? "You've got this!" : guessCount <= 4 ? "Don't give up!" : "Think about the definition!";
            feedback = `💭 Not quite right. ${encouragement}`;
        }
        
        // Don't show penalty in feedback - it's shown in buttons
        messageDisplay.innerHTML = feedback;
        messageDisplay.style.color = "#e07a5f"; // Error color
        
        // Update button costs after wrong guess
        updateButtonCosts();

    }
    
    // Animation for feedback message
    messageDisplay.style.transform = "scale(1.1)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);

    guessInput.value = ""; // Clear the guess input field
}

guessButton.addEventListener("click", handleGuess);

// Remove old clue button listener since we have inline deck now

// Close clue menu when clicking outside
document.addEventListener("click", (event) => {
    // No longer needed - clue deck is always visible
});

giveUpButton.addEventListener("click", () => {
    if (gameStarted) {
        // Show confirmation dialog
        const confirmGiveUp = confirm("Are you sure you want to reveal the answer? This will end the game with 0 points.");
        
        if (confirmGiveUp) {
            updateClueDisplay(`The word was: ${puzzleData.word}`);
            recordGameResult(false); // Record loss
            guessButton.disabled = true; // Optionally disable the Guess button
            // Clue deck will update automatically
            giveUpButton.disabled = true; 
            gameStarted = false; // Indicate the game has ended
            stopGameTimer(); // Stop the game timer
            
            // Set score to 0 for giving up
            currentScore = 0;
            currentScoreElement.textContent = currentScore;
            updateScoreBadge();
        }
    }
});

startGameButton.addEventListener("click", startGame);

// Empty state New Game button
if (emptyStateNewGameBtn) {
    emptyStateNewGameBtn.addEventListener("click", startGame);
}

// Make help icon in empty state clickable
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("help-icon")) {
        helpModal.style.display = "block";
        document.querySelector('.modal-content').focus();
    }
});

// Stats modal event listeners
statsButton.addEventListener("click", () => {
    updateStatsDisplay();
    Components.StatModal.show();
});

closeModal.addEventListener("click", () => {
    Components.StatModal.hide();
});

window.addEventListener("click", (event) => {
    if (event.target === statsModal) {
        Components.StatModal.hide();
    }
});


resetStatsButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
        gameStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        saveStats();
        updateStatsDisplay();
    }
});

// Help modal event listeners
helpButton.addEventListener("click", () => {
    helpModal.style.display = "block";
});

closeHelpModal.addEventListener("click", () => {
    helpModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === helpModal) {
        helpModal.style.display = "none";
    }
});

// Load stats on page load
loadStats();
updateStatsDisplay();

// Enable stats button if games have been played
if (gameStats.gamesPlayed > 0) {
    statsButton.disabled = false;
    statsButton.setAttribute('aria-disabled', 'false');
}

// Initialize clue count display
updateUnopenedCluesCount();

// Purchase and reveal a specific clue type
function purchaseClue(type, cost) {
    // Use new scoring system
    const clueResult = gameScoring.purchaseClue(type, puzzleData);
    currentScore = gameScoring.getCurrentScore();
    
    currentScoreElement.textContent = currentScore;
    updateScoreBadge();
    cluesUsed++; // Increment total clues counter
    updateProgressBar();
    
    console.log(`Purchased ${type} clue: Cost=${clueResult.cost}, Remaining entropy=${clueResult.remainingEntropy.toFixed(2)} bits`);
    
    // Get and display the clue
    const clueContent = getClueContent(type);
    if (clueContent) {
        updateClueDisplay(clueContent, type);
        
        // Update button states
        updateButtonCosts();
        
        // Clue deck will update automatically to show disabled state
    }
    
    // Update clue deck after purchase
    Components.ClueDeck.renderCards();
}

// Get the actual clue content based on type
function getClueContent(type) {
    let content = '';
    
    switch(type) {
        case 'definition':
            if (cluesGivenByType.definitions < puzzleData.definitions.length) {
                const defIndex = cluesGivenByType.definitions;
                content = `📖 Definition ${defIndex + 1}: ${puzzleData.definitions[defIndex]}`;
                cluesGivenByType.definitions++;
            }
            break;
            
        case 'wordLength':
            if (!cluesGivenByType.wordLength) {
                // Show full word pattern
                cluesGivenByType.wordLength = true;
                updateWordPatternDisplay();
                content = `📏 The word has ${puzzleData.word.length} letters`;
            }
            break;
            
        case 'example':
            if (cluesGivenByType.examples < puzzleData.examples.length) {
                const exIndex = cluesGivenByType.examples;
                content = `📝 Example: ${puzzleData.examples[exIndex]}`;
                cluesGivenByType.examples++;
            }
            break;
            
        case 'synonyms':
            if (!cluesGivenByType.synonyms && puzzleData.synonyms && puzzleData.synonyms.length > 0) {
                content = `💡 Synonyms: ${puzzleData.synonyms.slice(0, 4).join(', ')}`;
                cluesGivenByType.synonyms = true;
            }
            break;
            
        case 'antonyms':
            if (!cluesGivenByType.antonyms && puzzleData.antonyms && puzzleData.antonyms.length > 0) {
                content = `🔄 Antonyms: ${puzzleData.antonyms.slice(0, 3).join(', ')}`;
                cluesGivenByType.antonyms = true;
            }
            break;
            
        case 'letter':
            if (cluesGivenByType.lettersRevealed < puzzleData.word.length) {
                cluesGivenByType.lettersRevealed++;
                lettersRevealed = cluesGivenByType.lettersRevealed;
                updateWordPatternDisplay();
                const revealedPart = puzzleData.word.substring(0, lettersRevealed).toUpperCase();
                content = `🔤 The word starts with: ${revealedPart}`;
            }
            break;
    }
    
    return content;
}

// Function removed - using inline ClueDeck component instead

// Check if player can afford a clue
function canAffordClue(cost) {
    return currentScore >= cost; // New scoring system allows going to 0
}

});

// Global function for calculating total available clues
function calculateAvailableClues() {
    if (!puzzleData) return 0;
    const available = getAvailableClues();
    return Object.values(available).reduce((sum, count) => sum + count, 0);
}

// Global function for updating progress bar with animation
function updateProgressBar() {
    const availableClues = calculateAvailableClues();
    
    // Use the animated ScoreMeter component
    Components.ScoreMeter.setProgress(cluesUsed, availableClues, true);
    
    // Update unopened clues count
    updateUnopenedCluesCount();
}

// Update the count of remaining unopened clues
function updateUnopenedCluesCount() {
    const available = getAvailableClues();
    const totalRemaining = Object.values(available).reduce((sum, count) => sum + count, 0);
    
    const cluesRemainingElement = document.getElementById('clues-remaining-count');
    if (cluesRemainingElement) {
        cluesRemainingElement.textContent = totalRemaining;
    }
}

// Update difficulty indicator display
function updateDifficultyIndicator() {
    if (!gameScoring || !puzzleData) return;
    
    const breakdown = gameScoring.getScoreBreakdown();
    const difficultyElement = document.getElementById('difficulty-score');
    const difficultyFill = document.getElementById('difficulty-fill');
    const difficultySection = document.querySelector('.difficulty-section');
    
    if (difficultyElement && difficultyFill && difficultySection) {
        const difficulty = breakdown.difficulty;
        const percentage = Math.round(difficulty * 100);
        
        difficultyElement.textContent = difficulty.toFixed(2);
        difficultyFill.style.width = `${percentage}%`;
        difficultySection.style.display = 'block';
    }
}

// Update game timer display
function updateGameTimer() {
    if (!gameStartTime || !timeElapsedElement) return;
    
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timeElapsedElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Start game timer
function startGameTimer() {
    gameStartTime = Date.now();
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(updateGameTimer, 1000);
    updateGameTimer();
}

// Stop game timer
function stopGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

// Update guess count display
function updateGuessCount() {
    if (guessCountElement) {
        guessCountElement.textContent = guessCount;
    }
}

// ========================
// PHASE 1 INITIALIZATION
// ========================


function addClueWithAnimation(clue) {
    const clueItem = document.createElement("li");
    clueItem.textContent = clue;
    clueItem.style.opacity = "0";
    clueList.appendChild(clueItem);
    setTimeout(() => {
        clueItem.style.opacity = "1";
    }, 100);
}

// ========================
// NEW CLUE MENU SYSTEM
// ========================

// Calculate available clues for current word
function getAvailableClues() {
    if (!puzzleData) return {
        definitions: 0,
        wordLength: 0,
        examples: 0,
        synonyms: 0,
        antonyms: 0,
        letters: 0
    };
    
    const available = {
        definitions: Math.max(0, puzzleData.definitions.length - cluesGivenByType.definitions),
        wordLength: !cluesGivenByType.wordLength ? 1 : 0,
        examples: Math.max(0, puzzleData.examples.length - cluesGivenByType.examples),
        synonyms: (puzzleData.synonyms && puzzleData.synonyms.length > 0 && !cluesGivenByType.synonyms) ? 1 : 0,
        antonyms: (puzzleData.antonyms && puzzleData.antonyms.length > 0 && !cluesGivenByType.antonyms) ? 1 : 0,
        letters: Math.max(0, puzzleData.word.length - cluesGivenByType.lettersRevealed)
    };
    
    return available;
}

function displayMessageWithAnimation(message, isSuccess) {
    messageDisplay.style.color = isSuccess ? "var(--dg-accent)" : "var(--dg-error)";
    messageDisplay.textContent = message;
    
    // Use motion system for animation
    Components.Motion.animate(messageDisplay, 'scalePulse 150ms ease-out', {
        onComplete: () => {
            messageDisplay.style.animation = '';
        }
    });
    
    // Also show as toast for better UX
    const variant = isSuccess ? 'success' : 'error';
    Components.Toast.show(message, variant, 3000);
}

// ========================
// PHASE 1 FEATURES
// ========================

// Generate deterministic word for date
function getDailyWord(dateString) {
    // Use date as seed for consistent word selection
    const seed = dateString.split('-').join('');
    const hash = seed.split('').reduce((a, b) => (a * 31 + b.charCodeAt(0)) % 1000, 0);
    // Make sure puzzleDataList is loaded
    if (!puzzleDataList || puzzleDataList.length === 0) {
        console.error("Puzzle data not loaded yet!");
        return 0; // Fallback to first puzzle
    }
    return hash % puzzleDataList.length;
}

// ========================
// GAME INTEGRATION FUNCTIONS
// ========================

function startGameWithSpecificWord(wordIndex) {
    currentPuzzleIndex = wordIndex;
    puzzleData = puzzleDataList[wordIndex];
    
    // Hide empty state and show game UI
    if (emptyState) emptyState.style.display = "none";
    if (introText) introText.style.display = "block";
    if (sidebarPlaceholder) sidebarPlaceholder.style.display = "none";
    
    // Show clue deck
    Components.ClueDeck.show();
    
    // Enable buttons
    giveUpButton.disabled = false;
    giveUpButton.setAttribute('aria-disabled', 'false');
    statsButton.disabled = false;
    statsButton.setAttribute('aria-disabled', 'false');
    
    // Initialize new scoring system
    gameScoring.initializeGame(puzzleData);
    
    // Reset game state
    cluesGiven = [];
    currentScore = gameScoring.getCurrentScore();
    cluesUsed = 0;
    guessCount = 0;
    guessedWords.clear(); // Reset guessed words
    
    // Update all score displays immediately
    currentScoreElement.textContent = currentScore;
    updateScoreBadge();
    gameStarted = true;
    // Game start time tracking removed
    
    // Update display
    updateProgressBar();
    updateButtonCosts();
    updateUnopenedCluesCount();
    updateDifficultyIndicator();
    Components.ClueDeck.renderCards();
    
    // Start game timer and reset guess count display
    startGameTimer();
    updateGuessCount();
    
    // Show initial clues
    myword.style.display = "block";
    wordPatternElement.textContent = puzzleData.word[0].toUpperCase() + " _ ".repeat(puzzleData.word.length - 1);
    
    // Display the primary definition as a ClueStripe
    clueList.innerHTML = ''; // Clear previous clues
    const definitionStripe = Components.ClueStripe.create('📖', `Definition: ${puzzleData.definitions[0]}`, 'hint-taken', null, 'definition');
    clueList.appendChild(definitionStripe);
    
    // Update UI state
    startGameButton.textContent = "New Game";
    inputContainer.style.display = "block";
    scoreContainer.style.display = "block";
    guessInput.focus();
    
    // Clear previous messages
    messageDisplay.textContent = "";
    clueList.innerHTML = "";
    
    console.log(`Started game with word: ${puzzleData.word}`);
}

// Heat-map Calendar Generation
function generateHeatMapCalendar() {
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
}

// Update score badge in real-time with animation
function updateScoreBadge() {
    const scoreBadge = document.getElementById('current-score-badge');
    if (scoreBadge) {
        scoreBadge.textContent = currentScore;
    }
    
    // Animate main score number
    const scoreNumber = document.getElementById('current-score');
    if (scoreNumber) {
        scoreNumber.classList.add('updating');
        setTimeout(() => scoreNumber.classList.remove('updating'), 300);
    }
}

// Keyboard Navigation Setup
function setupKeyboardNavigation() {
    // Escape key handling for closing popovers and modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Close clue shop if open
            const clueShop = document.getElementById('clue-shop');
            // No longer needed - clue deck is always visible
            
            // Close stats modal if open
            const statsModal = document.getElementById('stats-modal');
            if (statsModal && statsModal.getAttribute('data-open') === 'true') {
                Components.StatModal.hide();
                event.preventDefault();
            }
            
            // Close help modal if open
            const helpModal = document.getElementById('help-modal');
            if (helpModal && helpModal.style.display !== 'none') {
                helpModal.style.display = 'none';
                event.preventDefault();
            }
        }
    });
    
    // Tab order management for clue shop
    const clueShopElement = document.getElementById('clue-shop');
    if (clueShopElement) {
        clueShopElement.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                const focusableElements = clueShopElement.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
}

// Update score badge in real-time
function updateScoreBadge() {
    const scoreBadge = document.getElementById('current-score-badge');
    if (scoreBadge) {
        scoreBadge.textContent = currentScore;
    }
}

// Periodic score update to handle time decay
function startScoreUpdateTimer() {
    setInterval(() => {
        if (gameStarted && gameScoring) {
            const newScore = gameScoring.getCurrentScore();
            if (newScore !== currentScore) {
                currentScore = newScore;
                currentScoreElement.textContent = currentScore;
                updateScoreBadge();
            }
        }
    }, 5000); // Update every 5 seconds
}

// Start the score update timer
startScoreUpdateTimer();

console.log("Game loaded successfully");
