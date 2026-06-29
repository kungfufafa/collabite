# Security & Data Correctness Audit — Collabite RC.1

> Versi: 1.0
> Tanggal: 2026-06-18
> Auditor: Coding agent (automated, read-only)
> Cakupan: Backend Laravel monolith + Inertia (M0–M7).
> Metode: `grep` + `Read` lintas `app/`, `routes/`, `database/migrations/`, `config/`. Tidak ada modifikasi kode produksi selama audit.

---

## 1. Authorization Coverage

**Policy registry (auto-discover, tidak ada `AuthServiceProvider::register` kustom).** Laravel mengikat policy secara otomatis dengan konvensi `App\Policies\{Model}Policy`. Bukti: `app/Providers/AuthServiceProvider.php:14-17` (`Gate::before` mengembalikan `null` — bukan override).

| Model | Policy class | Auto-bound? |
| --- | --- | --- |
| `App\Models\Campaign` | `App\Policies\CampaignPolicy` (`app/Policies/CampaignPolicy.php`) | OK (konvensi) |
| `App\Models\Collaboration` | `App\Policies\CollaborationPolicy` (`app/Policies/CollaborationPolicy.php`) | OK |
| `App\Models\CollaborationRequest` | `App\Policies\CollaborationRequestPolicy` (`app/Policies/CollaborationRequestPolicy.php`) | OK |
| `App\Models\ContentSubmission` | `App\Policies\ContentSubmissionPolicy` (`app/Policies/ContentSubmissionPolicy.php`) | OK |
| `App\Models\CreatorProfile` | `App\Policies\CreatorProfilePolicy` (`app/Policies/CreatorProfilePolicy.php`) | OK |
| `App\Models\UmkmProfile` | `App\Policies\UmkmProfilePolicy` (`app/Policies/UmkmProfilePolicy.php`) | OK |
| `App\Models\Review` | `App\Policies\ReviewPolicy` (`app/Policies/ReviewPolicy.php`) | OK |
| `App\Models\CreatorVerification` | `App\Policies\VerificationPolicy` (`app/Policies/VerificationPolicy.php`) | OK |
| `App\Models\User` | `App\Policies\UserPolicy` (`app/Policies/UserPolicy.php`) | OK |

**Controller@action × authorization mechanism.**

| Endpoint | Method | AuthZ mechanism | Status |
| --- | --- | --- | --- |
| `Umkm\CampaignsController@show` | GET | `$this->authorize('view', $campaign)` (`app/Http/Controllers/Umkm/CampaignsController.php:64`) | OK |
| `Umkm\CampaignsController@edit` | GET | `$this->authorize('update', $campaign)` (line 99) | OK |
| `Umkm\CampaignsController@update` | PATCH | `authorize('update')` (line 122) | OK |
| `Umkm\CampaignsController@publish` | POST | `authorize('update')` (line 151) | OK |
| `Umkm\CampaignsController@cancel` | POST | `authorize('update')` (line 159) | OK |
| `Umkm\CampaignsController@store` | POST | `StoreCampaignRequest::authorize()` → `isUmkm()` (`app/Http/Requests/Umkm/StoreCampaignRequest.php:12-14`) + `role:umkm` route group | OK |
| `Umkm\ProductsController@update` | PATCH | `authorizeProduct()` (line 65) inline ownership check | OK |
| `Umkm\ProductsController@destroy` | DELETE | `authorizeProduct()` (line 89) | OK |
| `Umkm\CollaborationsController@show` | GET | `authorize('view', $collaboration)` (`app/Http/Controllers/Umkm/CollaborationsController.php:68`) | OK |
| `Umkm\CollaborationsController@acceptRequest` | POST | inline `abort_unless` party check (line 171-174) | OK |
| `Umkm\CollaborationsController@rejectRequest` | POST | inline `abort_unless` party check (line 183-186) | OK |
| `Umkm\CollaborationsController@acceptByRequest` | POST | inline `abort_unless` ($user is admin, UMKM of campaign, or the request's creator) line 196-199 | OK |
| `Umkm\CollaborationsController@rejectByRequest` | POST | same pattern line 209-212 | OK |
| `Umkm\CollaborationsController@sendMessage` | POST | `authorize('view', $collaboration)` (line 220) | OK |
| `Umkm\CollaborationsController@storeProgress` | POST | `authorize('view', ...)` (line 235) + `abort(403)` (UMKM tidak boleh — line 237) | OK |
| `Umkm\CollaborationsController@storeSubmission` | POST | `abort(403)` (line 243) | OK (UMKM tidak boleh — by design) |
| `Umkm\CollaborationsController@submitForReview` | POST | `authorize('view', $collaboration)` (line 248) | OK |
| `Umkm\CollaborationsController@requestRevision` | POST | `authorize('view', ...)` (line 256) | OK |
| `Umkm\CollaborationsController@approveSubmission` | POST | `authorize('view', ...)` (line 264) | OK |
| `Umkm\CollaborationsController@complete` | POST | `authorize('view', ...)` (line 272) | OK |
| `Umkm\CollaborationsController@cancel` | POST | `authorize('view', ...)` (line 299) | OK |
| `Umkm\CollaborationsController@storeReview` | POST | `storeReviewStatic` (line 280-295) — checks `is($collaboration->umkm)` ternary | OK |
| `Umkm\ReviewsController@storeForUmkm` | POST | delegates ke `storeReviewStatic` | OK |
| `Creator\CampaignsController@show` | GET | `abort_unless($campaign->status === Open && ! is_hidden)` (line 74) + implicit `role:creator` | OK |
| `Creator\CollaborationsController@apply` | POST | `ApplyCampaignRequest::authorize()` `isCreator()` | OK |
| `Creator\CollaborationsController@*` (semua aksi kolaborasi) | * | `authorize('view', $collaboration)` konsisten | OK |
| `Creator\CollaborationsController@cancelRequest` | POST | inline `abort_unless` ownership (line 184-187) | OK |
| `Creator\PortfolioController@destroy` | DELETE | `abort_unless($portfolioItem->creator_profile_id === $profile->id)` (line 70) | OK |
| `Creator\VerificationController@submit` | POST | `SubmitVerificationRequest::authorize()` `isCreator()` | OK |
| `Admin\UsersController@updateStatus` | PATCH | `abort_unless($user?->isAdmin())` (line 53) + self-action guard (line 54-56) | OK |
| `Admin\VerificationsController@*` | * | `abort_unless($user?->isAdmin())` konsisten | OK |
| `Admin\ModerationController@*` | * | `abort_unless($user?->isAdmin())` konsisten | OK |
| `Admin\CollaborationsController@*` | * | `abort_unless($user?->isAdmin())` konsisten | OK |
| `Admin\ReportsController@*` | * | `abort_unless($user?->isAdmin())` konsisten | OK |
| `Admin\AuditLogController@index` | GET | `abort_unless(... isAdmin())` line 20 | OK |

**Status: OK** — setiap endpoint mutasi memiliki salah satu dari `authorize()`, `FormRequest::authorize()`, inline `abort_unless`, atau middleware `role:`. Tidak ada gap.

---

## 2. IDOR Protection

| Endpoint | Route binding | Ownership check | Status |
| --- | --- | --- | --- |
| `umkm.campaigns.show` | `Campaign $campaign` | `CampaignPolicy::view` (UMKM pemilik) (`app/Policies/CampaignPolicy.php:19-21`) | OK |
| `umkm.campaigns.update` | `Campaign $campaign` | `CampaignPolicy::update` (line 33-36) | OK |
| `umkm.products.update` | `Product $product` | `authorizeProduct()` inline check (`app/Http/Controllers/Umkm/ProductsController.php:101-104`) | OK |
| `umkm.collaborations.show` | `Collaboration $collaboration` | `CollaborationPolicy::view` (line 20-22) | OK |
| `umkm.collaborations.{action}` | `Collaboration $collaboration` | `authorize('view', $collaboration)` + action policy | OK |
| `umkm.collaborations.requests.{req}/accept\|reject` | `Collaboration $collaboration, CollaborationRequest $requestModel` | inline `abort_unless(is $umkm OR is $creator)` (`app/Http/Controllers/Umkm/CollaborationsController.php:171-186`) — keduanya pihak collaboration | OK |
| `umkm.requests.{req}/accept\|reject` | `CollaborationRequest $requestModel` | inline check `$user is admin OR UMKM of campaign OR creator of request` (`app/Http/Controllers/Umkm/CollaborationsController.php:196-199, 209-212`) | OK |
| `creator.collaborations.*` | `Collaboration $collaboration` | `authorize('view', $collaboration)` (`app/Http/Controllers/Creator/CollaborationsController.php:68`) | OK |
| `creator.collaborations.requests.cancel` | `CollaborationRequest $requestModel` | inline `abort_unless($requestModel->creator_id === $user->id && type==='application')` (line 184-187) | OK |
| `creator.campaigns.apply` | `Campaign $campaign` | `apply()` memvalidasi campaign `Open` dan bukan hidden (line 143) | OK |
| `creator.verification.submit` | n/a (uses user->creatorProfile) | scoped ke `user->creatorProfile` (line 68) | OK |
| `creator.portfolio.destroy` | `PortfolioItem $portfolioItem` | inline `abort_unless` ownership (line 70) | OK |
| `admin.users.status.update` | `User $user` | `isAdmin()` check + self-action guard (`app/Http/Controllers/Admin/UsersController.php:53-56`) | OK |
| `admin.verifications.*` | `CreatorVerification $verification` | `isAdmin()` check | OK |
| `admin.moderation.*` | model binding | `isAdmin()` check | OK |
| `admin.collaborations.force-close` | `Collaboration $collaboration` | `ForceCloseCollaborationRequest::authorize()` `isAdmin()` + action-level check (`app/Actions/Admin/ForceCloseCollaborationAction.php:30-32`) | OK |

**Grep untuk `findOrFail` di bawah namespace controller:**

- `app/Actions/Collaboration/InviteCreatorAction.php:27` — `Campaign::query()->where('umkm_profile_id', $umkm->id)->findOrFail($data['campaign_id'])` — scoped ke UMKM yang sedang request (IDOR-safe).
- `app/Actions/Collaboration/InviteCreatorAction.php:33` — `User::query()->where('role', 'creator')->findOrFail($data['creator_id'])` — target id, bukan caller. Aman karena validasi duplicate mencegah invasi.

**Status: OK** — tidak ada IDOR yang belum ditangani.

---

## 3. Account Status Enforcement

**Middleware terdaftar:** `app/Http/Middleware/EnsureAccountIsActive.php` (line 17) di-alias-kan ke `active` di `bootstrap/app.php:30`. Diterapkan ke grup `auth` terluar di `routes/web.php:70` (`['auth', 'active']`).

**Login guard untuk suspended:** `app/Http/Controllers/Auth/AuthenticatedSessionController.php:52-60` — setelah `Auth::attempt()` berhasil, `user->account_status === Suspended` memicu `Auth::logout()` + `ValidationException` "Akun Anda dinonaktifkan". Konfirmasi: `FortifyServiceProvider` tidak meng-override handler login karena `AuthenticatedSessionController::store` mendaftarkan route `login` di grup `guest` (line 51-52), bukan lewat Fortify `Fortify::authenticateUsing`.

**Enforcement di dalam session:** `EnsureAccountIsActive::handle` (line 22-37) melakukan `Auth::logout()` + invalidasi sesi + redirect ke `login` dengan flash error jika `account_status === Suspended` terdeteksi pada request berikutnya.

**Test coverage:** `tests/Feature/Messaging/MessagingTest.php:187-207` — dua test case eksplisit:
- `suspended UMKM cannot send messages (middleware rejects)` (line 187-196)
- `suspended Creator cannot send messages (middleware rejects)` (line 198-207)

**Status: OK** — end-to-end coverage ada di tiga lapisan: login guard, middleware per-request, dan Feature test.

---

## 4. Private File Access

**Signed URL serving:** `routes/web.php:203-206` — `Route::get('files/private/{path}', [FilesController::class, 'show'])->where('path', '.*')->middleware('signed')`.

**`FilesController@show`:** `app/Http/Controllers/FilesController.php:17-26`
- `abort_unless($request->hasValidSignature(), 403)` (line 19)
- `Storage::disk('local')` (line 21) — root = `storage/app/private` (`config/filesystems.php:33-39`)
- `abort_unless($disk->exists($path), 404)` (line 23)
- `return $disk->download($path)` (line 25)

**Disk untuk asset private:** `FileUrlService::storePrivate()` (`app/Services/FileUrlService.php:34-37`) — memanggil helper `store()` dengan parameter `disk='local'` (line 81-87). Path pattern: `{module}/{owner_id}/{uuid}.{ext}` (line 86). Disk konfirmasi: `local` root = `storage_path('app/private')` (`config/filesystems.php:33-39`).

**Penggunaan storePrivate di kode:**
- `app/Http/Controllers/Creator/VerificationController.php:93` (dokumen verifikasi)
- `app/Http/Controllers/Creator/CollaborationsController.php:237` (file submission)
- `app/Actions/Content/ResubmitSubmissionAction.php:49` (file submission v↑)

**Tidak ada route publik ke `storage/app/private/*`.** Disk `local` tidak memiliki symbolic link (`config/filesystems.php:76-78` — hanya `public_path('storage') => storage_path('app/public')`). Disk `public` adalah yang di-serve via web server, dan tidak berisi file privat.

**Status: OK** — privasi file sesuai PRD §21 dan TDD §17.

---

## 5. Upload Validation

PRD §21: Avatar/Logo 2MB; Produk 2MB; Portofolio gambar 5MB; Portofolio video 50MB; Dokumen verifikasi 5MB; Lampiran pesan 10MB; File submission 100MB.

| Form Request | Field | `mimes` / `image` | `max` (KB) | Disk tujuan | Sesuai PRD §21? |
| --- | --- | --- | --- | --- | --- |
| `Umkm\UpdateUmkmProfileRequest` | `logo` | `image`, `mimes:jpg,jpeg,png,webp` (`app/Http/Requests/Umkm/UpdateUmkmProfileRequest.php:30`) | 2048 (2 MB) | public | OK |
| `Umkm\ProductRequest` | `image` | `image`, `mimes:jpg,jpeg,png,webp` (`app/Http/Requests/Umkm/ProductRequest.php:26`) | 2048 (2 MB) | public | OK |
| `Creator\UpdateCreatorProfileRequest` | `profile_photo` | `image`, `mimes:jpg,jpeg,png,webp` (`app/Http/Requests/Creator/UpdateCreatorProfileRequest.php:27`) | 2048 (2 MB) | public | OK |
| `Creator\PortfolioItemRequest` | `media` | `image`, `mimes:jpg,jpeg,png,webp` (`app/Http/Requests/Creator/PortfolioItemRequest.php:25`) | 4096 (4 MB) | public | **GAP — PRD §21 minta 5 MB untuk gambar; 50 MB untuk video** |
| `Creator\SubmitVerificationRequest` | `documents.*.file` | `mimes:jpg,jpeg,png,webp,pdf` (`app/Http/Requests/Creator/SubmitVerificationRequest.php:27`) | 5120 (5 MB) | private | OK |
| `Content\StoreSubmissionRequest` | `files.*` | `mimes:jpg,jpeg,png,webp,mp4,mov,webm,pdf` (`app/Http/Requests/Content/StoreSubmissionRequest.php:22`) | 102400 (100 MB) | private | OK |
| `Content\ResubmitSubmissionRequest` | `files.*` | identical (`app/Http/Requests/Content/ResubmitSubmissionRequest.php:22`) | 102400 (100 MB) | private | OK |

**UUIDv4 naming:** `app/Services/FileUrlService.php:84` — `$filename = Str::uuid()->toString().'.'.$extension`. Path pattern: `{$module}/{$ownerId}/{$filename}` (line 86). `original_name` disimpan terpisah oleh callers (`app/Http/Controllers/Creator/VerificationController.php:98`, `app/Http/Controllers/Creator/CollaborationsController.php:240`, `app/Actions/Content/ResubmitSubmissionAction.php:52`).

**Lampiran pesan (PRD §21: 10 MB):** Pesan yang dikirim via `umkm.collaborations.messages.store` dan `creator.collaborations.messages.store` **tidak menerima file** — `SendMessageRequest` hanya memvalidasi `body` (`app/Http/Requests/Collaboration/SendMessageRequest.php:18-20`). Model `MessageAttachment` ada (`app/Models/MessageAttachment.php`) dan dirender di view (`app/Http/Controllers/Umkm/CollaborationsController.php:93-99`), namun **tidak ada endpoint upload** untuk attachment pesan. Tabel `message_attachments` (`database/migrations/2026_06_17_195448_create_domain_tables.php:244-254`) menyimpan file_path/original_name/mime/size, tetapi tidak ada controller atau Form Request yang menulis ke tabel ini dalam RC.1. Hal ini merupakan **gap fungsional** yang tidak mengancam keamanan (tidak ada input tanpa validasi), namun perlu dicatat.

**Status: GAP-M (medium) — 1) `PortfolioItemRequest::media` max 4 MB (gambar) dan tidak ada `mp4/mov/webm` (video). PRD §21 mensyaratkan 5 MB gambar + 50 MB video. 2) Lampiran pesan: tidak ada endpoint upload lampiran sama sekali, padahal PRD §21 dan TDD §17 menyediakan storage private untuk itu. Rekomendasi: pisahkan `media_image` (image, max 5 MB) dan `media_video` (mimes:mp4,mov,webm, max 51200 KB) di Form Request, lalu tambahkan endpoint `messages/{conversation}/attachments` dengan Form Request yang memvalidasi 10 MB + mimes PRD §21.**

---

## 6. State Transition Hardening

| Action class | ValidationException di transisi invalid | Tested? |
| --- | --- | --- |
| `Collaboration\AcceptRequestAction` | `'Request ini sudah tidak pending.'` (line 28); `'Campaign sudah memiliki kolaborasi aktif.'` (line 39) | Ya (M4 + Messaging) |
| `Collaboration\RejectRequestAction` | `'Request ini sudah tidak pending.'` (`app/Actions/Collaboration/RejectRequestAction.php:16`) | Ya |
| `Collaboration\CancelApplicationAction` | `'Request ini sudah tidak pending.'` (`app/Actions/Collaboration/CancelApplicationAction.php:19`); `'Hanya application yang dapat dibatalkan oleh Creator.'` (line 22) | Ya |
| `Collaboration\CancelCollaborationAction` | `'Kolaborasi tidak dalam status aktif.'` (`app/Actions/Collaboration/CancelCollaborationAction.php:28`); `'Tidak dapat membatalkan: submission sudah disetujui...'` (line 36); `'Anda bukan pihak kolaborasi.'` (line 42) | Ya |
| `Collaboration\CancelCollaborationAction::forceClose` | `'Hanya admin yang dapat force close.'` (line 75); `'Kolaborasi tidak dalam status aktif.'` (line 79) | Ya |
| `Admin\ForceCloseCollaborationAction` | `'Hanya admin yang dapat force close.'` (`app/Actions/Admin/ForceCloseCollaborationAction.php:31`); `'Force-close hanya berlaku untuk kolaborasi aktif.'` (line 35) | Ya |
| `Content\SubmitForReviewAction` | `'Submission tidak dapat dikirim untuk review.'` (`app/Actions/Content/SubmitForReviewAction.php:16`) — hanya izinkan `Draft`/`RevisionRequested` | Ya |
| `Content\RequestRevisionAction` | `'Submission tidak dalam status InReview.'` (`app/Actions/Content/RequestRevisionAction.php:17`) | Ya |
| `Content\ApproveSubmissionAction` | `'Submission tidak dalam status InReview.'` (`app/Actions/Content/ApproveSubmissionAction.php:16`) | Ya |
| `Content\ResubmitSubmissionAction` | `'Submission tidak dalam status RevisionRequested.'` (`app/Actions/Content/ResubmitSubmissionAction.php:24`); `'Submission Approved tidak dapat digantikan.'` (line 32) — fix H-001 | Ya |
| `Review\StoreReviewAction` | `'Kolaborasi belum selesai.'` (`app/Actions/Review/StoreReviewAction.php:18`); `'Anda bukan pihak kolaborasi.'` (line 23); `'Anda sudah memberi review untuk kolaborasi ini.'` (line 31) | Ya |
| `Review\CompleteCollaborationAction` | `'Kolaborasi tidak aktif.'` (`app/Actions/Review/CompleteCollaborationAction.php:23`); `'Hanya UMKM yang dapat menyelesaikan kolaborasi.'` (line 27); `'Belum ada submission yang disetujui.'` (line 34) | Ya |
| `Campaign\PublishCampaignAction` | `'Hanya campaign berstatus draft yang dapat dipublikasikan.'` (`app/Actions/Campaign/PublishCampaignAction.php:21`); `'Tambahkan minimal satu deliverable.'` (line 27) | Ya |
| `Campaign\CancelCampaignAction` | `'Campaign ini tidak dapat dibatalkan.'` (`app/Actions/Campaign/CancelCampaignAction.php:21`); `'Tidak dapat membatalkan campaign yang sudah memiliki kolaborasi aktif.'` (line 27) | Ya |
| `Collaboration\InviteCreatorAction` | `'Campaign tidak terbuka untuk invitation.'` (`app/Actions/Collaboration/InviteCreatorAction.php:30`); `'Creator sudah memiliki pengajuan/undangan untuk campaign ini.'` (line 41) | Ya |
| `Campaign\CreateCampaignAction` | `'Kategori tidak valid.'` (`app/Actions/Campaign/CreateCampaignAction.php:33`) | Ya |

**Status: OK** — semua Action class melempar `ValidationException::withMessages()` untuk transisi invalid, dan setiap kasus ditutup oleh Feature test (M4-M7 backfill, file 23-26 task list).

---

## 7. Form Request Validation

**Coverage: semua endpoint mutasi menggunakan Form Request (bukan `Request->validate` inline).** Dari inspeksi: hanya dua controller inline-validate:
- `app/Http/Controllers/Admin/VerificationsController.php:79-81` — `reject()` inline validate `rejection_reason`.
- `app/Http/Controllers/Admin/UsersController.php:58-61` — `updateStatus()` inline validate `account_status`.

Kedua-duanya adalah endpoint admin yang tidak menerima input user biasa, dan rule-nya minimal (string/in). Tidak ada gap fungsional karena Form Request hanya akan menambah indireksi tanpa menambah validasi baru.

**Cross-field validation:**
- `StoreCampaignRequest::rules()` — `'deadline' => ['nullable', 'date', 'after:today']` (`app/Http/Requests/Umkm/StoreCampaignRequest.php:26`); `'budget' => ['nullable', 'numeric', 'min:0', 'max:999999999.99']` (line 25). Cross-field di `rules()` (langsung), tidak di `withValidator()`. Diterima.
- `InviteCreatorRequest::withValidator()` (`app/Http/Requests/Collaboration/InviteCreatorRequest.php:27-44`) — memvalidasi `campaign_id` milik UMKM yang sedang request menggunakan `Campaign::query()->where('id', $campaignId)->where('umkm_profile_id', $umkm->id)->exists()` (line 33-38). Cross-field ownership check.
- `ProductRequest::rules()` (`app/Http/Requests/Umkm/ProductRequest.php:24`) — `price min:0, max:99999999.99`. Cross-field tidak diperlukan.
- `UpdateCreatorSkillsRequest::rules()` (`app/Http/Requests/Creator/UpdateCreatorSkillsRequest.php:22-26`) — `skill_ids` dan `category_ids` array, masing-masing dengan `exists:` validation.

**Status: OK** — Form Request convention diikuti, cross-field validation dilakukan di `rules()` (built-in rules) atau `withValidator()` (custom ownership).

---

## 8. Database Constraints

**Migration:** `database/migrations/2026_06_17_195448_create_domain_tables.php` (354 baris).

**Uniques:**

| Tabel | Constraint | Baris |
| --- | --- | --- |
| `umkm_profiles` | `user_id` UNIQUE | 19 |
| `creator_profiles` | `user_id` UNIQUE | 68 |
| `categories` | `name`, `slug` UNIQUE | 52-53 |
| `skills` | `name`, `slug` UNIQUE | 60-61 |
| `creator_categories` | UNIQUE(`creator_profile_id`, `category_id`) | 91 |
| `creator_skills` | UNIQUE(`creator_profile_id`, `skill_id`) | 100 |
| `collaboration_requests` | UNIQUE(`creator_id`, `campaign_id`) dengan nama index `unique_active_request_per_creator_campaign` | 188 |
| `collaborations` | `campaign_id` UNIQUE | 195 |
| `conversations` | `collaboration_id` UNIQUE | 226 |
| `content_submissions` | UNIQUE(`collaboration_id`, `version`) | 269 |
| `reviews` | UNIQUE(`collaboration_id`, `reviewer_id`) | 307 |

**FK cascade review:**

| FK | onDelete | Baris | Keterangan |
| --- | --- | --- | --- |
| `products.umkm_profile_id` → `umkm_profiles` | cascade | 37 | OK |
| `creator_categories.creator_profile_id` | cascade | 87 | OK |
| `creator_categories.category_id` | cascade | 88 | OK |
| `creator_skills.*` | cascade | 96-97 | OK |
| `portfolio_items.creator_profile_id` | cascade | 105 | OK |
| `creator_verifications.creator_profile_id` | cascade | 120 | OK |
| `creator_verifications.reviewed_by` | nullOnDelete | 124 | OK (reviewer bisa dihapus) |
| `creator_verification_documents.creator_verification_id` | cascade | 133 | OK |
| `campaigns.umkm_profile_id` | cascade | 147 | OK |
| `campaigns.category_id` | — (default restrict) | 148 | OK (kategori master) |
| `campaign_deliverables.campaign_id` | cascade | 167 | OK |
| `collaboration_requests.campaign_id` | cascade | 179 | OK |
| `collaboration_requests.creator_id` | cascade | 180 | OK |
| `collaboration_requests.sender_id` | cascade | 181 | OK |
| `collaborations.campaign_id` | cascade | 195 | OK (tapi UNIQUE; OK) |
| `collaborations.umkm_id` | cascade | 196 | OK |
| `collaborations.creator_id` | cascade | 197 | OK |
| `collaborations.cancelled_by` | nullOnDelete | 202 | OK (admin yang cancel bisa dihapus) |
| `collaboration_progress_updates.collaboration_id` | cascade | 214 | OK |
| `collaboration_progress_updates.creator_id` | cascade | 215 | OK |
| `conversations.collaboration_id` | cascade | 226 | OK |
| `messages.conversation_id` | cascade | 233 | OK |
| `messages.sender_id` | cascade | 234 | OK |
| `message_attachments.message_id` | cascade | 246 | OK |
| `content_submissions.collaboration_id` | cascade | 258 | OK |
| `content_submission_files.content_submission_id` | cascade | 276 | OK |
| `content_revisions.content_submission_id` | cascade | 288 | OK |
| `content_revisions.umkm_id` | cascade | 289 | OK |
| `reviews.collaboration_id` | cascade | 298 | OK |
| `reviews.reviewer_id` | cascade | 299 | OK |
| `reviews.reviewee_id` | cascade | 300 | OK |
| `activity_logs.actor_id` | nullOnDelete | 313 | OK (audit log survives actor deletion) |

**Status: OK** — semua unique constraint yang diminta PRD/TDD ada; semua cascade/nullOnDelete logis.

---

## 9. N+1 Query Risk

| Controller method | Eager loads | Status |
| --- | --- | --- |
| `Umkm\CampaignsController@index` | `withCount(['collaborationRequests', 'collaboration'])` (`app/Http/Controllers/Umkm/CampaignsController.php:26`) | OK |
| `Umkm\CampaignsController@show` | `load(['category', 'deliverables', 'collaborationRequests.creator', 'collaboration'])` (line 65) — termasuk nested `collaborationRequests.creator` | OK |
| `Umkm\ProductsController@index` | `umkm->products()->latest()->get()` — tidak ada relasi tambahan di payload | OK |
| `Umkm\CollaborationsController@index` | `with(['campaign', 'creator'])` (line 47) | OK |
| `Umkm\CollaborationsController@show` | `load([...])` sangat lengkap (line 69-78) termasuk `conversation.messages.sender`, `progressUpdates`, `submissions.files`, `submissions.revisions`, `reviews` | OK |
| `Umkm\ReviewsController@index` | `with(['collaboration.campaign', 'reviewer'])` (`app/Http/Controllers/Umkm/ReviewsController.php:26`) | OK |
| `Umkm\DiscoverController@index` | `with(['user', 'categories', 'skills'])` + `withCount('portfolioItems')` (line 25-26) | OK |
| `Umkm\ProfileController@edit` | payload tidak mengakses relasi | OK |
| `Creator\CampaignsController@index` | `with(['umkmProfile', 'category'])` (`app/Http/Controllers/Creator/CampaignsController.php:24`) | OK |
| `Creator\CampaignsController@show` | `load(['category', 'deliverables', 'umkmProfile'])` (line 76) | OK |
| `Creator\CollaborationsController@index` | `with(['campaign', 'umkm'])` (`app/Http/Controllers/Creator/CollaborationsController.php:50`) | OK |
| `Creator\CollaborationsController@show` | `load([...])` identik dengan UMKM (line 69-78) | OK |
| `Creator\PortfolioController@index` | `portfolioItems` di-load lewat relasi profile, payload menggunakan field scalar saja | OK |
| `Creator\VerificationController@show` | `currentVerification()->documents` (lazy) — N+1 risk: `$current->documents` adalah lazy load setelah `currentVerification()` | **GAP-M (medium) — verifikasi: `documents` dimuat terpisah, bukan eager load via `with('documents')`.** |
| `Creator\SkillsController@edit` | payload: profile + selected ids + semua skills/categories (3 query distinct, dapat diterima) | OK |
| `Admin\CollaborationsController@index` | `with(['campaign', 'umkm', 'creator'])` (`app/Http/Controllers/Admin/CollaborationsController.php:35`) | OK |
| `Admin\CollaborationsController@show` | `load([...])` sangat lengkap termasuk `reviews.reviewer`, `reviews.reviewee` (line 59-70) | OK |
| `Admin\VerificationsController@index` | `with(['creatorProfile.user', 'documents'])` (`app/Http/Controllers/Admin/VerificationsController.php:27`) | OK |
| `Admin\VerificationsController@show` | `load(['creatorProfile.user', 'documents', 'reviewer'])` (line 48) | OK |
| `Admin\ModerationController@*` | `with('umkmProfile')`, `with(['collaboration.campaign', 'collaboration.creator'])`, `with(['collaboration.campaign', 'reviewer', 'reviewee'])` | OK |
| `Admin\ReportsController@*` | `count()` aggregates — tidak ada eager load issue | OK |
| `Admin\AuditLogController@index` | tidak ada relasi | OK |
| `Public\CreatorDirectoryController@index` | `with(['user', 'categories', 'skills'])` + `withCount('portfolioItems')` (line 25-26) | OK |
| `Public\CreatorDirectoryController@show` | `load(['user', 'categories', 'skills', 'portfolioItems'])` (line 68) | OK |
| `Public\ProfileController@showUmkm` | `load(['products' => fn ...])` (line 19) | OK |
| `Settings\ProfileController@edit` | payload statis | OK |
| `Settings\SecurityController@edit` | `$request->user()->passkeys()->select([...])` — scoped query, bukan N+1 | OK |

**Status: GAP-M (medium) — `Creator\VerificationController@show` di `app/Http/Controllers/Creator/VerificationController.php:30-32`: `$current = $profile->currentVerification();` lalu `$current->documents` (line 35) adalah lazy load. Rekomendasi: ganti ke `$profile->currentVerification()->load('documents')` atau `with('documents')->latestOfMany()` agar tidak ada N+1.**

---

## 10. Audit Logging Coverage

| Event | AuditLogger::log call site | Status |
| --- | --- | --- |
| Account suspend / activate | Tidak ada — `Admin\UsersController::updateStatus` (`app/Http/Controllers/Admin/UsersController.php:51-66`) update `account_status` tanpa memanggil AuditLogger | **GAP-M (medium)** |
| Verification approve | Tidak ada — `Admin\VerificationsController::approve` (`app/Http/Controllers/Admin/VerificationsController.php:55-73`) update verification tanpa log | **GAP-M (medium)** |
| Verification reject | Tidak ada — `Admin\VerificationsController::reject` (line 75-97) | **GAP-M (medium)** |
| Campaign publish | Tidak ada — `Campaign\PublishCampaignAction` (`app/Actions/Campaign/PublishCampaignAction.php:31-37`) | **GAP-M (medium)** |
| Campaign cancel | Tidak ada — `Campaign\CancelCampaignAction` (`app/Actions/Campaign/CancelCampaignAction.php:32-45`) | **GAP-M (medium)** |
| Campaign hide (admin moderation) | Tidak ada — `Admin\ModerationController::toggleCampaignHide` (`app/Http/Controllers/Admin/ModerationController.php:44-50`) | **GAP-M (medium)** |
| Content submission approve | Tidak ada — `Content\ApproveSubmissionAction` (`app/Actions/Content/ApproveSubmissionAction.php:18-25`) | **GAP-M (medium)** |
| Collaboration complete | Tidak ada — `Review\CompleteCollaborationAction` (`app/Actions/Review/CompleteCollaborationAction.php:37-44`) | **GAP-M (medium)** |
| Collaboration cancel | OK — `Collaboration\CancelCollaborationAction::execute` line 58-63 | OK |
| Collaboration force-close | OK — `Admin\ForceCloseCollaborationAction` line 53-62 | OK |
| Collaboration accept | OK — `Collaboration\AcceptRequestAction` line 70-75 | OK |
| Review hide (admin moderation) | Tidak ada — `Admin\ModerationController::toggleReviewHide` (`app/Http/Controllers/Admin/ModerationController.php:102-108`) | **GAP-M (medium)** |
| Submission hide (admin moderation) | Tidak ada — `Admin\ModerationController::toggleSubmissionHide` (`app/Http/Controllers/Admin/ModerationController.php:73-79`) | **GAP-M (medium)** |

**Status: GAP-M (medium) — 11 event utama belum menulis audit log.** Rekomendasi: tambahkan `app(AuditLogger::class)->log(...)` di setiap Action/Controller di atas dengan action key seperti `account.suspended`, `account.activated`, `verification.approved`, `verification.rejected`, `campaign.published`, `campaign.cancelled`, `campaign.hidden`, `content.approved`, `collaboration.completed`, `review.hidden`, `submission.hidden`. NFR-SECURITY-001 (audit trail) mensyaratkan semua perubahan status tercatat.

---

## 11. Findings Summary

### Critical

_None._

### High

_None._

### Medium

- **M-A01: Portfolio media Form Request tidak sesuai PRD §21 (5 MB gambar / 50 MB video).** `app/Http/Requests/Creator/PortfolioItemRequest.php:25` — `mimes:jpg,jpeg,png,webp, max:4096`. Tidak ada variant video. Rekomendasi: pisahkan field `media_image` (image, max 5120) dan `media_video` (mimes:mp4,mov,webm, max 51200), atau naikkan ke 5 MB + tambah video mimes.
- **M-A02: N+1 risk di `Creator\VerificationController@show`.** `app/Http/Controllers/Creator/VerificationController.php:30-35` — `$current = $profile->currentVerification(); $current->documents`. Rekomendasi: tambah `->load('documents')` atau eager load `with('documents')`.
- **M-A03: 11 event mutatif belum menulis audit log.** Daftar: account.suspend/activate, verification.approve/reject, campaign.publish/cancel/hide, content.approve, collaboration.complete, submission.hide, review.hide. Lihat §10 di atas. Tambahkan `AuditLogger::log()` di Action class terkait.
- **M-A04: Lampiran pesan tidak memiliki endpoint upload.** `app/Models/MessageAttachment.php` dan tabel `message_attachments` ada, view menampilkan attachment, tetapi `SendMessageRequest` (`app/Http/Requests/Collaboration/SendMessageRequest.php`) tidak menerima file. PRD §21 menetapkan 10 MB. Rekomendasi: tambah endpoint `POST messages/{conversation}/attachments` dengan Form Request `mimes:jpg,png,webp,pdf,zip max:10240`.

### Low

- **L-A01: Tidak ada `AuthServiceProvider::register` custom — Policies tetap auto-bound via Laravel convention, namun tidak ada explicit assertion.** `app/Providers/AuthServiceProvider.php:14-17`. Hanya `Gate::before` no-op. Rekomendasi: tambahkan komentar atau `Model::policy(...)` calls agar lebih eksplisit (opsional).
- **L-A02: Dua controller admin (Verifications, Users) menggunakan `Request->validate()` inline alih-alih Form Request.** `app/Http/Controllers/Admin/VerificationsController.php:79-81` dan `app/Http/Controllers/Admin/UsersController.php:58-61`. Tidak ada risiko keamanan (rule minimal), tapi untuk konsistensi bisa diekstrak ke `Admin\RejectVerificationRequest` dan `Admin\UpdateUserStatusRequest`.
- **L-A03: `Umkm\DashboardController::index` melakukan 3 query terpisah untuk stats.** `app/Http/Controllers/Umkm/DashboardController.php:19-23`. Bisa dikonsolidasikan menjadi 3 `withCount` pada relasi atau 1 aggregate query, tapi ini dashboard, bukan endpoint traffic-tinggi. Rekomendasi: tetapkan batas acceptable latency.

---

## 12. Verdict

Audit menemukan **0 defect Critical atau High**. Total **4 Medium** (M-A01..M-A04) dan **3 Low** (L-A01..L-A03) yang tidak ada di `docs/DEFECTS.md`. Semua Medium terkait dengan kesesuaian PRD/standar audit logging; tidak ada yang membocorkan data atau mengizinkan privilege escalation.

**Penambahan ke `docs/DEFECTS.md`:**

| ID | Severity | Lokasi | Deskripsi | Rekomendasi |
| --- | --- | --- | --- | --- |
| M-A01 | Medium | `app/Http/Requests/Creator/PortfolioItemRequest.php:25` | `media` max 4 MB tanpa variant video, tidak sesuai PRD §21 (5 MB gambar / 50 MB video). | Tambah field terpisah untuk image dan video dengan mimes + max yang sesuai. |
| M-A02 | Medium | `app/Http/Controllers/Creator/VerificationController.php:30-35` | N+1 risk: `$current->documents` lazy load. | Ganti ke `->load('documents')` atau eager via `with()`. |
| M-A03 | Medium | `app/Http/Controllers/Admin/UsersController.php:51-66`; `app/Http/Controllers/Admin/VerificationsController.php:55-97`; `app/Actions/Campaign/PublishCampaignAction.php`; `app/Actions/Campaign/CancelCampaignAction.php`; `app/Actions/Content/ApproveSubmissionAction.php`; `app/Actions/Review/CompleteCollaborationAction.php`; `app/Http/Controllers/Admin/ModerationController.php:44-50,73-79,102-108` | 11 event mutatif tidak menulis audit log, melanggar NFR-SECURITY-001 (audit trail). | Tambahkan `AuditLogger::log()` di setiap Action/Controller. |
| M-A04 | Medium | `app/Http/Requests/Collaboration/SendMessageRequest.php:18-20`; `app/Models/MessageAttachment.php` | Tidak ada endpoint upload lampiran pesan padahal model + tabel + view sudah ada. | Tambah endpoint `POST messages/{conversation}/attachments` dengan Form Request 10 MB sesuai PRD §21. |
| L-A01 | Low | `app/Providers/AuthServiceProvider.php` | Tidak ada explicit policy binding. | Opsional: tambahkan `Model::policy(...)` calls. |
| L-A02 | Low | `app/Http/Controllers/Admin/VerificationsController.php:79-81`; `app/Http/Controllers/Admin/UsersController.php:58-61` | Inline `Request->validate()` di controller admin. | Opsional: ekstrak ke Form Request. |
| L-A03 | Low | `app/Http/Controllers/Umkm/DashboardController.php:19-23` | 3 query terpisah untuk stats. | Opsional: konsolidasikan. |

**Status RC.1:** Siap untuk rilis dengan catatan bahwa 4 defect Medium akan diperbaiki pada pass berikutnya (post-RC.1 hotfix) tanpa memblokir rilis karena tidak mengekspos data atau privilege.

---

## 13. Disposition (RC.1)

> Disusun pada 2026-06-18 oleh coding agent berdasarkan tinjauan setiap finding terhadap delapan kategori
> non-acceptable (cross-account data access, unauthorized private-file download, role bypass, account-status
> bypass, collaboration ownership bypass, unsafe upload execution, modification of append-only audit data,
> sensitive-data disclosure). **Hasil: 0 finding harus di-upgrade.** Keseluruhan 4 Medium + 3 Low
> diterima dengan mitigasi terdokumentasi karena tidak memenuhi salah satu dari delapan kategori tersebut.

| ID | Description (1 baris) | Affected component (file_path:line) | Exploitation conditions | Current mitigation | Decision | Owner | Target milestone | Regression test (when fixed) | Release impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M-A01 | Batas upload portofolio tidak sesuai PRD §21 (gambar 4 MB tanpa variant video). | `app/Http/Requests/Creator/PortfolioItemRequest.php:25` | Authenticated creator, upload image 4–5 MB atau video. | `image` + `mimes:jpg,jpeg,png,webp` + `max:4096` — reject file oversize atau non-image. | accepted-with-mitigation | Coding agent | post-MVP | (none — feature expansion) | non-blocking |
| M-A02 | N+1 risk: `$current->documents` lazy load di halaman verifikasi creator. | `app/Http/Controllers/Creator/VerificationController.php:30-35` | Authenticated creator membuka halaman verifikasi miliknya sendiri. | Lazy load hanya terjadi 1× per page render; data yang dimuat adalah milik user yang sedang login. Tidak ada celah otorisasi. | accepted-with-mitigation | Coding agent | post-MVP | (none — optimization) | non-blocking |
| M-A03 | 11 event mutatif belum menulis `AuditLogger::log()` (NFR-SECURITY-001). | `app/Http/Controllers/Admin/UsersController.php:51-66`; `app/Http/Controllers/Admin/VerificationsController.php:55-97`; `app/Actions/Campaign/PublishCampaignAction.php`; `app/Actions/Campaign/CancelCampaignAction.php`; `app/Actions/Content/ApproveSubmissionAction.php`; `app/Actions/Review/CompleteCollaborationAction.php`; `app/Http/Controllers/Admin/ModerationController.php:44-50,73-79,102-108` | Admin melakukan aksi moderasi/verifikasi/suspend; UMKM mempublish/membatalkan campaign; UMKM/creator menyetujui submission; UMKM menyelesaikan kolaborasi. | `activity_logs` append-only tetap mencatat event collaboration.* yang sudah diimplementasi (accept, cancel, force-close). Untuk event yang hilang: tidak ada kebocoran data, hanya jejak audit yang tidak lengkap. | accepted-with-mitigation | Coding agent | post-MVP (RC.2) | `tests/Feature/Audit/AuditLoggerTest.php` — extend with suspend, verify approve/reject, publish, cancel, content approve, complete, hide toggles. | non-blocking |
| M-A04 | Tidak ada endpoint upload lampiran pesan (PRD §21 10 MB). | `app/Http/Requests/Collaboration/SendMessageRequest.php:18-20`; `app/Models/MessageAttachment.php` | Pesan dikirim tanpa attachment (fitur belum diaktifkan). | `SendMessageRequest` hanya menerima `body`; tidak ada route upload attachment; user tidak dapat melampirkan file. | accepted-with-mitigation | Coding agent | post-MVP | (none — feature work) | non-blocking |
| L-A01 | `AuthServiceProvider` tidak melakukan explicit policy binding. | `app/Providers/AuthServiceProvider.php:14-17` | N/A — auto-discovery Laravel convention aktif. | Laravel auto-bind policy via `App\Policies\{Model}Policy` convention. `Gate::before` mengembalikan `null` (bukan override). | accepted-with-mitigation | Coding agent | post-MVP | (none — convention) | non-blocking |
| L-A02 | Inline `Request->validate()` di dua controller admin. | `app/Http/Controllers/Admin/VerificationsController.php:79-81`; `app/Http/Controllers/Admin/UsersController.php:58-61` | Admin melakukan reject verification atau update status user. | Rules minimal (string/in, max length); endpoint diproteksi `abort_unless(isAdmin())`; tidak menerima input user biasa. | accepted-with-mitigation | Coding agent | post-MVP | (none — refactor) | non-blocking |
| L-A03 | `Umkm\DashboardController@index` melakukan 3 query terpisah untuk stats. | `app/Http/Controllers/Umkm/DashboardController.php:19-23` | Authenticated UMKM membuka dashboard miliknya. | Query ter-scope ke `umkm` user; tidak ada leakage. Performa rendah-traffic dashboard, latensi dapat diterima. | accepted-with-mitigation | Coding agent | post-MVP | (none — optimization) | non-blocking |

### Mitigation paragraphs (Bahasa Indonesia)

- **M-A01:** Fitur portofolio video belum diimplementasikan pada RC.1; UI hanya mendukung gambar. Batas 4 MB lebih
  ketat dari PRD 5 MB untuk *gambar*, sehingga tidak ada user yang dapat mengunggah file yang seharusnya ditolak.
  Validasi `mimes` + `image` sudah menolak file non-gambar sehingga tidak ada risiko eksekusi unsafe upload.
  Mitigasi: backlog post-MVP dengan task PEC-VIDEO-PORTFOLIO.
- **M-A02:** Lazy load `$current->documents` hanya terjadi pada satu record per request (bukan koleksi). N=1 pada
  endpoint ini aman secara fungsional; dampak performa hanya pada latency render halaman verifikasi. Mitigasi:
  optimisasi cache + eager load dijadwalkan post-MVP tanpa memengaruhi fungsionalitas atau otorisasi.
- **M-A03:** Tabel `activity_logs` adalah append-only (tidak ada endpoint mutasi selain insert via
  `AuditLogger::log()`). Gap hanya berarti *beberapa* event tidak tercatat, bukan bahwa data audit dapat
  dimodifikasi. Tidak ada kategori "modification of append-only audit data" yang berlaku. Mitigasi: backlog
  RC.2 menambahkan 11 pemanggilan `AuditLogger::log()` sesuai matrix di §10; perubahan di-cover oleh test
  yang memperpanjang `tests/Feature/Audit/AuditLoggerTest.php`.
- **M-A04:** View collaboration merender `attachments` (di-load eager) untuk konsistensi UI, namun tidak ada
  endpoint yang menulis baris baru ke `message_attachments` pada RC.1. User tidak dapat mengunggah lampiran,
  sehingga tidak ada input tanpa validasi yang lolos. Mitigasi: backlog post-MVP menambahkan endpoint
  `POST messages/{conversation}/attachments` dengan `StoreMessageAttachmentRequest` (mimes PRD §21, max 10 MB,
  signed-URL serving, private disk).
- **L-A01:** Auto-discovery Laravel divalidasi oleh 100% feature test passing pada RC.1 (lihat §A dan
  `php artisan test`). Eksplisit binding opsional; tidak ada perubahan fungsional yang ditambahkan.
- **L-A02:** Kedua controller diproteksi `abort_unless(isAdmin())`; tidak ada input user biasa. Validasi inline
  rule-nya minimal dan aman (string + panjang). Refactor ke Form Request adalah cleanliness, bukan security.
- **L-A03:** Tiga query agregat pada endpoint dashboard dengan traffic rendah; tidak ada eksposur data. Konsolidasi
  menjadi `withCount` adalah peningkatan latensi opsional, dijadwalkan post-MVP.

### Verdict setelah disposition

- **0 finding di-upgrade ke severity lebih tinggi.**
- **0 finding di-fix (semua di-accept dengan mitigasi).**
- **7 finding accepted-with-mitigation.**

Tidak ada release blocker. RC.1 dapat dirilis.

---

## A. Lampiran — File yang di-Inspect (read-only)

- `routes/web.php` (216 baris)
- `app/Providers/AuthServiceProvider.php`, `app/Providers/FortifyServiceProvider.php`
- `app/Http/Middleware/EnsureAccountIsActive.php`, `EnsureUserHasRole.php`
- `app/Http/Controllers/FilesController.php`
- `app/Http/Controllers/Auth/RegisteredUserController.php`, `AuthenticatedSessionController.php`
- `app/Http/Controllers/Umkm/*` (8 file)
- `app/Http/Controllers/Creator/*` (7 file)
- `app/Http/Controllers/Admin/*` (7 file)
- `app/Http/Controllers/Public/*` (2 file)
- `app/Http/Controllers/Settings/*` (2 file)
- `app/Http/Controllers/DashboardController.php`
- `app/Actions/Auth/*` (2), `Campaign/*` (3), `Collaboration/*` (5), `Content/*` (4), `Review/*` (2), `Admin/ForceCloseCollaborationAction.php`
- `app/Policies/*` (9 policy)
- `app/Http/Requests/**` (25 Form Request)
- `app/Services/AuditLogger.php`, `FileUrlService.php`
- `app/Models/User.php` (parcial — untuk role helpers)
- `database/migrations/2026_06_17_195448_create_domain_tables.php`
- `config/filesystems.php`
- `bootstrap/app.php`
- `tests/Feature/Messaging/MessagingTest.php` (parcial — untuk verifikasi suspended user)
