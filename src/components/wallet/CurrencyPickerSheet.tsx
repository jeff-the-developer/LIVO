import React, { useState } from 'react';
import { ActivityIndicator, View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet from '@components/common/BottomSheet';
import { FlagIcon } from '@components/icons/CurrencyIcons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';
import EmptyState from '@components/common/EmptyState';

export interface CurrencyPickerItem {
    code: string;
    name: string;
    flag: string;
}

const SUPPORTED_FIAT_CURRENCIES: CurrencyPickerItem[] = [
    { code: 'USD', name: 'US Dollar', flag: 'US' },
    { code: 'HKD', name: 'HK Dollar', flag: 'HK' },
    { code: 'CNY', name: 'Chinese Yuan', flag: 'CN' },
    { code: 'AUD', name: 'Australian Dollar', flag: 'AU' },
    { code: 'CAD', name: 'Canadian Dollar', flag: 'CA' },
    { code: 'CHF', name: 'Swiss Franc', flag: 'CH' },
    { code: 'EUR', name: 'Euro', flag: 'EU' },
    { code: 'GBP', name: 'British Pound', flag: 'GB' },
    { code: 'JPY', name: 'Japanese Yen', flag: 'JP' },
    { code: 'SGD', name: 'Singapore Dollar', flag: 'SG' },
];


interface CurrencyPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    selectedCurrency: string;
    onSelect: (code: string, name: string) => void;
    title?: string;
    currencies?: CurrencyPickerItem[];
    isLoading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
}

export default function CurrencyPickerSheet({
    visible,
    onClose,
    selectedCurrency,
    onSelect,
    title = 'Currency',
    currencies,
    isLoading = false,
    emptyTitle = 'No supported currencies',
    emptyDescription = 'Currency options are unavailable right now.',
}: CurrencyPickerSheetProps): React.ReactElement {
    const [selected, setSelected] = useState(selectedCurrency);
    const items = currencies ?? SUPPORTED_FIAT_CURRENCIES;

    React.useEffect(() => {
        if (visible) {
            setSelected(selectedCurrency);
        }
    }, [selectedCurrency, visible]);

    const handleSelect = (item: CurrencyPickerItem) => {
        setSelected(item.code);
        // Apply selection before closing so parent state + icons update in the same frame as dismissal.
        onSelect(item.code, item.name);
        onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            maxHeight="75%"
            title={title}
            showBackButton
            isOverlay
        >
            <View style={styles.list}>
                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : items.length ? (
                    items.map((item) => {
                        const isSelected = selected === item.code;
                        return (
                            <Pressable
                                key={item.code}
                                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                                onPress={() => handleSelect(item)}
                            >
                                <FlagIcon code={item.flag} size={ui.pickerSheetIcon} />
                                <Text style={styles.currencyName} numberOfLines={1}>
                                    {item.name} ({item.code})
                                </Text>
                                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                    {isSelected && <Text style={styles.checkmark}>&#10003;</Text>}
                                </View>
                            </Pressable>
                        );
                    })
                ) : (
                    <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        style={styles.emptyState}
                    />
                )}
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm + spacing.xs,
        gap: spacing.md,
        borderRadius: ui.radius.field,
    },
    rowPressed: {
        backgroundColor: colors.surface,
        opacity: 0.96,
    },
    currencyName: {
        flex: 1,
        ...typography.bodyMd,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: ui.radius.field,
        borderWidth: 1,
        borderColor: colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.buttonPrimary,
        borderColor: colors.buttonPrimary,
    },
    checkmark: {
        fontSize: 14,
        color: colors.textInverse,
        fontWeight: '700',
        lineHeight: 18,
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    emptyState: {
        paddingVertical: spacing.xl,
    },
});
