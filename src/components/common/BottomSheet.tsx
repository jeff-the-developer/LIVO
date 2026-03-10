import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: string | number;
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
    title,
    showBackButton = false,
    isOverlay = false,
    footer,
    overlays,
}: BottomSheetProps): React.ReactElement {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const maxHeightValue = typeof maxHeight === 'string'
        ? maxHeight.includes('%')
            ? (SCREEN_HEIGHT * parseInt(maxHeight.replace('%', ''))) / 100
            : parseInt(maxHeight)
        : maxHeight;

    useEffect(() => {
        if (visible) {
            // Spring physics for natural slide-up feel
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
        } else {
            // Reset position when hidden
            translateY.setValue(SCREEN_HEIGHT);
            backdropOpacity.setValue(0);
        }
    }, [visible]);

    // Animate slide down then call onClose
    const slideDown = () => {
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
        ]).start(() => onClose());
    };

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
                slideDown();
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

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={slideDown}
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
                    onPress={slideDown}
                />
            </Animated.View>

            {/* Sheet at bottom - separate from backdrop so it's not affected by opacity */}
            <KeyboardAvoidingView
                style={styles.sheetContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                pointerEvents="box-none"
            >
                <Animated.View
                    style={[
                        styles.sheet,
                        { maxHeight: maxHeightValue, transform: [{ translateY }] },
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
                                onPress={slideDown}
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
                                    onPress={slideDown}
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
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
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
            </KeyboardAvoidingView>
            {/* Nested overlays rendered inside this Modal for proper iOS stacking */}
            {overlays}
        </Modal>
    );
}

const styles = StyleSheet.create({
    // Full-screen backdrop (separate from sheet so opacity only affects it)
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    // Container that pushes sheet to the bottom
    sheetContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
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
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.sm,
        minHeight: 44,
    },
    headerBtn: {
        width: 44,
        height: 44,
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
        paddingHorizontal: spacing.base,
    },
    scrollContent: {
        paddingBottom: spacing.base,
    },
    footer: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
});
