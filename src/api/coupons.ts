// ─── Coupons API Implementation ──────────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes coupons endpoints
//
// Mock endpoints implemented:
// - GET /coupons (Get user's coupons)
// - POST /coupons/redeem (Redeem a coupon)

import type { ApiResponse } from '@app-types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────
export type CouponStatus = 'active' | 'used' | 'expired';
export type CouponType = 'swap_fee' | 'cashback' | 'earning_boost' | 'free_transfer';

export interface Coupon {
    id: string;
    code: string;
    title: string;
    description: string;
    type: CouponType;
    status: CouponStatus;
    discount_value: number;
    discount_unit: '%' | 'USD';
    min_amount?: number;
    expires_at: string;
    created_at: string;
    used_at?: string;
}

export interface RedeemCouponPayload {
    coupon_code: string;
}

export interface RedeemCouponResponse {
    coupon: Coupon;
    message: string;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_COUPONS: Coupon[] = [
    {
        id: 'cpn_001',
        code: 'SWAP10',
        title: '10% Off Swap Fee',
        description: 'Get 10% discount on your next crypto swap fee',
        type: 'swap_fee',
        status: 'active',
        discount_value: 10,
        discount_unit: '%',
        expires_at: '2026-06-30T23:59:59Z',
        created_at: '2026-01-15T10:00:00Z',
    },
    {
        id: 'cpn_002',
        code: 'CASHBACK5',
        title: '$5 Cashback Bonus',
        description: 'Earn $5 extra cashback on your next purchase over $50',
        type: 'cashback',
        status: 'active',
        discount_value: 5,
        discount_unit: 'USD',
        min_amount: 50,
        expires_at: '2026-04-30T23:59:59Z',
        created_at: '2026-02-01T10:00:00Z',
    },
    {
        id: 'cpn_003',
        code: 'EARN20',
        title: '+0.2% Earning Boost',
        description: 'Boost your Earning+ APY by 0.2% for 30 days',
        type: 'earning_boost',
        status: 'active',
        discount_value: 0.2,
        discount_unit: '%',
        expires_at: '2026-05-15T23:59:59Z',
        created_at: '2026-03-01T10:00:00Z',
    },
    {
        id: 'cpn_004',
        code: 'FREETX',
        title: 'Free Transfer',
        description: 'One free international transfer — no fees',
        type: 'free_transfer',
        status: 'used',
        discount_value: 100,
        discount_unit: '%',
        expires_at: '2026-03-31T23:59:59Z',
        created_at: '2026-01-10T10:00:00Z',
        used_at: '2026-02-20T14:30:00Z',
    },
    {
        id: 'cpn_005',
        code: 'SWAP5OFF',
        title: '5% Off Swap Fee',
        description: 'Get 5% discount on any crypto swap',
        type: 'swap_fee',
        status: 'expired',
        discount_value: 5,
        discount_unit: '%',
        expires_at: '2026-01-31T23:59:59Z',
        created_at: '2025-12-01T10:00:00Z',
    },
];

// ─── Get User's Coupons ───────────────────────────────────────────────────────
export async function getCoupons(): Promise<ApiResponse<Coupon[]>> {
    return mockDelay({
        success: true,
        data: MOCK_COUPONS,
    });
}

// ─── Redeem Coupon ────────────────────────────────────────────────────────────
export async function redeemCoupon(
    payload: RedeemCouponPayload,
): Promise<ApiResponse<RedeemCouponResponse>> {
    // Simulate validation
    const code = payload.coupon_code.toUpperCase().trim();

    if (code === 'INVALID') {
        return mockDelay(
            {
                success: false,
                data: {
                    coupon: MOCK_COUPONS[0],
                    message: 'Invalid coupon code.',
                },
                message: 'Invalid coupon code.',
            },
            600,
        );
    }

    const newCoupon: Coupon = {
        id: `cpn_${Date.now()}`,
        code,
        title: 'Redeemed Coupon',
        description: `Coupon ${code} has been activated`,
        type: 'cashback',
        status: 'active',
        discount_value: 10,
        discount_unit: '%',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
    };

    return mockDelay({
        success: true,
        data: {
            coupon: newCoupon,
            message: 'Coupon redeemed successfully!',
        },
    });
}
