/**
 * DOM Utilities Module
 * Centralized DOM element management and caching
 */

const DOMUtils = {
    // Element cache to avoid repeated queries
    _cache: new Map(),

    /**
     * Initialize DOM utilities
     */
    init() {
        this.cacheCommonElements();
        console.log('✅ DOM utilities initialized');
    },

    /**
     * Cache commonly used DOM elements
     */
    cacheCommonElements() {
        const commonSelectors = {
            // Game elements
            guessCard: '#guess-card',
            guessInput: '#guess-input',
            guessButton: '#guess-button',
            clueList: '#clue-list',
            messageDisplay: '#message',
            wordPattern: '#word-pattern',
            
            // Score elements
            currentScore: '#current-score',
            currentScoreBadge: '#current-score-badge',
            progressFill: '#progress-fill',
            clueCounter: '#clue-counter',
            difficultyScore: '#difficulty-score',
            difficultyFill: '#difficulty-fill',
            
            // Control elements
            startGameButton: '#start-game-button',
            giveUpButton: '#give-up-button',
            statsButton: '#stats-button',
            helpButton: '#help-button',
            
            // Modal elements
            statsModal: '#stats-modal',
            helpModal: '#help-modal',
            
            // Timer elements
            timeElapsed: '#time-elapsed',
            guessCount: '#guess-count',
            
            // Clue deck elements
            desktopClueDeck: '#desktop-clue-deck',
            mobileClueDeck: '#mobile-clue-deck',
            
            // Container elements
            inputSection: '.input-section',
            scoreContainer: '#score-container',
            sidebarPlaceholder: '#sidebar-placeholder',
            toastContainer: '#toast-container',
            
            // Game Info Modal elements
            gameInfoModal: '#game-info-modal',
            cluesButton: '#clues-button',
            closeGameInfo: '#close-game-info'
        };

        Object.entries(commonSelectors).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                this._cache.set(key, element);
            }
        });
    },

    /**
     * Get a cached element or query for it
     * @param {string} key - Cache key or CSS selector
     * @returns {HTMLElement|null} The DOM element
     */
    get(key) {
        // Try cache first
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        // If key looks like a selector, query for it
        if (key.includes('#') || key.includes('.') || key.includes('[')) {
            const element = document.querySelector(key);
            if (element) {
                // Cache it for future use
                this._cache.set(key, element);
            }
            return element;
        }

        return null;
    },

    /**
     * Get multiple elements
     * @param {string} selector - CSS selector
     * @returns {NodeList} List of elements
     */
    getAll(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Clear the element cache
     */
    clearCache() {
        this._cache.clear();
    },

    /**
     * Update cached element if it exists
     * @param {string} key - Cache key
     * @param {HTMLElement} element - New element to cache
     */
    updateCache(key, element) {
        if (element) {
            this._cache.set(key, element);
        }
    },

    /**
     * Show an element with display style
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} displayStyle - Display style to use (default: 'block')
     */
    show(elementOrSelector, displayStyle = 'block') {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element) {
            element.style.display = displayStyle;
        }
    },

    /**
     * Hide an element
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     */
    hide(elementOrSelector) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element) {
            element.style.display = 'none';
        }
    },

    /**
     * Toggle element visibility
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} displayStyle - Display style when showing
     */
    toggle(elementOrSelector, displayStyle = 'block') {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element) {
            const isHidden = element.style.display === 'none' || 
                           window.getComputedStyle(element).display === 'none';
            element.style.display = isHidden ? displayStyle : 'none';
        }
    },

    /**
     * Set text content safely
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} text - Text to set
     */
    setText(elementOrSelector, text) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element) {
            element.textContent = text;
        }
    },

    /**
     * Set HTML content safely
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} html - HTML to set
     */
    setHTML(elementOrSelector, html) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element) {
            element.innerHTML = html;
        }
    },

    /**
     * Add class to element
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} className - Class to add
     */
    addClass(elementOrSelector, className) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element && className) {
            element.classList.add(className);
        }
    },

    /**
     * Remove class from element
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} className - Class to remove
     */
    removeClass(elementOrSelector, className) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element && className) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle class on element
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} className - Class to toggle
     */
    toggleClass(elementOrSelector, className) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element && className) {
            element.classList.toggle(className);
        }
    },

    /**
     * Set attribute on element
     * @param {HTMLElement|string} elementOrSelector - Element or selector
     * @param {string} attr - Attribute name
     * @param {string} value - Attribute value
     */
    setAttr(elementOrSelector, attr, value) {
        const element = typeof elementOrSelector === 'string' 
            ? this.get(elementOrSelector) 
            : elementOrSelector;
        
        if (element && attr) {
            element.setAttribute(attr, value);
        }
    },

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this._cache.size,
            keys: Array.from(this._cache.keys())
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
} else {
    window.DOMUtils = DOMUtils;
}