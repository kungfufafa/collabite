# CRUD Browser Matrix — Collabite

> **Versi:** 1.0
> **Tanggal:** 2026-06-19
> **Sumber:** `docs/FULL_BROWSER_AUDIT.md` (route inventory, defect catalog, browser smoke).

Matriks CRUD per entity per actor. Status:
- **PASS** — diverifikasi via real browser smoke + Pest test + form binding fix
- **N/A** — tidak relevan (auto-generate atau tidak ada di MVP)
- **BLOCKED** — butuh dependency lain
- **PARTIAL** — berjalan tapi ada defect yang belum diperbaiki

| Entity | Actor | List | Create | Read | Update | Delete/Archive | Domain Actions | Browser Status | Pest Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **UMKM Profile** | UMKM | n/a (auto) | n/a (auto-register) | PASS `/umkm/profile` | PASS PATCH `/umkm/profile` | n/a | — | PASS | 2/2 |
| **UMKM Products** | UMKM | PASS `/umkm/products` | PASS POST `/umkm/products` | in-list | PASS PATCH `/umkm/products/{id}` | PASS DELETE `/umkm/products/{id}` | — | PASS | 4/4 |
| **Campaigns** | UMKM | PASS `/umkm/campaigns` | PASS POST `/umkm/campaigns` | PASS `/umkm/campaigns/{id}` | PASS PATCH `/umkm/campaigns/{id}` | n/a (cancel only) | publish, cancel | PASS | 11/11 |
| **Discover Creator** | UMKM | PASS `/umkm/discover` | n/a | n/a | n/a | n/a | invite | PASS | 4/4 |
| **Reviews received** | UMKM | PASS `/umkm/reviews` (route ditambah) | PASS POST `/umkm/collaborations/{id}/review` | in-list | n/a | n/a | — | PASS | 4/4 |
| **Collaborations** | UMKM | PASS `/umkm/collaborations` | n/a (auto via Accept) | PASS `/umkm/collaborations/{id}` | n/a | n/a | accept, reject, request-revision, approve, complete, progress, message, review, invite | PASS | 25/25 |
| **Creator Profile** | Creator | n/a (own) | n/a (auto) | PASS `/creator/profile` | PASS PATCH `/creator/profile` | n/a | — | PASS | 2/2 |
| **Portfolio** | Creator | PASS `/creator/portfolio` | PASS POST `/creator/portfolio` | in-list | n/a | PASS DELETE `/creator/portfolio/{id}` | — | PASS | 4/4 |
| **Skills & Categories** | Creator | PASS `/creator/skills` | n/a | n/a | PASS PATCH `/creator/skills` | n/a | — | PASS | 2/2 |
| **Verification** | Creator | PASS `/creator/verification` | PASS POST `/creator/verification` | n/a | n/a | n/a | resubmit | PASS | 3/3 |
| **Browse Campaigns** | Creator | PASS `/creator/campaigns` | n/a | PASS `/creator/campaigns/{id}` | n/a | n/a | apply | PASS | included in Campaign tests |
| **Collaborations** | Creator | PASS `/creator/collaborations` | n/a | PASS `/creator/collaborations/{id}` | n/a | n/a | accept, reject, cancel, submit, resubmit, progress, message, review | PASS | included in Collaboration tests |
| **Users** | Admin | PASS `/admin/users` | n/a (auto) | n/a | PASS PATCH `/admin/users/{id}/status` | n/a | — | PASS | 1/1 (suspend test) |
| **Verifications** | Admin | PASS `/admin/verifications` | n/a | PASS `/admin/verifications/{id}` | PASS POST approve/reject | n/a | — | PASS | 3/3 |
| **Moderation Campaigns** | Admin | PASS `/admin/moderation/campaigns` | n/a | n/a | PASS PATCH `/admin/moderation/campaigns/{id}/hide` | n/a | — | PASS | included in ModerationTest |
| **Moderation Content** | Admin | PASS `/admin/moderation/content` | n/a | n/a | PASS PATCH `/admin/moderation/content/{id}/hide` | n/a | — | PASS | included in ModerationTest |
| **Moderation Reviews** | Admin | PASS `/admin/moderation/reviews` | n/a | n/a | PASS PATCH `/admin/moderation/reviews/{id}/hide` | n/a | — | PASS | 1/1 (added for `reviews.data.0`) |
| **Collaborations** | Admin | PASS `/admin/collaborations` | n/a | PASS `/admin/collaborations/{id}` | POST force-close | n/a | audit log | PASS | 12/12 |
| **Audit Logs** | Admin | PASS `/admin/audit-logs` | n/a | n/a | n/a (append-only) | n/a | — | PASS | included in Admin tests |
| **Reports** | Admin | PASS `/admin/reports` | n/a | n/a | n/a | n/a | export CSV `/admin/reports/export` | PASS | included in ModerationTest |

## Lampiran: Route Gaps yang Ditutup

| Route | Sebelum Audit | Setelah Audit |
| --- | --- | --- |
| `/umkm/reviews` | 404 | Daftar review diterima (route ditambah di `web.php` + kontroler `Umkm\ReviewsController@index`) |
| `/admin/reviews` (di navigasi) | 404 (route missing) | Diperbaiki di `navigation.ts` menunjuk `/admin/moderation/reviews` |

## Lampiran: Form Binding Fixes

| Form | Defect | Fix |
| --- | --- | --- |
| `Umkm/Campaigns/Form.tsx` | Hidden `category_id` tidak ter-update | Tambah `id="category_id_input"` |
| `Umkm/Campaigns/Form.tsx` | `id="id_deadline"` mismatch label | Set `id="deadline"` |
| `Umkm/Campaigns/Form.tsx` | Label ambigu "Judul" | "Judul Deliverable", "Deskripsi Deliverable" |
| `Creator/Campaigns/Show.tsx` | Textarea tanpa label | Tambah `<label htmlFor="message">Pesan</label>` |
