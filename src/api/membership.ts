// ─── Membership API Implementation ───────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes membership endpoints
//
// Mock endpoints implemented:
// - GET /membership/tiers (Get all membership tiers and comparison)
// - GET /membership/current (Get user's current membership status)
// - POST /membership/upgrade (Initiate membership upgrade)
// - GET /membership/benefits-info (Get benefit explanations)

import type { ApiResponse } from '@app-types/api.types';

import type {
    MembershipTierData,
    MembershipComparison,
    GetMembershipResponse,
    UpgradeRequest,
    UpgradeResponse,
    BenefitInfoModal,
    MembershipTier,
} from '@app-types/membership.types';

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Membership Tier Data (Based on Figma) ─────────────────────────────
const MOCK_MEMBERSHIP_TIERS: MembershipTierData[] = [
    {
        id: 'basic',
        name: 'Basic',
        displayName: 'Basic',
        cardColor: '#01CA47', // Brand green from theme
        cardTextColor: '#FFFFFF',
        order: 1,
        isInviteOnly: false,
        benefits: {
            cryptoSwapFee: { label: 'Crypto/Cash Swap Fee', value: 0.8, unit: '%' },
            inviteRebate: { label: 'Invite Rebate', value: 10, unit: '%' },
            cashback: { label: 'Cashback', value: 0.3, unit: '%' },
        },
        individualBenefits: {},
        corporateBenefits: {},
        other: {
            cardDesign: 'Unlock Card Design - Basic Card',
        },
    },
    {
        id: 'standard',
        name: 'Standard',
        displayName: 'Standard',
        cardColor: '#01CA47', // Brand green from theme
        cardTextColor: '#FFFFFF',
        order: 2,
        isInviteOnly: false,
        upgradePrice: 29, // From Figma
        benefits: {
            cryptoSwapFee: { label: 'Crypto/Cash Swap Fee', value: 0.7, unit: '%' },
            inviteRebate: { label: 'Invite Rebate', value: 12, unit: '%' },
            earningBoost: { label: 'Earning+ Earn Boost (APY)', value: 0.2, unit: '%' },
            cashback: { label: 'Cashback', value: 0.5, unit: '%' },
        },
        individualBenefits: {
            swapDiscount: { label: 'Swap Discount', value: 1, unit: '/Month' },
            cardActivation: { label: 'Invite Rebate', value: 1, unit: '' },
            cryptoPayDiscount: { label: 'Corporate Benefits', value: 1, unit: '' },
        },
        corporateBenefits: {
            freeCards: { label: 'Free Corporate Card', value: 30, unit: '' },
            payroll: { label: 'Payroll', value: 10, unit: '/Month' },
        },
        other: {
            cardDesign: 'Unlock Card Design: Standard Card',
        },
    },
    {
        id: 'premium',
        name: 'Premium',
        displayName: 'Premium',
        cardColor: '#9CA3AF', // Grey from Figma
        cardTextColor: '#FFFFFF',
        order: 3,
        isInviteOnly: false,
        benefits: {
            cryptoSwapFee: { label: 'Crypto/Cash Swap Fee', value: 0.6, unit: '%' },
            inviteRebate: { label: 'Invite Rebate', value: 15, unit: '%' },
            earningBoost: { label: 'Earning+ Boost (APY)', value: 0.3, unit: '%' },
            cashback: { label: 'Cashback', value: 0.8, unit: '%' },
        },
        individualBenefits: {
            swapDiscount: { label: 'Swap Discount(0.5%)', value: 2, unit: '/Month' },
            cardActivation: { label: 'Card Activation', value: 2, unit: '' },
            cryptoPayDiscount: { label: 'CryptoPay Discount', value: 1, unit: '' },
        },
        corporateBenefits: {
            freeCards: { label: 'Free Corporate Card', value: 50, unit: '' },
            payroll: { label: 'Free Payroll', value: 20, unit: '/Month' },
        },
        other: {
            cardDesign: 'Unlock Card Design: Premium Card',
        },
    },
    {
        id: 'elite',
        name: 'Elite',
        displayName: 'Elite',
        cardColor: '#F59E0B', // Gold from Figma
        cardGradient: ['#F59E0B', '#FCD34D'],
        cardTextColor: '#FFFFFF',
        order: 4,
        isInviteOnly: false,
        benefits: {
            cryptoSwapFee: { label: 'Crypto/Cash Swap Fee', value: 0.5, unit: '%' },
            inviteRebate: { label: 'Invite Rebate', value: 20, unit: '%' },
            earningBoost: { label: 'Earning+ Boost (APY)', value: 0.4, unit: '%' },
            cashback: { label: 'Cashback', value: 1, unit: '%' },
        },
        individualBenefits: {
            swapDiscount: { label: 'Swap Discount(0.5%)', value: 2, unit: '/Month' },
            cardActivation: { label: 'Card Activation', value: 2, unit: '' },
            cryptoPayDiscount: { label: 'CryptoPay Discount', value: 1, unit: '' },
        },
        corporateBenefits: {
            freeCards: { label: 'Free Corporate Card', value: 50, unit: '' },
            payroll: { label: 'Free Payroll', value: 20, unit: '/Month' },
        },
        other: {
            cardDesign: 'Unlock Card Design: Elite Card',
        },
    },
    {
        id: 'prestige',
        name: 'Prestige',
        displayName: 'Prestige',
        cardColor: '#1F2937', // Black from Figma
        cardTextColor: '#FFFFFF',
        order: 5,
        isInviteOnly: true,
        benefits: {
            cryptoSwapFee: { label: 'Crypto/Cash Swap Fee', value: 0.4, unit: '%' },
            inviteRebate: { label: 'Invite Rebate', value: 20, unit: '%' },
            earningBoost: { label: 'Earning+ Boost (APY)', value: 0.5, unit: '%' },
            cashback: { label: 'Cashback', value: 1, unit: '%' },
        },
        individualBenefits: {
            cardActivation: { label: 'Card Activation', value: 2, unit: '' },
        },
        corporateBenefits: {
            freeCards: { label: 'Free Corporate Card', value: 1, unit: '' },
            payroll: { label: 'Free Payroll', value: 50, unit: '/Month' },
            brandedCards: { label: 'Branded Corporate Cards', value: 1, unit: '' },
        },
        other: {
            cardDesign: 'Unlock Card Design: Prestige Card',
        },
    },
];

const MOCK_BENEFIT_MODALS: BenefitInfoModal[] = [
    {
        type: 'individual',
        title: 'Individual Benefits',
        description: 'Exclusive benefits available only to individual users. All benefits will be granted immediately upon upgrading to higher membership',
        icon: '👤',
    },
    {
        type: 'corporate',
        title: 'Corporate Benefits',
        description: 'Exclusive benefits available only to corporate users. All benefits will be granted immediately upon upgrading to higher membership',
        icon: '🏢',
    },
    {
        type: 'cards',
        title: 'Corporate Cards',
        description: 'You may create up to 30 free debit cards for personnel associated with your company. A fee of 2 USD will be charged for each additional card created thereafter',
        icon: '💳',
    },
    {
        type: 'payroll',
        title: 'Payroll Service',
        description: 'You may pay your employees up to 10 times per month using local payment methods. Payroll via SWIFT wire transfers is not eligible',
        icon: '💰',
    },
    {
        type: 'branded',
        title: 'Branded Cards',
        description: 'You may issue corporate cards with your own custom design. Please contact support to discuss the design and issuance of your branded cards',
        icon: '🎨',
    },
    {
        type: 'invite_only',
        title: 'Invite/Airdrop Only',
        description: 'Prestige can only be obtained via invitations or airdrops. Contact support for more info',
        icon: '⭐',
    },
];

// ─── Get All Membership Tiers ────────────────────────────────────────────────
export async function getMembershipTiers(): Promise<ApiResponse<MembershipTierData[]>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: MOCK_MEMBERSHIP_TIERS,
    });
}

// ─── Get User's Current Membership ───────────────────────────────────────────
export async function getCurrentMembership(): Promise<ApiResponse<GetMembershipResponse>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: {
            currentTier: 'standard',
            membershipData: {
                currentTier: 'standard',
                availableTiers: MOCK_MEMBERSHIP_TIERS,
                upgradeRequirements: {
                    premium: { kycLevel: 1, paymentAmount: 99 },
                    elite: { kycLevel: 2, paymentAmount: 199 },
                    prestige: { isInviteOnly: true },
                },
            },
            upgradeEligibility: {
                canUpgrade: true,
                nextAvailableTier: 'premium',
            },
        },
    });
}

// ─── Upgrade Membership ───────────────────────────────────────────────────────
export async function upgradeMembership(
    request: UpgradeRequest,
): Promise<ApiResponse<UpgradeResponse>> {
    // Always use mock data until backend is ready
    await new Promise(resolve => setTimeout(resolve, 1500)); // Longer delay to simulate payment processing
    
    if (request.targetTier === 'prestige') {
        return {
            success: false,
            data: {
                success: false,
                newTier: 'standard', // Keep current
                message: 'Prestige membership is invite-only. Contact support for more information.',
            },
        };
    }

    return {
        success: true,
        data: {
            success: true,
            newTier: request.targetTier,
            message: `Successfully upgraded to ${request.targetTier} membership!`,
            requiresPayment: request.method === 'payment' ? {
                amount: 29,
                currency: 'USD',
                paymentUrl: undefined, // Would be Stripe/payment URL in production
            } : undefined,
        },
    };
}

// ─── Get Benefit Info Modals ─────────────────────────────────────────────────
export async function getBenefitInfo(): Promise<ApiResponse<BenefitInfoModal[]>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: MOCK_BENEFIT_MODALS,
    });
}

// ─── Get Upgrade Options ─────────────────────────────────────────────────────
export async function getUpgradeOptions(targetTier: MembershipTier): Promise<ApiResponse<{
    inviteOption: {
        enabled: boolean;
        friendsCompleted: number;
        friendsRequired: number;
    };
    paymentOption: {
        enabled: boolean;
        amount: number;
        currency: string;
    };
}>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: {
            inviteOption: {
                enabled: true,
                friendsCompleted: 0,
                friendsRequired: 12,
            },
            paymentOption: {
                enabled: true,
                amount: 29,
                currency: 'USD',
            },
        },
    });
}
