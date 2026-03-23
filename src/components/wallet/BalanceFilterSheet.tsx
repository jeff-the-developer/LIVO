import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01FreeIcons } from '@hugeicons/core-free-icons';
import BottomSheet from '@components/common/BottomSheet';
import Button from '@components/common/Button';
import CurrencyPickerSheet from '@components/wallet/CurrencyPickerSheet';
import SelectField from '@components/forms/SelectField';
import { FlagIcon } from '@components/icons/CurrencyIcons';
import { borderRadius } from '@theme/borderRadius';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

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

    // Sync internal state with current persisted values each time the sheet opens
    useEffect(() => {
        if (visible) {
            setDisplay(initialDisplay);
            setAssetType(initialType);
            setSelectedCurrency(currency);
        }
    }, [visible, currency, initialDisplay, initialType]);

    const handleReset = () => {
        setDisplay('available');
        setAssetType('all');
        setSelectedCurrency(currency);
    };

    const handleConfirm = () => {
        onConfirm?.(display, assetType, selectedCurrency);
        onClose();
    };

    const handleCurrencySelect = (code: string, _name: string) => {
        setSelectedCurrency(code);
    };

    const footer = (
        <View style={styles.footerButtons}>
            <Button label="Confirm" onPress={handleConfirm} />
            <Button label="Cancel" variant="secondary" onPress={onClose} />
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
                <SelectField
                    style={styles.dropdown}
                    onPress={() => setCurrencyPickerVisible(true)}
                    value={selectedCurrency}
                    placeholder="Select currency"
                    leftAdornment={
                        selectedCurrency ? (
                            <FlagIcon code={selectedCurrency} size={ui.selectorIconSm} />
                        ) : undefined
                    }
                    rightAdornment={<HugeiconsIcon icon={ArrowRight01FreeIcons} size={24} color={colors.textMuted} />}
                />
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
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    resetBtn: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 7,
        backgroundColor: colors.primaryLight,
        borderRadius: ui.radius.pill,
    },
    resetText: {
        ...typography.bodySm,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    // Sections
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        ...typography.h4,
        color: colors.textSecondary,
        marginBottom: spacing.sm + 1,
    },
    labelLight: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        marginBottom: spacing.md + 2,
    },
    // Dropdown
    dropdown: {
        minHeight: ui.inputHeight,
    },
    // Pills
    pillRow: {
        flexDirection: 'row',
        gap: spacing.sm - 1,
    },
    pill: {
        paddingVertical: spacing.md + 1,
        paddingHorizontal: 14,
        borderRadius: borderRadius.lg,
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
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    pillDefault: {
        borderWidth: 1,
        borderColor: colors.textMuted,
    },
    pillText: {
        ...typography.bodyMd,
        fontWeight: '500',
    },
    pillTextSelected: {
        color: colors.primary,
    },
    pillTextDefault: {
        color: colors.textSecondary,
    },
    // Footer buttons
    footerButtons: {
        gap: spacing.md + 2,
    },
});
