import React, { useState } from 'react';
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
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const CURRENCY_FLAGS: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
};

function getFlagEmoji(symbol: string): string {
    const code = CURRENCY_FLAGS[symbol] ?? 'US';
    return code.toUpperCase().split('').map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function SendGiftsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);

    const [quantity, setQuantity] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [note, setNote] = useState('');
    const [newUsersOnly, setNewUsersOnly] = useState(false);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);

    const availableBalance = dashboard.data?.assets?.find(
        (a) => a.symbol === selectedCurrency,
    )?.available ?? '0';

    const canContinue = !!quantity && !!totalAmount && parseFloat(totalAmount) > 0;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Send Gifts</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
                        <Text style={styles.balanceHint}>{availableBalance}</Text>
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
                            <Text style={styles.currencyFlag}>{getFlagEmoji(selectedCurrency)}</Text>
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

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
                    onPress={() => {}}
                    activeOpacity={0.7}
                    disabled={!canContinue}
                >
                    <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Currency Picker */}
            <BottomSheet
                visible={currencySheetVisible}
                onClose={() => setCurrencySheetVisible(false)}
                maxHeight="50%"
                showBackButton
            >
                <Text style={styles.sheetTitle}>Currency</Text>
                <View style={styles.currencyList}>
                    {Object.keys(CURRENCY_FLAGS).map((cur) => (
                        <TouchableOpacity
                            key={cur}
                            style={[
                                styles.currencyRow,
                                selectedCurrency === cur && styles.currencyRowSelected,
                            ]}
                            onPress={() => {
                                setSelectedCurrency(cur);
                                setCurrencySheetVisible(false);
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.currencyRowFlag}>{getFlagEmoji(cur)}</Text>
                            <Text style={styles.currencyRowText}>{cur}</Text>
                            {selectedCurrency === cur && (
                                <View style={styles.currencyCheck} />
                            )}
                        </TouchableOpacity>
                    ))}
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
    currencyFlag: {
        fontSize: 16,
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
    currencyList: {
        gap: 8,
    },
    currencyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 13,
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        gap: 12,
    },
    currencyRowSelected: {
        borderWidth: 1.5,
        borderColor: '#01CA47',
    },
    currencyRowFlag: {
        fontSize: 24,
    },
    currencyRowText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    currencyCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#01CA47',
    },
});
