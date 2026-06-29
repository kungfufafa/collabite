# Active Blockers

> Status: RC.1 verification gate — Senin 2026-06-18.

**Active: Playwright suite 2/17 passing because of CSRF helper bug; fix in progress (`tests/E2E/_helpers.ts`). Not yet release-ready.**

- Lingkup: HTTP request Playwright specs menanggung helper yang menyusun token CSRF/XSRF tidak benar, sehingga 14/17 skenario gagal sebelum sampai ke langkah UI.
- Dampak: gate Browser-E2E belum hijau, sehingga RC.1 belum dapat dinyatakan "LOCALLY VALIDATED".
- Bukan perilaku produk: hasil eksekusi menunjukkan alur produk benar; gagalnya spec E2E.
- Perbaikan: helper CSRF tengah diperbaiki oleh agen paralel. Setelah spec fix mendarat dan `npx playwright test` hijau, status RC.1 berubah menjadi "LOCALLY VALIDATED — READY FOR STAGING".
- Bukan Blocker domain produk: tidak ada Blocker/Critical/main-flow High pada domain produk (lihat `docs/DEFECTS.md`).
