import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    UserGroupFreeIcons,
    CheckmarkCircle01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import BottomSheet from '@components/common/BottomSheet';
import PasswordInput from '@components/common/PasswordInput';
import SecurityTipSheet from '@components/common/SecurityTipSheet';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useChangePassword, handleApiError } from '@hooks/api/useSettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

/** Which verification method the user chose */
type VerifyMethod = 'password' | 'email' | null;
/** Which step of the password change flow we are on */
type ScreenStep = 'old' | 'new';

// ─── Verify Sheet ─────────────────────────────────────────────────────────────
interface VerifySheetProps {
    /** Whether the sheet is visible */
    visible: boolean;
    /** Currently selected verification method */
    selected: VerifyMethod;
    /** Called when the user selects a method */
    onSelect: (m: VerifyMethod) => void;
    /** Called when the user presses Continue */
    onContinue: () => void;
    /** Called when the sheet is dismissed */
    onClose: () => void;
}

function VerifySheet({
    visible,
    selected,
    onSelect,
    onContinue,
    onClose,
}: VerifySheetProps): React.ReactElement {
    return (
        <BottomSheet visible={visible} onClose={onClose}>
            {/* Back */}
            <TouchableOpacity
                style={vs.back}
                onPress={onClose}
                accessibilityLabel="Close verification"
                accessibilityRole="button"
                testID="verify-back"
            >
                <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Person icon */}
            <View style={vs.iconCircle}>
                <HugeiconsIcon icon={UserGroupFreeIcons} size={24} color={colors.textPrimary} />
            </View>
            <Text style={vs.title}>Verify</Text>

            {/* Options */}
            <TouchableOpacity
                style={vs.option}
                onPress={() => onSelect('password')}
                activeOpacity={0.7}
                accessibilityLabel="Via Old Password"
                accessibilityRole="radio"
                testID="verify-password"
            >
                <Text style={vs.optionText}>Via Old Password</Text>
                <View style={[vs.checkbox, selected === 'password' && vs.checkboxSelected]}>
                    {selected === 'password' && <Text style={vs.checkIcon}>✓</Text>}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={vs.option}
                onPress={() => onSelect('email')}
                activeOpacity={0.7}
                accessibilityLabel="Via Email Code"
                accessibilityRole="radio"
                testID="verify-email"
            >
                <Text style={vs.optionText}>Via Email Code</Text>
                <View style={[vs.checkbox, selected === 'email' && vs.checkboxSelected]}>
                    {selected === 'email' && <Text style={vs.checkIcon}>✓</Text>}
                </View>
            </TouchableOpacity>

            <View style={{ flex: 1, minHeight: 200 }} />

            {/* Continue */}
            <View style={vs.footerWrap}>
                <TouchableOpacity
                    style={[vs.continueBtn, !selected && vs.continueBtnDisabled]}
                    onPress={onContinue}
                    disabled={!selected}
                    activeOpacity={0.85}
                    accessibilityLabel="Continue"
                    accessibilityRole="button"
                    testID="verify-continue"
                >
                    <Text style={[vs.continueBtnText, !selected && vs.continueBtnTextDisabled]}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginPasswordScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [step, setStep] = useState<ScreenStep>('old');
    const [showVerify, setShowVerify] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const changePwMutation = useChangePassword();

    // Validation rules for new password
    const hasLength = newPassword.length >= 8 && newPassword.length <= 32;
    const hasVariety =
        /[0-9]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /[^a-zA-Z0-9]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const canContinueNew = hasLength && hasVariety && passwordsMatch;
    const canContinueOld = verifyMethod !== null && oldPassword.length > 0;

    const onContinueOld = () => setShowTip(true);

    const onTipOkay = () => {
        setShowTip(false);
        setStep('new');
    };

    const onContinueNew = () => {
        changePwMutation.mutate(
            { current_password: oldPassword, new_password: newPassword },
            {
                onSuccess: () => navigation.goBack(),
                onError: (err) => Alert.alert('Error', handleApiError(err).message),
            },
        );
    };

    const verifyLabel =
        verifyMethod === 'password'
            ? 'Via Old Password'
            : verifyMethod === 'email'
                ? 'Via Email Code'
                : 'Select';

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => {
                        if (step === 'new') setStep('old');
                        else navigation.goBack();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="password-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Password</Text>
                <View style={s.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={s.flex}
                    contentContainerStyle={s.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 'old' ? (
                        <>
                            {/* Verify selector */}
                            <Text style={s.label}>Verify</Text>
                            <TouchableOpacity
                                style={inp.selectorRow}
                                onPress={() => setShowVerify(true)}
                                activeOpacity={0.7}
                                accessibilityLabel="Select verification method"
                                accessibilityRole="button"
                                testID="password-verify-select"
                            >
                                <Text style={[inp.selectText, verifyMethod && inp.selectTextSelected]}>
                                    {verifyLabel}
                                </Text>
                                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                            </TouchableOpacity>

                            {/* Old Password — uses shared PasswordInput */}
                            <Text style={[s.label, { marginTop: spacing.lg }]}>Old Password</Text>
                            <PasswordInput
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                placeholder="Enter Old Password"
                                testID="password-old"
                            />
                        </>
                    ) : (
                        <>
                            {/* New Password — uses shared PasswordInput */}
                            <Text style={s.label}>New Password</Text>
                            <PasswordInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter New Password"
                                testID="password-new"
                            />

                            {/* Validation Rules */}
                            <View style={s.rules}>
                                <View style={s.ruleRow}>
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle01FreeIcons}
                                        size={16}
                                        color={hasLength ? colors.primary : colors.textMuted}
                                    />
                                    <Text style={[s.ruleText, hasLength && s.ruleTextValid]}>
                                        8-32 characters
                                    </Text>
                                </View>
                                <View style={s.ruleRow}>
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle01FreeIcons}
                                        size={16}
                                        color={hasVariety ? colors.primary : colors.textMuted}
                                    />
                                    <Text style={[s.ruleText, hasVariety && s.ruleTextValid]}>
                                        At least 1 number, uppercase letter and 1 symbol
                                    </Text>
                                </View>
                            </View>

                            {/* Confirm — uses shared PasswordInput */}
                            <Text style={[s.label, { marginTop: spacing.lg }]}>Confirm</Text>
                            <PasswordInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm Password"
                                testID="password-confirm"
                            />
                        </>
                    )}
                </ScrollView>

                {/* Continue Button */}
                <View style={s.footer}>
                    {(() => {
                        const canContinue = step === 'old' ? canContinueOld : canContinueNew;
                        const isPending = step === 'new' && changePwMutation.isPending;
                        return (
                            <TouchableOpacity
                                style={[s.continueBtn, (!canContinue || isPending) && s.continueBtnDisabled]}
                                onPress={step === 'old' ? onContinueOld : onContinueNew}
                                disabled={!canContinue || isPending}
                                activeOpacity={0.85}
                                accessibilityLabel="Continue"
                                accessibilityRole="button"
                                testID="password-continue"
                            >
                                {isPending ? (
                                    <ActivityIndicator color={colors.buttonText} />
                                ) : (
                                    <Text style={[s.continueBtnText, !canContinue && s.continueBtnTextDisabled]}>
                                        Continue
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })()}
                </View>
            </KeyboardAvoidingView>

            {/* Verify Sheet — uses shared BottomSheet */}
            <VerifySheet
                visible={showVerify}
                selected={verifyMethod}
                onSelect={setVerifyMethod}
                onContinue={() => setShowVerify(false)}
                onClose={() => setShowVerify(false)}
            />

            {/* Security Tip Sheet — uses shared SecurityTipSheet */}
            <SecurityTipSheet
                visible={showTip}
                description="You are won't be able to make transfers within 12hours after changing your password"
                onPrimary={onTipOkay}
                onSecondary={() => setShowTip(false)}
                testIDPrefix="password-tip"
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
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
    content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
    label: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    rules: { marginTop: spacing.sm, gap: spacing.xs },
    ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    ruleText: { ...typography.caption, color: colors.textMuted },
    ruleTextValid: { color: colors.textPrimary },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    continueBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueBtnDisabled: { backgroundColor: palette.gray100 },
    continueBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    continueBtnTextDisabled: { color: colors.textMuted },
});

// ─── Verify Selector Input Styles ─────────────────────────────────────────────
const inp = StyleSheet.create({
    selectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    selectText: { flex: 1, ...typography.bodyMd, color: colors.textMuted },
    selectTextSelected: { color: colors.textPrimary },
});

// ─── Verify Sheet Styles ──────────────────────────────────────────────────────
const vs = StyleSheet.create({
    back: { paddingHorizontal: spacing.base, marginBottom: spacing.lg },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.base,
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        paddingHorizontal: spacing.base,
        marginBottom: spacing.lg,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    optionText: { flex: 1, ...typography.bodyMd, color: colors.textPrimary },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.textPrimary,
        borderColor: colors.textPrimary,
    },
    checkIcon: { color: colors.buttonText, fontSize: 14, fontWeight: '700' },
    footerWrap: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    continueBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueBtnDisabled: { backgroundColor: palette.gray100 },
    continueBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    continueBtnTextDisabled: { color: colors.textMuted },
});
