import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuthStore } from '@stores/authStore';
import { colors } from '@theme/colors';
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
            {(isLoggedIn || DEV_SKIP_AUTH) ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
