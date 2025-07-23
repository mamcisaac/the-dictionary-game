const puppeteer = require('puppeteer');

async function testNewLayout() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    console.log('Testing new button layout...');
    
    // Start a new game to see the button layout
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Taking mobile screenshot...');
    await page.screenshot({ path: 'new_layout_mobile.png' });
    
    // Test desktop layout
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Taking desktop screenshot...');
    await page.screenshot({ path: 'new_layout_desktop.png' });
    
    // Test help button functionality
    console.log('Testing help button...');
    const helpButton = await page.waitForSelector('#help-button');
    await helpButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({ path: 'help_button_test_new.png' });
    
    // Test new game button functionality  
    console.log('Testing new game button...');
    const closeBtn = await page.$('.popup-close');
    if (closeBtn) await closeBtn.click();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGameBtn = await page.waitForSelector('#new-game-button');
    await newGameBtn.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.screenshot({ path: 'new_game_button_test.png' });
    
    console.log('All tests completed!');
    
    await browser.close();
}

testNewLayout().catch(console.error);