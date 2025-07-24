const puppeteer = require('puppeteer');

async function testStats() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing statistics display...');
    
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
    
    console.log('Taking screenshot of score popup...');
    await page.screenshot({ path: 'test_score_popup_fixed.png' });
    
    // Get stats display
    const stats = await page.evaluate(() => {
        return {
            scorePopup: {
                winRate: document.querySelector('#win-rate-popup')?.textContent,
                gamesPlayed: document.querySelector('#games-played-popup')?.textContent,
                bestScore: document.querySelector('#best-score-popup')?.textContent
            },
            statsModal: {
                winRate: document.querySelector('#win-rate')?.textContent,
                gamesPlayed: document.querySelector('#games-played')?.textContent
            }
        };
    });
    
    console.log('Statistics values:', JSON.stringify(stats, null, 2));
    
    console.log('Test completed!');
    
    await browser.close();
}

testStats().catch(console.error);