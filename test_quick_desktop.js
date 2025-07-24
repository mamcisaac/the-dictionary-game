const puppeteer = require('puppeteer');

async function testQuickDesktop() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto('http://localhost:8080');
    
    console.log('Testing desktop layout...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await page.screenshot({ path: 'quick_desktop_test.png' });
    console.log('Desktop screenshot saved');
    
    await browser.close();
}

testQuickDesktop().catch(console.error);