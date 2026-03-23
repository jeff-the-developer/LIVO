import React, { useLayoutEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { useAuthStore } from '@stores/authStore';
import { colors } from '@theme/colors';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

/**
 * Routes authenticated users into the correct onboarding step after app restart.
 * See BACKEND_AUTH_RECOMMENDATIONS.md (pin_enabled + username funnel).
 */
export default function OnboardingGateScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const user = useAuthStore((s) => s.user);

    useLayoutEffect(() => {
        if (!user) {
            navigation.replace('Login');
            return;
        }
        if (!user.username?.trim()) {
            navigation.replace('CreateUsername', {
                mode: 'register',
                userId: user.user_id,
            });
            return;
        }
        if (user.pin_enabled === false) {
            navigation.replace('PINSetup');
            return;
        }
        // Should not happen — AppNavigator only mounts this when needsAuthOnboarding is true
        navigation.replace('Login');
    }, [user, navigation]);

    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
