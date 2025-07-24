const puppeteer = require('puppeteer');

async function testFinalLayout() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing final layout with win rate fix...');
    
    // Test mobile layout
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Taking mobile screenshot...');
    await page.screenshot({ path: 'final_mobile_layout.png' });
    
    // Test score popup to check win rate display
    console.log('Testing score popup...');
    const scoreButton = await page.waitForSelector('#score-button');
    await scoreButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await page.screenshot({ path: 'score_popup_winrate_test.png' });
    
    // Close popup
    const closeBtn = await page.$('.popup-close');
    if (closeBtn) await closeBtn.click();
    
    // Test desktop layout
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Taking desktop screenshot...');
    await page.screenshot({ path: 'final_desktop_layout.png' });
    
    // Test help button functionality
    console.log('Testing floating help button...');
    const helpButton = await page.waitForSelector('#help-button');
    await helpButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({ path: 'floating_help_test.png' });
    
    // Test new game button functionality
    console.log('Testing new game button...');
    const closeBtnHelp = await page.$('.popup-close');
    if (closeBtnHelp) await closeBtnHelp.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGameBtn = await page.waitForSelector('#new-game-button');
    await newGameBtn.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({ path: 'new_game_functionality_test.png' });
    
    console.log('All tests completed successfully!');
    
    await browser.close();
}

testFinalLayout().catch(console.error);