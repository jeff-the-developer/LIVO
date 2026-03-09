import { useQuery } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import { getEvents } from '@api/events';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const eventKeys = {
    all: ['events'] as const,
};

// ─── Get Events ───────────────────────────────────────────────────────────────
export function useEvents() {
    return useQuery({
        queryKey: eventKeys.all,
        queryFn: getEvents,
        select: (data) => data.data,
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
