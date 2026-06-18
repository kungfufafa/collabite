<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CollaborationProgressUpdateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $collaboration_id
 * @property int $creator_id
 * @property string $message
 * @property string|null $attachment_path
 * @property string|null $attachment_original_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'collaboration_id',
    'creator_id',
    'message',
    'attachment_path',
    'attachment_original_name',
])]
class CollaborationProgressUpdate extends Model
{
    /** @use HasFactory<CollaborationProgressUpdateFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Collaboration, self>
     */
    public function collaboration(): BelongsTo
    {
        return $this->belongsTo(Collaboration::class);
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
