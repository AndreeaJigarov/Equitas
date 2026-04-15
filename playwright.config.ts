import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',

    /* Shared settings for all the projects below. */
    use: {
        /* BASE URL: Updated to match your Vite dev server port */
        baseURL: 'http://localhost:5173',

        /* Collect trace when retrying the failed test. */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        /* GOLD CHALLENGE: Enable Mobile Safari to test your "X" button and responsive navbar */
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13 Pro Max'],
                hasTouch: true,
            },
        },
    ],

    /* WEB SERVER: Automatically starts your React app before the tests run */
    webServer: {
        command: 'npm run dev',        // Uses Vite's dev command
        url: 'http://localhost:5173',  // Monitors this URL to ensure server is ready
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,           // Extra time for Vite to start on slower machines
    },
});