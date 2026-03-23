import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
// Alert kept for handleUploadFiles placeholder
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    LockFreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'BankAdditionalInfo'>;

export default function BankAdditionalInfoScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { bankName, bankId } = route.params;

    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');

    const handleSelectAddress = () => {
        const bankDetails = `bank_id:${bankId},state:${state},city:${city},address:${address},postal:${postalCode}`;
        navigation.navigate('AddFunds', { source: 'bank_transfer', bankDetails });
    };

    const handleUploadFiles = () => {
        Alert.alert('Upload Files', 'File upload coming soon.');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={22} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Additional Info</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Mailing Address Section */}
                <Text style={styles.sectionLabel}>Mailing Address</Text>
                <Text style={styles.sectionDesc}>
                    Enter or select a valid residential or office address in Hong Kong SAR. As required by compliance policies, this account is only available to users with a Hong Kong address.
                </Text>

                {/* Country (locked) */}
                <View style={styles.inputRow}>
                    <Text style={styles.inputValue}>Hong Kong SAR (Hong Kong SAR)</Text>
                    <HugeiconsIcon icon={LockFreeIcons} size={18} color="#B2B2B2" />
                </View>

                {/* State/Province */}
                <TextInput
                    style={styles.input}
                    placeholder="State/Province"
                    placeholderTextColor="#B2B2B2"
                    value={state}
                    onChangeText={setState}
                />

                {/* City */}
                <TextInput
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor="#B2B2B2"
                    value={city}
                    onChangeText={setCity}
                />

                {/* Detailed address */}
                <TextInput
                    style={styles.input}
                    placeholder="Detailed address"
                    placeholderTextColor="#B2B2B2"
                    value={address}
                    onChangeText={setAddress}
                />

                {/* Postal Code */}
                <TextInput
                    style={styles.input}
                    placeholder="Postal Code"
                    placeholderTextColor="#B2B2B2"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="number-pad"
                />

                {/* Select Address button */}
                <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.7}
                    onPress={handleSelectAddress}
                >
                    <Text style={styles.primaryBtnText}>Select Address</Text>
                </TouchableOpacity>

                <View style={styles.sectionGap} />

                {/* Address Proof Section */}
                <Text style={styles.sectionLabel}>Address Proof</Text>
                <Text style={styles.sectionDesc}>
                    Please upload a valid proof of address for the selected location (e.g., bank statement, utility bill, or official government letter). Personal letters or packages are not accepted. Uploading fake or forged documents may result in account restrictions.
                </Text>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.7}
                    onPress={handleUploadFiles}
                >
                    <Text style={styles.primaryBtnText}>Upload Files</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Cancel Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 32,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: spacing.sm,
        paddingBottom: spacing.huge,
        gap: 10,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#01CA47',
        lineHeight: 18,
        marginTop: 6,
    },
    sectionDesc: {
        fontSize: 14,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 21,
    },
    inputRow: {
        height: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
    },
    inputValue: {
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 24,
    },
    input: {
        height: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 14,
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
    },
    primaryBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    sectionGap: {
        height: 10,
    },
    bottomBar: {
        paddingHorizontal: 15,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    cancelBtn: {
        height: 52,
        backgroundColor: '#F0F0F0',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
});
