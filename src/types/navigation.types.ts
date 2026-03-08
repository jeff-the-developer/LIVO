// ─── Shared Types ─────────────────────────────────────────────────────────────
export type OTPMode = 'register' | 'edit-email' | 'edit-phone' | 'forgot-password';
export type IdentifierType = 'email' | 'phone';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    VerifyOTP: {
        mode: OTPMode;
        identifier: string;
        identifierType: IdentifierType;
    };
    SetPassword: {
        mode: 'register' | 'reset-password';
        identifier: string;
        userId?: string;
        resetToken?: string;
    };
    CreateUsername: {
        mode: 'register' | 'edit-profile';
        userId?: string;
        currentUsername?: string;
    };
    ForgotPassword: undefined;
    ResetPassword: { token: string };
    AccountType: undefined;
    PINSetup: undefined;
    BiometricSetup: undefined;
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────
export type MainTabParamList = {
    Home: undefined;
    Cards: undefined;
    Send: undefined;
    Earn: undefined;
    Profile: undefined;
};

// ─── App Stack (wraps MainTabs for push screens) ──────────────────────────────
export type AppStackParamList = {
    MainTabs: undefined;
    EditProfile: undefined;
    AvatarPicture: undefined;
    EditMobile: undefined;
    EditEmail: undefined;
    IdentityVerification: undefined;
    KYC1Verify: { accountType: 'individual' | 'corporate' };
    Verification: undefined;
    MyAddress: undefined;
    StatusUpgrade: undefined;
    PrimaryNationality: undefined;
    DocumentCapture: { 
        documentType: 'id_front' | 'id_back' | 'passport' | 'business_license' | 'address_proof';
        onComplete: (imageUri: string) => void;
    };
    // Shared screens reused from auth flow
    VerifyOTP: {
        mode: OTPMode;
        identifier: string;
        identifierType: IdentifierType;
    };
    CreateUsername: {
        mode: 'register' | 'edit-profile';
        userId?: string;
        currentUsername?: string;
    };
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootNavigatorParamList = AuthStackParamList & MainTabParamList & AppStackParamList;

