import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useUpdatePhone, handleApiError } from '@hooks/api/useProfile';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Country code data ────────────────────────────────────────────────────────
const COUNTRY_CODES = [
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
] as const;

export default function EditMobileScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const updatePhoneMutation = useUpdatePhone();

    const [selectedCode, setSelectedCode] = useState('+852');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showCodePicker, setShowCodePicker] = useState(false);

    const selectedCountry = COUNTRY_CODES.find((c) => c.code === selectedCode);
    const isValid = phoneNumber.length >= 6;

    const onContinue = () => {
        if (!isValid) return;

        updatePhoneMutation.mutate(
            { country_code: selectedCode, phone_number: phoneNumber },
            {
                onSuccess: () => {
                    const fullNumber = `${selectedCode}${phoneNumber}`;
                    navigation.navigate('VerifyOTP', {
                        mode: 'edit-phone',
                        identifier: fullNumber,
                        identifierType: 'phone',
                    });
                },
                onError: (err) => {
                    Alert.alert('Error', handleApiError(err).message);
                },
            },
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* ─── Header ─────────────────────────────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                        testID="editmobile-back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mobile</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.label}>Mobile Phone Number</Text>

                    {/* ─── Phone Input ─────────────────────────────── */}
                    <View style={styles.phoneRow}>
                        <TouchableOpacity
                            style={styles.codeBtn}
                            onPress={() => setShowCodePicker(!showCodePicker)}
                            accessibilityLabel={`Country code ${selectedCode}`}
                            accessibilityRole="button"
                            testID="editmobile-code-picker"
                        >
                            <Text style={styles.codeFlag}>
                                {selectedCountry?.flag ?? '🏳️'}
                            </Text>
                            <Text style={styles.codeText}>{selectedCode}</Text>
                            <Text style={styles.codeChevron}>▾</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter mobile phone number"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            returnKeyType="done"
                            maxLength={15}
                            accessibilityLabel="Phone number"
                            testID="editmobile-phone-input"
                        />
                    </View>

                    {/* ─── Code Picker Dropdown ────────────────────── */}
                    {showCodePicker && (
                        <View style={styles.codePicker}>
                            {COUNTRY_CODES.map((c) => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[
                                        styles.codeItem,
                                        c.code === selectedCode && styles.codeItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedCode(c.code);
                                        setShowCodePicker(false);
                                    }}
                                    accessibilityLabel={`${c.name} ${c.code}`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.codeItemFlag}>{c.flag}</Text>
                                    <Text style={styles.codeItemText}>{c.code}</Text>
                                    <Text style={styles.codeItemName}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <Text style={styles.hint}>
                        This information will be used to collect verification information
                        for scenarios such as card spending/payment binding.
                    </Text>
                </ScrollView>

                {/* ─── Continue Button ─────────────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueBtn,
                            (!isValid || updatePhoneMutation.isPending) && styles.btnDisabled,
                        ]}
                        onPress={onContinue}
                        activeOpacity={0.85}
                        disabled={!isValid || updatePhoneMutation.isPending}
                        accessibilityLabel="Continue"
                        accessibilityRole="button"
                        testID="editmobile-continue"
                    >
                        {updatePhoneMutation.isPending ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.continueText}>Continue</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm },

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

    label: {
        ...typography.label,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },

    phoneRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        overflow: 'hidden',
    },
    codeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        gap: 4,
    },
    codeFlag: { fontSize: 16 },
    codeText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    codeChevron: {
        fontSize: 10,
        color: colors.textMuted,
        marginLeft: 2,
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },

    codePicker: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        marginTop: spacing.xs,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    codeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
    },
    codeItemActive: {
        backgroundColor: colors.surfaceAlt,
    },
    codeItemFlag: { fontSize: 16 },
    codeItemText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
        minWidth: 44,
    },
    codeItemName: {
        ...typography.bodySm,
        color: colors.textSecondary,
    },

    hint: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: spacing.sm,
        lineHeight: 18,
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    continueBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    btnDisabled: { opacity: 0.4 },
    continueText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
