/**
 * Basic Puppeteer Test for Game Functionality
 * Quick test to ensure the game loads and basic features work
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Basic Game Functionality', () => {
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
    });

    afterEach(async () => {
        await page.close();
    });

    test('Game loads successfully', async () => {
        const title = await page.title();
        expect(title).toBe('The Dictionary Game');
    });

    test('All JavaScript modules load without errors', async () => {
        const errors = [];
        page.on('pageerror', error => {
            errors.push(error.message);
        });

        // Wait for modules to load
        await page.waitForFunction(() => {
            return typeof DOMUtils !== 'undefined' && 
                   typeof GameInfoModal !== 'undefined' && 
                   typeof Components !== 'undefined';
        }, { timeout: 10000 });

        expect(errors.length).toBe(0);
    });

    test('Mobile clues button exists and is initially disabled', async () => {
        // Set mobile viewport
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle0' });

        const cluesButton = await page.$('#clues-button');
        expect(cluesButton).not.toBeNull();

        const isDisabled = await page.evaluate(() => {
            const btn = document.getElementById('clues-button');
            return btn.disabled;
        });
        expect(isDisabled).toBe(true);
    });

    test('Game starts successfully', async () => {
        await page.click('#start-game-button');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for game to start

        const gameStarted = await page.evaluate(() => {
            return typeof gameStarted !== 'undefined' ? gameStarted : false;
        });
        expect(gameStarted).toBe(true);
    });
});