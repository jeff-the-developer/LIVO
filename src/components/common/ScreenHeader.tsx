import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

interface ScreenHeaderProps {
    title: string;
    onBackPress?: () => void;
    rightAdornment?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    showBackButton?: boolean;
}

export default function ScreenHeader({
    title,
    onBackPress,
    rightAdornment,
    style,
    showBackButton = true,
}: ScreenHeaderProps): React.ReactElement {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.side}>
                {showBackButton ? (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onBackPress}
                        activeOpacity={0.72}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={ui.iconSize.md}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={[styles.side, styles.sideRight]}>{rightAdornment}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: spacing.massive - spacing.sm,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    side: {
        width: spacing.xxxl,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    sideRight: {
        alignItems: 'flex-end',
    },
    iconButton: {
        width: spacing.xxxl,
        height: spacing.xxxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        ...typography.h4,
        color: colors.textPrimary,
        textAlign: 'center',
        fontWeight: '600',
    },
});
