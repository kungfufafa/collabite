export type ValidationErrorValue = string | string[] | undefined;

export type ValidationErrors = Record<string, ValidationErrorValue>;

export function formatFieldError(message?: ValidationErrorValue): string | undefined {
    if (message === undefined || message === '') {
        return undefined;
    }

    if (Array.isArray(message)) {
        const filtered = message.filter((item) => item !== '');

        return filtered[0];
    }

    return message;
}

export function flattenValidationErrors(errors: ValidationErrors): string[] {
    const messages: string[] = [];

    for (const value of Object.values(errors)) {
        if (value === undefined || value === '') {
            continue;
        }

        if (Array.isArray(value)) {
            messages.push(...value.filter((item) => item !== ''));
            continue;
        }

        messages.push(value);
    }

    return [...new Set(messages)];
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
    return flattenValidationErrors(errors).length > 0;
}

export function mergeValidationErrors(
    ...sources: Array<ValidationErrors | undefined>
): ValidationErrors {
    return sources.reduce<ValidationErrors>((merged, source) => {
        if (!source) {
            return merged;
        }

        return { ...merged, ...source };
    }, {});
}

export function fieldErrorProps(message?: ValidationErrorValue): {
    'aria-invalid': boolean;
} {
    return {
        'aria-invalid': Boolean(formatFieldError(message)),
    };
}
