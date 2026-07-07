<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * Validasi media portofolio sesuai PRD §21.
 *
 * - Gambar: JPEG/PNG/WebP, maks 5 MB (5120 KB).
 * - Video : MP4/MOV/WebM, maks 50 MB (51200 KB).
 *
 * Satu field `media` menerima salah satu jenis; batas ukuran ditentukan
 * berdasarkan MIME terdeteksi agar gambar dan video dapat memiliki limit berbeda.
 */
class PortfolioMedia implements ValidationRule
{
    private const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

    private const VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/webm'];

    /** bytes */
    private const IMAGE_MAX = 5 * 1024 * 1024;

    /** bytes */
    private const VIDEO_MAX = 50 * 1024 * 1024;

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            $fail('File media tidak valid.');

            return;
        }

        $mime = $value->getMimeType();
        $size = $value->getSize();

        if (in_array($mime, self::IMAGE_MIMES, true)) {
            if ($size > self::IMAGE_MAX) {
                $fail('Gambar portofolio maksimal 5 MB (JPEG, PNG, WebP).');
            }

            return;
        }

        if (in_array($mime, self::VIDEO_MIMES, true)) {
            if ($size > self::VIDEO_MAX) {
                $fail('Video portofolio maksimal 50 MB (MP4, MOV, WebM).');
            }

            return;
        }

        $fail('Media portofolio harus berupa gambar (JPEG, PNG, WebP) atau video (MP4, MOV, WebM).');
    }
}
