import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import AmountInput from '@components/common/AmountInput';
import ScreenHeader from '@components/common/ScreenHeader';
import SlideToConfirm from '@components/common/SlideToConfirm';
import {
    useFiatDepositMethods,
    useSubmitBankDeposit,
    useSubmitCardDeposit,
} from '@hooks/api/useDeposit';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import type { FiatDepositMethod } from '@app-types/deposit.types';
import WalletAssetPickerSheet from '@components/wallet/WalletAssetPickerSheet';
import MoneyReceiptSheet, { type MoneyReceiptRow } from '@components/common/MoneyReceiptSheet';
import { handleApiError } from '@utils/errorHandler';
import { formatReceiptDateTime } from '@utils/formatReceipt';
import { hapticSuccess, hapticWarning } from '@utils/haptics';
import type { FiatDepositResponse } from '@app-types/deposit.types';
import ApiErrorSheet from '@components/common/ApiErrorSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'AddFunds'>;

// ─── Flag fallback for inline currency tag ────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
    USD: '🇺🇸', HKD: '🇭🇰', EUR: '🇪🇺', GBP: '🇬🇧',
    SGD: '🇸🇬', AUD: '🇦🇺', CNY: '🇨🇳', JPY: '🇯🇵',
};

function fmt(n: number): string {
    return n.toFixed(2);
}

export default function AddFundsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { source, currency: initialCurrency, bankDetails, cardToken } = route.params;
    const { currency: displayCurrency } = useDisplaySettings();
    const dashboard = useWalletDashboard(displayCurrency);

    const [amountText, setAmountText] = useState('');
    const [currency, setCurrency] = useState(initialCurrency ?? 'USD');
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receipt, setReceipt] = useState<{
        headline: string;
        summary?: string;
        rows: MoneyReceiptRow[];
    } | null>(null);
    const [noticeSheet, setNoticeSheet] = useState<{
        title: string;
        message: string;
        tone: 'error' | 'warning' | 'info';
    } | null>(null);

    const buildDepositReceipt = useCallback((data: FiatDepositResponse, headline: string, summary?: string) => {
        const ts = formatReceiptDateTime();
        const rows: MoneyReceiptRow[] = [
            { label: 'Amount', value: `${data.amount ?? '—'} ${data.currency ?? ''}`.trim() },
            { label: 'Status', value: data.status ?? '—' },
            { label: 'Date', value: ts },
        ];
        if (data.reference?.trim()) {
            rows.push({ label: 'Reference', value: data.reference, mono: true });
        }
        if (data.tx_id?.trim()) {
            rows.push({ label: 'Transaction ID', value: data.tx_id, mono: true });
        }
        const inst = data.instructions;
        if (inst) {
            if (inst.bank_name?.trim()) {
                rows.push({ label: 'Bank', value: inst.bank_name });
            }
            if (inst.account_number?.trim()) {
                rows.push({ label: 'Account', value: inst.account_number, mono: true });
            }
            if (inst.routing_number?.trim()) {
                rows.push({ label: 'Routing', value: inst.routing_number, mono: true });
            }
            if (inst.reference_code?.trim()) {
                rows.push({ label: 'Payment memo', value: inst.reference_code, mono: true });
            }
            if (inst.note?.trim()) {
                rows.push({ label: 'Instructions', value: inst.note, valueNumberOfLines: 10 });
            }
        }
        setReceipt({ headline, summary, rows });
        setReceiptOpen(true);
        hapticSuccess();
    }, []);

    const methodsQuery = useFiatDepositMethods();
    const bankMutation = useSubmitBankDeposit();
    const cardMutation = useSubmitCardDeposit();

    const isLoading = bankMutation.isPending || cardMutation.isPending;
    const isApplePay = source === 'apple_pay';

    // ─── Get method config from API ───────────────────────────────────────────
    const methodId = source === 'bank_transfer' ? 'bank_transfer' : 'card_deposit';
    const methodConfig: FiatDepositMethod | undefined = methodsQuery.data?.find(
        (m) => m.id === methodId,
    );

    const maxAmount = parseFloat(methodConfig?.max_amount ?? '2000');
    const platformFeeRate = parseFloat(methodConfig?.fee ?? '0');
    const amount = parseFloat(amountText) || 0;

    // ─── Fee calculation ──────────────────────────────────────────────────────
    const preAuthFee = 0.5;
    const platformFee = 0.21;
    const applePayFee = isApplePay ? parseFloat(fmt(amount * 0.03)) : 0;
    const cardFee = source === 'credit_debit' && platformFeeRate > 0
        ? parseFloat(fmt(amount * (platformFeeRate / 100)))
        : 0;
    const totalFee = parseFloat(fmt(preAuthFee + platformFee + applePayFee + cardFee));
    const total = parseFloat(fmt(amount + preAuthFee));
    const totalPayment = parseFloat(fmt(amount + totalFee));

    // Progress bar
    const progressPct = Math.min(amount / maxAmount, 1);
    const limitRemaining = Math.max(maxAmount - amount, 0);

    const selectedAsset = dashboard.data?.assets?.find((a) => a.symbol === currency);
    const selectedCurrencyName = selectedAsset?.name ?? currency;
    const canConfirm = amount > 0 && amount <= maxAmount && !isLoading;

    const handleCurrencySelect = useCallback((code: string) => {
        setCurrency(code);
        setCurrencySheetVisible(false);
    }, []);

    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        setAmountText(cleaned);
    };

    const handleConfirm = () => {
        if (!canConfirm) return;

        if (isApplePay) {
            hapticWarning();
            setNoticeSheet({
                title: 'Apple Pay',
                message: 'Apple Pay deposits are not available yet. Use bank transfer or card to add funds.',
                tone: 'info',
            });
            return;
        }

        if (source === 'bank_transfer') {
            bankMutation.mutate(
                {
                    amount: fmt(amount),
                    currency,
                    bank_details: bankDetails ?? '',
                },
                {
                    onSuccess: (res) => {
                        buildDepositReceipt(
                            res.data,
                            'Deposit initiated',
                            `${res.data.amount} ${res.data.currency} — follow the wire instructions to complete.`,
                        );
                    },
                    onError: (error: unknown) => {
                        hapticWarning();
                        const e = handleApiError(error);
                        setNoticeSheet({ title: e.title, message: e.message, tone: 'error' });
                    },
                },
            );
            return;
        }

        if (source === 'credit_debit') {
            cardMutation.mutate(
                {
                    amount: fmt(amount),
                    currency,
                    card_token: cardToken ?? '',
                },
                {
                    onSuccess: (res) => {
                        buildDepositReceipt(
                            res.data,
                            'Deposit submitted',
                            `${res.data.amount} ${res.data.currency} — status ${res.data.status}.`,
                        );
                    },
                    onError: (error: unknown) => {
                        hapticWarning();
                        const e = handleApiError(error);
                        setNoticeSheet({ title: e.title, message: e.message, tone: 'error' });
                    },
                },
            );
        }
    };

    return (
        <>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScreenHeader title="Add Funds" onBackPress={() => navigation.goBack()} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ─── Amount ───────────────────────────────────────── */}
                <View style={styles.section}>
                    <Text style={styles.label}>Amount</Text>
                    <AmountInput
                        value={amountText}
                        onChangeText={handleAmountChange}
                        currencyLabel={`${FLAG_MAP[currency] ?? '🌐'} ${currency}`}
                        onPressCurrency={() => setCurrencySheetVisible(true)}
                    />
                    <View style={styles.limitCard}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPct * 100}%` }]} />
                        </View>
                        <View style={styles.limitRow}>
                            <Text style={styles.limitText}>
                                Daily Limit: {maxAmount.toLocaleString()}{currency}
                            </Text>
                            <Text style={styles.limitText}>
                                Limit Remaining: {limitRemaining.toLocaleString()}{currency}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ─── Currency ─────────────────────────────────────── */}
                <View style={styles.section}>
                    <Text style={styles.label}>Currency</Text>
                    <TouchableOpacity
                        style={styles.currencyDropdown}
                        activeOpacity={0.7}
                        onPress={() => setCurrencySheetVisible(true)}
                    >
                        <Text style={[styles.currencyDropdownText, !!currency && { color: '#242424' }]}>
                            {currency ? `${selectedCurrencyName} (${currency})` : 'Please select'}
                        </Text>
                        <HugeiconsIcon
                            icon={ArrowRight01FreeIcons}
                            size={18}
                            color="#B2B2B2"
                            style={{ transform: [{ rotate: '90deg' }] }}
                        />
                    </TouchableOpacity>
                    <Text style={styles.helperText}>
                        Match the card currency to avoid extra FX fees
                    </Text>
                </View>

                {/* ─── Fee Breakdown ────────────────────────────────── */}
                <View style={styles.feeTable}>
                    <FeeRow label="Pre-authorization Fee" value={`${fmt(preAuthFee)} ${currency}`} />
                    <FeeRow label="Rate(30s)" value={`1 ${currency} = 1.00000 ${currency}`} />
                    <FeeRow label="Total" value={`${fmt(total)} ${currency}`} />
                    {isApplePay && (
                        <FeeRow label="Apple Pay Fee" value={`${fmt(applePayFee)} ${currency}`} />
                    )}
                    {source === 'credit_debit' && cardFee > 0 && (
                        <FeeRow label="Card Fee" value={`${fmt(cardFee)} ${currency}`} />
                    )}
                    <FeeRow label="Platform Fee" value={`${fmt(platformFee)} ${currency}`} />
                    <FeeRow label="Total Fee" value={`${fmt(totalFee)} ${currency}`} />
                    <View style={styles.feeRowTotal}>
                        <Text style={styles.feeLabelTotal}>Total Payment</Text>
                        <Text style={styles.feeValueTotal}>{fmt(totalPayment)} {currency}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* ─── Slide to confirm ─────────────────────────────────── */}
            <View style={[styles.bottomBar, (!canConfirm && !isLoading) && styles.bottomBarDisabled]}>
                {isLoading ? (
                    <View style={styles.loadingBar}>
                        <ActivityIndicator color="#FFFFFF" />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                ) : (
                    <SlideToConfirm onConfirm={handleConfirm} label="Slide to confirm" />
                )}
            </View>

            <WalletAssetPickerSheet
                visible={currencySheetVisible}
                onClose={() => setCurrencySheetVisible(false)}
                title="Currency"
                assets={dashboard.data?.assets ?? []}
                onSelect={(code) => handleCurrencySelect(code)}
                emptyTitle="Loading assets"
                emptyDescription="Available wallet assets will appear here shortly."
            />
        </SafeAreaView>
            {receipt ? (
                <MoneyReceiptSheet
                    visible={receiptOpen}
                    onClose={() => setReceiptOpen(false)}
                    headline={receipt.headline}
                    summary={receipt.summary}
                    rows={receipt.rows}
                    onDone={() => {
                        setReceiptOpen(false);
                        setReceipt(null);
                        navigation.popToTop();
                    }}
                />
            ) : null}
            <ApiErrorSheet
                visible={noticeSheet !== null}
                onClose={() => setNoticeSheet(null)}
                title={noticeSheet?.title ?? ''}
                message={noticeSheet?.message ?? ''}
                tone={noticeSheet?.tone === 'warning' ? 'warning' : noticeSheet?.tone === 'info' ? 'info' : 'error'}
            />
        </>
    );
}

function FeeRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{label}</Text>
            <Text style={styles.feeValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
        gap: 30,
    },
    section: { gap: 10 },
    label: { fontSize: 16, fontWeight: '600', color: '#686868', lineHeight: 24 },
    amountField: {
        height: 53,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#969696',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 8,
    },
    amountInput: { flex: 1, fontSize: 16, fontWeight: '400', color: '#242424', height: '100%' },
    currencyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
    currencyFlag: { fontSize: 16 },
    currencyCode: { fontSize: 16, fontWeight: '500', color: '#242424' },
    limitCard: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        padding: 10,
        gap: 8,
    },
    progressBarBg: { height: 6, borderRadius: 13, backgroundColor: '#F0F0F0', overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 13, backgroundColor: '#01CA47' },
    limitRow: { flexDirection: 'row', justifyContent: 'space-between' },
    limitText: { fontSize: 12, fontWeight: '500', color: '#686868', lineHeight: 18 },
    currencyDropdown: {
        height: 52,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    currencyDropdownText: { fontSize: 16, fontWeight: '400', color: '#B2B2B2', lineHeight: 24 },
    helperText: { fontSize: 12, fontWeight: '500', color: '#B2B2B2', lineHeight: 18 },
    feeTable: { gap: 16 },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    feeLabel: { fontSize: 16, fontWeight: '400', color: '#686868', lineHeight: 24 },
    feeValue: { fontSize: 16, fontWeight: '400', color: '#686868', lineHeight: 24, textAlign: 'right' },
    feeRowTotal: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4,
    },
    feeLabelTotal: { fontSize: 16, fontWeight: '600', color: '#686868', lineHeight: 24 },
    feeValueTotal: { fontSize: 16, fontWeight: '600', color: '#686868', lineHeight: 24, textAlign: 'right' },
    bottomBar: {
        paddingHorizontal: 15,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    bottomBarDisabled: { opacity: 0.5 },
    loadingBar: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    loadingText: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
    sheetTitle: {
        fontSize: 30, fontWeight: '700', color: '#242424', lineHeight: 37.5, marginBottom: 20,
    },
    sheetList: { gap: 10 },
    emptyState: { paddingVertical: 40, alignItems: 'center' },
    emptyStateText: { fontSize: 14, color: '#B2B2B2' },
});
