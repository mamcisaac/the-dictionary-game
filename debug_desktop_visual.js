const puppeteer = require('puppeteer');

async function debugDesktopVisual() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Set desktop viewport
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto('http://localhost:8080');
    
    console.log('Visual debugging...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add visual debugging - outline all buttons
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach((btn, index) => {
            btn.style.border = `3px solid ${['red', 'blue', 'green', 'purple'][index]}`;
            btn.style.outline = `2px dashed ${['pink', 'cyan', 'yellow', 'orange'][index]}`;
        });
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'debug_desktop_outlined.png' });
    
    // Also highlight the action-buttons container
    await page.evaluate(() => {
        const container = document.querySelector('.action-buttons');
        container.style.border = '5px solid black';
        container.style.background = 'rgba(255, 0, 0, 0.1)';
    });
    
    await page.screenshot({ path: 'debug_desktop_container.png' });
    
    console.log('Debug screenshots saved');
    
    await browser.close();
}

debugDesktopVisual().catch(console.error);