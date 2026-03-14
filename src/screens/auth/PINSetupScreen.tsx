import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, Delete02FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { RootNavigatorParamList } from "@app-types/navigation.types";
import { useSetupPIN, handleApiError } from '@hooks/api/useAuth';

type Nav = NativeStackNavigationProp<RootNavigatorParamList>;

const PIN_LENGTH = 6;

export default function PINSetupScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const setupMutation = useSetupPIN();

    const [step, setStep] = useState<'create' | 'confirm'>('create');
    const [pin1, setPin1] = useState<string[]>(Array(PIN_LENGTH).fill(''));
    const [pin2, setPin2] = useState<string[]>(Array(PIN_LENGTH).fill(''));
    const [error, setError] = useState<string | null>(null);

    // Active digits
    const digits = step === 'create' ? pin1 : pin2;
    const filledCount = digits.filter((d) => d !== '').length;

    const handleConfirm = useCallback(
        async (confirmCode: string) => {
            const originalCode = pin1.join('');
            if (originalCode !== confirmCode) {
                setError("PINs don't match. Please try again.");
                setPin2(Array(PIN_LENGTH).fill(''));
                return;
            }

            try {
                setError(null);
                await setupMutation.mutateAsync({ pin: confirmCode });
                
                // Onboarding complete, navigate to MainTabs safely
                navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
            } catch (err) {
                const e = handleApiError(err);
                setError(e.message);
                setPin2(Array(PIN_LENGTH).fill(''));
            }
        },
        [pin1, navigation, setupMutation],
    );

    const onNumPress = useCallback(
        (num: string) => {
            setError(null);
            const setDigits = step === 'create' ? setPin1 : setPin2;
            
            setDigits((prev) => {
                const nextDigits = [...prev];
                const firstEmpty = nextDigits.findIndex((d) => d === '');
                if (firstEmpty === -1) return prev; // all filled
                nextDigits[firstEmpty] = num;

                // Auto-advance
                if (firstEmpty === PIN_LENGTH - 1) {
                    const code = nextDigits.join('');
                    if (step === 'create') {
                        setTimeout(() => setStep('confirm'), 200);
                    } else {
                        setTimeout(() => handleConfirm(code), 100);
                    }
                }
                return nextDigits;
            });
        },
        [step, handleConfirm],
    );

    const onBackspace = useCallback(() => {
        setError(null);
        const setDigits = step === 'create' ? setPin1 : setPin2;
        
        setDigits((prev) => {
            const nextDigits = [...prev];
            let lastFilled = -1;
            for (let i = PIN_LENGTH - 1; i >= 0; i--) {
                if (nextDigits[i] !== '') {
                    lastFilled = i;
                    break;
                }
            }
            if (lastFilled >= 0) nextDigits[lastFilled] = '';
            // If we're at the beginning of 'confirm' and hit backspace, go back to 'create' step
            else if (step === 'confirm') {
                setStep('create');
                setPin1((p) => {
                    const np = [...p];
                    np[PIN_LENGTH - 1] = ''; // remove last digit of step 1 to let user edit
                    return np;
                });
            }
            return nextDigits;
        });
    }, [step]);

    const isSubmitting = setupMutation.isPending;

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                        if (step === 'confirm') {
                            setStep('create');
                            setPin2(Array(PIN_LENGTH).fill(''));
                        } else {
                            // During onboarding, we shouldn't necessarily let them go back to unverified states
                            Alert.alert('Skip PIN setup?', 'A PIN keeps your transactions secure.', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Skip', style: 'default', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }) }
                            ]);
                        }
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{step === 'create' ? 'Set Up PIN' : 'Confirm PIN'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                {step === 'create' 
                    ? 'Set a 6-digit transaction PIN for added security.' 
                    : 'Re-enter your 6-digit PIN to confirm.'}
            </Text>

            {/* OTP Boxes */}
            <View style={styles.otpRow}>
                {digits.map((d, i) => {
                    const isFocused = i === filledCount && !error;
                    const hasError = !!error && filledCount === 0;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.otpBox,
                                isFocused && styles.otpBoxFocused,
                                d !== '' && styles.otpBoxFilled,
                                hasError && styles.otpBoxError,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.otpDigit,
                                    hasError && styles.otpDigitError,
                                ]}
                            >
                                {d !== '' ? '•' : ''}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Error Message */}
            <View style={styles.statusRow}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : isSubmitting ? (
                    <ActivityIndicator color={colors.primary} />
                ) : null}
            </View>

            <View style={styles.flex} />

            {/* Numpad */}
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
                                    disabled={isDot || isSubmitting}
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
        gap: spacing.sm,
        paddingHorizontal: spacing.base,
    },
    otpBox: {
        width: 44,
        height: 52,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    otpBoxFocused: {
        borderColor: colors.primary,
    },
    otpBoxFilled: {
        borderColor: colors.textPrimary,
        backgroundColor: colors.surfaceAlt,
    },
    otpBoxError: {
        borderColor: colors.error,
        backgroundColor: '#FEE2E2',
    },
    otpDigit: {
        ...typography.h2,
        color: colors.textPrimary,
        lineHeight: 32, // to vertically center the big dot
        marginTop: Platform.OS === 'ios' ? 4 : 0, 
    },
    otpDigitError: {
        color: colors.error,
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
});
