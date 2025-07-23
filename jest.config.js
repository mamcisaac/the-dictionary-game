module.exports = {
    testEnvironment: 'node',
    testTimeout: 60000, // 60 seconds for Puppeteer tests
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    verbose: true,
    collectCoverage: false, // Disable for Puppeteer tests
    maxWorkers: 1, // Run tests serially for Puppeteer
};