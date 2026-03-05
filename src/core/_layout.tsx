import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import {
    useFonts,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@stores/authStore';
import { queryClient } from '@config/queryClient';
import { colors } from '@theme/colors';
import AppNavigator from './navigation/AppNavigator';

export default function RootLayout(): React.ReactElement {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    const hydrate = useAuthStore((s) => s.hydrate);
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const [hydrateStarted, setHydrateStarted] = useState(false);

    useEffect(() => {
        if (!hydrateStarted) {
            setHydrateStarted(true);
            void hydrate();
        }
    }, [hydrate, hydrateStarted]);

    const isReady = fontsLoaded && isHydrated;

    if (!isReady) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                }}
            />
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <AppNavigator />
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
