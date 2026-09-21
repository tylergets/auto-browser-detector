import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: [['list'], ['./tests/results-reporter.js']],
  use: {
    baseURL: 'http://localhost:4173',
  },
  projects: [
    {
      name: 'chromium-headless',
      use: { browserName: 'chromium', headless: true },
    },
    {
      name: 'chromium-headed',
      use: { browserName: 'chromium', headless: false },
    },
  ],
  webServer: {
    command: 'npx http-server -p 4173 -c-1 .',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
