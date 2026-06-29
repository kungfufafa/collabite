import { render, screen, act } from '@testing-library/react';
import { createElement, forwardRef   } from 'react';
import type {ReactNode, ForwardedRef} from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @inertiajs/react Form so we can assert the props it received
// and simulate success / validation-error responses.
let lastFormProps: Record<string, unknown> | null = null;
const formSpy = vi.fn();
let willFail = false;

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
                onSuccess?: () => void;
                onError?: (errors: Record<string, string>) => void;
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

                        if (willFail) {
                            props.onError?.({ email: 'Kredensial tidak cocok.' });
                        } else {
                            props.onSuccess?.();
                        }
                    },
                },
                typeof props.children === 'function'
                    ? (props.children as (p: unknown) => ReactNode)({
                          processing: false,
                          errors: {},
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

// Stub the route binding the page uses.
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
        willFail = false;
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

    it('surfaces server validation error passed via onError', async () => {
        await act(async () => {
            render(<Login canResetPassword />);
        });

        const lastProps = lastFormProps as { onError?: (errors: Record<string, string>) => void } | null;
        await act(async () => {
            lastProps?.onError?.({ email: 'Kredensial tidak cocok.' });
        });

        expect(screen.getByText('Kredensial tidak cocok.')).toBeInTheDocument();
    });

    it('renders nothing for InputError when no error provided', () => {
        const { container } = render(<Login canResetPassword />);

        const errorMessages = container.querySelectorAll('p.text-red-600, p.text-red-400');
        expect(errorMessages).toHaveLength(0);
    });

    it('surfaces email error from props immediately', () => {
        render(<Login canResetPassword errors={{ email: 'Akun Anda dinonaktifkan.' }} />);

        expect(screen.getByText('Akun Anda dinonaktifkan.')).toBeInTheDocument();
    });
});
