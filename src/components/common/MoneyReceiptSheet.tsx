import React from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet from '@components/common/BottomSheet';
import SheetStateBlock from '@components/common/SheetStateBlock';
import DetailRow from '@components/common/DetailRow';
import Button from '@components/common/Button';
import Divider from '@components/common/Divider';
import { spacing } from '@theme/spacing';

export interface MoneyReceiptRow {
    label: string;
    value: string;
    mono?: boolean;
    valueNumberOfLines?: number;
}

interface MoneyReceiptSheetProps {
    visible: boolean;
    onClose: () => void;
    /** Short headline under the success icon */
    headline: string;
    /** Optional one-line summary */
    summary?: string;
    rows: MoneyReceiptRow[];
    doneLabel?: string;
    onDone: () => void;
}

export default function MoneyReceiptSheet({
    visible,
    onClose,
    headline,
    summary,
    rows,
    doneLabel = 'Done',
    onDone,
}: MoneyReceiptSheetProps): React.ReactElement {
    const footer = (
        <View style={styles.footerInner}>
            <Button label={doneLabel} onPress={onDone} />
        </View>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} maxHeight="88%" title="Receipt" showBackButton footer={footer}>
            <SheetStateBlock tone="success" title={headline} description={summary} />
            <View style={styles.card}>
                {rows.map((row, i) => (
                    <React.Fragment key={`${row.label}-${i}`}>
                        {i > 0 ? <Divider /> : null}
                        <DetailRow
                            label={row.label}
                            value={row.value}
                            mono={row.mono}
                            valueNumberOfLines={row.valueNumberOfLines ?? 6}
                        />
                    </React.Fragment>
                ))}
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: spacing.md,
        borderRadius: 13,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.lg,
    },
    footerInner: {
        width: '100%',
    },
});
