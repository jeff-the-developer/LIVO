import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    CheckmarkCircle02FreeIcons,
    Alert02FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useKYCOverview } from '@hooks/api/useKYC';
import type { KYCLevelInfo } from '@api/kyc';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Important Notes (checkboxes that must be checked before proceeding) ──────
const IMPORTANT_NOTES = [
    'Interest accrual starts the next day after deposit & pays out to Earning+',
    'Interest bonus is 0.0% based on your membership tier',
    'Coupons can boost interest but cannot be stacked',
];

// ─── Important Notes Bottom Sheet ─────────────────────────────────────────────
function ImportantNotesSheet({
    visible,
    onSubmit,
    onCancel,
}: {
    visible: boolean;
    onSubmit: () => void;
    onCancel: () => void;
}): React.ReactElement {
    const [checked, setChecked] = useState<boolean[]>(
        new Array(IMPORTANT_NOTES.length).fill(false),
    );

    const toggleCheck = (idx: number) => {
        setChecked((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    const allChecked = checked.every(Boolean);

    const footer = (
        <TouchableOpacity
            style={[noteStyles.submitBtn, !allChecked && noteStyles.submitDisabled]}
            onPress={onSubmit}
            activeOpacity={0.85}
            disabled={!allChecked}
            accessibilityLabel="Proceed to verification"
            accessibilityRole="button"
            testID="notes-submit"
        >
            <Text style={noteStyles.submitText}>I Understand</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onCancel} footer={footer}>
            <View style={noteStyles.iconWrap}>
                <HugeiconsIcon icon={Alert02FreeIcons} size={24} color={palette.orange} />
            </View>
            <Text style={noteStyles.title}>Important Notes</Text>
            {IMPORTANT_NOTES.map((note, idx) => (
                <TouchableOpacity
                    key={idx}
                    style={noteStyles.noteRow}
                    onPress={() => toggleCheck(idx)}
                    activeOpacity={0.7}
                    accessibilityLabel={note}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: checked[idx] }}
                    testID={`note-check-${idx}`}
                >
                    <Text style={noteStyles.noteText}>{note}</Text>
                    <View style={[noteStyles.checkbox, checked[idx] && noteStyles.checkboxChecked]}>
                        {checked[idx] && (
                            <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} size={20} color={colors.textPrimary} />
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </BottomSheet>
    );
}

// ─── Privilege Row ────────────────────────────────────────────────────────────
function PrivilegeRow({
    label,
    value,
    active,
}: {
    label: string;
    value?: string;
    active: boolean;
}): React.ReactElement {
    return (
        <View style={kycStyles.privRow}>
            <Text style={kycStyles.privLabel}>{label}</Text>
            {value ? (
                <Text style={kycStyles.privValue}>{value}</Text>
            ) : active ? (
                <HugeiconsIcon
                    icon={CheckmarkCircle02FreeIcons}
                    size={18}
                    color={colors.primary}
                />
            ) : null}
        </View>
    );
}

// ─── KYC Section ──────────────────────────────────────────────────────────────
function KYCSection({
    data,
    onButtonPress,
}: {
    data: KYCLevelInfo;
    onButtonPress: () => void;
}): React.ReactElement {
    return (
        <View style={kycStyles.section}>
            <Text style={kycStyles.levelTitle}>KYC{data.level}</Text>

            <Text style={kycStyles.sectionLabel}>Privilege</Text>
            {data.privileges.map((p, i) => (
                <PrivilegeRow key={i} label={p.label} value={p.value} active={p.active} />
            ))}

            <Text style={[kycStyles.sectionLabel, { marginTop: spacing.base }]}>
                Requirements
            </Text>
            {data.requirements.map((r, i) => (
                <Text key={i} style={kycStyles.requirement}>
                    {r}
                </Text>
            ))}

            <TouchableOpacity
                style={[
                    kycStyles.actionBtn,
                    data.completed && kycStyles.actionBtnCompleted,
                    data.actionable && !data.completed && kycStyles.actionBtnActive,
                    !data.actionable && !data.completed && kycStyles.actionBtnDisabled,
                ]}
                onPress={onButtonPress}
                disabled={!data.actionable}
                activeOpacity={0.85}
                accessibilityLabel={data.action_label}
                accessibilityRole="button"
                testID={`kyc${data.level}-btn`}
            >
                <Text
                    style={[
                        kycStyles.actionText,
                        data.completed && kycStyles.actionTextCompleted,
                        data.actionable && !data.completed && kycStyles.actionTextActive,
                        !data.actionable && !data.completed && kycStyles.actionTextDisabled,
                    ]}
                >
                    {data.action_label}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VerificationScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: kycData, isLoading } = useKYCOverview();

    const [showNotes, setShowNotes] = useState(false);

    const onStartVerification = () => {
        setShowNotes(true);
    };

    const onNotesSubmit = () => {
        setShowNotes(false);
        navigation.navigate('IdentityVerification');
    };

    const getButtonHandler = (level: number) => () => {
        if (level === 1) {
            onStartVerification();
        }
    };

    const levels = kycData?.levels ?? [];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="verification-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verification</Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {levels.map((level) => (
                        <KYCSection
                            key={level.level}
                            data={level}
                            onButtonPress={getButtonHandler(level.level)}
                        />
                    ))}
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}

            <ImportantNotesSheet
                visible={showNotes}
                onSubmit={onNotesSubmit}
                onCancel={() => setShowNotes(false)}
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
});

// ─── KYC Section Styles ───────────────────────────────────────────────────────
const kycStyles = StyleSheet.create({
    section: {
        marginBottom: spacing.xl,
    },
    levelTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    sectionLabel: {
        ...typography.label,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    privRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    privLabel: {
        ...typography.bodySm,
        color: colors.textSecondary,
        flex: 1,
    },
    privValue: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    requirement: {
        ...typography.bodySm,
        color: colors.textSecondary,
        paddingVertical: 4,
    },
    actionBtn: {
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        marginTop: spacing.base,
    },
    actionBtnCompleted: {
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionBtnActive: {
        backgroundColor: colors.buttonPrimary,
    },
    actionBtnDisabled: {
        backgroundColor: colors.surfaceAlt,
        opacity: 0.6,
    },
    actionText: {
        ...typography.bodyMd,
        fontWeight: '600',
    },
    actionTextCompleted: {
        color: colors.textMuted,
    },
    actionTextActive: {
        color: colors.buttonText,
    },
    actionTextDisabled: {
        color: colors.textMuted,
    },
});

// ─── Notes Sheet Styles ───────────────────────────────────────────────────────
const noteStyles = StyleSheet.create({
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: palette.orange + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.lg,
    },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.card,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.sm,
    },
    noteText: {
        ...typography.bodySm,
        color: colors.textPrimary,
        flex: 1,
        lineHeight: 20,
        marginRight: spacing.sm,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxChecked: {
        borderColor: colors.textPrimary,
    },
    submitBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        marginTop: spacing.base,
    },
    submitDisabled: {
        opacity: 0.4,
    },
    submitText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
