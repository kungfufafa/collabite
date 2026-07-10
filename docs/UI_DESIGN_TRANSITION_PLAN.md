# Rencana Transisi Desain UI Collabite

> **ID:** UI-TRANSITION-001  
> **Versi kontrak:** 1.0  
> **Tanggal:** 2026-07-10  
> **Status:** Approved direction, execution not started  
> **Target:** Warm Humanist Marketplace Minimalism  
> **State aktif:** [UI_DESIGN_TRANSITION_STATE.md](./UI_DESIGN_TRANSITION_STATE.md)

Dokumen ini menjadi kontrak desain dan runbook migrasi UI Collabite. Model pelaksana boleh berasal dari penyedia mana pun. Riwayat chat, preferensi model, dan contoh desain generik tidak menggantikan dokumen ini.

> Collabite harus terasa ramah seperti marketplace, terstruktur seperti project workspace, dan tepercaya seperti layanan finansial tanpa terasa dingin.

---

## 1. Hasil yang Dituju

Migrasi ini harus menghasilkan antarmuka yang:

1. Membantu pengguna mengenali konteks, status, dan langkah berikutnya dalam lima detik pertama.
2. Memudahkan UMKM dengan pengalaman digital beragam untuk mencari Creator dan mengelola campaign.
3. Memberi Creator ruang untuk menonjolkan karya tanpa dekorasi antarmuka yang bersaing dengan portofolio.
4. Menjaga workspace kolaborasi tetap tenang saat pengguna membaca brief, revisi, pembayaran, dan riwayat aktivitas.
5. Menjaga Admin efisien saat memeriksa tabel, filter, antrian, dan aksi moderasi.
6. Menggunakan WCAG 2.2 Level AA sebagai quality gate internal pada alur dan layar yang masuk scope. Gate ini memperkuat NFR-ACCESSIBILITY-001 dan tidak menambah fitur produk.

Migrasi tidak mengubah fitur, business rule, route, policy, state transition, atau struktur data.

### 1.1 Ukuran keberhasilan

Tim menyatakan arah desain berhasil saat bukti berikut tersedia:

- Pengguna dapat membedakan satu primary action, status utama, dan next step pada setiap layar prioritas.
- Body text memakai sentence case dan ukuran yang terbaca pada mobile.
- Border, shadow, warna, dan card tidak memberi bobot yang sama pada seluruh elemen.
- Seluruh shell pada ADR-031 menunjukkan karakter yang tepat untuk perannya.
- Seluruh state penting tetap terbaca tanpa bergantung pada warna.
- Pengujian frontend, build, dan E2E yang terdampak lulus.
- Product Owner menerima screenshot kalibrasi dan UAT akhir.

---

## 2. Cara Menggunakan Dokumen Ini

### 2.1 Urutan baca wajib

Model pelaksana membaca dokumen berikut sebelum memilih slice:

1. [PRD.md](./PRD.md)
2. [USE_CASE.md](./USE_CASE.md)
3. [TDD.md](./TDD.md)
4. [COMPONENT_DIAGRAM.md](./COMPONENT_DIAGRAM.md)
5. [TEST_PLAN.md](./TEST_PLAN.md)
6. [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
7. [DECISIONS.md](./DECISIONS.md), terutama ADR-031 dan ADR-034
8. [../AGENTS.md](../AGENTS.md)
9. [../CLAUDE.md](../CLAUDE.md)
10. Dokumen ini
11. [UI_DESIGN_TRANSITION_STATE.md](./UI_DESIGN_TRANSITION_STATE.md)

Source of truth proyek tetap mengikuti urutan di `AGENTS.md`. Dokumen ini mengatur target visual dan cara migrasinya. Model harus mencatat blocker jika dokumen ini bertentangan dengan source of truth yang lebih tinggi.

### 2.2 Aturan kerja model

Setiap model harus:

1. Memeriksa `git status` dan menjaga perubahan milik pengguna.
2. Mengerjakan satu slice aktif dalam satu waktu.
3. Membatasi perubahan pada allowlist file milik slice.
4. Menangkap kondisi sebelum dan sesudah dengan data serta viewport yang sama.
5. Menjalankan verifikasi yang tercantum pada slice.
6. Memperbarui state sebelum menyerahkan pekerjaan atau mengakhiri context.
7. Berhenti pada gate persetujuan manusia yang ditandai `HUMAN-GATE`.

Model tidak boleh membuka PR, commit, push, menambah dependency, atau mengubah resource eksternal tanpa instruksi pengguna pada task pelaksanaan.

### 2.3 Kontrak terkunci

Bagian 3 sampai 7 berstatus `LOCKED`.

```yaml
contract_id: UI-TRANSITION-001
contract_version: 1.0
contract_status: LOCKED
change_authority: explicit_product_owner_approval
```

Model pelaksana tidak boleh mengubah kontrak untuk menyesuaikan hasil implementasinya. Usulan perubahan memakai ID `UI-CR-XXX` dan mencantumkan alasan, dampak, screenshot, slice terdampak, serta persetujuan Product Owner.

---

## 3. Konteks Produk dan Pengguna

### 3.1 Pekerjaan utama pengguna

| Pengguna                 | Pekerjaan utama                                                                | Kondisi saat memakai UI                 | Kebutuhan emosional                                   |
| ------------------------ | ------------------------------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------- |
| Bu Sari, pemilik UMKM    | Mencari Creator, membuat brief, meninjau progres, menyetujui konten            | Membagi perhatian dengan operasi usaha  | Yakin, terbimbing, tidak takut salah                  |
| Andi, Creator independen | Menampilkan portofolio, mencari campaign, mengirim pekerjaan, menangani revisi | Berpindah antara mobile dan desktop     | Dihargai, fokus, tahu status pembayaran dan pekerjaan |
| Rina, Admin              | Memverifikasi, memoderasi, memeriksa laporan dan audit                         | Menangani banyak record dalam satu sesi | Efisien, konsisten, dapat melacak keputusan           |

### 3.2 Masalah desain saat ini

Neo-brutalism diterapkan pada tiga lapis:

1. Override global di `resources/css/app.css`.
2. Wrapper `.neo-brutal` di `resources/js/app.tsx`.
3. Utility dan helper lokal seperti `brutal-*`, border 2 sampai 3 piksel, hard offset shadow, `font-black`, dan uppercase.

Akumulasi tersebut membuat card, button, input, badge, dialog, dan heading memiliki bobot visual serupa. Pengguna harus memilah terlalu banyak sinyal sebelum menemukan tindakan yang penting.

### 3.3 Drift layout yang harus diselesaikan

ADR-031 menetapkan `MarketplaceLayout` dengan top navigation, role-specific menu, mobile sheet, dan mobile bottom navigation. Implementasi aktif memakai `AppShell` dengan sidebar untuk UMKM, Creator, dan Admin. Test layout saat ini ikut mengunci sidebar tersebut.

Model pelaksana menangani drift ini sebagai slice terpisah pada P0. Source of truth ADR-031 menentukan target. Model tidak boleh mencampur rekonsiliasi shell dengan perubahan token atau restyling halaman.

---

## 4. Kontrak Desain

| ID       | Aturan                                                                                                                                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DC-001` | Collabite memakai Warm Humanist Marketplace Minimalism sebagai arah visual produk.                                                                                                                                                 |
| `DC-002` | UI mengutamakan konteks, status, dan langkah berikutnya pada setiap layar.                                                                                                                                                         |
| `DC-003` | Keramahan berasal dari bahasa, whitespace, foto karya, ilustrasi yang relevan, dan feedback yang jelas.                                                                                                                            |
| `DC-004` | Kepercayaan berasal dari hierarki, konsistensi, bukti verifikasi, rating, ownership, dan feedback aksi.                                                                                                                            |
| `DC-005` | Body, heading, field label, button, dan status memakai sentence case. Uppercase hanya boleh pada brand lockup atau tag dua kata yang telah lolos uji baca.                                                                         |
| `DC-006` | Hierarki memakai kombinasi ukuran, weight, posisi, spacing, grouping, dan warna. Hard border dan hard shadow tidak boleh menjadi alat hierarki global.                                                                             |
| `DC-007` | Biru menjadi warna aksi dan kepercayaan. Oranye menjadi aksen kreatif yang dipakai hemat. Warna semantik tidak mengambil peran warna brand.                                                                                        |
| `DC-008` | Border default memakai 1 piksel, radius moderat, dan shadow lembut yang dipakai pada elevation yang jelas.                                                                                                                         |
| `DC-009` | Satu action region memiliki satu primary action. Secondary action memakai treatment yang lebih tenang.                                                                                                                             |
| `DC-010` | Card hanya membungkus objek diskret atau area interaktif. Section menggunakan spacing, heading, background, atau divider. Card tidak boleh ditumpuk di dalam card.                                                                 |
| `DC-011` | Portofolio, foto, nama, rating, verifikasi, kota, kategori, budget, deadline, dan deliverable menjadi sumber informasi visual marketplace.                                                                                         |
| `DC-012` | Public dan Auth terasa ramah serta editorial; Marketplace berorientasi discovery; Workspace berorientasi task dan status; Admin berorientasi operasi.                                                                              |
| `DC-013` | Seluruh state interaktif memiliki default, hover bila didukung, focus, active, disabled, loading, error, dan success.                                                                                                              |
| `DC-014` | UI memenuhi WCAG AA, keyboard navigation, zoom 200 persen, target sentuh, reduced motion, dan dukungan teks panjang.                                                                                                               |
| `DC-015` | UI utama memakai Bahasa Indonesia dengan istilah yang konsisten terhadap PRD dan Use Case.                                                                                                                                         |
| `DC-016` | Route, Wayfinder action, Inertia behavior, authorization, validation, state transition, dan business rule tidak berubah selama migrasi visual.                                                                                     |
| `DC-017` | Model tidak menambah dependency, endpoint, schema, fitur, atau base folder.                                                                                                                                                        |
| `DC-018` | Neo-brutalism global, glassmorphism dekoratif, neumorphism, neon-on-dark, gradient text, dan tampilan SaaS korporat tanpa karakter tidak boleh menjadi hasil akhir.                                                                |
| `DC-019` | Light theme menjadi konteks kalibrasi utama. P0 harus menentukan apakah dark theme dapat diakses pengguna. Jika aktif, dark theme harus mencapai parity. Jika tidak aktif, migrasi tidak boleh mengaktifkannya sebagai fitur baru. |
| `DC-020` | Satu layar tidak boleh mencampur treatment legacy neo-brutal dan target humanist.                                                                                                                                                  |

### 4.1 Tiga kata karakter merek

- **Ramah:** bahasa mudah dipahami, visual memberi ruang bernapas, pengguna tidak merasa diuji.
- **Terarah:** struktur informasi menunjukkan urutan kerja dan keputusan berikutnya.
- **Tepercaya:** status, identitas, bukti, dan konsekuensi aksi terlihat dekat dengan keputusan.

### 4.2 Anti-goals

Implementer harus menolak hasil berikut:

- Seluruh elemen memakai border hitam tebal atau shadow offset.
- Halaman terlihat seperti poster promosi saat pengguna sedang mengerjakan form atau review.
- Seluruh konten dibungkus card dengan radius dan shadow yang sama.
- Seluruh button terlihat sebagai primary action.
- Kreativitas digantikan gradient, glow, glass, blob, atau decorative chart.
- UI finansial yang dingin, gelap, dan menekan.
- Marketplace yang penuh gambar tetapi menyembunyikan rating, verifikasi, budget, deadline, atau next step.
- Redesign yang mengubah alur bisnis untuk menyesuaikan komposisi visual.

---

## 5. Sistem Visual Target

### 5.1 Tipografi

Migrasi tahap pertama mempertahankan font stack yang sudah terpasang. Perubahan font memerlukan approval dan ADR terpisah karena proyek melarang dependency baru tanpa persetujuan.

| Peran             | Ukuran target                                 | Line height      | Weight         | Aturan                                  |
| ----------------- | --------------------------------------------- | ---------------- | -------------- | --------------------------------------- |
| Display marketing | 36 sampai 44px mobile, 48 sampai 64px desktop | 1.05 sampai 1.15 | 600 sampai 700 | Maksimal tiga baris pada viewport utama |
| Page title        | 28px mobile, 32px desktop                     | 1.2 sampai 1.3   | 600 sampai 700 | Sentence case                           |
| Section title     | 20 sampai 24px                                | 1.3              | 600            | Membedakan section tanpa card tambahan  |
| Body              | 16px                                          | 24px             | 400 sampai 500 | Panjang baris 55 sampai 75 karakter     |
| Compact UI        | 14px                                          | 20px             | 400 sampai 600 | Tabel, metadata, secondary action       |
| Caption dan legal | 13px minimum                                  | 18px             | 400 sampai 500 | Kontras tetap AA                        |
| Field label       | 14px                                          | 20px             | 600            | Selalu terlihat, tanpa uppercase        |

Aturan tambahan:

- Gunakan weight 400, 500, 600, dan 700.
- Hapus `font-black` dari UI produk dan long-form text.
- Gunakan tabular numbers untuk budget, tanggal, statistik, dan nilai tabel yang perlu sejajar.
- Gunakan `rem` untuk product UI dan `clamp()` hanya pada display marketing.
- Jangan memakai placeholder sebagai pengganti label.

### 5.2 Warna

Pertahankan biru dan oranye Collabite sebagai primitive brand pada fase awal. Implementer boleh memindahkan representasi token ke OKLCH selama nilai visual, contrast, dan identitas merek tetap terjaga.

| Peran warna    | Penggunaan                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Brand blue     | Primary CTA, link penting, active navigation, focus ring, progress aktif |
| Brand orange   | Aksen ilustrasi, highlight kreatif, CTA marketing sekunder yang jarang   |
| Neutral tinted | Background, surface, border, text, inactive state                        |
| Success        | Approved, completed, verified, confirmed                                 |
| Warning        | Pending, revision requested, perhatian yang dapat diperbaiki             |
| Danger         | Rejected, cancelled, destructive action                                  |
| Info           | In review, active collaboration, informasi proses                        |

Aturan warna:

- Gunakan pembagian berat visual 60 persen neutral, 30 persen text dan structure, 10 persen accent.
- Status selalu memakai label teks dan boleh memakai icon.
- Body text harus mencapai contrast 4.5:1.
- Large text dan UI component harus mencapai contrast 3:1.
- Placeholder harus mencapai contrast 4.5:1.
- Gray text di atas colored surface harus diganti dengan shade dari hue surface tersebut.
- Gradient text, glow, dan neon tidak diizinkan.
- Oranye tidak boleh menggantikan warning atau destructive semantics.

### 5.3 Radius, border, dan elevation

| Elemen                         | Target                                            |
| ------------------------------ | ------------------------------------------------- |
| Button dan input               | Radius 8px, tinggi visual 40 sampai 44px          |
| Card dan panel diskret         | Radius 12px                                       |
| Dialog dan sheet               | Radius 16px pada sudut yang terlihat              |
| Badge status                   | Radius penuh atau 8px sesuai panjang label        |
| Avatar manusia                 | Lingkaran                                         |
| Logo usaha dan thumbnail karya | Rounded rectangle 8 sampai 12px                   |
| Border default                 | 1px neutral                                       |
| Focus ring                     | 2px dengan offset 2px dan contrast 3:1            |
| Shadow default                 | `--shadow-xs` atau tanpa shadow                   |
| Floating overlay               | `--shadow-sm` atau `--shadow-md` sesuai elevation |

Hard offset shadow tidak boleh dipakai pada card, button, input, badge, table, dialog, atau navigation. Satu motif marketing boleh memakai treatment tegas jika Product Owner menyetujui screenshot kalibrasinya.

### 5.4 Spacing dan layout

Gunakan skala 4pt: 4, 8, 12, 16, 24, 32, 48, 64, dan 96px. Beri nama token berdasarkan hubungan seperti `space-xs`, `space-sm`, dan `space-section`.

- Gunakan `gap` untuk sibling spacing.
- Pertahankan max-width shell yang ada sampai satu slice khusus layout mengubahnya.
- Batasi body copy pada 55 sampai 75 karakter.
- Gunakan whitespace untuk memisahkan section.
- Gunakan divider halus atau background tint untuk grouping sekunder.
- Gunakan self-adjusting grid atau container query pada card yang dipakai di beberapa konteks.
- Pastikan primary action masuk area scan pertama pada desktop dan thumb zone pada mobile.

### 5.5 Ikon, gambar, dan ilustrasi

- Gunakan ikon untuk memperjelas label, bukan menggantikannya pada aksi penting.
- Gunakan foto portofolio dan hasil karya sebagai pusat visual kartu Creator.
- Gunakan crop dan aspect ratio yang konsisten pada grid per konteks.
- Tampilkan fallback yang tenang saat gambar tidak tersedia.
- Hindari stok foto tanpa hubungan dengan UMKM atau Creator.
- Alt text menjelaskan informasi yang dibawa gambar. Decorative image memakai alt kosong.

### 5.6 Motion

- Gunakan 100 sampai 150ms untuk press dan color feedback.
- Gunakan 200 sampai 300ms untuk menu, tooltip, tab, dan state change.
- Gunakan 300 sampai 500ms untuk drawer, accordion, dan dialog.
- Animasikan `transform` dan `opacity` untuk decorative transition.
- Jangan menggeser seluruh card atau button pada setiap hover.
- Jangan memakai bounce atau elastic easing.
- Hormati `prefers-reduced-motion`.
- Motion harus menjelaskan perubahan state atau hubungan ruang.

---

## 6. Aturan Komponen

| Komponen             | Aturan target                                                       | Bukti minimum                                          |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Button               | Satu primary per action region; label memakai kata kerja dan objek  | Default, hover, focus, active, disabled, loading       |
| Link                 | Terlihat sebagai link tanpa meniru button                           | Focus, visited bila relevan, external label bila perlu |
| Input dan textarea   | Label terlihat, helper dan error dekat field, tinggi sentuh memadai | Default, focus, filled, invalid, disabled              |
| Select dan checkbox  | Mengikuti keyboard pattern Radix/shadcn                             | Focus, selected, invalid, disabled                     |
| Badge                | Soft fill, border halus, label teks, icon opsional                  | Seluruh state domain dan dark mode jika aktif          |
| Card                 | Hanya untuk objek diskret; tidak boleh nested                       | Default, interactive focus, long text, no image        |
| Table                | Density sesuai Admin, heading jelas, action rata kanan              | Keyboard, overflow, empty, loading, 390px              |
| Tabs                 | Active state terlihat tanpa warna saja                              | Arrow key, focus, overflow mobile                      |
| Dialog dan sheet     | Title accessible, focus trap, consequence dekat action              | Escape, initial focus, destructive state               |
| Alert dan banner     | Menjelaskan masalah dan langkah perbaikan                           | Info, warning, danger, success                         |
| Empty state          | Menjelaskan nilai dan satu next action                              | First use, no results, no permission                   |
| Skeleton dan loading | Bentuk mengikuti konten yang akan muncul                            | Reduced motion, no layout jump                         |
| Toast dan flash      | Pesan singkat, status diumumkan ke assistive technology             | Success dan error                                      |
| Pagination           | Target sentuh memadai, current page jelas                           | First, middle, last, disabled                          |

---

## 7. Ekspresi per Shell

### 7.1 PublicLayout

- Gunakan komposisi editorial dengan satu visual utama dan satu primary CTA.
- Tampilkan karya Creator, trust signal, dan penjelasan proses sebagai sumber karakter.
- Gunakan oranye pada aksen kecil atau momen marketing.
- Hindari heading uppercase panjang, card grid yang seragam, dan frame tebal pada seluruh section.

### 7.2 AuthLayout

- Form menjadi pusat perhatian.
- Tampilkan rasa aman melalui label, helper, legal copy, dan error yang jelas.
- Testimonial atau ilustrasi mendukung form dan tidak mengambil fokus.
- Primary action memakai satu warna dan posisi konsisten.

### 7.3 MarketplaceLayout

- Ikuti ADR-031: top navigation pada desktop dan mobile bottom navigation untuk aksi utama.
- Tampilkan search, filter, portfolio preview, rating, verification, kota, kategori, budget, dan deadline dekat objek terkait.
- Gunakan list atau grid berdasarkan kebutuhan membandingkan objek.
- Gunakan progressive disclosure untuk filter lanjutan.

### 7.4 CollaborationWorkspaceLayout

- Header menjawab campaign, counterparty, status, deadline, dan next action.
- Tab menunjukkan posisi pengguna dan count yang relevan.
- Content, progress, message, payment, revision, dan review memakai pola yang tenang.
- Aksi berisiko menampilkan konsekuensi dan alasan bisnis.
- Status completed atau cancelled mengunci mutation control dan menjelaskan alasannya.

### 7.5 AdminDashboardLayout

- Pertahankan sidebar, breadcrumb, table, filter, dan density operasional.
- Gunakan surface serta divider halus agar data mudah dipindai.
- Pisahkan destructive action dari navigation dan bulk action.
- Marketing treatment tidak boleh masuk portal Admin.

### 7.6 Settings dan notification surfaces

- Ikuti shell pemilik konteks.
- Form settings memakai pola field yang sama dengan Auth dan product form.
- Notification menunjukkan unread state dengan label atau weight, bukan warna saja.

---

## 8. Scope Teknis Migrasi

### 8.1 Dalam scope

- Design tokens dan theme boundary.
- Typography, color, spacing, radius, border, elevation, icon treatment, dan motion.
- Shared shadcn primitives di `resources/js/components/ui/`.
- Shared product components di `resources/js/components/app/` dan `resources/js/components/collabite/`.
- Kelima layout shell ADR-031.
- Halaman Public, Auth, UMKM, Creator, Admin, collaboration workspace, Settings, notification, dan fallback yang terlihat pengguna.
- State default, loading, empty, error, validation, disabled, success, long content, keyboard focus, mobile, tablet, desktop, light, serta dark jika surface tersebut aktif bagi pengguna.
- Vitest, RTL, Playwright, serta dokumentasi yang terdampak.

### 8.2 Di luar scope

- Route, controller, action, request, model, migration, policy, database, dan queue.
- Business rule, status enum, notification behavior, file access, dan authorization.
- Fitur baru atau non-goal PRD.
- Dependency UI atau font baru.
- Redesign informasi yang menghapus data wajib dari PRD.
- Refactor backend atau frontend yang tidak dibutuhkan untuk migrasi.
- REST API internal, mobile native, atau design tooling baru.

Temuan di luar scope masuk deferred issue pada state file. Model tidak mengerjakannya dalam slice desain.

### 8.3 Layer migrasi

| Urutan | Layer                     | Contoh file                                                            |
| ------ | ------------------------- | ---------------------------------------------------------------------- |
| 1      | Governance dan baseline   | Dokumen ini, state, ADR-034, screenshot matrix                         |
| 2      | Foundation                | `resources/css/app.css`, `resources/js/app.tsx`                        |
| 3      | UI primitives             | `resources/js/components/ui/*`                                         |
| 4      | Shared product components | `resources/js/components/app/*`, `resources/js/components/collabite/*` |
| 5      | Layout shells             | `resources/js/layouts/*`                                               |
| 6      | Page cohorts              | `resources/js/pages/{Public,Auth,Umkm,Creator,Admin}/*`                |
| 7      | Hardening                 | Frontend tests, E2E, responsive, a11y, long content                    |
| 8      | Cutover dan cleanup       | Root theme, legacy helper, legacy selectors, docs final                |

### 8.4 Legacy markers

P0 harus mencari marker bernama dan utility langsung:

```text
.neo-brutal
.landing-brutal
brutal-*
brutalCard / brutalPanel / brutalBtn*
border-2 / border-[3px] pada surface biasa
shadow-[Npx_Npx_0_0_*]
font-black
uppercase pada body, label, heading, button, dan status
rounded-none pada component yang masuk target
```

Scan akhir boleh menyisakan kata `neo-brutal` pada dokumentasi riwayat. Runtime CSS, import, helper, dan class produk harus bersih setelah P9.

### 8.5 Active dan dormant components

P0 harus membedakan komponen aktif dari komponen dormant melalui import graph dan runtime inspection. Komponen dormant tidak ikut dimigrasikan hanya karena namanya berada dalam folder shared. Cleanup dormant code memakai slice terpisah setelah zero-import evidence tersedia.

Baseline review menemukan kandidat dormant berikut:

```text
resources/js/components/app/app-header.tsx
resources/js/components/app/marketplace-sidebar.tsx
resources/js/components/app/workspace-top-bar.tsx
resources/js/components/app/workspace-sidebar.tsx
resources/js/components/app/workspace-sidebar-nav.tsx
resources/js/components/app/sidebar-identity.tsx
resources/js/components/app/nav-group.tsx
resources/js/components/collabite/auth-layout.tsx
```

Daftar tersebut bukan izin menghapus. Executor harus membuktikan zero import, zero route ownership, dan zero test dependency sebelum mengusulkan cleanup.

---

## 9. Strategi Transisi Tanpa Layar Campuran

Implementasi memakai temporary theme gate seperti `data-ui-theme="collabite-v2"` atau mekanisme setara yang tidak memerlukan backend dan dependency baru.

Aturan gate:

1. Legacy tetap menjadi default selama coverage route belum lengkap.
2. Target tokens hidup dalam namespace V2 selama fase implementasi.
3. Satu shell atau page cohort aktif sepenuhnya sebagai legacy atau V2.
4. Shared component menggunakan semantic tokens. Hindari branch JSX per tema.
5. Cutover V2 dan penghapusan legacy berada pada slice berbeda.
6. Legacy tetap tersedia sampai cutover lulus UAT dan rollback check.
7. P9 menghapus theme gate, selector, helper, dan class legacy.

Model boleh mengusulkan mekanisme lain pada P0 jika mekanisme tersebut menjaga atomic rollout dan rollback. Usulan memerlukan catatan `UI-CR-XXX` sebelum implementasi.

---

## 10. Fase Eksekusi

### P0: Governance, baseline, dan rekonsiliasi

**Tujuan:** Membuat kondisi awal dapat diulang oleh model mana pun.

**Pekerjaan:**

- Catat commit baseline, branch bila ada, dan working tree.
- Petakan route ke page, role, shell, state, test, dan fixture.
- Catat pre-existing test failure.
- Ambil screenshot baseline pada screen matrix di Bagian 12.
- Hitung legacy markers dengan perintah yang dapat diulang.
- Rekonsiliasi drift `MarketplaceLayout` terhadap ADR-031 pada slice terpisah.
- Tentukan theme gate dan rollback point.

**Output:**

- State file terisi.
- Route inventory lengkap.
- Baseline screenshot dan command result tercatat.
- Drift shell ditutup atau memiliki blocker eksplisit.

**Exit gate:** Seluruh route prioritas dan state kritis memiliki pemilik slice. Tidak ada konflik source of truth yang belum dicatat.

### P1: Foundation dan theme gate

**Tujuan:** Memindahkan target visual ke semantic tokens dan menyiapkan rollout yang dapat dibalik.

**Pekerjaan:**

- Definisikan semantic token untuk typography, color, spacing, radius, border, elevation, focus, dan motion.
- Buat component state matrix.
- Implementasikan temporary theme gate tanpa mengubah backend atau dependency.
- Pastikan legacy tetap menjadi default dan satu layar tidak mencampur dua tema.
- Tetapkan rollback point untuk setiap cohort.

**Exit gate:** Token, theme gate, dan rollback check lulus pada test harness tanpa cutover global.

### P2: Primitive families

**Tujuan:** Memberi shared component kontrak visual serta state yang stabil.

**Pekerjaan:**

- Button, link, badge, input, textarea, select, checkbox, card, table, tabs, dialog, sheet, dropdown, tooltip, skeleton, spinner, alert, dan toast.
- Test seluruh state interaktif dan keyboard pattern.
- Verifikasi light theme dan dark theme jika P0 membuktikan fitur tersebut aktif bagi pengguna.

**Exit gate:** Primitive families lulus Vitest/RTL, contrast, focus, disabled/loading/error, dan responsive checks.

### P3: Shared components dan layout shells

**Tujuan:** Menetapkan chrome produk sebelum memigrasikan page cohorts.

**Pekerjaan:**

- Public, Auth, Marketplace, Collaboration Workspace, Admin, dan Settings shell.
- Navbar, sidebar, bottom navigation, breadcrumbs, header, filter panel, resource card, metric tile, section, table toolbar, empty state, status badge, pagination, dan timeline.
- Validasi isolation antar-role sesuai ADR-031.

**Exit gate:** Setiap shell memiliki navigation, content width, mobile behavior, focus order, dan state yang tepat. UMKM/Creator tidak memakai sidebar Admin.

### P4: Calibration screens

**Tujuan:** Mengunci bahasa visual sebelum rollout seluruh halaman.

**Pekerjaan:**

- Terapkan V2 pada calibration screens berikut:
    - Landing page.
    - Login.
    - Public Creator Directory.
    - UMKM Dashboard.
    - Collaboration Show dengan data aktif.
    - Admin Dashboard.
- Ambil screenshot mobile dan desktop dengan data stabil.
- Nilai setiap screen terhadap `DC-001..020` dan QA matrix.
- Perbaiki token atau primitive pada slice pemiliknya. Jangan menambal screen dengan utility lokal yang bertentangan dengan system.

**Output:** Reference screen per konteks dan daftar koreksi yang telah ditutup.

**Exit gate:** `HUMAN-GATE-01`. Product Owner menerima arah, hierarki, kepadatan, dan warna sebelum rollout halaman lain.

### P5: Public dan Auth cohorts

**Tujuan:** Menyelesaikan acquisition, discovery publik, dan autentikasi.

**Cohort:**

- Landing sections dan public navigation.
- Creator Directory dan public profiles.
- Legal pages.
- Login, Register, Forgot Password, Reset Password, Verify Email, Confirm Password, dan passkey/2FA surfaces yang aktif.

**Exit gate:** Seluruh route cohort selesai pada mobile dan desktop. Form, error, loading, legal copy, serta authentication accessibility lulus.

### P6: Marketplace UMKM dan Creator cohorts

**Tujuan:** Menyelesaikan discovery dan pekerjaan sebelum kolaborasi aktif.

**Cohort UMKM:** Dashboard, profile, products, campaign list/form/detail, Creator discovery, request/invitation, dan collaboration list.

**Cohort Creator:** Dashboard, profile, skills, portfolio, verification, campaign discovery/detail, request/invitation, dan collaboration list.

**Exit gate:** Pengguna dapat mengenali peluang, trust signal, status, dan primary action pada setiap layar. Empty, no-result, long text, dan mobile state lulus.

### P7: Collaboration Workspace dan payment

**Tujuan:** Menyelesaikan area dengan state dan risiko tertinggi.

**Cohort:** Overview, messages, progress, submission, revision, approval, completion, cancellation, review, dan locked states. Payment proof serta payment confirmation masuk cohort hanya jika `COLLABITE_MANUAL_PAYMENT_ENABLED` aktif. Jika flag mati, verifikasi bahwa payment surface tetap tersembunyi dan migrasi tidak mengaktifkannya.

**Exit gate:** Seluruh state transition yang diizinkan PRD tetap berfungsi. Header selalu menunjukkan context, status, counterparty, dan next step. Mutating action terkunci pada state completed/cancelled.

### P8: Admin dan hardening

**Tujuan:** Menyelesaikan portal operasional dan menutup gap lintas-cohort.

**Pekerjaan:**

- Admin shell dan page cohorts.
- Notification, Settings, Error, dan fallback surfaces.
- Responsive, accessibility, long-content, empty/error/loading, serta dark-theme hardening jika fitur dark aktif.
- Full verification dan UAT readiness.

**Exit gate:** Seluruh route inventory selesai, full suite hijau, dan evidence matrix siap untuk `HUMAN-GATE-02`.

### P9: Cutover dan cleanup

**Tujuan:** Mengaktifkan V2, menguji rollback, lalu menghapus sistem legacy setelah stabil.

**Urutan:**

1. `HUMAN-GATE-02` menerima UAT dan screenshot golden set.
2. Cutover V2 sebagai default.
3. Stabilization check dan rollback simulation.
4. Penghapusan legacy pada slice terpisah.
5. Update S2 blueprint, evidence, dan state menjadi `complete`.

**Stabilization gate sebelum legacy removal:**

- Full verification lulus setelah cutover.
- Full verification lulus kembali dari clean application restart dan browser session baru.
- Canonical screen matrix tidak memiliki regression baru.
- Tidak ada defect P0, P1, atau P2 pada readability, navigation, accessibility, dan business flow.
- Rollback simulation berhasil mengembalikan legacy default tanpa mengubah data atau route.
- State mencatat approver, tanggal, command evidence, screenshot, dan hasil rollback.
- Product Owner memberi approval `STABILIZATION-ACCEPTED`.

**Exit gate:** Definition of Done pada Bagian 16 terpenuhi.

---

## 11. Register Slice PR-ready

Setiap slice fokus pada satu concern dan tetap reversible. Penomoran boleh bertambah setelah P0 memetakan seluruh route.

| ID          | Objective                                       | Prasyarat               | Kontrak utama                     |
| ----------- | ----------------------------------------------- | ----------------------- | --------------------------------- |
| `UI-PR-01`  | Governance, inventory, baseline, state          | Dokumen approved        | `DC-016..020`                     |
| `UI-PR-02`  | Rekonsiliasi MarketplaceLayout terhadap ADR-031 | Inventory shell         | `DC-002`, `DC-012`                |
| `UI-PR-03`  | V2 semantic tokens dan theme gate               | P0 selesai              | `DC-005..008`, `DC-019..020`      |
| `UI-PR-04`  | Button, link, badge, status                     | Token siap              | `DC-007..009`, `DC-013`           |
| `UI-PR-05`  | Form primitives dan validation states           | Token siap              | `DC-005`, `DC-013..016`           |
| `UI-PR-06`  | Card, table, tabs, overlay, feedback            | UI-PR-04..05            | `DC-006`, `DC-008..010`           |
| `UI-PR-07`  | Shared product composites                       | UI-PR-04..06            | `DC-002`, `DC-006..013`           |
| `UI-PR-08`  | PublicLayout, AuthLayout, dan shared chrome     | UI-PR-07                | `DC-003`, `DC-011..014`           |
| `UI-PR-09`  | MarketplaceLayout dan navigation                | UI-PR-02, UI-PR-07      | `DC-002`, `DC-009..012`           |
| `UI-PR-10`  | CollaborationWorkspaceLayout                    | UI-PR-07                | `DC-002`, `DC-009`, `DC-012..014` |
| `UI-PR-11`  | AdminDashboardLayout dan Settings shell         | UI-PR-07                | `DC-006`, `DC-012..014`           |
| `UI-PR-12`  | Calibration screens dan HUMAN-GATE-01           | UI-PR-08..11            | `DC-001..020`                     |
| `UI-PR-13`  | Landing page                                    | HUMAN-GATE-01, UI-PR-08 | `DC-001`, `DC-003`, `DC-018`      |
| `UI-PR-14`  | Public discovery dan profile pages              | HUMAN-GATE-01, UI-PR-08 | `DC-004`, `DC-011`                |
| `UI-PR-15`  | Auth flows                                      | HUMAN-GATE-01, UI-PR-08 | `DC-002`, `DC-013..016`           |
| `UI-PR-20+` | UMKM cohorts, maksimal tiga halaman terkait     | HUMAN-GATE-01, UI-PR-09 | Sesuai register P0                |
| `UI-PR-30+` | Creator cohorts, maksimal tiga halaman terkait  | HUMAN-GATE-01, UI-PR-09 | Sesuai register P0                |
| `UI-PR-40+` | Collaboration tab families                      | HUMAN-GATE-01, UI-PR-10 | `DC-002`, `DC-009`, `DC-013..016` |
| `UI-PR-50+` | Admin, notification, settings cohorts           | HUMAN-GATE-01, UI-PR-11 | `DC-006`, `DC-012..016`           |
| `UI-PR-60`  | Responsive dan accessibility hardening          | Semua cohort selesai    | `DC-013..015`, `DC-019`           |
| `UI-PR-61`  | V2 cutover dan HUMAN-GATE-02                    | Full suite hijau        | `DC-001..020`                     |
| `UI-PR-62`  | Legacy removal dan docs closeout                | Stabilization accepted  | `DC-018`, `DC-020`                |

Setiap register entry pada state harus mencantumkan:

```text
ID
objective
route dan page list
allowed files
prerequisites
design contract IDs
functional requirements dan use case terkait
automated tests
screenshot matrix
rollback point
status
```

Model mengerjakan maksimal satu slice aktif. Shared-component change tidak boleh diselipkan ke page slice.

---

## 12. Evidence dan QA Matrix

### 12.1 Viewport minimum

| Kelas         | Viewport                                            |
| ------------- | --------------------------------------------------- |
| Mobile utama  | 390 x 844                                           |
| Mobile sempit | 360 x 800 untuk layar berisiko                      |
| Reflow stress | 320 CSS px untuk form, table, tab, dan long content |
| Tablet        | 768 x 1024                                          |
| Desktop       | 1440 x 900                                          |

Gunakan data dan viewport yang sama untuk before/after. Screenshot harus menampilkan page title, primary action, status utama, dan area konten pertama.

Konvensi artefak:

- Raw capture: `test-results/ui-transition/<slice-id>/`.
- Evidence terpilih setelah review: `docs/evidence/ui-transition/<slice-id>/`.
- Nama file: `<before|after>__<route-slug>__<state>__<width>x<height>.png`.
- Setiap folder evidence memiliki `evidence.md` berisi route, account/fixture, seed state, viewport, commit, contract IDs, QA IDs, hasil, dan approver.
- Jangan menyimpan credential, token, dokumen verifikasi, bukti pembayaran nyata, message pribadi, atau file private dalam screenshot.

### 12.2 Canonical screen matrix

| Konteks   | Screen minimum                                                                                       | State minimum                                               |
| --------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Public    | Landing, Creator Directory, Creator Profile, UMKM Profile                                            | Populated, no result, long text                             |
| Auth      | Login, Register UMKM, Register Creator, Forgot Password, Verify Email                                | Default, validation, loading, error, success                |
| UMKM      | Dashboard, Campaign Index, Campaign Form, Campaign Detail, Discover Creator, Collaboration List/Show | Empty, populated, pending action, completed                 |
| Creator   | Dashboard, Campaign Discovery/Detail, Request, Portfolio, Verification, Collaboration List/Show      | Empty, unverified, pending, rejected, verified              |
| Workspace | Messages, Progress, Submission, Revision, Review, serta Payment jika feature flag aktif              | Active, in review, revision, approved, completed, cancelled |
| Admin     | Dashboard, Users, Verifications, Campaigns, Content, Collaborations, Audit Logs, Reports             | Loading, empty, populated, filtered, destructive confirm    |
| Shared    | Settings, Notifications, Error/Fallback                                                              | Default, unread, error, long text                           |

### 12.3 Pass/fail terukur

| ID          | Area             | PASS jika                                                                                                                       |
| ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `QA-VH-01`  | Hierarki         | Primary action, status utama, dan page title terlihat pada squint test.                                                         |
| `QA-VH-02`  | Action           | Satu action region memiliki satu primary button.                                                                                |
| `QA-VH-03`  | Semantik halaman | Setiap page memiliki tepat satu `h1`; heading berikutnya mengikuti urutan.                                                      |
| `QA-CL-01`  | Beban kognitif   | Checklist cognitive load memiliki maksimal satu kegagalan pada flow utama dan maksimal empat opsi langsung pada satu keputusan. |
| `QA-TY-01`  | Body             | Body text minimal 16px dengan line-height 24px pada content utama.                                                              |
| `QA-TY-02`  | Case             | Field label, button, status, page title, dan body memakai sentence case.                                                        |
| `QA-TY-03`  | Measure          | Long-form body berada pada 55 sampai 75 karakter per baris.                                                                     |
| `QA-CO-01`  | Contrast         | Body text 4.5:1; large text dan UI component 3:1.                                                                               |
| `QA-CO-02`  | Status           | Setiap status memiliki label teks; simulasi grayscale tetap dapat dibedakan.                                                    |
| `QA-SU-01`  | Surface          | Default surface memakai border 1px atau grouping tanpa border.                                                                  |
| `QA-SU-02`  | Shadow           | Product UI tidak memakai hard offset shadow.                                                                                    |
| `QA-CA-01`  | Cards            | Tidak ada card di dalam card; card membungkus objek diskret.                                                                    |
| `QA-IN-01`  | Interaction      | Seluruh control memiliki default, focus, active, disabled, loading, error, dan success sesuai relevansi.                        |
| `QA-IN-02`  | Keyboard         | Primary flow dapat diselesaikan dengan keyboard dan focus selalu terlihat.                                                      |
| `QA-RS-01`  | Responsive       | Tidak ada horizontal page overflow pada 390px dan 768px.                                                                        |
| `QA-RS-02`  | Touch            | Target aksi utama minimal 44 x 44 CSS px pada coarse pointer.                                                                   |
| `QA-RS-03`  | Mobile           | Aksi kritis tidak hilang; navigation dan sticky action menghormati safe area.                                                   |
| `QA-AC-01`  | Zoom             | Konten dan fungsi tetap tersedia pada zoom 200 persen.                                                                          |
| `QA-AC-02`  | Form             | Label, error, helper, dan `aria-describedby` terhubung sesuai kebutuhan.                                                        |
| `QA-MO-01`  | Motion           | Reduced motion menghapus spatial motion yang tidak fungsional.                                                                  |
| `QA-CT-01`  | Copy             | Label action memakai kata kerja spesifik dan istilah konsisten dengan PRD.                                                      |
| `QA-CT-02`  | State copy       | Empty state menjelaskan kondisi dan next action; error menjelaskan masalah dan cara memperbaiki.                                |
| `QA-PF-01`  | Stabilitas       | Loading state tidak menggeser action target; canonical screen mempertahankan CLS maksimal 0.1 bila dapat diukur.                |
| `QA-LLM-01` | Anti-slop        | Tidak ada gradient text, glass card, neon glow, decorative sparkline, atau generic icon-card grid.                              |
| `QA-LG-01`  | Legacy           | Runtime scan akhir tidak menemukan neo selector, helper, import, atau offset-shadow utility.                                    |

### 12.4 Review persona

Setiap cohort harus melewati tiga walkthrough:

- **First-timer:** primary action dan next step jelas tanpa membaca dokumentasi.
- **Distracted mobile user:** aksi dapat dilakukan satu tangan tanpa kehilangan context.
- **Accessibility-dependent user:** keyboard, focus, heading, label, status, dan announcement bekerja.

Admin cohorts menambahkan walkthrough power user untuk density, filter, dan row action.

### 12.5 Sampling usability

`HUMAN-GATE-02` memakai lima peserta manusia yang mewakili atau memerankan persona PRD. Output LLM, simulasi agent, dan self-review model tidak dihitung sebagai peserta atau usability evidence.

Product Owner boleh memberi waiver tertulis jika rekrutmen tidak tersedia. Waiver harus mencatat risiko dan mengganti sampling dengan expert review oleh manusia yang berbeda dari implementer. Evidence mencantumkan participant ID anonim, peran, tanggal, task, hasil, catatan, artefak, dan approver.

Target minimum:

- Empat dari lima evaluator dapat menyebut tujuan halaman dan primary action dalam lima detik pada Landing, Dashboard, Collaboration Show, dan Admin Dashboard.
- Empat dari lima evaluator UMKM dapat menemukan Creator terverifikasi, membuka portofolio, dan menemukan jalur undangan dalam dua menit.
- Empat dari lima evaluator Creator dapat memahami budget, deadline, deliverable, dan menemukan CTA pengajuan dalam 90 detik.
- Empat dari lima evaluator collaboration dapat menyebut status dan next step dalam 10 detik.
- Empat dari lima evaluator Admin dapat menemukan verification pending tertua dan membuka detailnya dalam 60 detik.

### 12.6 Metode evidence accessibility

WCAG AA pada dokumen ini menjadi gate transisi UI, bukan FR produk baru. Implementer tidak boleh mengklaim compliance penuh tanpa evidence berikut:

| Area               | Metode tanpa dependency baru                                                                             | Evidence                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Contrast           | Ukur pasangan token dan state melalui browser DevTools atau contrast calculator yang tersedia            | Nilai ratio untuk body, large text, border control, focus, dan placeholder                  |
| Keyboard           | Jalankan flow dengan Tab, Shift+Tab, Enter, Space, Escape, dan arrow key sesuai komponen                 | Checklist focus order, no trap, dan screenshot focus-visible                                |
| Semantik           | Gunakan DOM/accessibility tree dan assertion role, label, heading, `aria-describedby`, serta live region | Test atau inspection log per canonical screen                                               |
| Reflow             | Uji viewport 320 CSS px dan browser zoom 200 persen                                                      | Screenshot tanpa kehilangan content atau action                                             |
| Color independence | Uji grayscale atau vision-deficiency emulation                                                           | Screenshot status tetap terbaca melalui label/icon                                          |
| Reduced motion     | Aktifkan `prefers-reduced-motion`                                                                        | Rekaman atau test bahwa spatial motion non-esensial berhenti                                |
| Announcement       | Uji screen reader pada success, error, loading, dan status update bila tooling tersedia                  | Nama screen reader, browser, hasil, dan gap; tanpa test berarti tidak boleh mengklaim lulus |

Temuan critical atau major pada keyboard, label, focus, contrast, atau reflow memblokir cutover. Implementer mencatat gap tooling sebagai blocker atau waiver Product Owner, bukan sebagai hasil PASS.

---

## 13. Verifikasi

### 13.1 Per slice frontend

```bash
npm run format:check
npm run lint:check
npm run typecheck
npm run test -- <target-test-file>
npm run build
npm run test:e2e -- <target-spec>
```

Gunakan target test dan E2E yang terdampak. Catat command, waktu, exit code, dan ringkasan pada state.

### 13.2 Gate P8 dan P9

```bash
npm run format:check
npm run lint:check
npm run typecheck
npm run test
npm run build
npm run test:e2e
php artisan test --compact
vendor/bin/phpstan analyse
vendor/bin/pint --dirty --format agent
```

Jalankan backend checks karena shared UI dan E2E memakai kontrak data serta route yang harus tetap stabil. Model tidak boleh mengubah test untuk menyembunyikan regression visual atau fungsional.

### 13.3 Scan legacy

P0 mencatat baseline count. P9 menargetkan runtime count nol dengan pencarian yang mencakup selector bernama dan utility langsung.

```bash
rg -n "neo-brutal|landing-brutal|brutal[A-Z-]|brutal-" resources/css resources/js
rg -n "shadow-\[[0-9]+px_[0-9]+px_0_0|font-black|border-\[3px\]" resources/css resources/js
```

Model harus meninjau hasil secara manual. Beberapa penggunaan `uppercase`, `border-2`, atau `font-black` dapat lolos hanya pada exception yang tercatat dan disetujui.

---

## 14. Protocol Handoff Antar-Model

### 14.1 Incoming model

1. Baca plan dan state, lalu abaikan asumsi dari ringkasan chat yang tidak tercatat.
2. Cocokkan contract version, baseline, current phase, active slice, dan `git status`.
3. Cocokkan diff aktual dengan expected changed files.
4. Jalankan targeted smoke check jika last-green lebih lama dari perubahan terakhir.
5. Catat mismatch sebelum mengedit file.
6. Mulai dari `next_exact_action` setelah kondisi repo cocok dengan state.

### 14.2 Outgoing model

1. Hentikan pekerjaan pada batas file atau component yang jelas.
2. Jalankan verifikasi yang masih aman dijalankan.
3. Catat hasil, failure, screenshot, dan diff.
4. Gunakan status `paused` jika slice belum memenuhi gate.
5. Isi `next_exact_action` dengan satu langkah konkret.
6. Jangan menandai `complete` berdasarkan keberadaan kode saja.

### 14.3 Handoff packet

Gunakan format berikut pada state:

```markdown
# Model Handoff: <slice ID>

Role: executor
Contract version:
Baseline atau last-green:
Current status:

## Read first

- <dokumen>

## Objective

<satu hasil yang harus dicapai>

## In scope

- <route, component, allowed files>

## Out of scope

- <larangan slice>

## Existing work

- <file dan ringkasan diff>

## Acceptance

- <DC dan QA IDs>

## Verification

- <command dan screenshot matrix>

## Known failures

- <pre-existing failure atau blocker>

## Exact next action

<satu langkah>

## Stop conditions

- <kondisi wajib berhenti>

## Required state update

- <field yang harus diisi sebelum handoff berikutnya>
```

---

## 15. Stop, Failure, dan Rollback Rules

Model harus berhenti jika:

- Source of truth dan kontrak desain bertentangan.
- Slice membutuhkan backend, route, dependency, schema, atau business rule change.
- Working tree berbeda dari checkpoint dan ownership perubahan tidak jelas.
- Model tidak dapat membedakan pre-existing failure dari regression.
- Scope slice melebar melampaui allowlist.
- Data atau account yang dibutuhkan untuk verifikasi tidak tersedia.
- HUMAN-GATE belum menerima calibration screen atau cutover.

Recovery mengikuti aturan berikut:

- Jangan memperbaiki masalah yang tidak terkait.
- Jangan memakai `git reset --hard`, destructive checkout, atau menghapus perubahan pengguna.
- Nonaktifkan V2 pada cohort yang bermasalah jika shared token menimbulkan regression lintas-shell.
- Catat command gagal, output ringkas, dugaan penyebab, dan next safe action.
- Perbarui last-green hanya setelah gate slice lulus.
- Gunakan revert atomic jika pengguna mengizinkan tindakan git tersebut.

Cutover dan cleanup wajib terpisah. Rollback cutover cukup mengembalikan default theme ke legacy. Legacy baru boleh dihapus setelah stabilization dan UAT lulus.

---

## 16. Definition of Done

Migrasi selesai saat:

- Seluruh route dan state pada inventory memiliki status `done`.
- Kelima shell ADR-031 sesuai dengan karakter perannya.
- `DC-001..020` dan QA matrix lulus.
- Product Owner menerima calibration screens dan UAT akhir.
- Frontend tests, build, E2E, backend tests, Pint, dan Larastan lulus tanpa regression baru.
- Evidence mobile, tablet, desktop, keyboard, zoom, reduced motion, long text, light, serta dark jika fitur tersebut aktif tersedia.
- Runtime CSS dan React tidak lagi memakai selector, helper, import, atau hard utility neo-brutal.
- Theme gate dan legacy compatibility layer telah dihapus.
- Rollback path cutover telah diuji sebelum cleanup.
- State berstatus `complete` tanpa blocker, unknown files, atau unchecked routes.
- `S2_UX_UI_BLUEPRINT.md`, `DECISIONS.md`, dan dokumen QA mencerminkan hasil akhir.

---

## 17. Traceability

| Area transisi                    | Sumber                             | Requirement dan keputusan                                                           |
| -------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Target pengguna dan nilai produk | PRD Bagian 3 sampai 6              | Persona UMKM, Creator, Admin                                                        |
| Marketplace dan workspace        | PRD Bagian 2, 4, 9                 | Discovery, brief, collaboration, reputation, verification                           |
| Role-specific shells             | TDD, COMPONENT_DIAGRAM, DECISIONS  | ADR-031                                                                             |
| Arah visual baru                 | DECISIONS                          | ADR-034                                                                             |
| Accessibility                    | PRD Bagian 12 dan kontrak transisi | NFR-ACCESSIBILITY-001; WCAG AA menjadi quality gate internal `DC-014` dan QA matrix |
| Bahasa Indonesia                 | PRD Bagian 12                      | NFR-INT-001                                                                         |
| Responsive web                   | PRD dan ADR-012                    | Web app tanpa native mobile                                                         |
| Frontend testing                 | TEST_PLAN dan AGENTS               | Vitest, RTL, Playwright                                                             |
| Scope dan dependency             | AGENTS Bagian 3, 4, 18             | Tidak menambah fitur atau dependency                                                |

Referensi standar:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Material Design writing guidance](https://m1.material.io/style/writing.html)
- [GOV.UK Design System: Tag research](https://design-system.service.gov.uk/components/tag/)

---

## 18. Catatan Versi

| Versi | Tanggal    | Perubahan                                                                                                 | Penulis                  |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1.0   | 2026-07-10 | Kontrak desain, target visual, phase plan, QA matrix, handoff protocol, rollback, dan Definition of Done. | Product Engineer + Codex |
