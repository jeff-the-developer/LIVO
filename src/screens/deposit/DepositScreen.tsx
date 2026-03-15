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
    UserAdd01FreeIcons,
    Blockchain01FreeIcons,
    Globe02FreeIcons,
    Alert02FreeIcons,
    CancelCircleFreeIcons,
    Tick02FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import { useKYCStatus } from '@hooks/api/useKYC';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type DepositMethod = 'direct' | 'crypto' | 'cash';

interface MethodCard {
    id: DepositMethod;
    title: string;
    subtitle: string;
    icon: any;
}

const METHODS: MethodCard[] = [
    {
        id: 'direct',
        title: 'Direct Transfer',
        subtitle: 'Receive from another LIVOPay account',
        icon: UserAdd01FreeIcons,
    },
    {
        id: 'crypto',
        title: 'Crypto Deposit',
        subtitle: 'Deposit from exchange/crypto wallet',
        icon: Blockchain01FreeIcons,
    },
    {
        id: 'cash',
        title: 'Cash Deposit',
        subtitle: 'Deposit from bank/ewallet account',
        icon: Globe02FreeIcons,
    },
];

const IMPORTANT_NOTES = [
    'Payment can be made by scanning QRCode',
    'Find recipient by searching Username or UID',
    'Transfer cannot be recalled once executed',
];

export default function DepositScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const kycStatus = useKYCStatus();

    const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
    const [notesSheetVisible, setNotesSheetVisible] = useState(false);
    const [deniedSheetVisible, setDeniedSheetVisible] = useState(false);
    const [checkedNotes, setCheckedNotes] = useState<boolean[]>([false, false, false]);

    const allNotesChecked = checkedNotes.every(Boolean);

    const toggleNote = useCallback((index: number) => {
        setCheckedNotes((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    }, []);

    const handleNext = useCallback(() => {
        if (!selectedMethod) return;

        if (selectedMethod === 'direct') {
            setCheckedNotes([false, false, false]);
            setNotesSheetVisible(true);
            return;
        }

        const level = kycStatus.data?.level ?? 0;
        if (level < 1) {
            setDeniedSheetVisible(true);
            return;
        }

        navigation.navigate('CryptoReceive');
    }, [selectedMethod, kycStatus.data, navigation]);

    const handleUnderstand = useCallback(() => {
        setNotesSheetVisible(false);
        navigation.navigate('CryptoReceive');
    }, [navigation]);

    const handleCompleteVerification = useCallback(() => {
        setDeniedSheetVisible(false);
        navigation.navigate('Verification');
    }, [navigation]);

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
                <Text style={styles.headerTitle}>Deposit</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Method Cards */}
                <View style={styles.cardsContainer}>
                    {METHODS.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.methodCard,
                                    isSelected && styles.methodCardSelected,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => setSelectedMethod(method.id)}
                            >
                                <View style={styles.methodTextWrap}>
                                    <Text style={styles.methodTitle}>{method.title}</Text>
                                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                                </View>
                                <View style={styles.methodIconCircle}>
                                    <HugeiconsIcon icon={method.icon} size={29} color="#242424" />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Next Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.nextButton, !selectedMethod && styles.nextButtonDisabled]}
                    activeOpacity={0.7}
                    onPress={handleNext}
                    disabled={!selectedMethod}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Important Notes Bottom Sheet */}
            <BottomSheet
                visible={notesSheetVisible}
                onClose={() => setNotesSheetVisible(false)}
                maxHeight="55%"
                footer={
                    <TouchableOpacity
                        style={[styles.sheetButton, !allNotesChecked && styles.sheetButtonDisabled]}
                        activeOpacity={0.7}
                        onPress={handleUnderstand}
                        disabled={!allNotesChecked}
                    >
                        <Text style={styles.sheetButtonText}>I Understand</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.sheetContent}>
                    <View style={styles.warningCircle}>
                        <HugeiconsIcon icon={Alert02FreeIcons} size={24} color="#242424" />
                    </View>
                    <Text style={styles.sheetTitle}>Important Notes</Text>
                    <View style={styles.notesList}>
                        {IMPORTANT_NOTES.map((note, index) => (
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

            {/* Access Denied Bottom Sheet */}
            <BottomSheet
                visible={deniedSheetVisible}
                onClose={() => setDeniedSheetVisible(false)}
                maxHeight="45%"
                footer={
                    <TouchableOpacity
                        style={styles.sheetButton}
                        activeOpacity={0.7}
                        onPress={handleCompleteVerification}
                    >
                        <Text style={styles.sheetButtonText}>Complete Verification</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.sheetContent}>
                    <View style={styles.deniedCircle}>
                        <HugeiconsIcon icon={CancelCircleFreeIcons} size={24} color="#FF6464" />
                    </View>
                    <Text style={styles.sheetTitle}>Access Denied</Text>
                    <Text style={styles.deniedSubtitle}>
                        This feature requires KYC1 verification. Please complete verification to
                        unlock access.
                    </Text>
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
        paddingBottom: spacing.huge,
    },
    // Method Cards
    cardsContainer: {
        gap: 10,
        marginTop: spacing.sm,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        height: 102,
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    methodCardSelected: {
        borderWidth: 1.5,
        borderColor: '#01CA47',
    },
    methodTextWrap: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    methodSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 18,
        marginTop: 9,
    },
    methodIconCircle: {
        width: 59,
        height: 59,
        borderRadius: 30,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Bottom Bar
    bottomBar: {
        paddingHorizontal: 15,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    nextButton: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonDisabled: {
        opacity: 0.4,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    // Bottom Sheet shared
    sheetContent: {
        alignItems: 'center',
    },
    sheetButton: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetButtonDisabled: {
        opacity: 0.4,
    },
    sheetButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    // Important Notes
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
        paddingVertical: 12,
        paddingHorizontal: 16,
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
        marginLeft: 12,
    },
    checkboxChecked: {
        backgroundColor: '#242424',
        borderColor: '#242424',
    },
    // Access Denied
    deniedCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255, 100, 100, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    deniedSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 21,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
});
