import { defineConfig, devices } from '@playwright/test'

// E2E sozlamasi. `npm run dev` ni avtomatik ishga tushiradi va localhost:3000 ga uradi.
// API testlarда mock qilingani uchun backend/DB SHART EMAS — faqat web dev server.
//
// Ishga tushirish:
//   npm i -D @playwright/test
//   npx playwright install chromium
//   npm run test:e2e
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  // Mobil ko'rinishда tekshiramiz (asosiy auditoriya — telefon)
  projects: [
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
