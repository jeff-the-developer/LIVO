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
import MyCouponsScreen from '@screens/profile/MyCouponsScreen';
import EventsScreen from '@screens/profile/EventsScreen';
import AccountSecurityScreen from '@screens/profile/AccountSecurityScreen';
import NotificationsScreen from '@screens/profile/NotificationsScreen';
import AppearanceDisplayScreen from '@screens/profile/AppearanceDisplayScreen';
import InviteFriendsScreen from '@screens/profile/InviteFriendsScreen';
import MyInvitesScreen from '@screens/profile/MyInvitesScreen';
import ClientSupportScreen from '@screens/profile/ClientSupportScreen';
import SupportChatScreen from '@screens/profile/SupportChatScreen';
import AboutLIVOPayScreen from '@screens/profile/AboutLIVOPayScreen';
import TermsOfServiceScreen from '@screens/profile/TermsOfServiceScreen';
import SecurityEmailScreen from '@screens/profile/SecurityEmailScreen';
import SecurityMobileScreen from '@screens/profile/SecurityMobileScreen';
import AuthenticatorScreen from '@screens/profile/AuthenticatorScreen';
import SecureKeyScreen from '@screens/profile/SecureKeyScreen';
import LoginPasswordScreen from '@screens/profile/LoginPasswordScreen';
import MyActivityScreen from '@screens/profile/MyActivityScreen';
import MyDeviceScreen from '@screens/profile/MyDeviceScreen';
import WithdrawalSettingsScreen from '@screens/profile/WithdrawalSettingsScreen';
import AntiPhishingScreen from '@screens/profile/AntiPhishingScreen';
import BiometricVerifyScreen from '@screens/profile/BiometricVerifyScreen';
import VerifyOTPScreen from '@screens/auth/VerifyOTPScreen';
import CreateUsernameScreen from '@screens/auth/CreateUsernameScreen';
import PrimaryNationalityScreen from '@screens/kyc/PrimaryNationalityScreen';
import LivoBusinessScreen from '@screens/profile/LivoBusinessScreen';
import SwitchAccountScreen from '@screens/profile/SwitchAccountScreen';
import AddCardScreen from '@screens/cards/AddCardScreen';
import CardActivationScreen from '@screens/cards/CardActivationScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/auth/ResetPasswordScreen';
import SetPasswordScreen from '@screens/auth/SetPasswordScreen';
import AccountTypeScreen from '@screens/auth/AccountTypeScreen';
import PINSetupScreen from '@screens/auth/PINSetupScreen';
import BiometricSetupScreen from '@screens/auth/BiometricSetupScreen';
import NotifTransactionsScreen from '@screens/profile/NotifTransactionsScreen';
import NotifAccountActivitiesScreen from '@screens/profile/NotifAccountActivitiesScreen';
import NotifMiscellaneousScreen from '@screens/profile/NotifMiscellaneousScreen';

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
            <Stack.Screen name="MyCoupons" component={MyCouponsScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="AppearanceDisplay" component={AppearanceDisplayScreen} />
            <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />
            <Stack.Screen name="MyInvites" component={MyInvitesScreen} />
            <Stack.Screen name="ClientSupport" component={ClientSupportScreen} />
            <Stack.Screen name="SupportChat" component={SupportChatScreen} />
            <Stack.Screen name="AboutLIVOPay" component={AboutLIVOPayScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="SecurityEmail" component={SecurityEmailScreen} />
            <Stack.Screen name="SecurityMobile" component={SecurityMobileScreen} />
            <Stack.Screen name="Authenticator" component={AuthenticatorScreen} />
            <Stack.Screen name="SecureKey" component={SecureKeyScreen} />
            <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
            <Stack.Screen name="MyActivity" component={MyActivityScreen} />
            <Stack.Screen name="MyDevice" component={MyDeviceScreen} />
            <Stack.Screen name="WithdrawalSettings" component={WithdrawalSettingsScreen} />
            <Stack.Screen name="AntiPhishing" component={AntiPhishingScreen} />
            <Stack.Screen name="BiometricVerify" component={BiometricVerifyScreen} />
            <Stack.Screen name="PrimaryNationality" component={PrimaryNationalityScreen} />
            <Stack.Screen name="LivoBusiness" component={LivoBusinessScreen} />
            <Stack.Screen name="SwitchAccount" component={SwitchAccountScreen} />
            <Stack.Screen name="AddCard" component={AddCardScreen} />
            <Stack.Screen name="CardActivation" component={CardActivationScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
            <Stack.Screen name="AccountType" component={AccountTypeScreen} />
            <Stack.Screen name="PINSetup" component={PINSetupScreen} />
            <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
            <Stack.Screen name="NotifTransactions" component={NotifTransactionsScreen} />
            <Stack.Screen name="NotifAccountActivities" component={NotifAccountActivitiesScreen} />
            <Stack.Screen name="NotifMiscellaneous" component={NotifMiscellaneousScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="CreateUsername" component={CreateUsernameScreen} />
        </Stack.Navigator>
    );
}
