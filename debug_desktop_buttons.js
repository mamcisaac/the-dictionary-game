const puppeteer = require('puppeteer');

async function debugDesktopButtons() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Set desktop viewport
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto('http://localhost:8080');
    
    console.log('Debugging desktop button layout...');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check what buttons exist
    const buttonInfo = await page.evaluate(() => {
        const actionButtons = document.querySelector('.action-buttons');
        const allButtons = Array.from(actionButtons?.children || []);
        
        return {
            actionButtonsExists: !!actionButtons,
            totalButtons: allButtons.length,
            buttonDetails: allButtons.map(btn => ({
                id: btn.id,
                textContent: btn.textContent,
                classes: btn.className,
                display: window.getComputedStyle(btn).display,
                visibility: window.getComputedStyle(btn).visibility,
                opacity: window.getComputedStyle(btn).opacity
            }))
        };
    });
    
    console.log('Button info:', buttonInfo);
    
    // Check grid layout
    const gridInfo = await page.evaluate(() => {
        const actionButtons = document.querySelector('.action-buttons');
        const style = window.getComputedStyle(actionButtons);
        return {
            display: style.display,
            gridTemplateColumns: style.gridTemplateColumns,
            maxWidth: style.maxWidth,
            width: style.width
        };
    });
    
    console.log('Grid info:', gridInfo);
    
    await browser.close();
}

debugDesktopButtons().catch(console.error);