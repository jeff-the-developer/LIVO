import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet from '@components/common/BottomSheet';

interface CurrencyItem {
    code: string;
    name: string;
    flag: string;
}

const CURRENCIES: CurrencyItem[] = [
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

function getFlagEmoji(countryCode: string): string {
    return countryCode
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
        .join('');
}

interface CurrencyPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    selectedCurrency: string;
    onSelect: (code: string, name: string) => void;
}

export default function CurrencyPickerSheet({
    visible,
    onClose,
    selectedCurrency,
    onSelect,
}: CurrencyPickerSheetProps): React.ReactElement {
    const [selected, setSelected] = useState(selectedCurrency);

    const handleSelect = (item: CurrencyItem) => {
        setSelected(item.code);
        onSelect(item.code, item.name);
        onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            maxHeight="75%"
            title="Currency"
            showBackButton
            isOverlay
        >
            <View style={styles.list}>
                {CURRENCIES.map((item) => {
                    const isSelected = selected === item.code;
                    return (
                        <TouchableOpacity
                            key={item.code}
                            style={styles.row}
                            onPress={() => handleSelect(item)}
                            activeOpacity={0.6}
                        >
                            {/* Flag */}
                            <View style={styles.flagWrap}>
                                <Text style={styles.flagText}>{getFlagEmoji(item.flag)}</Text>
                            </View>

                            {/* Name */}
                            <Text style={styles.currencyName} numberOfLines={1}>
                                {item.name} ({item.code})
                            </Text>

                            {/* Checkbox */}
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Text style={styles.checkmark}>&#10003;</Text>}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 12,
    },
    flagWrap: {
        width: 55,
        height: 55,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flagText: {
        fontSize: 34,
    },
    currencyName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#959595',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#242424',
        borderColor: '#242424',
    },
    checkmark: {
        fontSize: 14,
        color: 'white',
        fontWeight: '700',
        lineHeight: 18,
    },
});
