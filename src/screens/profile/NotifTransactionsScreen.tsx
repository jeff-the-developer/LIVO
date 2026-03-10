import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
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
    Cancel01FreeIcons,
    CheckmarkCircle02FreeIcons,
    Notification03FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Transaction Types ─────────────────────────────────────────────────────────
const TRANSACTION_TYPES = [
    'Quick Receive',
    'Quick Transfer',
    'Crypto Deposit',
    'Crypto Send',
    'Fiat Deposit',
    'Fiat Pay',
    'Card Spend',
] as const;

type TransactionType = typeof TRANSACTION_TYPES[number];

interface TypeSettings {
    system: boolean;
    email: boolean;
}

// ─── Threshold Info Sheet ──────────────────────────────────────────────────────
function ThresholdInfoSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    const footer = (
        <TouchableOpacity style={sheet.btn} onPress={onClose} activeOpacity={0.85} testID="threshold-okay">
            <Text style={sheet.btnText}>Okay</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} showBackButton footer={footer} maxHeight="90%">
            <View style={sheet.infoContent}>
                <View style={sheet.infoIconCircle}>
                    <HugeiconsIcon icon={Notification03FreeIcons} size={24} color={colors.textPrimary} />
                </View>
                <Text style={sheet.infoTitle}>Notifications Thresholds</Text>
                <Text style={sheet.infoBody}>
                    The Transaction Notification Feature allows users to customize notification thresholds for transactions, reducing disruptions caused by frequent small-amount notifications while ensuring users stay informed of significant financial movements.{'\n\n'}
                    Key Features{'\n'}
                    1. Customizable Notification Thresholds{'\n'}
                    {'• '}Users can set personalized notification thresholds for exempted transactions, applicable separately for incoming (deposits) and/or outgoing (withdrawals) transactions.{'\n\n'}
                    2. Focused Alerts, Reduced Disruption{'\n'}
                    {'• '}Efficient Filtering: Transactions below the set threshold (including deposits and withdrawals) will not trigger push notifications.{'\n'}
                    {'• '}Focused Monitoring: Only transactions exceeding the exempted notification amount will generate alerts, enabling users to concentrate on significant financial activities.{'\n\n'}
                    3. Standardized Currency Unit{'\n'}
                    {'• '}The notification exemption threshold is set in USD.{'\n'}
                    {'• '}For transactions in other currencies, the system will convert the amount to USD using real-time exchange rates and assess it against the user-defined threshold.
                </Text>
            </View>
        </BottomSheet>
    );
}

// ─── Error Sheet ──────────────────────────────────────────────────────────────
function ErrorSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    const footer = (
        <TouchableOpacity style={sheet.btn} onPress={onClose} activeOpacity={0.85} testID="error-okay">
            <Text style={sheet.btnText}>Okay</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} footer={footer}>
            <View style={sheet.statusContent}>
                <View style={[sheet.iconCircle, sheet.iconRed]}>
                    <HugeiconsIcon icon={Cancel01FreeIcons} size={24} color={palette.red} />
                </View>
                <Text style={sheet.statusTitle}>Enter an amount</Text>
            </View>
        </BottomSheet>
    );
}

// ─── Success Sheet ─────────────────────────────────────────────────────────────
function SuccessSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    const footer = (
        <TouchableOpacity style={sheet.btn} onPress={onClose} activeOpacity={0.85} testID="success-okay">
            <Text style={sheet.btnText}>Okay</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} footer={footer}>
            <View style={sheet.statusContent}>
                <View style={[sheet.iconCircle, sheet.iconGreen]}>
                    <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} size={24} color={colors.primary} />
                </View>
                <Text style={sheet.statusTitle}>
                    Notification settings have been{'\n'}updated successfully
                </Text>
            </View>
        </BottomSheet>
    );
}

// ─── Type Detail Sheet ─────────────────────────────────────────────────────────
function TypeDetailSheet({
    selectedType,
    settings,
    onUpdate,
    onClose,
}: {
    selectedType: TransactionType | null;
    settings: TypeSettings;
    onUpdate: (field: 'system' | 'email', value: boolean) => void;
    onClose: () => void;
}): React.ReactElement {
    const footer = (
        <TouchableOpacity style={sheet.btn} onPress={onClose} activeOpacity={0.85} testID="type-update-settings">
            <Text style={sheet.btnText}>Update Settings</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={selectedType !== null} onClose={onClose} showBackButton footer={footer} maxHeight="90%">
            {selectedType && (
                <View style={typeS.content}>
                    <Text style={typeS.title}>{selectedType}</Text>

                    <View style={typeS.row}>
                        <View style={typeS.rowText}>
                            <Text style={typeS.rowLabel}>System Notifications</Text>
                            <Text style={typeS.rowSubtitle}>Notify via app notification messages</Text>
                        </View>
                        <Switch
                            value={settings.system}
                            onValueChange={(val) => onUpdate('system', val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.background}
                            testID="type-system-toggle"
                        />
                    </View>

                    <View style={typeS.divider} />

                    <View style={typeS.row}>
                        <View style={typeS.rowText}>
                            <Text style={typeS.rowLabel}>Notify by Email</Text>
                            <Text style={typeS.rowSubtitle}>Send to linked email</Text>
                        </View>
                        <Switch
                            value={settings.email}
                            onValueChange={(val) => onUpdate('email', val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.background}
                            testID="type-email-toggle"
                        />
                    </View>
                </View>
            )}
        </BottomSheet>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const defaultTypeSettings = (): Record<string, TypeSettings> =>
    Object.fromEntries(TRANSACTION_TYPES.map((t) => [t, { system: true, email: false }]));

function getTypeLabel(settings: TypeSettings): string {
    const { system, email } = settings;
    if (system && email) return 'App + Email';
    if (email) return 'Email';
    if (!system) return 'Off';
    return 'App';
}

export default function NotifTransactionsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const [isEditing, setIsEditing] = useState(false);
    const [exemptEnabled, setExemptEnabled] = useState(false);
    const [amountIn, setAmountIn] = useState('');
    const [amountOut, setAmountOut] = useState('');

    const [typeSettings, setTypeSettings] = useState<Record<string, TypeSettings>>(defaultTypeSettings);
    const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

    const [showThreshold, setShowThreshold] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const updateTypeSetting = (field: 'system' | 'email', value: boolean) => {
        if (!selectedType) return;
        setTypeSettings((prev) => ({
            ...prev,
            [selectedType]: { ...prev[selectedType], [field]: value },
        }));
    };

    const onUpdate = () => {
        if (exemptEnabled && (!amountIn.trim() || !amountOut.trim())) {
            setShowError(true);
            return;
        }
        setShowSuccess(true);
    };

    const onSuccessClose = () => {
        setShowSuccess(false);
        setIsEditing(false);
    };

    // ─── View Mode ─────────────────────────────────────────────────
    const renderViewMode = () => (
        <>
            <ScrollView style={s.flex} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.sectionLabel}>Notifications</Text>

                <View style={s.summaryBlock}>
                    <View style={s.summaryRow}>
                        <Text style={s.summaryKey}>Exempted Amount (in)</Text>
                        <Text style={s.summaryValue}>
                            {exemptEnabled && amountIn ? `$${amountIn}` : 'None'}
                        </Text>
                    </View>
                    <View style={s.summaryDivider} />
                    <View style={s.summaryRow}>
                        <Text style={s.summaryKey}>Exempted Amount (out)</Text>
                        <Text style={s.summaryValue}>
                            {exemptEnabled && amountOut ? `$${amountOut}` : 'None'}
                        </Text>
                    </View>
                </View>

                {TRANSACTION_TYPES.map((type, idx) => (
                    <View key={type}>
                        <View style={s.viewTypeRow}>
                            <Text style={s.viewTypeLabel}>{type}</Text>
                            <Text style={s.viewTypeTag}>{getTypeLabel(typeSettings[type]).toUpperCase()}</Text>
                        </View>
                        {idx < TRANSACTION_TYPES.length - 1 && <View style={s.divider} />}
                    </View>
                ))}

                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity style={s.actionBtn} onPress={() => setIsEditing(true)} activeOpacity={0.85} testID="transactions-edit">
                    <Text style={s.actionBtnText}>Edit</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    // ─── Edit Mode ─────────────────────────────────────────────────
    const renderEditMode = () => (
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                style={s.flex}
                contentContainerStyle={s.editScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Toggle row */}
                <View style={s.toggleRow}>
                    <View style={s.toggleLeft}>
                        <Text style={s.toggleLabel}>
                            {exemptEnabled ? 'Exempted Amount' : 'Notification Threshold'}
                        </Text>
                        <Text style={s.toggleSubtitle}>No notification below set amount</Text>
                    </View>
                    <Switch
                        value={exemptEnabled}
                        onValueChange={setExemptEnabled}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                        testID="exempt-toggle"
                    />
                </View>

                {exemptEnabled ? (
                    <>
                        <Text style={s.inputLabel}>Transfer In</Text>
                        <View style={s.amountInputRow}>
                            <TextInput
                                style={s.amountInput}
                                value={amountIn}
                                onChangeText={setAmountIn}
                                placeholder="Enter"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                                testID="amount-in"
                            />
                            <Text style={s.adornment}>USD</Text>
                        </View>

                        <Text style={[s.inputLabel, { marginTop: spacing.md }]}>Transfer Out</Text>
                        <View style={s.amountInputRow}>
                            <TextInput
                                style={s.amountInput}
                                value={amountOut}
                                onChangeText={setAmountOut}
                                placeholder="Enter"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                                testID="amount-out"
                            />
                            <Text style={s.adornment}>USD</Text>
                        </View>

                        <TouchableOpacity style={s.plainInfoRow} onPress={() => setShowThreshold(true)} activeOpacity={0.7}>
                            <Text style={s.plainInfoText}>What is exempted amount?</Text>
                            <Text style={s.viewLink}>View</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={s.infoField} onPress={() => setShowThreshold(true)} activeOpacity={0.7} testID="view-threshold">
                        <Text style={s.infoFieldText}>What is exempted amount?</Text>
                        <Text style={s.viewLink}>View</Text>
                    </TouchableOpacity>
                )}

                {/* Transaction type rows */}
                {TRANSACTION_TYPES.map((type) => (
                    <View key={type} style={s.typeGroup}>
                        <Text style={s.typeGroupLabel}>{type}</Text>
                        <TouchableOpacity
                            style={s.typeField}
                            onPress={() => setSelectedType(type)}
                            activeOpacity={0.7}
                            testID={`type-${type}`}
                        >
                            <Text style={s.typeFieldText}>{getTypeLabel(typeSettings[type])}</Text>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity style={s.actionBtn} onPress={onUpdate} activeOpacity={0.85} testID="update-settings">
                    <Text style={s.actionBtnText}>Update Settings</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => {
                        if (isEditing) setIsEditing(false);
                        else navigation.goBack();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="transactions-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Transactions</Text>
                <View style={s.headerSpacer} />
            </View>

            {isEditing ? renderEditMode() : renderViewMode()}

            {/* ─── All Sheets ───────────────────────────────────────── */}
            <ThresholdInfoSheet visible={showThreshold} onClose={() => setShowThreshold(false)} />
            <ErrorSheet visible={showError} onClose={() => setShowError(false)} />
            <SuccessSheet visible={showSuccess} onClose={onSuccessClose} />
            <TypeDetailSheet
                selectedType={selectedType}
                settings={selectedType ? typeSettings[selectedType] : { system: true, email: false }}
                onUpdate={updateTypeSetting}
                onClose={() => setSelectedType(null)}
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm },
    editScroll: { paddingHorizontal: spacing.base, paddingTop: spacing.base },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.base, paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1, textAlign: 'center', ...typography.h4,
        color: colors.textPrimary, fontWeight: '700',
    },
    headerSpacer: { width: 36 },

    // View mode
    sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
    summaryBlock: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.card,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.lg,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
    summaryKey: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },
    summaryValue: { ...typography.bodyMd, color: colors.textMuted },
    summaryDivider: { height: 0.5, backgroundColor: colors.border },
    viewTypeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
    viewTypeLabel: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },
    viewTypeTag: {
        ...typography.caption, color: colors.textMuted,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm, overflow: 'hidden',
    },
    divider: { height: 0.5, backgroundColor: colors.border },

    // Footer
    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    actionBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    actionBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },

    // Edit: toggle
    toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    toggleLeft: { flex: 1, marginRight: spacing.sm },
    toggleLabel: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
    toggleSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

    // Bordered info field (toggle OFF)
    infoField: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
        marginTop: spacing.sm, marginBottom: spacing.lg,
    },
    infoFieldText: { ...typography.bodySm, color: colors.textMuted, flex: 1 },
    viewLink: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },

    // Amount inputs (toggle ON)
    inputLabel: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.xs },
    amountInputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.input, overflow: 'hidden',
    },
    amountInput: {
        flex: 1, paddingHorizontal: spacing.base, paddingVertical: spacing.md,
        ...typography.bodyMd, color: colors.textPrimary,
    },
    adornment: { paddingHorizontal: spacing.base, ...typography.bodySm, color: colors.textSecondary, fontWeight: '500' },

    // Plain info row (toggle ON)
    plainInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm },
    plainInfoText: { ...typography.bodySm, color: colors.textMuted, flex: 1 },

    // Transaction type rows
    typeGroup: { marginTop: spacing.base },
    typeGroupLabel: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '500', marginBottom: spacing.xs },
    typeField: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    },
    typeFieldText: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────
const sheet = StyleSheet.create({
    infoContent: { paddingBottom: spacing.xl },
    infoIconCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: palette.green50,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.base,
    },
    infoTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.base },
    infoBody: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 20 },

    statusContent: { alignItems: 'center', paddingVertical: spacing.lg, paddingBottom: spacing.xxl },
    iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    iconRed: { backgroundColor: palette.redLight },
    iconGreen: { backgroundColor: palette.green50 },
    statusTitle: { ...typography.h4, color: colors.textPrimary, fontWeight: '700', textAlign: 'center', lineHeight: 24 },

    btn: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', minHeight: 52,
    },
    btnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Type Detail Sheet Styles ─────────────────────────────────────────────────
const typeS = StyleSheet.create({
    content: { paddingBottom: spacing.xxl },
    title: { ...typography.h2, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xl },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
    rowText: { flex: 1, marginRight: spacing.sm },
    rowLabel: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '500' },
    rowSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    divider: { height: 0.5, backgroundColor: colors.border },
});
