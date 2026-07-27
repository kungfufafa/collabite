import { expect } from '@playwright/test';

import {
    E2E_PASSWORD,
    completeUmkmProfileForPublish,
    loginPage,
    prepareCreatorProfileForVerification,
} from '../../_helpers';
import { markEmailVerified, narrate } from '../demo-helpers';
import { pngFile, type DemoCtx } from './types';

/** BABAK 1 — UMKM daftar + profil siap publish. */
export async function registerUmkmModule(ctx: DemoCtx): Promise<void> {
    const { page, context, umkmEmail } = ctx;

    await context.clearCookies();
    await page.goto('/register?role=umkm');
    await narrate(page, {
        scene: 'BABAK 1 — UMKM',
        title: 'UMKM membuat akun baru',
        note: 'Mengisi data akun dan profil usaha.',
    });

    await page.locator('#umkm-name').fill('Kedai Kopi Sari Demo');
    await page.locator('#umkm-email').fill(umkmEmail);
    await page.locator('#umkm-password').fill(E2E_PASSWORD);
    await page.locator('#umkm-password-confirmation').fill(E2E_PASSWORD);
    await page.locator('#business_name').fill('Kedai Kopi Sari');
    await page.locator('#business_type').fill('F&B / Kuliner');
    await page.locator('#terms-umkm').click();
    await narrate(
        page,
        {
            scene: 'BABAK 1 — UMKM',
            title: 'Data pendaftaran UMKM terisi',
            note: 'Klik "Daftar sebagai UMKM".',
        },
        1500,
    );
    await page.getByRole('button', { name: 'Daftar sebagai UMKM' }).click();
    await page.waitForURL((url) => !url.pathname.includes('/register'), {
        timeout: 30_000,
    });
    markEmailVerified(umkmEmail);
    completeUmkmProfileForPublish(umkmEmail);
    await narrate(page, {
        scene: 'BABAK 1 — UMKM',
        title: 'Akun UMKM berhasil dibuat',
        note: 'Email terverifikasi & profil usaha lengkap.',
    });
}

/** BABAK 2 — Creator daftar + siap verifikasi. */
export async function registerCreatorModule(ctx: DemoCtx): Promise<void> {
    const { page, context, creatorEmail, creatorName } = ctx;

    await context.clearCookies();
    await page.goto('/register?role=creator');
    await narrate(page, {
        scene: 'BABAK 2 — CREATOR',
        title: 'Content Creator membuat akun baru',
        note: 'Mengisi data akun, kota, kategori, dan keahlian.',
    });

    await page.locator('#creator-name').fill(creatorName);
    await page.locator('#creator-email').fill(creatorEmail);
    await page.locator('#creator-password').fill(E2E_PASSWORD);
    await page.locator('#creator-password-confirmation').fill(E2E_PASSWORD);
    await page.locator('#city').fill('Bandung');
    await page.locator('label:has(input[name="category_ids[]"])').first().click();
    await page.locator('label:has(input[name="skill_ids[]"])').first().click();
    await page.locator('#terms-creator').click();
    await narrate(
        page,
        {
            scene: 'BABAK 2 — CREATOR',
            title: 'Data pendaftaran Creator terisi',
            note: 'Klik "Daftar sebagai Creator".',
        },
        1500,
    );
    await page.getByRole('button', { name: 'Daftar sebagai Creator' }).click();
    await page.waitForURL((url) => !url.pathname.includes('/register'), {
        timeout: 30_000,
    });
    markEmailVerified(creatorEmail);
    prepareCreatorProfileForVerification(creatorEmail);
    await narrate(page, {
        scene: 'BABAK 2 — CREATOR',
        title: 'Akun Creator berhasil dibuat',
        note: 'Profil & portofolio dilengkapi, siap mengajukan verifikasi.',
    });
}

/** BABAK 3a — Creator ajukan verifikasi. */
export async function creatorSubmitVerificationModule(ctx: DemoCtx): Promise<void> {
    const { page, creatorEmail } = ctx;

    await loginPage(page, creatorEmail);
    await expect(page).toHaveURL(/\/creator\/dashboard/);
    await narrate(page, {
        scene: 'BABAK 3 — CREATOR',
        title: 'Creator masuk ke dashboard',
        note: 'Agar tepercaya di marketplace, Creator mengajukan verifikasi identitas.',
    });

    await page.goto('/creator/verification');
    await expect(page.getByRole('heading', { name: 'Verifikasi Creator' })).toBeVisible();
    await page.locator('input[type="file"]').first().setInputFiles(pngFile('ktp.png'));
    await narrate(
        page,
        {
            scene: 'BABAK 3 — CREATOR',
            title: 'Creator mengunggah dokumen (KTP)',
            note: 'Klik "Kirim Pengajuan".',
        },
        1500,
    );
    await page.getByRole('button', { name: 'Kirim Pengajuan' }).click();
    await expect(page.getByText(/pending/i).first()).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 3 — CREATOR',
        title: 'Pengajuan verifikasi terkirim (status: pending)',
        note: 'Sekarang giliran Admin meninjau.',
    });
}
