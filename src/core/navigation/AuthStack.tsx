import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';

import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import VerifyEmailScreen from '@screens/auth/VerifyEmailScreen';
import SetPasswordScreen from '@screens/auth/SetPasswordScreen';
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
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="AccountType" component={AccountTypeScreen} />
            <Stack.Screen name="PINSetup" component={PINSetupScreen} />
            <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
        </Stack.Navigator>
    );
}
