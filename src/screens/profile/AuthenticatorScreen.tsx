import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    SecurityCheckFreeIcons,
    Copy01FreeIcons,
} from '@hugeicons/core-free-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_gradient_icon.png');

type AuthStep = 'intro' | 'qr' | 'set';

const PLACEHOLDER_SECRET = 'UCJWNDNWKNDWKNDNKNWKDNW';

// ─── Intro / Set State ────────────────────────────────────────────────────────
function AuthSetView({
    isAlreadySet,
    onInstall,
    onContinue,
    onReset,
}: {
    isAlreadySet: boolean;
    onInstall: () => void;
    onContinue: () => void;
    onReset: () => void;
}): React.ReactElement {
    return (
        <View style={intro.container}>
            {/* Large green circle with lock icon */}
            <View style={intro.circleWrap}>
                <View style={intro.circle}>
                    <HugeiconsIcon icon={SecurityCheckFreeIcons} size={56} color={colors.textPrimary} />
                </View>
            </View>

            {/* Title + Description */}
            <Text style={intro.title}>Authenticator Set</Text>
            <Text style={intro.description}>
                Make sure you have the authenticator stored{'\n'}in a dafe place. It will be required for verifying{'\n'}sensitive actions
            </Text>

            {/* Buttons */}
            <View style={intro.footer}>
                {isAlreadySet ? (
                    <TouchableOpacity
                        style={intro.btnPrimary}
                        onPress={onReset}
                        activeOpacity={0.85}
                        testID="auth-reset"
                    >
                        <Text style={intro.btnPrimaryText}>Reset authenticator</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={intro.btnPrimary}
                            onPress={onInstall}
                            activeOpacity={0.85}
                            testID="auth-install"
                        >
                            <Text style={intro.btnPrimaryText}>Install</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={intro.btnSecondary}
                            onPress={onContinue}
                            activeOpacity={0.85}
                            testID="auth-continue"
                        >
                            <Text style={intro.btnSecondaryText}>Continue</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

// ─── QR Code State ────────────────────────────────────────────────────────────
function AuthQRView({
    onContinue,
}: {
    onContinue: () => void;
}): React.ReactElement {
    const [code, setCode] = useState(['', '', '', '', '', '']);

    const onCopySecret = async () => {
        await Clipboard.setStringAsync(PLACEHOLDER_SECRET);
        Alert.alert('Copied', 'Secret key copied to clipboard');
    };

    const onPaste = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) {
            const digits = text.replace(/\D/g, '').slice(0, 6).split('');
            const newCode = [...code];
            digits.forEach((d, i) => { newCode[i] = d; });
            setCode(newCode);
        }
    };

    const isFilled = code.every((c) => c !== '');

    return (
        <ScrollView style={qr.scroll} contentContainerStyle={qr.scrollContent} showsVerticalScrollIndicator={false}>
            {/* QR Code Placeholder */}
            <View style={qr.qrCard}>
                <View style={qr.qrPlaceholder}>
                    <Image source={livoIcon} style={qr.qrCenter} resizeMode="contain" />
                    <Text style={qr.qrGrid}>▄▄▄▄▄▄▄▄▄{'\n'}QR Code{'\n'}▀▀▀▀▀▀▀▀▀</Text>
                </View>
            </View>

            {/* Secret Key */}
            <View style={qr.secretCard}>
                <Text style={qr.secretLabel}>Secret Key</Text>
                <View style={qr.secretRow}>
                    <Text style={qr.secretText}>{PLACEHOLDER_SECRET}</Text>
                    <TouchableOpacity onPress={onCopySecret} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} testID="auth-copy">
                        <HugeiconsIcon icon={Copy01FreeIcons} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 6-digit Code Input */}
            <View style={qr.codeRow}>
                {code.map((digit, idx) => (
                    <View key={idx} style={[qr.codeBox, digit && qr.codeBoxFilled]}>
                        <Text style={qr.codeDigit}>{digit}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity onPress={onPaste} activeOpacity={0.7} testID="auth-paste">
                <Text style={qr.pasteText}>Paste</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, minHeight: spacing.xxl }} />

            {/* Continue */}
            <TouchableOpacity
                style={[qr.continueBtn, !isFilled && qr.continueBtnDisabled]}
                onPress={onContinue}
                disabled={!isFilled}
                activeOpacity={0.85}
                testID="auth-qr-continue"
            >
                <Text style={[qr.continueBtnText, !isFilled && qr.continueBtnTextDisabled]}>
                    Continue
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AuthenticatorScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [step, setStep] = useState<AuthStep>('intro');
    // TODO: check if authenticator is already set via API
    const [isAlreadySet] = useState(false);

    const onInstall = () => {
        // TODO: open authenticator app install link
        setStep('qr');
    };

    const onContinue = () => {
        setStep('qr');
    };

    const onQRContinue = () => {
        setStep('set');
    };

    const onReset = () => {
        Alert.alert('Reset Authenticator', 'Are you sure you want to reset your authenticator?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: () => setStep('intro') },
        ]);
    };

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => {
                        if (step === 'qr') setStep('intro');
                        else if (step === 'set') navigation.goBack();
                        else navigation.goBack();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="auth-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                {step === 'qr' && <Text style={s.headerTitle}>Authenticator</Text>}
                {step !== 'qr' && <View style={{ flex: 1 }} />}
                <View style={s.headerSpacer} />
            </View>

            {/* Content */}
            {step === 'intro' && (
                <AuthSetView
                    isAlreadySet={false}
                    onInstall={onInstall}
                    onContinue={onContinue}
                    onReset={onReset}
                />
            )}
            {step === 'qr' && <AuthQRView onContinue={onQRContinue} />}
            {step === 'set' && (
                <AuthSetView
                    isAlreadySet={isAlreadySet || true}
                    onInstall={() => { }}
                    onContinue={() => { }}
                    onReset={onReset}
                />
            )}
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
});

// ─── Intro / Set Styles ───────────────────────────────────────────────────────
const intro = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.base },
    circleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    circle: {
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: palette.green50,
        alignItems: 'center', justifyContent: 'center',
    },
    title: {
        ...typography.h2, color: colors.textPrimary, fontWeight: '800',
        textAlign: 'center', marginBottom: spacing.sm,
    },
    description: {
        ...typography.bodySm, color: colors.textSecondary,
        textAlign: 'center', lineHeight: 20, marginBottom: spacing.xxl,
    },
    footer: { width: '100%', gap: spacing.sm, paddingBottom: spacing.base },
    btnPrimary: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center',
    },
    btnPrimaryText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    btnSecondary: {
        backgroundColor: palette.gray100, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center',
    },
    btnSecondaryText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
});

// ─── QR Styles ────────────────────────────────────────────────────────────────
const qr = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: spacing.base, paddingBottom: spacing.base,
        alignItems: 'center', flexGrow: 1,
    },
    qrCard: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.card * 1.5,
        padding: spacing.xl, marginBottom: spacing.lg, alignSelf: 'stretch',
        alignItems: 'center',
    },
    qrPlaceholder: {
        width: 200, height: 200, alignItems: 'center', justifyContent: 'center',
    },
    qrCenter: { width: 60, height: 60, borderRadius: 14, position: 'absolute' },
    qrGrid: {
        ...typography.bodySm, color: colors.textMuted,
        textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    secretCard: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.card,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
        alignSelf: 'stretch', marginBottom: spacing.lg,
    },
    secretLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
    secretRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    secretText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600', letterSpacing: 0.5 },

    codeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    codeBox: {
        width: 48, height: 48, borderRadius: borderRadius.md,
        borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    codeBoxFilled: { backgroundColor: palette.green50, borderColor: colors.primary },
    codeDigit: { ...typography.h4, color: colors.textPrimary, fontWeight: '700' },

    pasteText: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '500' },

    continueBtn: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center',
        alignSelf: 'stretch',
    },
    continueBtnDisabled: { backgroundColor: palette.gray100 },
    continueBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    continueBtnTextDisabled: { color: colors.textMuted },
});
