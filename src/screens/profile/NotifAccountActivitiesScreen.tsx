import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, ArrowRight01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Activity Types ────────────────────────────────────────────────────────────
const ACTIVITY_TYPES = [
    'Login Alert',
    'Multiple Failed Logins',
] as const;

type ActivityType = typeof ACTIVITY_TYPES[number];

interface TypeSettings {
    system: boolean;
    email: boolean;
}

function getTypeLabel(settings: TypeSettings): string {
    const { system, email } = settings;
    if (system && email) return 'App + Email';
    if (email) return 'Email';
    if (!system) return 'None';
    return 'App';
}

// ─── Activity Detail Sheet ─────────────────────────────────────────────────────
function ActivityDetailSheet({
    selectedType,
    settings,
    onUpdate,
    onClose,
}: {
    selectedType: ActivityType | null;
    settings: TypeSettings;
    onUpdate: (field: 'system' | 'email', value: boolean) => void;
    onClose: () => void;
}): React.ReactElement {
    const footer = (
        <TouchableOpacity style={s.actionBtn} onPress={onClose} activeOpacity={0.85} testID="activity-update-settings">
            <Text style={s.actionBtnText}>Update Settings</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={selectedType !== null} onClose={onClose} showBackButton footer={footer} maxHeight="90%">
            {selectedType && (
                <View style={detailS.content}>
                    <Text style={detailS.title}>{selectedType}</Text>

                    <View style={detailS.row}>
                        <View style={detailS.rowText}>
                            <Text style={detailS.rowLabel}>System Notifications</Text>
                            <Text style={detailS.rowSubtitle}>Notify via app notification messages</Text>
                        </View>
                        <Switch
                            value={settings.system}
                            onValueChange={(val) => onUpdate('system', val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.background}
                            testID="system-toggle"
                        />
                    </View>

                    <View style={detailS.divider} />

                    <View style={detailS.row}>
                        <View style={detailS.rowText}>
                            <Text style={detailS.rowLabel}>Email</Text>
                            <Text style={detailS.rowSubtitle}>Notify via linked email</Text>
                        </View>
                        <Switch
                            value={settings.email}
                            onValueChange={(val) => onUpdate('email', val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.background}
                            testID="email-toggle"
                        />
                    </View>
                </View>
            )}
        </BottomSheet>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const defaultSettings = (): Record<string, TypeSettings> =>
    Object.fromEntries(ACTIVITY_TYPES.map((t) => [t, { system: true, email: false }]));

export default function NotifAccountActivitiesScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const [isEditing, setIsEditing] = useState(false);
    const [typeSettings, setTypeSettings] = useState<Record<string, TypeSettings>>(defaultSettings);
    const [selectedType, setSelectedType] = useState<ActivityType | null>(null);

    const updateTypeSetting = (field: 'system' | 'email', value: boolean) => {
        if (!selectedType) return;
        setTypeSettings((prev) => ({
            ...prev,
            [selectedType]: { ...prev[selectedType], [field]: value },
        }));
    };

    // ─── View Mode ─────────────────────────────────────────────────
    const renderViewMode = () => (
        <>
            <ScrollView style={s.flex} contentContainerStyle={s.viewScroll} showsVerticalScrollIndicator={false}>
                <Text style={s.pageTitle}>Account Activities</Text>
                <Text style={s.pageSubtitle}>Login and suspicious activities</Text>

                {ACTIVITY_TYPES.map((type, idx) => (
                    <View key={type}>
                        <View style={s.viewRow}>
                            <Text style={s.viewRowLabel}>{type}</Text>
                            <Text style={s.viewRowTag}>{getTypeLabel(typeSettings[type]).toUpperCase()}</Text>
                        </View>
                        {idx < ACTIVITY_TYPES.length - 1 && <View style={s.divider} />}
                    </View>
                ))}
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity style={s.actionBtn} onPress={() => setIsEditing(true)} activeOpacity={0.85} testID="activities-edit">
                    <Text style={s.actionBtnText}>Edit</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    // ─── Edit Mode ─────────────────────────────────────────────────
    const renderEditMode = () => (
        <>
            <ScrollView style={s.flex} contentContainerStyle={s.editScroll} showsVerticalScrollIndicator={false}>
                {ACTIVITY_TYPES.map((type) => (
                    <View key={type} style={s.typeGroup}>
                        <Text style={s.typeGroupLabel}>{type}</Text>
                        <TouchableOpacity
                            style={s.typeField}
                            onPress={() => setSelectedType(type)}
                            activeOpacity={0.7}
                            testID={`activity-${type}`}
                        >
                            <Text style={s.typeFieldText}>{getTypeLabel(typeSettings[type])}</Text>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            <View style={s.footer}>
                <TouchableOpacity style={s.actionBtn} onPress={() => setIsEditing(false)} activeOpacity={0.85} testID="activities-update">
                    <Text style={s.actionBtnText}>Update Settings</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
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
                    testID="activities-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>
                    {isEditing ? 'Activities' : 'Account Activities'}
                </Text>
                <View style={s.headerSpacer} />
            </View>

            {isEditing ? renderEditMode() : renderViewMode()}

            {/* Detail sheet */}
            <ActivityDetailSheet
                selectedType={selectedType}
                settings={selectedType ? typeSettings[selectedType] : { system: true, email: false }}
                onUpdate={updateTypeSetting}
                onClose={() => setSelectedType(null)}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    viewScroll: { paddingHorizontal: spacing.base, paddingTop: spacing.lg },
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
    pageTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    pageSubtitle: {
        ...typography.bodySm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    viewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    viewRowLabel: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },
    viewRowTag: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    divider: { height: 0.5, backgroundColor: colors.border },

    // Edit mode
    typeGroup: { marginTop: spacing.base },
    typeGroupLabel: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    typeField: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    },
    typeFieldText: { ...typography.bodyMd, color: colors.textPrimary, flex: 1 },

    // Footer
    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    actionBtn: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', minHeight: 52,
    },
    actionBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Detail Sheet Styles ──────────────────────────────────────────────────────
const detailS = StyleSheet.create({
    content: { paddingBottom: spacing.xxl },
    title: { ...typography.h2, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xl },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
    rowText: { flex: 1, marginRight: spacing.sm },
    rowLabel: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '500' },
    rowSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    divider: { height: 0.5, backgroundColor: colors.border },
});
