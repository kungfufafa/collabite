<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CollaborationStatus;
use Database\Factories\CollaborationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $campaign_id
 * @property int $umkm_id
 * @property int $creator_id
 * @property CollaborationStatus $status
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $cancelled_at
 * @property int|null $cancelled_by
 * @property string|null $cancelled_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'campaign_id',
    'umkm_id',
    'creator_id',
    'status',
    'started_at',
    'completed_at',
    'cancelled_at',
    'cancelled_by',
    'cancelled_reason',
])]
class Collaboration extends Model
{
    /** @use HasFactory<CollaborationFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CollaborationStatus::class,
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Campaign, self>
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function umkm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'umkm_id');
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * @return HasOne<Conversation>
     */
    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }

    /**
     * @return HasMany<CollaborationProgressUpdate>
     */
    public function progressUpdates(): HasMany
    {
        return $this->hasMany(CollaborationProgressUpdate::class);
    }

    /**
     * @return HasMany<ContentSubmission>
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(ContentSubmission::class);
    }

    /**
     * @return HasMany<Review>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
