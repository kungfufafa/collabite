/**
 * TC-E2E-004 — Portal smoke + supporting actions (Opsi B).
 *
 * Di luar siklus kolaborasi penuh: landing/public, shell tiap role,
 * settings/notifikasi, dan 1–2 aksi ringan pendukung.
 *
 * Spec: docs/superpowers/specs/2026-07-27-e2e-portal-smoke-supporting-design.md
 * Run:  npx playwright test tests/E2E/08-portal-smoke-supporting.spec.ts
 *       npm run test:e2e:smoke
 */
import { expect, test } from '@playwright/test';

import {
    clearLoginRateLimit,
    loginSeededUser,
    logoutSession,
    seededPublicCreatorProfileId,
    seededPublicUmkmProfileId,
    visitOk,
} from './_helpers';

const SEED = {
    admin: 'admin@collabite.test',
    umkm: 'umkm1@collabite.test',
    creator: 'creator1@collabite.test',
} as const;

test.describe.serial('E2E-08 Public landing & legal', () => {
    test('landing and public directory pages render', async ({ page }) => {
        await visitOk(page, '/');
        await expect(page.getByRole('link', { name: /Collabite/i }).first()).toBeVisible();

        await visitOk(page, '/creators');
        await expect(page.getByRole('heading').first()).toBeVisible();

        const creatorId = seededPublicCreatorProfileId();
        await visitOk(page, `/creators/${creatorId}`);

        const umkmId = seededPublicUmkmProfileId();
        await visitOk(page, `/umkm/${umkmId}`);
    });

    test('legal and auth guest pages render', async ({ page }) => {
        await visitOk(page, '/syarat-dan-ketentuan');
        await expect(page.getByRole('heading').first()).toBeVisible();

        await visitOk(page, '/kebijakan-privasi');
        await expect(page.getByRole('heading').first()).toBeVisible();

        await visitOk(page, '/login');
        await expect(page.getByLabel(/Email/i).first()).toBeVisible();

        await visitOk(page, '/register');
        await expect(page.getByRole('heading').first()).toBeVisible();

        await visitOk(page, '/forgot-password');
        await page.getByLabel(/Email/i).fill('someone@example.com');
        await page.getByRole('button', { name: /Kirim Tautan Reset/i }).click();
        // Anti-enumerasi: tetap di flow forgot / ada status generik, bukan error "email tidak ada".
        await expect(page).toHaveURL(/forgot-password/);
        await expect(page.locator('body')).not.toContainText(/tidak terdaftar|not found/i);
    });
});

test.describe.serial('E2E-08 UMKM shell + supporting', () => {
    test.beforeEach(async ({ page }) => {
        clearLoginRateLimit(SEED.umkm);
        await logoutSession(page);
        await loginSeededUser(page, SEED.umkm);
    });

    test('UMKM nav pages open without blank/500', async ({ page }) => {
        const paths = [
            '/umkm/dashboard',
            '/umkm/campaigns',
            '/umkm/campaigns/create',
            '/umkm/discover',
            '/umkm/collaborations',
            '/umkm/profile',
            '/umkm/products',
            '/umkm/reviews',
        ];
        for (const path of paths) {
            await visitOk(page, path);
        }
    });

    test('UMKM discover filter and profile save', async ({ page }) => {
        await visitOk(page, '/umkm/discover');
        await page.getByLabel(/Kata kunci/i).fill('creator');
        await page.getByRole('button', { name: /Terapkan filter/i }).click();
        await expect(page).toHaveURL(/\/umkm\/discover/);
        await expect(page.getByRole('heading').first()).toBeVisible();

        await visitOk(page, '/umkm/profile');
        const desc = `Deskripsi smoke E2E ${Date.now()}`;
        await page.getByLabel(/Deskripsi/i).fill(desc);
        await page.getByRole('button', { name: /Simpan Perubahan/i }).click();
        await expect(page.getByText(/berhasil|disimpan|diperbarui/i).first()).toBeVisible({
            timeout: 10_000,
        });
        await page.reload();
        await expect(page.getByLabel(/Deskripsi/i)).toHaveValue(desc);
    });

    test('UMKM can add a minimal product', async ({ page }) => {
        await visitOk(page, '/umkm/products');
        const name = `Produk Smoke ${Date.now()}`;
        await page.getByRole('textbox', { name: 'Nama Produk', exact: true }).fill(name);
        await page.getByRole('button', { name: /^Tambah Produk$/i }).click();
        await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
    });
});

test.describe.serial('E2E-08 Creator shell + supporting', () => {
    test.beforeEach(async ({ page }) => {
        clearLoginRateLimit(SEED.creator);
        await logoutSession(page);
        await loginSeededUser(page, SEED.creator);
    });

    test('Creator nav pages open without blank/500', async ({ page }) => {
        const paths = [
            '/creator/dashboard',
            '/creator/campaigns',
            '/creator/collaborations',
            '/creator/requests',
            '/creator/profile',
            '/creator/portfolio',
            '/creator/skills',
            '/creator/verification',
        ];
        for (const path of paths) {
            await visitOk(page, path);
        }
    });

    test('Creator profile headline and skills save', async ({ page }) => {
        await visitOk(page, '/creator/profile');
        const headline = `Headline smoke ${Date.now()}`;
        await page.getByLabel(/^Headline$/i).fill(headline);
        await page.getByRole('button', { name: /^Simpan$/i }).click();
        await page.waitForLoadState('networkidle');
        await page.reload();
        await expect(page.getByLabel(/^Headline$/i)).toHaveValue(headline);

        await visitOk(page, '/creator/skills');
        const checkbox = page.getByRole('checkbox').first();
        if (await checkbox.isVisible().catch(() => false)) {
            const before = await checkbox.getAttribute('data-state');
            await checkbox.click();
            await page.getByRole('button', { name: /^Simpan$/i }).click();
            await page.waitForLoadState('networkidle');
            await page.reload();
            const after = await page.getByRole('checkbox').first().getAttribute('data-state');
            expect(after).not.toBe(before);
        } else {
            await expect(page.getByRole('heading').first()).toBeVisible();
        }
    });
});

test.describe.serial('E2E-08 Admin shell + supporting', () => {
    test.beforeEach(async ({ page }) => {
        clearLoginRateLimit(SEED.admin);
        await logoutSession(page);
        await loginSeededUser(page, SEED.admin);
    });

    test('Admin nav pages open without blank/500', async ({ page }) => {
        const paths = [
            '/admin/dashboard',
            '/admin/users',
            '/admin/verifications',
            '/admin/moderation/campaigns',
            '/admin/moderation/content',
            '/admin/moderation/reviews',
            '/admin/collaborations',
            '/admin/audit-logs',
            '/admin/reports',
        ];
        for (const path of paths) {
            await visitOk(page, path);
        }
    });

    test('Admin can open a detail and sees reports controls', async ({ page }) => {
        await visitOk(page, '/admin/users');
        const detail = page.getByRole('link', { name: /Detail|Lihat|Show/i }).first();
        if (await detail.isVisible().catch(() => false)) {
            await detail.click();
            await expect(page).toHaveURL(/\/admin\/users|\/admin\//);
            await expect(page.locator('body')).not.toHaveText(/^$/);
        }

        await visitOk(page, '/admin/verifications');
        const vDetail = page.getByRole('link', { name: /Detail|Lihat|Tinjau/i }).first();
        if (await vDetail.isVisible().catch(() => false)) {
            await vDetail.click();
            await expect(page.locator('body')).toBeVisible();
        }

        await visitOk(page, '/admin/reports');
        await expect(page.getByRole('link', { name: /Ekspor CSV/i })).toBeVisible();
        await expect(page.getByLabel(/Jenis ekspor CSV/i)).toBeVisible();
    });
});

test.describe.serial('E2E-08 Shared settings & notifications', () => {
    test('UMKM notifications and settings profile/security/appearance', async ({ page }) => {
        clearLoginRateLimit(SEED.umkm);
        await logoutSession(page);
        await loginSeededUser(page, SEED.umkm);

        await visitOk(page, '/notifications');
        await expect(page.getByRole('heading').first()).toBeVisible();

        await visitOk(page, '/settings/profile');
        const stamp = `UMKM Smoke ${Date.now()}`;
        await page.getByLabel(/^Nama$/i).fill(stamp);
        await page.getByRole('button', { name: /^Simpan$/i }).click();
        await page.waitForLoadState('networkidle');
        // Settings memakai toast Inertia ("Profile updated.") — verifikasi via nilai tersimpan.
        await page.reload();
        await expect(page.getByLabel(/^Nama$/i)).toHaveValue(stamp);

        await visitOk(page, '/settings/security');
        // RequirePassword: bisa land di form konfirmasi kata sandi dulu.
        await expect(
            page.getByText(/Keamanan|Ubah Password|Konfirmasi kata sandi|Kata Sandi/i).first(),
        ).toBeVisible();

        await visitOk(page, '/settings/appearance');
        await expect(page.getByText(/Tampilan|Terang|Gelap/i).first()).toBeVisible();
    });
});

test.describe.serial('E2E-08 Auth guards smoke', () => {
    test('guest is redirected away from UMKM dashboard', async ({ page }) => {
        await logoutSession(page);
        await page.goto('/umkm/dashboard');
        await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });

    test('creator cannot open admin dashboard as admin', async ({ page }) => {
        clearLoginRateLimit(SEED.creator);
        await logoutSession(page);
        await loginSeededUser(page, SEED.creator);
        const res = await page.goto('/admin/dashboard');
        expect(res?.status()).toBe(403);
        await expect(page.getByText(/tidak memiliki akses/i)).toBeVisible();
    });
});
