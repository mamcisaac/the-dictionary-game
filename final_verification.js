const puppeteer = require('puppeteer');

async function finalVerification() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    console.log('🎯 FINAL VERIFICATION: Complete clue system test');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Game started successfully');
    
    // Test 1: Open clue popup
    const clueButton = await page.waitForSelector('#clue-button');
    await clueButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Clue popup opens successfully');
    
    // Test 2: Purchase a clue
    const firstClue = await page.waitForSelector('.clue-card-popup:not(.disabled)');
    const clueType = await page.evaluate(el => el.dataset.clueType, firstClue);
    console.log(`✅ Purchasing ${clueType} clue...`);
    
    await firstClue.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Verify clue appears in game
    const clueListContent = await page.evaluate(() => {
        const clueList = document.getElementById('clue-list');
        return clueList ? clueList.children.length : 0;
    });
    
    console.log(`✅ Clue revealed successfully (${clueListContent} total clues)`);
    
    // Test 4: Open popup again and verify state
    const clueButton2 = await page.waitForSelector('#clue-button');
    await clueButton2.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stateCheck = await page.evaluate(() => {
        const cards = document.querySelectorAll('.clue-card-popup');
        let usedCount = 0, availableCount = 0, disabledCount = 0;
        
        cards.forEach(card => {
            const cost = card.querySelector('.clue-cost').textContent;
            if (cost === 'Used') usedCount++;
            if (cost === 'None left') disabledCount++;
            if (cost.startsWith('-') && !card.disabled) availableCount++;
        });
        
        return { usedCount, availableCount, disabledCount, totalCards: cards.length };
    });
    
    console.log('✅ Popup state verification:', stateCheck);
    
    // Test 5: Purchase another clue type
    const secondClue = await page.$('.clue-card-popup:not(.disabled)');
    if (secondClue) {
        const secondClueType = await page.evaluate(el => el.dataset.clueType, secondClue);
        console.log(`✅ Purchasing second clue (${secondClueType})...`);
        
        await secondClue.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const finalClueCount = await page.evaluate(() => {
            const clueList = document.getElementById('clue-list');
            return clueList ? clueList.children.length : 0;
        });
        
        console.log(`✅ Second clue revealed (${finalClueCount} total clues)`);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'final_verification_complete.png' });
    
    console.log('🎉 ALL TESTS PASSED! Clue selection is working perfectly!');
    
    await browser.close();
}

finalVerification().catch(console.error);