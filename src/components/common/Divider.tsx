import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@theme/colors';

interface DividerProps {
    vertical?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function Divider({
    vertical = false,
    style,
}: DividerProps): React.ReactElement {
    return <View style={[vertical ? styles.vertical : styles.horizontal, style]} />;
}

const styles = StyleSheet.create({
    horizontal: {
        height: 1,
        width: '100%',
        backgroundColor: colors.divider,
    },
    vertical: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: colors.divider,
    },
});
