import React, { useState } from 'react';
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
  Copy01FreeIcons,
  Cancel01FreeIcons,
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
import BottomSheet from '@components/common/BottomSheet';
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

  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const username = user?.username ?? 'User';
  const uid = user?.svid ?? user?.user_id ?? '—';
  const membershipTier = user?.membership_tier ?? 'Standard';

  const isKYC1Verified =
    !kycLoading &&
    (kycStatus?.level ?? user?.kyc_level ?? 0) >= 1 &&
    kycStatus?.status === 'approved';

  const onLivoBusiness = () => {
    if (isKYC1Verified) {
      navigation.navigate('LivoBusiness');
    } else {
      setShowAccessDenied(true);
    }
  };

  const onCopyUID = async () => {
    await Clipboard.setStringAsync(uid);
    Alert.alert('Copied', 'UID copied to clipboard');
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
            iconImage={require('@assets/images/icons/identityverfication.png')}
            title="Identity Verification"
            subtitle="Complete to unlock more Features"
            iconBg="transparent"
            iconSize={40}
            onPress={() => navigation.navigate('Verification')}
            testID="profile-card-kyc"
          />
          <HighlightCard
            iconImage={require('@assets/images/icons/basicmember.png')}
            title={membershipTier}
            subtitle="Discover current benefits"
            iconBg="transparent"
            iconSize={40}
            onPress={() => navigation.navigate('StatusUpgrade')}
            testID="profile-card-membership"
          />
          <HighlightCard
            iconImage={require('@assets/images/icons/invitefriends.png')}
            title="Invite Friends"
            subtitle="Refer & Earn"
            iconBg="transparent"
            iconSize={40}
            onPress={() => navigation.navigate('InviteFriends')}
            testID="profile-card-invite"
          />
        </View>

        <SectionGap />

        {/* ─── Settings Group ────────────────────────────────────────────── */}
        <MenuItem
          iconImage={require('@assets/images/icons/profile/account_security.png')}
          label="Account Security"
          onPress={() => navigation.navigate('AccountSecurity')}
          testID="profile-menu-security"
        />
        <MenuItem
          iconImage={require('@assets/images/icons/profile/notifications.png')}
          label="Notifications"
          onPress={() => navigation.navigate('Notifications')}
          testID="profile-menu-notifications"
        />
        <MenuItem
          iconImage={require('@assets/images/icons/profile/appearance_display.png')}
          label="Appearance & Display"
          onPress={() => navigation.navigate('AppearanceDisplay')}
          testID="profile-menu-appearance"
        />

        <LineDivider />

        {/* ─── Rewards Group ─────────────────────────────────────────────── */}
        <MenuItem
          iconImage={require('@assets/images/icons/profile/coupons.png')}
          label="My Coupons"
          onPress={() => navigation.navigate('MyCoupons')}
          testID="profile-menu-coupons"
        />
        <MenuItem
          iconImage={require('@assets/images/icons/profile/events.png')}
          label="Events"
          onPress={() => navigation.navigate('Events')}
          testID="profile-menu-events"
        />

        <LineDivider />

        {/* ─── Business ──────────────────────────────────────────────────── */}
        <MenuItem
          iconImage={require('@assets/images/icons/profile/livo_business.png')}
          label="Livo Business"
          onPress={onLivoBusiness}
          testID="profile-menu-business"
        />

        <LineDivider />

        {/* ─── Support Group ─────────────────────────────────────────────── */}
        <MenuItem
          iconImage={require('@assets/images/icons/profile/client_support.png')}
          label="Client Support"
          onPress={() => navigation.navigate('ClientSupport')}
          testID="profile-menu-support"
        />
        <MenuItem
          iconImage={require('@assets/images/icons/profile/terms_of_service.png')}
          label="Terms of Service"
          onPress={() => navigation.navigate('TermsOfService')}
          testID="profile-menu-terms"
        />
        <MenuItem
          iconImage={require('@assets/images/icons/profile/about_livopay.png')}
          label="About LIVOPay"
          onPress={() => navigation.navigate('AboutLIVOPay')}
          testID="profile-menu-about"
        />

        <SectionGap />

        {/* ─── Bottom Actions ────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => navigation.navigate('SwitchAccount')}
            activeOpacity={0.85}
            accessibilityLabel="Switch account"
            accessibilityRole="button"
            testID="profile-switch-account"
          >
            <Text style={styles.switchText}>Switch Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => setShowSignOut(true)}
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

      {/* ─── Sign Out Sheet ──────────────────────────────────────────────── */}
      <BottomSheet
        visible={showSignOut}
        onClose={() => setShowSignOut(false)}
        footer={
          <View style={styles.signOutFooter}>
            <TouchableOpacity
              style={styles.proceedSignOutBtn}
              onPress={() => {
                setShowSignOut(false);
                logout();
              }}
              activeOpacity={0.85}
              testID="signout-confirm"
            >
              <Text style={styles.proceedSignOutText}>Proceed to Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowSignOut(false)}
              activeOpacity={0.85}
              testID="signout-cancel"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.signOutSheetTitle}>Sign Out</Text>
        <Text style={styles.signOutSheetBody}>
          You are about to log out of your current account.{'\n'}Do you want to continue?
        </Text>
      </BottomSheet>

      {/* ─── Access Denied Sheet ─────────────────────────────────────────── */}
      <BottomSheet
        visible={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
        footer={
          <View style={styles.accessDeniedFooter}>
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => {
                setShowAccessDenied(false);
                navigation.navigate('Verification');
              }}
              activeOpacity={0.85}
              testID="access-denied-verify"
            >
              <Text style={styles.verifyBtnText}>Complete Verification</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAccessDenied(false)}
              activeOpacity={0.85}
              testID="access-denied-cancel"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.accessDeniedIconWrap}>
          <HugeiconsIcon icon={Cancel01FreeIcons} size={28} color={palette.red} />
        </View>
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedBody}>
          This feature requires <Text style={{ fontWeight: '700' }}>KYC1</Text> verification. Please complete verification to unlock access
        </Text>
      </BottomSheet>
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
    backgroundColor: '#FF5A5A20',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    ...typography.bodyMd,
    color: '#FF5A5A',
    fontWeight: '600',
  },

  // Sign Out Sheet
  signOutSheetTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  signOutSheetBody: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  signOutFooter: {
    gap: spacing.sm,
  },
  proceedSignOutBtn: {
    backgroundColor: '#FF5A5A',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  proceedSignOutText: {
    ...typography.bodyMd,
    color: '#fff',
    fontWeight: '600',
  },

  // Access Denied Sheet
  accessDeniedIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.redLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  accessDeniedTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  accessDeniedBody: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  accessDeniedFooter: {
    gap: spacing.sm,
  },
  verifyBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  verifyBtnText: {
    ...typography.bodyMd,
    color: colors.buttonText,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelBtnText: {
    ...typography.bodyMd,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
