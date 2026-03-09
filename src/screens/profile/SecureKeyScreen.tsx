import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    SquareLock02FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import PINInput from '@components/common/PINInput';
import SlideToConfirm from '@components/common/SlideToConfirm';
import BottomSheet from '@components/common/BottomSheet';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

/**
 * 'enter'   – user already has a key set and is entering it
 * 'setup'   – first-time setup, user picks a new key
 * 'confirm' – user re-enters the key to confirm
 */
type Step = 'enter' | 'setup' | 'confirm';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NumberPadProps {
    /** Called with a single digit string ('0'–'9') */
    onPress: (digit: string) => void;
    /** Called when the delete key is pressed */
    onDelete: () => void;
}

// ─── Custom Number Pad ────────────────────────────────────────────────────────
function NumberPad({ onPress, onDelete }: NumberPadProps): React.ReactElement {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['•', '0', '<'],
    ];

    return (
        <View style={pad.container}>
            {keys.map((row, ri) => (
                <View key={ri} style={pad.row}>
                    {row.map((key) => (
                        <TouchableOpacity
                            key={key}
                            style={pad.key}
                            onPress={() => {
                                if (key === '<') onDelete();
                                else if (key === '•') { /* dot – no action */ }
                                else onPress(key);
                            }}
                            activeOpacity={0.5}
                            accessibilityLabel={
                                key === '<' ? 'Delete' : key === '•' ? 'Dot' : `Digit ${key}`
                            }
                            accessibilityRole="button"
                            testID={`pad-${key}`}
                        >
                            <Text style={pad.keyText}>
                                {key === '<' ? '‹' : key}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SecureKeyScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    // TODO: Check if key is already set via API to start in 'enter' mode
    const [isKeyAlreadySet] = useState(false);
    const [step, setStep] = useState<Step>(isKeyAlreadySet ? 'enter' : 'setup');
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [setupPin, setSetupPin] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [isError, setIsError] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(5);

    const activeIndex = digits.findIndex((d) => d === '');
    const allFilled = digits.every((d) => d !== '');

    const onDigitPress = useCallback((digit: string) => {
        if (isError) {
            setIsError(false);
            setDigits(['', '', '', '', '', '']);
            return;
        }

        setDigits((prev) => {
            const idx = prev.findIndex((d) => d === '');
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = digit;

            // Auto-advance from setup to confirm when all filled
            if (step === 'setup' && next.every((d) => d !== '')) {
                setTimeout(() => {
                    setSetupPin([...next]);
                    setDigits(['', '', '', '', '', '']);
                    setStep('confirm');
                }, 300);
            }

            // Auto-check in enter mode
            if (step === 'enter' && next.every((d) => d !== '')) {
                setTimeout(() => {
                    // TODO: verify PIN against API
                    setAttemptsLeft((prev) => Math.max(0, prev - 1));
                    setIsError(true);
                    setDigits(['', '', '', '', '', '']);
                }, 300);
            }

            return next;
        });
    }, [step, isError]);

    const onDelete = useCallback(() => {
        if (isError) {
            setIsError(false);
            setDigits(['', '', '', '', '', '']);
            return;
        }
        setDigits((prev) => {
            let lastIdx = -1;
            for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i] !== '') { lastIdx = i; break; }
            }
            if (lastIdx === -1) return prev;
            const next = [...prev];
            next[lastIdx] = '';
            return next;
        });
    }, [isError]);

    const onSlideConfirm = () => {
        if (digits.join('') === setupPin.join('')) {
            setShowSuccess(true);
        } else {
            Alert.alert('Error', 'Security keys do not match. Please try again.');
            setDigits(['', '', '', '', '', '']);
        }
    };

    const onForgotKey = () => setShowForgot(true);

    const onReset = () => {
        setShowForgot(false);
        setIsError(false);
        setDigits(['', '', '', '', '', '']);
        setStep('setup');
    };

    const onContactSupport = () => {
        setShowForgot(false);
        // TODO: navigate to client support
        navigation.goBack();
    };

    // Title text
    let titleText = 'Setup security key';
    if (step === 'confirm') titleText = 'Confirm security key';
    if (step === 'enter' && isError) titleText = `Incorrect, ${attemptsLeft} Attempt Left`;
    else if (step === 'enter') titleText = 'Enter security key';

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header – back arrow only */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => {
                        if (step === 'confirm') {
                            setStep('setup');
                            setDigits(setupPin);
                        } else {
                            navigation.goBack();
                        }
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="securekey-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Lock Icon */}
            <View style={s.iconWrap}>
                <View style={[s.iconCircle, isError && s.iconCircleError]}>
                    <HugeiconsIcon
                        icon={SquareLock02FreeIcons}
                        size={24}
                        color={isError ? palette.red : colors.textPrimary}
                    />
                </View>
            </View>

            {/* Title */}
            <Text style={s.title}>{titleText}</Text>

            {/* PIN Display — uses shared PINInput component */}
            <PINInput digits={digits} activeIndex={activeIndex} isError={isError} />

            {/* Forgot key? link (only in enter step) */}
            {step === 'enter' && (
                <TouchableOpacity
                    onPress={onForgotKey}
                    style={s.forgotWrap}
                    accessibilityLabel="Forgot key"
                    accessibilityRole="button"
                    testID="securekey-forgot"
                >
                    <Text style={s.forgotText}>Forgot key?</Text>
                </TouchableOpacity>
            )}

            <View style={{ flex: 1 }} />

            {/* Number Pad */}
            <NumberPad onPress={onDigitPress} onDelete={onDelete} />

            {/* Slide to Confirm — uses shared SlideToConfirm component */}
            {step === 'confirm' && allFilled && !isError && (
                <View style={s.sliderWrap}>
                    <SlideToConfirm onConfirm={onSlideConfirm} />
                </View>
            )}

            {/* Success Bottom Sheet — uses shared BottomSheet */}
            <BottomSheet visible={showSuccess} onClose={() => navigation.goBack()}>
                <View style={sheet.body}>
                    <View style={sheet.checkCircle}>
                        <Text style={sheet.checkMark}>✓</Text>
                    </View>
                    <Text style={sheet.title}>
                        Security Key Setup{'\n'}Successful
                    </Text>
                </View>
                <View style={sheet.footer}>
                    <TouchableOpacity
                        style={sheet.btnPrimary}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                        accessibilityLabel="Okay"
                        accessibilityRole="button"
                        testID="securekey-okay"
                    >
                        <Text style={sheet.btnPrimaryText}>Okay</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>

            {/* Forgot Pin Bottom Sheet — uses shared BottomSheet */}
            <BottomSheet visible={showForgot} onClose={() => setShowForgot(false)}>
                <View style={sheet.body}>
                    <View style={forgot.iconCircle}>
                        <HugeiconsIcon icon={SquareLock02FreeIcons} size={22} color={palette.red} />
                    </View>
                    <Text style={sheet.title}>Forgot Pin</Text>
                    <Text style={forgot.description}>
                        You won't be able to reset secure key without an existing one. Contact support if you forgot it
                    </Text>
                </View>
                <View style={sheet.footer}>
                    <TouchableOpacity
                        style={sheet.btnPrimary}
                        onPress={onReset}
                        activeOpacity={0.85}
                        accessibilityLabel="Reset secure key"
                        accessibilityRole="button"
                        testID="forgot-reset"
                    >
                        <Text style={sheet.btnPrimaryText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={forgot.btnSecondary}
                        onPress={onContactSupport}
                        activeOpacity={0.85}
                        accessibilityLabel="Contact support"
                        accessibilityRole="button"
                        testID="forgot-support"
                    >
                        <Text style={forgot.btnSecondaryText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    iconWrap: { alignItems: 'center', paddingTop: spacing.lg },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    iconCircleError: { backgroundColor: palette.redLight },
    title: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    forgotWrap: { alignItems: 'center', marginTop: spacing.md },
    forgotText: { ...typography.bodySm, color: colors.primary, fontWeight: '500' },
    sliderWrap: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
});

// ─── Number Pad Styles ────────────────────────────────────────────────────────
const pad = StyleSheet.create({
    container: { paddingHorizontal: spacing.xl, paddingBottom: spacing.base },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
    key: {
        width: 72,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyText: { fontSize: 24, color: colors.textPrimary, fontWeight: '500' },
});

// ─── Shared Sheet Content Styles ──────────────────────────────────────────────
const sheet = StyleSheet.create({
    body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    checkCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    checkMark: { fontSize: 28, color: colors.textPrimary, fontWeight: '700' },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: spacing.sm,
    },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, gap: spacing.sm },
    btnPrimary: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPrimaryText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Forgot Pin Sheet Content Styles ──────────────────────────────────────────
const forgot = StyleSheet.create({
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.redLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    description: {
        ...typography.bodySm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    btnSecondary: {
        backgroundColor: palette.gray100,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnSecondaryText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
