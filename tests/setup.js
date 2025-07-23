/**
 * Jest setup for Puppeteer tests
 */

// Increase timeout for all tests
jest.setTimeout(60000);

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Console helper for debugging
global.log = (message) => {
    if (process.env.DEBUG) {
        console.log(message);
    }
};