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
import * as Clipboard from 'expo-clipboard';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  SecurityCheckFreeIcons,
  Crown02FreeIcons,
  UserGroupFreeIcons,
  SquareLock02FreeIcons,
  Notification03FreeIcons,
  PaintBrush01FreeIcons,
  Coupon01FreeIcons,
  Calendar03FreeIcons,
  Briefcase05FreeIcons,
  CustomerSupportFreeIcons,
  FileValidationFreeIcons,
  InformationSquareFreeIcons,
  Copy01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useAuthStore } from '@stores/authStore';
import Avatar from '@components/common/Avatar';
import MenuItem from '@components/common/MenuItem';
import HighlightCard from '@components/common/HighlightCard';
import KYCStatusBanner from '@components/kyc/KYCStatusBanner';
import { useKYCStatus } from '@hooks/api/useKYC';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Dividers ─────────────────────────────────────────────────────────────────
function SectionGap(): React.ReactElement {
  return <View style={{ height: spacing.sm }} />;
}

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

// ─── Main Profile Screen ─────────────────────────────────────────────────────
export default function ProfileScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: kycStatus, isLoading: kycLoading } = useKYCStatus();

  const username = user?.username ?? 'User';
  const uid = user?.svid ?? user?.user_id ?? '—';
  const membershipTier = user?.membership_tier ?? 'Standard';

  const onCopyUID = async () => {
    await Clipboard.setStringAsync(uid);
    Alert.alert('Copied', 'UID copied to clipboard');
  };

  const onSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const comingSoon = (label: string) => () =>
    Alert.alert(label, 'Coming soon');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Edit Profile Link ─────────────────────────────────────────── */}
        <View style={styles.editRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            testID="profile-edit-btn"
          >
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Avatar + Username ─────────────────────────────────────────── */}
        <View style={styles.userSection}>
          <Avatar
            name={username}
            imageUrl={user?.avatar_url}
            size={60}
          />
          <Text style={styles.username}>@{username}</Text>
          <TouchableOpacity
            style={styles.uidRow}
            onPress={onCopyUID}
            accessibilityLabel={`Copy UID ${uid}`}
            accessibilityRole="button"
            testID="profile-copy-uid"
          >
            <Text style={styles.uidText}>UID: {uid}</Text>
            <View style={styles.uidIcon}>
              <HugeiconsIcon
                icon={Copy01FreeIcons}
                size={14}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── KYC Status Banner ─────────────────────────────────────────── */}
        {kycStatus && !kycLoading && (
          <KYCStatusBanner
            level={kycStatus.level}
            status={kycStatus.status}
            rejectionReason={kycStatus.rejection_reason}
            onPress={() => navigation.navigate('Verification')}
            testID="profile-kyc-status"
          />
        )}

        {/* ─── Highlight Cards ───────────────────────────────────────────── */}
        <View style={styles.cardGroup}>
          <HighlightCard
            icon={SecurityCheckFreeIcons}
            title="Identity Verification"
            subtitle="Complete to unlock more Features"
            onPress={() => navigation.navigate('Verification')}
            testID="profile-card-kyc"
          />
          <HighlightCard
            icon={Crown02FreeIcons}
            title={membershipTier}
            subtitle="Discover current benefits"
            iconColor={colors.primary}
            onPress={() => navigation.navigate('StatusUpgrade')}
            testID="profile-card-membership"
          />
          <HighlightCard
            icon={UserGroupFreeIcons}
            title="Invite Friends"
            subtitle="Refer & Earn"
            onPress={() => navigation.navigate('InviteFriends')}
            testID="profile-card-invite"
          />
        </View>

        <SectionGap />

        {/* ─── Settings Group ────────────────────────────────────────────── */}
        <MenuItem
          icon={SquareLock02FreeIcons}
          label="Account Security"
          onPress={() => navigation.navigate('AccountSecurity')}
          testID="profile-menu-security"
        />
        <LineDivider />
        <MenuItem
          icon={Notification03FreeIcons}
          label="Notifications"
          onPress={() => navigation.navigate('Notifications')}
          testID="profile-menu-notifications"
        />
        <LineDivider />
        <MenuItem
          icon={PaintBrush01FreeIcons}
          label="Appearance & Display"
          onPress={() => navigation.navigate('AppearanceDisplay')}
          testID="profile-menu-appearance"
        />

        <SectionGap />

        {/* ─── Rewards Group ─────────────────────────────────────────────── */}
        <MenuItem
          icon={Coupon01FreeIcons}
          label="My Coupons"
          onPress={() => navigation.navigate('MyCoupons')}
          testID="profile-menu-coupons"
        />
        <LineDivider />
        <MenuItem
          icon={Calendar03FreeIcons}
          label="Events"
          onPress={() => navigation.navigate('Events')}
          testID="profile-menu-events"
        />

        <SectionGap />

        {/* ─── Business ──────────────────────────────────────────────────── */}
        <MenuItem
          icon={Briefcase05FreeIcons}
          label="Livo Business"
          onPress={comingSoon('Livo Business')}
          testID="profile-menu-business"
        />

        <SectionGap />

        {/* ─── Support Group ─────────────────────────────────────────────── */}
        <MenuItem
          icon={CustomerSupportFreeIcons}
          label="Client Support"
          onPress={() => navigation.navigate('ClientSupport')}
          testID="profile-menu-support"
        />
        <LineDivider />
        <MenuItem
          icon={FileValidationFreeIcons}
          label="Terms of Service"
          onPress={() => navigation.navigate('TermsOfService')}
          testID="profile-menu-terms"
        />
        <LineDivider />
        <MenuItem
          icon={InformationSquareFreeIcons}
          label="About LIVOPay"
          onPress={() => navigation.navigate('AboutLIVOPay')}
          testID="profile-menu-about"
        />

        <SectionGap />

        {/* ─── Bottom Actions ────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={comingSoon('Switch Account')}
            activeOpacity={0.85}
            accessibilityLabel="Switch account"
            accessibilityRole="button"
            testID="profile-switch-account"
          >
            <Text style={styles.switchText}>Switch Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onSignOut}
            activeOpacity={0.85}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            testID="profile-sign-out"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.base },

  editRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  editText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },

  userSection: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  username: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  uidRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uidText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  uidIcon: {
    marginLeft: spacing.xs,
  },

  cardGroup: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.background,
    borderRadius: borderRadius.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },

  actions: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  switchBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  switchText: {
    ...typography.bodyMd,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  signOutBtn: {
    backgroundColor: palette.redLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    ...typography.bodyMd,
    color: palette.red,
    fontWeight: '600',
  },
});
