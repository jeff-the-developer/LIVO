import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    SquareLock02FreeIcons,
    UserGroupFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Security Tip Sheet ───────────────────────────────────────────────────────
function SecurityTipSheet({
    visible,
    onOkay,
    onCancel,
}: {
    visible: boolean;
    onOkay: () => void;
    onCancel: () => void;
}): React.ReactElement {
    const footer = (
        <View style={{ gap: spacing.sm }}>
            <TouchableOpacity style={sheetS.btnPrimary} onPress={onOkay} activeOpacity={0.85} testID="tip-okay">
                <Text style={sheetS.btnPrimaryText}>OKAY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sheetS.btnSecondary} onPress={onCancel} activeOpacity={0.85} testID="tip-cancel">
                <Text style={sheetS.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <BottomSheet visible={visible} onClose={onCancel} footer={footer}>
            <View style={sheetS.content}>
                <View style={sheetS.iconCircle}>
                    <HugeiconsIcon icon={UserGroupFreeIcons} size={28} color={colors.textPrimary} />
                </View>
                <Text style={sheetS.title}>Security Tip</Text>
                <Text style={sheetS.body}>
                    You wont be able to make transfers within the next 12 hours after changing your email.
                </Text>
            </View>
        </BottomSheet>
    );
}

// ─── Step enum ────────────────────────────────────────────────────────────────
type Step = 'view' | 'edit';

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SecurityEmailScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [step, setStep] = useState<Step>('view');
    const [showTip, setShowTip] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    // Masked current email (placeholder)
    const maskedEmail = 'fl***@gmail.com';

    const onContinueView = () => {
        // Show security tip before proceeding
        setShowTip(true);
    };

    const onTipOkay = () => {
        setShowTip(false);
        setStep('edit');
    };

    const onTipCancel = () => {
        setShowTip(false);
    };

    const onContinueEdit = () => {
        if (!newEmail.trim()) return;
        // Navigate to OTP verification
        // TODO: send email verification code and navigate to verification screen
        navigation.goBack();
    };

    const isEditValid = newEmail.trim().length > 0 && newEmail.includes('@');

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => {
                        if (step === 'edit') {
                            setStep('view');
                        } else {
                            navigation.goBack();
                        }
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="email-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Email</Text>
                <View style={s.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={s.body}>
                    <Text style={s.label}>Email</Text>

                    {step === 'view' ? (
                        /* ─── View State: masked email with lock ──────── */
                        <View style={s.inputRow}>
                            <Text style={s.inputText}>{maskedEmail}</Text>
                            <HugeiconsIcon icon={SquareLock02FreeIcons} size={18} color={colors.textMuted} />
                        </View>
                    ) : (
                        /* ─── Edit State: editable input ──────────────── */
                        <TextInput
                            style={s.input}
                            value={newEmail}
                            onChangeText={setNewEmail}
                            placeholder="Enter Email Address"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoFocus
                            testID="email-input"
                        />
                    )}
                </View>

                {/* Continue Button */}
                <View style={s.footer}>
                    <TouchableOpacity
                        style={[
                            s.continueBtn,
                            step === 'edit' && !isEditValid && s.continueBtnDisabled,
                        ]}
                        onPress={step === 'view' ? onContinueView : onContinueEdit}
                        disabled={step === 'edit' && !isEditValid}
                        activeOpacity={0.85}
                        testID="email-continue"
                    >
                        <Text
                            style={[
                                s.continueBtnText,
                                step === 'edit' && !isEditValid && s.continueBtnTextDisabled,
                            ]}
                        >
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Security Tip Sheet */}
            <SecurityTipSheet visible={showTip} onOkay={onTipOkay} onCancel={onTipCancel} />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
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

    body: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
    label: {
        ...typography.bodySm, color: colors.textPrimary, fontWeight: '500',
        marginBottom: spacing.sm,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    },
    inputText: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
        ...typography.bodyMd, color: colors.textPrimary,
    },

    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    continueBtn: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center',
    },
    continueBtnDisabled: { backgroundColor: palette.gray100 },
    continueBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    continueBtnTextDisabled: { color: colors.textMuted },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────
const sheetS = StyleSheet.create({
    content: { paddingBottom: spacing.xl },
    iconCircle: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: palette.green50,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3, color: colors.textPrimary, fontWeight: '700',
        marginBottom: spacing.sm,
    },
    body: { ...typography.bodyMd, color: colors.textSecondary, lineHeight: 22 },

    btnPrimary: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center',
    },
    btnPrimaryText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '700', letterSpacing: 1 },
    btnSecondary: {
        backgroundColor: palette.gray100, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center',
    },
    btnSecondaryText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
});
