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
    ArrowRight01FreeIcons,
    FileAttachmentFreeIcons,
    Camera01FreeIcons,
    CheckmarkCircle02FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useStartKYC, handleApiError } from '@hooks/api/useKYC';
import OptionPicker from '@components/common/OptionPicker';
import DocumentCamera from '@components/kyc/DocumentCamera';
// Mock document picker types and functions for now
interface DocumentPickerAsset {
    name: string;
    uri: string;
    size?: number;
    type?: string;
}

interface DocumentPickerResult {
    type: 'success' | 'cancel';
    canceled?: boolean;
    assets?: DocumentPickerAsset[];
}

const getDocumentAsync = async (options: any): Promise<DocumentPickerResult> => {
    // Mock implementation - would use expo-document-picker in production
    return { type: 'cancel', canceled: true };
};

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── KYC1 Form State ──────────────────────────────────────────────────────────
interface KYC1Form {
    entityName: string;
    regNumber: string;
    registrationFile: string | null;
    dateOfEstablishment: string;
    mainBusiness: string;
    registeredAddress: string;
    stateProvince: string;
    city: string;
    detailedAddress: string;
    zipCode: string;
}

const INITIAL_FORM: KYC1Form = {
    entityName: '',
    regNumber: '',
    registrationFile: null,
    dateOfEstablishment: '',
    mainBusiness: '',
    registeredAddress: '',
    stateProvince: '',
    city: '',
    detailedAddress: '',
    zipCode: '',
};

// ─── Reusable Text Field ──────────────────────────────────────────────────────
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

// ─── Reusable Selector Field (tap to open picker) ────────────────────────────
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
            <Text style={fieldStyles.label}>{label}</Text>
            <TouchableOpacity
                style={fieldStyles.selectorBtn}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityLabel={label}
                accessibilityRole="button"
                testID={testID}
            >
                <Text
                    style={[
                        fieldStyles.selectorText,
                        !value && fieldStyles.selectorPlaceholder,
                    ]}
                >
                    {value || placeholder}
                </Text>
                <HugeiconsIcon
                    icon={ArrowRight01FreeIcons}
                    size={18}
                    color={colors.textMuted}
                />
            </TouchableOpacity>
        </View>
    );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────
function FileUploadZone({
    hasFile,
    fileName,
    onCameraPress,
    onFilePress,
}: {
    hasFile: boolean;
    fileName?: string;
    onCameraPress: () => void;
    onFilePress: () => void;
}): React.ReactElement {
    if (hasFile && fileName) {
        return (
            <View style={fieldStyles.group}>
                <Text style={fieldStyles.label}>Registration File</Text>
                <View style={uploadStyles.uploadedContainer}>
                    <View style={uploadStyles.uploadedIcon}>
                        <HugeiconsIcon
                            icon={CheckmarkCircle02FreeIcons}
                            size={24}
                            color={colors.success}
                        />
                    </View>
                    <View style={uploadStyles.uploadedContent}>
                        <Text style={uploadStyles.uploadedText}>File uploaded</Text>
                        <Text style={uploadStyles.uploadedName}>{fileName}</Text>
                    </View>
                    <TouchableOpacity
                        style={uploadStyles.changeBtn}
                        onPress={onFilePress}
                        activeOpacity={0.7}
                        accessibilityLabel="Change file"
                        accessibilityRole="button"
                    >
                        <Text style={uploadStyles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={fieldStyles.group}>
            <Text style={fieldStyles.label}>Registration File</Text>
            <View style={uploadStyles.zone}>
                <View style={uploadStyles.iconWrap}>
                    <HugeiconsIcon
                        icon={FileAttachmentFreeIcons}
                        size={28}
                        color={colors.textMuted}
                    />
                </View>
                <Text style={uploadStyles.uploadText}>Upload File</Text>
                <Text style={uploadStyles.uploadHint}>
                    Business registration/certificate
                </Text>
                
                <View style={uploadStyles.uploadButtons}>
                    <TouchableOpacity
                        style={uploadStyles.uploadBtn}
                        onPress={onCameraPress}
                        activeOpacity={0.7}
                        accessibilityLabel="Take photo"
                        accessibilityRole="button"
                        testID="kyc1-camera"
                    >
                        <HugeiconsIcon
                            icon={Camera01FreeIcons}
                            size={18}
                            color={colors.textInverse}
                        />
                        <Text style={uploadStyles.uploadBtnText}>Camera</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[uploadStyles.uploadBtn, uploadStyles.uploadBtnSecondary]}
                        onPress={onFilePress}
                        activeOpacity={0.7}
                        accessibilityLabel="Choose from files"
                        accessibilityRole="button"
                        testID="kyc1-file"
                    >
                        <HugeiconsIcon
                            icon={FileAttachmentFreeIcons}
                            size={18}
                            color={colors.textPrimary}
                        />
                        <Text style={[uploadStyles.uploadBtnText, uploadStyles.uploadBtnTextSecondary]}>
                            Files
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function KYC1VerifyScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const startKYCMutation = useStartKYC();

    const [form, setForm] = useState<KYC1Form>(INITIAL_FORM);
    const [pickerConfig, setPickerConfig] = useState<{
        visible: boolean;
        title: string;
        options: string[];
        onSelect: (val: string) => void;
    }>({
        visible: false,
        title: '',
        options: [],
        onSelect: () => { },
    });
    const [showCamera, setShowCamera] = useState(false);

    const openPicker = (title: string, options: string[], onSelect: (val: string) => void) => {
        setPickerConfig({ visible: true, title, options, onSelect });
    };

    const closePicker = () => {
        setPickerConfig((prev) => ({ ...prev, visible: false }));
    };

    const update = (key: keyof KYC1Form) => (value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    // Check required fields
    const isValid =
        form.entityName.trim().length > 0 &&
        form.regNumber.trim().length > 0 &&
        form.city.trim().length > 0 &&
        form.zipCode.trim().length > 0;

    const onTakePhoto = () => {
        setShowCamera(true);
    };

    const onSelectFile = async () => {
        try {
            const result = await getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setForm((prev) => ({
                    ...prev,
                    registrationFile: file.name,
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select file. Please try again.');
        }
    };

    const onCameraCapture = (imageUri: string) => {
        // Extract filename from URI
        const fileName = imageUri.split('/').pop() || 'document.jpg';
        
        // NOTE: In production, you would upload the imageUri to your backend here
        // For now, just store the filename for UI demonstration
        setForm((prev) => ({
            ...prev,
            registrationFile: fileName,
        }));
        setShowCamera(false);
    };

    const onSelectDate = () => {
        const options = ['15/06/2019', '15/06/2020', '01/01/2021', '10/10/2022'];
        openPicker('Date of Establishment', options, (val) => {
            update('dateOfEstablishment')(val);
            closePicker();
        });
    };

    const onSelectBusiness = () => {
        const options = ['Technology', 'Finance', 'Trading', 'Consulting', 'Real Estate', 'Other'];
        openPicker('Main Business', options, (val) => {
            update('mainBusiness')(val);
            closePicker();
        });
    };

    const onSelectAddress = () => {
        const options = ['Hong Kong Office', 'Singapore HQ', 'London Branch', 'New York Corp'];
        openPicker('Registered Address', options, (val) => {
            update('registeredAddress')(val);
            closePicker();
        });
    };

    const onNext = () => {
        if (!isValid) return;

        startKYCMutation.mutate(
            { account_type: 'corporate' }, // or 'individual' based on previous screen
            {
                onSuccess: (data) => {
                    Alert.alert(
                        'KYC1 Submitted',
                        data.message ?? 'Your documents are under review. We will notify you once verification is complete.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }],
                    );
                },
                onError: (err) => {
                    Alert.alert('Error', handleApiError(err).message);
                },
            },
        );
    };

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
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC1 Verify</Text>
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
                    <TextField
                        label="Entity Name"
                        value={form.entityName}
                        placeholder="Please Enter (In English Only)"
                        onChangeText={update('entityName')}
                        testID="kyc1-entity-name"
                    />

                    <TextField
                        label="Reg No."
                        value={form.regNumber}
                        placeholder="Enter Registration Number"
                        onChangeText={update('regNumber')}
                        testID="kyc1-reg-number"
                    />

                    <FileUploadZone
                        hasFile={!!form.registrationFile}
                        fileName={form.registrationFile || undefined}
                        onCameraPress={onTakePhoto}
                        onFilePress={onSelectFile}
                    />

                    <SelectorField
                        label="Date of Establishment"
                        value={form.dateOfEstablishment}
                        placeholder="Select"
                        onPress={onSelectDate}
                        testID="kyc1-date"
                    />

                    <SelectorField
                        label="Main Business"
                        value={form.mainBusiness}
                        placeholder="Select"
                        onPress={onSelectBusiness}
                        testID="kyc1-business"
                    />

                    {/* ─── Registered Address ──────────────────── */}
                    <Text style={styles.sectionTitle}>Registered Address</Text>

                    <SelectorField
                        label=""
                        value={form.registeredAddress}
                        placeholder="Select Registered Address"
                        onPress={onSelectAddress}
                        testID="kyc1-reg-address"
                    />

                    <TextInput
                        style={fieldStyles.input}
                        value={form.stateProvince}
                        onChangeText={update('stateProvince')}
                        placeholder="State/Province"
                        placeholderTextColor={colors.textMuted}
                        accessibilityLabel="State or Province"
                        testID="kyc1-state"
                    />

                    <TextInput
                        style={fieldStyles.input}
                        value={form.city}
                        onChangeText={update('city')}
                        placeholder="City"
                        placeholderTextColor={colors.textMuted}
                        accessibilityLabel="City"
                        testID="kyc1-city"
                    />

                    <TextInput
                        style={fieldStyles.input}
                        value={form.detailedAddress}
                        onChangeText={update('detailedAddress')}
                        placeholder="Detailed Residential Address"
                        placeholderTextColor={colors.textMuted}
                        accessibilityLabel="Detailed Address"
                        testID="kyc1-detail-address"
                    />

                    <TextInput
                        style={fieldStyles.input}
                        value={form.zipCode}
                        onChangeText={update('zipCode')}
                        placeholder="Zip Code"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                        accessibilityLabel="Zip Code"
                        testID="kyc1-zip"
                    />

                    <View style={{ height: spacing.xl }} />
                </ScrollView>

                {/* ─── Next Button ──────────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.nextBtn,
                            (!isValid || startKYCMutation.isPending) && styles.btnDisabled,
                        ]}
                        onPress={onNext}
                        activeOpacity={0.85}
                        disabled={!isValid || startKYCMutation.isPending}
                        accessibilityLabel="Next"
                        accessibilityRole="button"
                        testID="kyc1-next"
                    >
                        {startKYCMutation.isPending ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.nextText}>Next</Text>
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
                visible={showCamera}
                documentType="business_license"
                onCapture={onCameraCapture}
                onClose={() => setShowCamera(false)}
                testID="kyc1-camera"
            />
        </SafeAreaView >
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
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

    sectionTitle: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '700',
        marginTop: spacing.xs,
    },

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

// ─── Field Styles ─────────────────────────────────────────────────────────────
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
    selectorText: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    selectorPlaceholder: {
        color: colors.textMuted,
    },
});

// ─── Upload Zone Styles ───────────────────────────────────────────────────────
const uploadStyles = StyleSheet.create({
    zone: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    iconWrap: {
        marginBottom: spacing.sm,
    },
    uploadText: {
        ...typography.bodyMd,
        color: colors.textMuted,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    uploadHint: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: spacing.base,
    },
    uploadButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
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
    uploadBtnText: {
        ...typography.caption,
        color: colors.textInverse,
        fontWeight: '600',
    },
    uploadBtnTextSecondary: {
        color: colors.textPrimary,
    },
    
    // Uploaded state
    uploadedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.green50,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.success,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
    },
    uploadedIcon: {
        marginRight: spacing.sm,
    },
    uploadedContent: {
        flex: 1,
    },
    uploadedText: {
        ...typography.caption,
        color: colors.success,
        fontWeight: '600',
        marginBottom: 2,
    },
    uploadedName: {
        ...typography.bodySm,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    changeBtn: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    changeBtnText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
});
