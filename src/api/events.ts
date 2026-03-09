// ─── Events API Implementation ───────────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes events endpoints
//
// Mock endpoints implemented:
// - GET /events (Get upcoming & past events)

import type { ApiResponse } from '@app-types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────
export type EventStatus = 'upcoming' | 'live' | 'ended';
export type EventCategory = 'promotion' | 'airdrop' | 'community' | 'webinar' | 'challenge';

export interface AppEvent {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    status: EventStatus;
    image_url?: string;
    starts_at: string;
    ends_at: string;
    reward?: string;
    cta_label?: string;
    cta_url?: string;
    participants_count?: number;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EVENTS: AppEvent[] = [
    {
        id: 'evt_001',
        title: 'Spring Swap Fest',
        description:
            'Enjoy 50% off swap fees on all crypto pairs during this limited-time event. The more you swap, the more you save!',
        category: 'promotion',
        status: 'live',
        starts_at: '2026-03-01T00:00:00Z',
        ends_at: '2026-03-31T23:59:59Z',
        reward: '50% fee discount',
        cta_label: 'Swap Now',
        participants_count: 2_350,
    },
    {
        id: 'evt_002',
        title: 'Invite & Earn Airdrop',
        description:
            'Invite 3 friends who complete KYC and both of you receive a $10 USDT airdrop. No limits on referrals!',
        category: 'airdrop',
        status: 'upcoming',
        starts_at: '2026-04-01T00:00:00Z',
        ends_at: '2026-04-30T23:59:59Z',
        reward: '$10 USDT per referral',
        cta_label: 'Get Invite Link',
    },
    {
        id: 'evt_003',
        title: 'LIVOPay Town Hall',
        description:
            'Join the LIVOPay team for our quarterly community town hall. Product updates, Q&A, and exclusive giveaways.',
        category: 'webinar',
        status: 'upcoming',
        starts_at: '2026-04-15T14:00:00Z',
        ends_at: '2026-04-15T15:30:00Z',
        cta_label: 'Register',
        participants_count: 580,
    },
    {
        id: 'evt_004',
        title: 'Cashback Challenge',
        description:
            'Spend $500 or more this month using your LIVO card and earn 2x cashback. Top spenders win bonus rewards.',
        category: 'challenge',
        status: 'upcoming',
        starts_at: '2026-04-01T00:00:00Z',
        ends_at: '2026-04-30T23:59:59Z',
        reward: '2x cashback',
        cta_label: 'Join Challenge',
    },
    {
        id: 'evt_005',
        title: 'New Year Bonus',
        description:
            'Celebrate the new year with bonus earning rates. Deposit into Earning+ and receive an extra 0.5% APY boost.',
        category: 'promotion',
        status: 'ended',
        starts_at: '2026-01-01T00:00:00Z',
        ends_at: '2026-01-31T23:59:59Z',
        reward: '+0.5% APY boost',
        participants_count: 4_100,
    },
    {
        id: 'evt_006',
        title: 'Community AMA',
        description:
            'Our CTO answers your questions about the LIVOPay roadmap, upcoming features, and security architecture.',
        category: 'community',
        status: 'ended',
        starts_at: '2026-02-10T16:00:00Z',
        ends_at: '2026-02-10T17:00:00Z',
        participants_count: 320,
    },
];

// ─── Get Events ───────────────────────────────────────────────────────────────
export async function getEvents(): Promise<ApiResponse<AppEvent[]>> {
    return mockDelay({
        success: true,
        data: MOCK_EVENTS,
    });
}
