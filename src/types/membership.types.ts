// ─── Membership Types ────────────────────────────────────────────────────────
export type MembershipTier = 'basic' | 'standard' | 'premium' | 'elite' | 'prestige';

export interface MembershipBenefit {
    label: string;
    value: string | number;
    unit?: string; // %, USD, /Month, etc.
    description?: string;
}

export interface MembershipTierData {
    id: MembershipTier;
    name: string;
    displayName: string; // For UI display
    cardColor: string;
    cardGradient?: string[];
    cardTextColor: string;
    order: number;
    isInviteOnly: boolean;
    upgradePrice?: number; // USD price to upgrade
    
    // Core benefits that appear in comparison
    benefits: {
        cryptoSwapFee: MembershipBenefit;
        inviteRebate: MembershipBenefit;
        earningBoost?: MembershipBenefit;
        cashback: MembershipBenefit;
    };
    
    // Individual user benefits
    individualBenefits: {
        swapDiscount?: MembershipBenefit;
        cardActivation?: MembershipBenefit;
        cryptoPayDiscount?: MembershipBenefit;
    };
    
    // Corporate/Business benefits
    corporateBenefits: {
        freeCards?: MembershipBenefit;
        payroll?: MembershipBenefit;
        brandedCards?: MembershipBenefit;
    };
    
    // Other features/unlocks
    other: {
        cardDesign: string;
        additionalFeatures?: string[];
    };
}

export interface MembershipComparison {
    currentTier: MembershipTier;
    availableTiers: MembershipTierData[];
    upgradeRequirements: {
        [key in MembershipTier]?: {
            kycLevel?: number;
            inviteCount?: number;
            paymentAmount?: number;
            isInviteOnly?: boolean;
        };
    };
}

export interface UpgradeOption {
    type: 'invite' | 'payment';
    title: string;
    description: string;
    action: string;
    requirement?: {
        inviteCount?: number;
        completedKyc?: number;
        amount?: number;
    };
}

export type BenefitInfoType =
    | 'crypto_fee'
    | 'referral'
    | 'cashback'
    | 'individual'
    | 'corporate'
    | 'cards'
    | 'payroll'
    | 'branded'
    | 'invite_only';

export interface BenefitInfoModal {
    type: BenefitInfoType;
    title: string;
    description: string;
    icon: string;
    details?: string[];
    secondaryAction?: {
        label: string;
        action: string;
    };
}

// ─── API Response Types ──────────────────────────────────────────────────────
export interface GetMembershipResponse {
    currentTier: MembershipTier;
    membershipData: MembershipComparison;
    upgradeEligibility: {
        canUpgrade: boolean;
        restrictions?: string[];
        nextAvailableTier?: MembershipTier;
    };
}

export interface UpgradeRequest {
    targetTier: MembershipTier;
    method: 'invite' | 'payment';
    paymentMethod?: string;
}

export interface UpgradeResponse {
    success: boolean;
    newTier: MembershipTier;
    message: string;
    requiresPayment?: {
        amount: number;
        currency: string;
        paymentUrl?: string;
    };
}