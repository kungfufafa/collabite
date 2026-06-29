/**
 * Helper bersama untuk E2E spec — login/register harus menyertakan CSRF token
 * karena Laravel `web` middleware menolak POST tanpa token (HTTP 419).
 *
 * Playwright APIRequestContext otomatis menyimpan cookie laravel-session +
 * XSRF-TOKEN setelah GET /login, lalu kita teruskan token tersebut melalui
 * header `X-XSRF-TOKEN`.
 */
import type { APIRequestContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { execSync } from 'node:child_process';

const password = 'Password123!';

async function ensureCsrf(request: APIRequestContext, baseURL: string): Promise<string> {
    await request.get('/login');
    const cookies = await request.storageState();
    const xsrf = cookies.cookies.find((c) => c.name === 'XSRF-TOKEN' && c.domain.includes(new URL(baseURL).hostname));

    if (!xsrf) {
        throw new Error('XSRF-TOKEN cookie not set after GET /login. Pastikan Herd menyajikan http://collabite.test.');
    }

    return decodeURIComponent(xsrf.value);
}

export async function registerUmkm(
    request: APIRequestContext,
    baseURL: string,
    email: string,
    name = 'UMKM E2E',
    extras: Record<string, string> = {},
): Promise<void> {
    const token = await ensureCsrf(request, baseURL);
    const res = await request.post('/register/umkm', {
        headers: {
            'X-XSRF-TOKEN': token,
            Accept: 'text/html,application/xhtml+xml',
        },
        form: {
            name,
            email,
            password,
            password_confirmation: password,
            business_name: `${name} Biz`,
            business_type: 'Retail',
            ...extras,
        },
        maxRedirects: 0,
    });

    expect([200, 302]).toContain(res.status());

    // Verify email using artisan
    execSync(`php artisan tinker --execute="App\\Models\\User::where('email', '${email}')->update(['email_verified_at' => now()]);"`);
}

export async function registerCreator(
    request: APIRequestContext,
    baseURL: string,
    email: string,
    name = 'Creator E2E',
    extras: Record<string, string> = {},
): Promise<void> {
    const token = await ensureCsrf(request, baseURL);
    const res = await request.post('/register/creator', {
        headers: {
            'X-XSRF-TOKEN': token,
            Accept: 'text/html,application/xhtml+xml',
        },
        form: {
            name,
            email,
            password,
            password_confirmation: password,
            ...extras,
        },
        maxRedirects: 0,
    });

    expect([200, 302]).toContain(res.status());

    // Verify email using artisan
    execSync(`php artisan tinker --execute="App\\Models\\User::where('email', '${email}')->update(['email_verified_at' => now()]);"`);
}

export async function loginPage(page: Page, email: string): Promise<void> {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForLoadState('networkidle');
}

/**
 * Re-fetch a fresh CSRF token using the current request context.
 * Use this AFTER `context.clearCookies()` (e.g. between role switches in a
 * scenario) so the new laravel-session has its own XSRF-TOKEN.
 */
export async function refreshCsrf(
    request: APIRequestContext,
    baseURL: string,
): Promise<string> {
    return ensureCsrf(request, baseURL);
}

export { password as E2E_PASSWORD };
