import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowDown01FreeIcons,
    Tick02FreeIcons,
    MoneyReceiveCircleFreeIcons,
    UserCircleFreeIcons,
    MailSend01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import type { ApiResponse } from '@app-types/api.types';
import type { TransferResponse } from '@app-types/send.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import SlideToConfirm from '@components/common/SlideToConfirm';
import Button from '@components/common/Button';
import CountryPicker from '@components/common/CountryPicker';
import ScreenHeader from '@components/common/ScreenHeader';
import SelectField from '@components/forms/SelectField';
import { FlagIcon } from '@components/icons/CurrencyIcons';
import { useBankTransfer } from '@hooks/api/useSend';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import WalletAssetPickerSheet from '@components/wallet/WalletAssetPickerSheet';
import TransferAmountStep from '@components/send/TransferAmountStep';
import { useCountries } from '@hooks/api/useKYC';
import type { CountryOption } from '@api/kyc';
import { ui } from '@theme/ui';
import { handleApiError } from '@utils/errorHandler';
import MoneyReceiptSheet, { type MoneyReceiptRow } from '@components/common/MoneyReceiptSheet';
import { formatReceiptDateTime } from '@utils/formatReceipt';
import { hapticSuccess, hapticWarning } from '@utils/haptics';
import ApiErrorSheet from '@components/common/ApiErrorSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Step = 'method' | 'form' | 'amount';

type TransferMethod = 'account' | 'self' | 'payee';
type PayeeType = 'individual' | 'organization';

interface MethodCard {
    id: TransferMethod;
    title: string;
    subtitle: string;
    icon: typeof MoneyReceiveCircleFreeIcons;
}

const METHODS: MethodCard[] = [
    {
        id: 'account',
        title: 'Account Transfers',
        subtitle: 'Send funds to a local or global bank account',
        icon: MoneyReceiveCircleFreeIcons,
    },
    {
        id: 'self',
        title: 'Self Withdrawal',
        subtitle: 'Transfer money to my own account',
        icon: UserCircleFreeIcons,
    },
    {
        id: 'payee',
        title: 'Send to Registered Payee',
        subtitle: 'Transfer to registered recipient',
        icon: MailSend01FreeIcons,
    },
];

// Crypto symbols that should NOT appear in bank transfer
const CRYPTO_SYMBOLS = new Set(['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX']);

export default function BankTransferScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);
    const bankTransferMutation = useBankTransfer();
    const countriesQuery = useCountries();

    const [step, setStep] = useState<Step>('method');
    const [selectedMethod, setSelectedMethod] = useState<TransferMethod | null>(null);

    // Form state
    const [payeeType, setPayeeType] = useState<PayeeType | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedCountryFlag, setSelectedCountryFlag] = useState('');

    // Amount state
    const [amount, setAmount] = useState('0');

    // Sheet visibility
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [countrySheetVisible, setCountrySheetVisible] = useState(false);
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

    const fiatAssets = dashboard.data?.assets?.filter(
        (a) => !CRYPTO_SYMBOLS.has(a.symbol),
    ) ?? [];

    const availableBalance = fiatAssets.find(
        (a) => a.symbol === selectedCurrency,
    )?.available ?? '0';

    const canContinueForm = !!payeeType && !!selectedCurrency && !!selectedCountry;

    const handleMethodSelect = useCallback((method: TransferMethod) => {
        setSelectedMethod(method);
        setStep('form');
    }, []);

    const handleCurrencySelect = useCallback((cur: string) => {
        setSelectedCurrency(cur);
        setCurrencySheetVisible(false);
    }, []);

    const handleCountrySelect = useCallback((country: CountryOption) => {
        setSelectedCountry(country.name);
        setSelectedCountryCode(country.code);
        setSelectedCountryFlag(country.flag);
        setCountrySheetVisible(false);
    }, []);

    const handleFormContinue = () => {
        if (!canContinueForm) return;
        setStep('amount');
    };

    const handleNumpadPress = (key: string) => {
        if (key === 'back') {
            setAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
        } else if (key === '.') {
            if (!amount.includes('.')) {
                setAmount((prev) => prev + '.');
            }
        } else {
            setAmount((prev) => (prev === '0' ? key : prev + key));
        }
    };

    const handleSlideConfirm = () => {
        if (!selectedCurrency || parseFloat(amount) <= 0) return;

        bankTransferMutation.mutate(
            {
                amount,
                currency: selectedCurrency,
                recipient_bank: selectedCountry,
                swift: selectedMethod ?? '',
                reference: `BANK-${Date.now()}`,
            },
            {
                onSuccess: (res: ApiResponse<TransferResponse>) => {
                    hapticSuccess();
                    const d = res.data;
                    const ts = formatReceiptDateTime();
                    const rows: MoneyReceiptRow[] = [
                        { label: 'Payee country', value: selectedCountry || '—' },
                        { label: 'Amount', value: `${d.amount ?? '—'} ${d.currency ?? ''}`.trim() },
                        { label: 'Fee', value: `${d.fee ?? '—'} ${d.currency ?? ''}`.trim() },
                        { label: 'Status', value: d.status ?? '—' },
                        { label: 'Date', value: ts },
                    ];
                    if (d.reference?.trim()) {
                        rows.push({ label: 'Reference', value: d.reference, mono: true });
                    }
                    if (d.tx_id?.trim()) {
                        rows.push({ label: 'Transaction ID', value: d.tx_id, mono: true });
                    }
                    setReceipt({
                        headline: 'Transfer submitted',
                        summary: `${d.amount} ${d.currency} to ${selectedCountry}`,
                        rows,
                    });
                    setReceiptOpen(true);
                },
                onError: (error: unknown) => {
                    hapticWarning();
                    const e = handleApiError(error);
                    const message = e.retryable
                        ? `${e.message}\n\nCheck amounts and details, then try again.`
                        : e.message;
                    setNoticeSheet({ title: e.title, message, tone: 'error' });
                },
            },
        );
    };

    const handleBack = () => {
        if (step === 'amount') {
            setStep('form');
        } else if (step === 'form') {
            setStep('method');
        } else {
            navigation.goBack();
        }
    };

    // ─── Step 3: Amount Entry ────────────────────────────────────────────────────
    if (step === 'amount') {
        const displayAmount = amount === '0' ? '$0' : `$${amount}`;
        const routeLabel =
            selectedMethod === 'account'
                ? 'Account transfer'
                : selectedMethod === 'self'
                  ? 'Self withdrawal'
                  : selectedMethod === 'payee'
                    ? 'Registered payee'
                    : 'Bank transfer';
        return (
            <>
                <TransferAmountStep
                    title="Transfer"
                    onBackPress={handleBack}
                    displayAmount={displayAmount}
                    badgeLabel={selectedCurrency}
                    infoPrimary={`$${availableBalance}`}
                    infoSecondary="Daily Limit: No Limit"
                    onKeyPress={handleNumpadPress}
                    onConfirm={handleSlideConfirm}
                    sliderLabel={parseFloat(amount) > 0 ? 'Slide to confirm' : 'Slide to continue'}
                    confirmationRows={[
                        { label: 'You send', value: `${amount} ${selectedCurrency}` },
                        { label: 'Payee country', value: selectedCountry },
                        {
                            label: 'Payee type',
                            value:
                                payeeType === 'organization'
                                    ? 'Organization'
                                    : payeeType === 'individual'
                                      ? 'Individual'
                                      : '—',
                        },
                        { label: 'Route', value: routeLabel },
                    ]}
                    feeBreakdown={{
                        rows: [
                            { label: 'LIVO fee', value: `0 ${selectedCurrency}` },
                            { label: 'You authorize', value: `${amount} ${selectedCurrency}` },
                        ],
                        footnote:
                            'Your bank or intermediaries may charge separate wire or FX fees. Final fees appear on your receipt and statement.',
                    }}
                />
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
                            navigation.goBack();
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

    // ─── Step 2: Initiate Transfer Form ──────────────────────────────────────────
    if (step === 'form') {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <ScreenHeader title="Initiate Transfer" onBackPress={handleBack} />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.formScrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Type of Payee */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Type of Payee</Text>
                        <View style={styles.payeeOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.payeeRow,
                                    payeeType === 'individual'
                                        ? styles.payeeRowSelected
                                        : styles.payeeRowUnselected,
                                ]}
                                onPress={() => setPayeeType('individual')}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.payeeText,
                                        payeeType === 'individual'
                                            ? styles.payeeTextSelected
                                            : styles.payeeTextUnselected,
                                    ]}
                                >
                                    Individual
                                </Text>
                                <View
                                    style={[
                                        styles.checkboxBox,
                                        payeeType === 'individual'
                                            ? styles.checkboxBoxSelected
                                            : styles.checkboxBoxUnselected,
                                    ]}
                                >
                                    {payeeType === 'individual' && (
                                        <HugeiconsIcon icon={Tick02FreeIcons} size={16} color="#FFFFFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.payeeRow,
                                    payeeType === 'organization'
                                        ? styles.payeeRowSelected
                                        : styles.payeeRowUnselected,
                                ]}
                                onPress={() => setPayeeType('organization')}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.payeeText,
                                        payeeType === 'organization'
                                            ? styles.payeeTextSelected
                                            : styles.payeeTextUnselected,
                                    ]}
                                >
                                    Organization
                                </Text>
                                <View
                                    style={[
                                        styles.checkboxBox,
                                        payeeType === 'organization'
                                            ? styles.checkboxBoxSelected
                                            : styles.checkboxBoxUnselected,
                                    ]}
                                >
                                    {payeeType === 'organization' && (
                                        <HugeiconsIcon icon={Tick02FreeIcons} size={16} color="#FFFFFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Currency */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Currency</Text>
                        <SelectField
                            style={styles.formDropdown}
                            onPress={() => setCurrencySheetVisible(true)}
                            value={selectedCurrency || undefined}
                            placeholder="Select Receiving Currency"
                            leftAdornment={
                                selectedCurrency ? (
                                    <FlagIcon code={selectedCurrency} size={ui.selectorIconSm} />
                                ) : undefined
                            }
                        />
                    </View>

                    {/* Country */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Country</Text>
                        <SelectField
                            style={[styles.formDropdown, styles.formDropdownCountry]}
                            onPress={() => setCountrySheetVisible(true)}
                            value={selectedCountry || undefined}
                            placeholder="Select Payee Account Country"
                            leftAdornment={
                                selectedCountry ? (
                                    <FlagIcon
                                        code={selectedCountryCode}
                                        size={ui.selectorIconSm}
                                        fallbackEmoji={selectedCountryFlag}
                                    />
                                ) : undefined
                            }
                        />
                    </View>
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.formFooter}>
                    <Button label="Continue" onPress={handleFormContinue} disabled={!canContinueForm} />
                </View>

                {/* Currency Picker Sheet */}
                <WalletAssetPickerSheet
                    visible={currencySheetVisible}
                    onClose={() => setCurrencySheetVisible(false)}
                    title="Currency"
                    assets={fiatAssets}
                    onSelect={(symbol) => handleCurrencySelect(symbol)}
                    emptyTitle="No fiat assets available"
                    emptyDescription="Available fiat balances will appear here once they load."
                />

                {/* Country Picker Sheet */}
                <CountryPicker
                    visible={countrySheetVisible}
                    onClose={() => setCountrySheetVisible(false)}
                    countries={countriesQuery.data ?? []}
                    onSelect={handleCountrySelect}
                    title="Payee country"
                />
            </SafeAreaView>
        );
    }

    // ─── Step 1: Method Selection ────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScreenHeader title="Transfer" onBackPress={() => navigation.goBack()} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.methodScrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cardsContainer}>
                    {METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={styles.methodCard}
                            activeOpacity={0.7}
                            onPress={() => handleMethodSelect(method.id)}
                        >
                            <View style={styles.methodTextWrap}>
                                <Text style={styles.methodTitle}>{method.title}</Text>
                                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                            </View>
                            <View style={styles.methodIconCircle}>
                                <HugeiconsIcon icon={method.icon} size={29} color="#242424" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: {
        width: 36,
        height: 33,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },

    // Shared scroll
    scroll: {
        flex: 1,
    },

    // ─── Step 1: Method Selection ────────────────────────────────────────────────
    methodScrollContent: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: spacing.huge,
    },
    cardsContainer: {
        gap: 10,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        height: 102,
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    methodTextWrap: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    methodSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 18,
        marginTop: 9,
    },
    methodIconCircle: {
        width: 69,
        height: 69,
        borderRadius: 162,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ─── Step 2: Initiate Transfer Form ──────────────────────────────────────────
    formScrollContent: {
        paddingHorizontal: 23,
        paddingTop: 10,
    },
    formGroup: {
        marginBottom: 36,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0,0,0,0.20)',
        lineHeight: 24,
        marginBottom: 10,
    },

    // Payee type
    payeeOptions: {
        gap: 8,
    },
    payeeRow: {
        height: 52,
        borderRadius: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 11,
        paddingVertical: 13,
    },
    payeeRowSelected: {
        borderWidth: 0.5,
        borderColor: '#242424',
    },
    payeeRowUnselected: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    payeeText: {
        fontSize: 18,
        fontWeight: '500',
    },
    payeeTextSelected: {
        color: '#242424',
    },
    payeeTextUnselected: {
        color: '#B2B2B2',
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxBoxSelected: {
        backgroundColor: '#242424',
    },
    checkboxBoxUnselected: {
        borderWidth: 1,
        borderColor: '#959595',
    },

    // Dropdowns
    formDropdown: {
        height: 52,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    formDropdownCountry: {
        borderColor: '#DBDBDB',
    },
    formDropdownPlaceholder: {
        fontSize: 16,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 24,
    },
    formDropdownValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },

    // Continue button
    formFooter: {
        paddingHorizontal: 15,
        paddingBottom: spacing.base,
    },
    continueBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueBtnDisabled: {
        backgroundColor: '#F0F0F0',
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    continueBtnTextDisabled: {
        color: '#B2B2B2',
    },

    // ─── Bottom Sheet shared ─────────────────────────────────────────────────────
    sheetTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#242424',
        lineHeight: 37.5,
        marginBottom: 20,
    },
    sheetList: {
        gap: 8,
    },
    sheetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 13,
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        gap: 12,
    },
    sheetRowSelected: {
        borderWidth: 1.5,
        borderColor: '#01CA47',
    },
    sheetRowFlag: {
        fontSize: 24,
    },
    sheetRowText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    sheetRowCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#01CA47',
    },

    // ─── Step 3: Amount Entry ────────────────────────────────────────────────────
    amountSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    amountDisplay: {
        fontSize: 80,
        fontWeight: '700',
        color: '#242424',
        textAlign: 'center',
        lineHeight: 96,
    },
    currencyBadge: {
        marginTop: 16,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 121,
        backgroundColor: '#F0F0F0',
    },
    currencyBadgeText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 27,
    },
    numpad: {
        paddingHorizontal: 64,
        gap: 42,
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numpadKey: {
        width: 50,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 36,
    },
    amountFooter: {
        paddingHorizontal: 15,
        paddingBottom: spacing.base,
        gap: 12,
    },
    balanceInfoCard: {
        backgroundColor: 'rgba(240, 240, 240, 0.60)',
        borderRadius: 13,
        padding: 10,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: '#434343',
        lineHeight: 21.6,
    },
    dailyLimit: {
        fontSize: 16,
        fontWeight: '500',
        color: '#434343',
        lineHeight: 19.2,
    },
});
