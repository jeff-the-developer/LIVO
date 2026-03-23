import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import Button from '@components/common/Button';
import PhoneField from '@components/forms/PhoneField';
import ScreenHeader from '@components/common/ScreenHeader';

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
            <ScreenHeader title="Mobile" onBackPress={() => navigation.goBack()} />

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={s.body}>
                    <Text style={s.label}>Username</Text>

                    <PhoneField
                        countryCode={countryCode}
                        phoneNumber={phone}
                        onChangePhone={setPhone}
                        placeholder="Enter mobile phone number"
                    />
                </View>

                {/* Continue Button */}
                <View style={s.footer}>
                    <Button
                        label="Continue"
                        onPress={onContinue}
                        disabled={!isValid}
                        testID="mobile-continue"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    body: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
    label: {
        ...typography.bodySm, color: colors.textPrimary, fontWeight: '500',
        marginBottom: spacing.sm,
    },

    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
});
