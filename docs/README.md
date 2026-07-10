# Dokumentasi Collabite

Seluruh dokumen di direktori `docs/` ini adalah **sumber kebenaran tunggal** untuk desain produk dan teknis MVP Collabite. Dokumen ditulis dalam Bahasa Indonesia, berformat Markdown, dan dapat dibaca oleh manusia maupun coding agent.

---

## Ringkasan Proyek

**Collabite** adalah platform kolaborasi yang mempertemukan UMKM dengan Content Creator untuk menjalankan campaign promosi berbasis konten. Aplikasi menyediakan:

1. **Marketplace** — menemukan Creator dan campaign yang relevan.
2. **Workspace** — mengelola kolaborasi dari pendaftaran, pengerjaan, revisi, hingga penyelesaian dan review.

Stack: Laravel 13 monolith, Inertia.js v3, React 19 + TypeScript, MySQL, Tailwind CSS v4 + shadcn/ui, Pest, Vitest, Playwright.

---

## Daftar Dokumen

| Dokumen | Tujuan | Audience |
| --- | --- | --- |
| [PRD.md](./PRD.md) | Product Requirements Document — masalah, persona, functional & non-functional requirements, acceptance criteria, business rules, metrik, rilis, risiko. | Product Owner, Engineer, QA |
| [USE_CASE.md](./USE_CASE.md) | Use case lengkap untuk UMKM, Creator, dan Admin, lengkap dengan diagram Mermaid. | Engineer, QA |
| [TDD.md](./TDD.md) | Technical Design Document — arsitektur, lifecycle, struktur folder, ERD, status enum, dan rancangan tabel. | Engineer |
| [COMPONENT_DIAGRAM.md](./COMPONENT_DIAGRAM.md) | Component diagram Mermaid dengan deskripsi tanggung jawab, interface, dependensi, dan data yang dikelola. | Engineer, Arsitek |
| [TEST_PLAN.md](./TEST_PLAN.md) | Test plan, test case, traceability matrix, dan UAT scenario. | QA, Engineer |
| [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | Roadmap 8 milestone dengan small-PR breakdown dan Definition of Done. | Engineering Lead, Product Owner |
| [DECISIONS.md](./DECISIONS.md) | Architecture Decision Record untuk keputusan teknis dan produk. | Engineer, Arsitek |
| [UI_DESIGN_TRANSITION_PLAN.md](./UI_DESIGN_TRANSITION_PLAN.md) | Kontrak desain dan runbook transisi ke Warm Humanist Marketplace Minimalism. | Product Owner, Designer, Coding Agent, QA |
| [UI_DESIGN_TRANSITION_STATE.md](./UI_DESIGN_TRANSITION_STATE.md) | Checkpoint mutable, slice register, evidence, blocker, dan handoff lintas-model. | Coding Agent, QA, Engineering Lead |
| [../AGENTS.md](../AGENTS.md) | Aturan wajib untuk coding agent (source of truth, scope, konvensi). | Coding Agent |
| [../CLAUDE.md](../CLAUDE.md) | Panduan Laravel Boost, framework, testing, dan tools untuk coding agent. | Coding Agent |

---

## Urutan Membaca

Disarankan membaca dalam urutan berikut:

1. **PRD.md** → pahami masalah, persona, dan ruang lingkup.
2. **USE_CASE.md** → pahami perilaku sistem dari sudut pandang aktor.
3. **TDD.md** → pahami rancangan teknis dan basis data.
4. **COMPONENT_DIAGRAM.md** → pahami batas modul dan dependensi.
5. **TEST_PLAN.md** → pahami cara memvalidasi setiap requirement.
6. **IMPLEMENTATION_ROADMAP.md** → pahami urutan eksekusi.
7. **DECISIONS.md** → pahami rationale di balik pilihan teknis.
8. **AGENTS.md** → pahami aturan kerja khusus Collabite.
9. **CLAUDE.md** → pahami panduan Laravel Boost, framework, test, dan tools.
10. **UI_DESIGN_TRANSITION_PLAN.md** → pahami kontrak dan fase migrasi UI jika task menyentuh transisi desain.
11. **UI_DESIGN_TRANSITION_STATE.md** → lanjutkan slice aktif tanpa bergantung pada riwayat chat.

---

## Status Dokumen

| Status | Arti |
| --- | --- |
| **Draft** | Dokumen masih dalam tahap perumusan awal. |
| **Approved** | Dokumen telah disetujui sebagai acuan kerja implementasi. |
| **Superseded** | Dokumen telah digantikan oleh versi lain. Lihat catatan di dalam dokumen. |

**Status saat ini:** Dokumen inti M0–M7 berstatus Approved sejak 2026-06-18. Arah transisi UI pada ADR-034 dan `UI_DESIGN_TRANSITION_PLAN.md` berstatus Approved sejak 2026-07-10; implementasinya belum dimulai.

---

## Aturan Perubahan Dokumentasi

1. **Source of truth.** Jika terjadi konflik antar-dokumen, urutan prioritas:

   1. `docs/PRD.md`
   2. `docs/USE_CASE.md`
   3. `docs/TDD.md`
   4. `docs/COMPONENT_DIAGRAM.md`
   5. `docs/TEST_PLAN.md`
   6. `docs/IMPLEMENTATION_ROADMAP.md`
   7. `docs/DECISIONS.md`
   8. `AGENTS.md`

2. **Setiap perubahan wajib** memperbarui juga traceability matrix di PRD (FR ↔ Use Case ↔ Test Case ↔ Milestone) dan TDD (Entity ↔ Use Case ↔ Component).

3. **Setiap perubahan wajib** menambahkan ADR baru di `DECISIONS.md` jika mengubah keputusan teknis yang sudah tercatat, atau memperbarui ADR yang relevan.

4. **Tidak boleh** menambah fitur di luar MVP yang telah didefinisikan tanpa mengubah PRD, USE_CASE, dan DECISIONS secara eksplisit.

5. **Dokumen harus konsisten**: istilah, ID requirement, dan nama use case harus identik di seluruh dokumen.

6. **Versi dokumen**: perubahan besar diakhiri dengan catatan di akhir file (tanggal, versi, ringkasan perubahan, penulis).

## Dokumen Operasional Pelengkap

Selain dokumen desain, tim implementasi mengelola dokumen operasional berikut di `docs/`:

- `IMPLEMENTATION_PLAN.md` — rencana eksekusi teknis M0–M7.
- `PROGRESS.md` — catatan progres harian per-milestone.
- `TEST_RESULTS.md` — rekap hasil test.
- `BLOCKERS.md` — daftar blocker aktif.
- `UAT.md` — catatan hasil UAT.
- `DEMO_ACCOUNTS.md` — daftar akun demo lokal (UMKM/Creator/Admin) + skenario RC walkthrough yang dihasilkan `DemoDataSeeder`.
