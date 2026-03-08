import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import MainTabs from './MainTabs';
import EditProfileScreen from '@screens/profile/EditProfileScreen';
import AvatarPictureScreen from '@screens/profile/AvatarPictureScreen';
import EditMobileScreen from '@screens/profile/EditMobileScreen';
import EditEmailScreen from '@screens/profile/EditEmailScreen';
import VerificationScreen from '@screens/profile/VerificationScreen';
import IdentityVerificationScreen from '@screens/profile/IdentityVerificationScreen';
import KYC1VerifyScreen from '@screens/profile/KYC1VerifyScreen';
import MyAddressScreen from '@screens/profile/MyAddressScreen';
import StatusUpgradeScreen from '@screens/profile/StatusUpgradeScreen';
import VerifyOTPScreen from '@screens/auth/VerifyOTPScreen';
import CreateUsernameScreen from '@screens/auth/CreateUsernameScreen';
import PrimaryNationalityScreen from '@screens/kyc/PrimaryNationalityScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack(): React.ReactElement {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="AvatarPicture" component={AvatarPictureScreen} />
            <Stack.Screen name="EditMobile" component={EditMobileScreen} />
            <Stack.Screen name="EditEmail" component={EditEmailScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
            <Stack.Screen name="KYC1Verify" component={KYC1VerifyScreen} />
            <Stack.Screen name="MyAddress" component={MyAddressScreen} />
            <Stack.Screen name="StatusUpgrade" component={StatusUpgradeScreen} />
            <Stack.Screen name="PrimaryNationality" component={PrimaryNationalityScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="CreateUsername" component={CreateUsernameScreen} />
        </Stack.Navigator>
    );
}
