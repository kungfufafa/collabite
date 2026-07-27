/**
 * Helper khusus untuk skrip DEMO end-to-end (bukan test regresi).
 *
 * Tujuannya: menjalankan satu alur utuh Collabite secara otomatis sambil
 * menampilkan narasi di layar, agar tim cukup berbicara saat merekam video
 * demo. Semua fungsi di sini fokus pada keterbacaan visual, bukan kecepatan.
 *
 * Kecepatan/pacing bisa diatur lewat env:
 *   DEMO_STEP_MS  → jeda default tiap langkah narasi (ms). Default 2200.
 *   DEMO_SLOWMO   → slowMo Playwright (di config). Default 550.
 */
import type { Page } from '@playwright/test';
import { execSync } from 'node:child_process';

export const DEFAULT_STEP_MS = Number(process.env.DEMO_STEP_MS ?? 2200);

type BannerOpts = {
    /** Label babak, mis. "BABAK 1 — UMKM". */
    scene: string;
    /** Judul langkah, kalimat aksi utama. */
    title: string;
    /** Catatan/narasi tambahan opsional. */
    note?: string;
};

/**
 * Skrip yang di-inject ke SETIAP navigasi (bertahan melewati reload penuh):
 * - Kursor merah yang mengikuti mouse.
 * - Efek riak (ripple) setiap klik.
 * Membuat gerakan otomatis mudah diikuti penonton.
 */
export async function installDemoOverlay(page: Page): Promise<void> {
    await page.addInitScript(() => {
        const ensure = (): void => {
            if (document.getElementById('__demo_cursor__')) {
                return;
            }

            const dot = document.createElement('div');
            dot.id = '__demo_cursor__';
            dot.style.cssText = [
                'position:fixed',
                'z-index:2147483646',
                'width:24px',
                'height:24px',
                'margin:-12px 0 0 -12px',
                'border:3px solid #FF5A5F',
                'border-radius:50%',
                'background:rgba(255,90,95,.22)',
                'box-shadow:0 0 0 2px rgba(255,255,255,.7)',
                'pointer-events:none',
                'left:-100px',
                'top:-100px',
            ].join(';');
            document.documentElement.appendChild(dot);

            document.addEventListener(
                'mousemove',
                (e) => {
                    dot.style.left = `${e.clientX}px`;
                    dot.style.top = `${e.clientY}px`;
                },
                true,
            );

            document.addEventListener(
                'mousedown',
                (e) => {
                    const r = document.createElement('div');
                    r.style.cssText = [
                        'position:fixed',
                        'z-index:2147483646',
                        `left:${e.clientX}px`,
                        `top:${e.clientY}px`,
                        'width:12px',
                        'height:12px',
                        'margin:-6px 0 0 -6px',
                        'border-radius:50%',
                        'background:#FF5A5F',
                        'pointer-events:none',
                        'opacity:.75',
                        'transition:all .45s ease',
                    ].join(';');
                    document.documentElement.appendChild(r);
                    requestAnimationFrame(() => {
                        r.style.width = '52px';
                        r.style.height = '52px';
                        r.style.margin = '-26px 0 0 -26px';
                        r.style.opacity = '0';
                    });
                    setTimeout(() => r.remove(), 460);
                },
                true,
            );
        };

        if (document.readyState !== 'loading') {
            ensure();
        }

        document.addEventListener('DOMContentLoaded', ensure);
    });
}

/** Tampilkan banner narasi di atas halaman (dipasang ulang tiap dipanggil). */
export async function showBanner(page: Page, opts: BannerOpts): Promise<void> {
    await page
        .evaluate(({ scene, title, note }) => {
            const id = '__demo_banner__';
            document.getElementById(id)?.remove();

            const el = document.createElement('div');
            el.id = id;
            el.style.cssText = [
                'position:fixed',
                'top:0',
                'left:0',
                'right:0',
                'z-index:2147483647',
                'display:flex',
                'justify-content:center',
                'padding:12px',
                'pointer-events:none',
                'font-family:Inter,system-ui,-apple-system,sans-serif',
            ].join(';');

            el.innerHTML = `
                <div style="background:#111;color:#fff;border:3px solid #FFD23F;border-radius:12px;
                    box-shadow:5px 5px 0 0 rgba(0,0,0,.35);padding:10px 20px;max-width:920px;width:100%;">
                    <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#FFD23F;font-weight:800;">${scene}</div>
                    <div style="font-size:19px;font-weight:800;margin-top:3px;line-height:1.25;">${title}</div>
                    ${note ? `<div style="font-size:13px;opacity:.85;margin-top:3px;line-height:1.35;">${note}</div>` : ''}
                </div>`;
            document.documentElement.appendChild(el);
        }, opts)
        .catch(() => {
            // Halaman mungkin sedang bernavigasi; abaikan.
        });
}

let sceneShotIndex = 0;

function sceneSlug(opts: BannerOpts): string {
    return `${opts.scene}__${opts.title}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
}

/**
 * Tampilkan narasi lalu tahan sejenak agar presenter sempat berbicara.
 * Set DEMO_CAPTURE_SCENES=1 untuk menyimpan screenshot per babak
 * ke docs/demo-guide/assets/scenes/ (+ manifest.json untuk DOCX).
 */
export async function narrate(
    page: Page,
    opts: BannerOpts,
    waitMs: number = DEFAULT_STEP_MS,
): Promise<void> {
    await showBanner(page, opts);
    // Sedikit jeda agar banner & halaman settle sebelum capture/presentasi.
    await page.waitForTimeout(Math.min(waitMs, 900));

    if (process.env.DEMO_CAPTURE_SCENES === '1') {
        const fs = await import('node:fs');
        const dir = `${process.cwd()}/docs/demo-guide/assets/scenes`;
        fs.mkdirSync(dir, { recursive: true });

        if (sceneShotIndex === 0) {
            // Reset manifest untuk run baru.
            fs.writeFileSync(`${dir}/manifest.json`, '[]\n');
            fs.writeFileSync(`${dir}/scenes.tsv`, 'index\tscene\ttitle\tfile\n');
            for (const old of fs.readdirSync(dir)) {
                if (old.endsWith('.png')) {
                    fs.unlinkSync(`${dir}/${old}`);
                }
            }
        }

        sceneShotIndex += 1;
        const idx = String(sceneShotIndex).padStart(2, '0');
        const file = `${idx}-${sceneSlug(opts)}.png`;
        await page.screenshot({ path: `${dir}/${file}`, fullPage: false });

        const manifestPath = `${dir}/manifest.json`;
        const list = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Array<{
            index: number;
            scene: string;
            title: string;
            note: string;
            file: string;
        }>;
        list.push({
            index: sceneShotIndex,
            scene: opts.scene,
            title: opts.title,
            note: opts.note ?? '',
            file,
        });
        fs.writeFileSync(manifestPath, `${JSON.stringify(list, null, 2)}\n`);
        fs.appendFileSync(
            `${dir}/scenes.tsv`,
            `${idx}\t${opts.scene}\t${opts.title}\t${file}\n`,
        );
    }

    const remaining = waitMs - Math.min(waitMs, 900);
    if (remaining > 0) {
        await page.waitForTimeout(remaining);
    }
}

/** Tandai email user sebagai terverifikasi (agar bisa masuk dashboard). */
export function markEmailVerified(email: string): void {
    const safe = email.replace(/"/g, '\\"');
    execSync(
        `php artisan tinker --execute="App\\Models\\User::where('email', '${safe}')->update(['email_verified_at' => now()]);"`,
        { cwd: process.cwd(), stdio: 'ignore' },
    );
}
