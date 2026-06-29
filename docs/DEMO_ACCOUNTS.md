# Demo Accounts (Local Only)

> **Peringatan.** Daftar akun di bawah ini hanya untuk lingkungan **lokal / testing**. JANGAN gunakan kredensial ini di staging atau production. Untuk RC walkthrough Collabite, ikuti urutan skenario pada bagian [Walkthrough](#walkthrough).

Daftar akun ini dihasilkan oleh `database/seeders/DemoDataSeeder.php` (di-guard oleh `app()->environment(['local', 'testing'])`) yang dipanggil oleh `DatabaseSeeder` setelah `AdminUserSeeder`, `CategorySeeder`, dan `SkillSeeder`.

## Akun

| Email | Password | Role | Status |
| --- | --- | --- | --- |
| admin@collabite.test | password | Admin | Active |
| umkm1@collabite.test | password | UMKM | Active (Kedai Kopi Sari) |
| umkm2@collabite.test | password | UMKM | Active (Batik Nusantara) |
| umkm3@collabite.test | password | UMKM | Active (Kecantikan Alami) |
| creator1@collabite.test | password | Creator | Verified, rating 5.0 (1 review) |
| creator2@collabite.test | password | Creator | Pending verification (dengan dokumen KTP dummy) |
| creator3@collabite.test | password | Creator | Rejected — "Foto KTP tidak jelas" |

## Walkthrough

Skenario RC yang dicakup oleh data demo:

- **Campaign "Promo Kopi Baru"** (status Open) — milik Kedai Kopi Sari, memiliki 2 deliverable (Video Reels + Foto Produk).
- **Pengajuan (Application):** `creator1` melamar ke "Promo Kopi Baru" dengan status Pending.
- **Undangan (Invitation):** `umkm1` mengundang `creator2` ke campaign "Story Kopi Pagi" (Open) dengan status Pending. `creator2` menerima notifikasi.
- **Kolaborasi Aktif:** `umkm2` + `creator1` di campaign "Showcase Koleksi Batik" (InCollaboration, status `active`). Dilengkapi conversation dengan 2 pesan dan 1 progress update. Submission versi 1 berstatus InReview.
- **Kolaborasi Selesai:** `umkm3` + `creator1` di campaign "Launching Skincare Lokal" (Completed). Submission final berstatus Approved. Tersedia dua review: UMKM→Creator rating 5 dan Creator→UMKM rating 4. Rating `creator1` di-update menjadi 5.0 (1 review).

## Cara Menjalankan Ulang

```bash
# Pastikan APP_ENV=local dan DB_CONNECTION=sqlite (lihat ADR-029).
php artisan migrate:fresh --seed --force
```

`DemoDataSeeder` seluruhnya **idempotent** (`updateOrCreate` / `firstOrCreate`) sehingga aman dijalankan berulang tanpa menggandakan data. Tidak ada upload file beneran — path dokumen verifikasi (`storage/app/private/demo/sample.pdf`) hanya metadata dummy.

## Validasi Cepat

```bash
php artisan tinker --execute 'echo "users=".\App\Models\User::count()
  ." campaigns=".\App\Models\Campaign::count()
  ." collabs=".\App\Models\Collaboration::count()
  ." reviews=".\App\Models\Review::count()
  ." logs=".\App\Models\ActivityLog::count()
  ." notifs=".\Illuminate\Notifications\DatabaseNotification::count();'
```

Harus menghasilkan minimal: users≥7, campaigns≥4, collabs≥2, reviews≥2, logs≥6, notifs≥2.