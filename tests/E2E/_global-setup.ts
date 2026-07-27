/**
 * Reset the local database to a known seeded state before the entire
 * Playwright run. Runs once per `npx playwright test` invocation.
 *
 * Uses the active `.env` database (MySQL on Herd for this project).
 * Retries with `migrate --seed` when `migrate:fresh` fails on MySQL wipe edge cases.
 */
import { execSync } from 'node:child_process';

function runArtisan(command: string): void {
    execSync(command, {
        cwd: process.cwd(),
        stdio: 'inherit',
    });
}

export default async function globalSetup(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('[e2e] Resetting database (migrate:fresh --seed --force)…');

    try {
        runArtisan('php artisan migrate:fresh --seed --force');
    } catch {
        // eslint-disable-next-line no-console
        console.warn('[e2e] migrate:fresh failed; falling back to migrate --seed --force…');
        runArtisan('php artisan migrate --seed --force');
    }

    // Bersihkan throttle login agar suite panjang tidak kena HTTP 429.
    try {
        runArtisan('php artisan cache:clear');
    } catch {
        // eslint-disable-next-line no-console
        console.warn('[e2e] cache:clear failed; continuing…');
    }
}
