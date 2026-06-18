<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VerificationStatus;
use Database\Factories\CreatorProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $headline
 * @property string|null $bio
 * @property string|null $profile_photo_path
 * @property string|null $city
 * @property string|null $contact_phone
 * @property string|null $contact_email
 * @property VerificationStatus $verification_status
 * @property float|null $rating_avg
 * @property int $rating_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, Category> $categories
 * @property-read Collection<int, Skill> $skills
 * @property-read Collection<int, PortfolioItem> $portfolioItems
 */
#[Fillable([
    'user_id',
    'headline',
    'bio',
    'profile_photo_path',
    'city',
    'contact_phone',
    'contact_email',
    'verification_status',
    'rating_avg',
    'rating_count',
])]
class CreatorProfile extends Model
{
    /** @use HasFactory<CreatorProfileFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verification_status' => VerificationStatus::class,
            'rating_avg' => 'float',
            'rating_count' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsToMany<Category>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'creator_categories')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<Skill>
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'creator_skills')
            ->withTimestamps();
    }

    /**
     * @return HasMany<PortfolioItem>
     */
    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class);
    }

    /**
     * @return HasMany<CreatorVerification>
     */
    public function verifications(): HasMany
    {
        return $this->hasMany(CreatorVerification::class);
    }

    /**
     * Ambil pengajuan verifikasi yang masih aktif (pending/approved).
     */
    public function currentVerification(): ?CreatorVerification
    {
        return $this->verifications()
            ->whereIn('status', [VerificationStatus::Pending, VerificationStatus::Verified])
            ->latest('submitted_at')
            ->first();
    }
}
