import React, { useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import { hapticMedium } from '@utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideToConfirmProps {
    onConfirm: () => void;
    label?: string;
    horizontalPadding?: number;
}

const THUMB_SIZE = 48;
const CONFIRM_THRESHOLD = 0.8;

export default function SlideToConfirm({
    onConfirm,
    label = 'Slide to confirm',
    horizontalPadding = spacing.base * 2,
}: SlideToConfirmProps): React.ReactElement {
    const sliderWidth = SCREEN_WIDTH - horizontalPadding;
    const sliderTravel = sliderWidth - THUMB_SIZE - 8;

    const translateX = useRef(new Animated.Value(0)).current;
    const confirmed = useRef(false);
    const onConfirmRef = useRef(onConfirm);
    onConfirmRef.current = onConfirm;

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onStartShouldSetPanResponderCapture: () => true,
                onMoveShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponderCapture: () => true,
                onPanResponderMove: (_, gs) => {
                    if (confirmed.current) return;
                    const x = Math.max(0, Math.min(gs.dx, sliderTravel));
                    translateX.setValue(x);
                },
                onPanResponderRelease: (_, gs) => {
                    if (confirmed.current) return;
                    const clamped = Math.max(0, Math.min(gs.dx, sliderTravel));
                    if (clamped >= sliderTravel * CONFIRM_THRESHOLD) {
                        confirmed.current = true;
                        Animated.spring(translateX, {
                            toValue: sliderTravel,
                            useNativeDriver: false,
                        }).start(() => {
                            hapticMedium();
                            onConfirmRef.current();
                        });
                    } else {
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: false,
                        }).start();
                    }
                },
            }),
        [sliderTravel, translateX],
    );

    const fillWidth = translateX.interpolate({
        inputRange: [0, sliderTravel],
        outputRange: [THUMB_SIZE + 4, sliderWidth],
        extrapolate: 'clamp',
    });

    return (
        <View
            style={[styles.track, { width: sliderWidth }]}
            accessibilityLabel={label}
            accessibilityRole="adjustable"
        >
            <Animated.View style={[styles.fill, { width: fillWidth }]} />
            <Animated.View
                style={[styles.thumb, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={20} color={colors.buttonText} />
            </Animated.View>
            <Text style={styles.label} pointerEvents="none">{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        height: THUMB_SIZE + 8,
        borderRadius: borderRadius.full,
        backgroundColor: palette.gray100,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },
    thumb: {
        position: 'absolute',
        left: 4,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    label: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
});
