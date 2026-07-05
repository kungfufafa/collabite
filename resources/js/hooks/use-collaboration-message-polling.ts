import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 15_000;

/**
 * Poll collaboration messages every 15 seconds (ADR-009).
 */
export function useCollaborationMessagePolling(activeTab: string): void {
    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'messages') {
            return;
        }

        const interval = window.setInterval(() => {
            if (activeTabRef.current !== 'messages') {
                return;
            }

            router.reload({ only: ['collaboration'], preserveUrl: true });
        }, POLL_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [activeTab]);
}
