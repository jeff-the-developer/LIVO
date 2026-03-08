import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    InformationCircleFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useCurrentMembership } from '@hooks/api/useMembership';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Tier Card ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const livopayLogo = require('@assets/images/branding/livopay_wordmark_dark.png');

function TierCard({ tier, cardColor }: { tier: string; cardColor: string }): React.ReactElement {
    return (
        <View style={[tierStyles.card, { backgroundColor: cardColor }]}>
            <Text style={tierStyles.tierLabel}>{tier}</Text>
            <Image
                source={livopayLogo}
                style={tierStyles.logo}
                resizeMode="contain"
                accessibilityLabel="LIVO pay"
            />
        </View>
    );
}

// ─── Benefit Row ──────────────────────────────────────────────────────────────
function BenefitRow({
    label,
    value,
    hasInfo,
    isLast,
}: {
    label: string;
    value: string;
    hasInfo: boolean;
    isLast: boolean;
}): React.ReactElement {
    return (
        <View style={[benefitStyles.row, !isLast && benefitStyles.rowBorder]}>
            <View style={benefitStyles.labelWrap}>
                <Text style={benefitStyles.label}>{label}</Text>
                {hasInfo && (
                    <HugeiconsIcon
                        icon={InformationCircleFreeIcons}
                        size={16}
                        color={colors.textMuted}
                    />
                )}
            </View>
            <Text style={benefitStyles.value}>{value}</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function StatusUpgradeScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: currentMembership, isLoading } = useCurrentMembership();

    // Get current tier data
    const currentTierData = currentMembership?.membershipData?.availableTiers?.find(
        tier => tier.id === currentMembership.currentTier
    );

    const tier = currentTierData?.displayName || 'Basic';
    const cardColor = currentTierData?.cardColor || '#01CA47'; // Default to green

    // Create benefits array from current tier data
    const benefits = currentTierData ? [
        { 
            label: 'Crypto/Cash Swap Fee', 
            value: `${currentTierData.benefits.cryptoSwapFee.value}%`, 
            hasInfo: true 
        },
        { 
            label: 'Invite Rebate', 
            value: `${currentTierData.benefits.inviteRebate.value}%`, 
            hasInfo: true 
        },
        { 
            label: 'Cashback', 
            value: `${currentTierData.benefits.cashback.value}%`, 
            hasInfo: true 
        },
    ] : [
        { label: 'Crypto/Cash Swap Fee', value: '0.8%', hasInfo: true },
        { label: 'Invite Rebate', value: '10%', hasInfo: true },
        { label: 'Cashback', value: '0.3%', hasInfo: true },
    ];

    const extras = currentTierData ? [currentTierData.other.cardDesign] : ['Unlock Card Design - Basic Card'];

    const onCheckStatus = () => {
        Alert.alert(
            'Status/Upgrade',
            'Upgrade flow will be available soon. Stay tuned!',
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ──────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="status-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Status/Upgrade</Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    <ScrollView
                        style={styles.flex}
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* ─── Tier Card ──────────────────────── */}
                        <TierCard tier={tier} cardColor={cardColor} />

                        {/* ─── Benefits List ──────────────────── */}
                        <View style={benefitStyles.card}>
                            {benefits.map((b, i) => (
                                <BenefitRow
                                    key={i}
                                    label={b.label}
                                    value={b.value}
                                    hasInfo={b.hasInfo}
                                    isLast={i === benefits.length - 1 && extras.length === 0}
                                />
                            ))}

                            {/* ─── Other / Extras ─────────────── */}
                            {extras.length > 0 && (
                                <>
                                    <View style={benefitStyles.divider} />
                                    <Text style={benefitStyles.otherLabel}>Other</Text>
                                    <View style={benefitStyles.divider} />

                                    {extras.map((item, i) => (
                                        <Text key={i} style={benefitStyles.extraItem}>
                                            {item}
                                        </Text>
                                    ))}
                                </>
                            )}
                        </View>
                    </ScrollView>

                    {/* ─── CTA Button ──────────────────────── */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.ctaBtn}
                            onPress={onCheckStatus}
                            activeOpacity={0.85}
                            accessibilityLabel="Check Status/Upgrade"
                            accessibilityRole="button"
                            testID="status-cta"
                        >
                            <Text style={styles.ctaText}>Check Status/Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        paddingBottom: spacing.base,
    },
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

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    ctaBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    ctaText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});

// ─── Tier Card Styles ─────────────────────────────────────────────────────────
const tierStyles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.card,
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: 160,
    },
    tierLabel: {
        ...typography.h4,
        color: colors.textInverse,
        fontWeight: '700',
    },
    logo: {
        width: 90,
        height: 50,
    },
});

// ─── Benefit Styles ───────────────────────────────────────────────────────────
const benefitStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
    },
    rowBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    labelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        flex: 1,
    },
    label: {
        ...typography.bodySm,
        color: colors.textPrimary,
    },
    value: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    divider: {
        height: 0.5,
        backgroundColor: colors.border,
    },
    otherLabel: {
        ...typography.bodySm,
        color: colors.textPrimary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
    },
    extraItem: {
        ...typography.bodySm,
        color: colors.textPrimary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
    },
});
