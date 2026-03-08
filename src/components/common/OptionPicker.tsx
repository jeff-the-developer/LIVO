import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

interface OptionPickerProps {
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (option: string) => void;
    onClose: () => void;
}

export default function OptionPicker({ visible, title, options, onSelect, onClose }: OptionPickerProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.sheet}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                            </View>
                            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
                            </ScrollView>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                                <Text style={styles.closeText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius.card,
        borderTopRightRadius: borderRadius.card,
        paddingBottom: spacing.xxl,
        maxHeight: '80%',
    },
    header: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    scroll: {
        paddingHorizontal: spacing.base,
    },
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
        marginHorizontal: spacing.base,
        marginTop: spacing.md,
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
