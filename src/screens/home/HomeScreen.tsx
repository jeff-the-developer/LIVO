import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/authStore';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';

export default function HomeScreen(): React.ReactElement {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to Livo 🎉</Text>
        {user && (
          <Text style={styles.username}>@{user.username}</Text>
        )}
        <Text style={styles.placeholder}>Home screen — coming soon</Text>

        {/* Dev logout button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Log Out (Dev)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  welcome: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  username: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.base,
  },
  placeholder: {
    ...typography.bodyMd,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  logoutBtn: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  logoutText: {
    ...typography.bodyMd,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
