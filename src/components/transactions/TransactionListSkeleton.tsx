import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '@components/common/Skeleton';
import { borderRadius } from '@theme/borderRadius';
import { spacing } from '@theme/spacing';

interface TransactionListSkeletonProps {
    rows?: number;
}

export default function TransactionListSkeleton({
    rows = 4,
}: TransactionListSkeletonProps): React.ReactElement {
    return (
        <View style={styles.container}>
            {Array.from({ length: rows }, (_, index) => (
                <View key={index} style={styles.row}>
                    <Skeleton width={55} height={55} radius={borderRadius.full} />
                    <View style={styles.content}>
                        <View style={styles.topRow}>
                            <Skeleton width="42%" height={18} />
                            <Skeleton width={84} height={18} />
                        </View>
                        <View style={styles.bottomRow}>
                            <Skeleton width={96} height={14} />
                            <Skeleton width={56} height={14} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 64,
    },
    content: {
        flex: 1,
        gap: spacing.sm,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.base,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.base,
    },
});
