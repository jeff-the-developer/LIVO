import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Alert02FreeIcons, CancelCircleFreeIcons, Tick02FreeIcons } from '@hugeicons/core-free-icons';
import Button from './Button';
import BottomSheet from './BottomSheet';
import ScreenHeader from './ScreenHeader';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

interface MethodOption {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
}

interface MethodSelectionHubProps {
    title: string;
    methods: MethodOption[];
    selectedMethod: string | null;
    onSelectMethod: (id: string) => void;
    onNext: () => void;
    nextDisabled: boolean;
    nextLabel?: string;
    onBackPress?: () => void;
    children?: React.ReactNode;
    notesVisible: boolean;
    onCloseNotes: () => void;
    notes: string[];
    checkedNotes: boolean[];
    onToggleNote: (index: number) => void;
    onUnderstand: () => void;
    canUnderstand: boolean;
    deniedVisible: boolean;
    onCloseDenied: () => void;
    onCompleteVerification: () => void;
    deniedMessage: string;
}

export default function MethodSelectionHub({
    title,
    methods,
    selectedMethod,
    onSelectMethod,
    onNext,
    nextDisabled,
    nextLabel = 'Next',
    onBackPress,
    children,
    notesVisible,
    onCloseNotes,
    notes,
    checkedNotes,
    onToggleNote,
    onUnderstand,
    canUnderstand,
    deniedVisible,
    onCloseDenied,
    onCompleteVerification,
    deniedMessage,
}: MethodSelectionHubProps): React.ReactElement {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScreenHeader
                title={title}
                onBackPress={onBackPress}
                showBackButton={!!onBackPress}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cardsContainer}>
                    {methods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.methodCard,
                                    isSelected && styles.methodCardSelected,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => onSelectMethod(method.id)}
                            >
                                <View style={styles.methodTextWrap}>
                                    <Text style={styles.methodTitle}>{method.title}</Text>
                                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                                </View>
                                <View style={styles.methodIconCircle}>
                                    <HugeiconsIcon icon={method.icon} size={29} color={colors.textPrimary} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {children}
            </ScrollView>

            <View style={styles.bottomBar}>
                <Button
                    label={nextLabel}
                    onPress={onNext}
                    disabled={nextDisabled}
                />
            </View>

            <BottomSheet
                visible={notesVisible}
                onClose={onCloseNotes}
                maxHeight="55%"
                footer={
                    <Button
                        label="I Understand"
                        onPress={onUnderstand}
                        disabled={!canUnderstand}
                    />
                }
            >
                <View style={styles.sheetContent}>
                    <View style={styles.warningCircle}>
                        <HugeiconsIcon icon={Alert02FreeIcons} size={24} color={colors.textPrimary} />
                    </View>
                    <Text style={styles.sheetTitle}>Important Notes</Text>
                    <View style={styles.notesList}>
                        {notes.map((note, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.noteRow}
                                activeOpacity={0.7}
                                onPress={() => onToggleNote(index)}
                            >
                                <Text style={styles.noteText}>{note}</Text>
                                <View
                                    style={[
                                        styles.checkbox,
                                        checkedNotes[index] && styles.checkboxChecked,
                                    ]}
                                >
                                    {checkedNotes[index] && (
                                        <HugeiconsIcon icon={Tick02FreeIcons} size={16} color={colors.textInverse} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </BottomSheet>

            <BottomSheet
                visible={deniedVisible}
                onClose={onCloseDenied}
                maxHeight="45%"
                footer={<Button label="Complete Verification" onPress={onCompleteVerification} />}
            >
                <View style={styles.sheetContent}>
                    <View style={styles.deniedCircle}>
                        <HugeiconsIcon icon={CancelCircleFreeIcons} size={24} color={colors.error} />
                    </View>
                    <Text style={styles.sheetTitle}>Access Denied</Text>
                    <Text style={styles.deniedSubtitle}>{deniedMessage}</Text>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.huge,
    },
    cardsContainer: {
        gap: spacing.sm + spacing.xs,
        marginTop: spacing.sm,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: ui.radius.field,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 102,
        paddingHorizontal: spacing.lg - 2,
        paddingVertical: spacing.md,
    },
    methodCardSelected: {
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    methodTextWrap: {
        flex: 1,
    },
    methodTitle: {
        ...typography.h4,
        color: colors.textPrimary,
    },
    methodSubtitle: {
        ...typography.bodySm,
        color: colors.textSecondary,
        marginTop: spacing.sm + 1,
    },
    methodIconCircle: {
        width: 59,
        height: 59,
        borderRadius: 30,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBar: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    sheetContent: {
        alignItems: 'center',
    },
    warningCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFF07F',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    deniedCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    sheetTitle: {
        ...typography.h1,
        color: colors.textPrimary,
        marginBottom: spacing.base,
    },
    notesList: {
        width: '100%',
        gap: spacing.sm + spacing.xs,
    },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 13,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
    },
    noteText: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.md,
    },
    checkboxChecked: {
        backgroundColor: colors.buttonPrimary,
        borderColor: colors.buttonPrimary,
    },
    deniedSubtitle: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.base,
    },
});
