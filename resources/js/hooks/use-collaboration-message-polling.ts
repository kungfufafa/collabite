import { useEffect } from 'react';
import { router } from '@inertiajs/react';

const POLL_INTERVAL_MS = 15_000;

/**
 * Poll collaboration messages every 15 seconds (ADR-009).
 */
export function useCollaborationMessagePolling(activeTab: string): void {
    useEffect(() => {
        if (activeTab !== 'messages') {
            return;
        }

        const interval = window.setInterval(() => {
            router.reload({ only: ['collaboration'], preserveScroll: true });
        }, POLL_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [activeTab]);
}
