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
    ArrowUp01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SecurityMobileScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [countryCode] = useState('+852');
    const [phone, setPhone] = useState('');

    const isValid = phone.trim().length >= 6;

    const onContinue = () => {
        if (!isValid) return;
        // TODO: send SMS verification code and navigate to OTP screen
        navigation.goBack();
    };

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="mobile-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Mobile</Text>
                <View style={s.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={s.body}>
                    <Text style={s.label}>Username</Text>

                    <View style={s.inputRow}>
                        {/* Country Code Selector */}
                        <TouchableOpacity style={s.codeBtn} activeOpacity={0.7} testID="mobile-country">
                            <Text style={s.codeText}>{countryCode}</Text>
                            <HugeiconsIcon icon={ArrowUp01FreeIcons} size={14} color={colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Phone Input */}
                        <TextInput
                            style={s.phoneInput}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter mobile phone number"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            testID="mobile-input"
                        />
                    </View>
                </View>

                {/* Continue Button */}
                <View style={s.footer}>
                    <TouchableOpacity
                        style={[s.continueBtn, !isValid && s.continueBtnDisabled]}
                        onPress={onContinue}
                        disabled={!isValid}
                        activeOpacity={0.85}
                        testID="mobile-continue"
                    >
                        <Text style={[s.continueBtnText, !isValid && s.continueBtnTextDisabled]}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
        overflow: 'hidden',
    },
    codeBtn: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    },
    codeText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '500' },
    phoneInput: {
        flex: 1, ...typography.bodyMd, color: colors.textPrimary,
        paddingVertical: spacing.md, paddingRight: spacing.base,
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
