import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Building04FreeIcons,
    CreditCardFreeIcons,
    Ticket01FreeIcons,
    SmartPhone01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Nav = NativeStackNavigationProp<AppStackParamList>;

interface OptionCard {
    title: string;
    limit: string;
    feeEta: string;
    icon: any;
}

const OPTIONS: OptionCard[] = [
    {
        title: 'Bank Transfer',
        limit: 'No Limit',
        feeEta: 'Fee: Subject to bank  ETA: 0~3 Days',
        icon: Building04FreeIcons,
    },
    {
        title: 'Credit/Debit Card',
        limit: 'No Limit',
        feeEta: 'Fee: 0 USD  ETA: 0~2 Days',
        icon: CreditCardFreeIcons,
    },
    {
        title: 'Redeem Code',
        limit: 'No Limit',
        feeEta: 'Fee: 0 USD  ETA: 0~3 Days',
        icon: Ticket01FreeIcons,
    },
    {
        title: 'ApplePay',
        limit: '10~2,000 USD',
        feeEta: 'Fee: 0.2%  ETA: 0~2 Days',
        icon: SmartPhone01FreeIcons,
    },
];

export default function CashDepositScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const handleCardPress = (title: string) => {
        if (title === 'Bank Transfer') {
            navigation.navigate('BankTransferDeposit');
        } else if (title === 'Redeem Code') {
            navigation.navigate('RedeemCode');
        } else if (title === 'Credit/Debit Card') {
            navigation.navigate('CreditDebitDeposit');
        } else if (title === 'ApplePay') {
            navigation.navigate('AddFunds', { source: 'apple_pay' });
        }
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
                <Text style={styles.headerTitle}>Cash Deposit</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.cardsContainer}>
                {OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.title}
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => handleCardPress(option.title)}
                    >
                        <View style={styles.textWrap}>
                            <Text style={styles.cardTitle}>{option.title}</Text>
                            <Text style={styles.cardMuted}>Limit: {option.limit}</Text>
                            <Text style={styles.cardMuted}>{option.feeEta}</Text>
                        </View>
                        <View style={styles.iconCircle}>
                            <HugeiconsIcon icon={option.icon} size={29} color="#242424" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
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
    cardsContainer: {
        paddingHorizontal: 15,
        paddingTop: spacing.sm,
        gap: 10,
    },
    card: {
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
    textWrap: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    cardMuted: {
        fontSize: 12,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 18,
        marginTop: 2,
    },
    iconCircle: {
        width: 59,
        height: 59,
        borderRadius: 30,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
