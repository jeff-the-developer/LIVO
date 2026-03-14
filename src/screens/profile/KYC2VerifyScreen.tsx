import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
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
} from '@hugeicons/core-free-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useSubmitKYCLevel2, handleApiError } from '@hooks/api/useKYC';
import { uploadFile } from '@api/upload';
import OptionPicker from '@components/common/OptionPicker';
import DocumentCamera from '@components/kyc/DocumentCamera';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const SOURCE_OF_FUNDS_OPTIONS = [
    'Employment / Salary',
    'Business Income',
    'Investments',
    'Savings',
    'Inheritance / Gift',
    'Other',
];

export default function KYC2VerifyScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const mutation = useSubmitKYCLevel2();

    const [addressProofUri, setAddressProofUri] = useState<string | null>(null);
    const [addressProofName, setAddressProofName] = useState<string | null>(null);
    const [sourceOfFunds, setSourceOfFunds] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const isValid = addressProofUri !== null && sourceOfFunds.trim().length > 0;
    const isSubmitting = mutation.isPending || isUploading;

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                const file = result.assets[0];
                setAddressProofUri(file.uri);
                setAddressProofName(file.name ?? 'document');
            }
        } catch {
            Alert.alert('Error', 'Failed to select file. Please try again.');
        }
    };

    const onCameraCapture = (imageUri: string) => {
        setAddressProofUri(imageUri);
        setAddressProofName(imageUri.split('/').pop() ?? 'photo.jpg');
        setShowCamera(false);
    };

    const onSubmit = async () => {
        if (!isValid || !addressProofUri) return;
        try {
            setIsUploading(true);
            const ext = addressProofUri.split('.').pop()?.toLowerCase() ?? 'jpg';
            const mimeType = ext === 'pdf' ? 'application/pdf' : `image/${ext}`;
            const { file_id } = await uploadFile(addressProofUri, mimeType);
            setIsUploading(false);

            mutation.mutate(
                { address_proof: file_id, source_of_funds: sourceOfFunds },
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
                <Text style={styles.headerTitle}>KYC Level 2</Text>
                <View style={styles.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Address Proof */}
                    <View style={fieldStyles.group}>
                        <Text style={fieldStyles.label}>Address Proof</Text>
                        <Text style={fieldStyles.hint}>
                            Bank statement, utility bill, or government letter (dated within 3 months)
                        </Text>
                        {addressProofUri ? (
                            <View style={uploadStyles.uploaded}>
                                <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} size={22} color={colors.success} />
                                <Text style={uploadStyles.uploadedName} numberOfLines={1}>{addressProofName}</Text>
                                <TouchableOpacity onPress={() => { setAddressProofUri(null); setAddressProofName(null); }} activeOpacity={0.7}>
                                    <Text style={uploadStyles.changeBtnText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={uploadStyles.zone}>
                                <HugeiconsIcon icon={FileAttachmentFreeIcons} size={28} color={colors.textMuted} />
                                <Text style={uploadStyles.uploadText}>Upload Address Proof</Text>
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
                        )}
                    </View>

                    {/* Source of Funds */}
                    <View style={fieldStyles.group}>
                        <Text style={fieldStyles.label}>Source of Funds</Text>
                        <TouchableOpacity
                            style={fieldStyles.selectorBtn}
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[fieldStyles.selectorText, !sourceOfFunds && fieldStyles.selectorPlaceholder]}>
                                {sourceOfFunds || 'Select source of funds'}
                            </Text>
                        </TouchableOpacity>
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
            </KeyboardAvoidingView>

            <OptionPicker
                visible={showPicker}
                title="Source of Funds"
                options={SOURCE_OF_FUNDS_OPTIONS}
                onSelect={(val) => { setSourceOfFunds(val); setShowPicker(false); }}
                onClose={() => setShowPicker(false)}
            />

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
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, gap: spacing.lg, paddingBottom: spacing.base },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, paddingHorizontal: spacing.base },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: { flex: 1, textAlign: 'center', ...typography.h4, color: colors.textPrimary, fontWeight: '700' },
    headerSpacer: { width: 36 },
    footer: { paddingHorizontal: spacing.base, paddingBottom: spacing.base, paddingTop: spacing.sm },
    submitBtn: { backgroundColor: colors.buttonPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.base, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
    btnDisabled: { opacity: 0.4 },
    submitText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
});

const fieldStyles = StyleSheet.create({
    group: { gap: spacing.xs },
    label: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.xs },
    hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
    selectorBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
    selectorText: { flex: 1, ...typography.bodyMd, color: colors.textPrimary },
    selectorPlaceholder: { color: colors.textMuted },
});

const uploadStyles = StyleSheet.create({
    zone: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, borderRadius: borderRadius.card, paddingVertical: spacing.xl, alignItems: 'center', gap: spacing.xs },
    uploadText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500' },
    uploadButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.buttonPrimary, borderRadius: borderRadius.full, paddingVertical: spacing.sm, paddingHorizontal: spacing.base, gap: spacing.xs },
    uploadBtnSecondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    uploadBtnText: { ...typography.caption, color: colors.textInverse, fontWeight: '600' },
    uploadBtnTextSecondary: { color: colors.textPrimary },
    uploaded: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.green50, borderRadius: borderRadius.card, borderWidth: 1, borderColor: colors.success, paddingVertical: spacing.sm, paddingHorizontal: spacing.base, gap: spacing.sm },
    uploadedName: { flex: 1, ...typography.bodySm, color: colors.textPrimary, fontWeight: '500' },
    changeBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
