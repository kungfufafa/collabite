# UAT — Collabite

> **Versi:** 1.0
> **Tanggal:** 2026-06-18

UAT dilakukan setelah release gate lulus. Skenario mengikuti [`TEST_PLAN.md`](./TEST_PLAN.md).

---

## Status

- ⏳ UAT-UMKM-001 — UMKM Selesaikan Kolaborasi dengan Revisi *(belum dieksekusi manual)*
- ⏳ UAT-CREATOR-001 — Creator Ajukan Verifikasi & Kerjakan Kolaborasi *(belum dieksekusi manual)*
- ⏳ UAT-ADMIN-001 — Admin Verifikasi & Moderasi *(belum dieksekusi manual)*

> UAT dieksekusi oleh Product Owner / tim QA pada environment staging menggunakan data dari seeder. Backend test (74 test Pest) sudah membuktikan perilaku use case utama di level integrasi.

---

## Prasyarat UAT

1. `php artisan migrate:fresh --seed` pada environment staging.
2. Login sebagai admin (`admin@collabite.test` / `password`).
3. Daftar akun UMKM & Creator baru.
4. Ikuti skenario di [`TEST_PLAN.md`](./TEST_PLAN.md) §13.

---

## Catatan

- Jika ditemukan bug Blocker/Critical, tulis ke [`BLOCKERS.md`](./BLOCKERS.md).
- Bug Medium/Low dicatat di issue tracker.
