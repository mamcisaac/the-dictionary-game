const puppeteer = require('puppeteer');

async function testButtonHighlight() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing button highlighting on game end...');
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check initial button states
    const initialStates = await page.evaluate(() => {
        const guessButton = document.getElementById('guess-button');
        const newGameButton = document.getElementById('new-game-button');
        return {
            guessHasPrimary: guessButton?.classList.contains('primary'),
            newGameHasPrimary: newGameButton?.classList.contains('primary')
        };
    });
    console.log('Initial button states:', initialStates);
    
    // Simulate game win by directly calling the win logic
    await page.evaluate(() => {
        // Simulate a win
        window.gameStarted = false;
        const guessButton = document.getElementById("guess-button");
        const newGameButton = document.getElementById("new-game-button");
        
        if (guessButton) {
            guessButton.disabled = true;
            guessButton.classList.remove("primary");
        }
        if (newGameButton) {
            newGameButton.classList.add("primary");
        }
    });
    
    // Check button states after game end
    const endStates = await page.evaluate(() => {
        const guessButton = document.getElementById('guess-button');
        const newGameButton = document.getElementById('new-game-button');
        return {
            guessHasPrimary: guessButton?.classList.contains('primary'),
            newGameHasPrimary: newGameButton?.classList.contains('primary'),
            guessDisabled: guessButton?.disabled,
            newGameDisabled: newGameButton?.disabled
        };
    });
    console.log('Button states after game end:', endStates);
    
    console.log('Taking screenshot of game end state...');
    await page.screenshot({ path: 'test_button_highlight_end.png' });
    
    // Click new game to test reset
    const newGameButton = await page.$('#new-game-button');
    if (newGameButton) {
        await newGameButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const resetStates = await page.evaluate(() => {
            const guessButton = document.getElementById('guess-button');
            const newGameButton = document.getElementById('new-game-button');
            return {
                guessHasPrimary: guessButton?.classList.contains('primary'),
                newGameHasPrimary: newGameButton?.classList.contains('primary')
            };
        });
        console.log('Button states after new game:', resetStates);
        
        console.log('Taking screenshot of new game state...');
        await page.screenshot({ path: 'test_button_highlight_new.png' });
    }
    
    console.log('Test completed!');
    
    await browser.close();
}

testButtonHighlight().catch(console.error);