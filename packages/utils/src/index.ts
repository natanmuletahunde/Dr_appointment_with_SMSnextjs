export type DateInput = Date | string | number;

// Normalizes common date inputs into a readable label.
export function formatDate(
    input: DateInput,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    },
    locale = "en-US",
): string {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }
    return new Intl.DateTimeFormat(locale, options).format(date);
}

export function toTitleCase(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function buildQueryString(
    params: Record<string, string | number | boolean | null | undefined>,
): string {
    // Skip null/undefined values to avoid noisy query strings.
    const entries = Object.entries(params).filter(([, value]) => value != null);
    if (entries.length === 0) {
        return "";
    }
    const search = new URLSearchParams(
        entries.map(([key, value]) => [key, String(value)]),
    );
    return `?${search.toString()}`;
}

export function cn(
    ...classes: Array<string | false | null | undefined>
): string {
    return classes.filter(Boolean).join(" ");
}
