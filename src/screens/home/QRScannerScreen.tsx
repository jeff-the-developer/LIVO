import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons, Camera01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';

export default function QRScannerScreen(): React.ReactElement {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.6}
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan the QR code</Text>
                <TouchableOpacity style={styles.backBtn} activeOpacity={0.6}>
                    <HugeiconsIcon icon={Camera01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
            </View>

            {/* Scanner Frame */}
            <View style={styles.scannerArea}>
                <View style={styles.frame}>
                    {/* Corner indicators */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={styles.hintText}>
                    Position the QR code within the frame to scan
                </Text>
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
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: {
        width: 36,
        height: 33,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    scannerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    frame: {
        width: 296,
        height: 296,
        borderWidth: 2,
        borderColor: '#242424',
        borderRadius: 24,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#242424',
    },
    topLeft: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 24,
    },
    topRight: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 24,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 24,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 24,
    },
    hintText: {
        marginTop: 30,
        fontSize: 14,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 21,
        textAlign: 'center',
    },
});
