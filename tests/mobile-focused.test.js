/**
 * Focused Mobile Test for Game Info Modal
 * Tests core mobile functionality on key devices
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Mobile Game Info Modal - Focused Tests', () => {
    let browser;
    let page;
    const gameUrl = `file://${path.join(__dirname, '../index.html')}`;

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

    test('iPhone SE - Mobile game info modal works correctly', async () => {
        // Set iPhone SE viewport
        await page.setViewport({ width: 375, height: 667 });
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15');
        await page.reload({ waitUntil: 'networkidle0' });
        
        console.log('Testing iPhone SE (375x667) - Mobile Mode');
        
        // Check clues button is visible
        const cluesButtonVisible = await page.evaluate(() => {
            const btn = document.getElementById('clues-button');
            const style = window.getComputedStyle(btn);
            return style.display !== 'none';
        });
        expect(cluesButtonVisible).toBe(true);
        
        // Start game
        await page.click('#start-game-button');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check clues button is enabled
        const cluesButtonEnabled = await page.evaluate(() => {
            const btn = document.getElementById('clues-button');
            return !btn.disabled;
        });
        expect(cluesButtonEnabled).toBe(true);
        
        // Open modal
        await page.click('#clues-button');
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        
        // Close modal
        await page.click('#close-game-info');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const modalClosed = await page.evaluate(() => {
            const modal = document.getElementById('game-info-modal');
            return modal.style.display === 'none';
        });
        expect(modalClosed).toBe(true);
    });

    test('Desktop - Clues button and modal are hidden', async () => {
        // Set desktop viewport
        await page.setViewport({ width: 1200, height: 800 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        console.log('Testing Desktop (1200x800) - Desktop Mode');
        
        // Check clues button is hidden
        const cluesButtonHidden = await page.evaluate(() => {
            const btn = document.getElementById('clues-button');
            const style = window.getComputedStyle(btn);
            return style.display === 'none';
        });
        expect(cluesButtonHidden).toBe(true);
        
        // Check modal is force-hidden
        const modalForceHidden = await page.evaluate(() => {
            const modal = document.getElementById('game-info-modal');
            const style = window.getComputedStyle(modal);
            return style.display === 'none';
        });
        expect(modalForceHidden).toBe(true);
    });

    test('Score synchronization between desktop and mobile', async () => {
        // Set mobile viewport
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Start game
        await page.click('#start-game-button');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get desktop score
        const desktopScore = await page.evaluate(() => {
            const scoreEl = document.getElementById('current-score');
            return scoreEl ? scoreEl.textContent : '0';
        });
        
        // Open mobile modal and switch to score tab
        await page.click('#clues-button');
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.click('[data-tab="score"]');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check mobile score matches
        const mobileScore = await page.evaluate(() => {
            const scoreEl = document.getElementById('current-score-mobile');
            return scoreEl ? scoreEl.textContent : '0';
        });
        
        expect(mobileScore).toBe(desktopScore);
    });

    test('Modal closes with escape key', async () => {
        // Set mobile viewport
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Start game and open modal
        await page.click('#start-game-button');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.click('#clues-button');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Press Escape
        await page.keyboard.press('Escape');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const modalClosed = await page.evaluate(() => {
            const modal = document.getElementById('game-info-modal');
            return modal.style.display === 'none';
        });
        expect(modalClosed).toBe(true);
    });
});