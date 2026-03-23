import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Switch,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    InformationCircleFreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import Button from '@components/common/Button';
import SheetStateBlock from '@components/common/SheetStateBlock';
import DetailRow from '@components/common/DetailRow';
import AssetRow from '@components/wallet/AssetRow';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import { hapticLight } from '@utils/haptics';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function SendGiftsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency: displayCurrency } = useDisplaySettings();
    const dashboard = useWalletDashboard(displayCurrency);

    const [quantity, setQuantity] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [note, setNote] = useState('');
    const [newUsersOnly, setNewUsersOnly] = useState(false);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [nextStepsVisible, setNextStepsVisible] = useState(false);

    const selectedAsset = dashboard.data?.assets?.find((a) => a.symbol === selectedCurrency);
    const availableBalance = selectedAsset?.available ?? '0';

    const qtyNum = parseInt(quantity, 10);
    const totalNum = parseFloat(totalAmount);
    const perGift =
        qtyNum > 0 && totalNum > 0 && !Number.isNaN(qtyNum) && !Number.isNaN(totalNum)
            ? (totalNum / qtyNum).toFixed(8)
            : '—';

    const canContinue =
        !!quantity &&
        !!totalAmount &&
        qtyNum >= 1 &&
        totalNum > 0 &&
        !Number.isNaN(qtyNum) &&
        !Number.isNaN(totalNum);

    const handleCurrencySelect = useCallback((symbol: string) => {
        setSelectedCurrency(symbol);
        setCurrencySheetVisible(false);
    }, []);

    const handleContinue = useCallback(() => {
        if (!canContinue) return;
        hapticLight();
        setNextStepsVisible(true);
    }, [canContinue]);

    const closeNextSteps = useCallback(() => {
        setNextStepsVisible(false);
    }, []);

    const goInviteFriends = useCallback(() => {
        setNextStepsVisible(false);
        navigation.navigate('InviteFriends');
    }, [navigation]);

    return (
        <>
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Send Gifts</Text>
                    <View style={styles.backBtn} />
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.noticeBanner}>
                        <HugeiconsIcon icon={InformationCircleFreeIcons} size={18} color={colors.textMuted} />
                        <Text style={styles.noticeText}>
                            Multi-recipient gifts are not available in the app yet. Nothing you enter here is sent or
                            charged — use the steps below when you are ready to invite friends.
                        </Text>
                    </View>

                    {/* Quantity */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Quantity</Text>
                        <View style={styles.fieldInput}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter Quantity"
                                placeholderTextColor="#B2B2B2"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>

                    {/* Total Amount */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabelRow}>
                            <Text style={styles.fieldLabel}>Total Amount</Text>
                            <Text style={styles.balanceHint}>
                                {availableBalance} {selectedCurrency}
                            </Text>
                        </View>
                        <View style={styles.fieldInput}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="00.00"
                                placeholderTextColor="#B2B2B2"
                                value={totalAmount}
                                onChangeText={setTotalAmount}
                                keyboardType="decimal-pad"
                            />
                            <TouchableOpacity
                                style={styles.currencyPicker}
                                onPress={() => setCurrencySheetVisible(true)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.currencyText}>{selectedCurrency}</Text>
                                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={14} color="#242424" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Note */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Note (Optional)</Text>
                        <View style={styles.fieldInput}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Add note for both parties"
                                placeholderTextColor="#B2B2B2"
                                value={note}
                                onChangeText={setNote}
                            />
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* More Settings */}
                    <Text style={styles.sectionTitle}>More Settings</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingLabel}>New Users Only</Text>
                            <HugeiconsIcon icon={InformationCircleFreeIcons} size={16} color="#B2B2B2" />
                        </View>
                        <Switch
                            value={newUsersOnly}
                            onValueChange={setNewUsersOnly}
                            trackColor={{ false: '#E8E8E8', true: '#01CA47' }}
                            thumbColor="white"
                        />
                    </View>
                    <Text style={styles.settingHint}>Earn rewards by inviting new users</Text>
                </ScrollView>

                {/* Continue → next steps (no API) */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
                        onPress={handleContinue}
                        activeOpacity={0.7}
                        disabled={!canContinue}
                    >
                        <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Currency Picker Sheet */}
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
                                onPress={() => handleCurrencySelect(asset.symbol)}
                            />
                        )) ?? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Loading assets...</Text>
                            </View>
                        )}
                    </View>
                </BottomSheet>
            </SafeAreaView>

            <BottomSheet
                visible={nextStepsVisible}
                onClose={closeNextSteps}
                maxHeight="78%"
                title="Gifts"
                showBackButton
                footer={
                    <View style={styles.nextStepsFooter}>
                        <Button label="Invite friends" onPress={goInviteFriends} />
                        <Button label="Got it" variant="secondary" onPress={closeNextSteps} />
                    </View>
                }
            >
                <SheetStateBlock
                    tone="info"
                    title="Sending gifts is not live yet"
                    description={
                        'There is no server endpoint for multi-recipient or pooled gifts in this build. Your draft is for planning only — no funds move.\n\n' +
                        'When gifting launches, you will confirm recipients and payment here. For now, invite friends to join LIVOPay from Invite friends.'
                    }
                />
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Your draft</Text>
                    <DetailRow label="Quantity" value={quantity} />
                    <DetailRow label="Total" value={`${totalAmount} ${selectedCurrency}`} />
                    <DetailRow label="Per gift (preview)" value={`${perGift} ${selectedCurrency}`} />
                    {note.trim() ? <DetailRow label="Note" value={note.trim()} /> : null}
                    <DetailRow
                        label="New users only"
                        value={newUsersOnly ? 'Yes' : 'No'}
                    />
                </View>
            </BottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
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
    noticeBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 13,
        padding: spacing.base,
        marginBottom: spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '400',
        color: colors.textSecondary,
        lineHeight: 19,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
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
    fieldLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    balanceHint: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
    },
    fieldInput: {
        height: 52,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 24,
        paddingVertical: 0,
    },
    currencyPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#F0F0F0',
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
    },
    settingHint: {
        fontSize: 12,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    footer: {
        paddingHorizontal: 23,
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
        color: 'white',
        lineHeight: 24,
    },
    continueBtnTextDisabled: {
        color: '#B2B2B2',
    },
    sheetTitle: {
        fontSize: 30,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 37.5,
        marginBottom: 19,
    },
    assetList: {
        gap: 10,
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#B2B2B2',
    },
    nextStepsFooter: {
        width: '100%',
        gap: spacing.sm,
    },
    summaryCard: {
        marginTop: spacing.md,
        borderRadius: 13,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
    },
});
