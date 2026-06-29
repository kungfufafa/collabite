/**
 * Reset the local SQLite database to a known seeded state before the entire
 * Playwright run. Runs once per `npx playwright test` invocation.
 *
 * - Default .env points DB_CONNECTION=sqlite → database/database.sqlite
 * - Uses --force to skip the production-environment prompt
 */
import { execSync } from 'node:child_process';

export default async function globalSetup(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('[e2e] Resetting SQLite database (migrate:fresh --seed --force)…');
    execSync('php artisan migrate:fresh --seed --force', {
        cwd: process.cwd(),
        stdio: 'inherit',
    });
}
