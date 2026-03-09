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
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import SecurityTipSheet from '@components/common/SecurityTipSheet';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

/** Maximum length for the anti-phishing code */
const MAX_CODE_LENGTH = 12;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AntiPhishingScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [code, setCode] = useState('');
    const [showTip, setShowTip] = useState(false);

    const canSubmit = code.length > 0;

    const onSubmit = () => setShowTip(true);

    const onTipOkay = () => {
        setShowTip(false);
        // TODO: call API to set anti-phishing code
        navigation.goBack();
    };

    const handleCodeChange = (text: string) => {
        if (text.length <= MAX_CODE_LENGTH) {
            setCode(text);
        }
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
                    accessibilityRole="button"
                    testID="phishing-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Anti-Phishing Code</Text>
                <View style={s.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={s.content}>
                    <Text style={s.label}>Set Code</Text>
                    <View style={s.inputRow}>
                        <TextInput
                            style={s.input}
                            value={code}
                            onChangeText={handleCodeChange}
                            placeholder="Enter anti-phishing code"
                            placeholderTextColor={colors.textMuted}
                            maxLength={MAX_CODE_LENGTH}
                            autoCapitalize="none"
                            accessibilityLabel="Anti-phishing code"
                            testID="phishing-input"
                        />
                        <Text style={s.counter}>
                            {code.length}/{MAX_CODE_LENGTH}
                        </Text>
                    </View>
                </View>

                <View style={{ flex: 1 }} />

                {/* Submit Button */}
                <View style={s.footer}>
                    <TouchableOpacity
                        style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
                        onPress={onSubmit}
                        disabled={!canSubmit}
                        activeOpacity={0.85}
                        accessibilityLabel="Submit anti-phishing code"
                        accessibilityRole="button"
                        testID="phishing-submit"
                    >
                        <Text style={[s.submitBtnText, !canSubmit && s.submitBtnTextDisabled]}>
                            Submit
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Security Tip Sheet — uses shared SecurityTipSheet */}
            <SecurityTipSheet
                visible={showTip}
                description="All message we send will contain the code you set. Ones without this code may be fraudulent"
                onPrimary={onTipOkay}
                onSecondary={() => setShowTip(false)}
                testIDPrefix="phishing-tip"
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    input: { flex: 1, ...typography.bodyMd, color: colors.textPrimary },
    counter: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    submitBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnDisabled: { backgroundColor: palette.gray100 },
    submitBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    submitBtnTextDisabled: { color: colors.textMuted },
});
