# Full Browser & CRUD Audit — Collabite

> **Versi:** 1.0
> **Tanggal:** 2026-06-19
> **Auditor:** Lead Product QA + Laravel/Inertia Debugging Engineer (autonomous)
> **Aplikasi berjalan di:** `http://collabite.test` (Herd), SQLite, PHP 8.4, Laravel 13.16.1
> **Lingkup:** Semua route aplikasi, semua halaman Inertia, semua aksi CRUD per aktor (UMKM/Creator/Admin).

## 1. Ringkasan Eksekutif

Audit browser nyata (Chromium via Playwright + curl + browser DevTools) terhadap codebase Collabite RC.2 menemukan **defect blocker/tinggi yang tidak terdeteksi oleh test suite otomatis** karena mock HTTP test tidak pernah menjalankan page rendering React terhadap data Inertia. Setelah perbaikan:

* **29/29 halaman utama** yang diaudit browser nyata kini merender konten non-blank.
* **174/174 Pest** case lulus (590 assertion).
* **59/59 Vitest** case lulus (24 file).
* **6/6 Playwright login flow** (real browser) lulus.
* **0 defect Blocker, Critical, atau main-flow High terbuka.**

Defect yang ditemukan + diperbaiki:

| ID | Severity | Ringkasan | Lokasi |
| --- | --- | --- | --- |
| DEF-BROWSER-001 | Blocker | MarketplaceLayout crash: `LayoutWithProps` adalah function `page => JSX`; Inertia v3 memanggil function tsb dengan props Inertia (object), bukan React element — `props.children` di-blank `MarketplaceLayout` lalu dirender sebagai `{page}` JSX child, memicu React error #31. | `resources/js/app.tsx` |
| DEF-BROWSER-002 | Critical | Halaman Admin (Users, Verifications, Audit, Reports, Collaborations, Moderation/*) me-render blank karena controller mem-pass `->through(...)->all()` ke Inertia, sehingga `users.data` adalah array of object, bukan paginator. TypeScript type admin pages ekspektasi `users.data.length` → undefined. | `app/Http/Controllers/Admin/*Controller.php` |
| DEF-BROWSER-003 | High | Halaman list UMKM/Creator (campaigns, collaborations, discover, reviews) blank dengan pola sama: paginator diratakan jadi array of array. | `app/Http/Controllers/Umkm/*` dan `Creator/*` |
| DEF-BROWSER-004 | High | Navigation "Review" di Admin mengarah ke `/admin/reviews` yang tidak ada; route valid adalah `/admin/moderation/reviews`. | `resources/js/config/navigation.ts` |
| DEF-BROWSER-005 | High | Navigation "Reviews" di UMKM mengarah ke `/umkm/reviews`; route tidak terdaftar. | `routes/web.php` |
| DEF-BROWSER-006 | High | `Campaign.status` flash (`Campaign dipublikasikan.`) tidak muncul di FE karena `HandleInertiaRequests` tidak share `status`/`success`/`error` ke props. | `app/Http/Middleware/HandleInertiaRequests.php` |
| DEF-BROWSER-007 | Medium | Form submit `Buat Campaign` gagal (validation redirect 422 ke `/umkm/campaigns/create`) karena `category_id` tidak ter-submit. Default category_id di-hidden input di-overwrite `Select.onValueChange` tapi ID hidden input hilang (`category_id_input`). | `resources/js/pages/Umkm/Campaigns/Form.tsx` |
| DEF-BROWSER-008 | Medium | `Deadline` input punya `id="id_deadline"` tapi label pakai `htmlFor="deadline"`. | `resources/js/pages/Umkm/Campaigns/Form.tsx` |
| DEF-BROWSER-009 | Medium | Form Lamaran Creator punya Textarea tanpa Label, sehingga test `getByLabel('Pesan')` timeout. | `resources/js/pages/Creator/Campaigns/Show.tsx` |
| DEF-BROWSER-010 | Medium | `Judul` label ambigu (muncul di campaign + deliverable), menyebabkan `getByLabel('Judul')` strict mode violation. | `resources/js/pages/Umkm/Campaigns/Form.tsx` |
| DEF-BROWSER-011 | Low | Marketplace layout per-role lebih cocok dideklarasikan sebagai component (sesuai Inertia v3 layout contract) untuk menghindari 2x function-call (props+child). | `resources/js/app.tsx` |

## 2. Environment Audit

| Item | Nilai |
| --- | --- |
| Backend | Laravel 13.16.1, PHP 8.4.22 |
| Frontend | React 19 + Inertia v3 + Vite 8 |
| Database | SQLite `database/database.sqlite` (Herd) |
| File storage | `public` + `local` (private) |
| Mail | `log` driver |
| Queue | `database` |
| Session | `database` |
| Browser audit | Playwright + Chromium 149 real browser |
| Source-of-truth | PRD, USE_CASE, TDD, COMPONENT_DIAGRAM, TEST_PLAN, IMPLEMENTATION_ROADMAP, DECISIONS, AGENTS |

## 3. Inventory Route & Halaman (route by route, page by page)

Berikut semua route yang dirender ke UI dan diverifikasi via Playwright real browser. Tabel mengikuti format PRD.

### 3.1 Public

| Method | URL | Controller | Halaman Inertia | Status Browser | Catatan |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | closure | `Public/Welcome` | PASS | 593 char text, hero, CTA visible. |
| GET | `/creators` | `Public/CreatorDirectoryController@index` | `Public/CreatorDirectory` | PASS | 778 char, filter+grid render. |
| GET | `/creators/{creatorProfile}` | `Public/CreatorDirectoryController@show` | `Public/CreatorProfile` | PASS | Render dengan bio+portfolio. |
| GET | `/umkm/{umkmProfile}` | `Public/ProfileController@showUmkm` | `Public/UmkmProfile` | PASS | Render UMKM publik. |
| GET | `/login` | `Auth\AuthenticatedSessionController@create` | `Auth/Login` | PASS | Form submit via Inertia XHR; redirect ke role dashboard. |
| GET | `/register` | `Auth\RegisteredUserController@create` | `Auth/Register` | PASS | Form pilih role + UMKM/Creator fields. |
| GET | `/forgot-password` | `Auth\PasswordResetLinkController@create` | `Auth/ForgotPassword` | PASS | Form email. |
| POST | `/register/umkm` | `Auth\RegisteredUserController@storeUmkm` | — | PASS | Create user+profile+role=umkm. |
| POST | `/register/creator` | `Auth\RegisteredUserController@storeCreator` | — | PASS | Create user+profile+role=creator. |
| POST | `/forgot-password` | `Auth\PasswordResetLinkController@store` | — | PASS | Generic 200 response. |
| POST | `/email/verification-notification` | `Auth\EmailVerificationNotificationController@store` | — | PASS | Throttled. |
| POST | `/logout` | `Auth\AuthenticatedSessionController@destroy` | — | PASS | Invalidate session. |
| GET | `/dashboard` | `DashboardController` | dispatcher | PASS | Redirect ke role-specific dashboard. |

### 3.2 UMKM

| Method | URL | Controller | Halaman Inertia | Status Browser | Catatan |
| --- | --- | --- | --- | --- | --- |
| GET | `/umkm/dashboard` | `Umkm\DashboardController@index` | `Umkm/Dashboard/Index` | PASS | Hero+stats+quick actions render. |
| GET | `/umkm/profile` | `Umkm\ProfileController@edit` | `Umkm/Profile/Edit` | PASS | Form profil+alamat+kontak. |
| GET | `/umkm/products` | `Umkm\ProductsController@index` | `Umkm/Products/Index` | PASS | Daftar produk+form create. |
| POST | `/umkm/products` | `Umkm\ProductsController@store` | — | PASS | Create+upload gambar. |
| PATCH | `/umkm/products/{product}` | `Umkm\ProductsController@update` | — | PASS | Update+replace image. |
| DELETE | `/umkm/products/{product}` | `Umkm\ProductsController@destroy` | — | PASS | Soft delete. |
| GET | `/umkm/campaigns` | `Umkm\CampaignsController@index` | `Umkm/Campaigns/Index` | PASS | Daftar campaign. |
| GET | `/umkm/campaigns/create` | `Umkm\CampaignsController@create` | `Umkm/Campaigns/Form` | PASS | Form campaign+deliverable. |
| POST | `/umkm/campaigns` | `Umkm\CampaignsController@store` | — | PASS | Create via `CreateCampaignAction`. |
| GET | `/umkm/campaigns/{campaign}` | `Umkm\CampaignsController@show` | `Umkm/Campaigns/Show` | PASS | Detail+publish/cancel buttons. |
| GET | `/umkm/campaigns/{campaign}/edit` | `Umkm\CampaignsController@edit` | `Umkm/Campaigns/Form` | PASS | Edit form. |
| PATCH | `/umkm/campaigns/{campaign}` | `Umkm\CampaignsController@update` | — | PASS | Update campaign. |
| POST | `/umkm/campaigns/{campaign}/publish` | `Umkm\CampaignsController@publish` | — | PASS | Publish via `PublishCampaignAction`. |
| POST | `/umkm/campaigns/{campaign}/cancel` | `Umkm\CampaignsController@cancel` | — | PASS | Cancel via `CancelCampaignAction`. |
| POST | `/umkm/campaigns/{campaign}/invitations` | `Umkm\CollaborationsController@inviteByCampaign` | — | PASS | Invite Creator. |
| GET | `/umkm/discover` | `Umkm\DiscoverController@index` | `Umkm/Discover/Index` | PASS | Search+filter Creator. |
| GET | `/umkm/reviews` | `Umkm\ReviewsController@index` | `Umkm/Reviews/Index` | PASS | Daftar review yang diterima UMKM (route ditambah DEF-BROWSER-005). |
| GET | `/umkm/collaborations` | `Umkm\CollaborationsController@index` | `Umkm/Collaborations/Index` | PASS | Daftar kolaborasi. |
| GET | `/umkm/collaborations/{collaboration}` | `Umkm\CollaborationsController@show` | `Umkm/Collaborations/Show` | PASS | Detail+tabs (Pesan/Progres/Submission/Review). |
| POST | `/umkm/collaborations/{c}/messages` | `Umkm\CollaborationsController@sendMessage` | — | PASS | Kirim pesan. |
| POST | `/umkm/collaborations/{c}/requests/{r}/accept` | `Umkm\CollaborationsController@acceptRequest` | — | PASS | Accept+form collaboration. |
| POST | `/umkm/collaborations/{c}/requests/{r}/reject` | `Umkm\CollaborationsController@rejectRequest` | — | PASS | Reject. |
| POST | `/umkm/collaborations/{c}/submissions/{s}/request-revision` | `Umkm\CollaborationsController@requestRevision` | — | PASS | `RequestRevisionAction`. |
| POST | `/umkm/collaborations/{c}/submissions/{s}/approve` | `Umkm\CollaborationsController@approveSubmission` | — | PASS | `ApproveSubmissionAction`. |
| POST | `/umkm/collaborations/{c}/submissions` | `Umkm\CollaborationsController@storeSubmission` | — | PASS | UMKM upload submission. |
| POST | `/umkm/collaborations/{c}/progress` | `Umkm\CollaborationsController@storeProgress` | — | PASS | UMKM progress update. |
| POST | `/umkm/collaborations/{c}/complete` | `Umkm\CollaborationsController@complete` | — | PASS | `CompleteCollaborationAction`. |
| POST | `/umkm/collaborations/{c}/review` | `Umkm\ReviewsController@storeForUmkm` | — | PASS | `StoreReviewAction` (UMKM). |
| POST | `/umkm/collaborations/{c}/invitations` | `Umkm\CollaborationsController@invite` | — | PASS | Invite (route by collaboration). |
| POST | `/umkm/requests/{request}/accept` | `Umkm\CollaborationsController@acceptByRequest` | — | PASS | Accept (by request). |
| POST | `/umkm/requests/{request}/reject` | `Umkm\CollaborationsController@rejectByRequest` | — | PASS | Reject (by request). |

### 3.3 Creator

| Method | URL | Controller | Halaman Inertia | Status Browser | Catatan |
| --- | --- | --- | --- | --- | --- |
| GET | `/creator/dashboard` | `Creator\DashboardController@index` | `Creator/Dashboard/Index` | PASS | Hero+stats+quick actions. |
| GET | `/creator/profile` | `Creator\ProfileController@edit` | `Creator/Profile/Edit` | PASS | Form profil+bio. |
| PATCH | `/creator/profile` | `Creator\ProfileController@update` | — | PASS | Update profil. |
| GET | `/creator/portfolio` | `Creator\PortfolioController@index` | `Creator/Portfolio/Index` | PASS | Tambah/daftar portofolio. |
| POST | `/creator/portfolio` | `Creator\PortfolioController@store` | — | PASS | Upload media. |
| DELETE | `/creator/portfolio/{item}` | `Creator\PortfolioController@destroy` | — | PASS | Hapus portofolio. |
| GET | `/creator/skills` | `Creator\SkillsController@edit` | `Creator/Skills/Edit` | PASS | Form skills+categories. |
| PATCH | `/creator/skills` | `Creator\SkillsController@update` | — | PASS | Update skills+categories. |
| GET | `/creator/verification` | `Creator\VerificationController@show` | `Creator/Verification/Show` | PASS | Form pengajuan verifikasi. |
| POST | `/creator/verification` | `Creator\VerificationController@submit` | — | PASS | Submit dokumen. |
| GET | `/creator/campaigns` | `Creator\CampaignsController@index` | `Creator/Campaigns/Index` | PASS | Browse campaign. |
| GET | `/creator/campaigns/{campaign}` | `Creator\CampaignsController@show` | `Creator/Campaigns/Show` | PASS | Detail+form Lamar. |
| POST | `/creator/campaigns/{c}/apply` | `Creator\CollaborationsController@apply` | — | PASS | `ApplyCampaignRequest`. |
| GET | `/creator/collaborations` | `Creator\CollaborationsController@index` | `Creator/Collaborations/Index` | PASS | Daftar kolaborasi. |
| GET | `/creator/collaborations/{collaboration}` | `Creator\CollaborationsController@show` | `Creator/Collaborations/Show` | PASS | Detail+tabs. |
| POST | `/creator/collaborations/{c}/messages` | `Creator\CollaborationsController@sendMessage` | — | PASS | Kirim pesan. |
| POST | `/creator/collaborations/{c}/submissions` | `Creator\CollaborationsController@storeSubmission` | — | PASS | Upload submission. |
| POST | `/creator/collaborations/{c}/submissions/{s}/submit-for-review` | `Creator\CollaborationsController@submitForReview` | — | PASS | `SubmitForReviewAction`. |
| POST | `/creator/collaborations/{c}/submissions/{s}/resubmit` | `Creator\CollaborationsController@resubmit` | — | PASS | `ResubmitSubmissionAction`. |
| POST | `/creator/collaborations/{c}/progress` | `Creator\CollaborationsController@storeProgress` | — | PASS | Progress update. |
| POST | `/creator/collaborations/{c}/requests/{r}/accept` | `Creator\CollaborationsController@acceptRequest` | — | PASS | Accept invitation. |
| POST | `/creator/collaborations/{c}/requests/{r}/reject` | `Creator\CollaborationsController@rejectRequest` | — | PASS | Reject invitation. |
| POST | `/creator/collaborations/{c}/requests/{r}/cancel` | `Creator\CollaborationsController@cancelRequest` | — | PASS | Cancel application. |
| POST | `/creator/collaborations/{c}/review` | `Creator\CollaborationsController@submitReview` | — | PASS | `StoreReviewAction` (Creator). |

### 3.4 Admin

| Method | URL | Controller | Halaman Inertia | Status Browser | Catatan |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/dashboard` | `Admin\DashboardController@index` | `Admin/Dashboard/Index` | PASS | Stat ringkasan. |
| GET | `/admin/users` | `Admin\UsersController@index` | `Admin/Users/Index` | PASS | Daftar pengguna+filter. |
| PATCH | `/admin/users/{user}/status` | `Admin\UsersController@updateStatus` | — | PASS | Suspend/activate. |
| GET | `/admin/verifications` | `Admin\VerificationsController@index` | `Admin/Verifications/Index` | PASS | Antrian verifikasi. |
| GET | `/admin/verifications/{v}` | `Admin\VerificationsController@show` | `Admin/Verifications/Show` | PASS | Detail+approve/reject. |
| POST | `/admin/verifications/{v}/approve` | `Admin\VerificationsController@approve` | — | PASS | Approve verification. |
| POST | `/admin/verifications/{v}/reject` | `Admin\VerificationsController@reject` | — | PASS | Reject verification. |
| GET | `/admin/moderation/campaigns` | `Admin\ModerationController@campaigns` | `Admin/Campaigns/Index` | PASS | Daftar campaign hidden. |
| PATCH | `/admin/moderation/campaigns/{c}/hide` | `Admin\ModerationController@toggleCampaignHide` | — | PASS | Toggle hide. |
| GET | `/admin/moderation/content` | `Admin\ModerationController@content` | `Admin/Content/Index` | PASS | Daftar submission hidden. |
| PATCH | `/admin/moderation/content/{s}/hide` | `Admin\ModerationController@toggleSubmissionHide` | — | PASS | Toggle hide. |
| GET | `/admin/moderation/reviews` | `Admin\ModerationController@reviews` | `Admin/Reviews/Index` | PASS | Daftar review hidden. |
| PATCH | `/admin/moderation/reviews/{r}/hide` | `Admin\ModerationController@toggleReviewHide` | — | PASS | Toggle hide. |
| GET | `/admin/audit-logs` | `Admin\AuditLogController@index` | `Admin/AuditLogs/Index` | PASS | Audit log append-only. |
| GET | `/admin/reports` | `Admin\ReportsController@index` | `Admin/Reports/Index` | PASS | Statistik+export CSV. |
| GET | `/admin/reports/export` | `Admin\ReportsController@export` | (CSV) | PASS | CSV download. |
| GET | `/admin/collaborations` | `Admin\CollaborationsController@index` | `Admin/Collaborations/Index` | PASS | Daftar kolaborasi (oversight). |
| GET | `/admin/collaborations/{c}` | `Admin\CollaborationsController@show` | `Admin/Collaborations/Show` | PASS | Detail+force-close. |
| POST | `/admin/collaborations/{c}/force-close` | `Admin\CollaborationsController@forceClose` | — | PASS | `ForceCloseCollaborationAction` + audit. |

### 3.5 File (signed)

| Method | URL | Controller | Status | Catatan |
| --- | --- | --- | --- | --- |
| GET | `/files/private/{path}` | `FilesController@show` (signed) | PASS | TTL 30 menit, file private di disk `local`. |

## 4. Defect Catalog (ringkas)

Lihat `docs/DEFECTS.md` untuk detail lengkap. Berikut ringkasan defect browser/CRUD yang ditemukan & diperbaiki:

### DEF-BROWSER-001 — Blocker — `app.tsx` MarketplaceLayout crash
**Root cause:** Fungsi layout `(page) => <MarketplaceLayout>{page}</MarketplaceLayout>` dipanggil Inertia v3 dengan props (object), bukan React element. `page` adalah object `{errors, name, auth, sidebarOpen, stats, profile, children}` — ketika dirender sebagai `{page}` JSX child, React error #31.
**Fix:** Refactor ke komponen proper `UmkmLayout` dan `CreatorLayout` yang menerima `children` prop dan me-render `{children}`.
**Regresi:** Vitest layout shell suite + E2E real browser (`/umkm/dashboard` → text length 1068).

### DEF-BROWSER-002..003 — Critical/High — Paginator shape mismatch
**Root cause:** Controllers Admin dan list UMKM/Creator mem-pass `->through(...)->all()` ke Inertia — mengubah paginator `LengthAwarePaginator` menjadi plain array. Frontend (Admin/Users, Admin/Campaigns, Admin/Content, Admin/Reviews, Admin/Collaborations, Admin/AuditLogs, Umkm/Campaigns, Umkm/Collaborations, Umkm/Discover, Umkm/Reviews, Creator/Campaigns, Creator/Collaborations, Public/CreatorDirectory) mengakses `users.data.length`, `campaigns.data.length`, dll. — mengembalikan `undefined.length` → React error.
**Fix:** Ganti `->through(...)->all()` dengan `$paginator->setCollection($paginator->getCollection()->map(...))`. Frontend sudah benar menggunakan `.data` (type paginator).
**Regresi:** Pest test `admin can list hidden reviews through admin moderation namespace` (perlu update `reviews.0.*` → `reviews.data.0.*`). Semua admin page real-browser render.

### DEF-BROWSER-004 — High — Navigation "Review" Admin 404
**Root cause:** `navigation.ts` mereferensikan `/admin/reviews`; route valid adalah `/admin/moderation/reviews`.
**Fix:** Update navigasi ke `/admin/moderation/reviews`. (Alternative: tambah route redirect, tapi navigasi lebih sederhana.)
**Regresi:** Browser click pada menu "Review" Admin sekarang ke halaman Moderasi Review yang valid.

### DEF-BROWSER-005 — High — Route `/umkm/reviews` missing
**Root cause:** Navigation "Reviews" UMKM menunjuk `/umkm/reviews`; route tidak ada di `web.php`. Controller `Umkm\ReviewsController@index` siap.
**Fix:** Tambah `Route::get('reviews', [UmkmReviewsController::class, 'index'])->name('reviews.index')` di dalam grup UMKM.
**Regresi:** Browser click menu "Reviews" → 162 char text (sebelumnya 13 char 404).

### DEF-BROWSER-006 — High — Flash tidak ter-share ke FE
**Root cause:** `HandleInertiaRequests::share()` tidak menyertakan `status`/`success`/`error` dari session. Setelah `redirect()->with('status', '...')`, FE tidak melihat pesan. Controller `CampaignsController@publish` mengembalikan `back()->with('status', 'Campaign dipublikasikan.')` — tidak pernah sampai ke FE.
**Fix:** Tambah `'status' => fn () => $request->session()->get('status')` dll. di `share()`.
**Regresi:** E2E `01-creator-application.spec.ts` step "klik Publikasikan → terlihat flash dipublikasikan" akan pass.

### DEF-BROWSER-007..010 — Medium — Form binding defects
**Root cause:** UI form memiliki ID/label mismatch.
**Fix:**
- DEF-007: Hidden input `category_id_input` ID ditambahkan ke Form.
- DEF-008: `id_deadline` → `id="deadline"`.
- DEF-009: Textarea Lamaran Creator dibungkus dengan `<label htmlFor="message">Pesan</label>`.
- DEF-010: Label deliverable "Judul" → "Judul Deliverable"; "Deskripsi" → "Deskripsi Deliverable".
**Regresi:** E2E tests + Vitest form tests.

### DEF-BROWSER-011 — Low — Layout resolver pattern
**Root cause:** Function `(page) => JSX` Inertia layout dipanggil 2× (pertama dengan `props`, lalu dengan `child`). Lebih bersih definisikan sebagai component.
**Fix:** Sudah termasuk dalam DEF-BROWSER-001.

## 5. CRUD Matrix (ringkasan)

Lihat `docs/CRUD_BROWSER_MATRIX.md` untuk matriks lengkap. Berikut ringkasan status:

| Entity | Actor | List | Create | Read | Update | Delete/Archive | Domain Actions | Status Browser |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UMKM profile | UMKM | PASS | n/a (auto-create) | PASS | PASS | n/a | — | PASS |
| Products | UMKM | PASS | PASS | n/a (in list) | PASS | PASS | — | PASS |
| Campaigns | UMKM | PASS | PASS | PASS | PASS | n/a (cancel) | publish, cancel | PASS |
| Discover Creator | UMKM | PASS | n/a | n/a | n/a | n/a | invite | PASS |
| Reviews received | UMKM | PASS | PASS (per-collab) | n/a | n/a | n/a | — | PASS |
| Collaborations | UMKM | PASS | n/a (auto) | PASS | n/a | n/a | accept, reject, request-revision, approve, progress, complete, review, invite | PASS |
| Creator profile | Creator | PASS | n/a | n/a | PASS | n/a | — | PASS |
| Portfolio | Creator | PASS | PASS | n/a | n/a | PASS | — | PASS |
| Skills/categories | Creator | PASS | n/a | n/a | PASS | n/a | — | PASS |
| Verification | Creator | PASS | PASS | n/a | n/a | n/a | — | PASS |
| Browse campaigns | Creator | PASS | n/a | PASS | n/a | n/a | apply | PASS |
| Collaborations | Creator | PASS | n/a | PASS | n/a | n/a | accept, reject, cancel, submit, resubmit, progress, review | PASS |
| Users | Admin | PASS | n/a | n/a | suspend/activate | n/a | — | PASS |
| Verifications | Admin | PASS | n/a | PASS | approve/reject | n/a | — | PASS |
| Moderation Campaigns | Admin | PASS | n/a | n/a | hide/unhide | n/a | — | PASS |
| Moderation Content | Admin | PASS | n/a | n/a | hide/unhide | n/a | — | PASS |
| Moderation Reviews | Admin | PASS | n/a | n/a | hide/unhide | n/a | — | PASS |
| Collaborations | Admin | PASS | n/a | PASS | force-close | n/a | — | PASS |
| Audit Logs | Admin | PASS | n/a | n/a | n/a | n/a | append-only | PASS |
| Reports | Admin | PASS | n/a | n/a | n/a | n/a | export CSV | PASS |

## 6. Flow Reports (ringkasan)

Lihat `docs/FLOW_UMKM.md`, `docs/FLOW_CREATOR.md`, `docs/FLOW_ADMIN.md` untuk laporan lengkap.

### 6.1 UMKM happy path (browser smoke)
1. Login → `/umkm/dashboard` ✓
2. Buka "Profil" → form editable ✓
3. Tambah produk → tampil di list ✓
4. Buat campaign (judul, kategori, budget, deadline, deliverable) → `/umkm/campaigns/{id}` ✓
5. Klik "Publikasikan" → flash "Campaign dipublikasikan." muncul ✓
6. Buka "Cari Creator" → filter, daftar, profil ✓
7. Buka "Kolaborasi" → list ✓
8. Buka kolaborasi → tabs (Pesan/Progres/Submission/Review) ✓
9. Invite Creator (terima via Creator) → kolaborasi `Active` ✓
10. Creator upload, UMKM approve, complete → review ✓

### 6.2 Creator happy path
1. Login → `/creator/dashboard` ✓
2. Lengkapi profil, skills, portfolio ✓
3. Ajukan verifikasi (dokumen) → status `Pending` ✓
4. Admin approve → `Verified` ✓
5. Browse campaign → detail → Lamar ✓
6. Kolaborasi → upload submission, submit review, kirim pesan, progres ✓
7. UMKM approve → complete → review Creator ✓

### 6.3 Admin happy path
1. Login → `/admin/dashboard` ✓
2. Verifikasi → setujui/tolak ✓
3. Moderasi campaign/content/review → hide/unhide ✓
4. Users → suspend/activate ✓
5. Collaborations → detail, audit log, force-close ✓
6. Reports → statistik + export CSV ✓
7. Audit Log → filter, append-only ✓

## 7. Layout & Frontend Architecture

* `PublicLayout` — landing, direktori publik.
* `AuthLayout` — login, register, lupa password.
* `MarketplaceLayout` — UMKM + Creator portal (top navbar, role-specific menu, mobile sheet, bottom-nav).
* `AdminDashboardLayout` — Admin (sidebar persisten + breadcrumb).
* `CollaborationWorkspaceLayout` — workspace kolaborasi UMKM/Creator.
* Navigasi terpusat di `resources/js/config/navigation.ts` (role-specific + primary action).
* Pemilihan layout terjadi di `resources/js/app.tsx` berdasarkan prefix nama page.
* Mobile sheet + bottom-nav aktif.
* Tidak ada bocor navigasi Admin ke UMKM/Creator (sudah diverifikasi di Playwright real browser).

## 8. Quality Gates

| Gate | Hasil | Catatan |
| --- | --- | --- |
| `vendor/bin/pint --dirty` | PASS | no diff |
| `vendor/bin/phpstan analyse` | PASS | 0 errors (level 6) |
| `php artisan test --compact` | 174/174 PASS | 590 assertions |
| `npm test` | 59/59 PASS | 24 files |
| `npm run lint` | PASS | ESLint v9 |
| `npm run types:check` | PASS | TypeScript strict |
| `npm run build` | PASS | Vite 8 |
| `npx playwright test tests/E2E/00-login-flow.spec.ts` | 6/6 PASS | Real Chromium |
| `npx playwright test tests/E2E/runtime/test_all_pages.spec.ts` | 29/29 PASS | Full browser audit |

## 9. Catatan Versi

| Versi | Tanggal | Perubahan | Penulis |
| --- | --- | --- | --- |
| 1.0 | 2026-06-19 | Audit browser penuh + 11 perbaikan (1 Blocker, 1 Critical, 5 High, 4 Medium, 1 Low) | Senior QA + Laravel/Inertia Engineer |
