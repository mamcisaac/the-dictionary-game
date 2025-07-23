const puppeteer = require('puppeteer');

async function testSimple() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    console.log('Starting game...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Game started, testing buttons...');
    
    // Check that all buttons exist
    const buttonInfo = await page.evaluate(() => {
        const guess = document.getElementById('guess-button');
        const clue = document.getElementById('clue-button');
        const score = document.getElementById('score-button');
        const newGame = document.getElementById('new-game-button');
        const help = document.getElementById('help-button');
        
        return {
            guess: !!guess,
            clue: !!clue,
            score: !!score,
            newGame: !!newGame,
            help: !!help,
            helpClasses: help?.className
        };
    });
    
    console.log('Button check:', buttonInfo);
    
    await page.screenshot({ path: 'final_layout.png' });
    console.log('Final layout screenshot saved');
    
    await browser.close();
}

testSimple().catch(console.error);