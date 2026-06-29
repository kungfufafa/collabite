# Rollback Procedure — Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai panduan rollback rilis Collabite RC.
> **Referensi:** DEPLOYMENT.md, BACKUP_RECOVERY.md, OPERATIONS.md, TDD §31, ADR-013, ADR-029.

Dokumen ini menjelaskan prosedur standar untuk mengembalikan rilis Collabite ke versi sebelumnya ketika release baru menyebabkan regresi, downtime, atau kehilangan data. Prosedur ini ditulis untuk dijalankan oleh satu operator on-call dalam waktu kurang dari 30 menit.

> **Prinsip utama:** Rollback aplikasi **sebelum** rollback basis data kecuali pelebaran kolom menyebabkan kehilangan data. Selalu cadangkan basis data sebelum menjalankan langkah rollback (lihat BACKUP_RECOVERY.md).

---

## 1. Pre-Rollback Checklist

Jalankan langkah berikut sebelum melakukan perubahan apa pun. Tujuannya agar operator memiliki jejak forensik dan opsi pemulihan penuh.

1. **Backup basis data aktif.**
   ```bash
   mysqldump --single-transaction --quick --routines --triggers \
     -u "$DB_USERNAME" -p "$DB_DATABASE" \
     > /var/backups/collabite/pre-rollback-$(date +%Y%m%d-%H%M%S).sql
   ```
2. **Backup direktori `storage/app/private`.** File yang baru diunggah setelah release terakhir belum tentu ter-backup oleh cron malam.
   ```bash
   rsync -a /var/www/collabite/storage/app/private/ /var/backups/collabite/private-$(date +%Y%m%d-%H%M%S)/
   ```
3. **Identifikasi tag rilis terakhir yang diketahui baik.**
   ```bash
   git fetch --tags
   git tag --sort=-creatordate | head -5
   ```
   Pilih tag dengan catatan perubahan paling dekat dengan versi aplikasi saat ini.
4. **Kumpulkan log aplikasi terbaru** (untuk root cause analysis pasca-rollback).
   ```bash
   tar -czf /var/backups/collabite/logs-$(date +%Y%m%d-%H%M%S).tgz \
     /var/www/collabite/storage/logs/
   ```
5. **Catat SHA, tag, dan waktu dimulainya rollback** di channel insiden.

---

## 2. Code Rollback

Pilih salah satu strategi di bawah ini sesuai situasi.

### 2.1 Revert (Direkomendasikan untuk rollback selektif)

```bash
git revert <SHA>        # buat commit baru yang membatalkan perubahan
git push origin main    # trigger pipeline deploy
```

Keuntungan: jejak audit Git tetap satu arah dan pipeline otomatis (CI/CD) akan men-deploy revert sama seperti release biasa.

### 2.2 Checkout ke Tag (Untuk rollback besar)

```bash
git fetch --tags
git checkout tags/v1.0.0-rc -b rollback/v1.0.0-rc
git push origin rollback/v1.0.0-rc
```

Pipeline deploy menarik branch ini dan men-deploy seperti biasa. Setelah stabil, branch `rollback/*` dapat dihapus.

### 2.3 Redeploy Artefak Build Sebelumnya

Jika pipeline menyimpan artefak build (recommended), deploy artefak dari run sebelumnya tanpa menyentuh source.

```bash
# Pseudocode — sesuaikan dengan platform CI
deployer deploy --ref=<previous-build-id>
```

---

## 3. Migration Rollback

Seluruh migrasi Collabite dapat di-rollback (setiap kelas migrasi memiliki `down()` yang valid). Untuk mengembalikan N langkah:

```bash
php artisan migrate:rollback --step=N
```

> **Peringatan:** Jangan rollback migrasi tanpa memastikan aplikasi yang berjalan kompatibel dengan schema lama. Urutan yang aman: rollback aplikasi ke tag lama → jalankan `migrate:rollback` → restart worker.

Jika hanya satu migrasi yang bermasalah, identifikasi dan rollback satu langkah:

```bash
php artisan migrate:rollback --step=1
php artisan migrate:status
```

Untuk kasus khusus, `migrate:reset` tersedia tetapi **tidak boleh** dijalankan di produksi tanpa persetujuan eksplisit.

---

## 4. Asset Rollback

Bundle Vite (`public/build/`) dan manifest-nya adalah bagian dari kode yang di-deploy. Setelah rollback kode, aset **harus** dikembalikan agar Vite dapat menemukan entry yang sesuai.

1. Identifikasi commit/tag target rollback.
2. Di runner build, jalankan ulang build untuk tag tersebut.
3. Deploy artefak `public/build/` ke server produksi.

Atau, jika CI menyimpan artefak build per rilis:

```bash
aws s3 cp s3://collabite-builds/<previous-tag>/build.tar.gz /tmp/
tar -xzf /tmp/build.tar.gz -C /var/www/collabite/public/build
```

> **Aturan:** Vite manifest dan entry JS/CSS harus cocok dengan versi aplikasi yang berjalan. Ketidakcocokan menyebabkan error `Unable to locate file in Vite manifest` (lihat DEPLOYMENT.md §3).

---

## 5. Cache Invalidation Pasca-Rollback

Setelah aplikasi dan migrasi di-rollback, kosongkan seluruh cache yang mungkin menyimpan data dari versi sebelumnya.

```bash
php artisan optimize:clear
sudo supervisorctl restart collabite-worker:*
```

`optimize:clear` menghapus `bootstrap/cache/{config,route,view,packages}.php` dan cache aplikasi. Worker harus di-restart agar job yang sedang berjalan dengan konfigurasi lama tidak lagi menerima request.

---

## 6. Risk Matrix

Matriks di bawah ini merangkum jenis perubahan yang dapat meningkatkan risiko rollback. Setiap baris memuat indikator, dampak, dan mitigasi.

| Kategori Risiko | Indikator | Dampak | Mitigasi |
| --- | --- | --- | --- |
| **Data-shape breaking change** | Migrasi `up()` mengubah tipe kolom, menghapus kolom, atau mengubah relasi FK | Data historis menjadi tidak valid; rollback kode tanpa rollback migrasi = error runtime | Selalu rollback aplikasi **dan** migrasi bersamaan; pertahankan backup DB untuk restore manual jika diperlukan. |
| **File-format breaking change** | Update library gambar/arsip yang memproses lampiran | File lama tidak dapat dibuka atau diproses | Simpan backup `storage/app/private` (lihat §1). Tambahkan migrasi data (file converter) sebelum rollback. |
| **Session/cache stale state** | Session driver di-cache, config di-cache, ada view cache | User logout tiba-tiba; halaman kosong | Jalankan `php artisan optimize:clear` (lihat §5). |
| **Dependency supply chain** | Composer/npm package di-upgrade | Inkompatibilitas runtime | Kunci versi di `composer.lock` & `package-lock.json`; rollback keduanya. |
| **Queue job incompatibility** | Struktur payload job berubah | Worker crashloop | Restart worker dengan `--queue=default` dan abaikan job lama dengan `php artisan queue:flush`. |

---

## 7. Communication Template

### 7.1 Untuk Tim Internal (Slack/Discord insiden)

```
[ROLLBACK] Collabite <env> — dimulai <waktu>
- Rilis bermasalah: <tag>
- Target rollback: <previous-tag>
- Alasan: <satu kalimat, mis. "Login gagal karena perubahan session driver">
- PIC: @<nama>
- Estimasi selesai: <waktu>
- Status: in-progress | completed
```

Perbarui pesan Slack di atas setiap 15 menit hingga status `completed`.

### 7.2 Untuk Pengguna (jika dampak meluas)

```
Halo pengguna Collabite,

Kami sedang melakukan pemeliharaan terjadwal untuk menstabilkan layanan.
Selama periode ini, beberapa fitur mungkin tidak dapat diakses:

- Login (estimasi 10 menit)
- Pembuatan campaign baru (estimasi 15 menit)

Data Anda tetap aman. Tidak perlu melakukan perubahan pada akun.

Mohon maaf atas ketidaknyamanannya.
— Tim Collabite
```

Templat ini disesuaikan dengan tingkat dampak (login saja, upload, atau major outage). Versi final dikirim oleh PIC insiden setelah status `completed`.

---

## 8. Post-Rollback Actions

Setelah rollback selesai dan aplikasi stabil:

1. Buka tiket post-mortem dengan timeline insiden.
2. Simpan log aplikasi dan log worker di arsip.
3. Tulis ringkasan ke `docs/PROGRESS.md` (entri RC rollback).
4. Jika rollback disebabkan regresi otomatis terdeteksi, perbarui `docs/TEST_PLAN.md` agar skenario tersebut masuk regression suite.

---

## 9. Referensi Silang

- DEPLOYMENT.md — urutan build & deploy.
- BACKUP_RECOVERY.md — backup & restore MySQL.
- OPERATIONS.md — worker & scheduler.
- TDD §31 — Disaster recovery.
- ADR-013 — File storage policy.
- ADR-029 — RC database engine.
