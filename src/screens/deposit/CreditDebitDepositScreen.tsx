import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Search01FreeIcons,
    Alert02FreeIcons,
    Tick02FreeIcons,
    CancelCircleFreeIcons,
    FlashFreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import { useCards } from '@hooks/api/useCards';
import type { Card, CardTier } from '@api/cards';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const TIER_COLORS: Record<CardTier, string> = {
    basic: '#6B7280',
    standard: '#01A239',
    premium: '#B8860B',
    elite: '#1A1A2E',
    prestige: '#2D1B69',
};

const IMPORTANT_NOTES = [
    'Use cards under your own name ONLY. Do not top up with others\u2019 cards.',
    'Live cards under your own name ONLY. Do not top up with others\u2019 cards.',
];

function CardVisual({ card }: { card: Card }) {
    const bg = TIER_COLORS[card.tier] ?? '#01A239';
    const tierLabel = card.tier.charAt(0).toUpperCase() + card.tier.slice(1);
    return (
        <View style={[styles.cardVisual, { backgroundColor: bg }]}>
            <Text style={styles.cardTierLabel}>{tierLabel}</Text>
            <Text style={styles.cardLivoLabel}>LIVO{'\n'}pay</Text>
        </View>
    );
}

function CardRow({ card, onPress }: { card: Card; onPress?: () => void }) {
    const isPending = card.status === 'pending';
    const currencyLabel = card.currency === 'HKD' ? 'HKD' : 'US Dollar';
    const cardType = 'Physical Card';
    return (
        <TouchableOpacity
            style={styles.cardRow}
            activeOpacity={isPending ? 1 : 0.7}
            onPress={isPending ? undefined : onPress}
        >
            <CardVisual card={card} />
            <View style={styles.cardRowInfo}>
                <Text style={styles.cardRowName}>{card.note || 'MyCard'}</Text>
                <Text style={styles.cardRowSub}>{currencyLabel} {cardType} *{card.last_four}</Text>
                {isPending && (
                    <View style={styles.toActivateRow}>
                        <HugeiconsIcon icon={FlashFreeIcons} size={14} color="#B2B2B2" />
                        <Text style={styles.toActivateText}>To Be Activated</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function CreditDebitDepositScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const cardsQuery = useCards();
    const cards = cardsQuery.data ?? [];

    const [search, setSearch] = useState('');

    // Bottom sheet states
    const [notesSheetVisible, setNotesSheetVisible] = useState(false);
    const [checkedNotes, setCheckedNotes] = useState([false, false]);
    const [accessDeniedVisible, setAccessDeniedVisible] = useState(false);

    const allPending = cards.length > 0 && cards.every((c) => c.status === 'pending');
    const allNotesChecked = checkedNotes.every(Boolean);

    // Auto-show access denied if all cards are pending
    useEffect(() => {
        if (allPending) {
            setAccessDeniedVisible(true);
        }
    }, [allPending]);

    const filteredCards = search.trim()
        ? cards.filter((c) => c.last_four.endsWith(search.trim()))
        : cards;

    const toggleNote = (i: number) => {
        setCheckedNotes((prev) => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
        });
    };

    const handleAddCard = () => {
        setCheckedNotes([false, false]);
        setNotesSheetVisible(true);
    };

    const handleUnderstand = () => {
        setNotesSheetVisible(false);
        navigation.navigate('AddCard');
    };

    const handleCompleteVerification = () => {
        setAccessDeniedVisible(false);
        navigation.navigate('CardActivation', {});
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={22} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My cards</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Search bar */}
            <View style={styles.searchWrap}>
                <HugeiconsIcon icon={Search01FreeIcons} size={18} color="#B2B2B2" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Enter last 4 digits of Card No. to search"
                    placeholderTextColor="#B2B2B2"
                    value={search}
                    onChangeText={setSearch}
                    keyboardType="number-pad"
                    maxLength={4}
                />
            </View>

            {cards.length === 0 ? (
                /* Empty state */
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Text style={styles.emptyIconText}>L</Text>
                    </View>
                    <Text style={styles.emptyText}>No Card, Please Add</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredCards.map((card) => (
                        <CardRow
                            key={card.id}
                            card={card}
                            onPress={() => navigation.navigate('AddFunds', {
                                source: 'credit_debit',
                                currency: card.currency,
                                cardToken: card.id,
                            })}
                        />
                    ))}
                </ScrollView>
            )}

            {/* Add Card button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.addCardBtn}
                    activeOpacity={0.7}
                    onPress={handleAddCard}
                >
                    <Text style={styles.addCardBtnText}>Add Card</Text>
                </TouchableOpacity>
            </View>

            {/* Important Notes Sheet */}
            <BottomSheet
                visible={notesSheetVisible}
                onClose={() => setNotesSheetVisible(false)}
                maxHeight="55%"
                footer={
                    <TouchableOpacity
                        style={[styles.sheetBtn, !allNotesChecked && styles.sheetBtnDisabled]}
                        activeOpacity={0.7}
                        onPress={handleUnderstand}
                        disabled={!allNotesChecked}
                    >
                        <Text style={styles.sheetBtnText}>I Understand</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.sheetContent}>
                    <View style={styles.warningCircle}>
                        <HugeiconsIcon icon={Alert02FreeIcons} size={24} color="#242424" />
                    </View>
                    <Text style={styles.sheetTitle}>Important Notes</Text>
                    <View style={styles.notesList}>
                        {IMPORTANT_NOTES.map((note, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.noteRow}
                                activeOpacity={0.7}
                                onPress={() => toggleNote(i)}
                            >
                                <Text style={styles.noteText}>{note}</Text>
                                <View style={[styles.checkbox, checkedNotes[i] && styles.checkboxChecked]}>
                                    {checkedNotes[i] && (
                                        <HugeiconsIcon icon={Tick02FreeIcons} size={16} color="#FFFFFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            {/* Access Denied Sheet (all cards pending) */}
            <BottomSheet
                visible={accessDeniedVisible}
                onClose={() => setAccessDeniedVisible(false)}
                maxHeight="50%"
                footer={
                    <View style={styles.deniedFooter}>
                        <TouchableOpacity
                            style={styles.sheetBtn}
                            activeOpacity={0.7}
                            onPress={handleCompleteVerification}
                        >
                            <Text style={styles.sheetBtnText}>Complete Verification</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            activeOpacity={0.7}
                            onPress={() => setAccessDeniedVisible(false)}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                }
            >
                <View style={styles.sheetContent}>
                    <View style={styles.warningCircle}>
                        <HugeiconsIcon icon={Alert02FreeIcons} size={24} color="#242424" />
                    </View>
                    <Text style={styles.sheetTitle}>Access Denied</Text>
                    <Text style={styles.deniedDesc}>Please activate all current cards first.</Text>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 32,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        marginBottom: 12,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#242424',
    },
    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingBottom: 60,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 44,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 21,
    },
    // Card list
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: spacing.huge,
        gap: 12,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    cardVisual: {
        width: 90,
        height: 58,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        justifyContent: 'space-between',
    },
    cardTierLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.9)',
    },
    cardLivoLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'right',
        lineHeight: 11,
    },
    cardRowInfo: {
        flex: 1,
        gap: 3,
    },
    cardRowName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    cardRowSub: {
        fontSize: 14,
        fontWeight: '400',
        color: '#686868',
        lineHeight: 21,
    },
    toActivateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    toActivateText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    // Bottom bar
    bottomBar: {
        paddingHorizontal: 15,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    addCardBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCardBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    // Bottom Sheets shared
    sheetContent: {
        alignItems: 'flex-start',
    },
    warningCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFF07F',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#242424',
        marginBottom: 16,
    },
    notesList: {
        width: '100%',
        gap: 10,
    },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 13,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 21,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: '#242424',
        borderColor: '#242424',
    },
    sheetBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetBtnDisabled: {
        opacity: 0.4,
    },
    sheetBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    deniedDesc: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 21,
    },
    deniedFooter: {
        gap: 10,
    },
    cancelBtn: {
        height: 52,
        backgroundColor: '#F0F0F0',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
    },
});
