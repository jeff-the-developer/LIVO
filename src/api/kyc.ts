import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';

// ─── Public Types ─────────────────────────────────────────────────────────────
export type AccountType = 'individual' | 'corporate';

export interface KYCPrivilege {
    label: string;
    value?: string;
    active: boolean;
}

/** Normalized from backend tier.status — used for honest gating (not only `completed`). */
export type KYCTierStatus = 'approved' | 'pending' | 'not_started' | 'rejected';

export interface KYCLevelInfo {
    level: number;
    privileges: KYCPrivilege[];
    requirements: string[];
    completed: boolean;
    /** Source-of-truth tier state from API (do not infer only from `completed`) */
    tier_status: KYCTierStatus;
    action_label: string;
    actionable: boolean;
}

export interface KYCOverviewResult {
    current_level: number;
    levels: KYCLevelInfo[];
}

// ─── Submission Payloads & Results ────────────────────────────────────────────
export interface KYCLevel0Payload {
    agreed_terms: true;
}

export interface KYCLevel1IndividualPayload {
    full_name: string;
    nationality: string;
    id_type: 'passport' | 'national_id' | 'drivers_license';
    id_number: string;
    id_front: string;   // file_id from POST /upload
    id_back: string;    // file_id from POST /upload
    selfie: string;     // file_id from POST /upload
}

export interface KYCLevel1CorporatePayload {
    entity_name: string;
    reg_number: string;
    registration_file: string;   // file_id from POST /upload
    date_of_establishment: string;
    main_business: string;
    registered_address: string;
}

export interface KYCLevel2Payload {
    address_proof: string;   // file_id from POST /upload
    source_of_funds: string;
}

export interface KYCLevel3Payload {
    enhanced_docs: string[];       // file_ids from POST /upload
    video_verification?: string;   // file_id (optional)
}

export interface KYCSubmitResult {
    kyc_id: string;
    status: 'pending';
}

/**
 * Derived snapshot for gating + profile UI.
 * - `level`: highest tier that is **approved** (0 if none above reg-only tier).
 * - `status`: KYC **tier 1** lifecycle (identity); not tier-0 registration alone.
 * - `verificationLevel`: which tier to show in banners (next incomplete ≥1, or highest approved).
 */
export interface KYCStatusResult {
    level: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected';
    rejection_reason?: string;
    verificationLevel: number;
}

// Static per-level privilege info (no user context, from GET /kyc/privileges)
export interface KYCTierPrivileges {
    level: number;
    privileges: KYCPrivilege[];
    requirements: string[];
}

export interface CountryOption {
    code: string;
    name: string;
    flag: string;
    restricted: boolean;
    kyc_required: boolean;
}

// ─── Internal Backend Types ───────────────────────────────────────────────────
interface BackendKYCPrivilege {
    id: string;
    name: string;
    limit?: { daily: string };
}

interface BackendKYCTier {
    level: number;
    status: string;   // 'approved' | 'pending' | 'not_started' | 'rejected'
    privileges: BackendKYCPrivilege[];
    requirements: string[];
}

interface BackendKYCStatus {
    current_level: number;
    tiers: BackendKYCTier[];
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────
function formatLimit(daily: string): string {
    const num = parseFloat(daily);
    if (isNaN(num)) return `${daily} USD/day`;
    return `${num.toLocaleString('en-US')} USD/day`;
}

function normalizeTierStatus(raw: string): KYCTierStatus {
    const s = String(raw).toLowerCase().trim();
    if (s === 'approved') return 'approved';
    if (s === 'pending' || s === 'in_review' || s === 'submitted') return 'pending';
    if (s === 'rejected' || s === 'failed') return 'rejected';
    return 'not_started';
}

function mapBackendTiers(tiers: BackendKYCTier[]): KYCLevelInfo[] {
    // Backend sends cumulative privileges — deduplicate to show only what's new at each level.
    const seenIds = new Set<string>();

    return tiers.map((tier, idx) => {
        const tierStatus = normalizeTierStatus(tier.status);
        const isApproved = tierStatus === 'approved';
        const isPending = tierStatus === 'pending';
        const isRejected = tierStatus === 'rejected';
        const prevApproved = idx === 0 || normalizeTierStatus(tiers[idx - 1]?.status ?? '') === 'approved';

        let action_label: string;
        let actionable: boolean;

        if (isApproved) {
            action_label = `KYC${tier.level} Complete`;
            actionable = false;
        } else if (isPending) {
            action_label = 'Under Review';
            actionable = false;
        } else if (isRejected && prevApproved) {
            action_label = 'Retry Verification';
            actionable = true;
        } else if (!isApproved && !isPending && prevApproved) {
            action_label = 'Start Verification';
            actionable = true;
        } else {
            action_label = `Finish KYC${tier.level - 1} First`;
            actionable = false;
        }

        // Only include privileges not already shown at a previous level.
        // Use id+name as the dedup key to handle "Quick Send" vs "Quick Send (Unlimited)".
        const newPrivileges = tier.privileges.filter((p) => {
            const key = `${p.id}:${p.name}`;
            if (seenIds.has(key)) return false;
            seenIds.add(key);
            return true;
        });

        return {
            level: tier.level,
            privileges: newPrivileges.map((p) => ({
                label: p.name,
                value: p.limit ? formatLimit(String(p.limit.daily)) : undefined,
                active: isApproved,
            })),
            requirements: tier.requirements,
            completed: isApproved,
            tier_status: tierStatus,
            action_label,
            actionable,
        };
    });
}

/**
 * Single source of truth for KYC gating from GET /kyc/status overview payload.
 * Never treat tier 0 alone as "KYC approved" for product features that require KYC1.
 */
export function deriveKYCStatusFromOverview(overview: KYCOverviewResult): KYCStatusResult {
    const { levels } = overview;
    const t1 = levels.find((l) => l.level === 1);

    const approvedLevels = levels.filter((l) => l.tier_status === 'approved').map((l) => l.level);
    const highestApproved = approvedLevels.length > 0 ? Math.max(...approvedLevels) : 0;

    let status: KYCStatusResult['status'];
    if (!t1) {
        status = 'in_progress';
    } else if (t1.tier_status === 'approved') {
        status = 'approved';
    } else if (t1.tier_status === 'rejected') {
        status = 'rejected';
    } else if (t1.tier_status === 'pending') {
        status = 'pending';
    } else {
        status = 'in_progress';
    }

    const ordered = [...levels].filter((l) => l.level >= 1).sort((a, b) => a.level - b.level);
    const nextIncomplete = ordered.find((l) => l.tier_status !== 'approved');
    const verificationLevel =
        nextIncomplete?.level ?? (highestApproved > 0 ? highestApproved : 1);

    return {
        level: highestApproved,
        status,
        verificationLevel,
    };
}

// ─── Idempotency key helper ───────────────────────────────────────────────────
function newIdempotencyKey(): string {
    return `kyc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_COUNTRIES: CountryOption[] = [
    { code: 'AF', name: 'Afghanistan (افغانستان)', flag: '🇦🇫', restricted: true, kyc_required: true },
    { code: 'AX', name: 'Åland Islands', flag: '🇦🇽', restricted: false, kyc_required: false },
    { code: 'AL', name: 'Albania (Shqipëri)', flag: '🇦🇱', restricted: true, kyc_required: true },
    { code: 'DZ', name: 'Algeria (الجزائر)', flag: '🇩🇿', restricted: true, kyc_required: true },
    { code: 'AD', name: 'Andorra', flag: '🇦🇩', restricted: false, kyc_required: false },
    { code: 'AO', name: 'Angola', flag: '🇦🇴', restricted: true, kyc_required: true },
    { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', restricted: false, kyc_required: true },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', restricted: false, kyc_required: true },
    { code: 'US', name: 'United States', flag: '🇺🇸', restricted: false, kyc_required: false },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', restricted: false, kyc_required: false },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', restricted: false, kyc_required: false },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', restricted: false, kyc_required: false },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', restricted: false, kyc_required: false },
];

const MOCK_TIERS: BackendKYCTier[] = [
    {
        level: 0,
        status: 'approved',
        privileges: [
            { id: 'crypto_deposit', name: 'Crypto Deposit' },
            { id: 'redeem_code', name: 'Redeem Code' },
            { id: 'quick_receive', name: 'Quick Receive (Internal)' },
            { id: 'fx_swap', name: 'FX Swap' },
            { id: 'earn', name: 'Earn (SavingPlus)' },
        ],
        requirements: ['Complete Account Registration'],
    },
    {
        level: 1,
        status: 'not_started',
        privileges: [
            { id: 'card_topup', name: 'Debit/Credit Card Topup' },
            { id: 'apple_pay', name: 'ApplePay Topup' },
            { id: 'debit_card', name: 'Debit Card' },
            { id: 'quick_send', name: 'Quick Send (Internal)', limit: { daily: '100,000' } },
            { id: 'crypto_withdrawal', name: 'Crypto Withdrawal', limit: { daily: '100,000' } },
            { id: 'global_fiat_payout', name: 'Global Fiat Payout', limit: { daily: '10,000' } },
        ],
        requirements: [
            'Government-issued ID, or',
            'Business license or registration certificate',
            'Basic Information of individual/enterprise',
        ],
    },
    {
        level: 2,
        status: 'not_started',
        privileges: [
            { id: 'quick_send_unlimited', name: 'Quick Send (Internal) Unlimited' },
            { id: 'crypto_unlimited', name: 'Crypto Withdrawal Unlimited' },
            { id: 'fiat_unlimited', name: 'Global Fiat Payout Unlimited' },
        ],
        requirements: [
            'Additional info of individual/enterprise',
            'Address Proof',
            'Source of Wealth/Funds',
        ],
    },
    {
        level: 3,
        status: 'not_started',
        privileges: [
            { id: 'trust_bank', name: 'Trust & Bank Account' },
        ],
        requirements: [
            'Enhanced due diligence documents',
            'Video verification (optional)',
        ],
    },
];

// ─── Get KYC Overview ─────────────────────────────────────────────────────────
export async function getKYCOverview(): Promise<ApiResponse<KYCOverviewResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                current_level: 0,
                levels: mapBackendTiers(MOCK_TIERS),
            },
        });
    }
    const res = await apiClient.get<BackendKYCStatus>('/kyc/status');
    return {
        success: true,
        data: {
            current_level: res.data.current_level,
            levels: mapBackendTiers(res.data.tiers),
        },
    };
}

// ─── Submit KYC Level 0 ───────────────────────────────────────────────────────
export async function submitKYCLevel0(): Promise<ApiResponse<{ level: number; status: string }>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { level: 0, status: 'complete' } });
    }
    const res = await apiClient.post<{ level: number; status: string }>(
        '/kyc/level0',
        { agreed_terms: true },
        { headers: { 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    return { success: true, data: res.data };
}

// ─── Get KYC Status ───────────────────────────────────────────────────────────
/** Same contract as overview-derived status (GET /kyc/status is the backing endpoint for overview). */
export async function getKYCStatus(): Promise<ApiResponse<KYCStatusResult>> {
    const overview = await getKYCOverview();
    return {
        success: overview.success,
        message: overview.message,
        data: deriveKYCStatusFromOverview(overview.data),
    };
}

// ─── Submit KYC Level 1 — Individual ─────────────────────────────────────────
export async function submitKYCLevel1Individual(
    payload: KYCLevel1IndividualPayload,
): Promise<ApiResponse<KYCSubmitResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { kyc_id: `kyc-${Date.now()}`, status: 'pending' } }, 1200);
    }
    const res = await apiClient.post<KYCSubmitResult>(
        '/kyc/level1/individual',
        payload,
        { headers: { 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    return { success: true, data: res.data };
}

// ─── Submit KYC Level 1 — Corporate ──────────────────────────────────────────
export async function submitKYCLevel1Corporate(
    payload: KYCLevel1CorporatePayload,
): Promise<ApiResponse<KYCSubmitResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { kyc_id: `kyc-${Date.now()}`, status: 'pending' } }, 1200);
    }
    const res = await apiClient.post<KYCSubmitResult>(
        '/kyc/level1/corporate',
        payload,
        { headers: { 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    return { success: true, data: res.data };
}

// ─── Submit KYC Level 2 ───────────────────────────────────────────────────────
export async function submitKYCLevel2(
    payload: KYCLevel2Payload,
): Promise<ApiResponse<KYCSubmitResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { kyc_id: `kyc-${Date.now()}`, status: 'pending' } }, 1200);
    }
    const res = await apiClient.post<KYCSubmitResult>(
        '/kyc/level2',
        payload,
        { headers: { 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    return { success: true, data: res.data };
}

// ─── Submit KYC Level 3 ───────────────────────────────────────────────────────
export async function submitKYCLevel3(
    payload: KYCLevel3Payload,
): Promise<ApiResponse<KYCSubmitResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { kyc_id: `kyc-${Date.now()}`, status: 'pending' } }, 1200);
    }
    const res = await apiClient.post<KYCSubmitResult>(
        '/kyc/level3',
        payload,
        { headers: { 'X-Idempotency-Key': newIdempotencyKey() } },
    );
    return { success: true, data: res.data };
}

// ─── Get Countries List ───────────────────────────────────────────────────────
export async function getCountries(): Promise<ApiResponse<CountryOption[]>> {
    return mockDelay({ success: true, data: MOCK_COUNTRIES });
}

// ─── Get KYC Privileges (static, no user context) ────────────────────────────
export async function getKYCPrivileges(): Promise<ApiResponse<KYCTierPrivileges[]>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: MOCK_TIERS.map((tier) => ({
                level: tier.level,
                privileges: tier.privileges.map((p) => ({
                    label: p.name,
                    value: p.limit ? formatLimit(String(p.limit.daily)) : undefined,
                    active: true,
                })),
                requirements: tier.requirements,
            })),
        });
    }

    const res = await apiClient.get<{ tiers: BackendKYCTier[] }>('/kyc/privileges');
    // Backend returns cumulative privileges per tier — deduplicate so each
    // privilege only appears at the level it is first introduced.
    const seenIds = new Set<string>();
    const data: KYCTierPrivileges[] = res.data.tiers.map((tier) => {
        const newPrivileges = tier.privileges.filter((p) => {
            const key = `${p.id}:${p.name}`;
            if (seenIds.has(key)) return false;
            seenIds.add(key);
            return true;
        });
        return {
            level: tier.level,
            privileges: newPrivileges.map((p) => ({
                label: p.name,
                value: p.limit ? formatLimit(String(p.limit.daily)) : undefined,
                active: true,
            })),
            requirements: tier.requirements,
        };
    });

    return { success: true, data };
}
