<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CampaignStatus;
use Database\Factories\CampaignFactory;
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
 * @property int $umkm_profile_id
 * @property int $category_id
 * @property string $title
 * @property string $description
 * @property string|null $budget
 * @property Carbon|null $deadline
 * @property CampaignStatus $status
 * @property bool $is_hidden
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'umkm_profile_id',
    'category_id',
    'title',
    'description',
    'budget',
    'deadline',
    'status',
    'is_hidden',
    'published_at',
])]
class Campaign extends Model
{
    /** @use HasFactory<CampaignFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CampaignStatus::class,
            'deadline' => 'date',
            'published_at' => 'datetime',
            'is_hidden' => 'boolean',
            'budget' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<UmkmProfile, self>
     */
    public function umkmProfile(): BelongsTo
    {
        return $this->belongsTo(UmkmProfile::class);
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function umkm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'umkm_profile_id', 'id');
    }

    /**
     * @return BelongsTo<Category, self>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<CampaignDeliverable>
     */
    public function deliverables(): HasMany
    {
        return $this->hasMany(CampaignDeliverable::class);
    }

    /**
     * @return HasMany<CollaborationRequest>
     */
    public function collaborationRequests(): HasMany
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    /**
     * @return HasOne<Collaboration>
     */
    public function collaboration(): HasOne
    {
        return $this->hasOne(Collaboration::class);
    }
}
