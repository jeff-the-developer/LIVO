import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Share,
    Linking,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Copy01FreeIcons,
    Share01FreeIcons,
    Link01FreeIcons,
    ArrowRight01FreeIcons,
    FlashFreeIcons,
    ExchangeFreeIcons,
    CreditCardFreeIcons,
} from '@hugeicons/core-free-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useReferralInfo } from '@hooks/api/useSettings';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_gradient_icon.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qrCardLight = require('@assets/images/invite/qr_card_light.png');



// ─── Benefit Card Data ────────────────────────────────────────────────────────
interface BenefitCard {
    title: string;
    subtitle: string;
    icon: any;
    iconColor: string;
    iconBg: string;
}

const FRIEND_BENEFITS: BenefitCard[] = [
    {
        title: 'CryptoPay\nDiscount x 1',
        subtitle: 'Waive fee for crypto\ntransfer',
        icon: FlashFreeIcons,
        iconColor: '#FFFFFF',
        iconBg: colors.primary,
    },
    {
        title: 'FiatPay\nDiscount X 1',
        subtitle: 'Waive fee for Fiat\ntransfer',
        icon: FlashFreeIcons,
        iconColor: '#FFFFFF',
        iconBg: colors.primary,
    },
    {
        title: 'Swap\nDiscount x 3',
        subtitle: 'Reduce fiat swap fee\nto 0.6%',
        icon: ExchangeFreeIcons,
        iconColor: '#FFFFFF',
        iconBg: colors.primary,
    },
    {
        title: 'Card\nActivation X 1',
        subtitle: 'Activate a card for free',
        icon: CreditCardFreeIcons,
        iconColor: '#FFFFFF',
        iconBg: colors.primary,
    },
];

// ─── Affiliate Program Bottom Sheet ───────────────────────────────────────────
function AffiliateSheet({ visible, onClose }: {
    visible: boolean; onClose: () => void;
}): React.ReactElement {
    const footer = (
        <TouchableOpacity style={sheetS.footerBtn} onPress={onClose}
            activeOpacity={0.85} testID="affiliate-okay">
            <Text style={sheetS.footerBtnText}>Okay</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} showBackButton={true} maxHeight="90%" footer={footer}>
            <Text style={sheetS.title}>Affiliate Program</Text>
            <Text style={sheetS.body}>
                {`The Affiliate Program is a higher partnership initiative specifically designed for financial media, KOLs, professional marketing communities, and organizations, with flexible, outcome-based profit-sharing and exclusive benefits, we aim to help our affiliates amplify their branded impact in the digital wallet and Livo Fintech landscape returns. Below see the core highlights for our Affiliate Program.

1. High-Commissions with Exclusive Benefits
The Affiliate Program offers significantly higher commission rates compared to regular referrals. Whether it's through user sign-ups or transaction-based revenues, affiliates can maximize the value of their resources and achieve higher returns.

3. Tailored Promotional Support
Our program provides unique tools to help you run campaign as effectively and impactful as possible:
• Custom-Branded Landing Pages: Fully tailored landing pages that align with your brand identity and promotional needs
• Exclusive User Benefits: Users who register through your referral link enjoy special perks, such as higher cashback, reduced fees, or special bonuses, increasing conversion rates at your end
• Digital Visual/Physical Rewards: We can design and provide promotional material based on your annual KPIs, e.g. branded promotional items

3. Seamless Integration
The Affiliate Program goes beyond just partnerships. We work closely with your brand to create synergies between your audience and our solutions. We may provide:
• Co-Branded Campaigns: If you are a social media Influencer, we may assist in crafting your brand exposure and leveraging a broader user base.
• Tier and Social Media Partners: If you are a Tier 1 or broader community, we can leverage your reach to a broader, more targeted audience, a level exclusive to the Affiliate program.

By integrating your business with our ecosystem, we can generate broader collaboration and create sustainable growth for both you and your referral base.

4. Comprehensive Marketing Support
We offer dedicated marketing resources to Affiliate Partners exclusively:
• Exclusive Campaigns: Access to special promotions, branded marketing material, analytics, dedicated campaigns.
• Online Events: Such as industry summits and conferences, targeted at your audience. From event planning to execution, we handle the logistics and ensure your campaigns are impactful and returnable.

5. Flexible Referral Rewards
The Affiliate Program lets you define a custom incentive structure for your users encouraging user activity, ensuring continuous benefits to both you and your referral base.

6. Transparent Data and Seamless Management
Affiliates get full access to a comprehensive dashboard to monitor their performance including:
• Granular Metrics Tracking: Key data metrics such as sign-ups and transaction volume
• Revenue Transparency: Clear and detailed reports on commissions and rewards, ensuring peace of mind throughout the partnership
• Real time dashboards with campaign summaries and analytics you can customize for your promotional campaign and scalable
management

7. Let's Work Together
The Affiliate program, is a strategic, long-term partnership designed to grow with you. Whether you're a financial media KOL, a professional marketing community, or an organization, we are committed to help you succeed. Contact support to find out more.`}
            </Text>
        </BottomSheet>
    );
}

// ─── QR Carousel Card Designs ─────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;
const CARD_ASPECT_RATIO = 429 / 400; // from Figma asset (400x429 @1x)
const CARD_HEIGHT = CARD_WIDTH * CARD_ASPECT_RATIO;

const CARD_TITLE = 'Say Hello To Your\nAll-In-One Global Fiat &\nCrypto Wallet';
const CARD_SUBTITLE = 'Secure and Easy Global Payments. Receive and Exchange Fiat and Crypto Anytime, Anywhere';

function QrPlaceholder({ size = 140 }: { size?: number }): React.ReactElement {
    return (
        <View style={[cardStyles.qrBox, { width: size, height: size }]}>
            <Image source={livoIcon} style={{ width: size * 0.35, height: size * 0.35 }} resizeMode="contain" />
        </View>
    );
}

/** Design 1: Light green bg — uses exported Figma asset for pixel-perfect match */
function CardDesign1(): React.ReactElement {
    return (
        <View style={[cardStyles.card, { backgroundColor: palette.green50 }]}>
            <Image
                source={qrCardLight}
                style={cardStyles.cardImage}
                resizeMode="contain"
            />
        </View>
    );
}

/** Design 2: Full green top with centered QR, white bottom with text */
function CardDesign2(): React.ReactElement {
    return (
        <View style={[cardStyles.card, { backgroundColor: '#FFFFFF' }]}>
            <View style={cardStyles.greenHeader}>
                <QrPlaceholder size={170} />
            </View>
            <View style={[cardStyles.cardContent, { paddingTop: spacing.lg, paddingBottom: spacing.base }]}>
                <Text style={[cardStyles.cardTitle, { color: colors.textPrimary, fontSize: 26, lineHeight: 33 }]}>{CARD_TITLE}</Text>
                <Text style={[cardStyles.cardSubtitle, { color: 'rgba(0,0,0,0.20)' }]}>{CARD_SUBTITLE}</Text>
            </View>
        </View>
    );
}

/** Design 3: Light mint bg, text top, QR image asset filling bottom */
function CardDesign3(): React.ReactElement {
    return (
        <View style={[cardStyles.card, { backgroundColor: palette.green50 }]}>
            <View style={[cardStyles.cardContent, { paddingTop: spacing.xl }]}>
                <Text style={[cardStyles.cardTitle, { color: colors.textPrimary, fontSize: 26, lineHeight: 33, fontWeight: '700' }]}>{CARD_TITLE}</Text>
                <Text style={[cardStyles.cardSubtitle, { color: 'rgba(0,0,0,0.20)' }]}>{CARD_SUBTITLE}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: spacing.lg }}>
                {/* QR with SVG L-shaped bracket decorations */}
                <View style={cardStyles.qrWithBrackets}>
                    {/* Top-left L bracket — behind QR, peeking out left & bottom */}
                    <View style={cardStyles.bracketTL}>
                        <Svg width={100} height={144} viewBox="0 0 68 98" fill="none">
                            <Path d="M45.0666 62.2405C45.0666 52.5996 45.0743 42.9587 45.0588 33.314C45.055 31.7479 45.0356 30.1779 44.896 28.6195C44.7099 26.4836 43.8997 24.6345 41.9305 23.5335C40.6319 22.8086 39.1898 22.4249 37.7206 22.3628C34.8171 22.2349 31.9097 22.1729 29.0062 22.1651C20.4624 22.1419 11.9185 22.1574 3.37472 22.1651C2.62656 22.1651 1.90165 22.1147 1.23489 21.6999C0.447959 21.2115 0.0913154 20.475 0.0564262 19.5989C0.00215845 18.277 0.0021662 16.9512 0.00216632 15.6255C-0.00170907 11.6365 -0.00170872 7.64762 0.0137946 3.65869C0.0176703 3.08109 0.00603557 2.47634 0.168855 1.93363C0.587518 0.545839 1.5489 0.0535297 3.06848 0.0225163C5.10365 -0.0201242 7.13882 0.0108895 9.17399 0.0108896C19.4933 0.018642 29.8125 -0.0162463 40.1318 0.0612845C42.8841 0.080671 45.6481 0.336523 48.381 0.681532C51.5248 1.07693 54.5446 1.99953 57.3784 3.47261C59.6771 4.66657 61.7472 6.14352 63.4257 8.12442C64.5964 9.50833 65.6121 11.0163 66.1936 12.7375C66.651 14.0904 66.9262 15.5053 67.2131 16.9086C67.969 20.599 68 24.3437 68 28.0884C67.9961 47.7772 67.9922 67.4621 67.9806 87.1509C67.9806 87.841 67.9263 88.5387 67.8333 89.2249C67.6899 90.318 66.9533 90.9887 65.9958 91.3414C62.8055 92.5083 59.588 93.6014 56.386 94.7489C54.2927 95.4971 52.2187 96.2917 50.1293 97.0515C49.3424 97.3384 48.5593 97.6369 47.7491 97.8423C46.1442 98.2533 45.086 97.4353 45.0627 95.7723C45.0356 93.7526 45.0472 91.7368 45.0472 89.7172C45.0472 80.5609 45.0472 71.4046 45.0472 62.2444C45.0627 62.2405 45.0627 62.2405 45.0666 62.2405Z" fill="#01CA47" fillOpacity={0.15} />
                        </Svg>
                    </View>
                    {/* Bottom-right L bracket — behind QR, peeking out right & top */}
                    <View style={cardStyles.bracketBR}>
                        <Svg width={100} height={144} viewBox="0 0 68 98" fill="none">
                            <Path d="M22.9334 35.7068C22.9334 45.3477 22.9257 54.9885 22.9412 64.6333C22.9451 66.1994 22.9644 67.7694 23.104 69.3277C23.2901 71.4637 24.1003 73.3128 26.0695 74.4137C27.3682 75.1386 28.8102 75.5224 30.2794 75.5844C33.1829 75.7123 36.0903 75.7744 38.9938 75.7821C47.5376 75.8054 56.0815 75.7899 64.6253 75.7821C65.3735 75.7821 66.0984 75.8325 66.7651 76.2473C67.552 76.7358 67.9087 77.4723 67.9436 78.3484C67.9978 79.6703 67.9978 80.996 67.9978 82.3218C68.0017 86.3107 68.0017 90.2996 67.9862 94.2886C67.9823 94.8662 67.994 95.4709 67.8312 96.0136C67.4125 97.4014 66.4511 97.8937 64.9315 97.9247C62.8964 97.9674 60.8612 97.9364 58.826 97.9364C48.5068 97.9286 38.1875 97.9635 27.8682 97.886C25.1159 97.8666 22.352 97.6107 19.619 97.2657C16.4752 96.8703 13.4554 95.9477 10.6216 94.4747C8.32286 93.2807 6.25281 91.8037 4.57428 89.8228C3.40358 88.4389 2.38793 86.931 1.80645 85.2098C1.34902 83.8569 1.07379 82.442 0.786931 81.0387C0.0310116 77.3482 0 73.6035 0 69.8588C0.00387651 50.17 0.0077542 30.4851 0.0193837 10.7963C0.0193837 10.1063 0.0736508 9.40854 0.166687 8.7224C0.310118 7.62922 1.04666 6.95859 2.00415 6.60582C5.19452 5.43899 8.41202 4.34582 11.614 3.19837C13.7073 2.45021 15.7813 1.65552 17.8707 0.895728C18.6576 0.608866 19.4407 0.310374 20.2509 0.104919C21.8558 -0.305991 22.914 0.511951 22.9373 2.17497C22.9644 4.19463 22.9528 6.21042 22.9528 8.23008C22.9528 17.3864 22.9528 26.5427 22.9528 35.7029C22.9373 35.7068 22.9373 35.7068 22.9334 35.7068Z" fill="#01CA47" fillOpacity={0.15} />
                        </Svg>
                    </View>
                    {/* QR on top of brackets */}
                    <QrPlaceholder size={150} />
                </View>
            </View>
        </View>
    );
}

/** Design 4: Full green bg, white text top, QR bottom-right, different blob */
function CardDesign4(): React.ReactElement {
    return (
        <View style={[cardStyles.card, { backgroundColor: colors.primary }]}>
            {/* Decorative light green blob */}
            <View style={[cardStyles.blob, { left: -40, bottom: 20, backgroundColor: palette.green200, width: 180, height: 180 }]} />
            <View style={cardStyles.cardContent}>
                <Text style={[cardStyles.cardTitle, { color: '#FFFFFF' }]}>{CARD_TITLE}</Text>
                <Text style={[cardStyles.cardSubtitle, { color: 'rgba(255,255,255,0.60)' }]}>{CARD_SUBTITLE}</Text>
            </View>
            <View style={{ alignItems: 'flex-start', paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
                <QrPlaceholder size={110} />
            </View>
        </View>
    );
}

const CARD_DESIGNS = [CardDesign1, CardDesign2, CardDesign3, CardDesign4];

const cardStyles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 22,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardImageBottom: {
        width: '100%',
        flex: 1,
    },
    cardContent: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: '600',
        lineHeight: 30,
        marginBottom: spacing.sm,
    },
    cardSubtitle: {
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 20,
    },
    qrBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    greenHeader: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.xxxl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    blob: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.5,
    },
    qrWithBrackets: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
    },
    bracketTL: {
        position: 'absolute',
        zIndex: 0,
        left: -10,
        bottom: -15,
        width: 100,
        height: 144,
    },
    bracketBR: {
        position: 'absolute',
        zIndex: 0,
        right: -10,
        top: -15,
        width: 100,
        height: 144,
    },
});

// ─── Invite Modal (QR Code + Share) ───────────────────────────────────────────
// Custom modal: card carousel floats ABOVE the white bottom panel (per Figma).
function InviteModal({ visible, onClose, referralCode, referralLink }: {
    visible: boolean; onClose: () => void;
    referralCode: string; referralLink: string;
}): React.ReactElement {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<ScrollView>(null);

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
        setActiveIndex(index);
    }, []);

    const onCopyCode = async () => {
        await Clipboard.setStringAsync(referralCode);
        Alert.alert('Copied', 'Referral code copied to clipboard');
    };
    const onCopyLink = async () => {
        await Clipboard.setStringAsync(referralLink);
        Alert.alert('Copied', 'Referral link copied to clipboard');
    };
    const onSharePress = async () => {
        try {
            await Share.share({
                message: `Join me on LIVOPay! Use my invite code: ${referralCode}\n\n${referralLink}`,
                title: 'Invite to LIVOPay',
            });
        } catch {
            // User cancelled
        }
    };
    const onMail = () => {
        Linking.openURL(`mailto:?subject=Join LIVOPay&body=${encodeURIComponent(
            `Join me on LIVOPay! Use my invite code: ${referralCode}\n\n${referralLink}`
        )}`);
    };

    if (!visible) return <></>;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <TouchableOpacity
                style={modalS.backdrop}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Two separate floating elements */}
            <View style={modalS.outerWrap} pointerEvents="box-none">
                {/* 1. Floating card (rounded, separate) */}
                <View style={modalS.cardContainer}>
                    <ScrollView
                        ref={carouselRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={onScroll}
                        decelerationRate="fast"
                        snapToInterval={CARD_WIDTH}
                    >
                        {CARD_DESIGNS.map((CardComponent, index) => (
                            <CardComponent key={index} />
                        ))}
                    </ScrollView>
                </View>

                {/* Pagination Dots (in the gap) */}
                <View style={modalS.dots}>
                    {CARD_DESIGNS.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                modalS.dot,
                                index === activeIndex && modalS.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* 2. Floating white panel (rounded, separate) */}
                <View style={modalS.panel}>
                    {/* Code */}
                    <View style={modalS.infoRow}>
                        <Text style={modalS.infoLabel}>Code</Text>
                        <View style={modalS.infoRight}>
                            <Text style={modalS.infoValue}>{referralCode}</Text>
                            <TouchableOpacity onPress={onCopyCode}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <HugeiconsIcon icon={Copy01FreeIcons} size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Link */}
                    <View style={[modalS.infoRow, { borderTopWidth: 0 }]}>
                        <Text style={[modalS.infoLabel, { color: colors.primary }]}>Link</Text>
                        <View style={modalS.infoRight}>
                            <Text style={modalS.infoValue} numberOfLines={1}>{referralLink}</Text>
                            <TouchableOpacity onPress={onCopyLink}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <HugeiconsIcon icon={Copy01FreeIcons} size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={modalS.actions}>
                        <TouchableOpacity style={modalS.actionItem} activeOpacity={0.7}>
                            <View style={modalS.actionIconWrap}>
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke={colors.textPrimary} strokeWidth={1.5} />
                                    <Circle cx={16.5} cy={7.5} r={1.5} stroke={colors.textPrimary} strokeWidth={1.5} />
                                    <Path d="M16 22C15.3805 19.7749 13.9345 17.7821 11.8765 16.3342C9.65761 14.7729 6.87163 13.9466 4.01569 14.0027C3.67658 14.0019 3.33776 14.0127 3 14.0351" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinejoin="round" />
                                    <Path d="M13 18C14.7015 16.6733 16.5345 15.9928 18.3862 16.0001C19.4362 15.999 20.4812 16.2216 21.5 16.6617" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinejoin="round" />
                                </Svg>
                            </View>
                            <Text style={modalS.actionLabel}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalS.actionItem} onPress={onCopyLink} activeOpacity={0.7}>
                            <View style={modalS.actionIconWrap}>
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M9.5 14.5L14.5 9.5" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinecap="round" />
                                    <Path d="M16.8463 14.6095L19.4558 12C21.5147 9.94113 21.5147 6.60303 19.4558 4.54416C17.397 2.48528 14.0589 2.48528 12 4.54416L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.397 2.48528 14.0589 4.54416 12L7.1537 9.39045" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinecap="round" />
                                </Svg>
                            </View>
                            <Text style={modalS.actionLabel}>Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalS.actionItem} onPress={onMail} activeOpacity={0.7}>
                            <View style={modalS.actionIconWrap}>
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinejoin="round" />
                                </Svg>
                            </View>
                            <Text style={modalS.actionLabel}>Mail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalS.actionItem} onPress={onSharePress} activeOpacity={0.7}>
                            <View style={modalS.actionIconWrap}>
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinecap="round" />
                                    <Path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke={colors.textPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </View>
                            <Text style={modalS.actionLabel}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={modalS.divider} />

                    {/* Okay Button */}
                    <TouchableOpacity style={modalS.okayBtn} onPress={onClose}
                        activeOpacity={0.85} testID="invite-modal-okay">
                        <Text style={modalS.okayBtnText}>Okay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InviteFriendsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: referral, isLoading } = useReferralInfo();

    const [showAffiliate, setShowAffiliate] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const referralCode = referral?.referral_code ?? 'CLBKR';
    const referralLink = referral?.referral_link ?? 'https://lv.me/r/dkdwkl';

    const onMyInvite = useCallback(() => {
        navigation.navigate('MyInvites');
    }, [navigation]);

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back" testID="invite-back">
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={onMyInvite} activeOpacity={0.7} testID="my-invite-btn">
                    <Text style={s.myInviteLink}>My Invite</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={s.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll}
                        showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <Text style={s.title}>Invite Friends and Get{'\n'}Rewarded Together</Text>
                        <Text style={s.subtitle}>
                            Feel free to share LIVOPay if you enjoy the App. Both you and your friend will receive increased rewards!
                        </Text>

                        {/* Rebate Banner */}
                        <View style={s.rebateBanner}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rebateSmall}>You will get</Text>
                                <Text style={s.rebateBig}>10%</Text>
                                <Text style={s.rebateDesc}>Rebates On Crypto/Fiat{'\n'}Swap Fees</Text>
                            </View>
                            <View style={s.percentIcon}>
                                <Text style={s.percentText}>%</Text>
                            </View>
                        </View>

                        {/* Friend Benefits */}
                        <Text style={s.friendBenefitsLabel}>Invited friends will get</Text>
                        <View style={s.benefitsGrid}>
                            {FRIEND_BENEFITS.map((b) => (
                                <View key={b.title} style={s.benefitCard}>
                                    <Text style={s.benefitTitle}>{b.title}</Text>
                                    <Text style={s.benefitSub}>{b.subtitle}</Text>
                                    <View style={[s.benefitIconWrap, { backgroundColor: b.iconBg }]}>
                                        <HugeiconsIcon icon={b.icon} size={20} color={b.iconColor} />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Get Connected */}
                        <Text style={s.connectedTitle}>Get Connected{'\n'}& Stay Tuned</Text>
                        <Text style={s.connectedSub}>
                            Invite your friends to join and expand your{'\n'}global social circles
                        </Text>

                        <View style={s.connectedGrid}>
                            <View style={[s.connectedCard, { backgroundColor: palette.green50 }]}>
                                <View style={[s.connectedIconWrap, { backgroundColor: colors.primary }]}>
                                    <HugeiconsIcon icon={FlashFreeIcons} size={20} color="#FFFFFF" />
                                </View>
                                <Text style={s.connectedCardTitle}>Instant & Safe{'\n'}Transfer</Text>
                                <Text style={s.connectedCardSub}>Pay or receive from{'\n'}friends instantly</Text>
                            </View>
                            <View style={[s.connectedCard, { backgroundColor: palette.green50 }]}>
                                <View style={[s.connectedIconWrap, { backgroundColor: colors.primary }]}>
                                    <HugeiconsIcon icon={Share01FreeIcons} size={20} color="#FFFFFF" />
                                </View>
                                <Text style={s.connectedCardTitle}>Set Up Secret Joint{'\n'}Vault</Text>
                                <Text style={s.connectedCardSub}>Create joint secret vault{'\n'}and put money in it</Text>
                            </View>
                        </View>

                        {/* Need More */}
                        <Text style={s.needMoreTitle}>Need More?</Text>
                        <Text style={s.needMoreSub}>
                            If you wish to customize a tailored promotion plan, you{'\n'}may join LIVO Affiliate Program
                        </Text>

                        {/* Links */}
                        <TouchableOpacity style={s.linkRow} onPress={() => setShowAffiliate(true)}
                            activeOpacity={0.7} testID="affiliate-link">
                            <View style={s.linkLeft}>
                                <HugeiconsIcon icon={Link01FreeIcons} size={18} color={colors.textPrimary} />
                                <Text style={s.linkText}>Affiliate Program</Text>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                        <View style={s.linkDivider} />
                        <TouchableOpacity style={s.linkRow} activeOpacity={0.7} testID="tc-link">
                            <View style={s.linkLeft}>
                                <HugeiconsIcon icon={Link01FreeIcons} size={18} color={colors.textPrimary} />
                                <Text style={s.linkText}>Terms & Conditions</Text>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
                        </TouchableOpacity>

                        <View style={{ height: spacing.xxl }} />
                    </ScrollView>

                    {/* CTA */}
                    <View style={s.footer}>
                        <TouchableOpacity style={s.ctaBtn}
                            onPress={() => setShowInviteModal(true)}
                            activeOpacity={0.85} testID="invite-cta">
                            <Text style={s.ctaText}>Invite Friends</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Modals */}
            <AffiliateSheet visible={showAffiliate} onClose={() => setShowAffiliate(false)} />
            <InviteModal visible={showInviteModal} onClose={() => setShowInviteModal(false)}
                referralCode={referralCode} referralLink={referralLink} />
        </SafeAreaView>
    );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.base },

    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, paddingHorizontal: spacing.base },
    backBtn: { width: 36, alignItems: 'flex-start' },
    myInviteLink: { ...typography.bodyMd, color: colors.primary, fontWeight: '600' },

    title: { ...typography.h2, color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.sm },
    subtitle: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },

    // Rebate Banner
    rebateBanner: {
        backgroundColor: palette.green50,
        borderRadius: borderRadius.card,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    rebateSmall: { ...typography.bodySm, color: colors.textPrimary, marginBottom: spacing.xs },
    rebateBig: { fontSize: 48, fontWeight: '900', color: colors.primary, lineHeight: 52 },
    rebateDesc: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '600', marginTop: spacing.xs },
    percentIcon: {
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
        transform: [{ rotate: '-10deg' }],
    },
    percentText: { fontSize: 34, fontWeight: '800', color: '#FFFFFF' },

    // Friend Benefits
    friendBenefitsLabel: { ...typography.bodySm, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.base },
    benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xxl },
    benefitCard: {
        width: '48%',
        backgroundColor: palette.green50, borderRadius: borderRadius.card,
        padding: spacing.base, flexGrow: 1,
    },
    benefitTitle: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xs },
    benefitSub: { ...typography.caption, color: colors.textSecondary, lineHeight: 16, marginBottom: spacing.base },
    benefitIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },

    // Connected
    connectedTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
    connectedSub: { ...typography.bodySm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
    connectedGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl },
    connectedCard: { flex: 1, borderRadius: borderRadius.card, padding: spacing.base },
    connectedIconWrap: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
    },
    connectedCardTitle: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xs },
    connectedCardSub: { ...typography.caption, color: colors.textSecondary, lineHeight: 16 },

    // Need More
    needMoreTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
    needMoreSub: { ...typography.bodySm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },

    // Links
    linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
    linkLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    linkText: { ...typography.bodyMd, color: colors.textPrimary },
    linkDivider: { height: 0.5, backgroundColor: colors.border },

    // Footer
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, paddingTop: spacing.sm },
    ctaBtn: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', minHeight: 52,
    },
    ctaText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────
const sheetS = StyleSheet.create({
    title: { ...typography.h2, color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.base, marginTop: spacing.sm },
    body: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 22 },
    footerBtn: { backgroundColor: colors.textPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center' },
    footerBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Invite Modal Styles ──────────────────────────────────────────────────────
const modalS = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.37)',
    },
    outerWrap: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    cardContainer: {
        borderRadius: 30,
        overflow: 'hidden',
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    dotActive: {
        backgroundColor: colors.primary,
        width: 20,
    },
    panel: {
        backgroundColor: colors.background,
        borderRadius: 30,
        paddingTop: spacing.base,
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: spacing.lg, paddingHorizontal: spacing.base,
        borderWidth: 1, borderColor: '#E8E8E8',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg, marginBottom: spacing.sm,
    },
    infoLabel: { ...typography.bodySm, color: '#B2B2B2', fontWeight: '700' },
    infoRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    infoValue: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '400' },
    actions: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingVertical: spacing.lg,
    },
    actionItem: { alignItems: 'center', gap: spacing.xs },
    actionIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: palette.green50, alignItems: 'center', justifyContent: 'center',
    },
    actionLabel: { ...typography.caption, color: colors.textPrimary, fontWeight: '500' },
    divider: {
        height: 1.5,
        backgroundColor: '#F0F0F0',
        marginBottom: spacing.lg,
    },
    okayBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    okayBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '500',
    },
});
