const puppeteer = require('puppeteer');

async function testTabbedInterface() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing new tabbed Score & Stats interface...');
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Open score popup
    const scoreButton = await page.waitForSelector('#score-button');
    await scoreButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Taking screenshot of Current Game tab...');
    await page.screenshot({ path: 'test_tabbed_current_game.png' });
    
    // Check if tabs exist
    const tabsExist = await page.evaluate(() => {
        const tabs = document.querySelectorAll('.popup-tab');
        return {
            count: tabs.length,
            labels: Array.from(tabs).map(t => t.textContent)
        };
    });
    console.log('Tabs found:', tabsExist);
    
    // Click on Statistics tab
    const statsTab = await page.$('.popup-tab[data-tab="statistics"]');
    if (statsTab) {
        await statsTab.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Taking screenshot of Statistics tab...');
        await page.screenshot({ path: 'test_tabbed_statistics.png' });
    }
    
    // Check tab content visibility
    const tabVisibility = await page.evaluate(() => {
        return {
            currentGameVisible: window.getComputedStyle(document.getElementById('current-game-tab')).display !== 'none',
            statisticsVisible: window.getComputedStyle(document.getElementById('statistics-tab')).display !== 'none'
        };
    });
    console.log('Tab visibility:', tabVisibility);
    
    console.log('Test completed!');
    
    await browser.close();
}

testTabbedInterface().catch(console.error);