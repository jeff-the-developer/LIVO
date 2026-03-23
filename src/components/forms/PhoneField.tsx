import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Input from '@components/common/Input';
import SelectField from './SelectField';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

interface PhoneFieldProps {
    countryCode: string;
    phoneNumber: string;
    onChangePhone: (value: string) => void;
    onPressCountryCode?: () => void;
    placeholder?: string;
    error?: string;
}

export default function PhoneField({
    countryCode,
    phoneNumber,
    onChangePhone,
    onPressCountryCode,
    placeholder = 'Phone number',
    error,
}: PhoneFieldProps): React.ReactElement {
    return (
        <View style={styles.row}>
            <SelectField
                value={countryCode}
                placeholder="Code"
                onPress={onPressCountryCode}
                style={styles.codeField}
            />
            <Input
                value={phoneNumber}
                onChangeText={onChangePhone}
                keyboardType="phone-pad"
                placeholder={placeholder}
                hasError={!!error}
                containerStyle={styles.phoneField}
                accessibilityLabel="Phone number"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    codeField: {
        width: 104,
    },
    phoneField: {
        flex: 1,
    },
});
