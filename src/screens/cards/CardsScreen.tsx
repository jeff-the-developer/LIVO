import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useKYCStatus } from '@hooks/api/useKYC';
import { useCards } from '@hooks/api/useCards';
import BottomSheet from '@components/common/BottomSheet';
import type { AppStackParamList } from '@app-types/navigation.types';
import CardDashboardScreen from './CardDashboardScreen';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const heroImage = require('@assets/images/cards/cards_stack_v2.png');

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CardsScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const { data: kycStatus } = useKYCStatus();
  const { data: cards } = useCards();
  const [showRestricted, setShowRestricted] = useState(false);

  // If user has cards, show the dashboard
  const hasCards = (cards ?? []).length > 0;
  if (hasCards) return <CardDashboardScreen />;

  const isKYC1Verified = (kycStatus?.level ?? 0) >= 1;

  const onAddCard = () => {
    if (isKYC1Verified) {
      navigation.navigate('AddCard');
    } else {
      setShowRestricted(true);
    }
  };

  const onCompleteVerification = () => {
    setShowRestricted(false);
    navigation.navigate('IdentityVerification');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.screen}>
        {/* ─── Hero Zone (top ~55%) ──────────────────────────────── */}
        <View style={s.heroZone}>
          <Image
            source={heroImage}
            style={s.heroImage}
            resizeMode="contain"
            accessibilityLabel="LIVO Pay card tiers — Basic, Standard, Premium, Elite, Prestige"
          />
        </View>

        {/* ─── Content Zone (bottom) ─────────────────────────────── */}
        <View style={s.contentZone}>
          <Text style={s.title}>Global Cards Made Simple</Text>
          <Text style={s.subtitle}>Fast, Secure & Borderless</Text>
          <Text style={s.body}>
            Instantly create a private debit card in seconds and
            spend or withdraw cash anywhere in the world.
          </Text>
        </View>

        {/* ─── CTA (pinned to bottom) ────────────────────────────── */}
        <View style={s.ctaWrap}>
          <TouchableOpacity
            style={s.addBtn}
            onPress={onAddCard}
            activeOpacity={0.85}
            accessibilityLabel="Add a new card"
            accessibilityRole="button"
            testID="cards-add-now"
          >
            <Text style={s.addBtnText}>Add Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Operation Restricted Sheet ──────────────────────────── */}
      <BottomSheet
        visible={showRestricted}
        onClose={() => setShowRestricted(false)}
      >
        <View style={s.sheetContent}>
          {/* Close icon */}
          <View style={s.restrictedIconWrap}>
            <HugeiconsIcon icon={Cancel01FreeIcons} size={28} color={palette.red} />
          </View>

          <Text style={s.sheetTitle}>Operation Restricted</Text>
          <Text style={s.sheetBody}>
            This feature requires <Text style={s.bold}>KYC1</Text> level
            authentication. Please complete the corresponding authentication
            process to unlock access to this feature.
          </Text>

          <View style={s.sheetFooter}>
            <TouchableOpacity
              style={s.verifyBtn}
              onPress={onCompleteVerification}
              activeOpacity={0.85}
              accessibilityLabel="Complete verification"
              accessibilityRole="button"
              testID="cards-complete-verification"
            >
              <Text style={s.verifyBtnText}>Complete Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => setShowRestricted(false)}
              activeOpacity={0.85}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              testID="cards-cancel"
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },

  // Hero — takes the top portion
  heroZone: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Content — text beneath the hero
  contentZone: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },

  // CTA — pinned at the bottom
  ctaWrap: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
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

  // Bottom Sheet
  sheetContent: {
    paddingBottom: spacing.base,
  },
  restrictedIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.redLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  sheetTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  sheetBody: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetFooter: {
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
    backgroundColor: colors.surface,
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

