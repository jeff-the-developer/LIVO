import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, FlashlightFreeIcons } from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import SheetStateBlock from '@components/common/SheetStateBlock';
import DetailRow from '@components/common/DetailRow';
import Button from '@components/common/Button';
import { hapticLight } from '@utils/haptics';
import { resolveQrPayPayload } from '@utils/parsePayQrPayload';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type ScanKind = 'livopay_other' | 'crypto' | 'unknown';

interface ScanSheetState {
    kind: ScanKind;
    raw: string;
}

function isCryptoAddress(data: string): boolean {
    const d = data.trim();
    return (
        /^(0x)?[0-9a-fA-F]{40,}$/.test(d) ||
        /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(d) ||
        /^bc1[a-zA-HJ-NP-Z0-9]{25,}$/i.test(d)
    );
}

function previewText(raw: string, max = 180): string {
    const t = raw.trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
}

export default function QRScannerScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const [scanSheet, setScanSheet] = useState<ScanSheetState | null>(null);
    const processingRef = useRef(false);

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const resetScanner = useCallback(() => {
        setScanned(false);
        processingRef.current = false;
    }, []);

    const closeScanSheet = useCallback(() => {
        setScanSheet(null);
        resetScanner();
    }, [resetScanner]);

    const handleGrantPermission = async () => {
        const result = await requestPermission();
        if (!result.granted) {
            Alert.alert(
                'Camera Permission',
                'Please enable camera access in your device settings to scan QR codes.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Settings',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        },
                    },
                ],
            );
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (processingRef.current) return;
        processingRef.current = true;
        setScanned(true);

        const raw = data ?? '';
        if (!raw.trim()) {
            setScanSheet({ kind: 'unknown', raw: '' });
            return;
        }

        const pay = resolveQrPayPayload(raw);
        if (pay.action === 'direct_transfer') {
            hapticLight();
            setScanSheet(null);
            const { prefillSearchQuery, prefillCurrency, prefillAmount, prefillNote } = pay.prefill;
            navigation.replace('DirectTransfer', {
                ...(prefillSearchQuery && { prefillSearchQuery }),
                ...(prefillCurrency && { prefillCurrency }),
                ...(prefillAmount && { prefillAmount }),
                ...(prefillNote && { prefillNote }),
            });
            return;
        }
        if (pay.action === 'livopay_web_non_pay') {
            setScanSheet({ kind: 'livopay_other', raw: pay.url });
            return;
        }
        if (isCryptoAddress(raw)) {
            setScanSheet({ kind: 'crypto', raw: raw.trim() });
            return;
        }
        setScanSheet({ kind: 'unknown', raw });
    };

    const copyRaw = async () => {
        const raw = scanSheet?.raw ?? '';
        if (!raw) return;
        await Clipboard.setStringAsync(raw);
        hapticLight();
        closeScanSheet();
    };

    const goToCryptoSend = () => {
        const addr = scanSheet?.raw?.trim();
        if (!addr) return;
        hapticLight();
        setScanSheet(null);
        navigation.replace('CryptoTransfer', { prefilledAddress: addr });
    };

    const openLivopayLink = () => {
        const url = scanSheet?.raw?.trim();
        if (!url) return;
        hapticLight();
        void Linking.openURL(url);
        closeScanSheet();
    };

    const sheetTitle =
        scanSheet?.kind === 'livopay_other'
            ? 'LIVOPay link'
            : scanSheet?.kind === 'crypto'
              ? 'Crypto address'
              : 'QR content';

    const sheetHeadline =
        scanSheet?.kind === 'livopay_other'
            ? 'Link not supported for pay'
            : scanSheet?.kind === 'crypto'
              ? 'Wallet address detected'
              : scanSheet?.raw
                ? 'Unsupported format'
                : 'Empty scan';

    const sheetDescription =
        scanSheet?.kind === 'livopay_other'
            ? 'This LIVOPay URL is not a pay-to-user QR (for example it may be an invite or web page). Open it in the browser or copy it to use elsewhere.'
            : scanSheet?.kind === 'crypto'
              ? 'Verify the network and asset before sending. You can prefill this address on the next screen.'
              : scanSheet?.raw
                ? 'This QR is not a supported in-app pay code or known crypto address. You can still copy the raw content.'
                : 'Try scanning again with the code fully inside the frame.';

    const scanSheetFooter =
        scanSheet?.kind === 'livopay_other' ? (
            <View style={styles.sheetActions}>
                <Button label="Open link" onPress={openLivopayLink} />
                <Button label="Copy link" variant="secondary" onPress={copyRaw} />
                <Button label="Scan again" variant="secondary" onPress={closeScanSheet} />
            </View>
        ) : scanSheet?.kind === 'crypto' ? (
            <View style={styles.sheetActions}>
                <Button label="Send crypto" onPress={goToCryptoSend} />
                <Button label="Scan again" variant="secondary" onPress={closeScanSheet} />
            </View>
        ) : (
            <View style={styles.sheetActions}>
                {scanSheet?.raw ? <Button label="Copy content" onPress={copyRaw} /> : null}
                <Button label="Scan again" variant="secondary" onPress={closeScanSheet} />
            </View>
        );

    // Permission not determined yet
    if (!permission) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Scan QR Code</Text>
                    <View style={styles.backBtn} />
                </View>
                <View style={styles.centeredContainer}>
                    <Text style={styles.permissionText}>Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Scan QR Code</Text>
                    <View style={styles.backBtn} />
                </View>
                <View style={styles.centeredContainer}>
                    <Text style={styles.permissionText}>Camera access is required to scan QR codes</Text>
                    <TouchableOpacity style={styles.permissionBtn} onPress={handleGrantPermission} activeOpacity={0.7}>
                        <Text style={styles.permissionBtnText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.fullScreen}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                enableTorch={torch}
            />

            <View style={styles.overlay}>
                <SafeAreaView style={styles.overlayInner} edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
                            <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Scan QR Code</Text>
                        <TouchableOpacity style={styles.backBtn} onPress={() => setTorch((t) => !t)} activeOpacity={0.6}>
                            <HugeiconsIcon icon={FlashlightFreeIcons} size={24} color={torch ? '#FFD700' : '#FFFFFF'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.scannerArea}>
                        <View style={styles.frame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <Text style={styles.hintText}>Position the QR code within the frame</Text>
                    </View>

                    {scanned && !scanSheet ? (
                        <TouchableOpacity style={styles.scanAgainBtn} onPress={resetScanner} activeOpacity={0.7}>
                            <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
                        </TouchableOpacity>
                    ) : null}
                </SafeAreaView>
            </View>

            <BottomSheet
                visible={scanSheet !== null}
                onClose={closeScanSheet}
                maxHeight="78%"
                title={sheetTitle}
                showBackButton
                footer={scanSheetFooter}
            >
                <SheetStateBlock tone="info" title={sheetHeadline} description={sheetDescription} />
                {scanSheet?.raw ? (
                    <View style={styles.detailCard}>
                        <DetailRow label="Content" value={previewText(scanSheet.raw, 400)} mono valueNumberOfLines={12} />
                    </View>
                ) : null}
            </BottomSheet>
        </View>
    );
}

const FRAME_SIZE = 280;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    fullScreen: { flex: 1, backgroundColor: '#000' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    overlayInner: { flex: 1 },
    centeredContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
    permissionText: { fontSize: 16, fontWeight: '500', color: '#B2B2B2', textAlign: 'center', lineHeight: 24 },
    permissionBtn: {
        backgroundColor: '#242424',
        borderRadius: 100,
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    permissionBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: { width: 36, height: 33, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#242424', lineHeight: 24 },

    scannerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    frame: {
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        borderRadius: 24,
        position: 'relative',
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#FFFFFF',
    },
    topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
    topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
    bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
    bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
    hintText: {
        marginTop: 30,
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 21,
        textAlign: 'center',
    },
    scanAgainBtn: {
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 100,
        paddingHorizontal: 32,
        paddingVertical: 14,
        marginBottom: 40,
    },
    scanAgainText: { fontSize: 16, fontWeight: '600', color: '#242424' },
    sheetActions: {
        width: '100%',
        gap: spacing.sm,
    },
    detailCard: {
        marginTop: spacing.md,
        borderRadius: 13,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
});
