# Deployment Guide — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai panduan operasional rilis Collabite RC.
> **Referensi:** PRD §30, TDD §30, ADR-004, ADR-008, ADR-013, ADR-025, ADR-029.

Dokumen ini menjelaskan langkah-langkah untuk men-deploy Collabite RC ke lingkungan produksi. Setiap langkah telah dipertimbangkan terhadap constraints AGENTS.md §4 (tidak menambah dependency baru tanpa persetujuan) dan ADR-029 (SQLite untuk validasi RC, MySQL untuk produksi).

---

## 1. Stack Runtime

Versi runtime di bawah ini adalah minimum yang diverifikasi untuk RC. Penyimpangan minor (patch version) dapat diterima selama sesuai dengan constraint keamanan upstream.

| Komponen | Versi Minimum | Catatan |
| --- | --- | --- |
| PHP | 8.4 | Wajib, mengikuti `composer.json` AGENTS.md §4. |
| Ekstensi PHP | `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `ctype`, `json`, `tokenizer`, `xml`, `gd`, `zip`, `bcmath` (untuk `DECIMAL`) | `pdo_mysql` wajib diaktifkan walau runtime RC memakai SQLite (lihat ADR-029). |
| Node.js | 20 LTS | Vite + React 19 + Wayfinder plugin. |
| Composer | 2.x | `--optimize-autoloader` saat install. |
| Database produksi | MySQL 8.x | ADR-004; engine validasi RC adalah SQLite (ADR-029). |
| Web server | Nginx 1.24+ atau Apache 2.4+ | Contoh di §6 menggunakan Nginx. |
| Process manager | Supervisor 4.x atau systemd | Untuk queue worker & scheduler. |

---

## 2. Environment Variables

Variabel di bawah wajib tersedia di environment produksi. Secret disimpan di vault (Laravel Cloud env, AWS SSM, atau secrets manager setara).

| Variabel | Wajib | Contoh Produksi | Catatan |
| --- | --- | --- | --- |
| `APP_KEY` | Ya | `base64:…` | Hasil `php artisan key:generate`. |
| `APP_URL` | Ya | `https://collabite.test` | Harus HTTPS. |
| `APP_ENV` | Ya | `production` | |
| `APP_DEBUG` | Ya | `false` | Wajib `false` di produksi. |
| `DB_CONNECTION` | Ya | `mysql` | ADR-004. |
| `DB_HOST` | Ya | (vault) | |
| `DB_PORT` | Ya | `3306` | |
| `DB_DATABASE` | Ya | `collabite` | |
| `DB_USERNAME` | Ya | (vault) | |
| `DB_PASSWORD` | Ya | (vault) | |
| `MAIL_MAILER` | Ya | `smtp` | `log` untuk fallback darurat. |
| `MAIL_HOST` | Ya | (vault) | SES / Postmark / SMTP ISP. |
| `MAIL_PORT` | Ya | `587` | |
| `MAIL_USERNAME` | Ya | (vault) | |
| `MAIL_PASSWORD` | Ya | (vault) | |
| `MAIL_FROM_ADDRESS` | Ya | `no-reply@collabite.test` | |
| `MAIL_FROM_NAME` | Ya | `Collabite` | |
| `QUEUE_CONNECTION` | Ya | `database` | ADR-008. |
| `FILESYSTEM_DISK` | Ya | `private` | ADR-013; lihat §5. |
| `SESSION_DRIVER` | Ya | `database` | Wajib `database` agar konsisten dengan queue. |
| `CACHE_STORE` | Ya | `database` | `redis` pasca-RC, lihat PRD §30. |
| `LOG_CHANNEL` | Ya | `stack` | Channel `stack` (single + daily) per OPERATIONS.md. |

`APP_KEY` tidak boleh di-commit. Untuk Laravel Cloud gunakan automatic env injection.

---

## 3. Build Steps

Urutan build di bawah ini menghasilkan artefak produksi yang siap di-deploy. Langkah dijalankan dari root repositori pada runner build yang terisolasi.

```bash
# 1. Install dependency backend (tanpa dev untuk produksi)
composer install --no-dev --optimize-autoloader

# 2. Install dependency frontend (lock file)
npm ci

# 3. Build bundle Vite (output: public/build/)
npm run build

# 4. Migrasi skema (idempotent via doctrine/migrations)
php artisan migrate --force

# 5. Buat symlink storage publik (avatar publik Creator, dsb.)
php artisan storage:link

# 6. Cache konfigurasi, route, dan view
php artisan config:cache route:cache view:cache
```

> **Catatan RC:** Saat validasi RC di SQLite (ADR-029), `DB_CONNECTION=sqlite` dan `DB_DATABASE=database/database.sqlite` pada `.env`. Konfigurasi produksi tetap memakai `mysql` (lihat §2).

---

## 4. Worker (Queue) & Scheduler

### 4.1 Queue Worker — Supervisor

Bagian ini menjelaskan cara menjalankan `php artisan queue:work` untuk memproses job email notifikasi dan export laporan (lihat ADR-008). Contoh unit Supervisor di bawah ini diasumsikan aplikasi ter-deploy di `/var/www/collabite` dan user `www-data`.

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

Perintah manajemen:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start collabite-worker:*
```

### 4.2 Scheduler — Cron

Scheduler Laravel digunakan untuk tugas periodik (prune record, retry job gagal, dsb.). Tambahkan satu baris cron di host:

```cron
* * * * * cd /var/www/collabite && php artisan schedule:run >> /dev/null 2>&1
```

### 4.3 Alternatif systemd

Unit systemd untuk worker dapat menggantikan Supervisor dengan snippet yang setara. Pola:

```ini
[Service]
WorkingDirectory=/var/www/collabite
ExecStart=/usr/bin/php artisan queue:work --tries=3 --backoff=60 --max-time=3600
Restart=always
User=www-data
```

---

## 5. HTTPS & Storage Policy

### 5.1 HTTPS

- **Laravel Cloud:** TLS otomatis diterbitkan (Let's Encrypt) dan dirotasi oleh platform.
- **Self-hosted:** Gunakan Certbot dengan Nginx untuk Let's Encrypt. Contoh:

  ```bash
  sudo certbot --nginx -d collabite.test -d www.collabite.test
  ```

  Tambahkan cron renewal:

  ```cron
  0 3 * * * /usr/bin/certbot renew --quiet
  ```

- HTTP ke HTTPS dialihkan melalui `return 301 https://$host$request_uri;` di blok server Nginx.

### 5.2 Public/Private Storage (TDD §16/§17)

- **Disk `public`** (`storage/app/public`): aset non-sensitif seperti avatar publik Creator, logo UMKM, dan gambar portofolio yang ditandai `is_public=true`.
- **Disk `private`** (`storage/app/private`): lampiran pesan, file submission, dokumen verifikasi, dan bukti pembayaran (jika ada). Wajib dilayani melalui **signed URL** TTL 30 menit (ADR-013).
- Konfigurasi di `config/filesystems.php`. Migrasi ke S3/R2 pasca-MVP dengan hanya mengubah env `FILESYSTEM_DISK_PRIVATE` ke `s3` (ADR-025).

---

## 6. Upload Limits

Batas unggah sesuai PRD §21 dan ADR-024. Konfigurasi produksi mengikuti rekomendasi di bawah.

### 6.1 Nginx

```nginx
client_max_body_size 120M;
```

### 6.2 PHP (`php.ini` atau `pool.d/www.conf`)

```ini
upload_max_filesize = 110M
post_max_size       = 120M
memory_limit        = 256M
max_file_uploads    = 10
```

> **Catatan:** `post_max_size` harus lebih besar dari `upload_max_filesize` agar metadata form tidak terpotong.

---

## 7. Health Check

Laravel menyediakan endpoint `/up` (default sejak Laravel 11) yang mengembalikan `200 OK` ketika aplikasi dapat memuat bootstrap dan konfigurasi.

- **URL:** `GET /up`
- **Respons:** `200` dengan body `Application is up.` (atau variasi default Laravel 13).
- **Penggunaan:** Monitor uptime (Laravel Pulse, BetterUptime, Pingdom) melakukan scrape tiap 60 detik ke `/up`. Kegagalan berturut-turut memicu alert on-call.

Health check ini belum menguji koneksi database secara aktif; untuk itu, gunakan endpoint internal khusus (lihat TASK-007 pasca-RC).

---

## 8. Referensi Silang

| Topik | Dokumen Acuan |
| --- | --- |
| File storage policy | ADR-013, ADR-025, TDD §16/§17 |
| Queue & worker | ADR-008, OPERATIONS.md |
| Database engine (RC vs produksi) | ADR-004, ADR-029 |
| Ukuran file & upload | PRD §21, ADR-024 |
| HTTPS / TLS | PRD §30 |
| Health check | TDD §30 |

---

## 9. Daftar Periksa Deploy

Gunakan checklist di bawah ini setiap kali melakukan release:

1. [ ] Build artefak mengikuti §3 tanpa error.
2. [ ] `.env` produksi disiapkan dengan secret di vault (§2).
3. [ ] `php artisan migrate --force` selesai tanpa error.
4. [ ] `php artisan storage:link` sukses (jika belum).
5. [ ] Cache config/route/view di-generate.
6. [ ] Supervisor unit `collabite-worker` aktif dan `RUNNING`.
7. [ ] Cron `schedule:run` aktif.
8. [ ] TLS valid dan redirect HTTP→HTTPS aktif.
9. [ ] Smoke test `/up` mengembalikan `200`.
10. [ ] Smoke test login & alur happy-path (lihat UAT-UMKM-001) tercatat sukses.
