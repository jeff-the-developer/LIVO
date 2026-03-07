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
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { useLogin } from '@hooks/api/useAuth';
import { handleApiError } from '@utils/errorHandler';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Google "G" Logo (plain SVG-less placeholder) ────────────────────────────
function GoogleG(): React.ReactElement {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleGText}>G</Text>
    </View>
  );
}

export default function LoginScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync({
        identifier: data.identifier,
        password: data.password,
      });
    } catch (err) {
      const e = handleApiError(err);
      Alert.alert(e.title, e.message);
    }
  };

  const isLoading = loginMutation.isPending;

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
            <Text style={styles.title}>Login</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Identifier */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mail/Phone Number</Text>
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.identifier && styles.inputError]}
                    placeholder="Mail/Phone Number"
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
                      placeholder="Enter Password"
                      placeholderTextColor={colors.textMuted}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.linkText}>Forgot Password</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Quick  Continue With</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <GoogleG />
              <Text style={styles.socialBtnText}>Login with Google</Text>
            </TouchableOpacity>

            {/* Create Account */}
            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.socialBtnText}>Create an account</Text>
            </TouchableOpacity>
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
  eyeBtn: {
    position: 'absolute',
    right: spacing.base,
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.errorAlt,
    marginTop: spacing.xs,
  },
  forgotBtn: {
    alignSelf: 'flex-start',
    marginTop: -spacing.sm,
  },
  linkText: {
    ...typography.label,
    color: colors.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  socialBtnText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...typography.bodyMd,
    color: colors.buttonText,
    fontWeight: '600',
  },
});
