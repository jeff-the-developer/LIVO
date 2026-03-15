import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
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
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import SlideToConfirm from '@components/common/SlideToConfirm';
import { useBankTransfer } from '@hooks/api/useSend';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';

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

const CURRENCY_FLAGS: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
};

function getFlagEmoji(symbol: string): string {
    const code = CURRENCY_FLAGS[symbol] ?? 'US';
    return code.toUpperCase().split('').map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function BankTransferScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);
    const bankTransferMutation = useBankTransfer();

    const [step, setStep] = useState<Step>('method');
    const [selectedMethod, setSelectedMethod] = useState<TransferMethod | null>(null);

    // Form state
    const [payeeType, setPayeeType] = useState<PayeeType | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');

    // Amount state
    const [amount, setAmount] = useState('0');

    // Sheet visibility
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [countrySheetVisible, setCountrySheetVisible] = useState(false);

    const availableBalance = dashboard.data?.assets?.find(
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

    const handleCountrySelect = useCallback((country: string) => {
        setSelectedCountry(country);
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
                onSuccess: () => {
                    Alert.alert(
                        'Transfer Initiated',
                        `${amount} ${selectedCurrency} transfer submitted.`,
                        [{ text: 'OK', onPress: () => navigation.goBack() }],
                    );
                },
                onError: (error: unknown) => {
                    const message = error instanceof Error ? error.message : 'Something went wrong';
                    Alert.alert('Transfer Failed', message);
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
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Transfer</Text>
                    <View style={styles.backBtn} />
                </View>

                <View style={styles.amountSection}>
                    <Text style={styles.amountDisplay} numberOfLines={1} adjustsFontSizeToFit>
                        {displayAmount}
                    </Text>
                    <View style={styles.currencyBadge}>
                        <Text style={styles.currencyBadgeText}>
                            {getFlagEmoji(selectedCurrency)} {selectedCurrency}
                        </Text>
                    </View>
                </View>

                <View style={styles.numpad}>
                    {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'back']].map((row, ri) => (
                        <View key={ri} style={styles.numpadRow}>
                            {row.map((key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.numpadKey}
                                    onPress={() => handleNumpadPress(key)}
                                    activeOpacity={0.5}
                                >
                                    <Text style={styles.numpadText}>
                                        {key === 'back' ? '<' : key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={styles.amountFooter}>
                    <View style={styles.balanceInfoCard}>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>
                                ${availableBalance}
                            </Text>
                            <Text style={styles.dailyLimit}>Daily Limit: No Limit</Text>
                        </View>
                    </View>
                    <SlideToConfirm
                        onConfirm={handleSlideConfirm}
                        label={parseFloat(amount) > 0 ? 'Slide to confirm' : 'Slide to continue'}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // ─── Step 2: Initiate Transfer Form ──────────────────────────────────────────
    if (step === 'form') {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Initiate Transfer</Text>
                    <View style={styles.backBtn} />
                </View>

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
                        <TouchableOpacity
                            style={styles.formDropdown}
                            onPress={() => setCurrencySheetVisible(true)}
                            activeOpacity={0.6}
                        >
                            <Text
                                style={
                                    selectedCurrency
                                        ? styles.formDropdownValue
                                        : styles.formDropdownPlaceholder
                                }
                            >
                                {selectedCurrency
                                    ? `${getFlagEmoji(selectedCurrency)} ${selectedCurrency}`
                                    : 'Select Receiving Currency'}
                            </Text>
                            <HugeiconsIcon icon={ArrowDown01FreeIcons} size={20} color="#B2B2B2" />
                        </TouchableOpacity>
                    </View>

                    {/* Country */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Country</Text>
                        <TouchableOpacity
                            style={[styles.formDropdown, styles.formDropdownCountry]}
                            onPress={() => setCountrySheetVisible(true)}
                            activeOpacity={0.6}
                        >
                            <Text
                                style={
                                    selectedCountry
                                        ? styles.formDropdownValue
                                        : styles.formDropdownPlaceholder
                                }
                            >
                                {selectedCountry || 'Select Payee Account Country'}
                            </Text>
                            <HugeiconsIcon icon={ArrowDown01FreeIcons} size={20} color="#B2B2B2" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.formFooter}>
                    <TouchableOpacity
                        style={[
                            styles.continueBtn,
                            !canContinueForm && styles.continueBtnDisabled,
                        ]}
                        onPress={handleFormContinue}
                        activeOpacity={0.7}
                        disabled={!canContinueForm}
                    >
                        <Text
                            style={[
                                styles.continueBtnText,
                                !canContinueForm && styles.continueBtnTextDisabled,
                            ]}
                        >
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Currency Picker Sheet */}
                <BottomSheet
                    visible={currencySheetVisible}
                    onClose={() => setCurrencySheetVisible(false)}
                    maxHeight="60%"
                    showBackButton
                >
                    <Text style={styles.sheetTitle}>Currency</Text>
                    <View style={styles.sheetList}>
                        {Object.keys(CURRENCY_FLAGS).map((cur) => (
                            <TouchableOpacity
                                key={cur}
                                style={[
                                    styles.sheetRow,
                                    selectedCurrency === cur && styles.sheetRowSelected,
                                ]}
                                onPress={() => handleCurrencySelect(cur)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.sheetRowFlag}>{getFlagEmoji(cur)}</Text>
                                <Text style={styles.sheetRowText}>{cur}</Text>
                                {selectedCurrency === cur && (
                                    <View style={styles.sheetRowCheck} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </BottomSheet>

                {/* Country Picker Sheet */}
                <BottomSheet
                    visible={countrySheetVisible}
                    onClose={() => setCountrySheetVisible(false)}
                    maxHeight="60%"
                    showBackButton
                >
                    <Text style={styles.sheetTitle}>Country</Text>
                    <View style={styles.sheetList}>
                        {['United States', 'United Kingdom', 'Australia', 'Canada', 'Hong Kong', 'Singapore', 'Japan', 'Switzerland', 'China'].map((country) => (
                            <TouchableOpacity
                                key={country}
                                style={[
                                    styles.sheetRow,
                                    selectedCountry === country && styles.sheetRowSelected,
                                ]}
                                onPress={() => handleCountrySelect(country)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.sheetRowText}>{country}</Text>
                                {selectedCountry === country && (
                                    <View style={styles.sheetRowCheck} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </BottomSheet>
            </SafeAreaView>
        );
    }

    // ─── Step 1: Method Selection ────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer</Text>
                <View style={styles.backBtn} />
            </View>

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
