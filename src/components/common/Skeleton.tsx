import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { borderRadius } from '@theme/borderRadius';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    radius?: number;
    style?: StyleProp<ViewStyle>;
}

export default function Skeleton({
    width = '100%',
    height = 16,
    radius = borderRadius.md,
    style,
}: SkeletonProps): React.ReactElement {
    const opacity = useRef(new Animated.Value(0.72)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 850,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.72,
                    duration: 850,
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.base,
                {
                    width,
                    height,
                    borderRadius: radius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.shimmer,
        overflow: 'hidden',
    },
});
