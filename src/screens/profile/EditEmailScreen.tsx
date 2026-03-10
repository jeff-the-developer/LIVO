import React, { useState } from 'react';
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
import { ArrowLeft01FreeIcons, UserGroupFreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useAuthStore } from '@stores/authStore';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useUpdateEmail, handleApiError } from '@hooks/api/useProfile';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain || !local) return email;
    const visible = local.length <= 2 ? local : local.slice(0, 2);
    return `${visible}****@${domain}`;
}

// ─── Security Tip Bottom Sheet ────────────────────────────────────────────────
function SecurityTipModal({
    visible,
    onOkay,
    onCancel,
    loading,
}: {
    visible: boolean;
    onOkay: () => void;
    onCancel: () => void;
    loading: boolean;
}): React.ReactElement {
    const footer = (
        <View style={{ gap: spacing.sm }}>
            <TouchableOpacity
                style={[modalStyles.okayBtn, loading && modalStyles.btnDisabled]}
                onPress={onOkay} activeOpacity={0.85} disabled={loading}
                accessibilityLabel="Okay" accessibilityRole="button" testID="security-tip-okay"
            >
                {loading ? <ActivityIndicator color={colors.buttonText} /> : <Text style={modalStyles.okayText}>Okay</Text>}
            </TouchableOpacity>
            <TouchableOpacity
                style={modalStyles.cancelBtn} onPress={onCancel} activeOpacity={0.85}
                accessibilityLabel="Cancel" accessibilityRole="button" testID="security-tip-cancel"
            >
                <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <BottomSheet visible={visible} onClose={onCancel} footer={footer}>
            <View style={modalStyles.iconWrap}>
                <HugeiconsIcon icon={UserGroupFreeIcons} size={26} color={colors.textPrimary} />
            </View>
            <Text style={modalStyles.title}>Security Tip</Text>
            <Text style={modalStyles.body}>
                You wont be able to make transfers within the next 12 hours after changing your email.
            </Text>
        </BottomSheet>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EditEmailScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);
    const updateEmailMutation = useUpdateEmail();

    const currentEmail = user?.email ?? '';
    const [email, setEmail] = useState(currentEmail);
    const [showTip, setShowTip] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const displayEmail = isEditing ? email : maskEmail(email || 'user@example.com');
    const isValid = email.includes('@') && email.includes('.');

    const onContinuePress = () => {
        if (!isValid) return;
        setShowTip(true);
    };

    const onTipOkay = () => {
        updateEmailMutation.mutate(
            { email },
            {
                onSuccess: () => {
                    setShowTip(false);
                    navigation.navigate('VerifyOTP', {
                        mode: 'edit-email',
                        identifier: email,
                        identifierType: 'email',
                    });
                },
                onError: (err) => {
                    setShowTip(false);
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
                        testID="editemail-back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Email</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.label}>Email</Text>

                    {/* ─── Email Input ──────────────────────────────── */}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={isEditing ? email : displayEmail}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={isEditing}
                            returnKeyType="done"
                            accessibilityLabel="Email address"
                            testID="editemail-input"
                        />
                        <TouchableOpacity
                            style={styles.editIconBtn}
                            onPress={() => setIsEditing(true)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityLabel="Edit email"
                            accessibilityRole="button"
                            testID="editemail-edit-icon"
                        >
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* ─── Continue Button ──────────────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueBtn,
                            (!isValid || !isEditing) && styles.btnDisabled,
                        ]}
                        onPress={onContinuePress}
                        activeOpacity={0.85}
                        disabled={!isValid || !isEditing}
                        accessibilityLabel="Continue"
                        accessibilityRole="button"
                        testID="editemail-continue"
                    >
                        <Text style={styles.continueText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ─── Security Tip ─────────────────────────────────────── */}
            <SecurityTipModal
                visible={showTip}
                onOkay={onTipOkay}
                onCancel={() => setShowTip(false)}
                loading={updateEmailMutation.isPending}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm },

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

    label: {
        ...typography.label,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
    },
    input: {
        flex: 1,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    editIconBtn: {
        padding: spacing.md,
    },
    editIcon: { fontSize: 16 },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    continueBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    btnDisabled: { opacity: 0.4 },
    continueText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
    iconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    title: {
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    body: {
        ...typography.bodySm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.base,
    },
    okayBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        width: '100%',
        marginBottom: spacing.sm,
    },
    btnDisabled: { opacity: 0.5 },
    okayText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
    cancelBtn: {
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        width: '100%',
    },
    cancelText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
