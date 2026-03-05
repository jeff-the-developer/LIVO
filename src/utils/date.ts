import {
    format,
    formatDistanceToNow,
    isToday,
    isYesterday,
    isSameYear,
    parseISO,
} from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parse(iso: string): Date {
    return parseISO(iso);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/** "Mar 5, 2026" */
export function formatTransactionDate(iso: string): string {
    return format(parse(iso), 'MMM d, yyyy');
}

/** "Just now" | "5 minutes ago" | "Yesterday" | "Mar 5" | "Mar 5, 2025" */
export function formatRelativeTime(iso: string): string {
    const date = parse(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) {
        return formatDistanceToNow(date, { addSuffix: true });
    }
    if (isToday(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    if (isSameYear(date, now)) {
        return format(date, 'MMM d');
    }
    return format(date, 'MMM d, yyyy');
}

/** "05/03/26" */
export function formatShortDate(iso: string): string {
    return format(parse(iso), 'dd/MM/yy');
}

/** "14:32" */
export function formatTimeOnly(iso: string): string {
    return format(parse(iso), 'HH:mm');
}
