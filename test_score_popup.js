const puppeteer = require('puppeteer');

async function testScorePopup() {
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
    
    // Click the score button
    console.log('Clicking score button...');
    const scoreButton = await page.waitForSelector('#score-button');
    await scoreButton.click();
    
    // Wait for popup to appear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Score popup opened, taking screenshot...');
    await page.screenshot({ path: 'score_popup_opened.png' });
    
    // Check if popup content is visible
    const scorePopup = await page.$('#score-popup');
    if (scorePopup) {
        const isVisible = await page.evaluate(el => el.style.display !== 'none', scorePopup);
        console.log('Score popup visible:', isVisible);
        
        // Check score content
        const currentScore = await page.$('#current-score-popup');
        if (currentScore) {
            const scoreText = await page.evaluate(el => el.textContent, currentScore);
            console.log('Current score:', scoreText);
        }
        
        console.log('✅ Score popup test completed successfully!');
    } else {
        console.log('❌ Score popup not found');
    }
    
    await browser.close();
}

testScorePopup().catch(console.error);