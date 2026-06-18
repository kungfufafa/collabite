<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContentSubmissionStatus;
use Database\Factories\ContentSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $collaboration_id
 * @property int $version
 * @property string $title
 * @property string|null $description
 * @property ContentSubmissionStatus $status
 * @property bool $is_hidden
 * @property Carbon|null $submitted_at
 * @property Carbon|null $approved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'collaboration_id',
    'version',
    'title',
    'description',
    'status',
    'is_hidden',
    'submitted_at',
    'approved_at',
])]
class ContentSubmission extends Model
{
    /** @use HasFactory<ContentSubmissionFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ContentSubmissionStatus::class,
            'is_hidden' => 'boolean',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Collaboration, self>
     */
    public function collaboration(): BelongsTo
    {
        return $this->belongsTo(Collaboration::class);
    }

    /**
     * @return HasMany<ContentSubmissionFile>
     */
    public function files(): HasMany
    {
        return $this->hasMany(ContentSubmissionFile::class);
    }

    /**
     * @return HasMany<ContentRevision>
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(ContentRevision::class);
    }
}
