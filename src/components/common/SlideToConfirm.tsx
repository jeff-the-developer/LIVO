import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
interface SlideToConfirmProps {
  /** Callback fired when the user completes the slide gesture */
  onConfirm: () => void;
  /** Label text shown inside the track (default: "Slide to confirm") */
  label?: string;
  /** Horizontal margin to subtract from screen width for track sizing */
  horizontalPadding?: number;
}

const THUMB_SIZE = 48;

// ─── SlideToConfirm ───────────────────────────────────────────────────────────
/**
 * A swipeable confirmation control. The user drags a thumb across a track
 * to confirm an action. If the thumb passes 80% of the travel distance the
 * confirmation fires; otherwise it springs back.
 */
export default function SlideToConfirm({
  onConfirm,
  label = 'Slide to confirm',
  horizontalPadding = spacing.base * 2,
}: SlideToConfirmProps): React.ReactElement {
  const sliderWidth = SCREEN_WIDTH - horizontalPadding;
  const sliderTravel = sliderWidth - THUMB_SIZE - 8;

  const translateX = useRef(new Animated.Value(0)).current;
  const confirmed = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const x = Math.max(0, Math.min(gs.dx, sliderTravel));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx >= sliderTravel * 0.8 && !confirmed.current) {
          confirmed.current = true;
          Animated.spring(translateX, {
            toValue: sliderTravel,
            useNativeDriver: true,
          }).start(() => onConfirm());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const fillWidth = translateX.interpolate({
    inputRange: [0, sliderTravel],
    outputRange: [THUMB_SIZE + 4, sliderWidth],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { width: sliderWidth }]}
      accessibilityLabel={label}
      accessibilityRole="adjustable"
    >
      <Animated.View style={[styles.fill, { width: fillWidth }]} />
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={20} color={colors.buttonText} />
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE + 8,
    borderRadius: borderRadius.full,
    backgroundColor: palette.gray100,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  label: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
