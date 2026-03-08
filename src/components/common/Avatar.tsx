import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, palette } from '@theme/colors';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AvatarProps {
  /** Username or display name — first character is used as the initial */
  name: string;
  /** Optional image URL */
  imageUrl?: string | null;
  /** Diameter in px (default 56) */
  size?: number;
  /** Optional override background color */
  bgColor?: string;
}

// ─── Deterministic Color from Name ────────────────────────────────────────────
const AVATAR_COLORS = [
  '#FF69B4', // pink (Figma default)
  '#01CA47', // brand green
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#10B981', // emerald
  '#3B82F6', // blue
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Avatar({
  name,
  imageUrl,
  size = 56,
  bgColor,
}: AvatarProps): React.ReactElement {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const backgroundColor = useMemo(
    () => bgColor ?? AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length],
    [bgColor, name],
  );

  const fontSize = size * 0.42;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        accessibilityLabel={`${name}'s profile picture`}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
      accessibilityLabel={`${name}'s avatar`}
      accessibilityRole="image"
    >
      <Text
        style={[
          styles.initial,
          { fontSize, lineHeight: fontSize * 1.2 },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: palette.white,
    fontWeight: '800',
  },
  image: {
    resizeMode: 'cover',
  },
});
