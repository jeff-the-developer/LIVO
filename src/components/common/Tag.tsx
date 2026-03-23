import React from 'react';
import { StyleSheet } from 'react-native';
import Badge, { type BadgeTone } from './Badge';
import { colors } from '@theme/colors';

interface TagProps {
    label: string;
    tone?: BadgeTone;
}

export default function Tag({
    label,
    tone = 'neutral',
}: TagProps): React.ReactElement {
    return <Badge label={label} tone={tone} style={styles.tag} />;
}

const styles = StyleSheet.create({
    tag: {
        borderWidth: 1,
        borderColor: colors.border,
    },
});
