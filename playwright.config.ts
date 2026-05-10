import { defineConfig, devices } from "@playwright/test";

const webBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const apiBaseUrl = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:4000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: webBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: [
    {
      command: "npm run start:api",
      url: `${apiBaseUrl}/public/site`,
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        WEB_ORIGIN: webBaseUrl
      }
    },
    {
      command: "npm run start:web",
      url: webBaseUrl,
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_API_URL: apiBaseUrl,
        WEB_ORIGIN: webBaseUrl
      }
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ]
});
