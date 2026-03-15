import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    Search01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import type { RecipientSearchResult } from '@app-types/send.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import AssetRow from '@components/wallet/AssetRow';
import SlideToConfirm from '@components/common/SlideToConfirm';
import { useSearchRecipients, useDirectTransfer } from '@hooks/api/useSend';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Step = 'form' | 'amount';

const CURRENCY_FLAGS: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
};

function getFlagEmoji(symbol: string): string {
    const code = CURRENCY_FLAGS[symbol] ?? 'US';
    return code.toUpperCase().split('').map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function DirectTransferScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency, formatAmount } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);
    const directTransfer = useDirectTransfer();

    // Form state
    const [step, setStep] = useState<Step>('form');
    const [recipient, setRecipient] = useState<RecipientSearchResult | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedCurrencyName, setSelectedCurrencyName] = useState('');
    const [note, setNote] = useState('');

    // Amount state
    const [amount, setAmount] = useState('0');

    // Sheet visibility
    const [recipientSheetVisible, setRecipientSheetVisible] = useState(false);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [confirmIdentityVisible, setConfirmIdentityVisible] = useState(false);

    // Recipient search
    const [searchQuery, setSearchQuery] = useState('');
    const searchResults = useSearchRecipients(searchQuery);

    const availableBalance = dashboard.data?.assets?.find(
        (a) => a.symbol === selectedCurrency,
    )?.available ?? '0';

    const handleRecipientSelect = useCallback((r: RecipientSearchResult) => {
        setConfirmIdentityVisible(true);
        setRecipientSheetVisible(false);
        setRecipient(r);
    }, []);

    const handleConfirmIdentity = useCallback(() => {
        setConfirmIdentityVisible(false);
    }, []);

    const handleCancelIdentity = useCallback(() => {
        setConfirmIdentityVisible(false);
        setRecipient(null);
    }, []);

    const handleCurrencySelect = useCallback((symbol: string, name: string) => {
        setSelectedCurrency(symbol);
        setSelectedCurrencyName(name);
        setCurrencySheetVisible(false);
    }, []);

    const handleNext = () => {
        if (!recipient) {
            Alert.alert('Select Recipient', 'Please select a recipient first.');
            return;
        }
        if (!selectedCurrency) {
            Alert.alert('Select Currency', 'Please select a currency first.');
            return;
        }
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
        if (!recipient || !selectedCurrency || parseFloat(amount) <= 0) return;

        directTransfer.mutate(
            {
                recipient_id: recipient.id,
                currency: selectedCurrency,
                amount,
                remark: note || undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert('Transfer Sent', `${amount} ${selectedCurrency} sent to @${recipient.username}`, [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                },
                onError: (error: any) => {
                    Alert.alert('Transfer Failed', error?.message || 'Something went wrong');
                },
            },
        );
    };

    // ─── Amount Entry Screen ────────────────────────────────────────────────────
    if (step === 'amount') {
        const displayAmount = amount === '0' ? '$0' : `$${amount}`;
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setStep('form')} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.accountSelector} activeOpacity={0.6}>
                        <Text style={styles.accountText}>MySaving (088-001-286534)</Text>
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="rgba(0,0,0,0.20)" />
                    </TouchableOpacity>
                    <View style={styles.backBtn} />
                </View>

                {/* Amount Display */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountDisplay} numberOfLines={1} adjustsFontSizeToFit>
                        {displayAmount}
                    </Text>
                    <View style={styles.currencyBadge}>
                        <Text style={styles.currencyBadgeText}>
                            {selectedCurrencyName} ({selectedCurrency})
                        </Text>
                    </View>
                </View>

                {/* Numpad */}
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

                {/* Footer */}
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

    // ─── Form Screen ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Direct Transfer</Text>
                <View style={styles.backBtn} />
            </View>

            {/* Form */}
            <View style={styles.form}>
                {/* Recipient */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Recipient</Text>
                    <TouchableOpacity
                        style={styles.fieldDropdown}
                        onPress={() => setRecipientSheetVisible(true)}
                        activeOpacity={0.6}
                    >
                        {recipient ? (
                            <View style={styles.selectedRow}>
                                <Text style={styles.selectedFlag}>
                                    {getFlagEmoji(selectedCurrency || 'USD')}
                                </Text>
                                <Text style={styles.fieldValue}>
                                    @{recipient.username}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.fieldPlaceholder}>Select Recipient</Text>
                        )}
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                    </TouchableOpacity>
                </View>

                {/* Currency */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Currency</Text>
                    <TouchableOpacity
                        style={styles.fieldDropdown}
                        onPress={() => setCurrencySheetVisible(true)}
                        activeOpacity={0.6}
                    >
                        {selectedCurrency ? (
                            <View style={styles.selectedRow}>
                                <Text style={styles.selectedFlag}>
                                    {getFlagEmoji(selectedCurrency)}
                                </Text>
                                <View>
                                    <Text style={styles.fieldValue}>
                                        @{recipient?.username || ''}
                                    </Text>
                                    <Text style={styles.fieldSubValue}>
                                        Available {availableBalance} {selectedCurrency}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.fieldPlaceholder}>Select Currency</Text>
                        )}
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                    </TouchableOpacity>
                </View>

                {/* Note */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Note (Optional)</Text>
                    <TouchableOpacity style={styles.fieldDropdown} activeOpacity={1}>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Add note for both parties"
                            placeholderTextColor="#B2B2B2"
                            value={note}
                            onChangeText={setNote}
                        />
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Next Button */}
            <View style={styles.formFooter}>
                <TouchableOpacity
                    style={[styles.nextBtn, (!recipient || !selectedCurrency) && styles.nextBtnDisabled]}
                    onPress={handleNext}
                    activeOpacity={0.7}
                    disabled={!recipient || !selectedCurrency}
                >
                    <Text style={[styles.nextBtnText, (!recipient || !selectedCurrency) && styles.nextBtnTextDisabled]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ─── Recipient Search Sheet ──────────────────────────────────── */}
            <BottomSheet
                visible={recipientSheetVisible}
                onClose={() => setRecipientSheetVisible(false)}
                maxHeight="85%"
                showBackButton
                footer={
                    <TouchableOpacity style={styles.addRecipientBtn} activeOpacity={0.7}>
                        <Text style={styles.addRecipientText}>Add Recipient</Text>
                    </TouchableOpacity>
                }
            >
                <Text style={styles.sheetTitle}>Recipient</Text>

                {/* Search */}
                <View style={styles.searchBar}>
                    <HugeiconsIcon icon={Search01FreeIcons} size={19} color="rgba(0,0,0,0.20)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search "
                        placeholderTextColor="rgba(0,0,0,0.20)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Results */}
                {searchResults.data?.recipients?.length ? (
                    <View style={styles.recipientList}>
                        <Text style={styles.recipientSection}>Recent</Text>
                        {searchResults.data.recipients.map((r) => (
                            <TouchableOpacity
                                key={r.id}
                                style={styles.recipientRow}
                                onPress={() => handleRecipientSelect(r)}
                                activeOpacity={0.6}
                            >
                                <View style={styles.recipientAvatar}>
                                    <Text style={styles.recipientAvatarText}>
                                        {(r.name || r.username).charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.recipientInfo}>
                                    <Text style={styles.recipientName}>{r.name || r.username}</Text>
                                    <Text style={styles.recipientUsername}>@{r.username}</Text>
                                </View>
                                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : searchQuery.length >= 2 ? (
                    <View style={styles.emptySearch}>
                        <Text style={styles.emptySearchText}>
                            {searchResults.isLoading ? 'Searching...' : 'No results found'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.emptySearch}>
                        <Text style={styles.emptySearchText}>
                            Search by username, email, or UID
                        </Text>
                    </View>
                )}
            </BottomSheet>

            {/* ─── Confirm Identity Modal ─────────────────────────────────── */}
            <Modal
                visible={confirmIdentityVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCancelIdentity}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalInfoSection}>
                            <Text style={styles.modalTitle}>Confirm Identity</Text>
                            <Text style={styles.modalSubtitle}>
                                Transfer cannot be refunded, please confirm that recipient's info is correct
                            </Text>

                            <View style={styles.modalRows}>
                                <View style={styles.modalRow}>
                                    <Text style={styles.modalLabel}>Recipient</Text>
                                    <Text style={styles.modalValue}>@{recipient?.username}</Text>
                                </View>
                                <View style={styles.modalRow}>
                                    <Text style={styles.modalLabel}>UID</Text>
                                    <Text style={styles.modalValue}>{recipient?.id?.slice(0, 10)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <View style={styles.modalDivider} />
                            <TouchableOpacity style={styles.modalActionBtn} onPress={handleConfirmIdentity} activeOpacity={0.7}>
                                <Text style={styles.modalActionText}>Okay</Text>
                            </TouchableOpacity>
                            <View style={styles.modalDivider} />
                            <TouchableOpacity style={styles.modalActionBtn} onPress={handleCancelIdentity} activeOpacity={0.7}>
                                <Text style={styles.modalActionText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ─── Currency Picker Sheet ──────────────────────────────────── */}
            <BottomSheet
                visible={currencySheetVisible}
                onClose={() => setCurrencySheetVisible(false)}
                maxHeight="85%"
                showBackButton
            >
                <Text style={styles.sheetTitle}>Currency</Text>

                <View style={styles.assetList}>
                    {dashboard.data?.assets?.map((asset) => (
                        <AssetRow
                            key={asset.symbol}
                            symbol={asset.symbol}
                            name={asset.name}
                            price={asset.price}
                            change24h={asset.change_24h}
                            balance={asset.balance}
                            usdValue={`${asset.balance} USD`}
                            iconUrl={asset.icon_url}
                            isHidden={false}
                            onPress={() => handleCurrencySelect(asset.symbol, asset.name)}
                        />
                    )) ?? (
                        <View style={styles.emptySearch}>
                            <Text style={styles.emptySearchText}>Loading assets...</Text>
                        </View>
                    )}
                </View>
            </BottomSheet>
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
    // Account selector (amount screen)
    accountSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    accountText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
    },
    // Form
    form: {
        flex: 1,
        paddingHorizontal: 23,
        paddingTop: 10,
    },
    fieldGroup: {
        marginBottom: 25,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        marginBottom: 10,
    },
    fieldDropdown: {
        height: 53,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    fieldPlaceholder: {
        fontSize: 16,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 24,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    fieldSubValue: {
        fontSize: 12,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    selectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    selectedFlag: {
        fontSize: 20,
    },
    noteInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 24,
        paddingVertical: 0,
    },
    // Footer
    formFooter: {
        paddingHorizontal: 15,
        paddingBottom: spacing.base,
    },
    nextBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtnDisabled: {
        backgroundColor: '#E8E8E8',
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        lineHeight: 24,
    },
    nextBtnTextDisabled: {
        color: '#B2B2B2',
    },
    // Sheet title
    sheetTitle: {
        fontSize: 30,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 37.5,
        marginBottom: 19,
    },
    addRecipientBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addRecipientText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        lineHeight: 24,
    },
    // Search bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 37,
        borderRadius: 95,
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        gap: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        paddingVertical: 0,
    },
    // Recipient list
    recipientList: {
        gap: 8,
    },
    recipientSection: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
        marginBottom: 8,
    },
    recipientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 15,
    },
    recipientAvatar: {
        width: 55,
        height: 55,
        borderRadius: 678,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recipientAvatarText: {
        fontSize: 32,
        fontWeight: '400',
        color: '#242424',
    },
    recipientInfo: {
        flex: 1,
    },
    recipientName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    recipientUsername: {
        fontSize: 14,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 21,
    },
    emptySearch: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptySearchText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
    },
    // Asset list
    assetList: {
        gap: 10,
    },
    // Confirm Identity Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    modalCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        overflow: 'hidden',
    },
    modalInfoSection: {
        paddingHorizontal: 24,
        paddingTop: 38,
        paddingBottom: 30,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#242424',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 19,
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    modalRows: {
        width: '100%',
        gap: 24,
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },
    modalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        textAlign: 'right',
    },
    modalActions: {
        alignItems: 'center',
    },
    modalDivider: {
        width: '100%',
        height: 1.5,
        backgroundColor: '#F0F0F0',
    },
    modalActionBtn: {
        paddingVertical: 22,
        alignItems: 'center',
        width: '100%',
    },
    modalActionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 27,
        textAlign: 'center',
    },
    // Amount screen
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
    // Numpad
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
    // Amount footer
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
