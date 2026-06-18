<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VerificationDocumentType;
use Database\Factories\CreatorVerificationDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $creator_verification_id
 * @property VerificationDocumentType $type
 * @property string $file_path
 * @property string $original_name
 * @property string $mime_type
 * @property int $size
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'creator_verification_id',
    'type',
    'file_path',
    'original_name',
    'mime_type',
    'size',
])]
class CreatorVerificationDocument extends Model
{
    /** @use HasFactory<CreatorVerificationDocumentFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => VerificationDocumentType::class,
            'size' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<CreatorVerification, self>
     */
    public function verification(): BelongsTo
    {
        return $this->belongsTo(CreatorVerification::class);
    }
}
