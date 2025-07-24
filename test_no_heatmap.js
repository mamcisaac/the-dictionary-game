const puppeteer = require('puppeteer');

async function testNoHeatmap() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing statistics tab without heat map...');
    
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
    
    // Click on Statistics tab
    const statsTab = await page.$('.popup-tab[data-tab="statistics"]');
    if (statsTab) {
        await statsTab.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Taking screenshot of clean Statistics tab...');
        await page.screenshot({ path: 'test_stats_no_heatmap.png' });
        
        // Check if heat map elements exist
        const heatMapExists = await page.evaluate(() => {
            return {
                heatMapGrid: !!document.getElementById('heat-map-grid-popup'),
                heatMapCalendar: !!document.querySelector('.heat-map-calendar-popup'),
                winHistoryText: document.body.textContent.includes('Win History')
            };
        });
        
        console.log('Heat map elements check:', heatMapExists);
    }
    
    console.log('Test completed!');
    
    await browser.close();
}

testNoHeatmap().catch(console.error);