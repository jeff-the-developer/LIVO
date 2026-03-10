import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, ArrowRight01FreeIcons, CheckmarkCircle02FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useAuthStore } from '@stores/authStore';
import Avatar from '@components/common/Avatar';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface AccountEntry {
    id: string;
    username: string;
    uid: string;
    avatarUrl?: string;
    isCurrent: boolean;
}

// ─── Account Card ─────────────────────────────────────────────────────────────
function AccountCard({
    account,
    onPress,
}: {
    account: AccountEntry;
    onPress: () => void;
}): React.ReactElement {
    return (
        <TouchableOpacity
            style={s.card}
            onPress={onPress}
            activeOpacity={account.isCurrent ? 1 : 0.7}
            testID={`account-card-${account.id}`}
        >
            <Avatar name={account.username} imageUrl={account.avatarUrl} size={48} />
            <View style={s.cardInfo}>
                <Text style={s.cardName}>{account.username}</Text>
                <Text style={s.cardUid}>UID: {account.uid}</Text>
            </View>
            {account.isCurrent ? (
                <View style={s.currentBadge}>
                    <Text style={s.currentBadgeText}>Current</Text>
                </View>
            ) : (
                <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} size={20} color={colors.textMuted} />
            )}
            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SwitchAccountScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);

    // TODO: replace with API call to fetch all saved/logged-in accounts
    // e.g. const { data: accounts } = useSavedAccounts();
    // Each entry represents a previously authenticated account stored locally.
    const accounts: AccountEntry[] = [
        {
            id: user?.user_id ?? 'current',
            username: user?.username ?? 'User',
            uid: user?.svid ?? user?.user_id ?? '—',
            avatarUrl: user?.avatar_url,
            isCurrent: true,
        },
    ];

    const onAccountPress = (account: AccountEntry) => {
        if (account.isCurrent) return;
        // TODO: call switchAccount(account.id) to swap auth tokens
    };

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Back */}
            <TouchableOpacity
                style={s.backBtn}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                testID="switch-account-back"
            >
                <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={s.title}>Switch Account</Text>

            {/* Account List */}
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AccountCard account={item} onPress={() => onAccountPress(item)} />
                )}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Add New Account */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={s.addBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                    testID="switch-account-add"
                >
                    <Text style={s.addBtnText}>Add New Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    backBtn: {
        marginTop: spacing.sm,
        marginHorizontal: spacing.base,
        width: 36,
        alignItems: 'flex-start',
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        fontWeight: '800',
        marginHorizontal: spacing.base,
        marginTop: spacing.lg,
        marginBottom: spacing.base,
    },

    listContent: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.xs,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        gap: spacing.base,
        marginBottom: spacing.sm,
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    cardUid: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    currentBadge: {
        backgroundColor: palette.green100,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
    },
    currentBadgeText: {
        ...typography.caption,
        color: palette.green700,
        fontWeight: '500',
    },

    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
    },
    addBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    addBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
