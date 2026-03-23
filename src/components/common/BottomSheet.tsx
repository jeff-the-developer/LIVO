import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: string | number;
    /**
     * Fixed sheet height (e.g. "88%"). Use when the sheet should not shrink to content
     * (maxHeight alone only caps size; content can still make the sheet short).
     */
    sheetHeight?: string | number;
    title?: string;
    showBackButton?: boolean;
    isOverlay?: boolean;
    footer?: React.ReactNode;
    // Overlay sheets that must render inside this Modal (for proper iOS stacking)
    overlays?: React.ReactNode;
}

export default function BottomSheet({
    visible,
    onClose,
    children,
    maxHeight = '85%',
    sheetHeight,
    title,
    showBackButton = false,
    isOverlay = false,
    footer,
    overlays,
}: BottomSheetProps): React.ReactElement {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const prevVisible = useRef<boolean | null>(null);
    const closeFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [presented, setPresented] = useState(visible);

    const parseSize = (v: string | number): number =>
        typeof v === 'string'
            ? v.includes('%')
                ? (SCREEN_HEIGHT * parseInt(v.replace('%', ''), 10)) / 100
                : parseInt(v, 10)
            : v;

    const maxHeightValue = parseSize(maxHeight);
    const sheetHeightValue = sheetHeight != null ? parseSize(sheetHeight) : null;

    /** Tell parent to close; exit motion is driven by `visible` becoming false. */
    const requestDismiss = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        const wasVisible = prevVisible.current ?? false;
        prevVisible.current = visible;

        translateY.stopAnimation();
        backdropOpacity.stopAnimation();

        if (visible && !wasVisible) {
            setPresented(true);
            translateY.setValue(SCREEN_HEIGHT);
            backdropOpacity.setValue(0);
            const raf = requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.spring(translateY, {
                        toValue: 0,
                        tension: 65,
                        friction: 9,
                        useNativeDriver: true,
                    }),
                    Animated.timing(backdropOpacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
            return () => cancelAnimationFrame(raf);
        }

        if (!visible && wasVisible) {
            if (closeFallbackTimer.current) {
                clearTimeout(closeFallbackTimer.current);
            }
            // If the native close animation never calls back (finished: false), still unmount Modal
            // so a transparent layer cannot block touches app-wide (RN Modal + new arch edge cases).
            closeFallbackTimer.current = setTimeout(() => {
                closeFallbackTimer.current = null;
                setPresented(false);
            }, 400);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (closeFallbackTimer.current) {
                    clearTimeout(closeFallbackTimer.current);
                    closeFallbackTimer.current = null;
                }
                if (finished) {
                    setPresented(false);
                }
            });
            return () => {
                if (closeFallbackTimer.current) {
                    clearTimeout(closeFallbackTimer.current);
                    closeFallbackTimer.current = null;
                }
                translateY.stopAnimation();
                backdropOpacity.stopAnimation();
                setPresented(false);
            };
        }
    }, [visible, translateY, backdropOpacity]);

    // Gesture: only on the handle bar
    const dragY = useRef(new Animated.Value(0)).current;

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: dragY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent;
            dragY.setValue(0);

            if (translationY > 80 || velocityY > 800) {
                requestDismiss();
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 9,
                }).start();
            }
        }
    };

    // Unmount Modal when fully dismissed. Use `visible || presented` so the first open frame still
    // mounts (useState(visible) can lag one frame vs parent `visible` after a prior close).
    // Fully unmounting avoids RN Modal `visible={false}` leaving a touch-blocking layer on some builds.
    if (!visible && !presented) {
        return null;
    }

    return (
        <Modal
            visible
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={requestDismiss}
        >
            {/* Backdrop - fills entire screen, behind the sheet */}
            <Animated.View
                style={[
                    styles.backdrop,
                    isOverlay && styles.backdropOverlay,
                    { opacity: backdropOpacity },
                ]}
                pointerEvents="box-none"
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={requestDismiss}
                />
            </Animated.View>

            {/* Use View, not KeyboardAvoidingView — KAV inside Modal often breaks taps / TextInput (iOS). */}
            <View style={styles.sheetContainer} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.sheet,
                        sheetHeightValue != null
                            ? {
                                  height: sheetHeightValue,
                                  maxHeight: sheetHeightValue,
                              }
                            : { maxHeight: maxHeightValue },
                        { transform: [{ translateY }] },
                    ]}
                >
                    {/* Drag Handle - gesture only applies here */}
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                        activeOffsetY={5}
                        failOffsetX={[-20, 20]}
                    >
                        <Animated.View style={styles.handleWrap}>
                            <TouchableOpacity
                                onPress={requestDismiss}
                                activeOpacity={0.6}
                                hitSlop={{ top: 12, bottom: 12, left: 80, right: 80 }}
                            >
                                <View style={styles.handle} />
                            </TouchableOpacity>
                        </Animated.View>
                    </PanGestureHandler>

                    {/* Optional Header with back button */}
                    {(title || showBackButton) && (
                        <View style={styles.header}>
                            {showBackButton ? (
                                <TouchableOpacity
                                    style={styles.headerBtn}
                                    onPress={requestDismiss}
                                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                >
                                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={22} color={colors.textPrimary} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.headerBtn} />
                            )}
                            {title && (
                                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                            )}
                            <View style={styles.headerBtn} />
                        </View>
                    )}

                    {/* Scrollable Content */}
                    <ScrollView
                        style={[styles.scroll, sheetHeightValue != null && styles.scrollFill]}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    >
                        {children}
                    </ScrollView>

                    {/* Optional Footer */}
                    {footer && (
                        <View style={styles.footer}>
                            {footer}
                        </View>
                    )}
                </Animated.View>
            </View>
            {/* Nested overlays rendered inside this Modal for proper iOS stacking */}
            {overlays}
        </Modal>
    );
}

const styles = StyleSheet.create({
    // Full-screen backdrop (separate from sheet so opacity only affects it)
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    backdropOverlay: {
        backgroundColor: colors.overlay,
    },
    // Container that pushes sheet to the bottom
    sheetContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: ui.radius.sheet,
        borderTopRightRadius: ui.radius.sheet,
        flexDirection: 'column',
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 16,
    },
    handleWrap: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        alignItems: 'center',
    },
    handle: {
        width: spacing.xxxl,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ui.cardPadding,
        paddingBottom: spacing.sm,
        minHeight: ui.buttonHeight,
    },
    headerBtn: {
        width: spacing.xxxl,
        height: spacing.xxxl,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
        textAlign: 'center',
    },
    scroll: {
        flexShrink: 1,
        paddingHorizontal: ui.cardPadding,
    },
    scrollFill: {
        flexGrow: 1,
        flexShrink: 1,
    },
    scrollContent: {
        paddingBottom: spacing.base,
    },
    footer: {
        paddingHorizontal: ui.cardPadding,
        paddingVertical: spacing.base,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
});
