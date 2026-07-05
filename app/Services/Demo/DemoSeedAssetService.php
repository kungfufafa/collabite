<?php

declare(strict_types=1);

namespace App\Services\Demo;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Menerbitkan asset gambar demo (Cursor Generate Image) ke disk public.
 */
class DemoSeedAssetService
{
    private const ASSET_ROOT = 'database/seeders/assets/demo';

    public function publish(string $relativePath, string $module, int $ownerId): ?string
    {
        $source = base_path(self::ASSET_ROOT.'/'.$relativePath);

        if (! is_readable($source)) {
            return null;
        }

        $extension = strtolower(pathinfo($source, PATHINFO_EXTENSION) ?: 'png');
        $filename = Str::uuid()->toString().'.'.$extension;
        $destination = "{$module}/{$ownerId}/{$filename}";

        $contents = file_get_contents($source);
        if ($contents === false) {
            return null;
        }

        Storage::disk('public')->put($destination, $contents);

        return $destination;
    }

    /**
     * @param  array<int, string>  $relativePaths
     * @return array<int, string>
     */
    public function publishMany(array $relativePaths, string $module, int $ownerId): array
    {
        $paths = [];

        foreach ($relativePaths as $relativePath) {
            $published = $this->publish($relativePath, $module, $ownerId);
            if ($published !== null) {
                $paths[] = $published;
            }
        }

        return $paths;
    }
}
