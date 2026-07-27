<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Konfirmasi Pembayaran Manual (ADR-033)
    |--------------------------------------------------------------------------
    |
    | Bukan payment gateway — hanya upload bukti transfer off-platform + konfirmasi
    | Creator. Default false untuk pilot: pembayaran tetap di luar platform (ADR-011).
    | Aktifkan nanti dengan COLLABITE_MANUAL_PAYMENT_ENABLED=true di .env.
    |
    */

    'manual_payment_enabled' => (bool) env('COLLABITE_MANUAL_PAYMENT_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Versi Syarat dan Ketentuan
    |--------------------------------------------------------------------------
    |
    | Dicantumkan pada audit log saat pengguna menerima lamaran/undangan.
    | Selaraskan dengan lastUpdated dokumen legal di frontend.
    |
    */
    'terms_version' => env('COLLABITE_TERMS_VERSION', '2026-07-05'),

];
