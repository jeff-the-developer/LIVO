import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, ClipPath, Defs, G } from 'react-native-svg';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowDown01FreeIcons,
    Add01FreeIcons,
    CreditCardFreeIcons,
    ShoppingBag01FreeIcons,
    ArrowUp01FreeIcons,
    Atm01FreeIcons,
    CloudFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { useCards, useCardTransactions, useFreezeCard, useUnfreezeCard } from '@hooks/api/useCards';
import BottomSheet from '@components/common/BottomSheet';
import type { Card, CardTransaction, TransactionIconType } from '@api/cards';
import OrderFilterSheet from './OrderFilterSheet';

// ─── Card Hero Image ──────────────────────────────────────────────────────────
// ─── Transaction Icon Colors ──────────────────────────────────────────────────
const TXN_ICON_CONFIG: Record<TransactionIconType, { bg: string; color: string; icon: any }> = {
    lock: { bg: '#F0FFF4', color: '#1DB954', icon: ShoppingBag01FreeIcons },
    download: { bg: '#FFF0F0', color: '#FF5A5F', icon: ArrowUp01FreeIcons },
    atm: { bg: '#F0FFF4', color: '#1DB954', icon: Atm01FreeIcons },
    alert: { bg: '#FFF0F0', color: '#FF5A5F', icon: CloudFreeIcons },
    upload: { bg: '#F0FFF4', color: '#1DB954', icon: ArrowDown01FreeIcons },
};

// ─── Transaction Status Colors ────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
    Pending: colors.textMuted,
    Executed: colors.textMuted,
    Settled: colors.textMuted,
    Rejected: '#FF5A5F',
    Refunded: colors.textMuted,
};

// ─── Balance Type ─────────────────────────────────────────────────────────────
type BalanceType = 'Available' | 'Withdrawable' | 'Total';

// ─── Card Balance Bottom Sheet ────────────────────────────────────────────────
function CardBalanceSheet({
    visible,
    onClose,
    currentType,
    onSave,
}: {
    visible: boolean;
    onClose: () => void;
    currentType: BalanceType;
    onSave: (t: BalanceType) => void;
}) {
    const [selected, setSelected] = useState<BalanceType>(currentType);
    const types: BalanceType[] = ['Available', 'Withdrawable', 'Total'];

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <View style={bsStyles.container}>
                {/* Icon */}
                <View style={bsStyles.iconWrap}>
                    <HugeiconsIcon icon={CreditCardFreeIcons} size={24} color={colors.textPrimary} />
                </View>

                <Text style={bsStyles.title}>Card Balance</Text>

                <Text style={bsStyles.label}>Type</Text>
                <View style={bsStyles.pillRow}>
                    {types.map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[bsStyles.pill, selected === t && bsStyles.pillActive]}
                            onPress={() => setSelected(t)}
                            activeOpacity={0.7}
                            accessibilityLabel={`Select ${t} `}
                            testID={`balance - type - ${t.toLowerCase()} `}
                        >
                            <Text style={[bsStyles.pillText, selected === t && bsStyles.pillTextActive]}>
                                {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Save and Update */}
                <TouchableOpacity
                    style={bsStyles.saveBtn}
                    onPress={() => { onSave(selected); onClose(); }}
                    activeOpacity={0.85}
                    accessibilityLabel="Save and Update"
                    testID="balance-save"
                >
                    <Text style={bsStyles.saveBtnText}>Save and Update</Text>
                </TouchableOpacity>

                {/* Return */}
                <TouchableOpacity
                    style={bsStyles.returnBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                    accessibilityLabel="Return"
                    testID="balance-return"
                >
                    <Text style={bsStyles.returnBtnText}>Return</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({ txn }: { txn: CardTransaction }) {
    const cfg = TXN_ICON_CONFIG[txn.icon_type];
    const isPositive = txn.amount > 0;
    const amountStr = isPositive
        ? `+ $${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} `
        : txn.amount === 0
            ? '0.00'
            : `- $${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} `;

    return (
        <View style={s.txnRow}>
            {/* Icon */}
            <View style={[s.txnIcon, { backgroundColor: cfg.bg }]}>
                <HugeiconsIcon icon={cfg.icon} size={20} color={cfg.color} />
            </View>

            {/* Info */}
            <View style={s.txnInfo}>
                <Text style={s.txnTitle} numberOfLines={1}>{txn.title}</Text>
                <Text style={s.txnDate}>{txn.date}</Text>
            </View>

            {/* Amount + Status */}
            <View style={s.txnRight}>
                <Text style={s.txnAmount}>{amountStr}</Text>
                <Text style={[s.txnStatus, { color: STATUS_COLOR[txn.status] ?? colors.textMuted }]}>
                    {txn.status}
                </Text>
            </View>
        </View>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CardDashboardScreen(): React.ReactElement {
    const { data: cards } = useCards();
    const activeCard: Card | undefined = cards?.[0];
    const cardId = activeCard?.id ?? '';

    const { data: transactions } = useCardTransactions(cardId);
    const freezeMutation = useFreezeCard();
    const unfreezeMutation = useUnfreezeCard();

    const [balanceType, setBalanceType] = useState<BalanceType>('Available');
    const [showBalanceSheet, setShowBalanceSheet] = useState(false);
    const [showOrderFilter, setShowOrderFilter] = useState(false);

    if (!activeCard) return <View style={s.safe} />;

    const isFrozen = activeCard.status === 'frozen';
    const displayName = `${activeCard.name} ${activeCard.last_four} `;
    const formattedBalance = `$${activeCard.balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
        } `;

    const onToggleFreeze = () => {
        if (isFrozen) {
            unfreezeMutation.mutate(cardId);
        } else {
            freezeMutation.mutate(cardId);
        }
    };

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header — Card Name Dropdown */}
            <TouchableOpacity
                style={s.headerDropdown}
                activeOpacity={0.7}
                accessibilityLabel="Select card"
                testID="card-dropdown"
            >
                <Text style={s.headerDropdownText}>{displayName}</Text>
                <HugeiconsIcon icon={ArrowDown01FreeIcons} size={16} color={colors.textPrimary} />
            </TouchableOpacity>

            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Hero Card Container ─────────────────────────── */}
                <View style={s.heroContainer}>
                    {/* Green Header Area — full rounded corners */}
                    <View style={s.heroGreenArea}>
                        <View style={s.logoWrap}>
                            <Svg width={47} height={13} viewBox="0 0 47 13" fill="none">
                                <Defs><ClipPath id="clip_card"><Rect width={46.2175} height={12.5582} fill="white" /></ClipPath></Defs>
                                <G clipPath="url(#clip_card)">
                                    <Path d="M38.8884 12.5515C37.713 12.5515 36.8777 12.5642 36.0433 12.5473C35.2712 12.5322 34.5025 12.4581 33.7733 12.1802C32.6998 11.7702 31.9934 11.0208 31.7004 9.89676C31.5345 9.2619 31.4663 8.6161 31.4688 7.96356C31.473 6.68711 31.4688 5.40982 31.5025 4.13337C31.5219 3.38905 31.6642 2.65989 31.9892 1.9762C32.3706 1.17294 33.024 0.686274 33.834 0.387368C34.6136 0.0994091 35.432 0.0219464 36.253 0.0118426C37.7054 -0.00583912 39.1578 -0.00162919 40.6103 0.00763266C41.3958 0.0126846 42.1789 0.0733076 42.94 0.291382C44.0809 0.618073 44.8951 1.30092 45.2462 2.46455C45.3405 2.77777 45.3953 3.10362 45.4702 3.42273C45.5115 3.59955 45.4635 3.68206 45.2631 3.67953C44.5828 3.67196 43.9016 3.6728 43.2213 3.68122C43.0571 3.6829 42.9762 3.62144 42.9392 3.46904C42.775 2.8005 42.3338 2.42582 41.6686 2.32225C41.2695 2.25995 40.8645 2.21111 40.4612 2.20606C39.1982 2.18922 37.9353 2.18838 36.6723 2.19764C36.1562 2.20101 35.64 2.22121 35.1382 2.38793C34.5395 2.58748 34.2238 3.00847 34.1084 3.60207C34.0697 3.80078 34.0461 4.00538 34.0453 4.2083C34.0402 5.61863 34.031 7.02896 34.0503 8.43928C34.0546 8.76934 34.1295 9.10866 34.2322 9.42441C34.3888 9.9035 34.7913 10.1552 35.2578 10.2235C35.8724 10.3127 36.498 10.3506 37.1194 10.3599C38.2982 10.3784 39.4769 10.3733 40.6557 10.3531C41.1567 10.3447 41.6644 10.338 42.1452 10.1443C42.5805 9.96833 42.8323 9.65427 42.9215 9.1996C42.9906 8.84596 43.0015 8.85017 43.3619 8.85522C43.9715 8.86364 44.5819 8.85522 45.1923 8.85186C45.4862 8.85017 45.519 8.87964 45.4837 9.15918C45.3826 9.95233 45.1334 10.6882 44.5996 11.3012C44.043 11.9411 43.2954 12.224 42.4921 12.3916C41.1853 12.6618 39.8626 12.5137 38.8884 12.5515Z" fill="#242424" />
                                    <Path d="M23.7556 9.66952C23.9392 9.29063 24.111 8.94036 24.2793 8.58926C24.9908 7.10568 25.7006 5.62125 26.4121 4.13768C27.0116 2.88733 27.6145 1.6395 28.2089 0.386628C28.3133 0.166027 28.464 0.0776188 28.704 0.0818287C29.3144 0.0910906 29.9249 0.0851967 30.5345 0.0877226C30.915 0.0894066 31.0068 0.233386 30.8418 0.571865C29.8474 2.61031 28.8496 4.64792 27.8569 6.68805C26.9838 8.48232 26.1107 10.2766 25.2468 12.0759C25.1138 12.3521 24.9302 12.4759 24.6246 12.4691C24.0352 12.4565 23.4458 12.4624 22.8572 12.4641C22.5558 12.4649 22.3571 12.3512 22.2173 12.0591C21.4435 10.4425 20.6512 8.83512 19.864 7.22524C19.2434 5.95468 18.6212 4.68497 17.999 3.41441C17.5376 2.47139 17.0745 1.52836 16.6156 0.584494C16.4421 0.227492 16.5322 0.0894066 16.9229 0.0885646C17.5266 0.0877226 18.1303 0.0969845 18.7323 0.0767768C19.0296 0.066673 19.1954 0.182867 19.3192 0.445567C20.0248 1.94683 20.7371 3.44556 21.4545 4.94093C22.182 6.45566 22.9179 7.96619 23.6512 9.47924C23.6773 9.53396 23.7093 9.58533 23.7556 9.66952Z" fill="#242424" />
                                    <Path d="M2.58983 4.60164C2.58983 5.91345 2.58478 7.22443 2.59488 8.53624C2.59657 8.7922 2.63951 9.05322 2.69845 9.30329C2.81043 9.77901 3.16154 10.0308 3.60863 10.1352C3.89154 10.2017 4.1896 10.2269 4.48177 10.2286C6.50843 10.2371 8.53594 10.2337 10.5626 10.2345C10.9011 10.2345 11.008 10.3372 11.008 10.669C11.0089 11.1245 11.0072 11.5809 11.003 12.0364C11.0004 12.3378 10.8691 12.4683 10.5626 12.4683C8.38101 12.4675 6.20027 12.4826 4.01868 12.4532C3.0445 12.4397 2.09306 12.262 1.27886 11.6558C0.654104 11.191 0.333308 10.5435 0.17754 9.80343C-0.0952633 8.50677 0.0310346 7.19159 0.0184048 5.88398C-0.000118875 4.13013 0.0158789 2.37711 0.0175628 0.623255C0.0184048 0.196368 0.128705 0.0852256 0.549698 0.0860676C1.08268 0.0860676 1.61565 0.0852256 2.14863 0.0860676C2.45511 0.0869096 2.58394 0.211524 2.58394 0.51969C2.58646 1.88034 2.58478 3.24099 2.58478 4.60164C2.58646 4.60164 2.58815 4.60164 2.58983 4.60164Z" fill="#242424" />
                                    <Path d="M15.173 6.29861C15.173 8.17877 15.1739 10.0589 15.1722 11.9391C15.1722 12.3609 15.0678 12.4636 14.6527 12.4645C14.1264 12.4662 13.6002 12.467 13.0739 12.4662C12.7607 12.4653 12.61 12.318 12.61 12.0005C12.6092 8.16277 12.6092 4.325 12.61 0.488065C12.61 0.237153 12.7439 0.0898057 12.9956 0.0864377C13.5918 0.0797018 14.1887 0.0805438 14.7849 0.0872797C15.0467 0.0906476 15.1713 0.239679 15.1722 0.531006C15.1755 1.49171 15.1755 2.45326 15.1764 3.41481C15.1772 4.37636 15.1764 5.33706 15.1764 6.29861C15.1764 6.29861 15.1747 6.29861 15.173 6.29861Z" fill="#242424" />
                                    <Path d="M43.3896 8.21457C42.7582 8.21457 42.1267 8.21204 41.4952 8.21541C40.6465 8.22046 40.0924 7.73295 40.0411 6.88844C40.0133 6.43545 40.0192 5.97657 40.0529 5.52358C40.1 4.8862 40.7138 4.34396 41.4 4.33722C42.7329 4.32544 44.0658 4.33049 45.3986 4.34312C45.9215 4.34817 46.1909 4.61171 46.2036 5.13964C46.2221 5.92437 46.2204 6.71078 46.2069 7.49551C46.1994 7.94261 45.8828 8.20615 45.3877 8.20952C44.7208 8.21373 44.0548 8.21036 43.388 8.21036C43.3896 8.21204 43.3896 8.21289 43.3896 8.21457ZM41.0599 6.26369C41.0279 6.71078 41.3722 6.94233 41.7141 6.94064C42.0913 6.93812 42.3565 6.65269 42.3523 6.25695C42.3481 5.90163 42.0719 5.64399 41.6956 5.64399C41.3142 5.64399 41.0616 5.88985 41.0599 6.26369Z" fill="#242424" />
                                </G>
                            </Svg>
                            <Text style={s.logoPay}>pay</Text>
                        </View>
                    </View>

                    {/* Overlapping White Card Area */}
                    <View style={s.heroWhiteCard}>
                        {/* Three-dot menu */}
                        <TouchableOpacity
                            style={s.cardMenu}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            accessibilityLabel="Card menu"
                            testID="card-menu"
                        >
                            <View style={s.dotsRow}>
                                <View style={s.dot} />
                                <View style={s.dot} />
                                <View style={s.dot} />
                            </View>
                        </TouchableOpacity>

                        {/* Balance */}
                        <Text style={s.balanceAmount}>{formattedBalance}</Text>
                        <TouchableOpacity
                            style={s.balanceLabel}
                            onPress={() => setShowBalanceSheet(true)}
                            activeOpacity={0.7}
                            accessibilityLabel="View balance types"
                            testID="card-balance-label"
                        >
                            <Text style={s.balanceLabelText}>
                                {balanceType} Balance ({activeCard.currency})
                            </Text>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M9 6L15 12L9 18" stroke="#242424" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>

                        {/* ─── Quick Actions ──────────────────────────────── */}
                        <View style={s.actionsRow}>
                            {/* Top up */}
                            <TouchableOpacity style={s.actionItem} activeOpacity={0.7}>
                                <Image source={require('@assets/images/icons/topup.png')} style={s.actionImage} resizeMode="contain" />
                                <Text style={s.actionLabel}>Top up</Text>
                            </TouchableOpacity>

                            {/* Card Details */}
                            <TouchableOpacity style={s.actionItem} activeOpacity={0.7}>
                                <Image source={require('@assets/images/icons/card_details.png')} style={s.actionImage} resizeMode="contain" />
                                <Text style={s.actionLabel}>Card Details</Text>
                            </TouchableOpacity>

                            {/* Freeze / UnFreeze */}
                            <TouchableOpacity style={s.actionItem} onPress={onToggleFreeze} activeOpacity={0.7}>
                                <Image
                                    source={isFrozen ? require('@assets/images/icons/unfreeze.png') : require('@assets/images/icons/Freeze.png')}
                                    style={s.actionImage}
                                    resizeMode="contain"
                                />
                                <Text style={s.actionLabel}>{isFrozen ? 'UnFreeze' : 'Freeze'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ─── Usage Stats ────────────────────────────────── */}
                <View style={s.usageRow}>
                    <View style={s.usageCard}>
                        <Text style={s.usageLabel}>Today's Usage</Text>
                        <Text style={s.usageValue}>0.0</Text>
                    </View>
                    <View style={s.usageCard}>
                        <Text style={s.usageLabel}>Past 30days Usage</Text>
                        <Text style={s.usageValue}>0.0</Text>
                    </View>
                </View>

                {/* ─── Recent Transactions ────────────────────────── */}
                <View style={s.recentHeader}>
                    <View style={s.recentLeft}>
                        <Text style={s.recentIcon}>☰</Text>
                        <Text style={s.recentTitle}>Recent</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowOrderFilter(true)}
                        activeOpacity={0.7}
                        accessibilityLabel="View all transactions"
                        testID="txn-view-all"
                    >
                        <Text style={s.recentAll}>All ↕</Text>
                    </TouchableOpacity>
                </View>

                {/* Transaction List */}
                {(transactions ?? []).map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                ))}

                {/* Bottom padding */}
                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            <CardBalanceSheet
                visible={showBalanceSheet}
                onClose={() => setShowBalanceSheet(false)}
                currentType={balanceType}
                onSave={setBalanceType}
            />

            {/* Order Filter Bottom Sheet */}
            <OrderFilterSheet
                visible={showOrderFilter}
                onClose={() => setShowOrderFilter(false)}
            />
        </SafeAreaView>
    );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header dropdown
    headerDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        gap: 6,
    },
    headerDropdownText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: spacing.base,
    },

    heroContainer: {
        marginBottom: spacing.xxl,
    },
    heroGreenArea: {
        backgroundColor: '#01CA47',
        borderRadius: 21,
        height: 90,
        paddingTop: 13,
        paddingHorizontal: 28,
        justifyContent: 'flex-start' as const,
    },
    logoWrap: {
        alignItems: 'flex-start' as const,
    },
    logoPay: {
        fontSize: 8.5,
        fontWeight: '400' as const,
        color: '#242424',
        marginLeft: 31,
        marginTop: -1,
    },

    heroWhiteCard: {
        backgroundColor: '#FFFFFF',
        marginTop: -47,
        borderRadius: 21,
        paddingTop: 29,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        position: 'relative' as const,
    },
    cardMenu: {
        position: 'absolute' as const,
        top: 16,
        right: 20,
        zIndex: 10,
    },
    dotsRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 1,
        padding: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#242424',
    },

    // Balance
    balanceAmount: {
        fontSize: 46,
        fontWeight: '700',
        color: '#242424',
        lineHeight: 57.5,
        textAlign: 'center' as const,
        marginBottom: 3,
    },
    balanceLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 20,
    },
    balanceLabelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
    },

    // Quick actions
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
    },
    actionItem: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionImage: {
        width: 64,
        height: 64,
    },
    actionLabel: {
        ...typography.caption,
        color: '#111111',
        fontWeight: '500',
        marginTop: 4,
    },

    // Usage stats
    usageRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    usageCard: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.base,
        alignItems: 'center',
    },
    usageLabel: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: 6,
    },
    usageValue: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
    },

    // Recent header
    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    recentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recentIcon: {
        fontSize: 16,
        color: colors.textMuted,
    },
    recentTitle: {
        ...typography.bodySm,
        color: colors.textMuted,
        fontWeight: '500',
    },
    recentAll: {
        ...typography.bodySm,
        color: colors.textMuted,
        fontWeight: '500',
    },

    // Transaction row
    txnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    txnIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    txnIconLabel: {
        fontSize: 18,
    },
    txnInfo: {
        flex: 1,
        gap: 2,
    },
    txnTitle: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    txnDate: {
        ...typography.caption,
        color: colors.textMuted,
    },
    txnRight: {
        alignItems: 'flex-end',
        gap: 2,
    },
    txnAmount: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    txnStatus: {
        ...typography.caption,
        fontWeight: '400',
    },
});

// ─── Balance Sheet Styles ─────────────────────────────────────────────────────
const bsStyles = StyleSheet.create({
    container: {
        paddingBottom: spacing.base,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.base,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.xl,
    },
    label: {
        ...typography.bodySm,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    pillRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xxl,
    },
    pill: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pillActive: {
        borderColor: '#1DB954',
        backgroundColor: '#F0FFF4',
    },
    pillText: {
        ...typography.bodySm,
        color: colors.textMuted,
        fontWeight: '500',
    },
    pillTextActive: {
        color: '#1DB954',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    saveBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
    returnBtn: {
        backgroundColor: '#F5F5F5',
        borderRadius: borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
    },
    returnBtnText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
