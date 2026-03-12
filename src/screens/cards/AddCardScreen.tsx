import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    Tick02FreeIcons,
    Cancel01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useAddCard } from '@hooks/api/useCards';
import type { CardCurrency, BillingAddress } from '@api/cards';
import type { AppStackParamList } from '@app-types/navigation.types';
import BottomSheet from '@components/common/BottomSheet';
import CardCouponSheet from './CardCouponSheet';
import type { CardCouponSelection } from './CardCouponSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const NOTE_MAX_LENGTH = 8;

// ─── Card Currency Sheet ──────────────────────────────────────────────────────
function CardCurrencySheet({
    visible,
    selected,
    onSelect,
    onClose,
}: {
    visible: boolean;
    selected: CardCurrency | null;
    onSelect: (currency: CardCurrency) => void;
    onClose: () => void;
}): React.ReactElement {
    const currencies: CardCurrency[] = ['USD', 'HKD'];
    const [tempSelected, setTempSelected] = useState<CardCurrency | null>(selected);

    const onNext = () => {
        if (tempSelected) {
            onSelect(tempSelected);
            onClose();
        }
    };

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <View style={csStyles.container}>
                {/* Back */}
                <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="currency-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                {/* Icon */}
                <View style={csStyles.iconWrap}>
                    <Text style={csStyles.iconEmoji}>💳</Text>
                </View>

                <Text style={csStyles.title}>Card Currency</Text>

                {/* Options */}
                {currencies.map((c) => (
                    <TouchableOpacity
                        key={c}
                        style={csStyles.option}
                        onPress={() => setTempSelected(c)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Select ${c}`}
                        accessibilityRole="radio"
                        testID={`currency-${c.toLowerCase()}`}
                    >
                        <Text style={csStyles.optionLabel}>{c}</Text>
                        <View style={[csStyles.radio, tempSelected === c && csStyles.radioSelected]}>
                            {tempSelected === c && <View style={csStyles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Next Button */}
                <TouchableOpacity
                    style={[csStyles.nextBtn, !tempSelected && csStyles.nextBtnDisabled]}
                    onPress={onNext}
                    disabled={!tempSelected}
                    activeOpacity={0.85}
                    accessibilityLabel="Next"
                    accessibilityRole="button"
                    testID="currency-next"
                >
                    <Text style={[csStyles.nextBtnText, !tempSelected && csStyles.nextBtnTextDisabled]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddCardScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const addCardMutation = useAddCard();

    // Form state
    const [currency, setCurrency] = useState<CardCurrency | null>(null);
    const [note, setNote] = useState('');
    const [countryCode] = useState('+852');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [sameAsResidential, setSameAsResidential] = useState(true);
    const [stateProvince, setStateProvince] = useState('');
    const [stateProvince2, setStateProvince2] = useState('');
    const [city, setCity] = useState('');
    const [detailedAddress, setDetailedAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');

    // Sheet state
    const [showCurrencySheet, setShowCurrencySheet] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [showCouponSheet, setShowCouponSheet] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<CardCouponSelection | null>(null);

    const billingAddress: BillingAddress = {
        same_as_residential: sameAsResidential,
        ...(sameAsResidential
            ? {}
            : {
                state_province: stateProvince,
                state_province_2: stateProvince2,
                city,
                detailed_address: detailedAddress,
                postal_code: postalCode,
            }),
    };

    const onSubmit = async () => {
        if (!currency || !phone || !email) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        try {
            await addCardMutation.mutateAsync({
                currency,
                note,
                mobile_country_code: countryCode,
                mobile_number: phone,
                email,
                billing_address: billingAddress,
            });
            setShowSuccess(true);
        } catch {
            setShowFailure(true);
        }
    };

    const onSuccessOkay = () => {
        setShowSuccess(false);
        navigation.replace('CardActivation', { tier: 'Basic' });
    };

    const onRetry = () => {
        setShowFailure(false);
    };

    const onUseCoupons = () => {
        setShowCouponSheet(true);
    };

    const onCouponSelected = (selection: CardCouponSelection) => {
        setAppliedCoupon(selection);
    };

    const onCancelCoupon = () => {
        setAppliedCoupon(null);
    };

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="add-card-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Add Card</Text>
                <TouchableOpacity
                    onPress={onUseCoupons}
                    accessibilityLabel="Use Coupons"
                    testID="add-card-use-coupons"
                >
                    <Text style={s.useCoupons}>Use Coupons</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    style={s.scroll}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Applied Coupon Banner */}
                    {appliedCoupon && (
                        <View style={s.couponBanner}>
                            <Image
                                source={require('@assets/images/cards/basic_card.png')}
                                style={s.couponBannerCard}
                                resizeMode="contain"
                            />
                            <View style={s.couponBannerInfo}>
                                <Text style={s.couponBannerTier}>
                                    <Text style={s.couponBannerTierBold}>BASIC Card</Text>
                                    <Text style={s.couponBannerTierLight}>{' | VISA US Dollar Standard Card'}</Text>
                                </Text>
                                <View style={s.couponBannerFooter}>
                                    <Text style={s.couponBannerNote}>
                                        If you cancel the redemption now, the coupon will not be used
                                    </Text>
                                    <TouchableOpacity
                                        style={s.couponCancelBtn}
                                        onPress={onCancelCoupon}
                                        activeOpacity={0.7}
                                        accessibilityLabel="Cancel coupon"
                                        testID="add-card-cancel-coupon"
                                    >
                                        <Text style={s.couponCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    {/* Card Currency */}
                    <Text style={s.label}>Card Currency</Text>
                    <TouchableOpacity
                        style={s.selectRow}
                        onPress={() => setShowCurrencySheet(true)}
                        activeOpacity={0.7}
                        accessibilityLabel="Select card currency"
                        testID="add-card-currency"
                    >
                        <Text style={currency ? s.selectValue : s.selectPlaceholder}>
                            {currency ?? 'Select the card currency'}
                        </Text>
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    {/* Note */}
                    <Text style={s.label}>Note</Text>
                    <View style={s.inputRow}>
                        <TextInput
                            style={s.inputFlex}
                            placeholder="Add a note to identify this card"
                            placeholderTextColor={colors.textMuted}
                            value={note}
                            onChangeText={(t) => setNote(t.slice(0, NOTE_MAX_LENGTH))}
                            maxLength={NOTE_MAX_LENGTH}
                            accessibilityLabel="Note"
                            testID="add-card-note"
                        />
                        <Text style={s.counter}>{note.length}/{NOTE_MAX_LENGTH}</Text>
                    </View>

                    {/* Mobile Phone */}
                    <Text style={s.label}>Mobile Phone Number</Text>
                    <View style={s.phoneRow}>
                        <TouchableOpacity
                            style={s.countryCode}
                            activeOpacity={0.7}
                            accessibilityLabel="Country code"
                            testID="add-card-country-code"
                        >
                            <Text style={s.countryCodeText}>{countryCode}</Text>
                            <Text style={s.caret}>⌃</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={s.phoneInput}
                            placeholder="Enter mobile phone number"
                            placeholderTextColor={colors.textMuted}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            accessibilityLabel="Phone number"
                            testID="add-card-phone"
                        />
                    </View>
                    <Text style={s.hint}>Used for verification and secure payments</Text>

                    {/* Email */}
                    <Text style={s.label}>Email</Text>
                    <TextInput
                        style={s.input}
                        placeholder="Enter your email address"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        accessibilityLabel="Email address"
                        testID="add-card-email"
                    />
                    <Text style={s.hint}>Used to receive card payment notifications and receipts.</Text>

                    {/* Billing Address */}
                    <Text style={s.label}>Billing Address</Text>
                    <TouchableOpacity
                        style={s.selectRow}
                        onPress={() => setSameAsResidential(!sameAsResidential)}
                        activeOpacity={0.7}
                        accessibilityLabel="Toggle billing address"
                        testID="add-card-billing-toggle"
                    >
                        <Text style={s.selectValue} numberOfLines={2}>
                            {sameAsResidential
                                ? 'The billing address is the same as the residential address'
                                : 'The billing address is different from the place of residence'}
                        </Text>
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    {/* Expanded billing fields */}
                    {!sameAsResidential && (
                        <View style={s.billingFields}>
                            <TextInput
                                style={s.input}
                                placeholder="Fill in your state/province"
                                placeholderTextColor={colors.textMuted}
                                value={stateProvince}
                                onChangeText={setStateProvince}
                                accessibilityLabel="State or province"
                                testID="add-card-state1"
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Fill in your state/province"
                                placeholderTextColor={colors.textMuted}
                                value={stateProvince2}
                                onChangeText={setStateProvince2}
                                accessibilityLabel="State or province (2)"
                                testID="add-card-state2"
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Fill in the city"
                                placeholderTextColor={colors.textMuted}
                                value={city}
                                onChangeText={setCity}
                                accessibilityLabel="City"
                                testID="add-card-city"
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Fill in the detailed address of your office"
                                placeholderTextColor={colors.textMuted}
                                value={detailedAddress}
                                onChangeText={setDetailedAddress}
                                accessibilityLabel="Detailed address"
                                testID="add-card-address"
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Fill in the address and postal code"
                                placeholderTextColor={colors.textMuted}
                                value={postalCode}
                                onChangeText={setPostalCode}
                                accessibilityLabel="Postal code"
                                testID="add-card-postal"
                            />
                        </View>
                    )}
                </ScrollView>

                {/* Submit Button */}
                <View style={s.footer}>
                    <TouchableOpacity
                        style={s.submitBtn}
                        onPress={onSubmit}
                        activeOpacity={0.85}
                        disabled={addCardMutation.isPending}
                        accessibilityLabel="Complete verification"
                        accessibilityRole="button"
                        testID="add-card-submit"
                    >
                        <Text style={s.submitBtnText}>
                            {addCardMutation.isPending
                                ? 'Processing...'
                                : appliedCoupon
                                    ? 'Confirm to add'
                                    : 'Complete Verification'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Currency Sheet */}
            <CardCurrencySheet
                visible={showCurrencySheet}
                selected={currency}
                onSelect={setCurrency}
                onClose={() => setShowCurrencySheet(false)}
            />

            {/* ─── Success Sheet ───────────────────────────────────── */}
            <BottomSheet visible={showSuccess} onClose={onSuccessOkay}>
                <View style={resultS.content}>
                    <View style={resultS.successIcon}>
                        <HugeiconsIcon icon={Tick02FreeIcons} size={28} color={colors.textPrimary} />
                    </View>
                    <Text style={resultS.title}>
                        The card has been{`\n`}successfully added
                    </Text>
                    <View style={resultS.footer}>
                        <TouchableOpacity
                            style={resultS.okBtn}
                            onPress={onSuccessOkay}
                            activeOpacity={0.85}
                            accessibilityLabel="Okay"
                            accessibilityRole="button"
                            testID="add-card-success-ok"
                        >
                            <Text style={resultS.okBtnText}>Okay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>

            {/* ─── Failure Sheet ───────────────────────────────────── */}
            <BottomSheet visible={showFailure} onClose={onRetry}>
                <View style={resultS.content}>
                    <View style={resultS.failIcon}>
                        <HugeiconsIcon icon={Cancel01FreeIcons} size={28} color={palette.red} />
                    </View>
                    <Text style={resultS.title}>Operation Failed</Text>
                    <Text style={resultS.body}>
                        Card could not be added, please try again or contact
                        customer service.
                    </Text>
                    <View style={resultS.footer}>
                        <TouchableOpacity
                            style={resultS.okBtn}
                            onPress={onRetry}
                            activeOpacity={0.85}
                            accessibilityLabel="Try Again"
                            accessibilityRole="button"
                            testID="add-card-failure-retry"
                        >
                            <Text style={resultS.okBtnText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>

            {/* Coupon Sheet */}
            <CardCouponSheet
                visible={showCouponSheet}
                onClose={() => setShowCouponSheet(false)}
                onSelectCoupon={onCouponSelected}
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },

    // Header
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
    useCoupons: {
        ...typography.bodySm,
        color: colors.primary,
        fontWeight: '600',
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.xxl,
    },

    // Form
    label: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '600',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
        backgroundColor: colors.background,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingHorizontal: spacing.base,
    },
    inputFlex: {
        flex: 1,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    counter: {
        ...typography.caption,
        color: colors.textMuted,
        marginLeft: spacing.xs,
    },
    selectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    selectPlaceholder: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textMuted,
    },
    selectValue: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },

    // Phone
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        overflow: 'hidden',
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        gap: 4,
    },
    countryCodeText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    caret: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: -2,
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },

    hint: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },

    // Billing
    billingFields: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },

    // Footer
    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.lg,
        paddingTop: spacing.sm,
    },
    submitBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    submitBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },

    // Coupon Banner
    couponBanner: {
        backgroundColor: '#F7F7F9',
        borderRadius: borderRadius.card * 1.5,
        padding: 16,
        marginBottom: spacing.xxl,
        marginTop: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    couponBannerCard: {
        width: '100%',
        height: 180,
        marginBottom: spacing.lg,
    },
    couponBannerInfo: {},
    couponBannerTier: {
        ...typography.bodyLg,
        color: colors.textPrimary,
        marginBottom: spacing.xl,
    },
    couponBannerTierBold: {
        fontWeight: '800',
        color: colors.textPrimary,
    },
    couponBannerTierLight: {
        ...typography.bodyMd,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    couponBannerFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    couponBannerNote: {
        flex: 1,
        ...typography.bodySm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    couponCancelBtn: {
        backgroundColor: '#FF5A5F',
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.xl,
        paddingVertical: 10,
    },
    couponCancelText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});

// ─── Currency Sheet Styles ────────────────────────────────────────────────────
const csStyles = StyleSheet.create({
    container: {
        paddingBottom: spacing.base,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.base,
    },
    iconEmoji: {
        fontSize: 24,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.lg,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    optionLabel: {
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.textPrimary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: colors.textPrimary,
    },
    nextBtn: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        marginTop: spacing.xxl,
    },
    nextBtnDisabled: {
        opacity: 0.6,
    },
    nextBtnText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    nextBtnTextDisabled: {
        color: colors.textMuted,
    },
});

// ─── Result Sheet Styles ──────────────────────────────────────────────────────
const resultS = StyleSheet.create({
    content: {
        paddingBottom: spacing.base,
    },
    successIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    failIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.redLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    body: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    footer: {
        marginTop: spacing.xxl,
    },
    okBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    okBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});

