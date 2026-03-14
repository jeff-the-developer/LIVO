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
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    FileAttachmentFreeIcons,
    Camera01FreeIcons,
    CheckmarkCircle02FreeIcons,
} from '@hugeicons/core-free-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import {
    useSubmitKYCLevel1Individual,
    useSubmitKYCLevel1Corporate,
    handleApiError,
} from '@hooks/api/useKYC';
import { uploadFile } from '@api/upload';
import OptionPicker from '@components/common/OptionPicker';
import DocumentCamera from '@components/kyc/DocumentCamera';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type RouteProps = NativeStackScreenProps<AppStackParamList, 'KYC1Verify'>['route'];

// ─── Shared sub-components ────────────────────────────────────────────────────
function TextField({
    label,
    value,
    placeholder,
    onChangeText,
    testID,
    keyboardType,
}: {
    label: string;
    value: string;
    placeholder: string;
    onChangeText: (v: string) => void;
    testID: string;
    keyboardType?: 'default' | 'number-pad';
}): React.ReactElement {
    return (
        <View style={fieldStyles.group}>
            <Text style={fieldStyles.label}>{label}</Text>
            <TextInput
                style={fieldStyles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType ?? 'default'}
                accessibilityLabel={label}
                testID={testID}
            />
        </View>
    );
}

function SelectorField({
    label,
    value,
    placeholder,
    onPress,
    testID,
}: {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    testID: string;
}): React.ReactElement {
    return (
        <View style={fieldStyles.group}>
            {!!label && <Text style={fieldStyles.label}>{label}</Text>}
            <TouchableOpacity
                style={fieldStyles.selectorBtn}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityLabel={label || placeholder}
                accessibilityRole="button"
                testID={testID}
            >
                <Text style={[fieldStyles.selectorText, !value && fieldStyles.selectorPlaceholder]}>
                    {value || placeholder}
                </Text>
                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

function FileUploadZone({
    label,
    fileName,
    onCameraPress,
    onFilePress,
    testID,
}: {
    label: string;
    fileName: string | null;
    onCameraPress: () => void;
    onFilePress?: () => void;
    testID: string;
}): React.ReactElement {
    if (fileName) {
        return (
            <View style={fieldStyles.group}>
                <Text style={fieldStyles.label}>{label}</Text>
                <View style={uploadStyles.uploaded}>
                    <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} size={22} color={colors.success} />
                    <Text style={uploadStyles.uploadedName} numberOfLines={1}>{fileName}</Text>
                    <TouchableOpacity onPress={onCameraPress} activeOpacity={0.7} testID={`${testID}-change`}>
                        <Text style={uploadStyles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={fieldStyles.group}>
            <Text style={fieldStyles.label}>{label}</Text>
            <View style={uploadStyles.zone}>
                <HugeiconsIcon icon={FileAttachmentFreeIcons} size={28} color={colors.textMuted} />
                <Text style={uploadStyles.uploadText}>Upload File</Text>
                <View style={uploadStyles.uploadButtons}>
                    <TouchableOpacity
                        style={uploadStyles.uploadBtn}
                        onPress={onCameraPress}
                        activeOpacity={0.7}
                        testID={`${testID}-camera`}
                    >
                        <HugeiconsIcon icon={Camera01FreeIcons} size={16} color={colors.textInverse} />
                        <Text style={uploadStyles.uploadBtnText}>Camera</Text>
                    </TouchableOpacity>
                    {onFilePress && (
                        <TouchableOpacity
                            style={[uploadStyles.uploadBtn, uploadStyles.uploadBtnSecondary]}
                            onPress={onFilePress}
                            activeOpacity={0.7}
                            testID={`${testID}-file`}
                        >
                            <HugeiconsIcon icon={FileAttachmentFreeIcons} size={16} color={colors.textPrimary} />
                            <Text style={[uploadStyles.uploadBtnText, uploadStyles.uploadBtnTextSecondary]}>Files</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ─── Corporate Form ───────────────────────────────────────────────────────────
interface CorporateForm {
    entityName: string;
    regNumber: string;
    registrationFileUri: string | null;
    registrationFileName: string | null;
    dateOfEstablishment: string;
    mainBusiness: string;
    registeredAddress: string;
}

const INITIAL_CORPORATE: CorporateForm = {
    entityName: '',
    regNumber: '',
    registrationFileUri: null,
    registrationFileName: null,
    dateOfEstablishment: '',
    mainBusiness: '',
    registeredAddress: '',
};

// ─── Individual Form ──────────────────────────────────────────────────────────
interface IndividualForm {
    fullName: string;
    nationality: string;
    idType: string;
    idNumber: string;
    idFrontUri: string | null;
    idFrontName: string | null;
    idBackUri: string | null;
    idBackName: string | null;
    selfieUri: string | null;
    selfieName: string | null;
}

const INITIAL_INDIVIDUAL: IndividualForm = {
    fullName: '',
    nationality: '',
    idType: '',
    idNumber: '',
    idFrontUri: null,
    idFrontName: null,
    idBackUri: null,
    idBackName: null,
    selfieUri: null,
    selfieName: null,
};

const ID_TYPES = ['Passport', 'National ID', 'Driver\'s License'];
const idTypeToApiValue = (label: string): 'passport' | 'national_id' | 'drivers_license' => {
    if (label === 'Passport') return 'passport';
    if (label === 'Driver\'s License') return 'drivers_license';
    return 'national_id';
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function KYC1VerifyScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteProps>();
    const { accountType } = route.params;

    const corporateMutation = useSubmitKYCLevel1Corporate();
    const individualMutation = useSubmitKYCLevel1Individual();

    const [corpForm, setCorpForm] = useState<CorporateForm>(INITIAL_CORPORATE);
    const [indForm, setIndForm] = useState<IndividualForm>(INITIAL_INDIVIDUAL);
    const [isUploading, setIsUploading] = useState(false);

    const [pickerConfig, setPickerConfig] = useState<{
        visible: boolean;
        title: string;
        options: string[];
        onSelect: (val: string) => void;
    }>({ visible: false, title: '', options: [], onSelect: () => {} });

    type CameraTarget =
        | 'corp_registration'
        | 'ind_id_front'
        | 'ind_id_back'
        | 'ind_selfie';
    const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null);

    const openPicker = (title: string, options: string[], onSelect: (val: string) => void) => {
        setPickerConfig({ visible: true, title, options, onSelect });
    };
    const closePicker = () => setPickerConfig((p) => ({ ...p, visible: false }));

    // ─── Document picker (files) ───────────────────────────────────────────────
    const pickFile = async (onPicked: (uri: string, name: string) => void) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                onPicked(file.uri, file.name ?? 'document');
            }
        } catch {
            Alert.alert('Error', 'Failed to select file. Please try again.');
        }
    };

    // ─── Camera capture ────────────────────────────────────────────────────────
    const onCameraCapture = (imageUri: string) => {
        const fileName = imageUri.split('/').pop() ?? 'photo.jpg';
        switch (cameraTarget) {
            case 'corp_registration':
                setCorpForm((p) => ({ ...p, registrationFileUri: imageUri, registrationFileName: fileName }));
                break;
            case 'ind_id_front':
                setIndForm((p) => ({ ...p, idFrontUri: imageUri, idFrontName: fileName }));
                break;
            case 'ind_id_back':
                setIndForm((p) => ({ ...p, idBackUri: imageUri, idBackName: fileName }));
                break;
            case 'ind_selfie':
                setIndForm((p) => ({ ...p, selfieUri: imageUri, selfieName: fileName }));
                break;
        }
        setCameraTarget(null);
    };

    // ─── Upload helper ────────────────────────────────────────────────────────
    const upload = async (uri: string): Promise<string> => {
        const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeType = ext === 'pdf' ? 'application/pdf' : `image/${ext}`;
        const result = await uploadFile(uri, mimeType);
        return result.file_id;
    };

    // ─── Corporate submit ─────────────────────────────────────────────────────
    const isCorporateValid =
        corpForm.entityName.trim().length > 0 &&
        corpForm.regNumber.trim().length > 0 &&
        corpForm.registrationFileUri !== null &&
        corpForm.dateOfEstablishment.trim().length > 0 &&
        corpForm.mainBusiness.trim().length > 0 &&
        corpForm.registeredAddress.trim().length > 0;

    const onSubmitCorporate = async () => {
        if (!isCorporateValid || !corpForm.registrationFileUri) return;
        try {
            setIsUploading(true);
            const regFileId = await upload(corpForm.registrationFileUri);
            setIsUploading(false);

            corporateMutation.mutate(
                {
                    entity_name: corpForm.entityName.trim(),
                    reg_number: corpForm.regNumber.trim(),
                    registration_file: regFileId,
                    date_of_establishment: corpForm.dateOfEstablishment,
                    main_business: corpForm.mainBusiness,
                    registered_address: corpForm.registeredAddress,
                },
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

    // ─── Individual submit ────────────────────────────────────────────────────
    const isIndividualValid =
        indForm.fullName.trim().length > 0 &&
        indForm.nationality.trim().length > 0 &&
        indForm.idType.trim().length > 0 &&
        indForm.idNumber.trim().length > 0 &&
        indForm.idFrontUri !== null &&
        indForm.idBackUri !== null &&
        indForm.selfieUri !== null;

    const onSubmitIndividual = async () => {
        if (!isIndividualValid || !indForm.idFrontUri || !indForm.idBackUri || !indForm.selfieUri) return;
        try {
            setIsUploading(true);
            const [idFrontId, idBackId, selfieId] = await Promise.all([
                upload(indForm.idFrontUri),
                upload(indForm.idBackUri),
                upload(indForm.selfieUri),
            ]);
            setIsUploading(false);

            individualMutation.mutate(
                {
                    full_name: indForm.fullName.trim(),
                    nationality: indForm.nationality,
                    id_type: idTypeToApiValue(indForm.idType),
                    id_number: indForm.idNumber.trim(),
                    id_front: idFrontId,
                    id_back: idBackId,
                    selfie: selfieId,
                },
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

    const isCorporate = accountType === 'corporate';
    const isSubmitting = corporateMutation.isPending || individualMutation.isPending || isUploading;
    const isValid = isCorporate ? isCorporateValid : isIndividualValid;
    const onSubmit = isCorporate ? onSubmitCorporate : onSubmitIndividual;

    // Camera document type for the current target
    const cameraDocType = (() => {
        switch (cameraTarget) {
            case 'corp_registration': return 'business_license' as const;
            case 'ind_id_front': return 'id_front' as const;
            case 'ind_id_back': return 'id_back' as const;
            case 'ind_selfie': return 'selfie' as const;
            default: return 'business_license' as const;
        }
    })();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ──────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="kyc1-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isCorporate ? 'Corporate KYC1' : 'Individual KYC1'}
                </Text>
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
                    {isCorporate ? (
                        // ─── Corporate Form ────────────────────────────────
                        <>
                            <TextField
                                label="Entity Name"
                                value={corpForm.entityName}
                                placeholder="Legal entity name (English only)"
                                onChangeText={(v) => setCorpForm((p) => ({ ...p, entityName: v }))}
                                testID="kyc1-entity-name"
                            />
                            <TextField
                                label="Registration Number"
                                value={corpForm.regNumber}
                                placeholder="Company registration number"
                                onChangeText={(v) => setCorpForm((p) => ({ ...p, regNumber: v }))}
                                testID="kyc1-reg-number"
                            />
                            <FileUploadZone
                                label="Registration Certificate"
                                fileName={corpForm.registrationFileName}
                                onCameraPress={() => setCameraTarget('corp_registration')}
                                onFilePress={() =>
                                    pickFile((uri, name) =>
                                        setCorpForm((p) => ({
                                            ...p,
                                            registrationFileUri: uri,
                                            registrationFileName: name,
                                        }))
                                    )
                                }
                                testID="kyc1-reg-file"
                            />
                            <SelectorField
                                label="Date of Establishment"
                                value={corpForm.dateOfEstablishment}
                                placeholder="Select"
                                onPress={() =>
                                    openPicker(
                                        'Date of Establishment',
                                        ['2015 or earlier', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                                        (val) => {
                                            setCorpForm((p) => ({ ...p, dateOfEstablishment: val }));
                                            closePicker();
                                        },
                                    )
                                }
                                testID="kyc1-date"
                            />
                            <SelectorField
                                label="Main Business"
                                value={corpForm.mainBusiness}
                                placeholder="Select"
                                onPress={() =>
                                    openPicker(
                                        'Main Business',
                                        ['Technology', 'Finance', 'Trading', 'Consulting', 'Real Estate', 'Other'],
                                        (val) => {
                                            setCorpForm((p) => ({ ...p, mainBusiness: val }));
                                            closePicker();
                                        },
                                    )
                                }
                                testID="kyc1-business"
                            />
                            <TextField
                                label="Registered Address"
                                value={corpForm.registeredAddress}
                                placeholder="Full registered business address"
                                onChangeText={(v) => setCorpForm((p) => ({ ...p, registeredAddress: v }))}
                                testID="kyc1-reg-address"
                            />
                        </>
                    ) : (
                        // ─── Individual Form ───────────────────────────────
                        <>
                            <TextField
                                label="Full Legal Name"
                                value={indForm.fullName}
                                placeholder="As shown on your ID document"
                                onChangeText={(v) => setIndForm((p) => ({ ...p, fullName: v }))}
                                testID="kyc1-full-name"
                            />
                            <SelectorField
                                label="Nationality"
                                value={indForm.nationality}
                                placeholder="Select nationality"
                                onPress={() =>
                                    openPicker(
                                        'Nationality',
                                        ['US', 'GB', 'HK', 'SG', 'CA', 'AU', 'Other'],
                                        (val) => {
                                            setIndForm((p) => ({ ...p, nationality: val }));
                                            closePicker();
                                        },
                                    )
                                }
                                testID="kyc1-nationality"
                            />
                            <SelectorField
                                label="ID Type"
                                value={indForm.idType}
                                placeholder="Select ID type"
                                onPress={() =>
                                    openPicker('ID Type', ID_TYPES, (val) => {
                                        setIndForm((p) => ({ ...p, idType: val }));
                                        closePicker();
                                    })
                                }
                                testID="kyc1-id-type"
                            />
                            <TextField
                                label="ID Number"
                                value={indForm.idNumber}
                                placeholder="Document number"
                                onChangeText={(v) => setIndForm((p) => ({ ...p, idNumber: v }))}
                                testID="kyc1-id-number"
                            />
                            <FileUploadZone
                                label="ID Front"
                                fileName={indForm.idFrontName}
                                onCameraPress={() => setCameraTarget('ind_id_front')}
                                testID="kyc1-id-front"
                            />
                            <FileUploadZone
                                label="ID Back"
                                fileName={indForm.idBackName}
                                onCameraPress={() => setCameraTarget('ind_id_back')}
                                testID="kyc1-id-back"
                            />
                            <FileUploadZone
                                label="Selfie"
                                fileName={indForm.selfieName}
                                onCameraPress={() => setCameraTarget('ind_selfie')}
                                testID="kyc1-selfie"
                            />
                        </>
                    )}

                    <View style={{ height: spacing.xl }} />
                </ScrollView>

                {/* ─── Submit Button ──────────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextBtn, (!isValid || isSubmitting) && styles.btnDisabled]}
                        onPress={onSubmit}
                        activeOpacity={0.85}
                        disabled={!isValid || isSubmitting}
                        accessibilityLabel="Submit"
                        accessibilityRole="button"
                        testID="kyc1-submit"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.nextText}>Submit for Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <OptionPicker
                visible={pickerConfig.visible}
                title={pickerConfig.title}
                options={pickerConfig.options}
                onSelect={pickerConfig.onSelect}
                onClose={closePicker}
            />

            <DocumentCamera
                visible={cameraTarget !== null}
                documentType={cameraDocType}
                onCapture={onCameraCapture}
                onClose={() => setCameraTarget(null)}
                testID="kyc1-camera"
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        gap: spacing.base,
        paddingBottom: spacing.base,
    },
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
    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
    },
    nextBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    btnDisabled: { opacity: 0.4 },
    nextText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});

const fieldStyles = StyleSheet.create({
    group: {},
    label: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        ...typography.bodyMd,
        color: colors.textPrimary,
        backgroundColor: colors.background,
    },
    selectorBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    selectorText: { flex: 1, ...typography.bodyMd, color: colors.textPrimary },
    selectorPlaceholder: { color: colors.textMuted },
});

const uploadStyles = StyleSheet.create({
    zone: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingVertical: spacing.xl,
        alignItems: 'center',
        gap: spacing.xs,
    },
    uploadText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500' },
    uploadButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        gap: spacing.xs,
    },
    uploadBtnSecondary: {
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
    },
    uploadBtnText: { ...typography.caption, color: colors.textInverse, fontWeight: '600' },
    uploadBtnTextSecondary: { color: colors.textPrimary },
    uploaded: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.green50,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.success,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
    },
    uploadedName: {
        flex: 1,
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    changeBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
