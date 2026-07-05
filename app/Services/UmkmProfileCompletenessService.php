<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\UmkmProfile;

/**
 * Validasi kelengkapan profil UMKM sebelum publish campaign.
 */
class UmkmProfileCompletenessService
{
    /**
     * @var list<string>
     */
    private const REQUIRED_FIELDS = [
        'business_name',
        'business_type',
        'city',
        'description',
        'contact_phone',
        'contact_email',
    ];

    /**
     * @var array<string, string>
     */
    private const FIELD_LABELS = [
        'business_name' => 'Nama usaha',
        'business_type' => 'Jenis usaha',
        'city' => 'Kota',
        'description' => 'Deskripsi usaha',
        'contact_phone' => 'Nomor telepon',
        'contact_email' => 'Email kontak',
    ];

    public function isComplete(UmkmProfile $profile): bool
    {
        return $this->missingFields($profile) === [];
    }

    /**
     * @return list<string>
     */
    public function missingFields(UmkmProfile $profile): array
    {
        $missing = [];

        foreach (self::REQUIRED_FIELDS as $field) {
            $value = $profile->{$field};

            if (! is_string($value) || trim($value) === '') {
                $missing[] = $field;
            }
        }

        return $missing;
    }

    /**
     * @return list<string>
     */
    public function missingFieldLabels(UmkmProfile $profile): array
    {
        return array_map(
            fn (string $field): string => self::FIELD_LABELS[$field] ?? $field,
            $this->missingFields($profile),
        );
    }

    public function incompleteMessage(UmkmProfile $profile): string
    {
        $labels = $this->missingFieldLabels($profile);

        if ($labels === []) {
            return '';
        }

        return 'Lengkapi profil usaha terlebih dahulu: '.implode(', ', $labels).'.';
    }
}
