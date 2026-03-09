import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    SmartPhone01Icon as SmartPhone01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import BottomSheet from '@components/common/BottomSheet';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConfigRow {
    /** Security feature label */
    label: string;
    /** Current configuration value */
    value: string;
}

/** Static configuration rows displayed in the table */
const CONFIG_ROWS: ConfigRow[] = [
    { label: 'FX Swap', value: 'None' },
    { label: 'Quick Transfer', value: 'None' },
    { label: 'Crypto send', value: 'Auth/Email/SMS' },
    { label: 'Fiat Pay (Myself)', value: 'Auth' },
    { label: 'Fiat Pay (Others)', value: 'Auth/Email/SMS' },
    { label: 'Validity', value: '5min' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WithdrawalSettingsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [showLinkPhone, setShowLinkPhone] = useState(false);

    const onEdit = () => {
        // TODO: check if phone is linked; if not, show link phone sheet
        setShowLinkPhone(true);
    };

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="withdrawal-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Security Settings</Text>
                <View style={s.headerSpacer} />
            </View>

            <ScrollView style={s.flex} contentContainerStyle={s.content}>
                <Text style={s.subtitle}>View & manage security configuration</Text>

                {/* Config Table */}
                <View style={s.table}>
                    {CONFIG_ROWS.map((row, i) => (
                        <React.Fragment key={row.label}>
                            {i > 0 && <View style={s.divider} />}
                            <View style={s.tableRow}>
                                <Text style={s.tableLabel}>{row.label}</Text>
                                <Text style={s.tableValue}>{row.value}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                </View>
            </ScrollView>

            {/* Edit Button */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={s.editBtn}
                    onPress={onEdit}
                    activeOpacity={0.85}
                    accessibilityLabel="Edit settings"
                    accessibilityRole="button"
                    testID="withdrawal-edit"
                >
                    <Text style={s.editBtnText}>Edit</Text>
                </TouchableOpacity>
            </View>

            {/* Link Phone Sheet — uses shared BottomSheet */}
            <BottomSheet visible={showLinkPhone} onClose={() => setShowLinkPhone(false)}>
                <View style={lp.body}>
                    <View style={lp.iconCircle}>
                        <HugeiconsIcon icon={SmartPhone01FreeIcons} size={22} color={colors.textPrimary} />
                    </View>
                    <Text style={lp.title}>Link Phone</Text>
                    <Text style={lp.description}>
                        To proceed, please link a mobile number and enter the correct SMS code. Tap to link a phone number to receive the code
                    </Text>
                </View>
                <View style={lp.footer}>
                    <TouchableOpacity
                        style={lp.btnPrimary}
                        onPress={() => {
                            setShowLinkPhone(false);
                            navigation.navigate('SecurityMobile');
                        }}
                        activeOpacity={0.85}
                        accessibilityLabel="Link phone number"
                        accessibilityRole="button"
                        testID="linkphone-link"
                    >
                        <Text style={lp.btnPrimaryText}>Link Phone</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={lp.btnSecondary}
                        onPress={() => setShowLinkPhone(false)}
                        activeOpacity={0.85}
                        accessibilityLabel="Cancel"
                        accessibilityRole="button"
                        testID="linkphone-cancel"
                    >
                        <Text style={lp.btnSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
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
    content: { paddingHorizontal: spacing.base },
    subtitle: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '400',
        marginBottom: spacing.lg,
    },
    table: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    tableLabel: { ...typography.bodySm, color: colors.textMuted },
    tableValue: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '600' },
    divider: { height: 0.5, backgroundColor: colors.border },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    editBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
    },
    editBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Link Phone Sheet Content Styles ──────────────────────────────────────────
const lp = StyleSheet.create({
    body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, gap: spacing.sm },
    btnPrimary: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
    },
    btnPrimaryText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '700' },
    btnSecondary: {
        backgroundColor: palette.gray100,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
    },
    btnSecondaryText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
});
