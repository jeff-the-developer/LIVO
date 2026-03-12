import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Calendar01FreeIcons,
    InformationCircleFreeIcons,
    CreditCardFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useCoupons } from '@hooks/api/useCoupons';
import type { Coupon } from '@api/coupons';
import BottomSheet from '@components/common/BottomSheet';

// ─── Card Coupon Info (for detail view) ───────────────────────────────────────
export interface CardCouponSelection {
    coupon: Coupon;
    /** Derived display line, e.g. "Obtain a LIVOPay Standard card" */
    subtitle: string;
    /** Full description for detail sheet */
    detailDescription: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    visible: boolean;
    onClose: () => void;
    onSelectCoupon: (selection: CardCouponSelection) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CardCouponSheet({
    visible,
    onClose,
    onSelectCoupon,
}: Props): React.ReactElement {
    const { data: coupons } = useCoupons();
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    // Filter to only active, card-related coupons
    const cardCoupons = (coupons ?? []).filter(
        (c) => c.status === 'active',
    );

    const hasItems = cardCoupons.length > 0;

    const formatDate = (isoDate: string) =>
        new Date(isoDate).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

    const handleCouponTap = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
    };

    const handleConfirm = () => {
        if (!selectedCoupon) return;
        const selection: CardCouponSelection = {
            coupon: selectedCoupon,
            subtitle: 'Obtain a LIVOPay Standard card',
            detailDescription:
                'This voucher can be redeemed for one Mastercard LIVOPay Standard card. Available issuing regions are Hong Kong, Singapore, and the United Kingdom.',
        };
        onSelectCoupon(selection);
        setSelectedCoupon(null);
        onClose();
    };

    const handleBackFromDetail = () => {
        setSelectedCoupon(null);
    };

    const handleClose = () => {
        setSelectedCoupon(null);
        onClose();
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose}>
            {selectedCoupon ? (
                /* ─── Detail View ──────────────────────────────────── */
                <View style={s.detailContainer}>
                    <TouchableOpacity
                        onPress={handleBackFromDetail}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Go back"
                        testID="coupon-detail-back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    {/* Card icon */}
                    <View style={s.detailIconWrap}>
                        <HugeiconsIcon
                            icon={CreditCardFreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </View>

                    <Text style={s.detailTitle}>Card redemption coupon</Text>
                    <Text style={s.detailBody}>
                        This voucher can be redeemed for one Mastercard LIVOPay
                        Standard card. Available issuing regions are Hong Kong,
                        Singapore, and the United Kingdom.
                    </Text>

                    <View style={s.detailMeta}>
                        <View style={s.metaRow}>
                            <View style={s.metaIconCircle}>
                                <HugeiconsIcon
                                    icon={Calendar01FreeIcons}
                                    size={12}
                                    color={colors.textPrimary}
                                />
                            </View>
                            <Text style={s.metaText}>
                                Valid until {formatDate(selectedCoupon.expires_at)}
                            </Text>
                        </View>
                        <View style={s.metaRow}>
                            <View style={s.metaIconCircle}>
                                <HugeiconsIcon
                                    icon={InformationCircleFreeIcons}
                                    size={12}
                                    color={colors.textPrimary}
                                />
                            </View>
                            <Text style={s.metaText}>Not transferable</Text>
                        </View>
                    </View>

                    <View style={s.confirmWrap}>
                        <TouchableOpacity
                            style={s.confirmBtn}
                            onPress={handleConfirm}
                            activeOpacity={0.85}
                            accessibilityLabel="Confirm to add"
                            accessibilityRole="button"
                            testID="coupon-confirm-add"
                        >
                            <Text style={s.confirmBtnText}>Confirm to add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                /* ─── List View ────────────────────────────────────── */
                <View style={s.listContainer}>
                    <TouchableOpacity
                        onPress={handleClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Go back"
                        testID="coupon-list-back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    {/* Gift icon */}
                    <View style={s.giftIconWrap}>
                        <Text style={s.giftEmoji}>🎁</Text>
                    </View>

                    <Text style={s.listTitle}>
                        {hasItems ? 'Use Coupons' : 'Add Now'}
                    </Text>

                    {hasItems && (
                        <ScrollView
                            style={s.listScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {cardCoupons.map((coupon) => (
                                <TouchableOpacity
                                    key={coupon.id}
                                    style={s.couponCard}
                                    onPress={() => handleCouponTap(coupon)}
                                    activeOpacity={0.7}
                                    accessibilityLabel={`Coupon: ${coupon.title}`}
                                    testID={`card-coupon-${coupon.id}`}
                                >
                                    <View style={s.couponContent}>
                                        <Text style={s.couponTitle} numberOfLines={1}>
                                            Card redemption coupon
                                        </Text>
                                        <Text style={s.couponSubtitle} numberOfLines={1}>
                                            Obtain a LIVOPay Standard card
                                        </Text>

                                        <View style={s.metaRow}>
                                            <View style={s.metaIconCircle}>
                                                <HugeiconsIcon
                                                    icon={Calendar01FreeIcons}
                                                    size={12}
                                                    color={colors.textPrimary}
                                                />
                                            </View>
                                            <Text style={s.metaText}>
                                                Valid until {formatDate(coupon.expires_at)}
                                            </Text>
                                        </View>

                                        <View style={s.metaRow}>
                                            <View style={s.metaIconCircle}>
                                                <HugeiconsIcon
                                                    icon={InformationCircleFreeIcons}
                                                    size={12}
                                                    color={colors.textPrimary}
                                                />
                                            </View>
                                            <Text style={s.metaText}>Not transferable</Text>
                                        </View>
                                    </View>

                                    <View style={s.couponImageWrap}>
                                        <Image
                                            source={require('@assets/images/coupons/Frame 120.png')}
                                            style={s.couponImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}
        </BottomSheet>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // List View
    listContainer: {
        paddingBottom: spacing.base,
    },
    giftIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.base,
    },
    giftEmoji: {
        fontSize: 24,
    },
    listTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.lg,
    },
    listScroll: {
        maxHeight: 400,
    },

    // Coupon Card
    couponCard: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
        marginBottom: spacing.sm,
        minHeight: 125,
    },
    couponContent: {
        flex: 1,
        padding: spacing.base,
        justifyContent: 'center',
    },
    couponTitle: {
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: 4,
    },
    couponSubtitle: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    couponImageWrap: {
        width: 125,
        height: 125,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        marginRight: 16,
    },
    couponImage: {
        width: '100%',
        height: '100%',
    },

    // Meta rows
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaText: {
        ...typography.caption,
        color: colors.textSecondary,
    },

    // Detail View
    detailContainer: {
        paddingBottom: spacing.base,
    },
    detailIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.base,
    },
    detailTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.md,
    },
    detailBody: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    detailMeta: {
        gap: spacing.xs,
        marginBottom: spacing.xxl,
    },

    // Confirm button
    confirmWrap: {
        paddingTop: spacing.lg,
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
});
