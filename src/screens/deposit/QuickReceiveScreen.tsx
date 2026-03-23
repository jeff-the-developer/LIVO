import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    Copy01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useAuthStore } from '@stores/authStore';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import QRCardWithLogo from '@components/common/QRCardWithLogo';
import ShareQRModal from '@components/common/ShareQRModal';
import AssetRow from '@components/wallet/AssetRow';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function QuickReceiveScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);

    const username = user?.username || 'user';
    const uid = user?.svid || user?.user_id?.slice(0, 12) || '';

    // Settings state
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

    // Share overlay state
    const [shareVisible, setShareVisible] = useState(false);

    // QR data encodes user info + optional payment request
    const qrData = JSON.stringify({
        type: 'livo_receive',
        user_id: user?.user_id,
        username,
        uid,
        ...(selectedCurrency && { currency: selectedCurrency }),
        ...(amount && { amount }),
        ...(note && { note }),
    });

    const handleCopyUsername = useCallback(async () => {
        await Clipboard.setStringAsync(`@${username}`);
    }, [username]);

    const handleCopyUid = useCallback(async () => {
        await Clipboard.setStringAsync(uid);
    }, [uid]);

    const handleCurrencySelect = useCallback((symbol: string) => {
        setSelectedCurrency(symbol);
        setCurrencyPickerVisible(false);
    }, []);

    const handleSettingsConfirm = useCallback(() => {
        setSettingsVisible(false);
    }, []);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quick Receive</Text>
                <View style={styles.backBtn} />
            </View>

            {/* Content column: QR + cards (matches Figma frame-6: gap 29) */}
            <View style={styles.contentColumn}>
                {/* QR Code */}
                <QRCardWithLogo value={qrData} size={280} containerSize={373} />

                {/* Cards column (matches Figma frame-7: gap 7) */}
                <View style={styles.cardsColumn}>
                    {/* Username Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardContent}>
                            <View style={styles.infoCardHeader}>
                                <Text style={styles.infoCardLabel}>Username</Text>
                                <TouchableOpacity onPress={handleCopyUsername} activeOpacity={0.6}>
                                    <HugeiconsIcon icon={Copy01FreeIcons} size={24} color="#242424" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.infoCardValue}>@{username}</Text>
                        </View>
                    </View>

                    {/* UID Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardContent}>
                            <View style={styles.infoCardHeader}>
                                <Text style={styles.infoCardLabel}>UID</Text>
                                <TouchableOpacity onPress={handleCopyUid} activeOpacity={0.6}>
                                    <HugeiconsIcon icon={Copy01FreeIcons} size={24} color="#242424" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.infoCardValue}>{uid}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => setSettingsVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.settingsBtnText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => setShareVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.shareBtnText}>Share QR code</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Share QR Overlay Modal ─────────────────────────────── */}
            <ShareQRModal
                visible={shareVisible}
                onClose={() => setShareVisible(false)}
                qrValue={qrData}
                title="Scan QR CODE & Pay"
                subtitle={`UID: ${uid}`}
                shareText={`Send me money on LIVOPay!\n\nUsername: @${username}\nUID: ${uid}`}
                copyLink={`https://livopay.com/pay/@${username}`}
            />

            {/* ─── Settings Bottom Sheet ──────────────────────────────── */}
            <BottomSheet
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                maxHeight="85%"
                showBackButton
                footer={
                    <TouchableOpacity
                        style={[styles.confirmBtn, !selectedCurrency && styles.confirmBtnDisabled]}
                        onPress={handleSettingsConfirm}
                        activeOpacity={0.7}
                        disabled={!selectedCurrency}
                    >
                        <Text style={[styles.confirmBtnText, !selectedCurrency && styles.confirmBtnTextDisabled]}>
                            Confirm
                        </Text>
                    </TouchableOpacity>
                }
                overlays={
                    <BottomSheet
                        visible={currencyPickerVisible}
                        onClose={() => setCurrencyPickerVisible(false)}
                        maxHeight="70%"
                        showBackButton
                        isOverlay
                    >
                        <Text style={styles.pickerTitle}>Currency</Text>
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
                            ))}
                        </View>
                    </BottomSheet>
                }
            >
                {/* Settings Icon + Title */}
                <View style={styles.settingsHeader}>
                    <View style={styles.settingsIconCircle}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </View>
                    <Text style={styles.settingsTitle}>Settings</Text>
                </View>

                {/* Currency */}
                <View style={styles.settingsField}>
                    <Text style={styles.settingsLabel}>Currency</Text>
                    <TouchableOpacity
                        style={styles.settingsDropdown}
                        onPress={() => setCurrencyPickerVisible(true)}
                        activeOpacity={0.6}
                    >
                        {selectedCurrency ? (
                            <Text style={styles.settingsDropdownValue}>{selectedCurrency}</Text>
                        ) : (
                            <Text style={styles.settingsDropdownPlaceholder}>Select</Text>
                        )}
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                    </TouchableOpacity>
                </View>

                {/* Amount */}
                <View style={styles.settingsField}>
                    <Text style={styles.settingsLabel}>Amount</Text>
                    <View style={styles.settingsInput}>
                        <TextInput
                            style={styles.settingsInputText}
                            placeholder="Enter Amount"
                            placeholderTextColor="#B2B2B2"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Note */}
                <View style={styles.settingsField}>
                    <Text style={styles.settingsLabel}>Note (Optional)</Text>
                    <View style={styles.settingsInput}>
                        <TextInput
                            style={styles.settingsInputText}
                            placeholder="Enter Only Visible to Both Parties"
                            placeholderTextColor="#B2B2B2"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>
                </View>
            </BottomSheet>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: { width: 36, height: 33, justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#242424', lineHeight: 24 },
    // Content column (Figma: frame-6, left 16, top 134, width 398, gap 29)
    contentColumn: {
        flex: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 29,
    },
    // Cards column (Figma: frame-7, gap 7, width 100%)
    cardsColumn: {
        width: '100%',
        gap: 7,
    },
    // Info Cards
    infoCard: {
        width: '100%',
        height: 84,
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
    },
    infoCardContent: { gap: 6 },
    infoCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoCardLabel: { fontSize: 16, fontWeight: '600', color: '#242424', lineHeight: 24 },
    infoCardValue: { fontSize: 16, fontWeight: '400', color: '#242424', lineHeight: 24 },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 34,
        gap: 14,
    },
    settingsBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsBtnText: { fontSize: 16, fontWeight: '500', color: 'white', lineHeight: 24 },
    shareBtn: {
        height: 52,
        borderRadius: 521,
        borderWidth: 1,
        borderColor: '#F4F4F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareBtnText: { fontSize: 16, fontWeight: '500', color: '#242424', lineHeight: 24 },

    // Settings Sheet
    settingsHeader: { gap: 19, marginBottom: 20 },
    settingsIconCircle: {
        width: 70,
        height: 70,
        borderRadius: 563,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsTitle: { fontSize: 30, fontWeight: '600', color: '#242424', lineHeight: 37.5 },
    settingsField: { gap: 10, marginBottom: 27 },
    settingsLabel: { fontSize: 16, fontWeight: '600', color: 'rgba(0,0,0,0.20)', lineHeight: 24 },
    settingsDropdown: {
        height: 52,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    settingsDropdownPlaceholder: { fontSize: 16, fontWeight: '400', color: '#B2B2B2', lineHeight: 24 },
    settingsDropdownValue: { fontSize: 16, fontWeight: '400', color: '#242424', lineHeight: 24 },
    settingsInput: {
        height: 53,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#DBDBDB',
        paddingHorizontal: 15,
        justifyContent: 'center',
    },
    settingsInputText: { fontSize: 16, fontWeight: '400', color: '#242424', lineHeight: 24 },
    confirmBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnDisabled: { backgroundColor: '#F0F0F0' },
    confirmBtnText: { fontSize: 16, fontWeight: '500', color: 'white', lineHeight: 24 },
    confirmBtnTextDisabled: { color: '#B2B2B2' },
    pickerTitle: { fontSize: 30, fontWeight: '600', color: '#242424', lineHeight: 37.5, marginBottom: 19 },
    assetList: { gap: 10 },
});
