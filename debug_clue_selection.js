const puppeteer = require('puppeteer');

async function debugClueSelection() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Enable console logging from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    console.log('Starting new game...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    
    // Wait for game to start
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Game started, opening clue popup...');
    
    // Click the clue button
    const clueButton = await page.waitForSelector('#clue-button');
    await clueButton.click();
    
    // Wait for popup to appear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Clue popup opened, checking available functions...');
    
    // Check what functions are available in the page
    const functionsAvailable = await page.evaluate(() => {
        return {
            purchaseClue: typeof purchaseClue,
            windowPurchaseClue: typeof window.purchaseClue,
            gameLogicPurchaseClue: typeof window.GameLogic?.purchaseClue,
            getAvailableClues: typeof getAvailableClues,
            gameScoring: typeof gameScoring,
            gameStarted: window.gameStarted,
            puzzleData: !!window.puzzleData
        };
    });
    
    console.log('Functions available:', functionsAvailable);
    
    // Click on the first available clue and capture any errors
    const firstClue = await page.waitForSelector('.clue-card-popup:not(.disabled)');
    if (firstClue) {
        console.log('Clicking clue with detailed logging...');
        
        // Add event listener to track clicks
        await page.evaluate(() => {
            document.addEventListener('click', (e) => {
                if (e.target.closest('.clue-card-popup')) {
                    console.log('Clue card clicked:', e.target.closest('.clue-card-popup').dataset.clueType);
                }
            });
        });
        
        await firstClue.click();
        
        // Wait and check for any changes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check clue list content
        const clueListContent = await page.evaluate(() => {
            const clueList = document.getElementById('clue-list');
            return clueList ? clueList.textContent : 'No clue list found';
        });
        
        console.log('Clue list after click:', clueListContent);
        
        // Check message area
        const messageContent = await page.evaluate(() => {
            const message = document.getElementById('message');
            return message ? message.textContent : 'No message area found';
        });
        
        console.log('Message after click:', messageContent);
        
        // Check current score
        const currentScore = await page.evaluate(() => {
            return window.currentScore;
        });
        
        console.log('Current score after click:', currentScore);
        
        await page.screenshot({ path: 'debug_after_clue_click.png' });
        
    } else {
        console.log('❌ No available clues found');
    }
    
    await browser.close();
}

debugClueSelection().catch(console.error);