import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi khusus DEMO (bukan test regresi).
 *
 * - Berjalan headed (terlihat), lambat (slowMo), dan direkam video penuh.
 * - Hanya menjalankan spec di `tests/E2E/demo`.
 * - Mereset database ke kondisi seed sebelum mulai (globalSetup yang sama
 *   dengan E2E biasa), sehingga akun admin + kategori + skill tersedia.
 *
 * Jalankan: npm run test:e2e:demo
 * Atur tempo: DEMO_STEP_MS=3000 DEMO_SLOWMO=700 npm run test:e2e:demo
 */
const slowMo = Number(process.env.DEMO_SLOWMO ?? 700);
const headless = process.env.DEMO_HEADLESS === '1';

export default defineConfig({
    testDir: './tests/E2E/demo',
    timeout: 30 * 60_000,
    expect: { timeout: 15_000 },
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: 'list',
    globalSetup: './tests/E2E/_global-setup.ts',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://collabite.test',
        headless,
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1440, height: 900 } },
        trace: 'on',
        actionTimeout: 20_000,
        navigationTimeout: 30_000,
        launchOptions: { slowMo },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
