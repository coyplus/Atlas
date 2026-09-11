import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  webServer: process.env.ATLAS_TEST_URL?.includes('4174')
    ? {
        command: 'npm run preview -- --port 4174',
        url: 'http://localhost:4174',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
      }
    : undefined,
  timeout: 45000,
  fullyParallel: false,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/browser' }]],
  use: {
    baseURL: process.env.ATLAS_TEST_URL || 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'] } },
  ],
});
