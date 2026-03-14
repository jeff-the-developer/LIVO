import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Camera01FreeIcons,
    FileAttachmentFreeIcons,
    CheckmarkCircle02FreeIcons,
    Delete02FreeIcons,
} from '@hugeicons/core-free-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useSubmitKYCLevel3, handleApiError } from '@hooks/api/useKYC';
import { uploadFile } from '@api/upload';
import DocumentCamera from '@components/kyc/DocumentCamera';

type Nav = NativeStackNavigationProp<AppStackParamList>;

interface DocFile {
    uri: string;
    name: string;
}

export default function KYC3VerifyScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const mutation = useSubmitKYCLevel3();

    const [docs, setDocs] = useState<DocFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    const isValid = docs.length > 0;
    const isSubmitting = mutation.isPending || isUploading;

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
                multiple: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                const newDocs = result.assets.map((f) => ({ uri: f.uri, name: f.name ?? 'document' }));
                setDocs((prev) => [...prev, ...newDocs]);
            }
        } catch {
            Alert.alert('Error', 'Failed to select file. Please try again.');
        }
    };

    const onCameraCapture = (imageUri: string) => {
        const name = imageUri.split('/').pop() ?? 'photo.jpg';
        setDocs((prev) => [...prev, { uri: imageUri, name }]);
        setShowCamera(false);
    };

    const removeDoc = (index: number) => {
        setDocs((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async () => {
        if (!isValid) return;
        try {
            setIsUploading(true);
            const fileIds = await Promise.all(
                docs.map(async (doc) => {
                    const ext = doc.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
                    const mimeType = ext === 'pdf' ? 'application/pdf' : `image/${ext}`;
                    const { file_id } = await uploadFile(doc.uri, mimeType);
                    return file_id;
                }),
            );
            setIsUploading(false);

            mutation.mutate(
                { enhanced_docs: fileIds },
                {
                    onSuccess: () => {
                        Alert.alert(
                            'Submitted',
                            'Your documents are under review. We will notify you once verification is complete.',
                            [{ text: 'OK', onPress: () => navigation.goBack() }],
                        );
                    },
                    onError: (err) => Alert.alert('Error', handleApiError(err).message),
                },
            );
        } catch (err) {
            setIsUploading(false);
            Alert.alert('Upload Failed', handleApiError(err).message);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Level 3</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Upload enhanced due diligence documents. Add multiple documents to support your application.
                </Text>

                {/* Uploaded docs list */}
                {docs.map((doc, idx) => (
                    <View key={idx} style={uploadStyles.uploaded}>
                        <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} size={22} color={colors.success} />
                        <Text style={uploadStyles.uploadedName} numberOfLines={1}>{doc.name}</Text>
                        <TouchableOpacity onPress={() => removeDoc(idx)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <HugeiconsIcon icon={Delete02FreeIcons} size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Add document zone */}
                <View style={uploadStyles.zone}>
                    <HugeiconsIcon icon={FileAttachmentFreeIcons} size={28} color={colors.textMuted} />
                    <Text style={uploadStyles.uploadText}>
                        {docs.length === 0 ? 'Add Enhanced Due Diligence Documents' : 'Add More Documents'}
                    </Text>
                    <View style={uploadStyles.uploadButtons}>
                        <TouchableOpacity
                            style={uploadStyles.uploadBtn}
                            onPress={() => setShowCamera(true)}
                            activeOpacity={0.7}
                        >
                            <HugeiconsIcon icon={Camera01FreeIcons} size={16} color={colors.textInverse} />
                            <Text style={uploadStyles.uploadBtnText}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[uploadStyles.uploadBtn, uploadStyles.uploadBtnSecondary]}
                            onPress={pickFile}
                            activeOpacity={0.7}
                        >
                            <HugeiconsIcon icon={FileAttachmentFreeIcons} size={16} color={colors.textPrimary} />
                            <Text style={[uploadStyles.uploadBtnText, uploadStyles.uploadBtnTextSecondary]}>Files</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: spacing.xl }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, (!isValid || isSubmitting) && styles.btnDisabled]}
                    onPress={onSubmit}
                    disabled={!isValid || isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.buttonText} />
                    ) : (
                        <Text style={styles.submitText}>Submit for Review</Text>
                    )}
                </TouchableOpacity>
            </View>

            <DocumentCamera
                visible={showCamera}
                documentType="address_proof"
                onCapture={onCameraCapture}
                onClose={() => setShowCamera(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, gap: spacing.base, paddingBottom: spacing.base },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, paddingHorizontal: spacing.base },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: { flex: 1, textAlign: 'center', ...typography.h4, color: colors.textPrimary, fontWeight: '700' },
    headerSpacer: { width: 36 },
    description: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 20 },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, paddingTop: spacing.sm },
    submitBtn: { backgroundColor: colors.buttonPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
    btnDisabled: { opacity: 0.4 },
    submitText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

const uploadStyles = StyleSheet.create({
    zone: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, borderRadius: borderRadius.card, paddingVertical: spacing.xl, alignItems: 'center', gap: spacing.xs },
    uploadText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },
    uploadButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.buttonPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.sm, paddingHorizontal: spacing.base, gap: spacing.xs },
    uploadBtnSecondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    uploadBtnText: { ...typography.caption, color: colors.textInverse, fontWeight: '600' },
    uploadBtnTextSecondary: { color: colors.textPrimary },
    uploaded: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.green50, borderRadius: borderRadius.card, borderWidth: 1, borderColor: colors.success, paddingVertical: spacing.sm, paddingHorizontal: spacing.base, gap: spacing.sm },
    uploadedName: { flex: 1, ...typography.bodySm, color: colors.textPrimary, fontWeight: '500' },
});
