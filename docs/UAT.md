# UAT Guide — Collabite MVP

> **Versi:** 1.0
> **Tanggal:** 2026-06-18
> **Status:** Disetujui

Dokumen ini adalah skenario UAT (User Acceptance Testing) untuk MVP Collabite.
Tester menjalankan setiap skenario dan mencatat hasilnya pada kolom **Expected vs
Actual**.

## Prasyarat

1. Aplikasi berjalan pada `http://collabite.test` (atau `php artisan serve`).
2. Database sudah di-migrate dan di-seed (`php artisan migrate:fresh --seed`).
3. Queue worker jalan: `php artisan queue:work --tries=1 --timeout=60`.
4. Mail driver log (default development): cek `storage/logs/laravel.log`.

## Akun Demo (dari seeder)

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@collabite.test` | `password` |
| UMKM A | `umkm.a@collabite.test` | `password` |
| UMKM B | `umkm.b@collabite.test` | `password` |
| Creator A (verified) | `creator.a@collabite.test` | `password` |
| Creator B (pending) | `creator.b@collabite.test` | `password` |
| Creator C (unverified) | `creator.c@collabite.test` | `password` |

## Skenario UAT

### UAT-UMKM-001 — UMKM membuat campaign, undang Creator, selesaikan kolaborasi dengan revisi

| # | Aksi | Expected |
| --- | --- | --- |
| 1 | Login sebagai `umkm.a@collabite.test`. | Masuk dashboard UMKM. |
| 2 | Buka "Profil Usaha" → perbarui bio, alamat, kota. | Tersimpan. |
| 3 | Buka "Produk" → tambah 1 produk dengan foto. | Produk tampil publik. |
| 4 | Buka "Campaign" → klik "Buat Campaign". Isi judul, deskripsi, kategori, budget, deadline, ≥1 deliverable. | Campaign `Draft`. |
| 5 | Buka halaman campaign → klik "Publikasikan". | Status `Open`, tampil di direktori Creator. |
| 6 | Buka "Cari Creator" → ketik "Creator A". Klik profilnya. | Profil publik tampil dengan portofolio. |
| 7 | Klik "Undang Creator" dengan pesan singkat. | Invitation `Pending` untuk Creator A. |
| 8 | (login sebagai Creator A; lihat skenario UAT-CREATOR-001 untuk detail kolaborasi) | — |
| 9 | Kembali ke UMKM A, buka kolaborasi. Lihat pesan, progress, submission v1. | Submission v1 `InReview`. |
| 10 | Klik "Minta Revisi" dengan catatan "tambah intro 3 detik". | Status `RevisionRequested`; catatan tersimpan. |
| 11 | (Creator A upload v2, kirim review) | Submission v2 `InReview`. |
| 12 | Klik "Setujui". | Status `Approved`. Tombol "Selesaikan Kolaborasi" muncul. |
| 13 | Klik "Selesaikan Kolaborasi". | Status kolaborasi `Completed`. |
| 14 | Beri rating 5 + review. | Review tersimpan, rating Creator A ter-update. |

### UAT-CREATOR-001 — Creator ajukan verifikasi & kerjakan kolaborasi

| # | Aksi | Expected |
| --- | --- | --- |
| 1 | Login sebagai `creator.c@collabite.test` (unverified). | Dashboard tampil dengan banner verifikasi. |
| 2 | Buka "Profil" → lengkapi bio, kota, kontak. | Tersimpan. |
| 3 | Buka "Keahlian" → pilih 2 skill & 2 kategori. | Tersimpan. |
| 4 | Buka "Portofolio" → tambah 1 item (judul, deskripsi, gambar). | Tersimpan. |
| 5 | Buka "Verifikasi" → upload KTP + 1 bukti portofolio; submit. | Status `Pending`. |
| 6 | (login sebagai Admin) Buka "Verifikasi" → klik pengajuan; approve. | Creator C menjadi `Verified`. Notifikasi diterima. |
| 7 | Login sebagai `creator.a@collabite.test` (sudah verified). | — |
| 8 | Buka "Cari Campaign" → buka campaign UMKM A. | Detail campaign tampil. |
| 9 | Klik "Ajukan Kolaborasi". | Request `Pending` ke UMKM A. |
| 10 | UMKM A menerima (lihat UAT-UMKM-001). | Kolaborasi `Active`. |
| 11 | Buka kolaborasi → tulis progress update. | Tercatat di timeline. |
| 12 | Upload submission v1 → klik "Kirim untuk Review". | Status `InReview`. |
| 13 | UMKM revisi → Creator upload v2 → UMKM approve. | (lihat UAT-UMKM-001) |
| 14 | Setelah UMKM selesaikan, beri rating ke UMKM. | Review Creator→UMKM tersimpan. |

### UAT-ADMIN-001 — Admin verifikasi & moderasi

| # | Aksi | Expected |
| --- | --- | --- |
| 1 | Login sebagai `admin@collabite.test`. | Dashboard admin tampil. |
| 2 | Buka "Verifikasi" → antrian `Pending` tampil. | Daftar tampil. |
| 3 | Buka detail pengajuan → klik "Setujui". | Status Creator → `Verified`. Notifikasi terkirim. |
| 4 | Buka "Campaign" → pilih satu campaign → klik "Sembunyikan". | Campaign tidak tampil di pencarian Creator. |
| 5 | Buka "Konten" → sembunyikan satu submission. | Submission tidak tampil publik. |
| 6 | Buka "Review" → sembunyikan satu review. | Review tidak tampil publik. |
| 7 | Buka "Audit Log" → filter by `actor=admin`. | Daftar event admin tampil. |
| 8 | Buka "Laporan" → klik "Ekspor CSV". | File CSV terdownload. |
| 9 | Buka "Pengguna" → suspend satu akun UMKM. | Akun suspended tidak bisa login. |

## Negative Workflows (harus ditolak)

| # | Aksi | Expected |
| --- | --- | --- |
| N-1 | UMKM B mencoba edit campaign milik UMKM A. | 403 Forbidden. |
| N-2 | Creator unverified mencoba membuat submission. | 403 (policy menolak). |
| N-3 | Creator mengajukan kedua kali ke campaign yang sama. | 422 — duplikat. |
| N-4 | UMKM mengundang Creator yang sama dua kali. | 422 — duplikat invitation. |
| N-5 | User ketiga mencoba membuka halaman kolaborasi. | 403. |
| N-6 | User ketiga mencoba akses file submission via URL. | 403 (signature invalid). |
| N-7 | Creator mencoba setujui submission miliknya sendiri. | 403 (kewenangan UMKM). |
| N-8 | Collaboration tanpa submission approved dicoba complete. | 422 — harus ada approved. |
| N-9 | UMKM memberi review kedua kali untuk kolaborasi sama. | 422 — duplikat review. |
| N-10 | Akun suspended mencoba login. | Ditolak dengan pesan "akun dinonaktifkan". |
| N-11 | UMKM/Creator mencoba akses `/admin/*`. | 403. |

## Checklist UAT

- [x] 🟢 Lulus (automated) — Semua skenario UAT-UMKM-001 lulus. Lihat `docs/UAT_RESULTS.md` §UAT-UMKM-001.
- [x] 🟢 Lulus (automated) — Semua skenario UAT-CREATOR-001 lulus. Lihat `docs/UAT_RESULTS.md` §UAT-CREATOR-001.
- [x] 🟢 Lulus (automated) — Semua skenario UAT-ADMIN-001 lulus. Lihat `docs/UAT_RESULTS.md` §UAT-ADMIN-001.
- [ ] Semua negative workflow (N-1 s/d N-11) lulus. _(terverifikasi sebagian via test otomatis; validasi user eksternal terjadwal pasca-RC — lihat `docs/UAT_RESULTS.md` §5)_
- [x] 🟢 Lulus (automated) — Backend test (`php artisan test --compact`) hijau. 166/166 passed.
- [x] 🟢 Lulus (automated) — Frontend build (`npm run build`) sukses.
- [x] 🟢 Lulus (automated) — Format check (`vendor/bin/pint --dirty`) bersih.
- [x] 🟢 Lulus (automated) — Audit log menulis event untuk aksi-aksi utama.

> Catatan: Status 🟢 Lulus (automated) di atas merujuk ke eksekusi otomatis oleh coding agent (Pest + Vitest) pada 2026-06-18. Bukti per-skenario tersedia di `docs/UAT_RESULTS.md`.

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 1.0 | 2026-06-18 | Initial UAT guide. | Product Engineer |
