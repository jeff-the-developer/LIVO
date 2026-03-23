import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Modal,
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
import type { ApiResponse } from '@app-types/api.types';
import type { RecipientSearchResult, TransferResponse } from '@app-types/send.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ui } from '@theme/ui';
import BottomSheet from '@components/common/BottomSheet';
import Button from '@components/common/Button';
import SheetStateBlock from '@components/common/SheetStateBlock';
import ScreenHeader from '@components/common/ScreenHeader';
import SearchBar from '@components/common/SearchBar';
import SlideToConfirm from '@components/common/SlideToConfirm';
import Input from '@components/common/Input';
import SelectField from '@components/forms/SelectField';
import { FlagIcon } from '@components/icons/CurrencyIcons';
import { useSearchRecipients, useDirectTransfer } from '@hooks/api/useSend';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import WalletAssetPickerSheet from '@components/wallet/WalletAssetPickerSheet';
import TransferAmountStep from '@components/send/TransferAmountStep';
import MoneyReceiptSheet, { type MoneyReceiptRow } from '@components/common/MoneyReceiptSheet';
import { handleApiError } from '@utils/errorHandler';
import { formatReceiptDateTime } from '@utils/formatReceipt';
import { hapticLight, hapticSuccess, hapticWarning } from '@utils/haptics';
import ApiErrorSheet from '@components/common/ApiErrorSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Step = 'form' | 'amount';

export default function DirectTransferScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteProp<AppStackParamList, 'DirectTransfer'>>();
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
    /** Explains add-recipient limits + optional path to Invite Friends (no POST /contacts API yet) */
    const [addRecipientInfoVisible, setAddRecipientInfoVisible] = useState(false);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [confirmIdentityVisible, setConfirmIdentityVisible] = useState(false);
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

    // Recipient search (debounced API query; input updates immediately)
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchInputRef = useRef<TextInput>(null);
    const searchResults = useSearchRecipients(debouncedSearch);

    const qrPrefillApplied = useRef(false);
    const currencyPrefillApplied = useRef(false);

    // Apply QR / deep-link prefills once (scanner → Direct Transfer)
    useEffect(() => {
        const p = route.params;
        if (!p || qrPrefillApplied.current) return;
        const hasAny =
            (p.prefillSearchQuery && p.prefillSearchQuery.trim()) ||
            (p.prefillCurrency && p.prefillCurrency.trim()) ||
            (p.prefillAmount && p.prefillAmount.trim()) ||
            (p.prefillNote && p.prefillNote.trim());
        if (!hasAny) return;
        qrPrefillApplied.current = true;

        if (p.prefillNote?.trim()) {
            setNote(p.prefillNote.trim());
        }
        if (p.prefillAmount?.trim()) {
            const amt = p.prefillAmount.trim();
            if (/^\d*\.?\d+$/.test(amt)) {
                const n = parseFloat(amt);
                if (!Number.isNaN(n) && n > 0) {
                    setAmount(amt.replace(/^0+(?=\d)/, '') || amt);
                }
            }
        }
        if (p.prefillSearchQuery?.trim()) {
            const q = p.prefillSearchQuery.trim();
            setSearchInput(q);
            setDebouncedSearch(q);
            setRecipientSheetVisible(true);
        }
    }, [route.params]);

    useEffect(() => {
        if (currencyPrefillApplied.current) return;
        const sym = route.params?.prefillCurrency?.trim();
        if (!sym || !dashboard.data?.assets?.length) return;
        const asset = dashboard.data.assets.find(
            (a) => a.symbol.toUpperCase() === sym.toUpperCase(),
        );
        if (asset) {
            setSelectedCurrency(asset.symbol);
            setSelectedCurrencyName(asset.name);
            currencyPrefillApplied.current = true;
        }
    }, [route.params?.prefillCurrency, dashboard.data?.assets]);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 280);
        return () => clearTimeout(id);
    }, [searchInput]);

    const prevRecipientSheetOpen = useRef(false);
    useEffect(() => {
        // Only clear when the sheet actually closes (not on first mount with visible=false),
        // so QR prefills are not wiped by the same commit as prefill.
        if (prevRecipientSheetOpen.current && !recipientSheetVisible) {
            setSearchInput('');
            setDebouncedSearch('');
        }
        prevRecipientSheetOpen.current = recipientSheetVisible;
    }, [recipientSheetVisible]);

    useEffect(() => {
        if (!recipientSheetVisible) return;
        const raf = requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });
        return () => cancelAnimationFrame(raf);
    }, [recipientSheetVisible]);

    const searchDebouncing = searchInput.trim() !== debouncedSearch;
    const recipients = searchResults.data?.recipients ?? [];
    const showRecipientRows = recipients.length > 0;
    const hasTyped = searchInput.trim().length >= 1;
    const showSearchPending =
        hasTyped &&
        !showRecipientRows &&
        (searchDebouncing || searchResults.isFetching);

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

    const handleAddRecipientPress = useCallback(() => {
        hapticLight();
        setRecipientSheetVisible(false);
        // Let the recipient sheet finish closing before opening the next modal (nested Modal safety)
        setTimeout(() => setAddRecipientInfoVisible(true), 280);
    }, []);

    const handleInviteFriendsFromAddRecipient = useCallback(() => {
        setAddRecipientInfoVisible(false);
        navigation.navigate('InviteFriends');
    }, [navigation]);

    const handleCurrencySelect = useCallback((symbol: string, name: string) => {
        setSelectedCurrency(symbol);
        setSelectedCurrencyName(name);
        setCurrencySheetVisible(false);
    }, []);

    const handleNext = () => {
        if (!recipient) {
            setNoticeSheet({
                title: 'Select recipient',
                message: 'Choose who you are sending money to before continuing.',
                tone: 'warning',
            });
            return;
        }
        if (!selectedCurrency) {
            setNoticeSheet({
                title: 'Select currency',
                message: 'Choose the currency for this transfer.',
                tone: 'warning',
            });
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
                onSuccess: (res: ApiResponse<TransferResponse>) => {
                    hapticSuccess();
                    const d = res.data;
                    const ts = formatReceiptDateTime();
                    const rows: MoneyReceiptRow[] = [
                        { label: 'Recipient', value: `@${recipient.username}` },
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
                        headline: 'Transfer sent',
                        summary: `${d.amount} ${d.currency} to @${recipient.username}`,
                        rows,
                    });
                    setReceiptOpen(true);
                },
                onError: (error: unknown) => {
                    hapticWarning();
                    const e = handleApiError(error);
                    const message = e.retryable
                        ? `${e.message}\n\nCheck your balance and try again.`
                        : e.message;
                    setNoticeSheet({ title: e.title, message, tone: 'error' });
                },
            },
        );
    };

    // ─── Amount Entry Screen ────────────────────────────────────────────────────
    if (step === 'amount') {
        const displayAmount = amount === '0' ? '$0' : `$${amount}`;
        const recipientSummary = recipient
            ? `@${recipient.username}${recipient.name ? ` · ${recipient.name}` : ''}`
            : '—';

        return (
            <>
                <TransferAmountStep
                    title="Direct Transfer"
                    onBackPress={() => setStep('form')}
                    displayAmount={displayAmount}
                    badgeLabel={`${selectedCurrencyName} (${selectedCurrency})`}
                    infoPrimary={`$${availableBalance}`}
                    infoSecondary="Daily Limit: No Limit"
                    onKeyPress={handleNumpadPress}
                    onConfirm={handleSlideConfirm}
                    sliderLabel={parseFloat(amount) > 0 ? 'Slide to confirm' : 'Slide to continue'}
                    confirmationRows={[
                        { label: 'Recipient', value: recipientSummary },
                        { label: 'You send', value: `${amount} ${selectedCurrency}` },
                        ...(note.trim() ? [{ label: 'Note', value: note.trim() }] : []),
                    ]}
                    feeBreakdown={{
                        rows: [
                            { label: 'Service fee', value: `0 ${selectedCurrency}` },
                            { label: 'Recipient receives', value: `${amount} ${selectedCurrency}` },
                        ],
                        footnote:
                            'No LIVO service fee on peer transfers. Your bank or card issuer may charge separate fees.',
                    }}
                    headerCenter={(
                        <TouchableOpacity style={styles.accountSelector} activeOpacity={0.6}>
                            <Text style={styles.accountText}>MySaving (088-001-286534)</Text>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="rgba(0,0,0,0.20)" />
                        </TouchableOpacity>
                    )}
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

    // ─── Form Screen ────────────────────────────────────────────────────────────
    return (
        <>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScreenHeader title="Direct Transfer" onBackPress={() => navigation.goBack()} />

            {/* Form */}
            <View style={styles.form}>
                {/* Recipient */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Recipient</Text>
                        <SelectField
                            value={recipient ? `@${recipient.username}` : undefined}
                            placeholder="Select Recipient"
                            onPress={() => setRecipientSheetVisible(true)}
                            leftAdornment={
                                recipient ? (
                                    <View style={styles.recipientAdornment}>
                                        <Text style={styles.recipientAdornmentText}>
                                            {(recipient.name || recipient.username || '?').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                ) : undefined
                            }
                        />
                </View>

                {/* Currency */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Currency</Text>
                    <SelectField
                        value={selectedCurrency ? `${selectedCurrencyName} (${selectedCurrency})` : undefined}
                        placeholder="Select Currency"
                        onPress={() => setCurrencySheetVisible(true)}
                        leftAdornment={
                            selectedCurrency ? (
                                <FlagIcon code={selectedCurrency} size={ui.selectorIconSm} />
                            ) : undefined
                        }
                    />
                    {selectedCurrency ? (
                        <Text style={styles.fieldSubValue}>Available {availableBalance} {selectedCurrency}</Text>
                    ) : null}
                </View>

                {/* Note */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Note (Optional)</Text>
                    <Input
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add note for both parties"
                        rightAdornment={<HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />}
                    />
                </View>
            </View>

            {/* Next Button */}
            <View style={styles.formFooter}>
                <Button
                    label="Next"
                    onPress={handleNext}
                    disabled={!recipient || !selectedCurrency}
                />
            </View>

            {/* ─── Recipient Search Sheet ──────────────────────────────────── */}
            <BottomSheet
                visible={recipientSheetVisible}
                onClose={() => setRecipientSheetVisible(false)}
                maxHeight="90%"
                sheetHeight="88%"
                showBackButton
                footer={
                    <Button
                        label="Add recipient"
                        onPress={handleAddRecipientPress}
                        accessibilityLabel="Add recipient — learn how paying someone works"
                    />
                }
            >
                <Text style={styles.sheetTitle}>Recipient</Text>

                {/* Search */}
                <SearchBar
                    ref={searchInputRef}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    placeholder="Search username, email, or UID"
                />

                {/* Results (updates as you type; no need to tap keyboard Search) */}
                {showRecipientRows ? (
                    <View style={styles.recipientList}>
                        <Text style={styles.recipientSection}>Results</Text>
                        {recipients.map((r) => (
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
                ) : showSearchPending ? (
                    <View style={styles.emptySearch}>
                        <ActivityIndicator color={colors.textMuted} style={styles.searchSpinner} />
                        <Text style={styles.emptySearchText}>Searching…</Text>
                    </View>
                ) : debouncedSearch.length >= 1 ? (
                    <View style={styles.emptySearch}>
                        <Text style={styles.emptySearchText}>No results found</Text>
                    </View>
                ) : (
                    <View style={styles.emptySearch}>
                        <Text style={styles.emptySearchText}>
                            Start typing — results appear automatically
                        </Text>
                    </View>
                )}
            </BottomSheet>

            <BottomSheet
                visible={addRecipientInfoVisible}
                onClose={() => setAddRecipientInfoVisible(false)}
                maxHeight="72%"
                title="Add recipient"
                showBackButton
                footer={
                    <View style={styles.addRecipientInfoFooter}>
                        <Button label="Invite friends" onPress={handleInviteFriendsFromAddRecipient} />
                        <Button
                            label="Got it"
                            variant="secondary"
                            onPress={() => setAddRecipientInfoVisible(false)}
                        />
                    </View>
                }
            >
                <SheetStateBlock
                    tone="info"
                    title="Add recipient isn't available yet"
                    description={
                        'Saving people to a personal recipient list (or adding someone who isn’t found in search) is not supported in this version of the app. Nothing is created or sent from this screen.\n\n' +
                        'To pay someone who already uses LIVOPay, close this sheet and use the search field above with their username, email, or UID.\n\n' +
                        "If they don't have an account yet, invite them from Invite friends — then you can send using search once they join."
                    }
                />
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

            <WalletAssetPickerSheet
                visible={currencySheetVisible}
                onClose={() => setCurrencySheetVisible(false)}
                title="Currency"
                assets={dashboard.data?.assets ?? []}
                onSelect={handleCurrencySelect}
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

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    recipientAdornment: {
        width: ui.selectorIconSm,
        height: ui.selectorIconSm,
        borderRadius: ui.selectorIconSm / 2,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    recipientAdornmentText: {
        fontSize: Math.max(11, ui.selectorIconSm * 0.45),
        fontWeight: '700',
        color: colors.textPrimary,
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
    addRecipientInfoFooter: {
        width: '100%',
        gap: spacing.sm,
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
    searchSpinner: {
        marginBottom: spacing.sm,
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
