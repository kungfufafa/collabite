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

];
