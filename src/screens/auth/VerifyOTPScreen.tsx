import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, Delete02FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { RootNavigatorParamList } from "@app-types/navigation.types";
import { useVerifyOTP, useResendOTP, handleApiError } from '@hooks/api/useAuth';
import OTPInput from '@components/common/OTPInput';

type Nav = NativeStackNavigationProp<RootNavigatorParamList>;
type RouteProps = NativeStackScreenProps<RootNavigatorParamList, 'VerifyOTP'>['route'];

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

// ─── Mask identifier ──────────────────────────────────────────────────────────
function maskIdentifier(value: string, type: 'email' | 'phone'): string {
    if (type === 'phone') {
        if (value.length <= 4) return value;
        return value.slice(0, 3) + '****' + value.slice(-4);
    }
    const [local, domain] = value.split('@');
    if (!domain) return value;
    const masked = local.length <= 2
        ? local + '***'
        : local.slice(0, 2) + '***';
    return `${masked}@${domain}`;
}

export default function VerifyOTPScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteProps>();
    const { mode, identifier, identifierType } = route.params;

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [resendSuccess, setResendSuccess] = useState(false);

    const verifyMutation = useVerifyOTP();
    const resendMutation = useResendOTP();

    // ─── Countdown Timer ────────────────────────────────────────────────────────
    useEffect(() => {
        if (resendTimer <= 0) return;
        const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [resendTimer]);

    // ─── Auto-submit when all 6 digits filled ───────────────────────────────────
    const handleVerify = useCallback(
        async (code: string) => {
            try {
                setError(null);
                const result = await verifyMutation.mutateAsync({
                    identifier,
                    code,
                });
                // Navigate based on mode
                if (mode === 'register') {
                    navigation.navigate('SetPassword', {
                        mode: 'register',
                        identifier,
                        userId: result.data.user_id,
                    });
                } else if (mode === 'forgot-password') {
                    navigation.navigate('SetPassword', {
                        mode: 'reset-password',
                        identifier,
                    });
                } else {
                    // edit-email / edit-phone — go back to profile
                    navigation.goBack();
                }
            } catch (err) {
                const e = handleApiError(err);
                setError(e.message);
                // Clear all digits on error
                setDigits(Array(OTP_LENGTH).fill(''));
            }
        },
        [identifier, mode, navigation, verifyMutation],
    );

    // ─── Numpad Press ───────────────────────────────────────────────────────────
    const onNumPress = useCallback(
        (num: string) => {
            setError(null);
            setDigits((prev) => {
                const nextDigits = [...prev];
                const firstEmpty = nextDigits.findIndex((d) => d === '');
                if (firstEmpty === -1) return prev; // all filled
                nextDigits[firstEmpty] = num;

                // Auto-submit on last digit
                if (firstEmpty === OTP_LENGTH - 1) {
                    const code = nextDigits.join('');
                    setTimeout(() => handleVerify(code), 100);
                }
                return nextDigits;
            });
        },
        [handleVerify],
    );

    const onBackspace = useCallback(() => {
        setError(null);
        setDigits((prev) => {
            const nextDigits = [...prev];
            // Find last filled position
            let lastFilled = -1;
            for (let i = OTP_LENGTH - 1; i >= 0; i--) {
                if (nextDigits[i] !== '') {
                    lastFilled = i;
                    break;
                }
            }
            if (lastFilled >= 0) nextDigits[lastFilled] = '';
            return nextDigits;
        });
    }, []);

    // ─── Resend ─────────────────────────────────────────────────────────────────
    const onResend = async () => {
        try {
            await resendMutation.mutateAsync(identifier);
            setResendTimer(RESEND_COOLDOWN);
            setResendSuccess(true);
            setDigits(Array(OTP_LENGTH).fill(''));
            setError(null);
        } catch (err) {
            const e = handleApiError(err);
            Alert.alert('Error', e.message);
        }
    };

    const filledCount = digits.filter((d) => d !== '').length;
    const isVerifying = verifyMutation.isPending;
    const maskedId = maskIdentifier(identifier, identifierType);

    const titleMap = {
        'register': 'Enter Email Code',
        'edit-email': 'Verify Email',
        'edit-phone': 'Verify Phone',
        'forgot-password': 'Enter Reset Code',
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{titleMap[mode]}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Verification code sent to {maskedId}
            </Text>

            {/* OTP Boxes */}
            <View style={styles.otpRow}>
                <OTPInput
                    digits={digits}
                    activeIndex={filledCount}
                    isError={!!error && filledCount === 0}
                    dashAfter={2}
                />
            </View>

            {/* Error / Resend */}
            <View style={styles.statusRow}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <View style={styles.resendRow}>
                        {resendTimer > 0 && (
                            <Text style={styles.resendTimer}>
                                Resend code in {resendTimer}s
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* Spacer */}
            <View style={styles.flex} />

            {/* Custom Numpad */}
            <View style={styles.numpad}>
                {[
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['.', '0', '⌫'],
                ].map((row, ri) => (
                    <View key={ri} style={styles.numpadRow}>
                        {row.map((key) => {
                            const isBackspace = key === '⌫';
                            const isDot = key === '.';
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.numpadKey}
                                    onPress={() => {
                                        if (isBackspace) onBackspace();
                                        else if (!isDot) onNumPress(key);
                                    }}
                                    activeOpacity={isDot ? 1 : 0.5}
                                    disabled={isDot || isVerifying}
                                >
                                    {isBackspace ? (
                                        <HugeiconsIcon icon={Delete02FreeIcons} size={22} color={colors.textSecondary} />
                                    ) : (
                                        <Text
                                            style={[
                                                styles.numpadKeyText,
                                                isDot && styles.numpadKeyDot,
                                            ]}
                                        >
                                            {isDot ? '·' : key}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    backArrow: { ...typography.h3, color: colors.textPrimary },
    title: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    headerSpacer: { width: 36 },

    subtitle: {
        ...typography.bodySm,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
        marginTop: spacing.sm,
    },

    // OTP Boxes
    otpRow: {
        justifyContent: 'center',
        marginTop: spacing.xl,
        paddingHorizontal: spacing.base,
    },

    // Status
    statusRow: {
        alignItems: 'center',
        marginTop: spacing.lg,
        minHeight: 24,
    },
    errorText: {
        ...typography.bodySm,
        color: colors.error,
        textAlign: 'center',
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendTimer: {
        ...typography.bodySm,
        color: colors.textSecondary,
    },
    resendBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendText: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    resendCheck: {
        ...typography.bodySm,
        color: colors.primary,
        fontWeight: '700',
    },

    // Numpad
    numpad: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        gap: spacing.sm,
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    numpadKey: {
        width: 72,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
    },
    numpadKeyText: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '400',
        fontSize: 24,
    },
    numpadKeyDot: {
        color: colors.textMuted,
        fontSize: 20,
    },
    numpadKeyBackspace: {
        fontSize: 28,
        color: colors.textSecondary,
    },
});
