import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    StarFreeIcons,
    Settings01FreeIcons,
    AlertCircleFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_gradient_icon.png');

const APP_VERSION = '1.3.46(156)';

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({
    rating,
    onRate,
}: {
    rating: number;
    onRate: (n: number) => void;
}): React.ReactElement {
    return (
        <View style={starS.row}>
            {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                    key={n}
                    onPress={() => onRate(n)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    testID={`star-${n}`}
                >
                    <View
                        style={[
                            starS.star,
                            n <= rating ? starS.starFilled : starS.starEmpty,
                        ]}
                    >
                        <HugeiconsIcon
                            icon={StarFreeIcons}
                            size={28}
                            color={n <= rating ? colors.primary : palette.green200}
                        />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Rate & Feedback Sheet ────────────────────────────────────────────────────
type RatingStep = 'rate' | 'thankyou';

function RatingSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    const [rating, setRating] = useState(0);
    const [step, setStep] = useState<RatingStep>('rate');

    const onSubmit = () => {
        if (rating === 0) return;
        setStep('thankyou');
    };

    const onLeaveComments = () => {
        // TODO: open App Store review page
        if (Platform.OS === 'ios') {
            Linking.openURL('https://apps.apple.com/app/livopay/id1234567890?action=write-review');
        }
        onDismiss();
    };

    const onDismiss = () => {
        onClose();
        // Reset after animation
        setTimeout(() => {
            setRating(0);
            setStep('rate');
        }, 300);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
            <View style={sheetS.overlay}>
                {step === 'rate' ? (
                    <View style={sheetS.sheet}>
                        <View style={sheetS.handle} />
                        <View style={sheetS.rateContent}>
                            <Image source={livoIcon} style={sheetS.rateIcon} resizeMode="contain" />
                            <Text style={sheetS.rateTitle}>Enjoying LIVOPay?</Text>
                            <StarRating rating={rating} onRate={setRating} />
                        </View>
                        <View style={sheetS.footer}>
                            <TouchableOpacity
                                style={[sheetS.btn, rating > 0 ? sheetS.btnActive : sheetS.btnDisabled]}
                                onPress={onSubmit}
                                activeOpacity={0.85}
                                disabled={rating === 0}
                                testID="submit-rating"
                            >
                                <Text style={[sheetS.btnText, rating > 0 ? sheetS.btnTextActive : null]}>
                                    Submit Rating
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={sheetS.btnSecondary}
                                onPress={onDismiss}
                                activeOpacity={0.85}
                                testID="rating-later"
                            >
                                <Text style={sheetS.btnSecondaryText}>Maybe Later</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={thankS.container}>
                        <View style={thankS.centerContent}>
                            {/* Large circle placeholder */}
                            <View style={thankS.circle} />
                            <Text style={thankS.title}>THANK YOU FOR{'\n'}YOUR SUPPORT</Text>
                            <Text style={thankS.subtitle}>
                                We're committed to delivering the best experience possible.
                                If you're enjoying the app, we'd appreciate your feedback on the App Store
                            </Text>
                        </View>
                        <View style={sheetS.footer}>
                            <TouchableOpacity
                                style={[sheetS.btn, sheetS.btnActive]}
                                onPress={onLeaveComments}
                                activeOpacity={0.85}
                                testID="leave-comments"
                            >
                                <Text style={[sheetS.btnText, sheetS.btnTextActive]}>Leave Comments</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={sheetS.btnSecondary}
                                onPress={onDismiss}
                                activeOpacity={0.85}
                                testID="thankyou-later"
                            >
                                <Text style={sheetS.btnSecondaryText}>Maybe Later</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

// ─── Check for Updates Sheet ──────────────────────────────────────────────────
function UpdateSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={sheetS.overlay}>
                <View style={sheetS.sheet}>
                    <View style={sheetS.handle} />
                    <View style={sheetS.updateContent}>
                        <View style={sheetS.alertIcon}>
                            <HugeiconsIcon icon={AlertCircleFreeIcons} size={28} color={palette.orange} />
                        </View>
                        <Text style={sheetS.updateTitle}>
                            The latest version is currently{'\n'}available
                        </Text>
                    </View>
                    <View style={sheetS.footer}>
                        <TouchableOpacity
                            style={[sheetS.btn, sheetS.btnActive]}
                            onPress={onClose}
                            activeOpacity={0.85}
                            testID="update-okay"
                        >
                            <Text style={[sheetS.btnText, sheetS.btnTextActive]}>Okay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AboutLIVOPayScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [showRating, setShowRating] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="about-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Display</Text>
                <View style={s.headerSpacer} />
            </View>

            {/* Logo + Name */}
            <View style={s.logoArea}>
                <Image source={livoIcon} style={s.logo} resizeMode="contain" />
                <Text style={s.appName}>LIVOPay</Text>
            </View>

            {/* Menu */}
            <View style={s.menu}>
                <TouchableOpacity
                    style={s.menuRow}
                    onPress={() => setShowRating(true)}
                    activeOpacity={0.7}
                    testID="about-rate"
                >
                    <HugeiconsIcon icon={StarFreeIcons} size={22} color={colors.textPrimary} />
                    <Text style={s.menuLabel}>Rate & Feedback</Text>
                    <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.menuRow}
                    onPress={() => setShowUpdate(true)}
                    activeOpacity={0.7}
                    testID="about-updates"
                >
                    <HugeiconsIcon icon={Settings01FreeIcons} size={22} color={colors.textPrimary} />
                    <Text style={s.menuLabel}>Check for Updates</Text>
                    <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }} />

            {/* Version */}
            <View style={s.versionWrap}>
                <Text style={s.version}>{APP_VERSION}</Text>
            </View>

            {/* Sheets */}
            <RatingSheet visible={showRating} onClose={() => setShowRating(false)} />
            <UpdateSheet visible={showUpdate} onClose={() => setShowUpdate(false)} />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
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

    logoArea: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.xxl },
    logo: { width: 80, height: 80, borderRadius: 20, marginBottom: spacing.base },
    appName: { ...typography.h3, color: colors.textPrimary, fontWeight: '700' },

    menu: { paddingHorizontal: spacing.base },
    menuRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.md, gap: spacing.sm,
    },
    menuLabel: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },

    versionWrap: { alignItems: 'center', paddingBottom: spacing.lg },
    version: {
        ...typography.bodySm, color: colors.textPrimary, fontWeight: '500',
        backgroundColor: palette.gray100, paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm, borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────
const sheetS = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: spacing.base,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
        alignSelf: 'center', marginBottom: spacing.lg,
    },

    // Rate content
    rateContent: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    rateIcon: { width: 56, height: 56, borderRadius: 14, marginBottom: spacing.base },
    rateTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.lg },

    // Update content
    updateContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    alertIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#FFF3CD', alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    updateTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '700', lineHeight: 30 },

    // Shared footer
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, gap: spacing.sm },
    btn: {
        borderRadius: borderRadius.full, paddingVertical: spacing.base,
        alignItems: 'center', justifyContent: 'center',
    },
    btnActive: { backgroundColor: colors.textPrimary },
    btnDisabled: { backgroundColor: palette.gray100 },
    btnText: { ...typography.bodyMd, fontWeight: '600' },
    btnTextActive: { color: colors.buttonText },
    btnSecondary: {
        borderRadius: borderRadius.full, paddingVertical: spacing.base,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: palette.gray100,
    },
    btnSecondaryText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
});

// ─── Star Styles ──────────────────────────────────────────────────────────────
const starS = StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm },
    star: { padding: spacing.xs },
    starFilled: {},
    starEmpty: { opacity: 0.4 },
});

// ─── Thank You Styles ─────────────────────────────────────────────────────────
const thankS = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.background,
        paddingHorizontal: spacing.base,
    },
    centerContent: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
    },
    circle: {
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: palette.gray100, marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h2, color: colors.textPrimary, fontWeight: '900',
        textAlign: 'center', marginBottom: spacing.base,
    },
    subtitle: {
        ...typography.bodySm, color: colors.textSecondary,
        textAlign: 'center', lineHeight: 20, marginBottom: spacing.xxl,
        paddingHorizontal: spacing.sm,
    },
});
