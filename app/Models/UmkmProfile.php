<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UmkmProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $business_name
 * @property string $business_type
 * @property string|null $description
 * @property string|null $address
 * @property string|null $city
 * @property string|null $logo_path
 * @property string|null $contact_phone
 * @property string|null $contact_email
 * @property string|null $website_url
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $user
 * @property-read Collection<int, Product> $products
 */
#[Fillable([
    'user_id',
    'business_name',
    'business_type',
    'description',
    'address',
    'city',
    'logo_path',
    'contact_phone',
    'contact_email',
    'website_url',
])]
class UmkmProfile extends Model
{
    /** @use HasFactory<UmkmProfileFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, self>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Product>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return HasMany<Campaign>
     */
    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }
}
