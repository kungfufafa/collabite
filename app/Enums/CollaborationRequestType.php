<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Tipe collaboration request (TDD §13 + ADR-014).
 */
enum CollaborationRequestType: string
{
    case Application = 'application';
    case Invitation = 'invitation';

    public function label(): string
    {
        return match ($this) {
            self::Application => 'Lamaran',
            self::Invitation => 'Undangan',
        };
    }
}
