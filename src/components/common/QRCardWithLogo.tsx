import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCardWithLogoProps {
    value: string;
    /** QR code size in pixels (default 280) */
    size?: number;
    /** Container size — if not set, uses size + padding */
    containerSize?: number;
    /** Whether to show the outer bordered container (default true) */
    showContainer?: boolean;
}

export default function QRCardWithLogo({
    value,
    size = 280,
    containerSize,
    showContainer = true,
}: QRCardWithLogoProps): React.ReactElement {
    const cSize = containerSize ?? size + 93;

    const qrContent = (
        <>
            <QRCode
                value={value}
                size={size}
                backgroundColor="white"
                color="#242424"
                ecl="M"
            />
            <View style={styles.logoOverlay}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>L</Text>
                </View>
            </View>
        </>
    );

    if (!showContainer) {
        return <View style={styles.bare}>{qrContent}</View>;
    }

    return (
        <View style={[styles.container, { width: cSize, height: cSize }]}>
            {qrContent}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 31,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    bare: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 98,
        height: 98,
        borderRadius: 23,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 12,
        borderColor: 'white',
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
});
