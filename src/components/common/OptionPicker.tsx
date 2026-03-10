import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import BottomSheet from '@components/common/BottomSheet';

interface OptionPickerProps {
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (option: string) => void;
    onClose: () => void;
}

export default function OptionPicker({ visible, title, options, onSelect, onClose }: OptionPickerProps) {
    const footer = (
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeText}>Cancel</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} title={title} maxHeight="80%" footer={footer}>
            {options.map((opt, i) => (
                <TouchableOpacity
                    key={opt}
                    style={[styles.option, i < options.length - 1 && styles.border]}
                    onPress={() => onSelect(opt)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
            ))}
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    option: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    optionText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    closeBtn: {
        backgroundColor: palette.gray100,
        borderRadius: borderRadius.button,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    closeText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
