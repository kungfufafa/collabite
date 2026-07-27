import { expect } from '@playwright/test';

import { loginPage } from '../../_helpers';
import { narrate } from '../demo-helpers';
import { pngFile, type DemoCtx } from './types';

/** BABAK 9 — Workspace penuh pada kolaborasi via lamaran. */
export async function workspaceDealModule(ctx: DemoCtx): Promise<void> {
    const { page, context, creatorEmail, umkmEmail, collabApplyId } = ctx;
    if (!collabApplyId) {
        throw new Error('collabApplyId belum di-set');
    }

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await page.goto(`/creator/collaborations/${collabApplyId}`);
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'Creator membuka workspace kolaborasi',
        note: 'Semua komunikasi & pengerjaan tercatat di sini.',
    });

    await page.getByRole('tab', { name: /Pesan/ }).click();
    await page
        .locator('textarea[placeholder="Tulis pesan..."]')
        .fill('Halo, terima kasih. Saya mulai kerjakan konsep videonya ya.');
    await narrate(page, { scene: 'BABAK 9 — WORKSPACE', title: 'Creator mengirim pesan ke UMKM' }, 1200);
    await page
        .locator('form:has(textarea[placeholder="Tulis pesan..."]) button[type="submit"]')
        .click();
    // Cek bubble pesan saja (textarea dikontrol React; resetOnSuccess tidak selalu kosongkan value).
    await expect(
        page.locator('div.mt-1.text-sm', {
            hasText: /Saya mulai kerjakan konsep videonya/i,
        }),
    ).toBeVisible();

    await page.getByRole('tab', { name: /Progres/ }).click();
    await page.getByLabel('Update progres...').fill('Progress 50%: proses editing video berjalan.');
    await page.getByRole('button', { name: 'Posting Progres' }).click();
    await expect(
        page.locator('div.mt-1.text-sm', {
            hasText: /proses editing video berjalan/i,
        }),
    ).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'Creator memperbarui progres pekerjaan',
    });

    await page.getByTestId('collaboration-tab-content').click();
    await page.getByLabel('Judul', { exact: true }).fill('Draft video v1');
    await page.locator('input[name="files[]"]').setInputFiles(pngFile('video-v1.png'));
    await page.getByLabel('Deskripsi', { exact: true }).fill('Draft pertama, mohon direview.');
    await narrate(
        page,
        {
            scene: 'BABAK 9 — WORKSPACE',
            title: 'Creator mengunggah hasil konten (v1)',
            note: 'Lalu mengirimkannya untuk direview UMKM.',
        },
        1500,
    );
    await page.getByRole('button', { name: 'Upload Submission' }).click();
    await expect(page.getByText(/Submission v\d+ berhasil dibuat/i)).toBeVisible();
    await page.getByTestId('collaboration-tab-content').click();
    await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();
    await expect(page.getByText('Dalam Review')).toBeVisible();

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await page.goto(`/umkm/collaborations/${collabApplyId}`);
    await page.getByTestId('collaboration-tab-content').click();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM meninjau konten & meminta revisi',
        note: 'Alur revisi tercatat rapi, bukan lewat chat acak.',
    });
    await page.getByRole('button', { name: 'Minta Revisi' }).click();
    await page
        .getByPlaceholder('Tulis apa yang harus diperbaiki creator...')
        .fill('Perbaiki warna dan tambahkan CTA di akhir video.');
    await page.getByRole('button', { name: 'Kirim Permintaan Revisi' }).click();
    await expect(page.getByText('Revisi Diminta')).toBeVisible();

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await page.goto(`/creator/collaborations/${collabApplyId}`);
    await page.getByTestId('collaboration-tab-content').click();
    await page.getByLabel('Judul', { exact: true }).fill('Revisi video v2');
    await page.locator('input[name="files[]"]').setInputFiles(pngFile('video-v2.png'));
    await page.getByLabel('Deskripsi', { exact: true }).fill('Sudah disesuaikan dengan masukan UMKM.');
    await narrate(page, { scene: 'BABAK 9 — WORKSPACE', title: 'Creator mengirim revisi (v2)' }, 1500);
    await page.getByRole('button', { name: 'Upload Revisi' }).click();
    await page.getByRole('button', { name: 'Kirim untuk Review' }).first().click();
    await expect(page.getByText('Dalam Review').first()).toBeVisible();

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await page.goto(`/umkm/collaborations/${collabApplyId}`);
    await page.getByTestId('collaboration-tab-content').click();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM menyetujui hasil revisi',
    });
    await page.getByRole('button', { name: 'Setujui' }).click();
    await expect(page.getByText(/^Disetujui/)).toBeVisible();

    const paymentTab = page.getByRole('tab', { name: /Pembayaran/ });
    if (await paymentTab.isVisible().catch(() => false)) {
        await paymentTab.click();
        await narrate(page, { scene: 'BABAK 9 — WORKSPACE', title: 'UMKM mengunggah bukti pembayaran' }, 1500);
        await page.locator('input[name="proof"]').setInputFiles(pngFile('bukti-transfer.png'));
        await page.getByRole('button', { name: 'Kirim Bukti Pembayaran' }).click();
        await expect(page.getByText(/Menunggu Konfirmasi Creator/i)).toBeVisible();

        await context.clearCookies();
        await loginPage(page, creatorEmail);
        await page.goto(`/creator/collaborations/${collabApplyId}`);
        await page.getByRole('tab', { name: /Pembayaran/ }).click();
        await narrate(
            page,
            { scene: 'BABAK 9 — WORKSPACE', title: 'Creator mengonfirmasi pembayaran diterima' },
            1500,
        );
        await page.getByRole('button', { name: 'Konfirmasi Pembayaran Diterima' }).click();
        await expect(page.getByText(/Pembayaran telah dikonfirmasi/i)).toBeVisible();

        await context.clearCookies();
        await loginPage(page, umkmEmail);
        await page.goto(`/umkm/collaborations/${collabApplyId}`);
    }

    page.once('dialog', (d) => d.accept());
    await page.getByRole('tab', { name: /Review/ }).click();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM menyelesaikan kolaborasi',
        note: 'Kolaborasi selesai — kini kedua pihak saling memberi review.',
    });
    await page.getByRole('button', { name: 'Selesaikan Kolaborasi' }).click();
    await expect(page.getByText(/^Selesai$/)).toBeVisible();
    await page.getByLabel('Ulasan').fill('Hasil konten sesuai brief, komunikasi lancar. Puas!');
    await page.getByRole('button', { name: 'Kirim Review' }).click();
    await expect(page.getByText('★5/5').first()).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM memberi rating & review untuk Creator',
    });

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await page.goto(`/creator/collaborations/${collabApplyId}`);
    await page.getByRole('tab', { name: /Review/ }).click();
    await page.getByLabel('Ulasan').fill('Brief jelas dan pembayaran lancar. Terima kasih!');
    await page.getByRole('button', { name: 'Kirim Review' }).click();
    await expect(page.getByText('★5/5')).toHaveCount(2);
    await narrate(
        page,
        {
            scene: 'BABAK 9 — SELESAI',
            title: 'Kolaborasi selesai penuh & di-review dua arah',
            note: 'Reputasi kedua pihak kini terekam di platform.',
        },
        3000,
    );
}
