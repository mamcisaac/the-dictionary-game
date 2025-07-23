const puppeteer = require('puppeteer');

async function testCluePopup() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    console.log('Page loaded, starting new game...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    
    // Wait for game to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Game started, taking screenshot...');
    await page.screenshot({ path: 'game_started.png' });
    
    // Click the clue button
    console.log('Clicking clue button...');
    const clueButton = await page.waitForSelector('#clue-button');
    await clueButton.click();
    
    // Wait for popup to appear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Clue popup opened, taking screenshot...');
    await page.screenshot({ path: 'clue_popup_opened.png' });
    
    // Click on multiple clues to test different states
    console.log('Testing multiple clue states...');
    
    // Click on the first available clue
    const firstClue = await page.waitForSelector('.clue-card-popup:not(.disabled)');
    if (firstClue) {
        console.log('Clicking first available clue...');
        await firstClue.click();
        
        // Wait for clue to be revealed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Open clue popup again to see updated states
        const clueButton2 = await page.waitForSelector('#clue-button');
        await clueButton2.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Clue popup reopened, taking screenshot of updated states...');
        await page.screenshot({ path: 'clue_popup_updated.png' });
        
        // Check for disabled/used clues
        const disabledClues = await page.$$('.clue-card-popup.disabled');
        console.log(`Found ${disabledClues.length} disabled clue cards`);
        
        // Test clicking another available clue if any
        const nextClue = await page.$('.clue-card-popup:not(.disabled)');
        if (nextClue) {
            console.log('Clicking another available clue...');
            await nextClue.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('Taking final screenshot...');
        await page.screenshot({ path: 'clue_revealed_final.png' });
        
        // Check if clue appeared in the clue list
        const clueList = await page.$('#clue-list');
        if (clueList) {
            const clueText = await page.evaluate(el => el.textContent, clueList);
            console.log('Clue list content:', clueText);
        }
        
        console.log('✅ Clue popup test completed successfully!');
    } else {
        console.log('❌ No available clues found');
    }
    
    await browser.close();
}

testCluePopup().catch(console.error);