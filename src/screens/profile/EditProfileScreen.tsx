import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    UserFreeIcons,
    SmartPhone01FreeIcons,
    Mail01FreeIcons,
    SecurityCheckFreeIcons,
    Location01FreeIcons,
    Camera01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useAuthStore } from '@stores/authStore';
import type { AppStackParamList } from '@app-types/navigation.types';
import Avatar from '@components/common/Avatar';
import MenuItem from '@components/common/MenuItem';
import { useDeleteAccount, handleApiError } from '@hooks/api/useProfile';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Dividers ─────────────────────────────────────────────────────────────────
function LineDivider(): React.ReactElement {
    return (
        <View
            style={{
                height: 0.5,
                backgroundColor: colors.border,
                marginHorizontal: spacing.base,
            }}
        />
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function EditProfileScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);

    const username = user?.username ?? 'User';
    const memberSince = '15/12/2025'; // TODO: get from user.created_at

    const deleteMutation = useDeleteAccount();

    const onDeleteAccount = () => {
        Alert.alert(
            'Close Account',
            'Are you sure you want to close your account and delete your profile? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(undefined, {
                            onError: (err) =>
                                Alert.alert('Error', handleApiError(err).message),
                        });
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ────────────────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="editprofile-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Avatar + Info ─────────────────────────────────────── */}
                <View style={styles.userSection}>
                    <View style={styles.avatarWrap}>
                        <Avatar
                            name={username}
                            imageUrl={user?.avatar_url}
                            size={72}
                        />
                        <TouchableOpacity
                            style={styles.cameraBadge}
                            onPress={() => navigation.navigate('AvatarPicture')}
                            accessibilityLabel="Change profile photo"
                            accessibilityRole="button"
                            testID="editprofile-change-photo"
                        >
                            <HugeiconsIcon
                                icon={Camera01FreeIcons}
                                size={14}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.username}>@{username}</Text>
                    <Text style={styles.memberSince}>
                        Member Since {memberSince}
                    </Text>
                </View>

                {/* ─── Menu Items ────────────────────────────────────────── */}
                <MenuItem
                    icon={UserFreeIcons}
                    label="Username"
                    onPress={() => navigation.navigate('CreateUsername', {
                        mode: 'edit-profile',
                        userId: user?.user_id,
                        currentUsername: username,
                    })}
                    testID="editprofile-menu-username"
                />
                <LineDivider />
                <MenuItem
                    icon={SmartPhone01FreeIcons}
                    label="Mobile"
                    onPress={() => navigation.navigate('EditMobile')}
                    testID="editprofile-menu-mobile"
                />
                <LineDivider />
                <MenuItem
                    icon={Mail01FreeIcons}
                    label="Email"
                    onPress={() => navigation.navigate('EditEmail')}
                    testID="editprofile-menu-email"
                />
                <LineDivider />
                <MenuItem
                    icon={SecurityCheckFreeIcons}
                    label="Identity Verification"
                    onPress={() => navigation.navigate('Verification')}
                    testID="editprofile-menu-kyc"
                />
                <LineDivider />
                <MenuItem
                    icon={Location01FreeIcons}
                    label="My Address"
                    onPress={() => navigation.navigate('MyAddress')}
                    testID="editprofile-menu-address"
                />

                {/* Bottom spacer */}
                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            {/* ─── Delete Account Button ───────────────────────────────────── */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={onDeleteAccount}
                    activeOpacity={0.85}
                    disabled={deleteMutation.isPending}
                    accessibilityLabel="Close account and delete profile"
                    accessibilityRole="button"
                    testID="editprofile-delete"
                >
                    {deleteMutation.isPending ? (
                        <ActivityIndicator color={colors.textPrimary} />
                    ) : (
                        <Text style={styles.deleteText}>
                            Close Account & Delete Profile
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingBottom: spacing.base },

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
    headerSpacer: { width: 36 },

    // User section
    userSection: {
        alignItems: 'flex-start',
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
    },
    avatarWrap: {
        position: 'relative',
        marginBottom: spacing.sm,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 2,
        borderColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    username: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: 2,
    },
    memberSince: {
        ...typography.caption,
        color: colors.textMuted,
    },

    // Footer
    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    deleteBtn: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    deleteText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },
});
