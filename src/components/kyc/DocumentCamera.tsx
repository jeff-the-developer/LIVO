import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Camera01FreeIcons,
    FlipHorizontalFreeIcons,
    CheckmarkCircle02FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DocumentCameraProps {
    visible: boolean;
    documentType: 'id_front' | 'id_back' | 'passport' | 'business_license' | 'address_proof';
    onCapture: (imageUri: string) => void;
    onClose: () => void;
    testID?: string;
}

// ─── Document Instructions ────────────────────────────────────────────────────
const getDocumentInstructions = (type: DocumentCameraProps['documentType']) => {
    switch (type) {
        case 'id_front':
            return {
                title: 'ID Card - Front',
                instructions: [
                    'Place your ID card in the frame',
                    'Make sure all text is clearly visible',
                    'Avoid glare and shadows',
                    'Keep the card flat and steady',
                ],
            };
        case 'id_back':
            return {
                title: 'ID Card - Back',
                instructions: [
                    'Place the back of your ID card in the frame',
                    'Make sure all text is clearly visible',
                    'Avoid glare and shadows',
                    'Keep the card flat and steady',
                ],
            };
        case 'passport':
            return {
                title: 'Passport',
                instructions: [
                    'Place your passport photo page in the frame',
                    'Make sure all text is clearly visible',
                    'Avoid glare and shadows',
                    'Keep the passport flat and open',
                ],
            };
        case 'business_license':
            return {
                title: 'Business License',
                instructions: [
                    'Place your business license in the frame',
                    'Make sure all text is clearly visible',
                    'Avoid glare and shadows',
                    'Keep the document flat',
                ],
            };
        case 'address_proof':
            return {
                title: 'Address Proof',
                instructions: [
                    'Place your address proof document in the frame',
                    'Make sure all text is clearly visible',
                    'Avoid glare and shadows',
                    'Keep the document flat',
                ],
            };
        default:
            return {
                title: 'Document',
                instructions: ['Place your document in the frame'],
            };
    }
};

export default function DocumentCamera({
    visible,
    documentType,
    onCapture,
    onClose,
    testID,
}: DocumentCameraProps): React.ReactElement {
    const [type, setType] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [isCapturing, setIsCapturing] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    const { title, instructions } = getDocumentInstructions(documentType);

    React.useEffect(() => {
        if (visible && !permission?.granted) {
            requestPermission();
        }
    }, [visible, permission]);

    const flipCamera = () => {
        setType(
            type === 'back'
                ? 'front'
                : 'back'
        );
    };

    const takePicture = async () => {
        if (!cameraRef.current || isCapturing) return;

        try {
            setIsCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: true,
                skipProcessing: false,
            });
            
            onCapture(photo.uri);
        } catch (error) {
            Alert.alert('Error', 'Failed to capture image. Please try again.');
            console.error('Camera capture error:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    if (!visible) return <></>;

    if (!permission) {
        return (
            <Modal visible={visible} transparent={false}>
                <SafeAreaView style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Requesting camera permission...</Text>
                </SafeAreaView>
            </Modal>
        );
    }

    if (!permission?.granted) {
        return (
            <Modal visible={visible} transparent={false}>
                <SafeAreaView style={styles.errorContainer}>
                    <Text style={styles.errorText}>No access to camera</Text>
                    <Text style={styles.errorHint}>
                        Please grant camera permission in your device settings to continue.
                    </Text>
                    <TouchableOpacity
                        style={styles.errorBtn}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.errorBtnText}>Close</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent={false}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* ─── Header ──────────────────────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={onClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Close camera"
                        accessibilityRole="button"
                        testID={`${testID}-close`}
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01FreeIcons}
                            size={24}
                            color={colors.textInverse}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity
                        style={styles.flipBtn}
                        onPress={flipCamera}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Flip camera"
                        accessibilityRole="button"
                        testID={`${testID}-flip`}
                    >
                        <HugeiconsIcon
                            icon={FlipHorizontalFreeIcons}
                            size={24}
                            color={colors.textInverse}
                        />
                    </TouchableOpacity>
                </View>

                {/* ─── Camera View ────────────────────────────────── */}
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing={type}
                        ref={cameraRef}
                    >
                        {/* Document Frame Overlay */}
                        <View style={styles.overlay}>
                            <View style={styles.frameContainer}>
                                <View style={styles.frame}>
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                </View>
                            </View>
                        </View>
                    </CameraView>
                </View>

                {/* ─── Instructions ───────────────────────────────── */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>Position your document</Text>
                    {instructions.map((instruction, index) => (
                        <Text key={index} style={styles.instructionItem}>
                            • {instruction}
                        </Text>
                    ))}
                </View>

                {/* ─── Controls ───────────────────────────────────── */}
                <View style={styles.controls}>
                    <View style={styles.controlsInner}>
                        <View style={styles.placeholderBtn} />
                        
                        <TouchableOpacity
                            style={[
                                styles.captureBtn,
                                isCapturing && styles.captureBtnDisabled,
                            ]}
                            onPress={takePicture}
                            disabled={isCapturing}
                            activeOpacity={0.8}
                            accessibilityLabel="Take picture"
                            accessibilityRole="button"
                            testID={`${testID}-capture`}
                        >
                            {isCapturing ? (
                                <ActivityIndicator size="small" color={colors.textInverse} />
                            ) : (
                                <HugeiconsIcon
                                    icon={Camera01FreeIcons}
                                    size={32}
                                    color={colors.textInverse}
                                />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.helpBtn}
                            onPress={() => {
                                Alert.alert(
                                    'Tips for better photos',
                                    '• Ensure good lighting\n• Keep the camera steady\n• Make sure all text is readable\n• Avoid shadows and glare',
                                    [{ text: 'OK' }]
                                );
                            }}
                            accessibilityLabel="Camera tips"
                            accessibilityRole="button"
                        >
                            <Text style={styles.helpText}>?</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.textPrimary,
    },
    
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        gap: spacing.base,
    },
    loadingText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
    },

    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.xl,
    },
    errorText: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    errorHint: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xl,
    },
    errorBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    errorBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backBtn: {
        width: 36,
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textInverse,
        fontWeight: '700',
    },
    flipBtn: {
        width: 36,
        alignItems: 'flex-end',
    },

    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },

    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    frameContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    frame: {
        width: '100%',
        aspectRatio: 1.6, // Credit card aspect ratio
        position: 'relative',
        maxWidth: 320,
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: colors.textInverse,
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },

    instructionsContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    instructionsTitle: {
        ...typography.bodyMd,
        color: colors.textInverse,
        fontWeight: '600',
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    instructionItem: {
        ...typography.caption,
        color: colors.textInverse,
        opacity: 0.8,
        lineHeight: 16,
        textAlign: 'center',
    },

    controls: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.base,
    },
    controlsInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    placeholderBtn: {
        width: 44,
    },
    captureBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.textInverse,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    captureBtnDisabled: {
        opacity: 0.6,
    },
    helpBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpText: {
        ...typography.bodyMd,
        color: colors.textInverse,
        fontWeight: '700',
    },
});