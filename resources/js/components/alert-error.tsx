import { AlertCircleIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    const uniqueErrors = [...new Set(errors.filter(Boolean))];

    if (uniqueErrors.length === 0) {
        return null;
    }

    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{title ?? 'Terjadi kesalahan'}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm font-semibold">
                    {uniqueErrors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
