/**
 * UI Component Library for The Dictionary Game
 * Contains reusable UI components with accessibility and animation support
 */

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
            
            // Ensure elements are initialized
            if (!this.mobileElement) {
                this.mobileElement = document.getElementById('mobile-clue-deck');
            }
            if (!this.desktopElement) {
                this.desktopElement = document.getElementById('desktop-clue-deck');
            }
            
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
                            aria-label="${disabled ? clue.name + ' unavailable' : 'Purchase ' + clue.name + ' for ' + clue.cost + ' points'}"
                            tabindex="${disabled ? '-1' : '0'}">
                        <div class="clue-card-header">
                            <span class="clue-card-icon">${clue.icon}</span>
                            <span class="clue-card-title">${clue.name}</span>
                        </div>
                        <div class="clue-card-subtitle">
                            <span class="clue-card-cost">${clue.cost} pts</span>
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
            DOMUtils.getAll('.clue-card:not(.disabled)').forEach(card => {
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
            
            // Dispatch a custom event that can be handled after purchaseClue is defined
            document.dispatchEvent(new CustomEvent('cluePurchaseRequested', {
                detail: { type, cost }
            }));
            
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

    // StatModal Component with Focus Trap
    StatModal: {
        element: null,
        previousFocus: null,
        init() {
            this.element = document.getElementById('stats-modal');
        },
        show() {
            if (!this.element) return;
            
            // Store current focus
            this.previousFocus = document.activeElement;
            
            this.element.setAttribute('data-open', 'true');
            
            // Focus the close button
            const closeButton = this.element.querySelector('.close');
            if (closeButton) {
                setTimeout(() => closeButton.focus(), 100);
            }
            
            // Set up focus trap
            this.trapFocus();
        },
        hide() {
            if (!this.element) return;
            
            this.element.setAttribute('data-open', 'false');
            
            // Remove focus trap
            this.element.removeEventListener('keydown', this.handleKeyDown);
            
            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
            }
        },
        trapFocus() {
            const focusableElements = this.element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            this.handleKeyDown = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            lastFocusable.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            firstFocusable.focus();
                            e.preventDefault();
                        }
                    }
                }
            };
            
            this.element.addEventListener('keydown', this.handleKeyDown);
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
} else {
    window.Components = Components;
}