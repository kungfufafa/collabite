import { Form, Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TableRowActionsProps = {
    children?: ReactNode;
    className?: string;
};

export function TableRowActions({
    children,
    className,
}: TableRowActionsProps): ReactNode {
    return (
        <div
            className={cn('flex flex-wrap items-center justify-end gap-1.5', className)}
            data-testid="table-row-actions"
        >
            {children}
        </div>
    );
}

type TableActionLinkProps = {
    href: string;
    label: string;
    icon?: ReactNode;
    variant?: 'outline' | 'ghost' | 'default';
};

export function TableActionLink({
    href,
    label,
    icon,
    variant = 'outline',
}: TableActionLinkProps): ReactNode {
    return (
        <Button asChild size="sm" variant={variant}>
            <Link href={href} prefetch>
                {icon}
                {label}
            </Link>
        </Button>
    );
}

export function TableDetailLink({ href }: { href: string }): ReactNode {
    return (
        <TableActionLink
            href={href}
            icon={<Eye className="size-3.5" />}
            label="Detail"
        />
    );
}

export function TableEditLink({ href }: { href: string }): ReactNode {
    return (
        <TableActionLink
            href={href}
            icon={<Pencil className="size-3.5" />}
            label="Edit"
        />
    );
}

type TableDeleteFormProps = {
    action: string;
    confirmMessage?: string;
    method?: 'delete' | 'post';
};

export function TableDeleteForm({
    action,
    confirmMessage = 'Yakin ingin menghapus data ini?',
    method = 'delete',
}: TableDeleteFormProps): ReactNode {
    return (
        <Form action={action} method={method} options={{ preserveScroll: true }}>
            {({ processing }) => (
                <Button
                    disabled={processing}
                    size="sm"
                    type="submit"
                    variant="destructive"
                    onClick={(event) => {
                        if (!confirm(confirmMessage)) {
                            event.preventDefault();
                        }
                    }}
                >
                    <Trash2 className="size-3.5" />
                    Hapus
                </Button>
            )}
        </Form>
    );
}
