import React from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet from '@components/common/BottomSheet';
import SheetStateBlock from '@components/common/SheetStateBlock';
import Button from '@components/common/Button';

export type ApiErrorSheetTone = 'error' | 'warning' | 'info';

interface ApiErrorSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    /** Maps to SheetStateBlock tone — default `error` for API failures */
    tone?: ApiErrorSheetTone;
    actionLabel?: string;
}

/**
 * Product-grade error / notice sheet (replaces raw Alert for in-app flows).
 * Keep native Alert for OS-level prompts (e.g. camera permission → Settings).
 */
export default function ApiErrorSheet({
    visible,
    onClose,
    title,
    message,
    tone = 'error',
    actionLabel = 'OK',
}: ApiErrorSheetProps): React.ReactElement {
    const footer = (
        <View style={styles.footerInner}>
            <Button label={actionLabel} onPress={onClose} />
        </View>
    );

    return (
        <BottomSheet visible={visible} onClose={onClose} maxHeight="72%" title="Notice" showBackButton footer={footer}>
            <SheetStateBlock tone={tone} title={title} description={message} />
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    footerInner: {
        width: '100%',
    },
});
