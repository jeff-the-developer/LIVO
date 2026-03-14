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
import KYC2VerifyScreen from '@screens/profile/KYC2VerifyScreen';
import KYC3VerifyScreen from '@screens/profile/KYC3VerifyScreen';
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
import VerifyOTPScreen from '@screens/auth/VerifyOTPScreen'; // Needed for profile security changes? Keep if used for biometric etc.
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
            <Stack.Screen name="NotifTransactions" component={NotifTransactionsScreen} />
            <Stack.Screen name="NotifAccountActivities" component={NotifAccountActivitiesScreen} />
            <Stack.Screen name="NotifMiscellaneous" component={NotifMiscellaneousScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            {/* Home tab sub-screens (placeholders) */}
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
            <Stack.Screen name="TransactionDetail" component={PlaceholderScreen as any} />
            <Stack.Screen name="AllTransactions" component={PlaceholderScreen as any} />
            <Stack.Screen name="NotificationsList" component={NotificationsListScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        </Stack.Navigator>
    );
}
