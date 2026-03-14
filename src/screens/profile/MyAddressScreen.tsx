import React, { useState, useEffect } from 'react';
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
import { useSaveAddress, useAddress, handleApiError } from '@hooks/api/useProfile';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Form fields ──────────────────────────────────────────────────────────────
interface AddressForm {
    street: string;
    apartment: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

const INITIAL: AddressForm = {
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
};

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({
    label,
    value,
    placeholder,
    onChangeText,
    testID,
    keyboardType,
    autoCapitalize,
}: {
    label: string;
    value: string;
    placeholder: string;
    onChangeText: (v: string) => void;
    testID: string;
    keyboardType?: 'default' | 'number-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}): React.ReactElement {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType ?? 'default'}
                autoCapitalize={autoCapitalize ?? 'words'}
                accessibilityLabel={label}
                testID={testID}
            />
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyAddressScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [form, setForm] = useState<AddressForm>(INITIAL);
    const saveMutation = useSaveAddress();
    const addressQuery = useAddress();

    useEffect(() => {
        const addr = addressQuery.data;
        if (!addr) return;
        setForm({
            street: addr.street ?? '',
            apartment: addr.apartment ?? '',
            city: addr.city ?? '',
            state: addr.state ?? '',
            postalCode: addr.postal_code ?? '',
            country: addr.country ?? '',
        });
    }, [addressQuery.data]);

    const update = (key: keyof AddressForm) => (v: string) =>
        setForm((prev) => ({ ...prev, [key]: v }));

    const isValid =
        form.street.trim().length > 0 &&
        form.city.trim().length > 0 &&
        form.postalCode.trim().length > 0 &&
        form.country.trim().length > 0;

    const onSave = () => {
        if (!isValid) return;
        saveMutation.mutate(
            {
                street: form.street.trim(),
                apartment: form.apartment.trim() || undefined,
                city: form.city.trim(),
                state: form.state.trim() || undefined,
                postal_code: form.postalCode.trim(),
                country: form.country.trim(),
            },
            {
                onSuccess: () => {
                    Alert.alert('Address Saved', 'Your address has been updated.', [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
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
                {/* ─── Header ──────────────────────────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                        testID="address-back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Address</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Field
                        label="Street Address"
                        value={form.street}
                        placeholder="123 Main Street"
                        onChangeText={update('street')}
                        testID="address-street"
                    />
                    <Field
                        label="Apartment / Suite (Optional)"
                        value={form.apartment}
                        placeholder="Apt 4B"
                        onChangeText={update('apartment')}
                        testID="address-apartment"
                    />
                    <Field
                        label="City"
                        value={form.city}
                        placeholder="Hong Kong"
                        onChangeText={update('city')}
                        testID="address-city"
                    />

                    {/* Two-column row */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>State / Province</Text>
                            <TextInput
                                style={styles.input}
                                value={form.state}
                                onChangeText={update('state')}
                                placeholder="State"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="words"
                                accessibilityLabel="State or Province"
                                testID="address-state"
                            />
                        </View>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Postal Code</Text>
                            <TextInput
                                style={styles.input}
                                value={form.postalCode}
                                onChangeText={update('postalCode')}
                                placeholder="000000"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="number-pad"
                                accessibilityLabel="Postal Code"
                                testID="address-postal"
                            />
                        </View>
                    </View>

                    <Field
                        label="Country"
                        value={form.country}
                        placeholder="Hong Kong SAR"
                        onChangeText={update('country')}
                        testID="address-country"
                    />
                </ScrollView>

                {/* ─── Save Button ─────────────────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.saveBtn,
                            (!isValid || saveMutation.isPending) && styles.btnDisabled,
                        ]}
                        onPress={onSave}
                        activeOpacity={0.85}
                        disabled={!isValid || saveMutation.isPending}
                        accessibilityLabel="Save address"
                        accessibilityRole="button"
                        testID="address-save"
                    >
                        {saveMutation.isPending ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
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
    scroll: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        gap: spacing.base,
        paddingBottom: spacing.base,
    },

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

    fieldGroup: { gap: spacing.xs },
    label: {
        ...typography.label,
        color: colors.textPrimary,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
        backgroundColor: colors.background,
    },

    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    halfField: {
        flex: 1,
        gap: spacing.xs,
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    saveBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    btnDisabled: { opacity: 0.4 },
    saveText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
