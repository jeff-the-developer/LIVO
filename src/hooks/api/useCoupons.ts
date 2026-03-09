import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getCoupons,
    redeemCoupon,
    type RedeemCouponPayload,
} from '@api/coupons';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const couponKeys = {
    all: ['coupons'] as const,
};

// ─── Get User's Coupons ───────────────────────────────────────────────────────
export function useCoupons() {
    return useQuery({
        queryKey: couponKeys.all,
        queryFn: getCoupons,
        select: (data) => data.data,
    });
}

// ─── Redeem Coupon ────────────────────────────────────────────────────────────
export function useRedeemCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RedeemCouponPayload) => redeemCoupon(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: couponKeys.all });
        },
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
