import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    Mail01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_pill_light_mint.png');

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ClientSupportScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const onChat = () => {
        navigation.navigate('SupportChat');
    };

    const onEmail = () => {
        Linking.openURL('mailto:Hello@LIVOPay.com');
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
                    testID="support-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Client Support</Text>
                <View style={s.headerSpacer} />
            </View>

            {/* Options */}
            <View style={s.content}>
                {/* LIVOPay Chat */}
                <TouchableOpacity style={s.card} onPress={onChat} activeOpacity={0.7} testID="support-chat">
                    <View style={[s.iconWrap, { backgroundColor: palette.green50 }]}>
                        <Image source={livoIcon} style={s.livoIcon} resizeMode="contain" />
                    </View>
                    <View style={s.cardText}>
                        <Text style={s.cardTitle}>LIVOPay Chat</Text>
                        <Text style={s.cardSub}>Click to start chatting</Text>
                    </View>
                    <HugeiconsIcon icon={ArrowRight01FreeIcons} size={20} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity style={s.card} onPress={onEmail} activeOpacity={0.7} testID="support-email">
                    <View style={[s.iconWrap, { backgroundColor: palette.green50 }]}>
                        <HugeiconsIcon icon={Mail01FreeIcons} size={22} color={colors.textPrimary} />
                    </View>
                    <View style={s.cardText}>
                        <Text style={s.cardTitle}>Email</Text>
                        <Text style={s.cardSub}>
                            Click to email <Text style={s.emailBold}>Hello@LIVOPay.com</Text>
                        </Text>
                    </View>
                    <HugeiconsIcon icon={ArrowRight01FreeIcons} size={20} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
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

    content: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, gap: spacing.sm },

    card: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.card,
        padding: spacing.base, gap: spacing.sm,
    },
    iconWrap: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
    },
    livoIcon: { width: 28, height: 28 },
    cardText: { flex: 1 },
    cardTitle: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
    cardSub: { ...typography.bodySm, color: colors.textSecondary },
    emailBold: { fontWeight: '700', color: colors.textPrimary },
});
