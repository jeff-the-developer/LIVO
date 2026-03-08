import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    UserFreeIcons,
    Building06FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import type { AccountType } from '@api/kyc';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── "Get Ready" Bottom Sheet ─────────────────────────────────────────────────
function GetReadySheet({
    visible,
    onReady,
    onCancel,
}: {
    visible: boolean;
    onReady: () => void;
    onCancel: () => void;
}): React.ReactElement {
    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={sheetStyles.overlay}>
                <View style={sheetStyles.sheet}>
                    <View style={sheetStyles.handleBar} />

                    <Text style={sheetStyles.title}>Get Ready</Text>
                    <Text style={sheetStyles.body}>
                        Prepare government-issued ID (e.g., ID/Passport) in original
                        form or as photo/scan
                    </Text>

                    <TouchableOpacity
                        style={sheetStyles.readyBtn}
                        onPress={onReady}
                        activeOpacity={0.85}
                        accessibilityLabel="I'm Ready"
                        accessibilityRole="button"
                        testID="kyc-ready-btn"
                    >
                        <Text style={sheetStyles.readyText}>I'm Ready</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={sheetStyles.cancelBtn}
                        onPress={onCancel}
                        activeOpacity={0.85}
                        accessibilityLabel="Cancel"
                        accessibilityRole="button"
                        testID="kyc-cancel-btn"
                    >
                        <Text style={sheetStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─── Account Type Card ────────────────────────────────────────────────────────
function AccountTypeCard({
    icon,
    title,
    subtitle,
    onPress,
    testID,
}: {
    icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
    title: string;
    subtitle: string;
    onPress: () => void;
    testID?: string;
}): React.ReactElement {
    return (
        <TouchableOpacity
            style={cardStyles.card}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityLabel={`${title}: ${subtitle}`}
            accessibilityRole="button"
            testID={testID}
        >
            <View style={cardStyles.iconWrap}>
                <HugeiconsIcon icon={icon} size={22} color={colors.primaryDark} />
            </View>
            <View style={cardStyles.content}>
                <Text style={cardStyles.title}>{title}</Text>
                <Text style={cardStyles.subtitle}>{subtitle}</Text>
            </View>
            <Text style={cardStyles.chevron}>›</Text>
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function IdentityVerificationScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const [showReady, setShowReady] = useState(false);
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);

    const onSelectType = (type: AccountType) => {
        setSelectedType(type);
        setShowReady(true);
    };

    const onReady = () => {
        if (!selectedType) return;
        setShowReady(false);
        navigation.navigate('KYC1Verify', { accountType: selectedType });
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ──────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="kyc-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>You Are?</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* ─── Account Type Cards ──────────────────────────────── */}
            <View style={styles.cardsSection}>
                <AccountTypeCard
                    icon={UserFreeIcons}
                    title="Individual"
                    subtitle="I'm an Individual user"
                    onPress={() => onSelectType('individual')}
                    testID="kyc-individual"
                />
                <AccountTypeCard
                    icon={Building06FreeIcons}
                    title="Corporate/Organization"
                    subtitle="We're a corporate/an organization"
                    onPress={() => onSelectType('corporate')}
                    testID="kyc-corporate"
                />
            </View>

            {/* ─── Get Ready Sheet ─────────────────────────────────── */}
            <GetReadySheet
                visible={showReady}
                onReady={onReady}
                onCancel={() => setShowReady(false)}
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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

    cardsSection: {
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
});

// ─── Card Styles ──────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.card,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    title: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    subtitle: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 2,
    },
    chevron: {
        fontSize: 22,
        color: colors.textMuted,
        marginLeft: spacing.xs,
    },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────
const sheetStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    body: {
        ...typography.bodySm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.xl,
    },
    readyBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        marginBottom: spacing.sm,
    },
    readyText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
    cancelBtn: {
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    cancelText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
