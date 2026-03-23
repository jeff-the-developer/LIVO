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
    GiftFreeIcons,
    UserAdd01FreeIcons,
    Blockchain01FreeIcons,
    Globe02FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import MethodSelectionHub from '@components/common/MethodSelectionHub';
import { useKYCStatus } from '@hooks/api/useKYC';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type SendMethod = 'direct' | 'crypto' | 'bank';

interface MethodCard {
    id: SendMethod;
    title: string;
    subtitle: string;
    icon: any;
}

const METHODS: MethodCard[] = [
    {
        id: 'direct',
        title: 'Direct Transfer',
        subtitle: 'Send to another LIVOPay account instantly',
        icon: UserAdd01FreeIcons,
    },
    {
        id: 'crypto',
        title: 'Crypto Transfer',
        subtitle: 'Send crypto to a wallet address',
        icon: Blockchain01FreeIcons,
    },
    {
        id: 'bank',
        title: 'Bank/Wire Transfer',
        subtitle: 'Send cash to another bank account',
        icon: Globe02FreeIcons,
    },
];

const IMPORTANT_NOTES = [
    'Payment can be made by scanning QRCode',
    'Find recipient by searching Username or UID',
    'Transfer cannot be recalled once executed',
];

export default function SendScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const kycStatus = useKYCStatus();

    const [selectedMethod, setSelectedMethod] = useState<SendMethod | null>(null);
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

        const kyc1Ok =
            (kycStatus.data?.level ?? 0) >= 1 && kycStatus.data?.status === 'approved';
        if (!kyc1Ok) {
            setDeniedSheetVisible(true);
            return;
        }

        if (selectedMethod === 'crypto') {
            navigation.navigate('CryptoTransfer', {});
        } else {
            navigation.navigate('BankTransfer');
        }
    }, [selectedMethod, kycStatus.data, navigation]);

    const handleUnderstand = useCallback(() => {
        setNotesSheetVisible(false);
        navigation.navigate('DirectTransfer');
    }, [navigation]);

    const handleCompleteVerification = useCallback(() => {
        setDeniedSheetVisible(false);
        navigation.navigate('Verification');
    }, [navigation]);

    return (
        <MethodSelectionHub
            title="Send"
            methods={METHODS}
            selectedMethod={selectedMethod}
            onSelectMethod={(id) => setSelectedMethod(id as SendMethod)}
            onNext={handleNext}
            nextDisabled={!selectedMethod}
            notesVisible={notesSheetVisible}
            onCloseNotes={() => setNotesSheetVisible(false)}
            notes={IMPORTANT_NOTES}
            checkedNotes={checkedNotes}
            onToggleNote={toggleNote}
            onUnderstand={handleUnderstand}
            canUnderstand={allNotesChecked}
            deniedVisible={deniedSheetVisible}
            onCloseDenied={() => setDeniedSheetVisible(false)}
            onCompleteVerification={handleCompleteVerification}
            deniedMessage="This feature requires KYC1 verification. Please complete verification to unlock access."
        >
            <TouchableOpacity style={styles.giftBanner} activeOpacity={0.8} onPress={() => navigation.navigate('SendGifts')}>
                <View style={styles.giftGreenStrip} />
                <View style={styles.giftIconCircle}>
                    <HugeiconsIcon icon={GiftFreeIcons} size={28} color="#242424" />
                </View>
                <View style={styles.giftTextWrap}>
                    <Text style={styles.giftTitle}>Gifts</Text>
                    <Text style={styles.giftSubtitle}>Create & send gifts to friends</Text>
                </View>
                <View style={styles.giftPill}>
                    <Text style={styles.giftPillText}>Invite New Friends by Sending Gifts</Text>
                </View>
            </TouchableOpacity>
        </MethodSelectionHub>
    );
}

const styles = StyleSheet.create({
    // Gift Banner
    giftBanner: {
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        paddingTop: 17,
        paddingHorizontal: 3,
        paddingBottom: 20,
        marginTop: 12,
        alignItems: 'center',
        overflow: 'hidden',
    },
    giftGreenStrip: {
        width: '100%',
        height: 100,
        backgroundColor: '#D9F7E3',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginBottom: -50,
    },
    giftIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        zIndex: 1,
    },
    giftTextWrap: {
        alignItems: 'center',
        gap: 9,
        marginBottom: 24,
    },
    giftTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    giftSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 24,
    },
    giftPill: {
        backgroundColor: '#E8E8E8',
        borderRadius: 521,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    giftPillText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
    },
});
