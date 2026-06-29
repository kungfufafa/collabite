# Backup & Recovery — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai panduan backup & pemulihan data Collabite RC.
> **Referensi:** DEPLOYMENT.md, ROLLBACK.md, OPERATIONS.md, TDD §31, ADR-013, ADR-025, ADR-029.

Dokumen ini menjelaskan strategi backup harian untuk basis data MySQL produksi dan direktori `storage/app/private`, prosedur restore, serta pengujian berkala. Strategi ini selaras dengan AGENTS.md §4 (tidak menambah dependency baru) dan TDD §31.

> **Prinsip:** Backup diverifikasi mingguan melalui restore drill di staging. Backup dienkripsi saat disimpan (AES-256) untuk memenuhi standar minimum perlindungan data (lihat §5).

---

## 1. Backup MySQL Harian

### 1.1 Perintah Backup

```bash
mysqldump \
  --user="$DB_USERNAME" \
  --password="$DB_PASSWORD" \
  --host="$DB_HOST" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --default-character-set=utf8mb4 \
  "$DB_DATABASE" \
  > "/var/backups/collabite/db/collabite-$(date +%Y%m%d-%H%M%S).sql"
```

Opsi penting:

- `--single-transaction` — menjaga konsistensi snapshot untuk InnoDB.
- `--routines --triggers --events` — memastikan stored procedure, trigger, dan event ikut di-backup.
- `--quick` — mencegah buffer besar di memori untuk tabel besar.
- `utf8mb4` — set karakter default Laravel.

### 1.2 Cron Harian

```cron
# Jalankan pukul 02:00 WIB (server TZ)
0 2 * * * /usr/local/bin/collabite-backup-db.sh >> /var/log/collabite/backup.log 2>&1
```

Skrip `collabite-backup-db.sh` membungkus perintah di §1.1 dan mengompresi output:

```bash
#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%Y%m%d-%H%M%S)
DEST="/var/backups/collabite/db"
mkdir -p "$DEST"
mysqldump --user="$DB_USERNAME" --password="$DB_PASSWORD" --host="$DB_HOST" \
  --single-transaction --quick --routines --triggers --events \
  --default-character-set=utf8mb4 "$DB_DATABASE" \
  | gzip > "$DEST/collabite-$TS.sql.gz"
echo "Backup created: $DEST/collabite-$TS.sql.gz"
```

### 1.3 Retensi 30 Hari

Retensi dilakukan oleh `logrotate` (lihat juga OPERATIONS.md §4) atau skrip cleanup terpisah:

```bash
# Hapus backup DB > 30 hari
find /var/backups/collabite/db -type f -name "*.sql.gz" -mtime +30 -delete
```

---

## 2. Backup Storage

Direktori `storage/app/private` menyimpan file sensitif (lampiran pesan, file submission, dokumen verifikasi) sesuai ADR-013. Backup dilakukan via `rsync` ke lokasi off-server.

### 2.1 Perintah Backup Storage

```bash
rsync -a --delete \
  /var/www/collabite/storage/app/private/ \
  backup@backup-server:/backups/collabite/private/
```

### 2.2 Cron Harian (setelah backup DB)

```cron
30 2 * * * /usr/local/bin/collabite-backup-storage.sh >> /var/log/collabite/backup.log 2>&1
```

```bash
#!/usr/bin/env bash
set -euo pipefail
rsync -a --delete /var/www/collabite/storage/app/private/ \
  backup@backup-server:/backups/collabite/private/
echo "Storage backup completed at $(date -Iseconds)"
```

### 2.3 Retensi Storage

Kebijakan retensi mengikuti DB: 30 hari pada server backup primer. Snapshot mingguan (retensi 90 hari) dibuat setiap hari Minggu.

---

## 3. Prosedur Restore

Restore penuh dilakukan pada situasi disaster recovery (kehilangan data besar, file corrupt, dsb.). Untuk rollback rilis, lihat ROLLBACK.md.

### 3.1 Urutan Restore

1. **Hentikan worker queue** agar job tidak mencoba membaca state yang tidak konsisten.
   ```bash
   sudo supervisorctl stop collabite-worker:*
   ```
2. **Hentikan web server (opsional)** untuk mencegah request masuk selama restore.
   ```bash
   sudo systemctl stop nginx
   ```
3. **Restore basis data MySQL.**
   ```bash
   gunzip -c /var/backups/collabite/db/collabite-20260618-020000.sql.gz \
     | mysql --user="$DB_USERNAME" --password="$DB_PASSWORD" --host="$DB_HOST" "$DB_DATABASE"
   ```
4. **Restore storage.**
   ```bash
   rsync -a backup@backup-server:/backups/collabite/private/ \
     /var/www/collabite/storage/app/private/
   ```
5. **Jalankan ulang migrasi** (no-op jika schema sudah cocok).
   ```bash
   php artisan migrate --force
   ```
6. **Bersihkan cache.**
   ```bash
   php artisan optimize:clear
   ```
7. **Nyalakan worker & web server.**
   ```bash
   sudo systemctl start nginx
   sudo supervisorctl start collabite-worker:*
   ```
8. **Smoke check** dengan alur happy-path (lihat §6).

### 3.2 Restore Parsial

Untuk kehilangan data terbatas (mis. satu tabel terhapus), backup tidak perlu di-restore seluruhnya:

```bash
# Ekstrak tabel tertentu dari backup terkompresi
gunzip -c /var/backups/collabite/db/collabite-20260618-020000.sql.gz \
  | sed -n '/-- Table structure for table `messages`/,/-- Table structure for table `/p' \
  | mysql -u "$DB_USERNAME" -p "$DB_DATABASE"
```

Restore parsial **wajib** mendapat persetujuan PIC dan dicatat di log insiden.

---

## 4. Verifikasi Backup (Restore Drill Mingguan)

Backup yang tidak pernah diuji adalah asumsi, bukan kontrol. Setiap minggu (Senin pukul 09:00 WIB) tim ops menjalankan restore drill di lingkungan staging.

### 4.1 Langkah Drill

1. Provision container MySQL kosong.
2. Restore backup DB terbaru ke container.
3. Restore direktori `storage/app/private` ke staging.
4. Boot aplikasi RC terhadap staging DB.
5. Jalankan subset smoke test:
   - Login admin default.
   - Buka halaman dashboard UMKM (UAT-UMKM-001 happy path).
   - Kirim pesan dummy di kolaborasi uji.
6. Jika gagal, buka tiket perbaikan proses backup.
7. Bersihkan container staging setelah drill.

Hasil drill dicatat di log dan ditinjau saat post-mortem bulanan.

---

## 5. Enkripsi Backup Saat Disimpan (AES-256)

Backup yang meninggalkan server produksi harus dienkripsi. Dua opsi yang tidak menambah dependency baru (AGENTS.md §4) adalah `age` atau `openssl`.

### 5.1 Enkripsi dengan `openssl`

```bash
# Enkripsi
openssl enc -aes-256-gcm -salt -pbkdf2 -iter 200000 \
  -in /var/backups/collabite/db/collabite-20260618-020000.sql.gz \
  -out /var/backups/collabite/db/collabite-20260618-020000.sql.gz.enc \
  -pass file:/etc/collabite/backup-passphrase

# Dekripsi
openssl enc -d -aes-256-gcm -pbkdf2 -iter 200000 \
  -in /var/backups/collabite/db/collabite-20260618-020000.sql.gz.enc \
  -out /tmp/collabite-restore.sql.gz \
  -pass file:/etc/collabite/backup-passphrase
```

### 5.2 Manajemen Kunci

- Frasa sandi disimpan di file dengan permission `0600` yang hanya dapat dibaca oleh service `backup`.
- Rotasi passphrase setiap 90 hari.
- Kunci disimpan di vault yang sama dengan secret aplikasi (lihat DEPLOYMENT.md §2).

---

## 6. Smoke Check Pasca-Restore

Setelah restore, smoke test minimal yang harus sukses:

| ID | Pemeriksaan | Alat |
| --- | --- | --- |
| SMOKE-001 | `/up` mengembalikan 200 | curl |
| SMOKE-002 | Login UMKM & Creator default | UAT-UMKM-001 |
| SMOKE-003 | Submit pesan di kolaborasi uji | UAT-COLLAB-002 |
| SMOKE-004 | Upload lampiran kecil ke submission | Manual |
| SMOKE-005 | Buka profil publik Creator | curl + UAT-PUB-001 |

Jika satu atau lebih smoke test gagal, restore dianggap tidak valid dan harus diulang dari backup lain.

---

## 7. Referensi Silang

- TDD §31 — Disaster recovery.
- DEPLOYMENT.md — urutan build & deploy.
- ROLLBACK.md — rollback rilis.
- OPERATIONS.md — rotasi log & health check.
- ADR-013 — File storage policy.
- ADR-025 — Storage abstraction.
- ADR-029 — RC database engine.
