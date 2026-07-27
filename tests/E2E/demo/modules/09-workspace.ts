import { expect } from '@playwright/test';

import { loginPage } from '../../_helpers';
import { demoClick, demoGoto, narrate } from '../demo-helpers';
import { pngFile, type DemoCtx } from './types';

/** BABAK 9 — Workspace penuh pada kolaborasi via lamaran. */
export async function workspaceDealModule(ctx: DemoCtx): Promise<void> {
    const { page, context, creatorEmail, umkmEmail, collabApplyId } = ctx;
    if (!collabApplyId) {
        throw new Error('collabApplyId belum di-set');
    }

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await demoGoto(page, `/creator/collaborations/${collabApplyId}`);
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'Creator membuka workspace kolaborasi',
        note: 'Semua komunikasi & pengerjaan tercatat di sini.',
    });

    await demoClick(
        page.getByRole('tab', { name: /Pesan/ }),
        'Membuka tab pesan',
    );
    await page
        .locator('textarea[placeholder="Tulis pesan..."]')
        .fill('Halo, terima kasih. Saya mulai kerjakan konsep videonya ya.');
    await narrate(
        page,
        {
            scene: 'BABAK 9 — WORKSPACE',
            title: 'Creator mengirim pesan ke UMKM',
        },
        1200,
    );
    await demoClick(
        page.locator(
            'form:has(textarea[placeholder="Tulis pesan..."]) button[type="submit"]',
        ),
        'Mengirim pesan ke UMKM',
    );
    // Cek bubble pesan saja (textarea dikontrol React; resetOnSuccess tidak selalu kosongkan value).
    await expect(
        page.locator('div.mt-1.text-sm', {
            hasText: /Saya mulai kerjakan konsep videonya/i,
        }),
    ).toBeVisible();

    await demoClick(
        page.getByRole('tab', { name: /Progres/ }),
        'Membuka tab progres',
    );
    await page
        .getByLabel('Update progres...')
        .fill('Progress 50%: proses editing video berjalan.');
    await demoClick(
        page.getByRole('button', { name: 'Posting Progres' }),
        'Memposting progres Creator',
    );
    await expect(
        page.locator('div.mt-1.text-sm', {
            hasText: /proses editing video berjalan/i,
        }),
    ).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'Creator memperbarui progres pekerjaan',
    });

    await demoClick(
        page.getByTestId('collaboration-tab-content'),
        'Membuka tab konten',
    );
    await page.getByLabel('Judul', { exact: true }).fill('Draft video v1');
    await page
        .locator('input[name="files[]"]')
        .setInputFiles(pngFile('video-v1.png'));
    await page
        .getByLabel('Deskripsi', { exact: true })
        .fill('Draft pertama, mohon direview.');
    await narrate(
        page,
        {
            scene: 'BABAK 9 — WORKSPACE',
            title: 'Creator mengunggah hasil konten (v1)',
            note: 'Lalu mengirimkannya untuk direview UMKM.',
        },
        1500,
    );
    await demoClick(
        page.getByRole('button', { name: 'Upload Submission' }),
        'Mengunggah submission pertama',
    );
    await expect(
        page.getByText(/Submission v\d+ berhasil dibuat/i),
    ).toBeVisible();
    await demoClick(
        page.getByTestId('collaboration-tab-content'),
        'Membuka detail submission',
    );
    await demoClick(
        page.getByRole('button', { name: 'Kirim untuk Review' }).first(),
        'Mengirim submission untuk review',
    );
    await expect(page.getByText('Dalam Review')).toBeVisible();

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await demoGoto(page, `/umkm/collaborations/${collabApplyId}`);
    await demoClick(
        page.getByTestId('collaboration-tab-content'),
        'Membuka submission untuk ditinjau',
    );
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM meninjau konten & meminta revisi',
        note: 'Alur revisi tercatat rapi, bukan lewat chat acak.',
    });
    await demoClick(
        page.getByRole('button', { name: 'Minta Revisi' }),
        'Membuka formulir revisi',
    );
    await page
        .getByPlaceholder('Tulis apa yang harus diperbaiki creator...')
        .fill('Perbaiki warna dan tambahkan CTA di akhir video.');
    await demoClick(
        page.getByRole('button', { name: 'Kirim Permintaan Revisi' }),
        'Mengirim permintaan revisi',
    );
    await expect(page.getByText('Revisi Diminta')).toBeVisible();

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await demoGoto(page, `/creator/collaborations/${collabApplyId}`);
    await demoClick(
        page.getByTestId('collaboration-tab-content'),
        'Membuka revisi yang diminta UMKM',
    );
    await page.getByLabel('Judul', { exact: true }).fill('Revisi video v2');
    await page
        .locator('input[name="files[]"]')
        .setInputFiles(pngFile('video-v2.png'));
    await page
        .getByLabel('Deskripsi', { exact: true })
        .fill('Sudah disesuaikan dengan masukan UMKM.');
    await narrate(
        page,
        { scene: 'BABAK 9 — WORKSPACE', title: 'Creator mengirim revisi (v2)' },
        1500,
    );
    await demoClick(
        page.getByRole('button', { name: 'Upload Revisi' }),
        'Mengunggah revisi Creator',
    );
    await demoClick(
        page.getByRole('button', { name: 'Kirim untuk Review' }).first(),
        'Mengirim revisi untuk review',
    );
    await expect(page.getByText('Dalam Review').first()).toBeVisible();

    await context.clearCookies();
    await loginPage(page, umkmEmail);
    await demoGoto(page, `/umkm/collaborations/${collabApplyId}`);
    await demoClick(
        page.getByTestId('collaboration-tab-content'),
        'Membuka revisi untuk disetujui',
    );
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM menyetujui hasil revisi',
    });
    await demoClick(
        page.getByRole('button', { name: 'Setujui' }),
        'Menyetujui hasil revisi',
    );
    await expect(page.getByText(/^Disetujui/)).toBeVisible();

    const paymentTab = page.getByRole('tab', { name: /Pembayaran/ });
    if (await paymentTab.isVisible().catch(() => false)) {
        await demoClick(paymentTab, 'Membuka tab pembayaran');
        await narrate(
            page,
            {
                scene: 'BABAK 9 — WORKSPACE',
                title: 'UMKM mengunggah bukti pembayaran',
            },
            1500,
        );
        await page
            .locator('input[name="proof"]')
            .setInputFiles(pngFile('bukti-transfer.png'));
        await demoClick(
            page.getByRole('button', { name: 'Kirim Bukti Pembayaran' }),
            'Mengirim bukti pembayaran',
        );
        await expect(
            page.getByText(/Menunggu Konfirmasi Creator/i),
        ).toBeVisible();

        await context.clearCookies();
        await loginPage(page, creatorEmail);
        await demoGoto(page, `/creator/collaborations/${collabApplyId}`);
        await demoClick(
            page.getByRole('tab', { name: /Pembayaran/ }),
            'Membuka pembayaran sebagai Creator',
        );
        await narrate(
            page,
            {
                scene: 'BABAK 9 — WORKSPACE',
                title: 'Creator mengonfirmasi pembayaran diterima',
            },
            1500,
        );
        await demoClick(
            page.getByRole('button', {
                name: 'Konfirmasi Pembayaran Diterima',
            }),
            'Mengonfirmasi pembayaran diterima',
        );
        await expect(
            page.getByText(/Pembayaran telah dikonfirmasi/i),
        ).toBeVisible();

        await context.clearCookies();
        await loginPage(page, umkmEmail);
        await demoGoto(page, `/umkm/collaborations/${collabApplyId}`);
    }

    page.once('dialog', (d) => d.accept());
    await demoClick(
        page.getByRole('tab', { name: /Review/ }),
        'Membuka tab review',
    );
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM menyelesaikan kolaborasi',
        note: 'Kolaborasi selesai — kini kedua pihak saling memberi review.',
    });
    await demoClick(
        page.getByRole('button', { name: 'Selesaikan Kolaborasi' }),
        'Menyelesaikan kolaborasi',
    );
    await expect(page.getByText(/^Selesai$/)).toBeVisible();
    await page
        .getByLabel('Ulasan')
        .fill('Hasil konten sesuai brief, komunikasi lancar. Puas!');
    await demoClick(
        page.getByRole('button', { name: 'Kirim Review' }),
        'Mengirim review UMKM',
    );
    await expect(page.getByText('★5/5').first()).toBeVisible();
    await narrate(page, {
        scene: 'BABAK 9 — WORKSPACE',
        title: 'UMKM memberi rating & review untuk Creator',
    });

    await context.clearCookies();
    await loginPage(page, creatorEmail);
    await demoGoto(page, `/creator/collaborations/${collabApplyId}`);
    await demoClick(
        page.getByRole('tab', { name: /Review/ }),
        'Membuka review sebagai Creator',
    );
    await page
        .getByLabel('Ulasan')
        .fill('Brief jelas dan pembayaran lancar. Terima kasih!');
    await demoClick(
        page.getByRole('button', { name: 'Kirim Review' }),
        'Mengirim review Creator',
    );
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
