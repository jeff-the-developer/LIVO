import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Cancel01FreeIcons,
    CreditCardFreeIcons,
    Tick02FreeIcons,
    ArrowDown01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import BottomSheet from '@components/common/BottomSheet';
import Button from '@components/common/Button';
import SheetStateBlock from '@components/common/SheetStateBlock';
import CardCouponSheet from './CardCouponSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'CardActivation'>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const basicCard = require('@assets/images/cards/basic_card.png');

const ACTIVATION_FEE = 10;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CardActivationScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const tier = route.params?.tier ?? 'Basic';

    // Sheet states
    const [showActivateSheet, setShowActivateSheet] = useState(false);
    const [showCouponSheet, setShowCouponSheet] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    const cardName = `Infinite Card 7723`;

    const onActivateCard = () => {
        setShowActivateSheet(true);
    };

    const onConfirmActivation = async () => {
        setIsActivating(true);
        try {
            // Simulate activation API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setShowActivateSheet(false);
            setIsActivating(false);
            setShowSuccess(true);
        } catch {
            setShowActivateSheet(false);
            setIsActivating(false);
            setShowFailure(true);
        }
    };

    const onMaybeLater = () => {
        setShowActivateSheet(false);
        navigation.goBack();
    };

    const onCheckCoupons = () => {
        setShowActivateSheet(false);
        setShowCouponSheet(true);
    };

    const onUseNow = () => {
        setShowSuccess(false);
        // Navigate to card detail / main cards screen
        navigation.goBack();
    };

    const onRetry = () => {
        setShowFailure(false);
        setShowActivateSheet(true);
    };

    const onClose = () => {
        navigation.goBack();
    };

    // ─── Success State ────────────────────────────────────────────────────
    if (showSuccess) {
        return (
            <SafeAreaView style={s.safe} edges={['top']}>
                <View style={s.screen}>
                    {/* Close button */}
                    <View style={s.closeHeader}>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            accessibilityLabel="Close"
                            testID="activation-success-close"
                        >
                            <HugeiconsIcon
                                icon={Cancel01FreeIcons}
                                size={24}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Success content */}
                    <View style={s.successContent}>
                        <View style={s.successIconWrap}>
                            <HugeiconsIcon
                                icon={Tick02FreeIcons}
                                size={28}
                                color={colors.textPrimary}
                            />
                        </View>
                        <Text style={s.successTitle}>
                            Card has been successfully{'\n'}activated
                        </Text>
                        <Text style={s.successSubtitle}>
                            Once funds are transferred in you can start using it.
                        </Text>
                    </View>

                    {/* Card image */}
                    <View style={s.successCardWrap}>
                        <Image
                            source={basicCard}
                            style={s.successCardImage}
                            resizeMode="contain"
                            accessibilityLabel={`${tier} card activated`}
                        />
                    </View>

                    {/* Use Now button */}
                    <View style={s.ctaWrap}>
                        <TouchableOpacity
                            style={s.primaryBtn}
                            onPress={onUseNow}
                            activeOpacity={0.85}
                            accessibilityLabel="Use Now"
                            accessibilityRole="button"
                            testID="activation-use-now"
                        >
                            <Text style={s.primaryBtnText}>Use Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // ─── Default Activation State ─────────────────────────────────────────
    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <View style={s.screen}>
                {/* ─── Card Name Header ──────────────────────────── */}
                <View style={s.cardNameHeader}>
                    <TouchableOpacity
                        style={s.cardNameRow}
                        activeOpacity={0.7}
                        accessibilityLabel="Select card"
                        testID="activation-card-selector"
                    >
                        <Text style={s.cardNameText}>{cardName}</Text>
                        <HugeiconsIcon
                            icon={ArrowDown01FreeIcons}
                            size={18}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>

                {/* ─── Card Display Zone ─────────────────────────── */}
                <View style={s.cardZone}>
                    <Image
                        source={basicCard}
                        style={s.cardImage}
                        resizeMode="contain"
                        accessibilityLabel={`${tier} card`}
                    />
                </View>

                {/* ─── Content Zone ──────────────────────────────── */}
                <View style={s.contentZone}>
                    <Text style={s.title}>
                        Activate Immediately{'\n'}Get started now
                    </Text>
                    <Text style={s.body}>
                        Please complete the card activation process first. You
                        can activate this card using your account cash balance
                        or by using a coupon.
                    </Text>
                </View>

                {/* ─── CTA ───────────────────────────────────────── */}
                <View style={s.ctaWrap}>
                    <TouchableOpacity
                        style={s.primaryBtn}
                        onPress={onActivateCard}
                        activeOpacity={0.85}
                        accessibilityLabel="Activate Card"
                        accessibilityRole="button"
                        testID="card-activate-btn"
                    >
                        <Text style={s.primaryBtnText}>Activate Card</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── Activate Card Sheet ───────────────────────────── */}
            <BottomSheet
                visible={showActivateSheet}
                onClose={() => setShowActivateSheet(false)}
            >
                <View style={sheet.container}>
                    <TouchableOpacity
                        onPress={() => setShowActivateSheet(false)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Go back"
                        testID="activate-sheet-back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    {/* Card icon */}
                    <View style={sheet.iconWrap}>
                        <HugeiconsIcon
                            icon={CreditCardFreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </View>

                    <Text style={sheet.title}>Activate Card</Text>
                    <Text style={sheet.body}>
                        We will DEDUCT ${ACTIVATION_FEE} from your saving
                        account. After that, your card will be activated, and you
                        can use it once the funds are transferred in
                    </Text>

                    {/* Coupon info */}
                    <View style={sheet.divider} />
                    <View style={sheet.couponRow}>
                        <Text style={sheet.couponInfo}>
                            There are currently 0 available coupons.
                        </Text>
                        <TouchableOpacity
                            onPress={onCheckCoupons}
                            activeOpacity={0.7}
                            accessibilityLabel="Check coupons"
                            testID="activate-check-coupons"
                        >
                            <Text style={sheet.checkLink}>Check</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    <View style={sheet.footer}>
                        <TouchableOpacity
                            style={sheet.confirmBtn}
                            onPress={onConfirmActivation}
                            activeOpacity={0.85}
                            disabled={isActivating}
                            accessibilityLabel="Confirm Activation"
                            accessibilityRole="button"
                            testID="activate-confirm"
                        >
                            <Text style={sheet.confirmBtnText}>
                                {isActivating ? 'Activating...' : 'Confirm Activation'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={sheet.laterBtn}
                            onPress={onMaybeLater}
                            activeOpacity={0.85}
                            accessibilityLabel="Maybe later"
                            accessibilityRole="button"
                            testID="activate-maybe-later"
                        >
                            <Text style={sheet.laterBtnText}>Maybe later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>

            {/* ─── Failure Sheet ──────────────────────────────────── */}
            <BottomSheet visible={showFailure} onClose={() => setShowFailure(false)}>
                <View style={sheet.container}>
                    <SheetStateBlock
                        tone="error"
                        title="Operation Failed"
                        description="Card could not be added, please try again or contact customer service."
                    />
                    <View style={sheet.footer}>
                        <Button
                            label="Try Again"
                            onPress={onRetry}
                            testID="activate-retry"
                        />
                    </View>
                </View>
            </BottomSheet>

            {/* ─── Coupon Sheet ───────────────────────────────────── */}
            <CardCouponSheet
                visible={showCouponSheet}
                onClose={() => {
                    setShowCouponSheet(false);
                    setShowActivateSheet(true);
                }}
                onSelectCoupon={() => {
                    setShowCouponSheet(false);
                    // After selecting coupon, go straight to activation
                    setShowActivateSheet(true);
                }}
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1 },

    // Card name header
    cardNameHeader: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
    },
    cardNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardNameText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },

    // Card display — gray background, centered card
    cardZone: {
        flex: 1,
        backgroundColor: '#F2F3F5',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
    },
    cardImage: {
        width: 280,
        height: 180,
    },

    // Content
    contentZone: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.xxl,
        alignItems: 'center',
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    body: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing.sm,
    },

    // CTA
    ctaWrap: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    primaryBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    primaryBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },

    // Close header (success state)
    closeHeader: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
    },

    // Success state
    successContent: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.lg,
    },
    successIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    successTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    successSubtitle: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    successCardWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
    },
    successCardImage: {
        width: 300,
        height: 190,
    },
});

// ─── Bottom Sheet Styles ──────────────────────────────────────────────────────
const sheet = StyleSheet.create({
    container: {
        paddingBottom: spacing.base,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.base,
    },
    failIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.redLight,
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
    body: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.lg,
    },
    couponRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    couponInfo: {
        ...typography.bodySm,
        color: colors.textMuted,
    },
    checkLink: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    footer: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    confirmBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    confirmBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
    laterBtn: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    laterBtnText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
