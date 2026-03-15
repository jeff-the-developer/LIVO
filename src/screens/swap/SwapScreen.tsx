import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    SquareLock02FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import AssetRow from '@components/wallet/AssetRow';
import { useSwapQuote, useSwapRate, useExecuteSwap } from '@hooks/api/useSwap';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const CURRENCY_FLAGS: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
    USDT: 'US', BTC: 'BT', ETH: 'ET',
};

function getFlagEmoji(symbol: string): string {
    const code = CURRENCY_FLAGS[symbol] ?? 'US';
    return code.toUpperCase().split('').map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function SwapScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);
    const executeSwap = useExecuteSwap();

    // Currency state
    const [fromCurrency, setFromCurrency] = useState('USDT');
    const [fromCurrencyName, setFromCurrencyName] = useState('Tether');
    const [toCurrency, setToCurrency] = useState('USD');
    const [toCurrencyName, setToCurrencyName] = useState('US Dollar');

    // Amount state
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');

    // Picker state
    const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);

    // Hooks for rate and quote
    const swapRate = useSwapRate(fromCurrency, toCurrency);
    const swapQuote = useSwapQuote(
        fromCurrency,
        toCurrency,
        fromAmount,
    );

    // Update toAmount when quote returns
    useEffect(() => {
        if (swapQuote.data?.to_amount) {
            setToAmount(swapQuote.data.to_amount);
        } else if (!fromAmount || parseFloat(fromAmount) <= 0) {
            setToAmount('');
        }
    }, [swapQuote.data, fromAmount]);

    const fromBalance = dashboard.data?.assets?.find(
        (a) => a.symbol === fromCurrency,
    )?.available ?? '0.00';

    const toBalance = dashboard.data?.assets?.find(
        (a) => a.symbol === toCurrency,
    )?.available ?? '0.00';

    const handleSwapDirection = useCallback(() => {
        setFromCurrency(toCurrency);
        setFromCurrencyName(toCurrencyName);
        setToCurrency(fromCurrency);
        setToCurrencyName(fromCurrencyName);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    }, [fromCurrency, fromCurrencyName, toCurrency, toCurrencyName, fromAmount, toAmount]);

    const handleCurrencySelect = useCallback((symbol: string, name: string) => {
        if (activePicker === 'from') {
            if (symbol === toCurrency) {
                handleSwapDirection();
            } else {
                setFromCurrency(symbol);
                setFromCurrencyName(name);
            }
        } else if (activePicker === 'to') {
            if (symbol === fromCurrency) {
                handleSwapDirection();
            } else {
                setToCurrency(symbol);
                setToCurrencyName(name);
            }
        }
        setActivePicker(null);
    }, [activePicker, fromCurrency, toCurrency, handleSwapDirection]);

    const handleMaxPress = useCallback(() => {
        setFromAmount(fromBalance);
    }, [fromBalance]);

    const handleFromAmountChange = useCallback((text: string) => {
        // Allow only numbers and a single decimal point
        const cleaned = text.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) return;
        if (parts[1] && parts[1].length > 2) return;
        setFromAmount(cleaned);
    }, []);

    const handleToAmountChange = useCallback((text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) return;
        if (parts[1] && parts[1].length > 2) return;
        setToAmount(cleaned);
    }, []);

    const canSwap = fromAmount.length > 0 && parseFloat(fromAmount) > 0;

    const handleSwap = useCallback(() => {
        if (!canSwap) return;

        executeSwap.mutate(
            {
                from_currency: fromCurrency,
                to_currency: toCurrency,
                amount: fromAmount,
            },
            {
                onSuccess: (res) => {
                    Alert.alert(
                        'Swap Successful',
                        `Swapped ${res.data.from_amount} ${res.data.from_currency} to ${res.data.to_amount} ${res.data.to_currency}`,
                        [{ text: 'OK', onPress: () => navigation.goBack() }],
                    );
                },
                onError: (error: any) => {
                    Alert.alert('Swap Failed', error?.message || 'Something went wrong');
                },
            },
        );
    }, [canSwap, fromCurrency, toCurrency, fromAmount, executeSwap, navigation]);

    const rateDisplay = swapRate.data?.rate
        ? `1 ${fromCurrency} = ${swapRate.data.rate} ${toCurrency}`
        : `1 ${fromCurrency} = -- ${toCurrency}`;

    const minSell = swapQuote.data?.min_amount ?? '10';
    const maxSell = swapQuote.data?.max_amount ?? '10';

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>FX Swap</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* From Currency Card */}
                <View style={styles.currencyCard}>
                    <View style={styles.cardTopRow}>
                        <Text style={styles.currencyNameText}>{fromCurrencyName}</Text>
                        <TouchableOpacity
                            style={styles.currencySelector}
                            onPress={() => setActivePicker('from')}
                            activeOpacity={0.6}
                        >
                            <View style={styles.flagCircle}>
                                <Text style={styles.flagEmoji}>{getFlagEmoji(fromCurrency)}</Text>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={20} color="#B2B2B2" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.amountInput}
                        value={fromAmount}
                        onChangeText={handleFromAmountChange}
                        placeholder="0.00"
                        placeholderTextColor="#B2B2B2"
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                    />

                    <View style={styles.cardBottomRow}>
                        <View style={styles.balanceRow}>
                            <HugeiconsIcon icon={SquareLock02FreeIcons} size={14} color="#B2B2B2" />
                            <Text style={styles.balanceText}>{fromBalance}</Text>
                        </View>
                        <TouchableOpacity onPress={handleMaxPress} activeOpacity={0.6}>
                            <Text style={styles.maxText}>Max</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Swap Direction Button */}
                <View style={styles.swapBtnContainer}>
                    <TouchableOpacity
                        style={styles.swapBtn}
                        onPress={handleSwapDirection}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.swapBtnIcon}>{'\u2195'}</Text>
                    </TouchableOpacity>
                </View>

                {/* To Currency Card */}
                <View style={styles.currencyCard}>
                    <View style={styles.cardTopRow}>
                        <Text style={styles.currencyNameText}>{toCurrencyName}</Text>
                        <TouchableOpacity
                            style={styles.currencySelector}
                            onPress={() => setActivePicker('to')}
                            activeOpacity={0.6}
                        >
                            <View style={styles.flagCircle}>
                                <Text style={styles.flagEmoji}>{getFlagEmoji(toCurrency)}</Text>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={20} color="#B2B2B2" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.amountInput}
                        value={toAmount}
                        onChangeText={handleToAmountChange}
                        placeholder="0.00"
                        placeholderTextColor="#B2B2B2"
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        editable={false}
                    />

                    <View style={styles.cardBottomRow}>
                        <View style={styles.balanceRow}>
                            <HugeiconsIcon icon={SquareLock02FreeIcons} size={14} color="#B2B2B2" />
                            <Text style={styles.balanceText}>{toBalance}</Text>
                        </View>
                        <View />
                    </View>
                </View>

                {/* Info Rows */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Min Sell</Text>
                        <Text style={styles.infoValue}>{minSell} {fromCurrency}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Max Sell</Text>
                        <Text style={styles.infoValue}>{maxSell} {fromCurrency}</Text>
                    </View>
                    <View style={[styles.infoRow, styles.infoRowLast]}>
                        <Text style={styles.infoLabel}>Rate</Text>
                        <Text style={styles.infoValue}>{rateDisplay}</Text>
                    </View>
                </View>

                {/* Promo Cards */}
                <View style={styles.promoRow}>
                    <TouchableOpacity
                        style={styles.promoCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('MyCoupons')}
                    >
                        <Text style={styles.promoTitle}>You have 0 coupons</Text>
                        <View style={styles.promoPlaceholder}>
                            <Text style={styles.promoPlaceholderText}>L</Text>
                        </View>
                        <View style={styles.promoViewBtn}>
                            <Text style={styles.promoViewText}>View</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.promoCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('StatusUpgrade')}
                    >
                        <Text style={styles.promoTitle}>Current Tier = Basic</Text>
                        <Text style={styles.promoSubtitle}>Upgrade for a better rate</Text>
                        <View style={styles.promoViewBtn}>
                            <Text style={styles.promoViewText}>View</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Swap Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.swapActionBtn, !canSwap && styles.swapActionBtnDisabled]}
                    onPress={handleSwap}
                    activeOpacity={0.7}
                    disabled={!canSwap || executeSwap.isPending}
                >
                    <Text style={[styles.swapActionText, !canSwap && styles.swapActionTextDisabled]}>
                        {executeSwap.isPending ? 'Swapping...' : 'Swap'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Currency Picker Bottom Sheet */}
            <BottomSheet
                visible={activePicker !== null}
                onClose={() => setActivePicker(null)}
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
                        <View style={styles.emptyList}>
                            <Text style={styles.emptyListText}>Loading assets...</Text>
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

    // Scroll
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: spacing.huge,
        gap: 5,
    },

    // Currency Card
    currencyCard: {
        height: 130,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 21,
        paddingHorizontal: 26,
        paddingVertical: 18,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    currencyNameText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    currencySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    flagCircle: {
        width: 55,
        height: 55,
        borderRadius: 678,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flagEmoji: {
        fontSize: 28,
    },
    amountInput: {
        fontSize: 36,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 45,
        paddingVertical: 0,
    },
    cardBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },
    maxText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#01CA47',
        lineHeight: 19.2,
    },

    // Swap Direction Button
    swapBtnContainer: {
        alignItems: 'center',
        marginVertical: -12,
        zIndex: 1,
    },
    swapBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapBtnIcon: {
        fontSize: 22,
        fontWeight: '700',
        color: '#D9F7E3',
    },

    // Info Section
    infoSection: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 15,
        padding: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10.5,
        paddingHorizontal: 7,
        borderBottomWidth: 1.5,
        borderBottomColor: '#E8E8E8',
    },
    infoRowLast: {
        borderBottomWidth: 0,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        textAlign: 'right',
    },

    // Promo Cards
    promoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
        marginTop: 10,
    },
    promoCard: {
        flex: 1,
        height: 120,
        backgroundColor: '#D9F7E3',
        borderRadius: 15,
        paddingHorizontal: 18,
        paddingTop: 12,
        overflow: 'hidden',
    },
    promoTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 21,
    },
    promoSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 21,
    },
    promoPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 28,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 10,
        bottom: 10,
    },
    promoPlaceholderText: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    promoViewBtn: {
        width: 61,
        height: 25,
        backgroundColor: '#01CA47',
        borderRadius: 138,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 10,
        bottom: 10,
    },
    promoViewText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 16.8,
    },

    // Bottom Bar
    bottomBar: {
        paddingHorizontal: 24,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    swapActionBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    swapActionBtnDisabled: {
        backgroundColor: '#F0F0F0',
    },
    swapActionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    swapActionTextDisabled: {
        color: '#B2B2B2',
    },

    // Bottom Sheet
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
    emptyList: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyListText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
    },
});
