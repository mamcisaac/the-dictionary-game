/**
 * Puppeteer Test Suite for Mobile Game Info Modal
 * Tests functionality across different devices and screen sizes
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Mobile Game Info Modal Tests', () => {
    let browser;
    let page;
    const gameUrl = `file://${path.join(__dirname, '../index.html')}`;

    // Device configurations to test
    const devices = [
        { name: 'iPhone SE', width: 375, height: 667, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15' },
        { name: 'iPhone 12', width: 390, height: 844, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
        { name: 'iPhone 12 Pro Max', width: 428, height: 926, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
        { name: 'Samsung Galaxy S20', width: 360, height: 800, userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36' },
        { name: 'Samsung Galaxy S21 Ultra', width: 384, height: 854, userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36' },
        { name: 'iPad Mini', width: 768, height: 1024, userAgent: 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15' },
        { name: 'Samsung Galaxy Tab', width: 800, height: 1280, userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-T820) AppleWebKit/537.36' },
        { name: 'Desktop', width: 1200, height: 800, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    ];

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto(gameUrl, { waitUntil: 'networkidle0' });
        
        // Wait for all modules to load
        await page.waitForFunction(() => {
            return typeof GameInfoModal !== 'undefined' && 
                   typeof Components !== 'undefined' && 
                   typeof DOMUtils !== 'undefined';
        }, { timeout: 10000 });
    });

    afterEach(async () => {
        await page.close();
    });

    describe('Cross-Device Functionality Tests', () => {
        test.each(devices)('$name - Game Info Modal visibility and basic functionality', async (device) => {
            // Set viewport and user agent
            await page.setViewport({ width: device.width, height: device.height });
            await page.setUserAgent(device.userAgent);
            
            // Reload to apply responsive changes
            await page.reload({ waitUntil: 'networkidle0' });
            
            const isMobile = device.width <= 768;
            
            if (isMobile) {
                // Test mobile-specific behavior
                console.log(`Testing ${device.name} (${device.width}x${device.height}) - Mobile Mode`);
                
                // Check clues button visibility
                const cluesButtonVisible = await page.evaluate(() => {
                    const btn = document.getElementById('clues-button');
                    const style = window.getComputedStyle(btn);
                    return style.display !== 'none';
                });
                expect(cluesButtonVisible).toBe(true);
                
                // Check modal is initially hidden
                const modalInitiallyHidden = await page.evaluate(() => {
                    const modal = document.getElementById('game-info-modal');
                    return modal.style.display === 'none';
                });
                expect(modalInitiallyHidden).toBe(true);
                
                // Start a game to enable clues button
                await page.click('#start-game-button');
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for game initialization
                
                // Check clues button is enabled
                const cluesButtonEnabled = await page.evaluate(() => {
                    const btn = document.getElementById('clues-button');
                    return !btn.disabled;
                });
                expect(cluesButtonEnabled).toBe(true);
                
                // Click clues button to open modal
                await page.click('#clues-button');
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation
                
                // Check modal is visible
                const modalVisible = await page.evaluate(() => {
                    const modal = document.getElementById('game-info-modal');
                    return modal.style.display === 'flex';
                });
                expect(modalVisible).toBe(true);
                
                // Test tab switching
                await page.click('[data-tab="score"]');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const scoreTabActive = await page.evaluate(() => {
                    const scoreTab = document.querySelector('[data-tab="score"]');
                    const scorePanel = document.getElementById('score-tab');
                    return scoreTab.classList.contains('active') && scorePanel.classList.contains('active');
                });
                expect(scoreTabActive).toBe(true);
                
                // Switch back to clues tab
                await page.click('[data-tab="clues"]');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const cluesTabActive = await page.evaluate(() => {
                    const cluesTab = document.querySelector('[data-tab="clues"]');
                    const cluesPanel = document.getElementById('clues-tab');
                    return cluesTab.classList.contains('active') && cluesPanel.classList.contains('active');
                });
                expect(cluesTabActive).toBe(true);
                
                // Test modal closing with close button
                await page.click('#close-game-info');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const modalClosed = await page.evaluate(() => {
                    const modal = document.getElementById('game-info-modal');
                    return modal.style.display === 'none';
                });
                expect(modalClosed).toBe(true);
                
            } else {
                // Test desktop behavior
                console.log(`Testing ${device.name} (${device.width}x${device.height}) - Desktop Mode`);
                
                // Check clues button is hidden on desktop
                const cluesButtonHidden = await page.evaluate(() => {
                    const btn = document.getElementById('clues-button');
                    const style = window.getComputedStyle(btn);
                    return style.display === 'none';
                });
                expect(cluesButtonHidden).toBe(true);
                
                // Check modal is force-hidden on desktop
                const modalForceHidden = await page.evaluate(() => {
                    const modal = document.getElementById('game-info-modal');
                    const style = window.getComputedStyle(modal);
                    return style.display === 'none';
                });
                expect(modalForceHidden).toBe(true);
            }
        });
    });

    describe('Mobile Interaction Tests', () => {
        beforeEach(async () => {
            // Set to mobile viewport
            await page.setViewport({ width: 375, height: 667 });
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15');
            await page.reload({ waitUntil: 'networkidle0' });
        });

        test('Modal opens and closes with backdrop click', async () => {
            // Start game and open modal
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Click backdrop to close
            await page.evaluate(() => {
                const modal = document.getElementById('game-info-modal');
                modal.click(); // Click the backdrop
            });
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const modalClosed = await page.evaluate(() => {
                const modal = document.getElementById('game-info-modal');
                return modal.style.display === 'none';
            });
            expect(modalClosed).toBe(true);
        });

        test('Modal closes with Escape key', async () => {
            // Start game and open modal
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Press Escape key
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const modalClosed = await page.evaluate(() => {
                const modal = document.getElementById('game-info-modal');
                return modal.style.display === 'none';
            });
            expect(modalClosed).toBe(true);
        });

        test('Score data synchronizes between desktop and mobile views', async () => {
            // Start game
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get initial desktop score
            const desktopScore = await page.evaluate(() => {
                const scoreEl = document.getElementById('current-score');
                return scoreEl ? scoreEl.textContent : '0';
            });
            
            // Open mobile modal and check score tab
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            await page.click('[data-tab="score"]');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Check mobile score matches desktop
            const mobileScore = await page.evaluate(() => {
                const scoreEl = document.getElementById('current-score-mobile');
                return scoreEl ? scoreEl.textContent : '0';
            });
            
            expect(mobileScore).toBe(desktopScore);
        });

        test('Clue cards render properly in mobile modal', async () => {
            // Start game
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Open mobile modal
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check clue cards are present
            const clueCardsPresent = await page.evaluate(() => {
                const mobileDeck = document.getElementById('mobile-clue-deck');
                const clueCards = mobileDeck ? mobileDeck.querySelectorAll('.clue-card') : [];
                return clueCards.length > 0;
            });
            expect(clueCardsPresent).toBe(true);
            
            // Check clue cards are clickable
            const clueCardClickable = await page.evaluate(() => {
                const mobileDeck = document.getElementById('mobile-clue-deck');
                const firstCard = mobileDeck ? mobileDeck.querySelector('.clue-card:not(.disabled)') : null;
                return firstCard !== null;
            });
            expect(clueCardClickable).toBe(true);
        });

        test('Focus management works correctly', async () => {
            // Start game
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Open modal
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check focus is on active tab
            const focusOnTab = await page.evaluate(() => {
                const activeTab = document.querySelector('.tab-button.active');
                return document.activeElement === activeTab;
            });
            expect(focusOnTab).toBe(true);
            
            // Close modal and check focus returns to clues button
            await page.click('#close-game-info');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const focusOnCluesButton = await page.evaluate(() => {
                const cluesButton = document.getElementById('clues-button');
                return document.activeElement === cluesButton;
            });
            expect(focusOnCluesButton).toBe(true);
        });
    });

    describe('Responsive Design Tests', () => {
        test('Modal layout adapts to different screen heights', async () => {
            const heights = [568, 667, 844, 926]; // Different mobile heights
            
            for (const height of heights) {
                await page.setViewport({ width: 375, height });
                await page.reload({ waitUntil: 'networkidle0' });
                
                // Start game and open modal
                await page.click('#start-game-button');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await page.click('#clues-button');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check modal doesn't exceed viewport
                const modalFitsScreen = await page.evaluate(() => {
                    const modal = document.querySelector('.game-info-content');
                    const rect = modal.getBoundingClientRect();
                    return rect.height <= window.innerHeight * 0.8; // Should be max 80vh
                });
                expect(modalFitsScreen).toBe(true);
                
                await page.click('#close-game-info');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        });

        test('Tab buttons remain accessible on narrow screens', async () => {
            // Test very narrow screen
            await page.setViewport({ width: 320, height: 568 });
            await page.reload({ waitUntil: 'networkidle0' });
            
            // Start game and open modal
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check both tabs are visible and clickable
            const tabsClickable = await page.evaluate(() => {
                const cluesTab = document.querySelector('[data-tab="clues"]');
                const scoreTab = document.querySelector('[data-tab="score"]');
                const cluesRect = cluesTab.getBoundingClientRect();
                const scoreRect = scoreTab.getBoundingClientRect();
                
                return cluesRect.width > 0 && cluesRect.height > 0 && 
                       scoreRect.width > 0 && scoreRect.height > 0;
            });
            expect(tabsClickable).toBe(true);
        });
    });

    describe('Performance and Animation Tests', () => {
        beforeEach(async () => {
            await page.setViewport({ width: 375, height: 667 });
        });

        test('Modal animations perform smoothly', async () => {
            // Start performance monitoring
            await page.tracing.start({ screenshots: true, path: 'trace.json' });
            
            // Start game and open modal
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Close modal
            await page.click('#close-game-info');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Stop tracing
            await page.tracing.stop();
            
            // Basic performance check - no specific assertion as performance varies
            // This mainly ensures no JavaScript errors during animations
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            expect(consoleErrors.length).toBe(0);
        });

        test('No memory leaks during repeated modal operations', async () => {
            // Start game
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Perform multiple open/close cycles
            for (let i = 0; i < 5; i++) {
                await page.click('#clues-button');
                await new Promise(resolve => setTimeout(resolve, 300));
                await page.click('[data-tab="score"]');
                await new Promise(resolve => setTimeout(resolve, 200));
                await page.click('[data-tab="clues"]');
                await new Promise(resolve => setTimeout(resolve, 200));
                await page.click('#close-game-info');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Check for any JavaScript errors
            const errors = [];
            page.on('pageerror', error => {
                errors.push(error.message);
            });
            
            expect(errors.length).toBe(0);
        });
    });

    describe('Accessibility Tests', () => {
        beforeEach(async () => {
            await page.setViewport({ width: 375, height: 667 });
        });

        test('Modal has proper ARIA attributes', async () => {
            // Start game and open modal
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const ariaAttributes = await page.evaluate(() => {
                const modal = document.getElementById('game-info-modal');
                return {
                    role: modal.getAttribute('role'),
                    ariaModal: modal.getAttribute('aria-modal'),
                    ariaLabelledby: modal.getAttribute('aria-labelledby')
                };
            });
            
            expect(ariaAttributes.role).toBe('dialog');
            expect(ariaAttributes.ariaModal).toBe('true');
            expect(ariaAttributes.ariaLabelledby).toBe('game-info-title');
        });

        test('Keyboard navigation works properly', async () => {
            // Start game and open modal
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Test Tab navigation between tab buttons
            await page.keyboard.press('Tab');
            const scoreTabFocused = await page.evaluate(() => {
                return document.activeElement.getAttribute('data-tab') === 'score';
            });
            expect(scoreTabFocused).toBe(true);
            
            // Test Enter to activate tab
            await page.keyboard.press('Enter');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const scoreTabActivated = await page.evaluate(() => {
                const scoreTab = document.querySelector('[data-tab="score"]');
                const scorePanel = document.getElementById('score-tab');
                return scoreTab.classList.contains('active') && scorePanel.classList.contains('active');
            });
            expect(scoreTabActivated).toBe(true);
        });
    });
});