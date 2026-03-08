import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { getCountries, type CountryOption } from '@api/kyc';
import CountryPicker from '@components/common/CountryPicker';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'PrimaryNationality'>;

export default function PrimaryNationalityScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            setLoading(true);
            const response = await getCountries();
            if (response.success) {
                setCountries(response.data);
                setShowPicker(true);
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to load countries. Please try again.',
                [
                    { text: 'Retry', onPress: loadCountries },
                    { text: 'Cancel', onPress: () => navigation.goBack() },
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCountrySelect = (country: CountryOption) => {
        setSelectedCountry(country);
        setShowPicker(false);
    };

    const handleConfirm = () => {
        if (!selectedCountry) {
            setShowPicker(true);
            return;
        }

        // For now, just go back to the previous screen
        // In a real app, you would save this selection and proceed to the next step
        Alert.alert(
            'Nationality Selected',
            `You selected: ${selectedCountry.name}${selectedCountry.kyc_required ? '\n\nKYC verification will be required.' : ''}`,
            [
                {
                    text: 'Continue',
                    onPress: () => {
                        // Navigate to next screen or complete the flow
                        navigation.goBack();
                    },
                },
                {
                    text: 'Change',
                    style: 'cancel',
                    onPress: () => setShowPicker(true),
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading countries...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* ─── Header ──────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="nationality-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Primary Nationality</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* ─── Content ─────────────────────────────────── */}
            <View style={styles.content}>
                {selectedCountry ? (
                    <View style={styles.selectedContainer}>
                        <Text style={styles.selectedLabel}>Selected nationality:</Text>
                        <View style={styles.selectedCountry}>
                            <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
                            <Text style={styles.selectedName}>{selectedCountry.name}</Text>
                            {selectedCountry.kyc_required && (
                                <View style={styles.kycBadge}>
                                    <Text style={styles.kycBadgeText}>KYC Required</Text>
                                </View>
                            )}
                        </View>
                        
                        <TouchableOpacity
                            style={styles.changeBtn}
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.7}
                            accessibilityLabel="Change nationality"
                            accessibilityRole="button"
                            testID="nationality-change"
                        >
                            <Text style={styles.changeBtnText}>Change Selection</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Select Your Nationality</Text>
                        <Text style={styles.emptyText}>
                            Choose your primary nationality to continue with the verification process.
                        </Text>
                        
                        <TouchableOpacity
                            style={styles.selectBtn}
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.85}
                            accessibilityLabel="Select nationality"
                            accessibilityRole="button"
                            testID="nationality-select"
                        >
                            <Text style={styles.selectBtnText}>Select Nationality</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ─── Footer ──────────────────────────────────── */}
            {selectedCountry && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleConfirm}
                        activeOpacity={0.85}
                        accessibilityLabel="Confirm nationality selection"
                        accessibilityRole="button"
                        testID="nationality-confirm"
                    >
                        <Text style={styles.confirmBtnText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ─── Country Picker ─────────────────────────────── */}
            <CountryPicker
                visible={showPicker}
                countries={countries}
                onSelect={handleCountrySelect}
                onClose={() => setShowPicker(false)}
                testID="nationality-picker"
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    backBtn: {
        width: 36,
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    headerSpacer: {
        width: 36,
    },

    content: {
        flex: 1,
        paddingHorizontal: spacing.base,
    },

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.base,
    },
    loadingText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
    },

    selectedContainer: {
        marginTop: spacing.xl,
    },
    selectedLabel: {
        ...typography.bodySm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    selectedCountry: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.card,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.base,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    selectedFlag: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    selectedName: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    kycBadge: {
        backgroundColor: colors.warning,
        borderRadius: 12,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    kycBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textInverse,
    },
    changeBtn: {
        alignSelf: 'flex-start',
        paddingVertical: spacing.sm,
    },
    changeBtnText: {
        ...typography.bodyMd,
        color: colors.primary,
        fontWeight: '600',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.base,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xl,
    },
    selectBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.xl,
        minWidth: 200,
        alignItems: 'center',
    },
    selectBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
    confirmBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    confirmBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});