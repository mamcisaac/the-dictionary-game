const puppeteer = require('puppeteer');

async function testFullClueFlow() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log('1. Starting new game...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('2. Taking initial screenshot...');
    await page.screenshot({ path: 'step1_game_started.png' });
    
    console.log('3. Opening clue popup...');
    const clueButton = await page.waitForSelector('#clue-button');
    await clueButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('4. Taking popup screenshot...');
    await page.screenshot({ path: 'step2_popup_opened.png' });
    
    console.log('5. Selecting first clue...');
    const firstClue = await page.waitForSelector('.clue-card-popup:not(.disabled)');
    await firstClue.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('6. Taking screenshot after first clue...');
    await page.screenshot({ path: 'step3_first_clue_revealed.png' });
    
    console.log('7. Opening clue popup again to see state changes...');
    const clueButton2 = await page.waitForSelector('#clue-button');
    await clueButton2.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('8. Taking screenshot of updated popup...');
    await page.screenshot({ path: 'step4_popup_after_purchase.png' });
    
    console.log('9. Selecting second clue...');
    const secondClue = await page.$('.clue-card-popup:not(.disabled)');
    if (secondClue) {
        await secondClue.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('10. Taking final screenshot...');
        await page.screenshot({ path: 'step5_second_clue_revealed.png' });
        
        // Count total clues revealed
        const totalClues = await page.evaluate(() => {
            const clueList = document.getElementById('clue-list');
            return clueList ? clueList.children.length : 0;
        });
        
        console.log(`✅ Test completed! Total clues revealed: ${totalClues}`);
    } else {
        console.log('10. No more available clues');
    }
    
    await browser.close();
}

testFullClueFlow().catch(console.error);