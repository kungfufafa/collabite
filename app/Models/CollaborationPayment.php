<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use Database\Factories\CollaborationPaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $collaboration_id
 * @property string $amount
 * @property PaymentStatus $status
 * @property string|null $proof_path
 * @property string|null $proof_original_name
 * @property string|null $proof_mime_type
 * @property int|null $proof_size
 * @property string|null $note
 * @property Carbon|null $submitted_at
 * @property Carbon|null $confirmed_at
 * @property int|null $confirmed_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collaboration $collaboration
 * @property-read User|null $confirmedByUser
 */
#[Fillable([
    'collaboration_id',
    'amount',
    'status',
    'proof_path',
    'proof_original_name',
    'proof_mime_type',
    'proof_size',
    'note',
    'submitted_at',
    'confirmed_at',
    'confirmed_by',
])]
class CollaborationPayment extends Model
{
    /** @use HasFactory<CollaborationPaymentFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PaymentStatus::class,
            'submitted_at' => 'datetime',
            'confirmed_at' => 'datetime',
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
     * @return BelongsTo<User, self>
     */
    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
