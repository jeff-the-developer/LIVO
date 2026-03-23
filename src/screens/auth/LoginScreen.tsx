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
import type { RootNavigatorParamList } from '@app-types/navigation.types';
import { useLogin } from '@hooks/api/useAuth';
import { handleApiError } from '@utils/errorHandler';
import AsyncButton from '@components/common/AsyncButton';
import Divider from '@components/common/Divider';
import FormField from '@components/forms/FormField';
import Input from '@components/common/Input';
import PasswordInput from '@components/common/PasswordInput';
import ScreenHeader from '@components/common/ScreenHeader';

type Nav = NativeStackNavigationProp<RootNavigatorParamList>;

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
  const canGoBack = navigation.canGoBack();
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
      console.log('[LoginScreen] Attempting login for:', data.identifier);
      await loginMutation.mutateAsync({
        identifier: data.identifier,
        password: data.password,
      });
    } catch (err) {
      console.error('[LoginScreen] Login failed with error:', err);
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
          <ScreenHeader
            title="Login"
            showBackButton={canGoBack}
            onBackPress={() => navigation.goBack()}
          />

          {/* Form */}
          <View style={styles.form}>
            {/* Identifier */}
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Mail/Phone Number"
                  error={errors.identifier?.message}
                >
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    hasError={!!errors.identifier}
                    placeholder="Mail/Phone Number"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    accessibilityLabel="Mail or phone number"
                  />
                </FormField>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Password"
                  error={errors.password?.message}
                >
                  <PasswordInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    hasError={!!errors.password}
                    placeholder="Enter Password"
                    testID="login-password"
                    accessibilityLabel="Password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                </FormField>
              )}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.linkText}>Forgot Password</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <Divider style={styles.dividerLine} />
              <Text style={styles.dividerText}>Quick  Continue With</Text>
              <Divider style={styles.dividerLine} />
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
            {/* Submit */}
            <View style={styles.footer}>
              <AsyncButton
                label="Submit"
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
                testID="login-submit"
              />
            </View>
          </View>
        </ScrollView>
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
  form: {
    gap: spacing.lg,
    marginTop: spacing.sm,
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
});
