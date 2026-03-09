import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Policy Items ─────────────────────────────────────────────────────────────
const ITEMS = [
    { label: 'User Agreement', url: 'https://livopay.com/user-agreement' },
    { label: 'Privacy Policy', url: 'https://livopay.com/privacy-policy' },
    { label: 'Card Usage Agreement', url: 'https://livopay.com/card-usage' },
    { label: 'Important Risk Warnings and Disclosures', url: 'https://livopay.com/risk-warnings' },
    { label: 'Whistleblowing Channels', url: 'https://livopay.com/whistleblowing' },
    { label: 'Complaints Policy', url: 'https://livopay.com/complaints' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TermsOfServiceScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const onItemPress = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="terms-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Terms of Service</Text>
                <View style={s.headerSpacer} />
            </View>

            {/* List */}
            <ScrollView style={s.flex} showsVerticalScrollIndicator={false}>
                <View style={s.list}>
                    {ITEMS.map((item, idx) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[s.row, idx < ITEMS.length - 1 && s.rowBorder]}
                            onPress={() => onItemPress(item.url)}
                            activeOpacity={0.7}
                            testID={`terms-${idx}`}
                        >
                            <Text style={s.rowLabel}>{item.label}</Text>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.base, paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1, textAlign: 'center', ...typography.h4,
        color: colors.textPrimary, fontWeight: '700',
    },
    headerSpacer: { width: 36 },

    list: { paddingHorizontal: spacing.base, paddingTop: spacing.lg },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowLabel: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },
});
