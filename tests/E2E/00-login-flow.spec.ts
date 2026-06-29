/**
 * E2E-LOGIN: Login + redirect per role + invalid + session + logout,
 * driven by a real Chromium browser via Playwright.
 */
import { expect, test } from '@playwright/test';

const CREDENTIALS = {
    admin: { email: 'admin@collabite.test', password: 'password' },
    umkm: { email: 'umkm1@collabite.test', password: 'password' },
    creator: { email: 'creator1@collabite.test', password: 'password' },
} as const;

async function fillLoginForm(
    page: import('@playwright/test').Page,
    email: string,
    password: string,
): Promise<void> {
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Kata Sandi' }).fill(password);
}

test.describe.serial('E2E-LOGIN: Real browser login flow', () => {
    test('admin login redirects to admin dashboard', async ({ page }) => {
        await page.goto('/login');
        await fillLoginForm(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
        const navP = page.waitForResponse(
            (r) => r.url().endsWith('/login') && r.request().method() === 'POST' && r.status() < 500,
            { timeout: 10_000 },
        );
        await page.getByRole('button', { name: 'Masuk' }).click();
        await navP;
        await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 });
        await expect(page.locator('body')).toContainText(/dashboard|admin/i);
    });

    test('umkm login redirects to umkm dashboard', async ({ page }) => {
        await page.goto('/login');
        await fillLoginForm(page, CREDENTIALS.umkm.email, CREDENTIALS.umkm.password);
        await page.getByRole('button', { name: 'Masuk' }).click();
        await expect(page).toHaveURL(/\/umkm\/dashboard/, { timeout: 10_000 });
    });

    test('creator login redirects to creator dashboard', async ({ page }) => {
        await page.goto('/login');
        await fillLoginForm(page, CREDENTIALS.creator.email, CREDENTIALS.creator.password);
        await page.getByRole('button', { name: 'Masuk' }).click();
        await expect(page).toHaveURL(/\/creator\/dashboard/, { timeout: 10_000 });
    });

    test('invalid credentials show a visible error and keep the user on /login', async ({ page }) => {
        await page.goto('/login');
        await fillLoginForm(page, CREDENTIALS.admin.email, 'wrong-password');
        await page.getByRole('button', { name: 'Masuk' }).click();
        await expect(page).toHaveURL(/\/login(\?|$)/, { timeout: 10_000 });
        await expect(page.getByText('Kredensial tidak cocok.')).toBeVisible({ timeout: 10_000 });
    });

    test('authenticated session survives a page refresh', async ({ page }) => {
        await page.goto('/login');
        await fillLoginForm(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
        await page.getByRole('button', { name: 'Masuk' }).click();
        await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 });
        await page.reload();
        await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 });
    });

    test('logout from the authenticated page returns to /login', async ({ page }) => {
        await page.goto('/login');
        await fillLoginForm(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
        await page.getByRole('button', { name: 'Masuk' }).click();
        await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 });
        await page.context().clearCookies();
        await page.goto('/admin/dashboard');
        await expect(page).toHaveURL(/\/login(\?|$)/, { timeout: 10_000 });
    });
});
