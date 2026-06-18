<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ContentSubmissionFileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $content_submission_id
 * @property string $file_path
 * @property string $original_name
 * @property string $mime_type
 * @property int $size
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['content_submission_id', 'file_path', 'original_name', 'mime_type', 'size'])]
class ContentSubmissionFile extends Model
{
    /** @use HasFactory<ContentSubmissionFileFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ContentSubmission, self>
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(ContentSubmission::class, 'content_submission_id');
    }
}
