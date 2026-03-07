import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { useSetPassword } from '@hooks/api/useAuth';
import { handleApiError } from '@utils/errorHandler';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type RouteProps = NativeStackScreenProps<AuthStackParamList, 'SetPassword'>['route'];

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });
type SetPasswordForm = z.infer<typeof schema>;

export default function SetPasswordScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const setPasswordMutation = useSetPassword();

  // email/user_id passed from RegisterScreen via navigation
  const email = (route.params as { email?: string } | undefined)?.email ?? '';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = async (data: SetPasswordForm) => {
    try {
      await setPasswordMutation.mutateAsync({
        user_id: 'mock-user-001',
        password: data.password,
        confirm_password: data.confirm,
      });
    } catch (err) {
      const e = handleApiError(err);
      Alert.alert(e.title, e.message);
    }
  };

  const isLoading = setPasswordMutation.isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Set Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Subtitle */}
          {!!email && (
            <Text style={styles.subtitle}>
              Creating account for{' '}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputWithIcon,
                        errors.password && styles.inputError,
                      ]}
                      placeholder="Create a password"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      secureTextEntry={!showPwd}
                      returnKeyType="next"
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showPwd ? '👁' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <Controller
                  control={control}
                  name="confirm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputWithIcon,
                        errors.confirm && styles.inputError,
                      ]}
                      placeholder="Re-enter password"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      secureTextEntry={!showConfirm}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirm((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showConfirm ? '👁' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirm && (
                <Text style={styles.errorText}>{errors.confirm.message}</Text>
              )}
            </View>

            {/* Password Rules Hint */}
            <View style={styles.rules}>
              <Text style={styles.rulesTitle}>Password must have:</Text>
              {[
                '8 or more characters',
                'At least 1 uppercase letter',
                'At least 1 number',
              ].map((rule) => (
                <Text key={rule} style={styles.ruleItem}>
                  · {rule}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={styles.submitText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
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
  headerSpacer: { width: 36 },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  form: { gap: spacing.lg, marginTop: spacing.sm },
  fieldGroup: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textPrimary },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.bodyMd,
    color: colors.textPrimary,
  },
  inputWithIcon: { flex: 1, paddingRight: spacing.xxl + spacing.base },
  inputError: { borderColor: colors.errorAlt },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: spacing.base, padding: spacing.xs },
  eyeIcon: { fontSize: 16 },
  errorText: {
    ...typography.caption,
    color: colors.errorAlt,
    marginTop: spacing.xs,
  },
  rules: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.base,
    gap: spacing.xs,
  },
  rulesTitle: { ...typography.label, color: colors.textSecondary },
  ruleItem: { ...typography.caption, color: colors.textMuted },
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
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    ...typography.bodyMd,
    color: colors.buttonText,
    fontWeight: '600',
  },
});
