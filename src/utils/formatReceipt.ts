/** Consistent receipt timestamp for money flows */
export function formatReceiptDateTime(d: Date = new Date()): string {
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
