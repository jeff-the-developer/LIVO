import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { ui } from '@theme/ui';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export default function Card({
    children,
    style,
}: CardProps): React.ReactElement {
    return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: ui.radius.card,
    },
});
