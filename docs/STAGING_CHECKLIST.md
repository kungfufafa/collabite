# Staging Checklist — Collabite

> **Versi:** 1.0 (Draft RC.1)
> **Tanggal:** 2026-06-18
> **Status RC.1:** RC.1 BLOCKED — Playwright suite menampilkan 2/17 lulus karena CSRF helper bug di tests/E2E/*.spec.ts
> **Referensi:** PRD §30, TDD §30, ADR-004, ADR-008, ADR-013, ADR-024, ADR-025, ADR-029, `docs/DEPLOYMENT.md`, `docs/ROLLBACK.md`, `docs/BACKUP_RECOVERY.md`, `docs/OPERATIONS.md`, `docs/DEMO_ACCOUNTS.md`, `docs/DECISIONS.md`.

Dokumen ini adalah checklist wajib yang harus diverifikasi sebelum mempublikasikan rilis Collabite RC.1 ke lingkungan staging (`staging.collabite.id` atau setara). Setiap item di bawah ini harus ditandai lengkap dan dibubuhi PIC serta tanggal di §19.

> **Catatan RC.** RC.1 divalidasi runtime dengan SQLite (ADR-029); staging tetap memakai MySQL 8.x sesuai ADR-004 sebagai database otoritatif. ADR-029 secara eksplisit menunda validasi kompatibilitas MySQL — checklist ini adalah implementasi checklist validasi MySQL dimaksud.

---

## 1. Environment Provisioning

- [ ] Server dipilih: Forge / Laravel Cloud / self-managed Ubuntu 22.04+ (lihat `docs/DEPLOYMENT.md` §1).
- [ ] PHP 8.4 terpasang dan merupakan binary default CLI & FPM.
- [ ] Ekstensi PHP aktif: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `ctype`, `json`, `tokenizer`, `xml`, `gd`, `zip`, `intl`.
- [ ] Node.js 20 LTS + npm 10 terpasang di build runner.
- [ ] Composer 2.x terpasang.

**Expected outcome:** `php -v` menampilkan `PHP 8.4.x`; `php -m | grep -E '^(pdo_mysql|mbstring|openssl|fileinfo|ctype|json|tokenizer|xml|gd|zip|intl)$'` mengembalikan semua baris tanpa `bcmath` wajib; `node -v` mengembalikan `v20.x`; `composer --version` mengembalikan `Composer 2.x`.

---

## 2. HTTPS

- [ ] Sertifikat TLS valid (Let's Encrypt melalui Certbot atau Cloudflare proxy) untuk domain staging.
- [ ] HTTP dialihkan permanen ke HTTPS (HTTP 301).
- [ ] HSTS preload **opsional**, hanya diaktifkan bila domain sudah masuk daftar preload HSTS.

**Expected outcome:** `curl -I https://staging.collabite.id` mengembalikan `301` ke HTTPS dan kemudian `200`; `curl -I http://staging.collabite.id` mengembalikan `301`; sertifikat valid minimal 30 hari ke depan (lihat `docs/DEPLOYMENT.md` §5.1).

---

## 3. MySQL Setup

- [ ] Instance MySQL 8.x khusus untuk staging sudah diprovision (dedicated, tidak berbagi dengan produksi).
- [ ] Database `collabite_staging` dibuat dengan collation `utf8mb4_unicode_ci`.
- [ ] User `collabite_staging` dibuat dengan **minimum privileges**: `SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX, REFERENCES` pada database `collabite_staging` saja (lihat ADR-004).
- [ ] Koneksi diverifikasi dari host aplikasi: `mysql -u collabite_staging -p -h <host> collabite_staging -e 'SELECT 1;'`.

**Expected outcome:** Query `SELECT VERSION();` mengembalikan string yang dimulai dengan `8.`; `SHOW VARIABLES LIKE 'collation_database';` menampilkan `utf8mb4_unicode_ci`; user `collabite_staging` **tidak** memiliki hak ke database lain (`SHOW GRANTS` hanya menampilkan hak ke `collabite_staging.*`).

---

## 4. Environment Variables

- [ ] `APP_NAME=Collabite`.
- [ ] `APP_ENV=staging`.
- [ ] `APP_DEBUG=false`.
- [ ] `APP_KEY` di-regenerate khusus staging (`php artisan key:generate --show` lalu simpan di vault).
- [ ] `APP_URL=https://staging.collabite.id` (atau domain internal yang disetujui).
- [ ] `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT=3306`, `DB_DATABASE=collabite_staging`, `DB_USERNAME=collabite_staging`, `DB_PASSWORD` dari vault.
- [ ] `MAIL_*` terisi sesuai mail sandbox (lihat §7).
- [ ] `QUEUE_CONNECTION=database`.
- [ ] `SESSION_DRIVER=database`.
- [ ] `CACHE_STORE=database`.
- [ ] `FILESYSTEM_DISK=local` (default staging; lihat `docs/DEPLOYMENT.md` §2 untuk catatan private disk).
- [ ] `LOG_CHANNEL=stack`.

**Expected outcome:** `php artisan config:show app.env` mengembalikan `staging`; `php artisan config:show app.debug` mengembalikan `false`; `php artisan config:show database.default` mengembalikan `mysql`; `APP_KEY` di `.env` berbeda dari kunci lokal (lihat `docs/DEPLOYMENT.md` §2).

---

## 5. Queue Worker

- [ ] Unit Supervisor aktif dengan konfigurasi berikut (atau setara untuk systemd):

  ```ini
  ; /etc/supervisor/conf.d/collabite-worker.conf
  [program:collabite-worker]
  process_name=%(program_name)s_%(process_num)02d
  command=php /var/www/collabite/artisan queue:work --tries=3 --backoff=60 --max-time=3600
  autostart=true
  autorestart=true
  stopasgroup=true
  killasgroup=true
  user=www-data
  numprocs=2
  redirect_stderr=true
  stdout_logfile=/var/www/collabite/storage/logs/worker.log
  stopwaitsecs=3600
  ```

- [ ] `supervisorctl status collabite-worker:*` mengembalikan `RUNNING` untuk semua proses.

**Expected outcome:** Job uji coba (`php artisan tinker --execute 'dispatch(new \\App\\Jobs\\TestJob());'` bila tersedia, atau `php artisan queue:work --once --stop-when-empty`) tercatat pada `storage/logs/worker.log` tanpa error (lihat `docs/DEPLOYMENT.md` §4.1 dan `docs/OPERATIONS.md` §1).

---

## 6. Scheduler

- [ ] Cron user aplikasi berisi satu baris:

  ```cron
  * * * * * cd /var/www/collabite && php artisan schedule:run >> /dev/null 2>&1
  ```

- [ ] `php artisan schedule:list` mengembalikan daftar tugas baseline RC tanpa error.

**Expected outcome:** `crontab -l` berisi baris di atas; `php artisan schedule:list` mengembalikan baseline termasuk `queue:prune-failed --hours=72`, `model:prune`, dan `view:cache` (lihat `docs/OPERATIONS.md` §2.2).

---

## 7. Mail Sandbox

- [ ] Mailpit atau Mailtrip terpasang dan dapat menerima SMTP dari host aplikasi.
- [ ] `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT=1025` (Mailpit) atau kredensial Mailtrap, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` terisi.
- [ ] SMTP nyata via Postmark / Amazon SES **belum** diaktifkan sampai hasil validasi §11_clean.
- [ ] Fallback darurat `MAIL_MAILER=log` siap dinyalakan (lihat `docs/OPERATIONS.md` §3.2).

**Expected outcome:** Email uji coba (`php artisan tinker --execute 'Mail::raw("staging test", function($m){ $m->to("ops@collabite.test")->subject("staging"); });'`) muncul di UI Mailpit pada port 8025 (atau inbox Mailtrap); **tidak** ada email terkirim keluar ke internet publik.

---

## 8. Public dan Private Storage

- [ ] `php artisan storage:link` dijalankan tepat satu kali pada host (cek `public/storage` adalah symlink ke `storage/app/public`).
- [ ] Direktori `storage/app/private` tidak dilayani publik: konfigurasi Nginx tidak memiliki `alias` atau `root` yang mengarah ke `storage/app/private`.
- [ ] Akses ke `storage/app/private` hanya melalui **signed URL** TTL 30 menit sesuai ADR-013.

**Expected outcome:** `curl -I https://staging.collabite.id/storage/app/private/<file>` mengembalikan `404` atau `403`; `readlink public/storage` mengembalikan `../storage/app/public` (lihat `docs/DEPLOYMENT.md` §5.2).

---

## 9. Upload Limits

- [ ] Nginx `client_max_body_size=120M;` aktif pada blok server (reload `nginx -s reload`).
- [ ] PHP `php.ini` atau `pool.d/www.conf`: `upload_max_filesize=110M`, `post_max_size=120M`, `memory_limit=256M`, `max_file_uploads=10`.
- [ ] `php -r 'echo ini_get("upload_max_filesize"), PHP_EOL, ini_get("post_max_size"), PHP_EOL, ini_get("memory_limit"), PHP_EOL;'` mengembalikan nilai di atas.
- [ ] FPM di-restart setelah perubahan PHP (`sudo systemctl restart php8.4-fpm` atau setara).

**Expected outcome:** Upload 100 MB dummy melalui endpoint admin (atau test fixture) sukses tanpa error `413 Request Entity Too Large` (lihat `docs/DEPLOYMENT.md` §6).

---

## 10. Migration Procedure (Staging)

- [ ] 1. `php artisan down --secret=<random>` dengan `<random>` 32+ karakter dikirim ke PIC untuk jalur bypass.
- [ ] 2. `git fetch --tags && git checkout v1.0.0-rc.1` (atau tag RC.1 final yang disetujui).
- [ ] 3. `composer install --no-dev --optimize-autoloader`.
- [ ] 4. `npm ci && npm run build`.
- [ ] 5. `php artisan migrate --force` — eksekusi terhadap MySQL `collabite_staging` (ADR-029 compatibility check pertama).
- [ ] 6. `php artisan optimize:clear`.
- [ ] 7. `php artisan config:cache route:cache view:cache`.
- [ ] 8. `supervisorctl restart collabite-worker:*`.
- [ ] 9. `php artisan up`.

**Expected outcome:** Migrasi selesai tanpa error; `php artisan migrate:status` menunjukkan semua migrasi `Ran`; `/up` mengembalikan `200`; tidak ada `ERROR` baru di `storage/logs/laravel.log` (lihat `docs/DEPLOYMENT.md` §3 dan `docs/OPERATIONS.md` §1).

---

## 11. Smoke Test (Post-Deploy)

- [ ] `GET /up` mengembalikan `200`.
- [ ] Login `admin@collabite.test` (lihat `docs/DEMO_ACCOUNTS.md` bila di-seed) mengarahkan ke `/admin/dashboard` dengan status `200`.
- [ ] Buat campaign baru sebagai akun UMKM (`umkm1@collabite.test`) → publish → tampil di `/umkm/campaigns`.
- [ ] Creator (`creator1@collabite.test`) apply ke campaign tersebut → UMKM accept → kolaborasi berstatus `active`.
- [ ] Admin force-close kolaborasi dengan alasan → baris baru tercatat di `activity_logs` (audit log).

**Expected outcome:** Semua langkah di atas selesai tanpa `5xx`; jumlah baris `activity_logs` bertambah satu untuk force-close; tidak ada `ERROR` di log aplikasi (lihat `docs/DEMO_ACCOUNTS.md` untuk kredensial default dan `docs/BACKUP_RECOVERY.md` §6 untuk tabel smoke check).

---

## 12. Rollback Procedure

- [ ] Prosedur rollback siap dan tim on-call paham urutan `pre-rollback checklist` → `code rollback` → `migration rollback` → `asset rollback` → `cache invalidation`.
- [ ] Tag fallback (`v1.0.0-rc.0` atau setara) sudah diverifikasi dapat di-checkout dan dibuild.

**Expected outcome:** Rollback dapat dijalankan dalam ≤ 30 menit oleh satu operator (lihat `docs/ROLLBACK.md` §1-§5 dan Risk Matrix §6).

---

## 13. Backup & Restore Test

- [ ] Satu siklus backup → restore dijalankan di environment terpisah **sebelum cutover staging-pertama**.
- [ ] Hasil restore drill dicatat (durasi, ukuran, smoke check pasca-restore).

**Expected outcome:** Restore drill sukses; smoke check `SMOKE-001` sampai `SMOKE-005` di `docs/BACKUP_RECOVERY.md` §6 semuanya lulus; retensi 30 hari diverifikasi untuk backup DB dan storage (lihat `docs/BACKUP_RECOVERY.md` §1.3, §4).

---

## 14. Seeded / Demo Account Handling

- [ ] `DemoDataSeeder` **tidak** dijalankan di staging publik kecuali secara eksplisit disetujui PIC.
- [ ] `AdminUserSeeder` default password (`password`) di-disable sebelum cutover; admin password diganti dan disimpan di vault.
- [ ] Akun demo (`umkm1@collabite.test`, `creator1@collabite.test`, dsb.) di-rotate sebelum dibagikan ke UAT eksternal (lihat §18).

**Expected outcome:** `php artisan tinker --execute 'echo \\App\\Models\\User::where("email","admin@collabite.test")->first()?->password;'` mengembalikan hash yang **berbeda** dari seed default; `database/seeders/DemoDataSeeder.php` di-guard dengan `app()->environment(['local','testing'])` (lihat `docs/DEMO_ACCOUNTS.md`).

---

## 15. Log Inspection

- [ ] `tail -f storage/logs/laravel.log` dijalankan selama smoke test §11.
- [ ] Channel `stack` aktif (`LOG_CHANNEL=stack`) dan menulis ke `single` + `daily` (lihat `docs/OPERATIONS.md` §4.1).
- [ ] Logrotate `/etc/logrotate.d/collabite` terpasang dengan retensi 14 file.

**Expected outcome:** Tidak ada `ERROR` baru yang belum diinvestigasi selama smoke test; log worker (`storage/logs/worker.log`) aktif dan rotasi terjadwal.

---

## 16. Health Check

- [ ] Endpoint `GET /up` terdaftar dan mengembalikan `200` dengan body `Application is up.`.
- [ ] Monitor uptime eksternal (BetterUptime / Pingdom / setara) melakukan scrape tiap 60 detik ke `/up`.

**Expected outcome:** Tiga kali percobaan `curl https://staging.collabite.id/up` masing-masing mengembalikan `200` dalam < 2 detik (lihat `docs/DEPLOYMENT.md` §7 dan `docs/OPERATIONS.md` §5.1).

---

## 17. Error Tracking

- [ ] (Rekomendasi) Sentry atau Bugsnag diintegrasikan pasca-RC. Untuk RC.1, error tracking belum masuk scope MVP — gunakan inspeksi manual `storage/logs/laravel.log` dan `queue:failed`.

**Expected outcome:** Keputusan eksplisit di `docs/PROGRESS.md` apakah Sentry/Bugsnag akan diaktifkan pasca-RC atau ditunda; untuk RC.1 tidak ada klaim Sentry aktif.

---

## 18. UAT Access

- [ ] Akses `staging.collabite.id` dibatasi selama UAT internal via IP allowlist (Nginx `allow` / `deny`) **atau** BasicAuth pada Nginx.
- [ ] Akun demo di-rotate password sebelum dibagikan ke UAT eksternal.
- [ ] Daftar akun UAT (email + role) didokumentasikan terpisah dari `docs/DEMO_ACCOUNTS.md`.

**Expected outcome:** Permintaan dari IP di luar allowlist ditolak (`403`); kredensial UAT eksternal tidak menggunakan password default `password`.

---

## 19. Status Checklist Akhir

Tabel di bawah ini diisi oleh PIC pada saat cutover. Status `Done` mengharuskan bukti (log, screenshot, atau output perintah) dilampirkan ke tiket RC.1.

| # | Item | Status | PIC | Tanggal |
| - | ---- | ------ | --- | ------- |
| 1 | Environment provisioning | ☐ | | |
| 2 | HTTPS | ☐ | | |
| 3 | MySQL setup | ☐ | | |
| 4 | Environment variables | ☐ | | |
| 5 | Queue worker (Supervisor) | ☐ | | |
| 6 | Scheduler (cron) | ☐ | | |
| 7 | Mail sandbox | ☐ | | |
| 8 | Public/private storage | ☐ | | |
| 9 | Upload limits | ☐ | | |
| 10 | Migration procedure | ☐ | | |
| 11 | Smoke test post-deploy | ☐ | | |
| 12 | Rollback procedure siap | ☐ | | |
| 13 | Backup & restore test | ☐ | | |
| 14 | Demo account handling | ☐ | | |
| 15 | Log inspection | ☐ | | |
| 16 | Health check `/up` | ☐ | | |
| 17 | Error tracking (rekomendasi) | ☐ | | |
| 18 | UAT access | ☐ | | |

---

## 20. Status RC.1

Dokumen ini memiliki **dua kalimat status yang berlaku**; hanya **SATU** yang boleh aktif pada satu waktu. Baris status di awal dokumen dan baris di bawah ini **harus** identik. Status hanya boleh diganti oleh agent yang sama yang menutup fix CSRF helper di `tests/E2E/*.spec.ts` (saat itu seluruh checklist §11 hijau dan Playwright 17/17 lulus).

> RC.1 BLOCKED — Playwright suite menampilkan 2/17 lulus karena CSRF helper bug di tests/E2E/*.spec.ts

ATAU

> RC.1 LOCALLY VALIDATED — READY FOR STAGING

> **Status sementara saat dokumen ini ditulis (2026-06-18):** CSRF helper bug di `tests/E2E/*.spec.ts` belum hijau, maka status aktif adalah:
>
> **RC.1 BLOCKED — Playwright suite menampilkan 2/17 lulus karena CSRF helper bug di tests/E2E/*.spec.ts**
>
> Setelah parallel agent yang memperbaiki `tests/E2E/*.spec.ts` menutup tiket dan Playwright menunjukkan 17/17 hijau, file ini **WAJIB** diperbarui (oleh agent yang sama) menjadi:
>
> **RC.1 LOCALLY VALIDATED — READY FOR STAGING**
>
> Jangan pernah menampilkan kedua kalimat secara bersamaan. Jangan pernah mengklaim `production ready` — staging belum produksi (lihat ADR-029 dan `docs/DEPLOYMENT.md`).
