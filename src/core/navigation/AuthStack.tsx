import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';

import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import VerifyOTPScreen from '@screens/auth/VerifyOTPScreen';
import SetPasswordScreen from '@screens/auth/SetPasswordScreen';
import CreateUsernameScreen from '@screens/auth/CreateUsernameScreen';

// Placeholder stubs for screens not yet built
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/auth/ResetPasswordScreen';
import AccountTypeScreen from '@screens/auth/AccountTypeScreen';
import PINSetupScreen from '@screens/auth/PINSetupScreen';
import BiometricSetupScreen from '@screens/auth/BiometricSetupScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack(): React.ReactElement {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
            <Stack.Screen name="CreateUsername" component={CreateUsernameScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="AccountType" component={AccountTypeScreen} />
            <Stack.Screen name="PINSetup" component={PINSetupScreen} />
            <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
        </Stack.Navigator>
    );
}
