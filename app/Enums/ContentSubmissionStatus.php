<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Status submission konten (TDD §14.6 + ADR-015).
 */
enum ContentSubmissionStatus: string
{
    case Draft = 'draft';
    case InReview = 'in_review';
    case RevisionRequested = 'revision_requested';
    case Approved = 'approved';
    case Superseded = 'superseded';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::InReview => 'Dalam Review',
            self::RevisionRequested => 'Revisi Diminta',
            self::Approved => 'Disetujui',
            self::Superseded => 'Digantikan',
        };
    }
}
