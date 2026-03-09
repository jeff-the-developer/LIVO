import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Modal,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    InformationCircleFreeIcons,
    Exchange01FreeIcons,
    Gif01FreeIcons,
    CreditCardFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useCurrentMembership } from '@hooks/api/useMembership';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livopayLogo = require('@assets/images/branding/livopay_wordmark_dark.png');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CARD_IMAGES: Record<string, any> = {
    basic: require('@assets/images/cards/basic_card.png'),
    standard: require('@assets/images/cards/standard_card.png'),
    premium: require('@assets/images/cards/premium_card.png'),
    elite: require('@assets/images/cards/elite_card.png'),
    prestige: require('@assets/images/cards/prestige_card.png'),
};

// ─── Info Content ─────────────────────────────────────────────────────────────
interface InfoContent {
    icon: any;
    title: string;
    body: string;
    hasContactSupport?: boolean;
}

const INFO_SHEETS: Record<string, InfoContent> = {
    cryptoSwapFee: {
        icon: Exchange01FreeIcons,
        title: 'Cryptocurrency\nConversion fee',
        body: `With LIVOPay wallet, you can easily exchange between cryptocurrencies and cash currencies. The specific process and fees are as follows:\n\nCryptocurrency to Fiat Currency Conversion Process:\n1. Use the 'Exchange' function in the wallet\n2. Select the cryptocurrency you want to exchange with the desired cash currency\n3. Enter the amount and the system will automatically calculate the cash amount you will receive\n4. Confirm the exchange details and submit to complete the transaction\n\nFiat Currency to Cryptocurrency Conversion Process:\n1. Use the 'Exchange' function in the wallet\n2. Select the cash currency to exchange and the desired cryptocurrency\n3. Enter the amount, and the system will automatically calculate the cryptocurrency amount you will receive\n4. Confirm the exchange details and submit to complete the transaction\n\nExchange Fees:\nThe exchange fee you need to bear varies depending on your membership level. The higher your level is, the lower the percentage rate you will pay. Your current membership level is Basic, and the exchange rate is 0.8%.\nIf you exchange 10,000 Tether (USDT) for USD, you will receive 9,920 USD. The difference is the fee paid for the conversion.`,
    },
    inviteRebate: {
        icon: Gif01FreeIcons,
        title: 'Referral Rewards',
        body: `If you find the platform's features useful and want to recommend it to your friends. We have a special referral rewards program for you.\nYou will be able to earn extra cash based on your referee's transactions.\n\nDetails are as follows:\nInvite friends to register and use the LIVOPay through your unique referral link or QR code. When your referees perform crypto-to-cash exchanges, they will pay a conversion fee. As the referrer, you will earn a percentage of the fees paid.\n\nFor example, if your referee exchanges 1,000 USDT for USD using LIVOPay at the exchange rate of 1%, they will pay 10 USD as the transaction fee. As the referrer and depending on your level, you can receive up to 20% in fees which is 2 USD. The more friends you invite, the more rewards you earn!\n\nReferral process: Go to the 'Invite Friends' page, copy your unique referral link or code and share it with your friends. Once they've completed the registration, they will apart of your Referral Rewards Program.`,
    },
    cashback: {
        icon: Gif01FreeIcons,
        title: 'Cashback',
        body: 'Card could not be added, please try again or contact customer service.',
    },
    individualBenefits: {
        icon: Gif01FreeIcons,
        title: 'Individual Benefits',
        body: 'Exclusive benefits available only to individual users. All benefits will be granted immediately upon upgrading to higher membership',
    },
    corporateBenefits: {
        icon: Gif01FreeIcons,
        title: 'Corporate Benefits',
        body: 'Exclusive benefits available only to corporate users. All benefits will be granted immediately upon upgrading to higher membership',
    },
    corporateCards: {
        icon: CreditCardFreeIcons,
        title: 'Corporate Cards',
        body: 'You may create up to 30 free debit cards for personnel associated with your company. A fee of 2 USD will be charged for each additional card created thereafter',
    },
    payrollService: {
        icon: Gif01FreeIcons,
        title: 'Payroll Service',
        body: 'You may pay your employees up to 10 times per month using local payment methods. Payroll via SWIFT wire transfers is not eligable',
    },
    brandedCards: {
        icon: CreditCardFreeIcons,
        title: 'Branded Cards',
        body: 'You may issue corporate cards with your own custom design. Please contact support to discuss the design and issuance of your branded cards',
        hasContactSupport: true,
    },
    inviteAirdropOnly: {
        icon: Gif01FreeIcons,
        title: 'Invite/Airdrop Only',
        body: 'Prestige can only be obtained via invitations or airdrops. Contact support for more info',
        hasContactSupport: true,
    },
};

// ─── Tier Data ────────────────────────────────────────────────────────────────
interface BenefitItem { label: string; value: string; infoKey?: string }
interface BenefitSection { title: string; infoKey?: string; items: BenefitItem[] }
interface TierData {
    id: string;
    name: string;
    cardColor: string;
    labelColor?: string;
    sections: BenefitSection[];
    other: string;
    upgradePrice: number;
    inviteTarget: number;
    isInviteOnly?: boolean;
}

const TIERS: TierData[] = [
    {
        id: 'basic',
        name: 'Basic',
        cardColor: '#D4E8B4',
        sections: [
            {
                title: 'Benefit',
                items: [
                    { label: 'Crypto/Cash Swap Fee', value: '0.8%', infoKey: 'cryptoSwapFee' },
                    { label: 'Invite Rebate', value: '10%', infoKey: 'inviteRebate' },
                    { label: 'Cashback', value: '0.3%', infoKey: 'cashback' },
                ],
            },
        ],
        other: 'Unlock Card Design - Basic Card',
        upgradePrice: 0,
        inviteTarget: 0,
    },
    {
        id: 'standard',
        name: 'Standard',
        cardColor: '#01CA47',
        sections: [
            {
                title: 'Benefit',
                items: [
                    { label: 'Crypto/Cash Swap Fee', value: '0.7%', infoKey: 'cryptoSwapFee' },
                    { label: 'Invite Rebate', value: '12%', infoKey: 'inviteRebate' },
                    { label: 'Earning+ Earn Boost (APY)', value: '0.2 %' },
                    { label: 'Cashback', value: '0.5%', infoKey: 'cashback' },
                ],
            },
            {
                title: 'Individual Benefits',
                infoKey: 'individualBenefits',
                items: [
                    { label: 'Swap Discount', value: '1/Month' },
                    { label: 'Invite Rebate', value: '1' },
                    { label: 'Corporate Benefits', value: '1', infoKey: 'corporateBenefits' },
                ],
            },
            {
                title: 'Corporate Benefits',
                infoKey: 'corporateBenefits',
                items: [
                    { label: 'Free Corporate Card', value: '30' },
                    { label: 'Payroll', value: '10/Month' },
                ],
            },
        ],
        other: 'Unlock Card Design: Standard Card',
        upgradePrice: 29,
        inviteTarget: 12,
    },
    {
        id: 'premium',
        name: 'Premium',
        cardColor: '#E8E8E8',
        sections: [
            {
                title: 'Benefit',
                items: [
                    { label: 'Crypto/Cash Swap Fee', value: '0.6%', infoKey: 'cryptoSwapFee' },
                    { label: 'Invite Rebate', value: '15%', infoKey: 'inviteRebate' },
                    { label: 'Earning+ Earn Boost (APY)', value: '0.3 %' },
                    { label: 'Cashback', value: '0.8%', infoKey: 'cashback' },
                ],
            },
            {
                title: 'Individual Benefits',
                infoKey: 'individualBenefits',
                items: [
                    { label: 'Swap Discount(0.5%)', value: '2/Month' },
                    { label: 'Card Activation', value: '2' },
                    { label: 'CryptoPay Discount', value: '1' },
                ],
            },
            {
                title: 'Corporate Benefits',
                infoKey: 'corporateBenefits',
                items: [
                    { label: 'Free Corporate Card', value: '50', infoKey: 'corporateCards' },
                    { label: 'Free Payroll', value: '20/Month', infoKey: 'payrollService' },
                ],
            },
        ],
        other: 'Unlock Card Design: Premium Card',
        upgradePrice: 99,
        inviteTarget: 30,
    },
    {
        id: 'elite',
        name: 'Elite',
        cardColor: '#D4B065',
        sections: [
            {
                title: 'Benefit',
                items: [
                    { label: 'Crypto/Cash Swap Fee', value: '0.5%', infoKey: 'cryptoSwapFee' },
                    { label: 'Invite Rebate', value: '20%', infoKey: 'inviteRebate' },
                    { label: 'Earning+ Earn Boost (APY)', value: '0.4%' },
                    { label: 'Cashback', value: '1%', infoKey: 'cashback' },
                ],
            },
            {
                title: 'Individual Benefits',
                infoKey: 'individualBenefits',
                items: [
                    { label: 'Swap Discount(0.5%)', value: '2/Month' },
                    { label: 'Card Activation', value: '2' },
                    { label: 'CryptoPay Discount', value: '1' },
                ],
            },
            {
                title: 'Corporate Benefits',
                infoKey: 'corporateBenefits',
                items: [
                    { label: 'Free Corporate Card', value: '50', infoKey: 'corporateCards' },
                    { label: 'Free Payroll', value: '20/Month', infoKey: 'payrollService' },
                ],
            },
        ],
        other: 'Unlock Card Design: Elite Card',
        upgradePrice: 199,
        inviteTarget: 50,
    },
    {
        id: 'prestige',
        name: 'Prestige',
        cardColor: '#1A1A1A',
        labelColor: '#FFFFFF',
        isInviteOnly: true,
        sections: [
            {
                title: 'Benefit',
                items: [
                    { label: 'Crypto/Cash Swap Fee', value: '0.4%', infoKey: 'cryptoSwapFee' },
                    { label: 'Invite Rebate', value: '20%', infoKey: 'inviteRebate' },
                    { label: 'Earning+ Earn Boost (APY)', value: '0.5%' },
                    { label: 'Cashback', value: '1%', infoKey: 'cashback' },
                ],
            },
            {
                title: 'Individual Benefits',
                infoKey: 'individualBenefits',
                items: [
                    { label: 'Card Activation', value: '2' },
                ],
            },
            {
                title: 'Corporate Benefits',
                infoKey: 'corporateBenefits',
                items: [
                    { label: 'Free Corporate Card', value: '1', infoKey: 'corporateCards' },
                    { label: 'Free Payroll', value: '50/Month', infoKey: 'payrollService' },
                    { label: 'Branded Corporate Cards', value: '', infoKey: 'brandedCards' },
                ],
            },
        ],
        other: 'Unlock Card Design: Prestige Card',
        upgradePrice: 0,
        inviteTarget: 0,
    },
];

// ─── Info Bottom Sheet ────────────────────────────────────────────────────────
function InfoSheet({ visible, content, onClose }: {
    visible: boolean; content: InfoContent | null; onClose: () => void;
}): React.ReactElement {
    if (!content) return <></>;
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={sheetBase.overlay}>
                <View style={sheetBase.sheet}>
                    <View style={sheetBase.handle} />
                    <ScrollView style={{ paddingHorizontal: spacing.base }} showsVerticalScrollIndicator={false}>
                        <View style={infoS.iconWrap}>
                            <HugeiconsIcon icon={content.icon} size={24} color={colors.textPrimary} />
                        </View>
                        <Text style={infoS.title}>{content.title}</Text>
                        <Text style={infoS.body}>{content.body}</Text>
                    </ScrollView>
                    <View style={sheetBase.footer}>
                        <TouchableOpacity style={sheetBase.footerBtn} onPress={onClose}
                            activeOpacity={0.85} testID="info-okay">
                            <Text style={sheetBase.footerBtnText}>Okay</Text>
                        </TouchableOpacity>
                        {content.hasContactSupport && (
                            <TouchableOpacity style={sheetBase.secondaryBtn}
                                onPress={() => Linking.openURL('mailto:support@livopay.com')}
                                activeOpacity={0.85} testID="info-contact">
                                <Text style={sheetBase.secondaryBtnText}>Contact Support</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Upgrade Bottom Sheet ─────────────────────────────────────────────────────
function UpgradeSheet({ visible, tier, onClose }: {
    visible: boolean; tier: TierData; onClose: () => void;
}): React.ReactElement {
    const progress = 0;
    const progressPct = tier.inviteTarget > 0 ? (progress / tier.inviteTarget) * 100 : 0;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={sheetBase.overlay}>
                <View style={[sheetBase.sheet, { maxHeight: '60%' }]}>
                    <View style={sheetBase.handle} />
                    <ScrollView style={{ paddingHorizontal: spacing.base }} showsVerticalScrollIndicator={false}>
                        <Text style={upgradeS.title}>Upgrade</Text>

                        {/* Invite Section */}
                        <View style={upgradeS.section}>
                            <View style={upgradeS.sectionHeader}>
                                <Text style={upgradeS.sectionLabel}>Corporate Benefits</Text>
                                <TouchableOpacity style={upgradeS.actionChip} activeOpacity={0.7}>
                                    <Text style={upgradeS.actionChipText}>Invite</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={upgradeS.progressLabel}>
                                Friends Who Completed KYC2 ({progress}/{tier.inviteTarget})
                            </Text>
                            <View style={upgradeS.progressBar}>
                                <View style={[upgradeS.progressFill, { width: `${progressPct}%` }]} />
                            </View>
                            <View style={upgradeS.progressRange}>
                                <Text style={upgradeS.progressNum}>0</Text>
                                <Text style={upgradeS.progressNum}>{tier.inviteTarget}</Text>
                            </View>
                        </View>

                        {/* Pay Section */}
                        <View style={upgradeS.section}>
                            <View style={upgradeS.sectionHeader}>
                                <Text style={upgradeS.sectionLabel}>Or Pay</Text>
                                <TouchableOpacity style={upgradeS.actionChip} activeOpacity={0.7}>
                                    <Text style={upgradeS.actionChipText}>Pay</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={upgradeS.priceCard}>
                                <Text style={upgradeS.price}>${tier.upgradePrice}</Text>
                            </View>
                        </View>

                        <Text style={upgradeS.note}>*You will be automatically upgraded once requirements are met</Text>
                        <Text style={upgradeS.note}>*Choose between inviting friends or paying to upgrade</Text>
                        <View style={{ height: spacing.base }} />
                    </ScrollView>
                    <View style={sheetBase.footer}>
                        <TouchableOpacity style={sheetBase.footerBtn} onPress={onClose}
                            activeOpacity={0.85} testID="upgrade-okay">
                            <Text style={sheetBase.footerBtnText}>Okay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Membership Bottom Sheet ──────────────────────────────────────────────────
function MembershipSheet({ visible, onClose, onInfoPress }: {
    visible: boolean; onClose: () => void; onInfoPress: (key: string) => void;
}): React.ReactElement {
    const [selectedTier, setSelectedTier] = useState(0);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const tier = TIERS[selectedTier];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={sheetBase.overlay}>
                <View style={[sheetBase.sheet, { height: '90%' }]}>
                    <View style={sheetBase.handle} />
                    <TouchableOpacity style={sheetBase.backBtn} onPress={onClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} testID="membership-back">
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={22} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <ScrollView style={{ flex: 1, paddingHorizontal: spacing.base }} showsVerticalScrollIndicator={false}>
                        {/* Tier Card */}
                        <Image
                            source={CARD_IMAGES[tier.id]}
                            style={tierS.cardImage}
                            resizeMode="contain"
                            accessibilityLabel={`${tier.name} membership card`}
                        />

                        <Text style={memberS.heading}>Membership</Text>

                        {/* Tier Tabs */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={memberS.tabsRow}>
                            {TIERS.map((t, idx) => (
                                <TouchableOpacity key={t.id}
                                    style={[memberS.tab, selectedTier === idx && memberS.tabActive]}
                                    onPress={() => setSelectedTier(idx)} activeOpacity={0.7}
                                    testID={`tier-tab-${t.id}`}>
                                    <Text style={[memberS.tabText, selectedTier === idx && memberS.tabTextActive]}>
                                        {t.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* All Benefit Sections */}
                        {tier.sections.map((section) => (
                            <View key={section.title}>
                                <View style={memberS.sectionHeader}>
                                    <Text style={memberS.sectionTitle}>{section.title}</Text>
                                    {section.infoKey && (
                                        <TouchableOpacity onPress={() => onInfoPress(section.infoKey!)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <HugeiconsIcon icon={InformationCircleFreeIcons} size={16} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={memberS.sectionCard}>
                                    {section.items.map((item, idx) => (
                                        <View key={item.label + idx}>
                                            {idx > 0 && <View style={memberS.divider} />}
                                            <View style={memberS.benefitRow}>
                                                <View style={memberS.benefitLabel}>
                                                    <Text style={memberS.itemText}>{item.label}</Text>
                                                    {item.infoKey && (
                                                        <TouchableOpacity onPress={() => onInfoPress(item.infoKey!)}
                                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                                            <HugeiconsIcon icon={InformationCircleFreeIcons} size={14} color={colors.textMuted} />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <Text style={memberS.itemValue}>{item.value}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Others */}
                        <Text style={memberS.otherTitle}>Others</Text>
                        <View style={memberS.sectionCard}>
                            <View style={memberS.benefitRow}>
                                <Text style={memberS.itemText}>{tier.other}</Text>
                            </View>
                        </View>
                        <View style={{ height: spacing.xxl }} />
                    </ScrollView>

                    {/* Upgrade Button — only shows for non-Basic tiers */}
                    {selectedTier > 0 && (
                        <View style={sheetBase.footer}>
                            <TouchableOpacity style={sheetBase.footerBtn}
                                onPress={() => {
                                    if (tier.isInviteOnly) {
                                        onInfoPress('inviteAirdropOnly');
                                    } else {
                                        setShowUpgrade(true);
                                    }
                                }}
                                activeOpacity={0.85} testID="upgrade-membership-btn">
                                <Text style={sheetBase.footerBtnText}>Upgrade Membership</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <UpgradeSheet visible={showUpgrade} tier={tier} onClose={() => setShowUpgrade(false)} />
        </Modal>
    );
}

// ─── Benefit Row (main screen) ────────────────────────────────────────────────
function BenefitRow({ label, value, infoKey, onInfoPress, isLast }: {
    label: string; value: string; infoKey?: string;
    onInfoPress: (key: string) => void; isLast: boolean;
}): React.ReactElement {
    return (
        <View style={[mainS.benefitRow, !isLast && mainS.rowBorder]}>
            <View style={mainS.labelWrap}>
                <Text style={mainS.rowLabel}>{label}</Text>
                {infoKey && (
                    <TouchableOpacity onPress={() => onInfoPress(infoKey)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        testID={`benefit-info-${infoKey}`}>
                        <HugeiconsIcon icon={InformationCircleFreeIcons} size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={mainS.rowValue}>{value}</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function StatusUpgradeScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: currentMembership, isLoading } = useCurrentMembership();

    const [infoKey, setInfoKey] = useState<string | null>(null);
    const [showMembership, setShowMembership] = useState(false);

    const currentTierIdx = useMemo(() => {
        const apiTier = currentMembership?.currentTier;
        const idx = TIERS.findIndex((t) => t.id === apiTier);
        return idx >= 0 ? idx : 0;
    }, [currentMembership?.currentTier]);

    const tier = TIERS[currentTierIdx];
    const mainBenefits = tier.sections[0]?.items ?? [];

    const onInfoPress = useCallback((key: string) => setInfoKey(key), []);

    return (
        <SafeAreaView style={mainS.safe} edges={['top']}>
            {/* Header */}
            <View style={mainS.header}>
                <TouchableOpacity style={mainS.backBtn} onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back" accessibilityRole="button" testID="status-back">
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={mainS.headerTitle}>Status/Upgrade</Text>
                <View style={mainS.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={mainS.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={mainS.scroll} showsVerticalScrollIndicator={false}>
                        {/* Tier Card */}
                        <Image
                            source={CARD_IMAGES[tier.id]}
                            style={tierS.cardImage}
                            resizeMode="contain"
                            accessibilityLabel={`${tier.name} membership card`}
                        />

                        {/* Main Benefits */}
                        {mainBenefits.map((b, i) => (
                            <BenefitRow key={b.label} label={b.label} value={b.value}
                                infoKey={b.infoKey} onInfoPress={onInfoPress}
                                isLast={i === mainBenefits.length - 1} />
                        ))}

                        {/* Other */}
                        <View style={mainS.divider} />
                        <Text style={mainS.otherLabel}>Other</Text>
                        <View style={mainS.divider} />
                        <Text style={mainS.extraItem}>{tier.other}</Text>
                    </ScrollView>

                    {/* CTA */}
                    <View style={mainS.footer}>
                        <TouchableOpacity style={mainS.ctaBtn}
                            onPress={() => setShowMembership(true)}
                            activeOpacity={0.85} testID="status-cta">
                            <Text style={mainS.ctaText}>Check Status/Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Info Sheet */}
            <InfoSheet visible={infoKey !== null} content={infoKey ? INFO_SHEETS[infoKey] ?? null : null}
                onClose={() => setInfoKey(null)} />

            {/* Membership Sheet */}
            <MembershipSheet visible={showMembership}
                onClose={() => setShowMembership(false)}
                onInfoPress={(key) => { setShowMembership(false); setTimeout(() => setInfoKey(key), 350); }}
            />
        </SafeAreaView>
    );
}

// ─── Main Screen Styles ───────────────────────────────────────────────────────
const mainS = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.base },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, paddingHorizontal: spacing.base },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: { flex: 1, textAlign: 'center', ...typography.h4, color: colors.textPrimary, fontWeight: '700' },
    headerSpacer: { width: 36 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
    rowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
    labelWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
    rowLabel: { ...typography.bodySm, color: colors.textPrimary },
    rowValue: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '700' },
    divider: { height: 0.5, backgroundColor: colors.border },
    otherLabel: { ...typography.bodySm, color: colors.textPrimary, paddingVertical: spacing.md },
    extraItem: { ...typography.bodySm, color: colors.textPrimary, paddingVertical: spacing.md },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, paddingTop: spacing.sm },
    ctaBtn: { backgroundColor: colors.textPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
    ctaText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Tier Card Styles ─────────────────────────────────────────────────────────
const tierS = StyleSheet.create({
    card: { borderRadius: borderRadius.card, paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, marginBottom: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 180 },
    cardImage: { width: '100%', height: 200, borderRadius: borderRadius.card, marginBottom: spacing.lg },
    label: { ...typography.h4, color: colors.textPrimary, fontWeight: '700' },
    logo: { width: 90, height: 50 },
});

// ─── Shared Sheet Base ────────────────────────────────────────────────────────
const sheetBase = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: spacing.base },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.sm },
    backBtn: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm, alignSelf: 'flex-start' },
    footer: { paddingHorizontal: spacing.base, paddingVertical: spacing.base, borderTopWidth: 0.5, borderTopColor: colors.border },
    footerBtn: { backgroundColor: colors.textPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center' },
    footerBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.full, paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
    secondaryBtnText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
});

// ─── Info Sheet Styles ────────────────────────────────────────────────────────
const infoS = StyleSheet.create({
    iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.green50, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.base, marginTop: spacing.sm },
    title: { ...typography.h2, color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.base },
    body: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 22, paddingBottom: spacing.xxl },
});

// ─── Membership Sheet Styles ──────────────────────────────────────────────────
const memberS = StyleSheet.create({
    heading: { ...typography.h2, color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.base },
    tabsRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.lg },
    tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
    tabActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
    tabText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500' },
    tabTextActive: { color: colors.buttonText, fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.sm },
    sectionTitle: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '700' },
    sectionCard: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.card, overflow: 'hidden' },
    divider: { height: 0.5, backgroundColor: colors.border },
    benefitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.base },
    benefitLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
    itemText: { ...typography.bodySm, color: colors.textPrimary },
    itemValue: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '700' },
    otherTitle: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
});

// ─── Upgrade Sheet Styles ─────────────────────────────────────────────────────
const upgradeS = StyleSheet.create({
    title: { ...typography.h2, color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.lg, marginTop: spacing.sm },
    section: { marginBottom: spacing.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.card, paddingVertical: spacing.md, paddingHorizontal: spacing.base, marginBottom: spacing.base },
    sectionLabel: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
    actionChip: { backgroundColor: palette.green50, paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
    actionChipText: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '500' },
    progressLabel: { ...typography.bodySm, color: colors.textSecondary, marginBottom: spacing.sm },
    progressBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 4, backgroundColor: colors.textPrimary, borderRadius: 2 },
    progressRange: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
    progressNum: { ...typography.caption, color: colors.textSecondary },
    priceCard: { backgroundColor: palette.gray100, borderRadius: borderRadius.card, paddingVertical: spacing.xl, alignItems: 'center' },
    price: { fontSize: 40, fontWeight: '300', color: colors.textMuted },
    note: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
});
