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
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useSaveAddress, useAddress, handleApiError } from '@hooks/api/useProfile';
import AsyncButton from '@components/common/AsyncButton';
import FormField from '@components/forms/FormField';
import Input from '@components/common/Input';
import ScreenHeader from '@components/common/ScreenHeader';

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
                <ScreenHeader
                    title="My Address"
                    onBackPress={() => navigation.goBack()}
                />

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <FormField
                        label="Street Address"
                    >
                        <Input
                            value={form.street}
                            onChangeText={update('street')}
                            placeholder="123 Main Street"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="words"
                            accessibilityLabel="Street Address"
                            testID="address-street"
                        />
                    </FormField>
                    <FormField
                        label="Apartment / Suite (Optional)"
                    >
                        <Input
                            value={form.apartment}
                            onChangeText={update('apartment')}
                            placeholder="Apt 4B"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="words"
                            accessibilityLabel="Apartment or suite"
                            testID="address-apartment"
                        />
                    </FormField>
                    <FormField
                        label="City"
                    >
                        <Input
                            value={form.city}
                            onChangeText={update('city')}
                            placeholder="Hong Kong"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="words"
                            accessibilityLabel="City"
                            testID="address-city"
                        />
                    </FormField>

                    {/* Two-column row */}
                    <View style={styles.row}>
                        <FormField label="State / Province" containerStyle={styles.halfField}>
                            <Input
                                value={form.state}
                                onChangeText={update('state')}
                                placeholder="State"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="words"
                                accessibilityLabel="State or Province"
                                testID="address-state"
                            />
                        </FormField>
                        <FormField label="Postal Code" containerStyle={styles.halfField}>
                            <Input
                                value={form.postalCode}
                                onChangeText={update('postalCode')}
                                placeholder="000000"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="number-pad"
                                accessibilityLabel="Postal Code"
                                testID="address-postal"
                            />
                        </FormField>
                    </View>

                    <FormField
                        label="Country"
                    >
                        <Input
                            value={form.country}
                            onChangeText={update('country')}
                            placeholder="Hong Kong SAR"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="words"
                            accessibilityLabel="Country"
                            testID="address-country"
                        />
                    </FormField>
                </ScrollView>

                {/* ─── Save Button ─────────────────────────────────── */}
                <View style={styles.footer}>
                    <AsyncButton
                        label="Save"
                        loading={saveMutation.isPending}
                        disabled={!isValid}
                        onPress={onSave}
                        testID="address-save"
                        accessibilityLabel="Save address"
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
    scroll: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        gap: spacing.base,
        paddingBottom: spacing.base,
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
});
