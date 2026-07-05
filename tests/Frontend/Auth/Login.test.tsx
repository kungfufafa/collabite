import { render, screen, act } from '@testing-library/react';
import { createElement, forwardRef } from 'react';
import type { ReactNode, ForwardedRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let lastFormProps: Record<string, unknown> | null = null;
const formSpy = vi.fn();
let mockFormErrors: Record<string, string> = {};

vi.mock('@inertiajs/react', async () => {
    const MockHead = ({ title }: { title?: string }) =>
        createElement('title', null, title);

    const MockLink = ({ children, href }: { children?: ReactNode; href: string }) =>
        createElement('a', { href }, children);

    const MockUsePage = () => ({ props: { errors: {} } });

    const MockForm = Object.assign(
        forwardRef<
            HTMLFormElement,
            {
                action: unknown;
                method?: string;
                children?: unknown;
                className?: string;
                resetOnSuccess?: unknown;
            }
        >((props, ref: ForwardedRef<HTMLFormElement>) => {
            lastFormProps = props as Record<string, unknown>;
            formSpy(props);

            return createElement(
                'form',
                {
                    ref,
                    className: props.className,
                    'data-method': props.method,
                    'data-action': typeof props.action === 'string'
                        ? props.action
                        : (props.action as { url?: string })?.url,
                    onSubmit: (e: { preventDefault: () => void }) => {
                        e.preventDefault();
                    },
                },
                typeof props.children === 'function'
                    ? (props.children as (p: unknown) => ReactNode)({
                          processing: false,
                          errors: mockFormErrors,
                          values: {},
                          setData: () => undefined,
                      })
                    : (props.children as ReactNode),
            );
        }),
        { displayName: 'MockForm' },
    );

    return {
        Form: MockForm,
        Head: MockHead,
        Link: MockLink,
        usePage: MockUsePage,
    };
});

vi.mock('@/routes', () => ({
    register: () => '/register',
}));

vi.mock('@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController', () => ({
    store: {
        url: () => 'http://collabite.test/login',
    },
}));

import Login from '@/pages/Auth/Login';

describe('Auth/Login', () => {
    beforeEach(() => {
        lastFormProps = null;
        formSpy.mockClear();
        mockFormErrors = {};
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders email and password fields with proper names and required attrs', () => {
        render(<Login canResetPassword />);

        const email = screen.getByLabelText(/email/i) as HTMLInputElement;
        const password = screen.getByLabelText('Kata Sandi') as HTMLInputElement;
        const submit = screen.getByTestId('login-submit');

        expect(email.name).toBe('email');
        expect(email.required).toBe(true);
        expect(email.autocomplete).toBe('email');
        expect(password.name).toBe('password');
        expect(password.required).toBe(true);
        expect(password.autocomplete).toBe('current-password');
        expect(submit).toHaveAttribute('type', 'submit');
    });

    it('posts the form to the login store endpoint with method=post', () => {
        render(<Login canResetPassword />);

        expect(lastFormProps).not.toBeNull();
        expect(lastFormProps?.method).toBe('post');
        const actionUrl = (lastFormProps as { action?: string | { url?: string } })?.action;
        const resolvedAction = typeof actionUrl === 'string' ? actionUrl : actionUrl?.url;
        expect(resolvedAction).toBe('http://collabite.test/login');
    });

    it('surfaces validation errors from Form render props', async () => {
        mockFormErrors = { email: 'Kredensial tidak cocok.' };

        await act(async () => {
            render(<Login canResetPassword />);
        });

        expect(screen.getAllByText('Kredensial tidak cocok.')).toHaveLength(2);
        expect(screen.getByText('Periksa isian berikut')).toBeInTheDocument();
    });

    it('renders nothing for InputError when no error provided', () => {
        const { container } = render(<Login canResetPassword />);

        const errorMessages = container.querySelectorAll('[role="alert"]');
        expect(errorMessages).toHaveLength(0);
    });

    it('surfaces email error from props immediately', () => {
        render(<Login canResetPassword errors={{ email: 'Akun Anda dinonaktifkan.' }} />);

        expect(screen.getAllByText('Akun Anda dinonaktifkan.')).toHaveLength(2);
    });
});
