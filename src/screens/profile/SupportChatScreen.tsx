import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    PlusSignFreeIcons,
    ArrowUp01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_gradient_icon.png');

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportChatScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [message, setMessage] = useState('');

    const onSend = () => {
        if (!message.trim()) return;
        // TODO: integrate with support chat API
        setMessage('');
    };

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="chat-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Client Support</Text>
                <View style={s.headerSpacer} />
            </View>

            {/* Empty State */}
            <View style={s.emptyArea}>
                <Image source={livoIcon} style={s.emptyIcon} resizeMode="contain" />
                <Text style={s.emptyText}>No Records</Text>
            </View>

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={s.inputBar}>
                    <TextInput
                        style={s.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Enter"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        returnKeyType="default"
                        accessibilityLabel="Message input"
                        testID="chat-input"
                    />
                    <View style={s.inputActions}>
                        <TouchableOpacity
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.7}
                            testID="chat-attach"
                        >
                            <HugeiconsIcon icon={PlusSignFreeIcons} size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            onPress={onSend}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            activeOpacity={0.7}
                            testID="chat-send"
                        >
                            <View style={[s.sendBtn, message.trim() ? s.sendBtnActive : null]}>
                                <HugeiconsIcon
                                    icon={ArrowUp01FreeIcons}
                                    size={18}
                                    color={message.trim() ? '#FFFFFF' : colors.textMuted}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.base, paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1, textAlign: 'center', ...typography.h4,
        color: colors.textPrimary, fontWeight: '700',
    },
    headerSpacer: { width: 36 },

    // Empty
    emptyArea: {
        flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60,
    },
    emptyIcon: { width: 80, height: 80, borderRadius: 20, marginBottom: spacing.base },
    emptyText: { ...typography.bodyMd, color: colors.textSecondary },

    // Input Bar
    inputBar: {
        backgroundColor: '#F2F2F2',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.base,
    },
    input: {
        ...typography.bodyMd, color: colors.textPrimary,
        minHeight: 24, maxHeight: 100, marginBottom: spacing.sm,
    },
    inputActions: {
        flexDirection: 'row', alignItems: 'center',
    },
    sendBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    sendBtnActive: {
        backgroundColor: colors.textPrimary,
    },
});
