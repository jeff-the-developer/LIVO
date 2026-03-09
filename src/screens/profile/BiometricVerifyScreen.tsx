import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Switch,
    Animated,
    PanResponder,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import BottomSheet from '@components/common/BottomSheet';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_PADDING = spacing.base;
const TRACK_WIDTH = SCREEN_WIDTH - SLIDER_PADDING * 2;
const THUMB_RADIUS = 12;
const MIN_MINUTES = 0;
const MAX_MINUTES = 60;

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimeSliderProps {
    /** Current value in minutes */
    value: number;
    /** Called when the user releases the slider thumb */
    onChange: (v: number) => void;
}

// ─── Time Slider ──────────────────────────────────────────────────────────────
/**
 * A custom slider for selecting a time duration between 0 and 60 minutes.
 * Shows the current value above the track and labels at both ends.
 */
function TimeSlider({ value, onChange }: TimeSliderProps): React.ReactElement {
    const fraction = (value - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES);
    const translateX = useRef(new Animated.Value(fraction * (TRACK_WIDTH - THUMB_RADIUS * 2))).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                translateX.extractOffset();
            },
            onPanResponderMove: (_, gs) => {
                const maxTravel = TRACK_WIDTH - THUMB_RADIUS * 2;
                const raw = Math.max(0, Math.min(gs.dx + ((translateX as any)._offset || 0), maxTravel));
                translateX.setValue(raw - ((translateX as any)._offset || 0));
            },
            onPanResponderRelease: () => {
                translateX.flattenOffset();
                const maxTravel = TRACK_WIDTH - THUMB_RADIUS * 2;
                // @ts-ignore – read animated value
                const currentVal = (translateX as any)._value;
                const clamped = Math.max(0, Math.min(currentVal, maxTravel));
                const newFraction = clamped / maxTravel;
                const minutes = Math.round(newFraction * MAX_MINUTES);
                onChange(minutes);
                translateX.setValue((minutes / MAX_MINUTES) * maxTravel);
            },
        }),
    ).current;

    const fillWidth = translateX.interpolate({
        inputRange: [0, TRACK_WIDTH - THUMB_RADIUS * 2],
        outputRange: [THUMB_RADIUS, TRACK_WIDTH],
        extrapolate: 'clamp',
    });

    return (
        <View
            style={sl.wrap}
            accessibilityLabel={`Autolock timer: ${value} minutes`}
            accessibilityRole="adjustable"
        >
            <Text style={sl.valueText}>{value}min</Text>
            <View style={sl.track}>
                <Animated.View style={[sl.fill, { width: fillWidth }]} />
                <Animated.View
                    style={[sl.thumb, { transform: [{ translateX }] }]}
                    {...panResponder.panHandlers}
                />
            </View>
            <View style={sl.labels}>
                <Text style={sl.labelText}>0min</Text>
                <Text style={sl.labelText}>60min</Text>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BiometricVerifyScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [autolock, setAutolock] = useState(true);
    const [autolockMinutes, setAutolockMinutes] = useState(30);
    const [biometric, setBiometric] = useState(true);
    const [showFailed, setShowFailed] = useState(false);

    const onUpdateSettings = () => {
        // TODO: call API to update settings
        // If biometric verification fails, show failure sheet
        // For demo, just go back
        navigation.goBack();
    };

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="biometric-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Biometric Verify</Text>
                <View style={s.headerSpacer} />
            </View>

            <View style={s.content}>
                {/* Autolock Section */}
                <View style={s.row}>
                    <Text style={s.settingTitle}>Autolock</Text>
                    <Switch
                        value={autolock}
                        onValueChange={setAutolock}
                        trackColor={{ false: palette.gray200, true: colors.primary }}
                        thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                        ios_backgroundColor={palette.gray200}
                        accessibilityLabel="Autolock toggle"
                        testID="biometric-autolock-toggle"
                    />
                </View>
                <Text style={s.settingDesc}>
                    Automatically locks your account after inactivity to prevent unauthorized access
                </Text>

                {autolock && (
                    <TimeSlider value={autolockMinutes} onChange={setAutolockMinutes} />
                )}

                <View style={s.divider} />

                {/* Biometric Function Section */}
                <View style={s.row}>
                    <Text style={s.settingTitle}>Biometric Function</Text>
                    <Switch
                        value={biometric}
                        onValueChange={setBiometric}
                        trackColor={{ false: palette.gray200, true: colors.primary }}
                        thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                        ios_backgroundColor={palette.gray200}
                        accessibilityLabel="Biometric function toggle"
                        testID="biometric-function-toggle"
                    />
                </View>
                <Text style={s.settingDesc}>
                    Use biometrics as a secure and faster alternative to your PIN for everyday access
                </Text>
            </View>

            <View style={{ flex: 1 }} />

            {/* Update Settings Button */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={s.updateBtn}
                    onPress={onUpdateSettings}
                    activeOpacity={0.85}
                    accessibilityLabel="Update settings"
                    accessibilityRole="button"
                    testID="biometric-update"
                >
                    <Text style={s.updateBtnText}>Update Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Failed Sheet — uses shared BottomSheet */}
            <BottomSheet visible={showFailed} onClose={() => setShowFailed(false)}>
                <View style={fs.body}>
                    <View style={fs.iconCircle}>
                        <Text style={fs.iconX}>✕</Text>
                    </View>
                    <Text style={fs.title}>
                        Biometric authentication{'\n'}failed
                    </Text>
                </View>
                <View style={fs.footer}>
                    <TouchableOpacity
                        style={fs.okayBtn}
                        onPress={() => setShowFailed(false)}
                        activeOpacity={0.85}
                        accessibilityLabel="Okay"
                        accessibilityRole="button"
                        testID="biometric-failed-okay"
                    >
                        <Text style={fs.okayBtnText}>Okay</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    headerSpacer: { width: 36 },
    content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    settingTitle: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '700' },
    settingDesc: {
        ...typography.bodySm,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    divider: { height: 0.5, backgroundColor: colors.border, marginVertical: spacing.lg },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    updateBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
    },
    updateBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

// ─── Slider Styles ────────────────────────────────────────────────────────────
const sl = StyleSheet.create({
    wrap: { marginBottom: spacing.md },
    valueText: {
        ...typography.bodyMd,
        color: colors.primary,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: palette.gray200,
        justifyContent: 'center',
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_RADIUS * 2,
        height: THUMB_RADIUS * 2,
        borderRadius: THUMB_RADIUS,
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
    labelText: { ...typography.caption, color: colors.textPrimary, fontWeight: '500' },
});

// ─── Failed Sheet Content Styles ──────────────────────────────────────────────
const fs = StyleSheet.create({
    body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.redLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    iconX: { fontSize: 24, color: palette.red, fontWeight: '700' },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        lineHeight: 32,
    },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
    okayBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
    },
    okayBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});
