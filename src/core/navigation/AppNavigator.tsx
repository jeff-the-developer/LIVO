import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuthStore } from '@stores/authStore';
import { colors } from '@theme/colors';
import { needsAuthOnboarding } from '@utils/authOnboarding';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.cardBackground,
        border: colors.border,
        primary: colors.primary,
        text: colors.textPrimary,
        notification: colors.primary,
    },
};

// ⚠️ Set to true to skip auth during development — REMOVE before production
const DEV_SKIP_AUTH = false;

export default function AppNavigator(): React.ReactElement {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const user = useAuthStore((s) => s.user);

    const resumeOnboarding =
        !DEV_SKIP_AUTH && isLoggedIn && user != null && needsAuthOnboarding(user);

    if (!isHydrated && !DEV_SKIP_AUTH) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={navTheme}>
            {DEV_SKIP_AUTH ? (
                <AppStack />
            ) : resumeOnboarding ? (
                <AuthStack key="onboarding-resume" resumeOnboarding />
            ) : isLoggedIn ? (
                <AppStack />
            ) : (
                <AuthStack key="guest" />
            )}
        </NavigationContainer>
    );
}
