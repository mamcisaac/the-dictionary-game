const puppeteer = require('puppeteer');

async function testCompactHeader() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing compact header design...');
    
    // Test mobile view
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:8080');
    
    // Start a new game
    const startButton = await page.waitForSelector('#empty-state-new-game');
    await startButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Measure header height
    const headerSize = await page.evaluate(() => {
        const header = document.querySelector('.guess-card-header');
        const scrollArea = document.querySelector('.guess-card-scroll');
        return {
            headerHeight: header ? header.offsetHeight : 0,
            scrollAreaHeight: scrollArea ? scrollArea.offsetHeight : 0,
            viewportHeight: window.innerHeight
        };
    });
    
    console.log('Header measurements:', headerSize);
    console.log(`Header takes up ${Math.round((headerSize.headerHeight / headerSize.viewportHeight) * 100)}% of viewport`);
    
    // Add some clues to see scrolling
    await page.evaluate(() => {
        // Simulate adding clues to test scrolling
        const clueList = document.getElementById('clue-list');
        if (clueList) {
            for (let i = 0; i < 5; i++) {
                const clueDiv = document.createElement('div');
                clueDiv.className = 'clue-stripe';
                clueDiv.innerHTML = `<div style="padding: 10px; border-bottom: 1px solid #ccc;">Sample clue ${i + 1}</div>`;
                clueList.appendChild(clueDiv);
            }
        }
    });
    
    console.log('Taking mobile screenshot...');
    await page.screenshot({ path: 'test_compact_header_mobile.png' });
    
    // Test desktop view
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Taking desktop screenshot...');
    await page.screenshot({ path: 'test_compact_header_desktop.png' });
    
    console.log('Test completed!');
    
    await browser.close();
}

testCompactHeader().catch(console.error);