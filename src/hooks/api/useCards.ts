import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getCards,
    addCard,
    type AddCardPayload,
} from '@api/cards';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const cardKeys = {
    all: ['cards'] as const,
};

// ─── Get User's Cards ─────────────────────────────────────────────────────────
export function useCards() {
    return useQuery({
        queryKey: cardKeys.all,
        queryFn: getCards,
        select: (data) => data.data,
    });
}

// ─── Add a New Card ───────────────────────────────────────────────────────────
export function useAddCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddCardPayload) => addCard(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cardKeys.all });
        },
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
