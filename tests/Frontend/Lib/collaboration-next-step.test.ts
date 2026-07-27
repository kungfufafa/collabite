import { describe, expect, it } from 'vitest';

import {
    resolveCreatorCollaborationNextStep,
    resolveUmkmCollaborationNextStep,
} from '@/lib/collaboration-next-step';

describe('collaboration next step', () => {
    it('points UMKM to content review when submission is in_review', () => {
        const step = resolveUmkmCollaborationNextStep(
            {
                status: 'active',
                submissions: [{ status: 'in_review' }],
                payment: null,
            },
            true,
        );

        expect(step?.tab).toBe('content');
        expect(step?.actionLabel).toBe('Tinjau Konten');
    });

    it('points Creator to content upload when no submissions yet', () => {
        const step = resolveCreatorCollaborationNextStep(
            {
                status: 'active',
                submissions: [],
                payment: null,
            },
            true,
        );

        expect(step?.tab).toBe('content');
        expect(step?.actionLabel).toBe('Buka Konten');
    });

    it('points UMKM waiting state to Konten instead of Pesan', () => {
        const step = resolveUmkmCollaborationNextStep(
            {
                status: 'active',
                submissions: [],
                payment: null,
            },
            true,
        );

        expect(step?.tab).toBe('content');
        expect(step?.actionLabel).toBe('Buka Konten');
    });
});
