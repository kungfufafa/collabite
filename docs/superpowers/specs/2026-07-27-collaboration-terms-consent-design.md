# Desain Persetujuan Syarat Saat Menerima Kolaborasi

**Tanggal:** 27 Juli 2026  
**Status:** Disetujui — implementasi  
**Cakupan:** Persetujuan ringan, bukan kontrak elektronik

## Tujuan

Sebelum sebuah lamaran atau undangan diterima dan berubah menjadi kolaborasi aktif, pihak penerima wajib menyatakan telah membaca dan menyetujui Syarat dan Ketentuan Collabite. Persetujuan dicatat pada audit log agar diketahui siapa yang menyetujui, kapan persetujuan diberikan, dan versi ketentuan yang berlaku.

Fitur ini tidak membuat kontrak elektronik, PDF perjanjian, tanda tangan digital, escrow, atau sistem sengketa. Dengan demikian, fitur tetap berada dalam scope MVP dan tidak melanggar PRD §8.

## Keputusan Desain

### Titik Persetujuan

Consent hanya diminta ketika deal akan terbentuk:

1. UMKM menerima lamaran Creator.
2. Creator menerima undangan UMKM.

Consent tidak diulang saat mengirim lamaran atau undangan. Persetujuan registrasi tetap terpisah dari persetujuan saat membentuk kolaborasi.

### Antarmuka

Pada kartu permintaan pending, tepat sebelum tombol Terima:

- Tampilkan checkbox:
  - `Saya telah membaca dan menyetujui Syarat dan Ketentuan Collabite.`
- Teks “Syarat dan Ketentuan” merupakan tautan ke `/syarat-dan-ketentuan` dan dibuka pada tab baru.
- Tombol `Terima Lamaran` atau `Terima Undangan` nonaktif sampai checkbox dicentang.
- Setelah berhasil:
  - UMKM melihat pesan `Pengajuan diterima. Kolaborasi dimulai.`
  - Creator melihat pesan `Undangan diterima. Kolaborasi dimulai.`

Checkbox muncul pada:

- `resources/js/pages/Umkm/Campaigns/Show.tsx`
- `resources/js/pages/Creator/Requests/Index.tsx`

### Validasi Backend

UI bukan satu-satunya pengaman. Kedua endpoint penerimaan wajib memvalidasi:

```text
terms_accepted = accepted
```

Request tanpa persetujuan ditolak dengan validasi HTTP 422 dan pesan Bahasa Indonesia:

```text
Anda wajib menyetujui Syarat dan Ketentuan sebelum menerima kolaborasi.
```

Gunakan Form Request bersama agar kedua portal memakai aturan yang sama. Endpoint dan route yang sudah ada tetap digunakan; tidak ada REST API baru.

### Bukti Audit

Tidak diperlukan migration atau kolom consent baru. Persetujuan disimpan pada audit log append-only yang sudah tersedia.

Event penerimaan `collaboration.accepted` mencatat:

- actor: pihak yang menekan tombol Terima;
- subject: collaboration yang baru terbentuk;
- `campaign_id`;
- `request_id`;
- `creator_id`;
- `terms_accepted: true`;
- `terms_version`;
- `terms_accepted_at`.

Versi syarat berasal dari konfigurasi server, bukan input klien, misalnya:

```php
'terms_version' => '2026-07-05',
```

Nilai tersebut selaras dengan `lastUpdated: '5 Juli 2026'` pada dokumen Syarat dan Ketentuan saat ini. Input klien hanya mengirim checkbox persetujuan dan tidak boleh menentukan versi yang dicatat.

Actor audit harus mengikuti pihak penerima:

- lamaran Creator diterima → actor adalah UMKM;
- undangan UMKM diterima → actor adalah Creator.

### Alur Data

1. Pengguna mencentang consent.
2. Form mengirim `terms_accepted=1` ke endpoint accept yang sudah ada.
3. Form Request memvalidasi consent dan otorisasi tetap dijalankan oleh controller/policy.
4. `AcceptRequestAction` membentuk collaboration secara transaksional.
5. Action mencatat event audit beserta metadata consent.
6. Pengguna diarahkan ke daftar/detail kolaborasi dengan flash keberhasilan.

## Pengujian

### Feature Test

Untuk kedua peran:

1. Accept tanpa `terms_accepted` → HTTP 422, request tetap pending, collaboration tidak dibuat.
2. Accept dengan `terms_accepted=1` → request accepted, collaboration active.
3. Audit log berisi actor yang benar, versi syarat server, dan timestamp persetujuan.

### E2E Playwright

Perbarui dua alur UI:

1. `06-ui-matchmaking.spec.ts`
   - tombol Terima Lamaran disabled sebelum checkbox;
   - centang consent;
   - klik Terima Lamaran;
   - kolaborasi aktif terlihat di kedua portal.
2. `07-ui-invitation.spec.ts`
   - tombol Terima Undangan disabled sebelum checkbox;
   - centang consent;
   - klik Terima Undangan;
   - kolaborasi aktif terlihat di kedua portal.

## Kriteria Penerimaan

- Tidak ada kolaborasi yang dapat dibentuk melalui endpoint UI tanpa consent.
- Kedua arah matchmaking memakai aturan yang sama.
- Tautan dokumen legal dapat dibuka sebelum pengguna menyetujui.
- Bukti persetujuan dapat ditemukan di audit log Admin.
- Tidak ada kontrak elektronik, tanda tangan digital, atau PDF legal baru.
