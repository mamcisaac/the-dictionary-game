const puppeteer = require('puppeteer');

async function inspectLayout() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    console.log('Taking screenshot of current layout...');
    
    // Start a new game to see the button layout
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await page.screenshot({ path: 'current_button_layout.png' });
    console.log('Screenshot saved as current_button_layout.png');
    
    await browser.close();
}

inspectLayout().catch(console.error);