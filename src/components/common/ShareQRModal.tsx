import React, { useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Share,
    Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Bookmark01FreeIcons,
    Link01FreeIcons,
    Mail01FreeIcons,
    Share04FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import QRCardWithLogo from './QRCardWithLogo';

interface ShareQRModalProps {
    visible: boolean;
    onClose: () => void;
    /** Data encoded in the QR code */
    qrValue: string;
    /** Title shown below QR (default: "Scan QR CODE & Pay") */
    title?: string;
    /** Subtitle shown below divider (e.g. "UID: 12345") */
    subtitle?: string;
    /** Text shared via mail/share actions */
    shareText?: string;
    /** Link copied when "Link" is tapped */
    copyLink?: string;
}

export default function ShareQRModal({
    visible,
    onClose,
    qrValue,
    title = 'Scan QR CODE & Pay',
    subtitle,
    shareText,
    copyLink,
}: ShareQRModalProps): React.ReactElement {
    const canSave = false;

    const handleCopyLink = useCallback(async () => {
        if (copyLink) await Clipboard.setStringAsync(copyLink);
    }, [copyLink]);

    const handleMailPress = useCallback(() => {
        const body = shareText ?? qrValue;
        Linking.openURL(`mailto:?subject=LIVOPay&body=${encodeURIComponent(body)}`);
    }, [shareText, qrValue]);

    const handleSharePress = useCallback(async () => {
        try {
            await Share.share({
                message: shareText ?? qrValue,
                title: 'LIVOPay',
            });
        } catch { /* cancelled */ }
    }, [shareText, qrValue]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Top card: QR + title + subtitle */}
                <View style={styles.topCard}>
                    <View style={styles.qrInner}>
                        <QRCardWithLogo value={qrValue} size={280} showContainer={false} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.divider} />
                    {subtitle ? <Text style={styles.subtitle} selectable>{subtitle}</Text> : null}
                </View>

                {/* Bottom card: action buttons + Okay */}
                <View style={styles.bottomCard}>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionItem, !canSave && styles.actionItemDisabled]}
                            activeOpacity={0.7}
                            disabled={!canSave}
                        >
                            <View style={[styles.actionIcon, !canSave && styles.actionIconDisabled]}>
                                <HugeiconsIcon
                                    icon={Bookmark01FreeIcons}
                                    size={20}
                                    color={canSave ? '#242424' : colors.textMuted}
                                />
                            </View>
                            <Text style={[styles.actionLabel, !canSave && styles.actionLabelDisabled]}>
                                Save
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={handleCopyLink} activeOpacity={0.7}>
                            <View style={styles.actionIcon}>
                                <HugeiconsIcon icon={Link01FreeIcons} size={20} color="#242424" />
                            </View>
                            <Text style={styles.actionLabel}>Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={handleMailPress} activeOpacity={0.7}>
                            <View style={styles.actionIcon}>
                                <HugeiconsIcon icon={Mail01FreeIcons} size={20} color="#242424" />
                            </View>
                            <Text style={styles.actionLabel}>Mail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={handleSharePress} activeOpacity={0.7}>
                            <View style={styles.actionIcon}>
                                <HugeiconsIcon icon={Share04FreeIcons} size={20} color="#242424" />
                            </View>
                            <Text style={styles.actionLabel}>Share</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.okayBtn} onPress={onClose} activeOpacity={0.7}>
                        <Text style={styles.okayBtnText}>Okay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.37)',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        paddingBottom: 20,
        gap: 10,
    },
    topCard: {
        marginHorizontal: 15,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        overflow: 'hidden',
        alignItems: 'center',
        paddingBottom: 20,
    },
    qrInner: {
        width: 340,
        height: 340,
        margin: 14,
        borderRadius: 31,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        marginTop: 20,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#686868',
        lineHeight: 20,
        marginTop: 14,
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    divider: {
        alignSelf: 'stretch',
        height: 1.5,
        backgroundColor: '#F0F0F0',
        marginTop: 20,
    },
    bottomCard: {
        marginHorizontal: 15,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingTop: 17,
        paddingBottom: 9,
        alignItems: 'center',
        gap: 17,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 58,
    },
    actionItem: { alignItems: 'center', gap: 5, width: 39 },
    actionItemDisabled: {
        opacity: 0.55,
    },
    actionIcon: {
        width: 39,
        height: 39,
        borderRadius: 243,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconDisabled: {
        backgroundColor: '#F0F0F0',
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
        textAlign: 'center',
    },
    actionLabelDisabled: {
        color: colors.textMuted,
    },
    okayBtn: {
        alignSelf: 'stretch',
        height: 52,
        marginHorizontal: 13,
        backgroundColor: '#242424',
        borderRadius: 600,
        alignItems: 'center',
        justifyContent: 'center',
    },
    okayBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        lineHeight: 24,
    },
});
