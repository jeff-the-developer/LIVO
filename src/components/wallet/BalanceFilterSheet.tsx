import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01FreeIcons } from '@hugeicons/core-free-icons';
import BottomSheet from '@components/common/BottomSheet';
import CurrencyPickerSheet from '@components/wallet/CurrencyPickerSheet';

type DisplayMode = 'available' | 'total';
type AssetType = 'all' | 'fiat' | 'crypto';

interface BalanceFilterSheetProps {
    visible: boolean;
    onClose: () => void;
    currency: string;
    showTypeFilter?: boolean;
    initialDisplay?: DisplayMode;
    initialType?: AssetType;
    onConfirm?: (display: DisplayMode, type: AssetType, currency: string) => void;
}

export default function BalanceFilterSheet({
    visible,
    onClose,
    currency,
    showTypeFilter = true,
    initialDisplay = 'available',
    initialType = 'all',
    onConfirm,
}: BalanceFilterSheetProps): React.ReactElement {
    const [display, setDisplay] = useState<DisplayMode>(initialDisplay);
    const [assetType, setAssetType] = useState<AssetType>(initialType);
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

    const handleReset = () => {
        setDisplay('available');
        setAssetType('all');
        setSelectedCurrency(currency);
    };

    const handleConfirm = () => {
        onConfirm?.(display, assetType, selectedCurrency);
        onClose();
    };

    const handleCurrencySelect = (code: string, name: string) => {
        setSelectedCurrency(name);
    };

    const footer = (
        <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.7}>
                <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    const currencyOverlay = (
        <CurrencyPickerSheet
            visible={currencyPickerVisible}
            onClose={() => setCurrencyPickerVisible(false)}
            selectedCurrency={selectedCurrency}
            onSelect={handleCurrencySelect}
        />
    );

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            maxHeight="65%"
            footer={footer}
            overlays={currencyOverlay}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Balance</Text>
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Currency */}
            <View style={styles.section}>
                <Text style={styles.label}>Currency</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    activeOpacity={0.7}
                    onPress={() => setCurrencyPickerVisible(true)}
                >
                    <Text style={styles.dropdownText}>{selectedCurrency}</Text>
                    <HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color="#B2B2B2" />
                </TouchableOpacity>
            </View>

            {/* Display */}
            <View style={styles.section}>
                <Text style={styles.labelLight}>Display</Text>
                <View style={styles.pillRow}>
                    <TouchableOpacity
                        style={[styles.pill, styles.pillHalf, display === 'available' ? styles.pillSelected : styles.pillDefault]}
                        onPress={() => setDisplay('available')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.pillText, display === 'available' ? styles.pillTextSelected : styles.pillTextDefault]}>
                            Available
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.pill, styles.pillHalf, display === 'total' ? styles.pillSelected : styles.pillDefault]}
                        onPress={() => setDisplay('total')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.pillText, display === 'total' ? styles.pillTextSelected : styles.pillTextDefault]}>
                            Total
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Type (only on Home, not inside Asset Detail) */}
            {showTypeFilter && (
                <View style={styles.section}>
                    <Text style={styles.labelLight}>Type</Text>
                    <View style={styles.pillRow}>
                        {(['all', 'fiat', 'crypto'] as AssetType[]).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.pill, styles.pillThird, assetType === t ? styles.pillSelected : styles.pillDefault]}
                                onPress={() => setAssetType(t)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.pillText, assetType === t ? styles.pillTextSelected : styles.pillTextDefault]}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 37.5,
    },
    resetBtn: {
        paddingHorizontal: 20,
        paddingVertical: 7,
        backgroundColor: '#D9F7E3',
        borderRadius: 138,
    },
    resetText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 18,
    },
    // Sections
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        marginBottom: 9,
    },
    labelLight: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        marginBottom: 14,
    },
    // Dropdown
    dropdown: {
        height: 54,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#B2B2B2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
    },
    dropdownText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 27,
    },
    // Pills
    pillRow: {
        flexDirection: 'row',
        gap: 7,
    },
    pill: {
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillHalf: {
        flex: 1,
    },
    pillThird: {
        flex: 1,
    },
    pillSelected: {
        backgroundColor: '#D9F7E3',
        borderWidth: 1,
        borderColor: '#01CA47',
    },
    pillDefault: {
        borderWidth: 1,
        borderColor: '#B2B2B2',
    },
    pillText: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 27,
    },
    pillTextSelected: {
        color: '#01CA47',
    },
    pillTextDefault: {
        color: '#B2B2B2',
    },
    // Footer buttons
    footerButtons: {
        gap: 14,
    },
    confirmBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        lineHeight: 24,
    },
    cancelBtn: {
        height: 52,
        backgroundColor: '#F0F0F0',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
});
