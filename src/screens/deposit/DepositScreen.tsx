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
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import MethodSelectionHub from '@components/common/MethodSelectionHub';
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

        const kyc1Ok =
            (kycStatus.data?.level ?? 0) >= 1 && kycStatus.data?.status === 'approved';
        if (!kyc1Ok) {
            setDeniedSheetVisible(true);
            return;
        }

        if (selectedMethod === 'crypto') {
            navigation.navigate('CryptoReceive');
        } else if (selectedMethod === 'cash') {
            navigation.navigate('CashDeposit');
        }
    }, [selectedMethod, kycStatus.data, navigation]);

    const handleUnderstand = useCallback(() => {
        setNotesSheetVisible(false);
        navigation.navigate('QuickReceive');
    }, [navigation]);

    const handleCompleteVerification = useCallback(() => {
        setDeniedSheetVisible(false);
        navigation.navigate('Verification');
    }, [navigation]);

    return (
        <MethodSelectionHub
            title="Deposit"
            methods={METHODS}
            selectedMethod={selectedMethod}
            onSelectMethod={(id) => setSelectedMethod(id as DepositMethod)}
            onNext={handleNext}
            nextDisabled={!selectedMethod}
            onBackPress={() => navigation.goBack()}
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
        />
    );
}

const styles = StyleSheet.create({
});
