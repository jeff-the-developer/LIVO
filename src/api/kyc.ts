// ─── KYC API Implementation ──────────────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes KYC endpoints
// 
// To switch to real API:
// 1. Uncomment: import apiClient from './client';
// 2. Replace mock implementations with actual API calls
// 3. Update ENV.MOCK_MODE checks as needed
//
// Mock endpoints implemented:
// - GET /kyc/overview (KYC levels and requirements)
// - POST /kyc/start (Start verification process)  
// - GET /kyc/status (Get verification status)
// - POST /kyc/submit-document (Submit document for verification)
// - GET /kyc/countries (Get supported countries list)

import type { ApiResponse } from '@app-types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AccountType = 'individual' | 'corporate';

export interface KYCPrivilege {
    label: string;
    value?: string; // e.g. "100,000 USD/day" or "Unlimited"
    active: boolean;
}

export interface KYCLevelInfo {
    level: number;
    privileges: KYCPrivilege[];
    requirements: string[];
    completed: boolean;
    /** Button label to display */
    action_label: string;
    /** Whether the user can start this KYC level */
    actionable: boolean;
}

export interface KYCOverviewResult {
    current_level: number;
    levels: KYCLevelInfo[];
}

export interface StartKYCPayload {
    account_type: AccountType;
}

export interface StartKYCResult {
    verification_id: string;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected';
    /** URL to redirect user for document upload (e.g. Sumsub, Onfido) */
    verification_url?: string;
}

export interface SubmitDocumentPayload {
    verification_id: string;
    document_type: 'id' | 'passport' | 'business_license' | 'address_proof';
    document_front: string; // base64 image
    document_back?: string; // base64 image for ID cards
}

export interface CountryOption {
    code: string;
    name: string;
    flag: string;
    restricted: boolean;
    kyc_required: boolean;
}

export interface KYCStatusResult {
    level: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected';
    rejection_reason?: string;
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
    { code: 'AI', name: 'Anguilla', flag: '🇦🇮', restricted: false, kyc_required: true },
    { code: 'AQ', name: 'Antarctica', flag: '🇦🇶', restricted: false, kyc_required: false },
    { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', restricted: false, kyc_required: true },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', restricted: false, kyc_required: true },
    { code: 'US', name: 'United States', flag: '🇺🇸', restricted: false, kyc_required: false },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', restricted: false, kyc_required: false },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', restricted: false, kyc_required: false },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', restricted: false, kyc_required: false },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', restricted: false, kyc_required: false },
];

const MOCK_KYC_LEVELS: KYCLevelInfo[] = [
    {
        level: 0,
        privileges: [
            { label: 'Crypto Deposit', active: true },
            { label: 'Redeem Code', active: true },
            { label: 'Quick Receive (Internal)', active: true },
            { label: 'FX Swap', active: true },
            { label: 'Earn (SavingPlus)', active: true },
        ],
        requirements: ['Complete Account Registration'],
        completed: true,
        action_label: 'KYC0 Complete',
        actionable: false,
    },
    {
        level: 1,
        privileges: [
            { label: 'Everything in KYC0', active: true },
            { label: 'Debit/Credit Card Topup', active: true },
            { label: 'ApplePay Topup', active: true },
            { label: 'Debit Card', active: false },
            { label: 'Quick Send (Internal)', value: '100,000 USD/day', active: false },
            { label: 'Crypto Withdrawal', value: '100,000 USD/day', active: false },
            { label: 'Global Fiat Payout', value: '10,000 USD/day', active: false },
        ],
        requirements: [
            'Government-issued ID, or',
            'Business license or registration certificate',
            'Basic Information of individual/enterprise',
        ],
        completed: false,
        action_label: 'Start Verification',
        actionable: true,
    },
    {
        level: 2,
        privileges: [
            { label: 'Everything in KYC0', active: true },
            { label: 'Quick Send (Internal)', value: 'Unlimited', active: false },
            { label: 'Crypto Withdrawal', value: 'Unlimited', active: false },
            { label: 'Global Fiat Payout', value: 'Unlimited', active: false },
        ],
        requirements: [
            'Additional info of individual/enterprise',
            'Address Proof',
            'Source of Wealth/Funds',
        ],
        completed: false,
        action_label: 'Finish KYC1 First',
        actionable: false,
    },
    {
        level: 3,
        privileges: [
            { label: 'Everything in KYC0', active: true },
            { label: 'Trust & Bank Account', active: true },
        ],
        requirements: [
            'Additional info of individual/enterprise',
            'Address Proof',
            'Source of Wealth/Funds',
        ],
        completed: false,
        action_label: 'Finish KYC2 First',
        actionable: false,
    },
];

// ─── Get KYC Overview ─────────────────────────────────────────────────────────
export async function getKYCOverview(): Promise<ApiResponse<KYCOverviewResult>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: {
            current_level: 0,
            levels: MOCK_KYC_LEVELS,
        },
    });
}

// ─── Start KYC Verification ───────────────────────────────────────────────────
export async function startKYC(
    payload: StartKYCPayload,
): Promise<ApiResponse<StartKYCResult>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: {
            verification_id: `kyc-${Date.now()}`,
            status: 'pending',
            verification_url: undefined, // Would be Sumsub/Onfido URL when backend is ready
        },
        message: `KYC verification started for ${payload.account_type} account`,
    });
}

// ─── Get KYC Status ───────────────────────────────────────────────────────────
export async function getKYCStatus(): Promise<ApiResponse<KYCStatusResult>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: {
            level: 0,
            status: 'approved',
        },
    });
}

// ─── Submit Document ──────────────────────────────────────────────────────────
export async function submitDocument(
    payload: SubmitDocumentPayload,
): Promise<ApiResponse<{ submitted: boolean }>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: { submitted: true },
        message: 'Document submitted successfully',
    });
}

// ─── Get Countries List ───────────────────────────────────────────────────────
export async function getCountries(): Promise<ApiResponse<CountryOption[]>> {
    // Always use mock data until backend is ready
    return mockDelay({
        success: true,
        data: MOCK_COUNTRIES,
    });
}
