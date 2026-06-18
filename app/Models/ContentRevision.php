<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ContentRevisionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $content_submission_id
 * @property int $umkm_id
 * @property string $note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['content_submission_id', 'umkm_id', 'note'])]
class ContentRevision extends Model
{
    /** @use HasFactory<ContentRevisionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<ContentSubmission, self>
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(ContentSubmission::class, 'content_submission_id');
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function umkm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'umkm_id');
    }
}
