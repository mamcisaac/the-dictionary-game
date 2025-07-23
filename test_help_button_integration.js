const puppeteer = require('puppeteer');

async function testHelpButtonIntegration() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    console.log('Checking help button position and styling...');
    
    // Start a new game to see the button layout
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if help button is inside action-buttons container
    const helpButtonInfo = await page.evaluate(() => {
        const helpButton = document.getElementById('help-button');
        const actionButtons = document.querySelector('.action-buttons');
        
        return {
            helpButtonExists: !!helpButton,
            helpButtonParent: helpButton?.parentElement?.className,
            helpButtonClasses: helpButton?.className,
            helpButtonStyle: helpButton ? window.getComputedStyle(helpButton).position : null,
            actionButtonsExists: !!actionButtons,
            actionButtonsChildren: actionButtons ? Array.from(actionButtons.children).map(child => child.id) : []
        };
    });
    
    console.log('Help button info:', helpButtonInfo);
    
    // Test clicking the help button
    const helpButton = await page.waitForSelector('#help-button');
    await helpButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Help button clicked');
    await page.screenshot({ path: 'help_button_test.png' });
    
    await browser.close();
}

testHelpButtonIntegration().catch(console.error);