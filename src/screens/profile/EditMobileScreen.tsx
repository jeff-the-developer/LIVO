import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useUpdatePhone, handleApiError } from '@hooks/api/useProfile';
import AsyncButton from '@components/common/AsyncButton';
import PhoneField from '@components/forms/PhoneField';
import ScreenHeader from '@components/common/ScreenHeader';

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
                <ScreenHeader title="Mobile" onBackPress={() => navigation.goBack()} />

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.label}>Mobile Phone Number</Text>

                    {/* ─── Phone Input ─────────────────────────────── */}
                    <PhoneField
                        countryCode={`${selectedCountry?.flag ?? '🏳️'} ${selectedCode}`}
                        phoneNumber={phoneNumber}
                        onChangePhone={setPhoneNumber}
                        onPressCountryCode={() => setShowCodePicker(!showCodePicker)}
                        placeholder="Enter mobile phone number"
                    />

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
                    <AsyncButton
                        label="Continue"
                        loading={updatePhoneMutation.isPending}
                        disabled={!isValid}
                        onPress={onContinue}
                        accessibilityLabel="Continue"
                        testID="editmobile-continue"
                    />
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

    label: {
        ...typography.label,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
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
});
