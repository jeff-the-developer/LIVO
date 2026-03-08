import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActionSheetIOS,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useAuthStore } from '@stores/authStore';
import type { AppStackParamList } from '@app-types/navigation.types';
import Avatar from '@components/common/Avatar';
import {
    useUpdateAvatar,
    useResetAvatar,
    handleApiError,
} from '@hooks/api/useProfile';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function AvatarPictureScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);
    const username = user?.username ?? 'User';

    const updateMutation = useUpdateAvatar();
    const resetMutation = useResetAvatar();

    const isBusy = updateMutation.isPending || resetMutation.isPending;

    const handleChoosePhoto = () => {
        // TODO: Integrate expo-image-picker
        updateMutation.mutate(
            { image_data: 'mock-base64-data', mime_type: 'image/jpeg' },
            {
                onSuccess: () => Alert.alert('Success', 'Avatar updated!'),
                onError: (err) => Alert.alert('Error', handleApiError(err).message),
            },
        );
    };

    const handleTakePhoto = () => {
        // TODO: Integrate expo-camera
        updateMutation.mutate(
            { image_data: 'mock-camera-data', mime_type: 'image/jpeg' },
            {
                onSuccess: () => Alert.alert('Success', 'Avatar updated!'),
                onError: (err) => Alert.alert('Error', handleApiError(err).message),
            },
        );
    };

    const handleResetDefault = () => {
        resetMutation.mutate(undefined, {
            onSuccess: () => Alert.alert('Success', 'Avatar reset to default'),
            onError: (err) => Alert.alert('Error', handleApiError(err).message),
        });
    };

    const showActionSheet = () => {
        const options = ['Choose Photo', 'Take Photo', 'Use Default Photo', 'Cancel'];
        const cancelButtonIndex = 3;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options, cancelButtonIndex },
                (buttonIndex) => {
                    if (buttonIndex === 0) handleChoosePhoto();
                    else if (buttonIndex === 1) handleTakePhoto();
                    else if (buttonIndex === 2) handleResetDefault();
                },
            );
        } else {
            Alert.alert('Edit Avatar', undefined, [
                { text: 'Choose Photo', onPress: handleChoosePhoto },
                { text: 'Take Photo', onPress: handleTakePhoto },
                { text: 'Use Default Photo', onPress: handleResetDefault },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ─────────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="avatar-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Avatar Picture</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* ─── Large Avatar ────────────────────────────────────────── */}
            <View style={styles.avatarSection}>
                <Avatar
                    name={username}
                    imageUrl={user?.avatar_url}
                    size={200}
                />
            </View>

            {/* ─── Spacer ─────────────────────────────────────────────── */}
            <View style={styles.flex} />

            {/* ─── Edit Avatar Button ─────────────────────────────────── */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.editBtn, isBusy && styles.btnDisabled]}
                    onPress={showActionSheet}
                    activeOpacity={0.85}
                    disabled={isBusy}
                    accessibilityLabel="Edit avatar"
                    accessibilityRole="button"
                    testID="avatar-edit-btn"
                >
                    {isBusy ? (
                        <ActivityIndicator color={colors.buttonText} />
                    ) : (
                        <Text style={styles.editText}>Edit Avatar</Text>
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

    avatarSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xl,
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    editBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    btnDisabled: { opacity: 0.5 },
    editText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
