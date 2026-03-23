import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useRedeemCode } from '@hooks/api/useDeposit';
import MoneyReceiptSheet, { type MoneyReceiptRow } from '@components/common/MoneyReceiptSheet';
import { handleApiError } from '@utils/errorHandler';
import { formatReceiptDateTime } from '@utils/formatReceipt';
import { hapticSuccess, hapticWarning } from '@utils/haptics';
import ApiErrorSheet from '@components/common/ApiErrorSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function RedeemCodeScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [code, setCode] = useState('');
    const redeemMutation = useRedeemCode();
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receipt, setReceipt] = useState<{
        headline: string;
        summary?: string;
        rows: MoneyReceiptRow[];
    } | null>(null);
    const [noticeSheet, setNoticeSheet] = useState<{
        title: string;
        message: string;
        tone: 'error' | 'warning' | 'info';
    } | null>(null);

    const canRedeem = code.replace(/\s/g, '').length === 16 && !redeemMutation.isPending;

    const handleRedeem = () => {
        if (!canRedeem) return;
        redeemMutation.mutate(
            { code: code.trim() },
            {
                onSuccess: (res) => {
                    hapticSuccess();
                    const data = res.data;
                    const ts = formatReceiptDateTime();
                    const rows: MoneyReceiptRow[] = [
                        { label: 'Credited', value: `${data.amount ?? '—'} ${data.currency ?? ''}`.trim() },
                        { label: 'Status', value: data.status ?? '—' },
                        { label: 'Date', value: ts },
                    ];
                    if (data.reference?.trim()) {
                        rows.push({ label: 'Reference', value: data.reference, mono: true });
                    }
                    if (data.tx_id?.trim()) {
                        rows.push({ label: 'Transaction ID', value: data.tx_id, mono: true });
                    }
                    setReceipt({
                        headline: 'Code redeemed',
                        summary: `${data.amount} ${data.currency} added to your wallet`,
                        rows,
                    });
                    setReceiptOpen(true);
                },
                onError: (error: unknown) => {
                    hapticWarning();
                    const e = handleApiError(error);
                    setNoticeSheet({ title: e.title, message: e.message, tone: 'error' });
                },
            },
        );
    };

    return (
        <>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={22} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Redeem code</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.body}>
                <Text style={styles.label}>Redemption code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 16-digit Redemption Code"
                    placeholderTextColor="#B2B2B2"
                    value={code}
                    onChangeText={setCode}
                    maxLength={16}
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
            </View>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                    activeOpacity={0.7}
                    onPress={handleRedeem}
                    disabled={!canRedeem}
                >
                    {redeemMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.redeemBtnText}>Redeem</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
            {receipt ? (
                <MoneyReceiptSheet
                    visible={receiptOpen}
                    onClose={() => setReceiptOpen(false)}
                    headline={receipt.headline}
                    summary={receipt.summary}
                    rows={receipt.rows}
                    onDone={() => {
                        setReceiptOpen(false);
                        setReceipt(null);
                        navigation.goBack();
                    }}
                />
            ) : null}
            <ApiErrorSheet
                visible={noticeSheet !== null}
                onClose={() => setNoticeSheet(null)}
                title={noticeSheet?.title ?? ''}
                message={noticeSheet?.message ?? ''}
                tone={noticeSheet?.tone === 'warning' ? 'warning' : noticeSheet?.tone === 'info' ? 'info' : 'error'}
            />
        </>
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
    body: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: spacing.sm,
        gap: 17,
    },
    label: {
        fontSize: 16,
        fontWeight: '400',
        color: '#686868',
        lineHeight: 19,
    },
    input: {
        height: 52,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 15,
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
    },
    bottomBar: {
        paddingHorizontal: 15,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    redeemBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    redeemBtnDisabled: {
        backgroundColor: '#B2B2B2',
    },
    redeemBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 24,
    },
});
