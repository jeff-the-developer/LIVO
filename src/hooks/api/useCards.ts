import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getCards,
    addCard,
    getCardTransactions,
    freezeCard,
    unfreezeCard,
    type AddCardPayload,
} from '@api/cards';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const cardKeys = {
    all: ['cards'] as const,
    transactions: (cardId: string) => ['cards', cardId, 'transactions'] as const,
};

// ─── Get User's Cards ─────────────────────────────────────────────────────────
export function useCards() {
    return useQuery({
        queryKey: cardKeys.all,
        queryFn: getCards,
        select: (data) => data.data,
    });
}

// ─── Get Card Transactions ────────────────────────────────────────────────────
export function useCardTransactions(cardId: string) {
    return useQuery({
        queryKey: cardKeys.transactions(cardId),
        queryFn: () => getCardTransactions(cardId),
        select: (data) => data.data,
        enabled: !!cardId,
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

// ─── Freeze Card ──────────────────────────────────────────────────────────────
export function useFreezeCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cardId: string) => freezeCard(cardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cardKeys.all });
        },
    });
}

// ─── Unfreeze Card ────────────────────────────────────────────────────────────
export function useUnfreezeCard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cardId: string) => unfreezeCard(cardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cardKeys.all });
        },
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
