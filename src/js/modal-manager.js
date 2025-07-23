/**
 * Modal Management Module
 * Centralized modal handling with focus management and accessibility
 */

const ModalManager = {
    // Track open modals and focus states
    openModals: new Set(),
    focusStack: [],

    /**
     * Initialize modal management
     */
    init() {
        console.log('✅ Modal manager initialized');
    },

    /**
     * Open a modal with proper focus management
     * @param {string} modalId - The ID of the modal to open
     * @param {Object} options - Configuration options
     */
    openModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal with ID '${modalId}' not found`);
            return false;
        }

        // Store current focus
        this.focusStack.push(document.activeElement);
        
        // Show the modal
        if (modal.hasAttribute('data-open')) {
            modal.setAttribute('data-open', 'true');
        } else {
            modal.style.display = 'block';
        }

        // Track the open modal
        this.openModals.add(modalId);

        // Set up focus trap
        this.setupFocusTrap(modal);

        // Set initial focus
        this.setInitialFocus(modal, options.focusSelector);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        return true;
    },

    /**
     * Close a modal and restore focus
     * @param {string} modalId - The ID of the modal to close
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        // Hide the modal
        if (modal.hasAttribute('data-open')) {
            modal.setAttribute('data-open', 'false');
        } else {
            modal.style.display = 'none';
        }

        // Remove from tracking
        this.openModals.delete(modalId);

        // Remove focus trap
        this.removeFocusTrap(modal);

        // Restore previous focus
        const previousFocus = this.focusStack.pop();
        if (previousFocus && typeof previousFocus.focus === 'function') {
            // Small delay to ensure modal is hidden
            setTimeout(() => previousFocus.focus(), 100);
        }

        // Restore body scroll if no modals are open
        if (this.openModals.size === 0) {
            document.body.style.overflow = '';
        }

        return true;
    },

    /**
     * Close all open modals
     */
    closeAllModals() {
        const modalIds = Array.from(this.openModals);
        modalIds.forEach(modalId => this.closeModal(modalId));
    },

    /**
     * Set up focus trap for a modal
     * @param {HTMLElement} modal - The modal element
     */
    setupFocusTrap(modal) {
        const focusableElements = this.getFocusableElements(modal);
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        modal.addEventListener('keydown', handleTabKey);
        modal._focusTrapHandler = handleTabKey; // Store for cleanup
    },

    /**
     * Remove focus trap from a modal
     * @param {HTMLElement} modal - The modal element
     */
    removeFocusTrap(modal) {
        if (modal._focusTrapHandler) {
            modal.removeEventListener('keydown', modal._focusTrapHandler);
            delete modal._focusTrapHandler;
        }
    },

    /**
     * Set initial focus in a modal
     * @param {HTMLElement} modal - The modal element
     * @param {string} focusSelector - Optional CSS selector for initial focus
     */
    setInitialFocus(modal, focusSelector) {
        let focusTarget;

        if (focusSelector) {
            focusTarget = modal.querySelector(focusSelector);
        }

        if (!focusTarget) {
            // Default: focus the close button or first focusable element
            focusTarget = modal.querySelector('.close, [aria-label*="close"], [aria-label*="Close"]') ||
                         this.getFocusableElements(modal)[0];
        }

        if (focusTarget) {
            setTimeout(() => focusTarget.focus(), 100);
        }
    },

    /**
     * Get all focusable elements within a container
     * @param {HTMLElement} container - The container to search
     * @returns {HTMLElement[]} Array of focusable elements
     */
    getFocusableElements(container) {
        const focusableSelectors = [
            'button',
            '[href]',
            'input',
            'select',
            'textarea',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable]'
        ].join(', ');

        return Array.from(container.querySelectorAll(focusableSelectors))
            .filter(el => {
                // Exclude disabled and hidden elements
                return !el.disabled && 
                       el.offsetParent !== null && 
                       !el.hasAttribute('hidden') &&
                       el.getAttribute('tabindex') !== '-1';
            });
    },

    /**
     * Check if any modal is currently open
     * @returns {boolean} True if any modal is open
     */
    hasOpenModal() {
        return this.openModals.size > 0;
    },

    /**
     * Get the currently open modal IDs
     * @returns {string[]} Array of open modal IDs
     */
    getOpenModalIds() {
        return Array.from(this.openModals);
    }
};

// Global helper functions for compatibility
function showHelpModal() {
    ModalManager.openModal('help-modal');
}

function hideHelpModal() {
    ModalManager.closeModal('help-modal');
}

function showStatsModal() {
    ModalManager.openModal('stats-modal');
}

function hideStatsModal() {
    ModalManager.closeModal('stats-modal');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager, showHelpModal, hideHelpModal, showStatsModal, hideStatsModal };
} else {
    window.ModalManager = ModalManager;
    window.showHelpModal = showHelpModal;
    window.hideHelpModal = hideHelpModal;
    window.showStatsModal = showStatsModal;
    window.hideStatsModal = hideStatsModal;
}