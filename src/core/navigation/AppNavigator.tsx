import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useAuthStore } from '@stores/authStore';
import { colors } from '@theme/colors';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const navTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.surface,
        border: colors.border,
        primary: colors.primary,
        text: colors.textPrimary,
        notification: colors.primary,
    },
};

export default function AppNavigator(): React.ReactElement {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const isHydrated = useAuthStore((s) => s.isHydrated);

    if (!isHydrated) {
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
            {isLoggedIn ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}
