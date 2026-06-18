<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use Database\Factories\CollaborationRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $campaign_id
 * @property int $creator_id
 * @property int $sender_id
 * @property CollaborationRequestType $type
 * @property CollaborationRequestStatus $status
 * @property string|null $message
 * @property Carbon|null $responded_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'campaign_id',
    'creator_id',
    'sender_id',
    'type',
    'status',
    'message',
    'responded_at',
])]
class CollaborationRequest extends Model
{
    /** @use HasFactory<CollaborationRequestFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => CollaborationRequestType::class,
            'status' => CollaborationRequestStatus::class,
            'responded_at' => 'datetime',
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
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
