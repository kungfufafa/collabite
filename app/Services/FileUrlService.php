<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

/**
 * Layanan untuk mengakses file upload (TDD §17).
 *
 * - public assets (logo, foto produk, foto portofolio) di disk `public`.
 * - private assets (dokumen verifikasi, lampiran pesan, file submission) di disk `local`
 *   dan dilayani via signed URL sementara.
 */
class FileUrlService
{
    public const SIGNED_TTL_MINUTES = 30;

    /**
     * Upload file ke disk public. Mengembalikan path relatif.
     */
    public function storePublic(UploadedFile $file, string $module, int $ownerId): string
    {
        return $this->store($file, $module, $ownerId, 'public');
    }

    /**
     * Upload file ke disk private (local). Mengembalikan path relatif.
     */
    public function storePrivate(UploadedFile $file, string $module, int $ownerId): string
    {
        return $this->store($file, $module, $ownerId, 'local');
    }

    /**
     * URL publik untuk file di disk `public`.
     */
    public function publicUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * Signed URL sementara untuk file private.
     */
    public function privateUrl(?string $path, ?int $ttlMinutes = null): ?string
    {
        if (empty($path)) {
            return null;
        }

        $ttl = ($ttlMinutes ?? self::SIGNED_TTL_MINUTES) * 60;

        return URL::temporarySignedRoute(
            'files.private',
            now()->addSeconds($ttl),
            ['path' => $path]
        );
    }

    /**
     * Hapus file dari disk.
     */
    public function delete(?string $path, string $disk = 'public'): void
    {
        if (empty($path)) {
            return;
        }

        Storage::disk($disk)->delete($path);
    }

    private function store(UploadedFile $file, string $module, int $ownerId, string $disk): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $filename = Str::uuid()->toString().'.'.$extension;

        return $file->storeAs("{$module}/{$ownerId}", $filename, $disk);
    }
}
