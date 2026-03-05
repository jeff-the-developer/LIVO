// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    VerifyEmail: { email: string };
    SetPassword: { email: string };
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootNavigatorParamList = AuthStackParamList & MainTabParamList;
