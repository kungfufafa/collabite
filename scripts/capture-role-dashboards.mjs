import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://collabite.test';
const OUT_DIR = path.resolve('public/demo-screenshots');

const ROLES = [
    {
        slug: 'admin',
        email: 'admin@collabite.test',
        password: 'password',
        urlPattern: /\/admin\/dashboard/,
    },
    {
        slug: 'umkm',
        email: 'umkm1@collabite.test',
        password: 'password',
        urlPattern: /\/umkm\/dashboard/,
    },
    {
        slug: 'creator',
        email: 'creator1@collabite.test',
        password: 'password',
        urlPattern: /\/creator\/dashboard/,
    },
];

async function loginAndCapture(page, role) {
    await page.context().clearCookies();
    await page.goto(`${BASE}/login`);
    await page.getByRole('textbox', { name: 'Email' }).fill(role.email);
    await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(role.password);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForURL(role.urlPattern, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({
        path: path.join(OUT_DIR, `${role.slug}-dashboard.png`),
        fullPage: true,
    });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

await mkdir(OUT_DIR, { recursive: true });

for (const role of ROLES) {
    await loginAndCapture(page, role);
    console.log(`Saved ${role.slug}-dashboard.png`);
}

await browser.close();
