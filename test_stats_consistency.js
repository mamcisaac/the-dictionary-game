const puppeteer = require('puppeteer');

async function testStatsConsistency() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing statistics consistency across different UI components...');
    
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Clear localStorage to ensure clean state
    await page.evaluate(() => {
        localStorage.removeItem('dictionaryGameStats');
        localStorage.removeItem('dictionaryGameDailyWins');
    });
    
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Test initial state (no games played)
    console.log('\n1. Testing with no games played...');
    
    // Open score popup
    const scoreButton = await page.waitForSelector('#score-button');
    await scoreButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const scorePopupStats = await page.evaluate(() => {
        return {
            winRate: document.querySelector('#win-rate-popup')?.textContent,
            gamesPlayed: document.querySelector('#games-played-popup')?.textContent
        };
    });
    console.log('Score popup stats:', scorePopupStats);
    
    // Close popup
    await page.click('.popup-close');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate playing and winning a game
    console.log('\n2. Simulating a won game...');
    await page.evaluate(() => {
        // Directly call the statistics recording function
        if (window.Statistics) {
            window.Statistics.recordGameResult(true, 500);
        }
    });
    
    // Check score popup again
    await scoreButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const afterWinStats = await page.evaluate(() => {
        return {
            winRate: document.querySelector('#win-rate-popup')?.textContent,
            gamesPlayed: document.querySelector('#games-played-popup')?.textContent
        };
    });
    console.log('Score popup after win:', afterWinStats);
    
    await page.screenshot({ path: 'test_score_popup_after_win.png' });
    
    // Close popup and check main stats modal
    await page.click('.popup-close');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to open stats modal (need to check if there's a button for it)
    const statsModalData = await page.evaluate(() => {
        // Trigger stats modal update
        if (window.Statistics) {
            window.Statistics.updateStatsDisplay();
        }
        return {
            winRate: document.querySelector('#win-rate')?.textContent,
            gamesPlayed: document.querySelector('#games-played')?.textContent
        };
    });
    console.log('Stats modal data:', statsModalData);
    
    console.log('\nTest completed!');
    
    await browser.close();
}

testStatsConsistency().catch(console.error);