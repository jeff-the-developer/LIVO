import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

export default function LivoBusinessScreen(): React.ReactElement {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="livo-business-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Livo Business</Text>
                <View style={s.headerSpacer} />
            </View>

            <View style={s.body}>
                <View style={s.logoWrap}>
                    <Text style={s.logoText}>L</Text>
                </View>
                <Text style={s.emptyLabel}>No Records</Text>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    headerSpacer: { width: 36 },

    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.base,
    },
    logoWrap: {
        width: 72,
        height: 72,
        borderRadius: borderRadius.card,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
    },
    emptyLabel: {
        ...typography.bodyMd,
        color: colors.textSecondary,
    },
});
