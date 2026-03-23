// ─── Shared Types ─────────────────────────────────────────────────────────────
export type OTPMode = 'register' | 'edit-email' | 'edit-phone' | 'forgot-password';
export type IdentifierType = 'email' | 'phone';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
    /** Resume CreateUsername / PINSetup when session is valid but onboarding incomplete */
    OnboardingGate: undefined;
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
    KYC2Verify: undefined;
    KYC3Verify: undefined;
    Verification: undefined;
    MyAddress: undefined;
    StatusUpgrade: undefined;
    MyCoupons: undefined;
    Events: undefined;
    AccountSecurity: undefined;
    Notifications: undefined;
    AppearanceDisplay: undefined;
    InviteFriends: undefined;
    MyInvites: undefined;
    ClientSupport: undefined;
    SupportChat: undefined;
    AboutLIVOPay: undefined;
    TermsOfService: undefined;
    SecurityEmail: undefined;
    SecurityMobile: undefined;
    Authenticator: undefined;
    SecureKey: undefined;
    LoginPassword: undefined;
    MyActivity: undefined;
    MyDevice: undefined;
    WithdrawalSettings: undefined;
    AntiPhishing: undefined;
    BiometricVerify: undefined;
    PrimaryNationality: undefined;
    DocumentCapture: {
        documentType: 'id_front' | 'id_back' | 'passport' | 'business_license' | 'address_proof';
        onComplete: (imageUri: string) => void;
    };
    LivoBusiness: undefined;
    SwitchAccount: undefined;
    AddCard: undefined;
    CardActivation: { tier?: string };
    // Auth screens reused inside app flow (Add New Account)
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
    SetPassword: {
        mode: 'register' | 'reset-password';
        identifier: string;
        userId?: string;
        resetToken?: string;
    };
    AccountType: undefined;
    PINSetup: undefined;
    BiometricSetup: undefined;
    // Notification sub-screens
    NotifTransactions: undefined;
    NotifAccountActivities: undefined;
    NotifMiscellaneous: undefined;
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
    // Home tab sub-screens
    AssetDetail: { symbol: string };
    TransactionDetail: {
        id: string;
        type?: string;
        status?: string;
        amount?: string;
        fee?: string;
        currency?: string;
        from?: string;
        to?: string;
        timestamp?: string;
        reference?: string;
        notes?: string;
    };
    AllTransactions: undefined;
    NotificationsList: undefined;
    QRScanner: undefined;
    // Send tab sub-screens
    /** Optional prefills when opened from QR / deep link */
    DirectTransfer:
        | {
              prefillSearchQuery?: string;
              prefillCurrency?: string;
              prefillAmount?: string;
              prefillNote?: string;
          }
        | undefined;
    /** Optional `prefilledAddress` when opened from QR scan */
    CryptoTransfer: { prefilledAddress?: string };
    BankTransfer: undefined;
    SendGifts: undefined;
    GiftsHistory: undefined;
    // Deposit sub-screens
    Deposit: undefined;
    QuickReceive: undefined;
    CryptoReceive: undefined;
    CashDeposit: undefined;
    BankTransferDeposit: undefined;
    BankAdditionalInfo: { bankName: string; bankId: string };
    RedeemCode: undefined;
    CreditDebitDeposit: undefined;
    AddFunds: {
        source: 'bank_transfer' | 'credit_debit' | 'apple_pay';
        currency?: string;
        bankDetails?: string;
        cardToken?: string;
    };
    // Swap sub-screens
    FXSwap: undefined;
    SwapRecords: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootNavigatorParamList = AuthStackParamList & MainTabParamList & AppStackParamList;

