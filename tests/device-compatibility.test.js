/**
 * Device Compatibility Test Suite
 * Tests mobile game info modal across popular devices
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Device Compatibility Tests', () => {
    let browser;
    let page;
    const gameUrl = `file://${path.join(__dirname, '../index.html')}`;

    // Key devices to test
    const testDevices = [
        { name: 'iPhone SE', width: 375, height: 667, isMobile: true },
        { name: 'iPhone 12', width: 390, height: 844, isMobile: true },
        { name: 'Samsung Galaxy S20', width: 360, height: 800, isMobile: true },
        { name: 'iPad', width: 768, height: 1024, isMobile: true }, // 768px is at the mobile boundary
        { name: 'Desktop', width: 1200, height: 800, isMobile: false }
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
        
        // Wait for modules to load
        await page.waitForFunction(() => {
            return typeof GameInfoModal !== 'undefined' && 
                   typeof Components !== 'undefined';
        }, { timeout: 10000 });
    });

    afterEach(async () => {
        await page.close();
    });

    test.each(testDevices)('$name ($widthx$height) - Correct mobile/desktop behavior', async (device) => {
        // Set viewport
        await page.setViewport({ width: device.width, height: device.height });
        await page.reload({ waitUntil: 'networkidle0' });
        
        console.log(`Testing ${device.name} (${device.width}x${device.height}) - ${device.isMobile ? 'Mobile' : 'Desktop'} Mode`);
        
        if (device.isMobile) {
            // Test mobile behavior
            
            // Clues button should be visible
            const cluesButtonVisible = await page.evaluate(() => {
                const btn = document.getElementById('clues-button');
                const style = window.getComputedStyle(btn);
                return style.display !== 'none';
            });
            expect(cluesButtonVisible).toBe(true);
            
            // Start game
            await page.click('#start-game-button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Clues button should be enabled
            const cluesButtonEnabled = await page.evaluate(() => {
                const btn = document.getElementById('clues-button');
                return !btn.disabled;
            });
            expect(cluesButtonEnabled).toBe(true);
            
            // Modal should open
            await page.click('#clues-button');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const modalVisible = await page.evaluate(() => {
                const modal = document.getElementById('game-info-modal');
                return modal.style.display === 'flex';
            });
            expect(modalVisible).toBe(true);
            
            // Modal should fit screen properly
            const modalFitsScreen = await page.evaluate(() => {
                const modal = document.querySelector('.game-info-content');
                const rect = modal.getBoundingClientRect();
                return rect.height <= window.innerHeight * 0.8;
            });
            expect(modalFitsScreen).toBe(true);
            
            // Tab switching should work
            await page.click('[data-tab="score"]');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const scoreTabActive = await page.evaluate(() => {
                const scoreTab = document.querySelector('[data-tab="score"]');
                return scoreTab.classList.contains('active');
            });
            expect(scoreTabActive).toBe(true);
            
        } else {
            // Test desktop behavior
            
            // Clues button should be hidden
            const cluesButtonHidden = await page.evaluate(() => {
                const btn = document.getElementById('clues-button');
                const style = window.getComputedStyle(btn);
                return style.display === 'none';
            });
            expect(cluesButtonHidden).toBe(true);
            
            // Modal should be force-hidden
            const modalForceHidden = await page.evaluate(() => {
                const modal = document.getElementById('game-info-modal');
                const style = window.getComputedStyle(modal);
                return style.display === 'none';
            });
            expect(modalForceHidden).toBe(true);
        }
    });

    test('Responsive breakpoint behavior at 768px', async () => {
        // Test just below mobile breakpoint
        await page.setViewport({ width: 767, height: 1024 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        const mobileAt767 = await page.evaluate(() => {
            const btn = document.getElementById('clues-button');
            const style = window.getComputedStyle(btn);
            return style.display !== 'none';
        });
        expect(mobileAt767).toBe(true);
        
        // Test just above mobile breakpoint
        await page.setViewport({ width: 769, height: 1024 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        const desktopAt769 = await page.evaluate(() => {
            const btn = document.getElementById('clues-button');
            const style = window.getComputedStyle(btn);
            return style.display === 'none';
        });
        expect(desktopAt769).toBe(true);
    });

    test('Very narrow screen compatibility (320px)', async () => {
        // Test on very narrow screen
        await page.setViewport({ width: 320, height: 568 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Start game and open modal
        await page.click('#start-game-button');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.click('#clues-button');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check tabs are still accessible
        const tabsAccessible = await page.evaluate(() => {
            const cluesTab = document.querySelector('[data-tab="clues"]');
            const scoreTab = document.querySelector('[data-tab="score"]');
            const cluesRect = cluesTab.getBoundingClientRect();
            const scoreRect = scoreTab.getBoundingClientRect();
            
            return cluesRect.width > 50 && scoreRect.width > 50; // Minimum usable width
        });
        expect(tabsAccessible).toBe(true);
        
        // Check content doesn't overflow
        const noOverflow = await page.evaluate(() => {
            const content = document.querySelector('.game-info-content');
            const rect = content.getBoundingClientRect();
            return rect.width <= window.innerWidth;
        });
        expect(noOverflow).toBe(true);
    });

    test('Game functionality integration', async () => {
        // Test on mobile device
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Start game
        await page.click('#start-game-button');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Open modal and check clue cards are present
        await page.click('#clues-button');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const clueCardsPresent = await page.evaluate(() => {
            const mobileDeck = document.getElementById('mobile-clue-deck');
            const clueCards = mobileDeck ? mobileDeck.querySelectorAll('.clue-card') : [];
            return clueCards.length > 0;
        });
        expect(clueCardsPresent).toBe(true);
        
        // Check if at least one clue card is not disabled (affordable)
        const hasAffordableClue = await page.evaluate(() => {
            const mobileDeck = document.getElementById('mobile-clue-deck');
            const enabledCards = mobileDeck ? mobileDeck.querySelectorAll('.clue-card:not(.disabled)') : [];
            return enabledCards.length > 0;
        });
        expect(hasAffordableClue).toBe(true);
        
        // Switch to score tab and verify data
        await page.click('[data-tab="score"]');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const scoreDisplayed = await page.evaluate(() => {
            const scoreEl = document.getElementById('current-score-mobile');
            const score = parseInt(scoreEl.textContent);
            return !isNaN(score) && score >= 0;
        });
        expect(scoreDisplayed).toBe(true);
    });
});