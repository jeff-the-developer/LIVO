import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    InformationCircleFreeIcons,
    UserFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AuthStackParamList } from '@app-types/navigation.types';
import {
    useCheckUsername,
    useCreateUsername,
    handleApiError,
} from '@hooks/api/useAuth';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type RouteProps = NativeStackScreenProps<AuthStackParamList, 'CreateUsername'>['route'];

const MIN_LEN = 5;
const MAX_LEN = 12;
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

// ─── Username Info Modal ──────────────────────────────────────────────────────
function UsernameInfoModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={infoStyles.safe}>
                <ScrollView
                    style={infoStyles.scroll}
                    contentContainerStyle={infoStyles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Arrow */}
                    <TouchableOpacity
                        style={infoStyles.backBtn}
                        onPress={onClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Close"
                        accessibilityRole="button"
                    >
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Avatar Placeholder */}
                    <View style={infoStyles.avatarWrap}>
                        <View style={infoStyles.avatar}>
                            <HugeiconsIcon icon={UserFreeIcons} size={24} color={colors.textSecondary} />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={infoStyles.title}>Username</Text>

                    {/* Content */}
                    <Text style={infoStyles.body}>
                        The Username design should be unique and convenient to use as it is
                        not only the key to identity recognition, but also a personal tag
                        for social interactions. Therefore your Username should be distinct
                        and cannot be duplicated.
                    </Text>

                    <Text style={infoStyles.body}>
                        Your Username is visible to all users, allowing others to search for
                        your account, interact, and initiate transactions. To avoid
                        confusion or misunderstandings, you should refrain from using names
                        that are highly similar to or identical to those of celebrities,
                        well-known institutions, or other entities unless you have obtained
                        exclusive certification from us.
                    </Text>

                    <Text style={infoStyles.body}>
                        When selecting a Username, there are a few important rules to
                        follow. Your Username must be between 5 and 12 characters in length
                        and can only include limited special characters, such as hyphens (-)
                        and underscores (_). These guidelines ensure that Username remain
                        clear, readable, and user-friendly.
                    </Text>

                    <Text style={infoStyles.body}>
                        It's important to note that we reserve the right to reclaim and
                        reassign Username under the following circumstances:
                    </Text>

                    {[
                        '• Violation of Platform Terms of Use: If a Username contains inappropriate content, offensive language, discriminatory remarks, or infringes on the rights of others, the platform may reclaim it to maintain a safe and harmonious community.',
                        '• Trademark or Copyright Infringement: Username cannot include protected trademarks, copyrights, or other intellectual property. In the event there is infringement on third-party rights, the platform will reclaim it to avoid legal complications.',
                        '• Impersonation or Misleading Content: Username must not impersonate others or intentionally provide misleading information. If it creates the impression that you represent a certain brand, organization, or individual without authorization, we may reclaim it to prevent fraud or confusion.',
                        '• Conflicts with Us or Our Partners: If a Username conflicts with our name or that of our partners, we may reclaim it to preserve our brand integrity and partnerships.',
                        '• Inactivity or Prolonged Non-Use: We may reclaim a Username if the associated account remains inactive for an extended period, making the name available for others to use.',
                        '• Malicious Actions or Abuse: Username created through malicious registration, squatting, bulk account creation, or other forms of abuse may be reclaimed by us to ensure a fair and transparent user experience.',
                    ].map((bullet, i) => (
                        <Text key={i} style={infoStyles.bullet}>
                            {bullet}
                        </Text>
                    ))}

                    <Text style={infoStyles.body}>
                        These measures are in place to maintain a secure and compliant
                        environment while protecting the rights of users and third parties.
                        If you violate any of these rules, we reserve the right to take
                        action in accordance with our terms of use. In the event your
                        Username is reclaimed, you will be assigned a temporary Username,
                        with the option to create a new one. This policy ensures effective
                        management while safeguarding the interests of all users.
                    </Text>
                </ScrollView>

                {/* Okay Button */}
                <View style={infoStyles.footer}>
                    <TouchableOpacity
                        style={infoStyles.okayBtn}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                        <Text style={infoStyles.okayText}>Okay</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CreateUsernameScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteProps>();
    const { mode, userId, currentUsername } = route.params;

    const isRegister = mode === 'register';

    const [username, setUsername] = useState(currentUsername ?? '');
    const [error, setError] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const checkMutation = useCheckUsername();
    const createMutation = useCreateUsername();

    // ─── Validate locally ───────────────────────────────────────────────────────
    const validate = (val: string): string | null => {
        if (val.length < MIN_LEN) return `Minimum ${MIN_LEN} characters`;
        if (val.length > MAX_LEN) return `Maximum ${MAX_LEN} characters`;
        if (!USERNAME_REGEX.test(val))
            return 'Letters, numbers, hyphens & underscores only. Must start with a letter.';
        return null;
    };

    // ─── On Change ──────────────────────────────────────────────────────────────
    const onChangeUsername = useCallback(
        (text: string) => {
            // Remove @ prefix if user types it
            const cleaned = text.replace(/^@/, '');
            setUsername(cleaned);

            const err = validate(cleaned);
            setError(err);

            // If valid, debounce availability check
            if (!err && cleaned.length >= MIN_LEN) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(async () => {
                    try {
                        const result = await checkMutation.mutateAsync(cleaned);
                        if (!result.data.available) {
                            setError(
                                result.data.suggestion
                                    ? `Taken. Try @${result.data.suggestion}`
                                    : 'Username already taken',
                            );
                        }
                    } catch {
                        // Silently fail availability check
                    }
                }, 500);
            }
        },
        [checkMutation],
    );

    // ─── Submit ─────────────────────────────────────────────────────────────────
    const onSubmit = async () => {
        const err = validate(username);
        if (err) {
            setError(err);
            return;
        }

        try {
            await createMutation.mutateAsync({
                user_id: userId ?? 'mock-user-001',
                username,
            });

            if (!isRegister) {
                // Edit profile mode — just go back
                navigation.goBack();
            }
            // Register mode — useCreateUsername hook auto-logs in → MainTabs
        } catch (e) {
            const apiErr = handleApiError(e);
            Alert.alert(apiErr.title, apiErr.message);
        }
    };

    const isLoading = createMutation.isPending;
    const isChecking = checkMutation.isPending;
    const isValid = username.length >= MIN_LEN && !error;
    const canSubmit = isValid && !isLoading && !isChecking;

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create Username</Text>
                    <TouchableOpacity
                        style={styles.infoBtn}
                        onPress={() => setShowInfo(true)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Username info"
                        accessibilityRole="button"
                    >
                        <HugeiconsIcon icon={InformationCircleFreeIcons} size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.label}>Username</Text>

                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            value={`@${username}`}
                            onChangeText={(text) => onChangeUsername(text)}
                            placeholder="@YourUsername"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={MAX_LEN + 1} // +1 for @ prefix
                            returnKeyType="done"
                            onSubmitEditing={onSubmit}
                        />
                        {/* Character counter */}
                        <View style={styles.counterWrap}>
                            <Text
                                style={[
                                    styles.counter,
                                    username.length >= MIN_LEN && !error
                                        ? styles.counterValid
                                        : styles.counterInvalid,
                                ]}
                            >
                                {username.length}/{MAX_LEN}
                            </Text>
                        </View>
                    </View>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <Text style={styles.hintText}>
                            {MIN_LEN}-{MAX_LEN} characters, supports letters/-/_
                        </Text>
                    )}

                    {isChecking && (
                        <Text style={styles.checkingText}>Checking availability...</Text>
                    )}
                </ScrollView>

                {/* Submit */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                        onPress={onSubmit}
                        activeOpacity={0.85}
                        disabled={!canSubmit}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.submitText}>
                                {isRegister ? 'Submit' : 'Update Username'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Info Modal */}
            <UsernameInfoModal visible={showInfo} onClose={() => setShowInfo(false)} />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
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
    backArrow: { ...typography.h3, color: colors.textPrimary },
    title: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    infoBtn: { width: 36, alignItems: 'flex-end' },
    infoBtnText: {
        fontSize: 20,
        color: colors.textSecondary,
    },

    label: {
        ...typography.label,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    inputError: { borderColor: colors.error },
    counterWrap: {
        position: 'absolute',
        right: spacing.base,
    },
    counter: {
        ...typography.bodySm,
        fontWeight: '600',
    },
    counterValid: { color: colors.primary },
    counterInvalid: { color: colors.textMuted },

    hintText: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
    checkingText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    submitBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});

// ─── Info Modal Styles ────────────────────────────────────────────────────────
const infoStyles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl },
    backBtn: {
        alignSelf: 'flex-start',
        paddingVertical: spacing.base,
    },
    backArrow: { ...typography.h3, color: colors.textPrimary },

    avatarWrap: {
        alignItems: 'center',
        marginVertical: spacing.base,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarIcon: { fontSize: 24 },

    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.base,
    },
    body: {
        ...typography.bodySm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.base,
    },
    bullet: {
        ...typography.bodySm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.sm,
        paddingLeft: spacing.sm,
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    okayBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    okayText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
