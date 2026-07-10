---
schema: collabite-ui-transition-state/v1
migration_id: UI-TRANSITION-001
plan_path: docs/UI_DESIGN_TRANSITION_PLAN.md
contract_version: '1.0'
contract_fingerprint: 'UI-TRANSITION-001@1.0'
baseline_commit: 'ca4713b1e74dc39778fca7151f01f633064a852e'
baseline_branch: 'main'
last_green_commit: 'ca4713b1e74dc39778fca7151f01f633064a852e'
current_phase: P0
current_slice: UI-PR-01
status: ready
theme_default: legacy
updated_at: '2026-07-10T19:39:22+07:00'
updated_by: 'Codex'
working_tree: dirty_expected
expected_changed_files:
    - AGENTS.md
    - docs/DECISIONS.md
    - docs/README.md
    - docs/S2_UX_UI_BLUEPRINT.md
    - docs/UI_DESIGN_TRANSITION_PLAN.md
    - docs/UI_DESIGN_TRANSITION_STATE.md
unexpected_changed_files: []
next_exact_action: 'Jalankan P0: petakan 49 routed pages ke shell, state, test, account, dan screenshot matrix tanpa mengubah UI.'
---

# State Transisi Desain UI Collabite

File ini menjadi ledger mutable untuk [UI_DESIGN_TRANSITION_PLAN.md](./UI_DESIGN_TRANSITION_PLAN.md). Model pelaksana memperbarui file ini setelah menyelesaikan satu slice, saat menemukan blocker, dan sebelum handoff.

Model tidak mengubah kontrak desain di plan melalui file state.

---

## 1. Checkpoint Aktif

| Field      | Nilai                                                                             |
| ---------- | --------------------------------------------------------------------------------- |
| Phase      | `P0`                                                                              |
| Slice      | `UI-PR-01`                                                                        |
| Status     | `ready`                                                                           |
| Objective  | Governance, route inventory, baseline screenshot, dan pre-existing failure record |
| Owner      | Belum ditetapkan                                                                  |
| Started at | Belum dimulai                                                                     |
| Last green | Baseline commit, belum diverifikasi ulang untuk migrasi                           |
| Human gate | Belum ada                                                                         |

### Acceptance aktif

- [ ] Seluruh routed page memiliki role, shell, route, state, dan test owner.
- [ ] Screenshot baseline tersedia pada 390 x 844, 768 x 1024, dan 1440 x 900 sesuai risiko.
- [ ] Legacy named selectors dan hard-coded utilities memiliki baseline count.
- [ ] Pre-existing test failures tercatat terpisah dari regression.
- [ ] Drift MarketplaceLayout terhadap ADR-031 memiliki slice dan acceptance test sendiri.
- [ ] Theme gate dan rollback point telah dipilih tanpa menambah dependency atau backend behavior.
- [ ] Slice register P5 sampai P8 telah dipecah menjadi cohort maksimal tiga halaman terkait.

### Next exact action

Petakan 49 routed pages ke shell, route, state, account/fixture, frontend test, E2E spec, dan screenshot viewport. Jangan mengubah CSS atau React pada langkah ini.

---

## 2. Baseline yang Diketahui

### 2.1 Repo

| Item                 | Nilai awal                                                   |
| -------------------- | ------------------------------------------------------------ |
| Commit               | `ca4713b1e74dc39778fca7151f01f633064a852e`                   |
| Branch               | `main`                                                       |
| Theme runtime        | Legacy neo-brutal global                                     |
| Root wrapper         | `.neo-brutal` di `resources/js/app.tsx`                      |
| CSS global           | `resources/css/app.css`                                      |
| Shared legacy helper | `resources/js/components/collabite/landing/brutal-styles.ts` |
| Helper importer      | 37 file pada baseline 2026-07-10                             |
| Routed Inertia pages | 49, dari 51 page files pada baseline review                  |
| Frontend test files  | 28 file pada baseline filesystem scan                        |
| E2E spec files       | 7 file `.spec.ts`                                            |
| Visual comparison    | Belum tersedia; Playwright mengambil screenshot saat failure |

### 2.2 Risiko utama

- `resources/css/app.css` dapat mengubah seluruh halaman dari satu edit.
- `.neo-brutal` dan primitive hard-coded saling menimpa sehingga salah satu tidak boleh dihapus lebih awal.
- `brutal-styles.ts` dipakai oleh 37 file.
- `resources/js/components/ui/sidebar.tsx` menangani desktop, mobile sheet, shortcut, cookie, dan tooltip.
- `MarketplaceLayout` aktif memakai sidebar melalui `AppShell`, bertentangan dengan ADR-031.
- Collaboration Show UMKM dan Creator memiliki banyak state, upload, polling, dan selector E2E.
- Auth Register, Public Creator Directory, dan collaboration pages memiliki surface serta content range besar.
- Vitest memakai `css: false` sehingga component test tidak membuktikan tampilan akhir.
- Perubahan label, accessible name, tab, role, dan `data-testid` dapat merusak E2E meski tujuan slice bersifat visual.

### 2.3 Concurrent filesystem note

Scan awal task dokumentasi melihat file untracked berikut:

```text
Presentasi_Collabite.md
Presentasi_Collabite.pptx
S2.5_Coded_Prototype.gif
S2.5_Coded_Prototype_HD.gif
S2.6_Coded_Prototype.gif
S2.6_Coded_Prototype_HD.gif
Sitemap_dan_Userflow_Collabite.md
bDJCoker - kelompok-8-collabite.json
bDJCoker - kelompok-8-collabite.json.bak
bDJCoker - kelompok-8-collabite.json.bak2
lampiran_s2_coded_prototype.md
scripts/import_trello_board.py
```

Scan akhir pada 2026-07-10T19:26:49+07:00 tidak lagi menemukan file tersebut. Agent utama dan tiga subagent tidak menjalankan delete, clean, move, formatter, atau write command terhadap file di atas. Jangan membuat ulang file berdasarkan nama saja. Future executor mencatat perubahan ini sebagai concurrent user/external filesystem state dan meminta konfirmasi hanya jika task berikutnya membutuhkan file tersebut.

### 2.4 Pre-existing test failures

Belum diukur pada P0. Model pertama harus menjalankan baseline checks dan mengisi tabel berikut.

| Command          | Waktu | Exit | Hasil | Klasifikasi |
| ---------------- | ----- | ---- | ----- | ----------- |
| Belum dijalankan | -     | -    | -     | Unknown     |

---

## 3. Slice Register

| ID              | Phase | Objective                                       | Status    | Owner         | Prasyarat               | Evidence         |
| --------------- | ----- | ----------------------------------------------- | --------- | ------------- | ----------------------- | ---------------- |
| `UI-PR-01`      | P0    | Governance, route inventory, baseline           | Ready     | -             | Plan approved           | Belum ada        |
| `UI-PR-02`      | P0    | Rekonsiliasi MarketplaceLayout terhadap ADR-031 | Pending   | -             | UI-PR-01                | Belum ada        |
| `UI-PR-03`      | P1    | Semantic tokens dan temporary theme gate        | Pending   | -             | P0 complete             | Belum ada        |
| `UI-PR-04`      | P2    | Button, link, badge, status                     | Pending   | -             | UI-PR-03                | Belum ada        |
| `UI-PR-05`      | P2    | Form primitive family                           | Pending   | -             | UI-PR-03                | Belum ada        |
| `UI-PR-06`      | P2    | Card, table, tabs, overlay, feedback            | Pending   | -             | UI-PR-04..05            | Belum ada        |
| `UI-PR-07`      | P3    | Shared product composites                       | Pending   | -             | UI-PR-04..06            | Belum ada        |
| `UI-PR-08`      | P3    | PublicLayout, AuthLayout, shared chrome         | Pending   | -             | UI-PR-07                | Belum ada        |
| `UI-PR-09`      | P3    | MarketplaceLayout dan navigation                | Pending   | -             | UI-PR-02, UI-PR-07      | Belum ada        |
| `UI-PR-10`      | P3    | CollaborationWorkspaceLayout                    | Pending   | -             | UI-PR-07                | Belum ada        |
| `UI-PR-11`      | P3    | AdminDashboardLayout dan Settings shell         | Pending   | -             | UI-PR-07                | Belum ada        |
| `UI-PR-12`      | P4    | Calibration screens                             | Pending   | -             | UI-PR-08..11            | Belum ada        |
| `HUMAN-GATE-01` | P4    | Product Owner menerima calibration screens      | Pending   | Product Owner | UI-PR-12                | Belum ada        |
| `UI-PR-13`      | P5    | Landing sections                                | Pending   | -             | HUMAN-GATE-01, UI-PR-08 | Belum ada        |
| `UI-PR-14`      | P5    | Public discovery dan profile                    | Pending   | -             | HUMAN-GATE-01, UI-PR-08 | Belum ada        |
| `UI-PR-15`      | P5    | Auth flows                                      | Pending   | -             | HUMAN-GATE-01, UI-PR-08 | Belum ada        |
| `UI-PR-20+`     | P6    | UMKM cohorts                                    | Unplanned | -             | HUMAN-GATE-01, UI-PR-09 | P0 harus merinci |
| `UI-PR-30+`     | P6    | Creator cohorts                                 | Unplanned | -             | HUMAN-GATE-01, UI-PR-09 | P0 harus merinci |
| `UI-PR-40+`     | P7    | Collaboration tab families                      | Unplanned | -             | HUMAN-GATE-01, UI-PR-10 | P0 harus merinci |
| `UI-PR-50+`     | P8    | Admin, notification, settings cohorts           | Unplanned | -             | HUMAN-GATE-01, UI-PR-11 | P0 harus merinci |
| `UI-PR-60`      | P8    | Responsive dan accessibility hardening          | Pending   | -             | Semua cohort            | Belum ada        |
| `HUMAN-GATE-02` | P9    | Product Owner menerima UAT dan cutover          | Pending   | Product Owner | Full checks green       | Belum ada        |
| `UI-PR-61`      | P9    | V2 cutover                                      | Pending   | -             | HUMAN-GATE-02           | Belum ada        |
| `UI-PR-62`      | P9    | Legacy removal dan docs closeout                | Pending   | -             | Stabilization accepted  | Belum ada        |

### 3.1 Template register entry

```markdown
## <slice ID>: <title>

- Objective:
- Routes/pages:
- Allowed files:
- Explicitly out of scope:
- Prerequisites:
- Design contract IDs:
- QA IDs:
- FR/UC/TC:
- Targeted tests:
- Screenshot matrix:
- Rollback point:
- Owner/model:
- Status:
```

---

## 4. Active Slice Work Log

Belum ada implementasi. Model pertama mengganti bagian ini saat memulai `UI-PR-01`.

### Expected changed files

Tidak ada sampai executor P0 menetapkan allowlist dokumentasi atau artifact baseline.

### Files touched

- `docs/UI_DESIGN_TRANSITION_PLAN.md`: kontrak dan runbook dibuat.
- `docs/UI_DESIGN_TRANSITION_STATE.md`: state awal dibuat.
- `docs/DECISIONS.md`: ADR-034 ditambahkan pada task dokumentasi awal.
- `docs/S2_UX_UI_BLUEPRINT.md`: arahan legacy diselaraskan dengan ADR-034.
- `docs/README.md`: dokumen transisi didaftarkan.
- `AGENTS.md`: reading order untuk task transisi UI diperbarui.

### Verification result

Dokumentasi setup lulus Prettier pada dua dokumen baru, relative-link check, ADR list-to-heading count, dan `git diff --check`. Belum ada UI code atau application test yang dijalankan karena implementasi P0 belum dimulai.

### Screenshot evidence

Belum dibuat. P0 harus mengisi lokasi artifact dan viewport.

### Known blockers

- Drift MarketplaceLayout terhadap ADR-031.
- Dukungan dark theme harus ditentukan dari surface yang benar-benar dapat diakses pengguna. Token `.dark` saja tidak membuktikan fitur aktif.

---

## 5. Decision dan Change Request Log

| ID         | Tanggal    | Jenis            | Keputusan                                                   | Dampak                       | Approval                       |
| ---------- | ---------- | ---------------- | ----------------------------------------------------------- | ---------------------------- | ------------------------------ |
| `UI-D-001` | 2026-07-10 | Design direction | Warm Humanist Marketplace Minimalism menjadi target.        | Seluruh visual layer         | Product Owner melalui task ini |
| `UI-D-002` | 2026-07-10 | Governance       | Plan dipisahkan dari mutable state.                         | Handoff lintas-model         | Product Owner melalui task ini |
| `UI-D-003` | 2026-07-10 | Rollout          | Gunakan temporary theme gate; cutover dan cleanup terpisah. | Rollback dan partial rollout | Pending validation P0          |

### Change request template

```markdown
## UI-CR-XXX: <title>

- Requested by:
- Date:
- Contract section:
- Reason:
- User impact:
- Routes/slices affected:
- Before/after evidence:
- Risks:
- Approval status:
- Contract version after approval:
```

---

## 6. Command Evidence

Model menambahkan satu row per command dan tidak menghapus riwayat lama.

| Timestamp                 | Slice               | Command                                                                                     | Exit | Summary                         | Commit/working tree    |
| ------------------------- | ------------------- | ------------------------------------------------------------------------------------------- | ---- | ------------------------------- | ---------------------- |
| 2026-07-10T19:26:49+07:00 | Documentation setup | `npx prettier --check docs/UI_DESIGN_TRANSITION_PLAN.md docs/UI_DESIGN_TRANSITION_STATE.md` | 0    | Dua dokumen baru terformat      | Working tree docs only |
| 2026-07-10T19:26:49+07:00 | Documentation setup | Relative Markdown link check                                                                | 0    | Seluruh relative link resolve   | Working tree docs only |
| 2026-07-10T19:26:49+07:00 | Documentation setup | ADR list dan heading count                                                                  | 0    | 34 list entries dan 34 headings | Working tree docs only |
| 2026-07-10T19:26:49+07:00 | Documentation setup | `git diff --check`                                                                          | 0    | Tidak ada whitespace error      | Working tree docs only |

---

## 7. Visual Evidence Matrix

| Slice | Route/page | Role | State | Viewport | Before | After | Contract IDs | Result      |
| ----- | ---------- | ---- | ----- | -------- | ------ | ----- | ------------ | ----------- |
| -     | -          | -    | -     | -        | -      | -     | -            | Not started |

---

## 8. Deferred Issues

Catat masalah di luar scope tanpa mengerjakannya.

| ID  | Ditemukan pada | Temuan | Alasan ditunda | Owner/next task |
| --- | -------------- | ------ | -------------- | --------------- |
| -   | -              | -      | -              | -               |

---

## 9. Model Handoff

```markdown
# Model Handoff: <slice ID>

Role: executor
Contract version: 1.0
Baseline atau last-green:
Current status:

## Read first

- docs/UI_DESIGN_TRANSITION_PLAN.md
- docs/UI_DESIGN_TRANSITION_STATE.md
- <source docs dan slice-specific files>

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

<satu langkah konkret>

## Stop conditions

- <kondisi wajib berhenti>

## Required state update

- frontmatter
- slice register
- work log
- command evidence
- visual evidence
- event log
```

---

## 10. Append-only Event Log

| Timestamp                 | Actor/model | Event                                                                        | Phase/slice         | Result   | Next action                                              |
| ------------------------- | ----------- | ---------------------------------------------------------------------------- | ------------------- | -------- | -------------------------------------------------------- |
| 2026-07-10T19:26:49+07:00 | Codex       | Membuat kontrak, runbook, ADR-034, sinkronisasi S2.4, dan state awal         | Documentation setup | Complete | Mulai `UI-PR-01` saat implementasi diotorisasi           |
| 2026-07-10T19:26:49+07:00 | Codex       | Mencatat 12 file untracked awal yang hilang akibat concurrent/external state | Documentation setup | Noted    | Jangan rekonstruksi tanpa sumber atau instruksi pengguna |
