import React from 'react';
import Badge, { type BadgeTone } from './Badge';

interface StatusBadgeProps {
    label: string;
    tone?: BadgeTone;
}

export default function StatusBadge({
    label,
    tone = 'neutral',
}: StatusBadgeProps): React.ReactElement {
    return <Badge label={label} tone={tone} />;
}
