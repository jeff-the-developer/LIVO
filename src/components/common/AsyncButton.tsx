import React from 'react';
import Button from './Button';

interface AsyncButtonProps {
    label: string;
    onPress?: () => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
    accessibilityLabel?: string;
}

export default function AsyncButton({
    label,
    onPress,
    loading,
    disabled,
    testID,
    accessibilityLabel,
}: AsyncButtonProps): React.ReactElement {
    return (
        <Button
            label={label}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
        />
    );
}
