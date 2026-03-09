import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    SecurityCheckFreeIcons,
    SmartPhone01FreeIcons,
    Mail01FreeIcons,
    Key01FreeIcons,
    SquareLock02FreeIcons,
    Activity01FreeIcons,
    LaptopPhoneSyncFreeIcons,
    Settings01FreeIcons,
    ShieldFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Menu Row ─────────────────────────────────────────────────────────────────
function MenuRow({
    icon,
    label,
    status,
    onPress,
    testID,
}: {
    icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
    label: string;
    status?: string;
    onPress: () => void;
    testID: string;
}): React.ReactElement {
    return (
        <TouchableOpacity
            style={s.row}
            onPress={onPress}
            activeOpacity={0.7}
            testID={testID}
        >
            <HugeiconsIcon icon={icon} size={22} color={colors.textPrimary} />
            <Text style={s.rowLabel}>{label}</Text>
            {status && <Text style={s.rowStatus}>{status}</Text>}
            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );
}

function Divider(): React.ReactElement {
    return <View style={s.divider} />;
}

function SectionGap(): React.ReactElement {
    return <View style={s.sectionGap} />;
}

const comingSoon = (label: string) => () =>
    Alert.alert(label, 'This feature is coming soon.');

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AccountSecurityScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="security-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Account Security</Text>
                <View style={s.headerSpacer} />
            </View>

            <ScrollView style={s.flex} showsVerticalScrollIndicator={false}>
                {/* ─── Group 1: Authentication ─────────────────────── */}
                <View style={s.group}>
                    <MenuRow
                        icon={SecurityCheckFreeIcons}
                        label="Authenticator"
                        status="Not Linked"
                        onPress={() => navigation.navigate('Authenticator')}
                        testID="security-authenticator"
                    />
                    <Divider />
                    <MenuRow
                        icon={SmartPhone01FreeIcons}
                        label="Mobile"
                        status="Not Linked"
                        onPress={() => navigation.navigate('SecurityMobile')}
                        testID="security-mobile"
                    />
                    <Divider />
                    <MenuRow
                        icon={Mail01FreeIcons}
                        label="Email"
                        status="Linked"
                        onPress={() => navigation.navigate('SecurityEmail')}
                        testID="security-email"
                    />
                    <Divider />
                    <MenuRow
                        icon={Key01FreeIcons}
                        label="Secure Key"
                        status="Set"
                        onPress={() => navigation.navigate('SecureKey')}
                        testID="security-key"
                    />
                </View>

                <SectionGap />

                {/* ─── Group 2: Password & Activity ────────────────── */}
                <View style={s.group}>
                    <MenuRow
                        icon={SquareLock02FreeIcons}
                        label="Login Password"
                        onPress={() => navigation.navigate('LoginPassword')}
                        testID="security-password"
                    />
                    <Divider />
                    <MenuRow
                        icon={Activity01FreeIcons}
                        label="My Activity"
                        onPress={() => navigation.navigate('MyActivity')}
                        testID="security-activity"
                    />
                    <Divider />
                    <MenuRow
                        icon={LaptopPhoneSyncFreeIcons}
                        label="Device Management"
                        onPress={() => navigation.navigate('MyDevice')}
                        testID="security-devices"
                    />
                </View>

                <SectionGap />

                {/* ─── Group 3: Other Security ─────────────────────── */}
                <View style={s.group}>
                    <MenuRow
                        icon={Settings01FreeIcons}
                        label="Withdrawal Settings"
                        onPress={() => navigation.navigate('WithdrawalSettings')}
                        testID="security-withdrawal"
                    />
                    <Divider />
                    <MenuRow
                        icon={ShieldFreeIcons}
                        label="Anti-Phishing Code"
                        onPress={() => navigation.navigate('AntiPhishing')}
                        testID="security-phishing"
                    />
                </View>

                <View style={{ height: spacing.xxl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
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

    group: { paddingHorizontal: spacing.base },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.lg, gap: spacing.sm,
    },
    rowLabel: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '500', flex: 1 },
    rowStatus: { ...typography.bodySm, color: colors.textSecondary, marginRight: spacing.xs },
    divider: { height: 0.5, backgroundColor: colors.border },
    sectionGap: { height: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.border },
});
