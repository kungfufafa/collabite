# Operations Runbook — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai runbook operasional harian Collabite RC.
> **Referensi:** DEPLOYMENT.md, ROLLBACK.md, BACKUP_RECOVERY.md, TDD §30, ADR-008, ADR-013, ADR-029.

Dokumen ini menjelaskan prosedur operasional harian: queue worker, scheduler, mail, log, monitoring, dan pemeliharaan rutin. Runbook ini diasumsikan dijalankan pada server produksi RC (Laravel Cloud atau VPS self-host) dengan stack di DEPLOYMENT.md §1.

> **Catatan RC:** Mesin validasi lokal menggunakan SQLite (ADR-029). Perintah di bawah ini valid untuk MySQL produksi; untuk RC SQLite cukup menjalankan langkah yang sama dengan `DB_CONNECTION=sqlite`.

---

## 1. Queue Worker

Queue worker memproses job asynchronous (email notifikasi, export laporan, dsb.) sesuai ADR-008. Worker dijalankan sebagai service di bawah Supervisor (lihat DEPLOYMENT.md §4.1).

### 1.1 Perintah Standar

```bash
php artisan queue:work \
  --tries=3 \
  --backoff=60 \
  --max-time=3600 \
  --sleep=3 \
  --timeout=120
```

Penjelasan flag:

| Flag | Nilai | Alasan |
| --- | --- | --- |
| `--tries` | `3` | Batas retry sebelum job dipindah ke `failed_jobs`. |
| `--backoff` | `60` | Jeda (detik) antar retry. |
| `--max-time` | `3600` | Worker restart setiap 1 jam untuk mencegah memory leak. |
| `--sleep` | `3` | Tidur saat queue kosong agar tidak boros CPU. |
| `--timeout` | `120` | Batas waktu eksekusi per job. |

### 1.2 Pemantauan Queue

```bash
# Lihat jumlah job yang tertunda
php artisan queue:size

# Lihat job yang gagal
php artisan queue:failed

# Retry job yang gagal (per UUID)
php artisan queue:retry <uuid>
```

### 1.3 Restart Worker

Setelah deploy atau perubahan konfigurasi:

```bash
sudo supervisorctl restart collabite-worker:*
```

> **Penting:** Worker perlu restart setelah rollback rilis (lihat ROLLBACK.md §5).

---

## 2. Scheduler

Scheduler menjalankan tugas periodik Laravel. Satu baris cron sudah cukup (lihat DEPLOYMENT.md §4.2).

### 2.1 Cron Standar

```cron
* * * * * cd /var/www/collabite && php artisan schedule:run >> /dev/null 2>&1
```

### 2.2 Daftar Tugas Scheduler

Daftar di bawah ini adalah baseline RC. Tambahkan tugas baru melalui `app/Console/Kernel.php`.

| Tugas | Frekuensi | Tujuan |
| --- | --- | --- |
| `inspire` | Setiap jam | Placeholder sanity check. |
| `queue:prune-failed --hours=72` | Harian | Membersihkan `failed_jobs` > 3 hari. |
| `model:prune --model="..."` | Harian | Pruning record soft-deleted (lihat §6). |
| `view:cache` | Setelah deploy | Cache view templates. |

Cek daftar tugas:

```bash
php artisan schedule:list
```

---

## 3. Mail

### 3.1 Pengembangan Lokal

- **Mailpit** menangkap semua email keluar tanpa mengirim ke internet.
- Konfigurasi `.env` lokal:

  ```env
  MAIL_MAILER=smtp
  MAIL_HOST=mailpit
  MAIL_PORT=1025
  MAIL_FROM_ADDRESS=no-reply@collabite.test
  MAIL_FROM_NAME="Collabite"
  ```

### 3.2 Fallback Darurat

Jika SMTP tidak tersedia (mis. kegagalan konfigurasi), set:

```env
MAIL_MAILER=log
```

Email ditulis ke `storage/logs/laravel.log` untuk forensik. **Tidak untuk produksi.**

### 3.3 Produksi

- **Amazon SES** atau **Postmark** direkomendasikan (lihat DEPLOYMENT.md §2).
- DKIM, SPF, dan DMARC harus dikonfigurasi untuk domain `collabite.test`.
- Pantau bounce & complaint rate di dashboard provider; threshold bounce > 5% memicu investigasi.

---

## 4. Log

### 4.1 Channel

Konfigurasi default `config/logging.php` adalah channel `stack` yang menjatuhkan output ke `single` dan `daily`.

```env
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

- `single` menulis ke `storage/logs/laravel.log` (overwrite harian).
- `daily` menulis ke `storage/logs/laravel-YYYY-MM-DD.log` (append per hari).

### 4.2 Rotasi Log (Logrotate)

File `/etc/logrotate.d/collabite`:

```text
/var/www/collabite/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

Kebijakan: retensi 14 file. File terkompresi dapat diarsipkan lebih lama bila diperlukan.

### 4.3 Log Worker

Log terpisah untuk worker di `storage/logs/worker.log` (lihat DEPLOYMENT.md §4.1). Rotasi mengikuti pola yang sama.

---

## 5. Monitoring

### 5.1 Health Check

- Endpoint `/up` (Laravel default) di-scrape tiap 60 detik oleh monitor uptime eksternal.
- Kegagalan berturut-turut memicu alert on-call.

### 5.2 Application Performance Monitoring (APM)

Collabite RC **tidak** menggunakan APM pihak ketiga. Monitoring tingkat aplikasi mengandalkan:

- Log harian (lihat §4).
- Health check `/up` (lihat §5.1).
- Laravel Pulse (opsional, lihat §5.4).

### 5.3 Queue Depth (Out of Scope RC)

Pemantauan kedalaman antrian (queue depth) menggunakan scrape Prometheus di luar scope RC. Sebagai gantinya, on-call menjalankan:

```bash
php artisan queue:size
```

berkala (tiap 15 menit saat insiden).

### 5.4 Laravel Pulse (Opsional)

Untuk visibilitas tambahan (request, query, job, cache), operator dapat mengaktifkan Laravel Pulse di kemudian hari. Belum diaktifkan untuk RC.

---

## 6. Pemeliharaan Rutin

### 6.1 Pruning Record

Record yang di-soft-delete (model yang memakai `SoftDeletes`) akan dipangkas setelah 365 hari. Perintah dijalankan harian oleh scheduler.

```bash
php artisan model:prune
```

Pengaturan per model dilakukan di `Model::prunable()`:

```php
public function prunable(): Builder
{
    return static::where('deleted_at', '<=', now()->subDays(365));
}
```

> **Catatan:** Hanya model yang secara eksplisit menandai `prunable()` yang terpengaruh. Nonaktifkan melalui env `PRUNE_ENABLED=false` bila diperlukan.

### 6.2 Optimasi Mingguan

```bash
# Vacuum SQLite (RC)
php artisan db:vacuum       # lihat ADR-029
# OPTIMIZE TABLE (MySQL produksi)
php artisan db:show --counts
```

### 6.3 Health Snapshot

Setiap awal minggu, ekspor snapshot metrik dasar:

```bash
php artisan queue:size
php artisan schedule:list
df -h /var/www/collabite
```

Output disimpan di channel `#ops-snapshot` Slack.

---

## 7. Rotasi On-Call

Rotasi on-call untuk Collabite RC **menunggu penetapan oleh organisasi** (TBD). Sampai jadwal tersedia, eskalasi dilakukan melalui:

1. Kanal internal `#collabite-ops` Slack.
2. Eskalasi ke Product Engineer sesuai daftar di `docs/PROGRESS.md`.

---

## 8. Daftar Periksa Harian On-Call

1. [ ] `/up` merespons 200 dari monitor uptime.
2. [ ] `queue:size` < 100 (atau threshold yang ditetapkan).
3. [ ] Tidak ada `failed_jobs` baru dalam 24 jam.
4. [ ] Log harian tidak mengandung `ERROR` berulang.
5. [ ] Disk usage < 80% (cek `df -h`).
6. [ ] Cron `schedule:run` aktif dan log tidak menunjukkan error.

---

## 9. Referensi Silang

- DEPLOYMENT.md — Stack runtime & Supervisor unit.
- ROLLBACK.md — Rollback rilis.
- BACKUP_RECOVERY.md — Backup & restore.
- TDD §30 — Operational requirements.
- ADR-008 — Database queue.
- ADR-013 — File storage policy.
- ADR-029 — RC database engine.
