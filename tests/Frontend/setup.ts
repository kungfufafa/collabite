import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { vi } from 'vitest';

// jsdom lacks ResizeObserver — required by @radix-ui/react-tooltip / popper.
if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as unknown as typeof ResizeObserver;
}

// jsdom lacks Element pointer capture methods — required by Radix pointer handlers.
if (
    typeof window !== 'undefined' &&
    typeof window.Element !== 'undefined' &&
    typeof window.Element.prototype.hasPointerCapture !== 'function'
) {
    window.Element.prototype.hasPointerCapture = () => false;
    window.Element.prototype.releasePointerCapture = () => {};
    window.Element.prototype.setPointerCapture = () => {};
}

// jsdom lacks scrollIntoView — required by Radix Select to highlight the selected item.
if (
    typeof window !== 'undefined' &&
    typeof window.Element !== 'undefined' &&
    typeof window.Element.prototype.scrollIntoView !== 'function'
) {
    window.Element.prototype.scrollIntoView = function () {};
}

// jsdom lacks matchMedia — required by useAppearance() inside Toaster.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

afterEach(() => {
    cleanup();
});
