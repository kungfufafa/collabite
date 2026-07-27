/**
 * Helper khusus untuk skrip DEMO end-to-end (bukan test regresi).
 *
 * Tujuannya: menjalankan satu alur utuh Collabite secara otomatis sambil
 * menampilkan narasi di layar, agar tim cukup berbicara saat merekam video
 * demo. Semua fungsi di sini fokus pada keterbacaan visual, bukan kecepatan.
 *
 * Kecepatan/pacing bisa diatur lewat env:
 *   DEMO_STEP_MS  → jeda minimum tiap langkah narasi (ms). Default 7000.
 *   DEMO_SLOWMO   → slowMo Playwright (di config). Default 700.
 */
import type { Locator, Page } from '@playwright/test';
import { execSync } from 'node:child_process';

export const DEFAULT_STEP_MS = Number(process.env.DEMO_STEP_MS ?? 7000);

type BannerOpts = {
    /** Label babak, mis. "BABAK 1 — UMKM". */
    scene: string;
    /** Judul langkah, kalimat aksi utama. */
    title: string;
    /** Catatan/narasi tambahan opsional. */
    note?: string;
};

type DemoFlowStep = {
    scene: string;
    label: string;
};

const DEMO_FLOW_STEPS: DemoFlowStep[] = [
    { scene: 'BABAK 1', label: 'Registrasi UMKM' },
    { scene: 'BABAK 2', label: 'Registrasi Creator' },
    { scene: 'BABAK 3', label: 'Verifikasi Creator' },
    { scene: 'BABAK 4', label: 'Campaign UMKM' },
    { scene: 'BABAK 5', label: 'Undangan UMKM' },
    { scene: 'BABAK 6', label: 'Terima Undangan' },
    { scene: 'BABAK 7', label: 'Lamaran Creator' },
    { scene: 'BABAK 8', label: 'Deal Kolaborasi' },
    { scene: 'BABAK 9', label: 'Workspace & Review' },
    { scene: 'BABAK 10', label: 'Oversight Admin' },
];

/**
 * Skrip yang di-inject ke SETIAP navigasi (bertahan melewati reload penuh):
 * - Kursor merah yang mengikuti mouse.
 * - Efek riak (ripple) setiap klik.
 * Membuat gerakan otomatis mudah diikuti penonton.
 */
export async function installDemoOverlay(page: Page): Promise<void> {
    await page.addInitScript(
        ({ flowSteps, skipInvite }) => {
            const flowStorageKey = '__collabite_demo_flow_scene__';

            const renderFlow = (): void => {
                const id = '__demo_flow__';
                document.getElementById(id)?.remove();

                const activeScene =
                    sessionStorage.getItem(flowStorageKey) ?? 'PEMBUKA';
                const activeIndex = flowSteps.findIndex(({ scene }) =>
                    activeScene.startsWith(scene),
                );
                const isComplete = activeScene === 'PENUTUP';
                const el = document.createElement('aside');
                el.id = id;
                el.setAttribute('aria-label', 'Alur demo Collabite');
                el.style.cssText = [
                    'position:fixed',
                    'z-index:2147483646',
                    'top:112px',
                    'right:18px',
                    'width:248px',
                    'padding:14px',
                    'border:2px solid rgba(255,210,63,.95)',
                    'border-radius:14px',
                    'background:rgba(17,17,17,.94)',
                    'box-shadow:4px 4px 0 rgba(0,0,0,.25)',
                    'color:#fff',
                    'font-family:Inter,system-ui,-apple-system,sans-serif',
                    'pointer-events:none',
                ].join(';');

                const steps = flowSteps
                    .map(({ scene, label }, index) => {
                        const isSkipped =
                            skipInvite &&
                            index >= 4 &&
                            index <= 5 &&
                            (activeIndex > 5 || isComplete);
                        const isActive = index === activeIndex && !isComplete;
                        const isDone =
                            (index < activeIndex || isComplete) && !isSkipped;
                        const color = isActive
                            ? '#FFD23F'
                            : isDone
                              ? '#51CF66'
                              : '#9CA3AF';
                        const marker = isActive
                            ? '●'
                            : isDone
                              ? '✓'
                              : isSkipped
                                ? '–'
                                : '○';
                        const status = isActive
                            ? 'Sedang dijelaskan'
                            : isDone
                              ? 'Selesai'
                              : isSkipped
                                ? 'Dilewati'
                                : 'Berikutnya';

                        return `<li aria-label="${label}: ${status}" style="display:flex;gap:9px;align-items:center;padding:4px 0;color:${color};font-size:12px;font-weight:${isActive ? '800' : '600'};opacity:${isActive || isDone ? '1' : '.72'};">
                            <span aria-hidden="true" style="width:14px;text-align:center;font-size:14px;">${marker}</span>
                            <span style="flex:1;">${index + 1}. ${label}</span>
                        </li>`;
                    })
                    .join('');

                el.innerHTML = `
                    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#FFD23F;font-weight:800;">Peta Alur Demo</div>
                    <div style="font-size:13px;font-weight:800;margin:3px 0 7px;">${activeScene}</div>
                    <ol style="margin:0;padding:0;list-style:none;">${steps}</ol>`;
                document.documentElement.appendChild(el);
            };

            const ensure = (): void => {
                renderFlow();

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
        },
        {
            flowSteps: DEMO_FLOW_STEPS,
            skipInvite: process.env.DEMO_SKIP_INVITE === '1',
        },
    );
}

/** Tampilkan banner narasi di atas halaman (dipasang ulang tiap dipanggil). */
export async function showBanner(page: Page, opts: BannerOpts): Promise<void> {
    await page
        .evaluate(({ scene, title, note }) => {
            sessionStorage.setItem('__collabite_demo_flow_scene__', scene);
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

            document.getElementById('__demo_flow__')?.remove();
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }, opts)
        .catch(() => {
            // Halaman mungkin sedang bernavigasi; abaikan.
        });
}

async function showActionCue(
    page: Page,
    message: string,
    target?: { x: number; y: number; width: number; height: number },
): Promise<void> {
    await page.evaluate(
        ({ message, target }) => {
            document.getElementById('__demo_action_cue__')?.remove();
            document.getElementById('__demo_action_target__')?.remove();

            const cue = document.createElement('div');
            cue.id = '__demo_action_cue__';
            cue.textContent = message;
            cue.style.cssText = [
                'position:fixed',
                'z-index:2147483647',
                'right:18px',
                'bottom:18px',
                'padding:10px 14px',
                'border:2px solid #FFD23F',
                'border-radius:10px',
                'background:rgba(17,17,17,.94)',
                'box-shadow:3px 3px 0 rgba(0,0,0,.25)',
                'color:#fff',
                'font:700 13px Inter,system-ui,-apple-system,sans-serif',
                'pointer-events:none',
            ].join(';');
            document.documentElement.appendChild(cue);

            if (!target) {
                return;
            }

            const outline = document.createElement('div');
            outline.id = '__demo_action_target__';
            outline.style.cssText = [
                'position:fixed',
                'z-index:2147483646',
                `left:${target.x - 6}px`,
                `top:${target.y - 6}px`,
                `width:${target.width + 12}px`,
                `height:${target.height + 12}px`,
                'border:3px solid #FFD23F',
                'border-radius:8px',
                'box-shadow:0 0 0 5px rgba(255,210,63,.22)',
                'pointer-events:none',
                'transition:opacity .2s ease',
            ].join(';');
            document.documentElement.appendChild(outline);
        },
        { message, target },
    );
}

/** Gulir, sorot, dan klik target agar aksi otomatis mudah diikuti. */
export async function demoClick(
    locator: Locator,
    label = 'Klik target yang disorot',
): Promise<void> {
    await locator.evaluate((element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    });
    await locator.page().waitForTimeout(650);
    await locator.scrollIntoViewIfNeeded();

    const box = await locator.boundingBox();
    const page = locator.page();

    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
            steps: 14,
        });
        await showActionCue(page, label, box);
        await page.waitForTimeout(700);
    }

    await locator.click();
    await page.waitForTimeout(500);
}

/** Beri penanda visual sebelum berpindah halaman otomatis. */
export async function demoGoto(page: Page, url: string): Promise<void> {
    await showActionCue(page, 'Berpindah ke halaman berikutnya');
    await page.waitForTimeout(700);
    await page.goto(url);
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
    requestedWaitMs: number = DEFAULT_STEP_MS,
): Promise<void> {
    const waitMs = Math.max(requestedWaitMs, DEFAULT_STEP_MS);

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
            fs.writeFileSync(
                `${dir}/scenes.tsv`,
                'index\tscene\ttitle\tfile\n',
            );
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
        const list = JSON.parse(
            fs.readFileSync(manifestPath, 'utf8'),
        ) as Array<{
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
