const puppeteer = require('puppeteer');

async function testFixedLayout() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing fixed layout - no duplicate buttons, help at screen top...');
    
    // Test mobile layout
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Check initial state
    console.log('Taking initial state screenshot...');
    await page.screenshot({ path: 'fixed_initial_state.png' });
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Taking mobile screenshot...');
    await page.screenshot({ path: 'fixed_mobile_layout.png' });
    
    // Scroll down to test if help button stays at top
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Taking scrolled screenshot...');
    await page.screenshot({ path: 'fixed_mobile_scrolled.png' });
    
    // Test desktop layout
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Taking desktop screenshot...');
    await page.screenshot({ path: 'fixed_desktop_layout.png' });
    
    // Check button count
    const buttonInfo = await page.evaluate(() => {
        const headerNewGame = document.getElementById('header-new-game');
        const actionNewGame = document.getElementById('new-game-button');
        const helpButton = document.getElementById('help-button');
        
        return {
            headerNewGameExists: !!headerNewGame,
            actionNewGameExists: !!actionNewGame,
            helpButtonExists: !!helpButton,
            helpButtonPosition: helpButton ? window.getComputedStyle(helpButton).position : null,
            helpButtonTop: helpButton ? window.getComputedStyle(helpButton).top : null
        };
    });
    
    console.log('Button info:', buttonInfo);
    
    console.log('All tests completed!');
    
    await browser.close();
}

testFixedLayout().catch(console.error);