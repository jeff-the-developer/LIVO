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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, QrCodeFreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { useRegister } from '@hooks/api/useAuth';
import { handleApiError } from '@utils/errorHandler';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

// ─── Validation ───────────────────────────────────────────────────────────────
const registerSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email, username or phone is required')
    .min(3, 'Must be at least 3 characters'),
  invite_code: z.string().optional(),
  agreed: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to continue' }),
  }),
});
type RegisterForm = z.infer<typeof registerSchema>;

// ─── QR Scan Icon ─────────────────────────────────────────────────────────────
function QRIcon(): React.ReactElement {
  return (
    <HugeiconsIcon icon={QrCodeFreeIcons} size={20} color={colors.textMuted} />
  );
}

export default function RegisterScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { identifier: '', invite_code: '', agreed: undefined },
  });

  const agreed = watch('agreed');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({
        identifier: data.identifier,
        invite_code: data.invite_code || undefined,
      });
    } catch (err) {
      const e = handleApiError(err);
      Alert.alert(e.title, e.message);
    }
  };

  const isLoading = registerMutation.isPending;

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
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Register</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Mail / Identifier */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mail</Text>
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.identifier && styles.inputError]}
                    placeholder="Mail/Username/UID"
                    placeholderTextColor={colors.textMuted}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                )}
              />
              {errors.identifier && (
                <Text style={styles.errorText}>{errors.identifier.message}</Text>
              )}
            </View>

            {/* Invite Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Invite Code</Text>
              <View style={styles.inputRow}>
                <Controller
                  control={control}
                  name="invite_code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      placeholder="Enter Invite Code (Optional)"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoCapitalize="characters"
                      returnKeyType="done"
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.qrBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  // TODO: Hook up expo-camera QR scanner
                  onPress={() => Alert.alert('Coming soon', 'QR scanner will be available in a future update.')}
                >
                  <QRIcon />
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Support */}
            <TouchableOpacity
              onPress={() => Alert.alert('Support', 'Contact us at support@livopay.com')}
            >
              <Text style={styles.linkText}>Contact Support</Text>
            </TouchableOpacity>

            {/* Already have account */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom: Terms + Submit */}
        <View style={styles.footer}>
          {/* Terms Checkbox */}
          <Controller
            control={control}
            name="agreed"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => onChange(value ? undefined : true)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I've read & agreed to the{' '}
                  <Text style={styles.linkText}>User Agreement & Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.agreed && (
            <Text style={[styles.errorText, styles.termsError]}>
              {errors.agreed.message}
            </Text>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
  },
  backArrow: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
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
  inputWithIcon: {
    flex: 1,
    paddingRight: spacing.xxl + spacing.base,
  },
  inputError: {
    borderColor: colors.errorAlt,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrBtn: {
    position: 'absolute',
    right: spacing.base,
    padding: spacing.xs,
  },
  qrIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  errorText: {
    ...typography.caption,
    color: colors.errorAlt,
    marginTop: spacing.xs,
  },
  linkText: {
    ...typography.label,
    color: colors.primary,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  loginPrompt: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 11,
    color: colors.background,
    fontWeight: '700',
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsError: {
    marginTop: 0,
  },
  submitBtn: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...typography.bodyMd,
    color: colors.buttonText,
    fontWeight: '600',
  },
});
