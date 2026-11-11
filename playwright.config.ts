import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web/e2e',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:3100' },
  webServer: {
    command:
      'npm run dev --workspace @rent-hub/web -- --hostname 127.0.0.1 --port 3100',
    reuseExistingServer: false,
    url: 'http://127.0.0.1:3100',
  },
});
