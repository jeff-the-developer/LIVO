import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
    ArrowLeft01FreeIcons, 
    AlertCircleFreeIcons,
    Cancel01FreeIcons 
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';
import type { CountryOption } from '@api/kyc';
import { FlagIcon } from '@components/icons/CurrencyIcons';
import EmptyState from './EmptyState';
import SearchBar from './SearchBar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CountryPickerProps {
    visible: boolean;
    countries: CountryOption[];
    onSelect: (country: CountryOption) => void;
    onClose: () => void;
    testID?: string;
    isLoading?: boolean;
    /** Screen-specific title (default: generic country selection). */
    title?: string;
}

// ─── Country Row Component ────────────────────────────────────────────────────
function CountryRow({
    country,
    onPress,
    disabled,
    testID,
}: {
    country: CountryOption;
    onPress: () => void;
    disabled?: boolean;
    testID?: string;
}): React.ReactElement {
    const handlePress = () => {
        if (country.restricted) {
            Alert.alert(
                'Restricted Country',
                `${country.name} is currently not supported. Please select a different country.`,
                [{ text: 'OK' }]
            );
            return;
        }
        onPress();
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.countryRow,
                country.restricted && styles.countryRowDisabled,
                disabled && styles.countryRowDisabled,
                pressed && !disabled && !country.restricted && styles.countryRowPressed,
            ]}
            onPress={handlePress}
            accessibilityLabel={country.name}
            accessibilityRole="button"
            disabled={disabled}
            testID={testID}
        >
            <View style={styles.countryContent}>
                <View style={styles.flagCell}>
                    <FlagIcon
                        code={country.code}
                        size={ui.pickerRowIcon}
                        fallbackEmoji={country.flag}
                    />
                </View>
                <Text
                    style={[
                        styles.countryName,
                        country.restricted && styles.countryNameDisabled,
                    ]}
                    numberOfLines={1}
                >
                    {country.name}
                </Text>
            </View>

            <View style={styles.countryMeta}>
                {country.kyc_required && (
                    <View style={styles.kycBadge}>
                        <Text style={styles.kycBadgeText}>KYC</Text>
                    </View>
                )}
                {country.restricted ? (
                    <HugeiconsIcon
                        icon={Cancel01FreeIcons}
                        size={16}
                        color={colors.error}
                    />
                ) : (
                    <View style={styles.radioButton}>
                        <View style={styles.radioInner} />
                    </View>
                )}
            </View>
        </Pressable>
    );
}

export default function CountryPicker({
    visible,
    countries,
    onSelect,
    onClose,
    testID,
    isLoading = false,
    title = 'Select country',
}: CountryPickerProps): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) {
            return countries;
        }
        return countries.filter((country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [countries, searchQuery]);

    const handleSelect = (country: CountryOption) => {
        onSelect(country);
        setSearchQuery('');
    };

    const handleClose = () => {
        onClose();
        setSearchQuery('');
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* ─── Header ──────────────────────────────────── */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={handleClose}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            accessibilityLabel="Close country picker"
                            accessibilityRole="button"
                            testID={`${testID}-close`}
                        >
                            <HugeiconsIcon
                                icon={ArrowLeft01FreeIcons}
                                size={24}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* ─── Search Bar ───────────────────────────────── */}
                    <View style={styles.searchSection}>
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search by country or region"
                        />
                    </View>

                    {/* ─── Countries List ───────────────────────────── */}
                    <ScrollView
                        style={styles.countriesList}
                        contentContainerStyle={styles.countriesContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {isLoading ? (
                            <View style={styles.loadingState}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : countries.length === 0 ? (
                            <EmptyState
                                title="No countries available"
                                description="Country data is unavailable right now."
                                style={styles.emptyState}
                            />
                        ) : filteredCountries.length === 0 ? (
                            <EmptyState
                                title="No countries found"
                                description="Try searching with a different term."
                                style={styles.emptyState}
                            />
                        ) : (
                            filteredCountries.map((country, index) => (
                                <CountryRow
                                    key={country.code}
                                    country={country}
                                    onPress={() => handleSelect(country)}
                                    testID={`${testID}-country-${index}`}
                                />
                            ))
                        )}
                    </ScrollView>

                    {/* ─── Confirm Button ─────────────────────────────── */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleClose}
                            activeOpacity={0.85}
                            accessibilityLabel="Confirm selection"
                            accessibilityRole="button"
                            testID={`${testID}-confirm`}
                        >
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
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

    searchSection: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
    },
    countriesList: {
        flex: 1,
        backgroundColor: colors.background,
    },
    countriesContent: {
        paddingBottom: spacing.base,
    },

    countryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    countryRowDisabled: {
        opacity: 0.6,
    },
    countryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    flagCell: {
        width: ui.pickerRowIcon + spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countryRowPressed: {
        backgroundColor: colors.surface,
    },
    countryName: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        flex: 1,
    },
    countryNameDisabled: {
        color: colors.textMuted,
    },
    countryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    kycBadge: {
        backgroundColor: palette.orange,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    kycBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textInverse,
    },
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'transparent',
    },

    emptyState: {
        paddingVertical: spacing.xxl,
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    confirmBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    confirmText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});