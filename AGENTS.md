# AGENTS.md — Aturan Coding Agent Collabite

> **Versi:** 1.0 (Approved)
> **Tanggal:** 2026-06-18
> **Status:** Disetujui sebagai acuan implementasi M0–M7.

Dokumen ini adalah **kontrak kerja** antara coding agent (Claude, dsb.) dan proyek Collabite. Jika terjadi konflik dengan aturan lain, urutan prioritas di bawah berlaku. AGENTS.md **tidak menggantikan** `CLAUDE.md` (Laravel Boost) — keduanya saling melengkapi. Agent **wajib membaca `CLAUDE.md`** untuk panduan Laravel, Fortify, Inertia v3, Pest, Pint, dan Larastan.

> **Pembagian peran**:
> - `AGENTS.md` (file ini) → aturan khusus Collabite: source of truth, scope MVP, business rules, format laporan agent.
> - `CLAUDE.md` → panduan Laravel Boost: konvensi PHP, cara pakai `search-docs`, Pint, Pest, Larastan, Inertia v3, Wayfinder, Herd, dan tools MCP `laravel-boost`.

---

## 1. Cara Membaca Dokumentasi

Sebelum mengerjakan tugas apa pun, agent **wajib** membaca (atau memverifikasi via grep/Read) dokumen pada urutan berikut:

1. `docs/PRD.md` — masalah, scope, FR/NFR, business rules, traceability.
2. `docs/USE_CASE.md` — perilaku sistem dari sudut pandang aktor.
3. `docs/TDD.md` — arsitektur, ERD, struktur folder, status enum, state transition.
4. `docs/COMPONENT_DIAGRAM.md` — batas modul dan dependensi.
5. `docs/TEST_PLAN.md` — test case, traceability, UAT.
6. `docs/IMPLEMENTATION_ROADMAP.md` — milestone saat ini dan small-PR breakdown.
7. `docs/DECISIONS.md` — ADR dan rationale.
8. `AGENTS.md` (dokumen ini) — aturan kerja.

---

## 2. Source of Truth

Jika terjadi konflik, urutan **source of truth**:

1. `docs/PRD.md`
2. `docs/USE_CASE.md`
3. `docs/TDD.md`
4. `docs/COMPONENT_DIAGRAM.md`
5. `docs/TEST_PLAN.md`
6. `docs/IMPLEMENTATION_ROADMAP.md`
7. `docs/DECISIONS.md`
8. `AGENTS.md`

Jika agent menemukan konflik, **wajib melapor** dan tidak menebak sendiri.

---

## 3. Scope MVP

Fitur yang **boleh** dikerjakan: lihat PRD §9.
Fitur yang **tidak boleh** dikerjakan: lihat PRD §8 (Non-Goals). Termasuk di dalamnya:

- Payment gateway / escrow.
- Subscription / billing.
- AI Creator recommendation.
- Publikasi otomatis ke Instagram/TikTok.
- Video call.
- Native mobile app.
- WebSocket real-time / push FCM.
- GraphQL.
- Microservices.
- Elasticsearch.
- Kontrak elektronik.
- Sistem dispute kompleks.
- Analitik media sosial otomatis.

**Larangan:** Menambah fitur di luar scope MVP tanpa eksplisit mengubah PRD, USE_CASE, dan DECISIONS.

---

## 4. Stack Wajib

- Backend: PHP 8.4, Laravel 13, Eloquent.
- Frontend: React 19 + TypeScript.
- Bridge: Inertia.js v3.
- Database: MySQL 8.x.
- UI: Tailwind CSS v4 + shadcn/ui.
- File storage: Laravel Filesystem (public + private disk).
- Queue: database.
- Notification: database + email.
- Backend test: Pest v4.
- Frontend test: Vitest + React Testing Library.
- E2E test: Playwright.
- Formatter: Pint v1.
- Static analysis: Larastan v3 level 6.
- Tidak menambah dependency baru tanpa persetujuan.

---

## 5. Aturan Arsitektur

1. **Laravel monolith** dengan module domain terpisah (lihat COMPONENT_DIAGRAM.md).
2. **Tiga portal independen**: UMKM Portal, Creator Portal, Admin Portal. Tiap portal memakai modul core secara independen sesuai kebutuhannya — **bukan sebagai rantai proses bisnis**.
3. **Tidak membuat REST API internal terpisah** (ADR-006). Controller mengembalikan `Inertia::render` atau `redirect`.
4. **Layanan lintas-modul** diletakkan di `app/Services` atau `app/Actions`, **bukan** di model.
5. **Konvensi Laravel** (Boost): PSR-12, Pint, type-hints, constructor promotion, enum TitleCase.
6. **Struktur folder** sesuai TDD §6. Agent **tidak** membuat base folder baru tanpa persetujuan.

---

## 6. Aturan Migration

1. Migration baru **wajib** memiliki `down()`.
2. Penamaan: `YYYY_MM_DD_HHMMSS_create_<table>_table.php` atau `YYYY_MM_DD_HHMMSS_alter_<table>_table.php`.
3. Setiap tabel baru:
   - Memiliki `id` dan `timestamps()`.
   - Mendeklarasikan `softDeletes()` jika diperlukan (lihat TDD §13).
   - Mendeklarasikan FK + onDelete sesuai model domain.
   - Mendeklarasikan unique & index eksplisit untuk kolom yang di-query sering.
4. **Tidak menghapus** tabel/kolom pada migration yang sudah di-merge; gunakan `down()` hanya untuk rollback lokal.
5. **Mengubah schema** dari migration yang sudah di-merge: buat migration baru, jangan edit file lama.
6. **Seed** hanya di folder `database/seeders`. Factory di `database/factories`.

---

## 7. Aturan Model

1. Eloquent model **wajib** mendeklarasikan:
   - `$fillable` atau `$guarded`.
   - `casts()` untuk kolom enum/tanggal/json.
   - Relasi Eloquent (tidak pakai string manual).
2. Enum digunakan untuk kolom status (lihat TDD §14).
3. **Tidak** meletakkan logika bisnis di model — gunakan `Action`/`Service`.
4. **Tidak** mengakses `request()` dari model.
5. Soft-delete di-handle via trait `SoftDeletes` pada model yang ditandai di TDD.

---

## 8. Aturan Controller

1. Controller didaftarkan via atribut rute Laravel (Laravel 11/12/13 style) atau `routes/web.php`.
2. **Injeksi dependensi** lewat constructor atau method injection — bukan `app()->make`.
3. **Resource controller** mengikuti konvensi Laravel (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`).
4. Controller **tidak** melakukan validasi manual — gunakan Form Request.
5. Controller **tidak** memanggil `Auth::user()` secara langsung di dalam loop besar.
6. Controller mengembalikan:
   - `Inertia::render('Namespace/Page', props)` untuk view.
   - `redirect()->back()->with(...)` untuk form submission.
   - `redirect()->route('name')` untuk redirect dengan nama route.
7. **Prefix route** sesuai peran: `umkm.`, `creator.`, `admin.`, `auth.`, `public.`.

---

## 9. Aturan Validation

1. **Setiap input** dari klien divalidasi via Form Request (`app/Http/Requests`).
2. Form Request **wajib** memiliki `authorize()` (default `true`; jika kompleks, delegasi ke Policy).
3. Validasi lintas field (`deadline > today`) ditempatkan di `withValidator()` atau rules kustom.
4. Pesan error menggunakan Bahasa Indonesia dan **spesifik**.

---

## 10. Aturan Policy

1. Setiap resource utama memiliki Policy (lihat TDD §10).
2. Policy didaftarkan via `Gate::policy` otomatis (Laravel convention) atau service provider.
3. Pemeriksaan di Controller: `$this->authorize('action', $model)`.
4. Test policy di folder `tests/Feature/Authorization/*` (lihat TEST_PLAN).

---

## 11. Aturan React / Inertia

1. Halaman Inertia di `resources/js/pages/{Auth,Public,Umkm,Creator,Admin}/*`.
2. Komponen shared di `resources/js/components/{ui,layout,common}`.
3. **Aktifkan skill `inertia-react-development`** saat menulis/mengedit kode Inertia client.
4. **Gunakan `search-docs` MCP tool** untuk dokumentasi Inertia v3 sebelum perubahan.
5. Aksi/form submit gunakan `useForm` dari `@inertiajs/react`.
6. **Naming komponen** PascalCase. Halaman dinamai sesuai path URL (mis. `pages/Umkm/Campaign/Create.tsx`).
7. **TypeScript strict** aktif (lihat `tsconfig.json`).
8. **Hindari** axios (Inertia v3 menghapus axios default); gunakan XHR bawaan.

---

## 12. Aturan TypeScript

1. `strict: true` (lihat `tsconfig.json`).
2. Setiap komponen Halaman memiliki `PageProps` typing (via Inertia `PageProps` generic).
3. Hindari `any`. Gunakan `unknown` + narrowing jika tidak tahu tipenya.
4. Path imports: gunakan alias `@/*` yang didefinisikan di `tsconfig.json`.
5. **Wayfinder**: gunakan generated helpers dari `@/actions/` (controller) atau `@/routes/` (named route). Jangan tulis URL hard-coded.

---

## 13. Aturan File Upload

1. Logo, foto produk, foto portofolio → disk `public`.
2. Dokumen verifikasi, lampiran pesan, file submission → disk `private`.
3. Akses file private via `URL::temporarySignedRoute('files.private', $ttl, ['path' => $path])`.
4. Validasi MIME & ukuran di Form Request (lihat TDD §16).
5. Penamaan file: UUIDv4. **Jangan** menyimpan nama asli di storage path (simpan di kolom `original_name`).
6. Path pattern: `{module}/{owner_id}/{uuid}.{ext}`.

---

## 14. Aturan Security

1. **CSRF** otomatis via Inertia; tidak menonaktifkan middleware `VerifyCsrfToken`.
2. **Rate limit** pada `login`, `register`, `forgot-password`.
3. **Hashing password** via bcrypt/argon bawaan Laravel.
4. **Hindari** menyimpan data sensitif di log (password, token, isi pesan).
5. **Validasi** semua input via Form Request — termasuk query string.
6. **Authorization** dicek di Controller/Policy — bukan di Blade/JSX.
7. **Signed URL** untuk akses file private.
8. **Email enumeration prevention**: response `/forgot-password` selalu 200 dengan pesan generik.

---

## 15. Aturan Testing

1. **Setiap perubahan kode** harus disertai test (feature/unit/component) sesuai TEST_PLAN.
2. **Test Enforcement** (CLAUDE.md): tulis/ubah test, lalu jalankan test yang terdampak.
3. **Pest** untuk backend. Format: `php artisan make:test --pest NameTest`.
4. **Vitest + RTL** untuk frontend.
5. **Playwright** untuk E2E happy path.
6. **Larastan** level 6: `vendor/bin/phpstan analyse` tanpa error baru.
7. **Pint**: `vendor/bin/pint --dirty --format agent` sebelum finalize.
8. **Coverage minimum**: backend 70%, frontend 60% (PRD §17).

---

## 16. Small-PR Workflow

1. Agent **wajib** memecah implementasi milestone menjadi PR kecil sesuai IMPLEMENTATION_ROADMAP §small-PR.
2. Setiap PR:
   - Berfokus pada satu concern.
   - Disertai test.
   - Lulus Pint, Larastan, dan test sebelum dinyatakan selesai.
3. Agent **tidak** memaket banyak concern dalam satu PR.
4. Commit message: `conventional commits` (feat:, fix:, chore:, test:, docs:, refactor:).
5. Branch naming: `feat/<milestone>-<slug>` (mis. `feat/m1-register-umkm`).

---

## 17. Definition of Done

Suatu fitur dianggap selesai jika:

1. Kode ditulis sesuai aturan arsitektur & konvensi Laravel.
2. Test (unit/feature/authorization/component) ditulis dan lulus.
3. `vendor/bin/pint --dirty` bersih.
4. `vendor/bin/phpstan analyse` tanpa error baru.
5. `php artisan test --compact` lulus untuk test terdampak.
6. Frontend build (`npm run build`) sukses.
7. Tidak ada perubahan di luar scope.
8. PR didokumentasikan (deskripsi, screenshot jika UI, referensi FR/UC/TC).

---

## 18. Larangan Menambah Fitur di Luar Scope

1. **Tidak menambah** migration/model/controller/route/React page yang tidak terkait milestone aktif.
2. **Tidak menambah** dependency baru tanpa persetujuan.
3. **Tidak membuat** REST API route baru untuk kebutuhan internal.
4. **Tidak menggunakan** library UI di luar shadcn/ui + Tailwind.
5. **Tidak membuat** field baru di tabel tanpa konfirmasi dampaknya terhadap FR/Use Case.

---

## 19. Format Laporan Agent Setelah Implementasi

Setiap kali agent menyelesaikan satu task/PR, agent **wajib** melaporkan dengan format:

```markdown
## Ringkasan
- <satu kalimat ringkasan>

## Perubahan
- <daftar file/komponen yang berubah>
- <migration baru (jika ada)>
- <dependency baru (jika ada)>

## Validasi
- `vendor/bin/pint --dirty`: <lulus / daftar error>
- `vendor/bin/phpstan analyse`: <lulus / daftar error>
- `php artisan test --compact --filter=...`: <lulus / ringkasan>
- `npm run build`: <sukses / error>

## Traceability
- FR terkait: FR-XXX-XXX
- Use Case terkait: UC-XXX-XXX
- Test Case terkait: TC-XXX-XXX
- Milestone: Mx

## Catatan / Asumsi
- <daftar asumsi>
- <daftar open questions>
```

---

## 20. Aturan Tambahan

1. **Tidak menghapus** test tanpa persetujuan.
2. **Tidak memaksa** commit/push. Agent hanya bekerja sampai PR-ready.
3. **Tidak membuat** dokumentasi tambahan (mis. README panjang, tutorial) di luar `docs/`. Jika perlu, ajukan perubahan ke `docs/`.
4. **Aktifkan skill** yang relevan (mis. `inertia-react-development`, `pest-testing`, `tailwindcss-development`) saat masuk domain tersebut.
5. **Gunakan** `search-docs` MCP tool sebelum perubahan kode library/framework.
6. **Berkomunikasi** dengan ringkas: fokus pada **apa** yang berubah, **mengapa**, dan **bagaimana memverifikasinya**.

---

## Lampiran A. Daftar Skill yang Sering Diperlukan

| Domain | Skill |
| --- | --- |
| React + Inertia | `inertia-react-development` |
| Pest | `pest-testing` |
| Tailwind | `tailwindcss-development` |
| Wayfinder | `wayfinder-development` |
| Laravel best practices | `laravel-best-practices` |
| Fortify | `fortify-development` |
| Riset keputusan | `deep-research` (jika ada keputusan besar) |
| Code review | `code-review` (sebelum merge) |
| Simplify | `simplify` (cleanup setelah implementasi) |
| Audit | `audit` (quality check) |

---

## Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 0.1 (Draft) | 2026-06-18 | Initial draft: aturan agent + traceability. | Product Engineer |
| 1.0 (Approved) | 2026-06-18 | Tutup OQ-001..OQ-011. Tambah aturan: AGENTS/CLAUDE split, single-role, immutable messages, file size policy, signed URL, audit log untuk pembatalan. | Product Engineer |
