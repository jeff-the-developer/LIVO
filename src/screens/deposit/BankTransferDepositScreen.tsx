import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    Alert02FreeIcons,
    Tick02FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

interface BankAccount {
    id: string;
    name: string;
    initial: string;
    country: string;
    supports: string;
    notes: string[];
}

const BANK_ACCOUNTS: BankAccount[] = [
    {
        id: 'barclay',
        name: 'BARCLAY BANK PLC',
        initial: 'B',
        country: 'GB',
        supports: 'Supports SWIFT',
        notes: [
            'This account is only available to individuals or registered businesses in Hong Kong. A valid Hong Kong address proof is required.',
            'Only same-name accounts or licensed brokers/insurance firms may deposit into this account. Third-party deposits will be rejected.',
            'Repeated violations of deposit rules may result in account restrictions.',
            'Support SWIFT deposits. Please ensure the SWIFT code is correct before transferring.',
        ],
    },
    {
        id: 'community',
        name: 'COMMUNITY FEDERAL...',
        initial: 'C',
        country: 'US',
        supports: 'Supports ACH/Fedwire',
        notes: [
            'This account is only available to individuals or registered businesses with a valid US address.',
            'Only same-name accounts may deposit into this account. Third-party deposits will be rejected.',
            'Repeated violations of deposit rules may result in account restrictions.',
            'Support ACH/Fedwire deposits. Please use a US domestic account.',
        ],
    },
];

export default function BankTransferDepositScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
    const [notesSheetVisible, setNotesSheetVisible] = useState(false);
    const [checkedNotes, setCheckedNotes] = useState<boolean[]>([false, false, false, false]);

    const allNotesChecked = checkedNotes.every(Boolean);

    const handleBankPress = useCallback((bank: BankAccount) => {
        setSelectedBank(bank);
        setCheckedNotes([false, false, false, false]);
        setNotesSheetVisible(true);
    }, []);

    const toggleNote = useCallback((index: number) => {
        setCheckedNotes((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    }, []);

    const handleUnderstand = useCallback(() => {
        setNotesSheetVisible(false);
        navigation.navigate('BankAdditionalInfo', {
            bankName: selectedBank?.name ?? '',
            bankId: selectedBank?.id ?? '',
        });
    }, [navigation, selectedBank]);

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
                <Text style={styles.headerTitle}>Accounts</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {BANK_ACCOUNTS.map((bank) => (
                    <TouchableOpacity
                        key={bank.id}
                        style={styles.bankRow}
                        activeOpacity={0.7}
                        onPress={() => handleBankPress(bank)}
                    >
                        {/* Avatar + country badge */}
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{bank.initial}</Text>
                            </View>
                            <View style={styles.countryBadge}>
                                <Text style={styles.countryBadgeText}>{bank.country}</Text>
                            </View>
                        </View>

                        {/* Bank info */}
                        <View style={styles.bankInfo}>
                            <Text style={styles.bankName}>{bank.name}</Text>
                            <Text style={styles.bankSupports}>{bank.supports}</Text>
                        </View>

                        {/* Chevron */}
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color="#B2B2B2" />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Important Notes Bottom Sheet */}
            <BottomSheet
                visible={notesSheetVisible}
                onClose={() => setNotesSheetVisible(false)}
                maxHeight="70%"
                footer={
                    <TouchableOpacity
                        style={[styles.understandBtn, !allNotesChecked && styles.understandBtnDisabled]}
                        activeOpacity={0.7}
                        onPress={handleUnderstand}
                        disabled={!allNotesChecked}
                    >
                        <Text style={styles.understandBtnText}>I Understand</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.sheetContent}>
                    <View style={styles.warningCircle}>
                        <HugeiconsIcon icon={Alert02FreeIcons} size={24} color="#242424" />
                    </View>
                    <Text style={styles.sheetTitle}>Important Notes</Text>
                    <View style={styles.notesList}>
                        {(selectedBank?.notes ?? []).map((note, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.noteRow}
                                activeOpacity={0.7}
                                onPress={() => toggleNote(index)}
                            >
                                <Text style={styles.noteText}>{note}</Text>
                                <View
                                    style={[
                                        styles.checkbox,
                                        checkedNotes[index] && styles.checkboxChecked,
                                    ]}
                                >
                                    {checkedNotes[index] && (
                                        <HugeiconsIcon icon={Tick02FreeIcons} size={16} color="#FFFFFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: spacing.sm,
        gap: 14,
        paddingBottom: spacing.huge,
    },
    bankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 18,
        paddingVertical: 18,
        gap: 14,
    },
    avatarWrap: {
        width: 55,
        height: 55,
        position: 'relative',
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 29,
    },
    countryBadge: {
        position: 'absolute',
        bottom: -2,
        left: 28,
        backgroundColor: '#D9F7E3',
        borderRadius: 75,
        width: 26,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    countryBadgeText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 12,
    },
    bankInfo: {
        flex: 1,
    },
    bankName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    bankSupports: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 21,
        marginTop: 2,
    },
    // Bottom Sheet
    sheetContent: {
        alignItems: 'center',
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
        alignSelf: 'flex-start',
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
    understandBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    understandBtnDisabled: {
        opacity: 0.4,
    },
    understandBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
});
