import React, { useState, useCallback } from 'react';
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
    Mail01FreeIcons,
    Link01FreeIcons,
    ArrowRight01FreeIcons,
    FlashFreeIcons,
    ExchangeFreeIcons,
    CreditCardFreeIcons,
    Bookmark01FreeIcons,
    Share04FreeIcons,
} from '@hugeicons/core-free-icons';
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

// ─── Invite Modal (QR Code + Share) ───────────────────────────────────────────
function InviteModal({ visible, onClose, referralCode, referralLink }: {
    visible: boolean; onClose: () => void;
    referralCode: string; referralLink: string;
}): React.ReactElement {
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

    const footer = (
        <TouchableOpacity style={sheetS.footerBtn} onPress={onClose}
            activeOpacity={0.85} testID="invite-modal-okay">
            <Text style={sheetS.footerBtnText}>Okay</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} footer={footer}>
            {/* QR Banner */}
            <View style={modalS.qrBanner}>
                <View style={modalS.qrPlaceholder}>
                    <Image source={livoIcon} style={modalS.qrLogo} resizeMode="contain" />
                </View>
            </View>

            <Text style={modalS.qrTitle}>
                Say Hello To Your All-In-One{'\n'}Global Fiat & Crypto Wallet
            </Text>
            <Text style={modalS.qrSubtitle}>
                Secure and Easy Global Payments. Receive and{'\n'}Exchange Fiat and Crypto Anytime, Anywhere
            </Text>

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
                        <HugeiconsIcon icon={Bookmark01FreeIcons} size={20} color={colors.textPrimary} />
                    </View>
                    <Text style={modalS.actionLabel}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalS.actionItem} onPress={onCopyLink} activeOpacity={0.7}>
                    <View style={modalS.actionIconWrap}>
                        <HugeiconsIcon icon={Link01FreeIcons} size={20} color={colors.textPrimary} />
                    </View>
                    <Text style={modalS.actionLabel}>Link</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalS.actionItem} onPress={onMail} activeOpacity={0.7}>
                    <View style={modalS.actionIconWrap}>
                        <HugeiconsIcon icon={Mail01FreeIcons} size={20} color={colors.textPrimary} />
                    </View>
                    <Text style={modalS.actionLabel}>Mail</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalS.actionItem} onPress={onSharePress} activeOpacity={0.7}>
                    <View style={modalS.actionIconWrap}>
                        <HugeiconsIcon icon={Share04FreeIcons} size={20} color={colors.textPrimary} />
                    </View>
                    <Text style={modalS.actionLabel}>Share</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
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
    qrBanner: {
        backgroundColor: colors.primary, borderRadius: borderRadius.card,
        marginBottom: spacing.base, padding: spacing.xl, alignItems: 'center',
    },
    qrPlaceholder: {
        width: 160, height: 160, backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.card, alignItems: 'center', justifyContent: 'center',
    },
    qrLogo: { width: 60, height: 60 },
    qrTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '800', textAlign: 'left', marginTop: spacing.lg, marginBottom: spacing.sm },
    qrSubtitle: { ...typography.caption, color: colors.textSecondary, textAlign: 'left', lineHeight: 18, marginBottom: spacing.lg },

    infoRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: spacing.md, paddingHorizontal: spacing.base,
        borderTopWidth: 1, borderTopColor: colors.border,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.card, marginBottom: spacing.xs,
    },
    infoLabel: { ...typography.bodySm, color: colors.textMuted },
    infoRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    infoValue: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '500' },

    actions: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingVertical: spacing.lg,
    },
    actionItem: { alignItems: 'center', gap: spacing.xs },
    actionIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: palette.green50, alignItems: 'center', justifyContent: 'center',
    },
    actionLabel: { ...typography.caption, color: colors.textPrimary },
});
