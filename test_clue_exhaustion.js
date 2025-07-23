const puppeteer = require('puppeteer');

async function testClueExhaustion() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log('Starting new game...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check initial puzzle data
    const puzzleInfo = await page.evaluate(() => {
        return {
            word: window.puzzleData?.word,
            totalDefinitions: window.puzzleData?.definitions?.length,
            totalExamples: window.puzzleData?.examples?.length,
            cluesGivenByType: {...window.cluesGivenByType}
        };
    });
    
    console.log('Puzzle info:', puzzleInfo);
    
    // Keep buying definition clues until exhausted
    for (let i = 0; i < 10; i++) { // Max 10 attempts to prevent infinite loop
        console.log(`\n--- Attempt ${i + 1} ---`);
        
        // Open clue popup
        const clueButton = await page.waitForSelector('#clue-button');
        await clueButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if definition clue is available
        const definitionClue = await page.$('.clue-card-popup[data-clue-type="definition"]:not(.disabled)');
        
        if (definitionClue) {
            console.log('Definition clue available, purchasing...');
            await definitionClue.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check current state
            const currentState = await page.evaluate(() => {
                return {
                    cluesGivenByType: {...window.cluesGivenByType},
                    currentScore: window.currentScore
                };
            });
            
            console.log('Current state:', currentState);
        } else {
            console.log('Definition clue not available');
            
            // Take screenshot of final state
            await page.screenshot({ path: `clue_exhausted_${i}.png` });
            
            // Close popup
            const closeButton = await page.$('.popup-close');
            if (closeButton) await closeButton.click();
            
            break;
        }
    }
    
    console.log('\n--- Final Game State ---');
    // Take final screenshot
    await page.screenshot({ path: 'final_clue_state.png' });
    
    await browser.close();
}

testClueExhaustion().catch(console.error);