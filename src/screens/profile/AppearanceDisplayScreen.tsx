import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    GlobalFreeIcons,
    DollarCircleFreeIcons,
    CheckmarkCircle02FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import {
    useAppearanceSettings,
    useUpdateAppearanceSettings,
    handleApiError,
} from '@hooks/api/useSettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Sub-views ────────────────────────────────────────────────────────────────
type SubView = 'main' | 'language' | 'currency' | 'theme' | 'change_basis';

// ─── Currency Data ────────────────────────────────────────────────────────────
interface CurrencyOption {
    code: string;
    name: string;
    flag: string; // emoji flag
}

const CURRENCIES: CurrencyOption[] = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'HKD', name: 'HK Dollar', flag: '🇭🇰' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
];

// ─── Language Data ────────────────────────────────────────────────────────────
const LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Korean',
];

// ─── Shared Header ────────────────────────────────────────────────────────────
function Header({
    title,
    onBack,
    testID,
}: {
    title: string;
    onBack: () => void;
    testID: string;
}): React.ReactElement {
    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                testID={testID}
            >
                <HugeiconsIcon
                    icon={ArrowLeft01FreeIcons}
                    size={24}
                    color={colors.textPrimary}
                />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.headerSpacer} />
        </View>
    );
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}): React.ReactElement {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.sheet}>
                    <View style={modalStyles.handle} />
                    <View style={modalStyles.iconWrap}>
                        <HugeiconsIcon
                            icon={CheckmarkCircle02FreeIcons}
                            size={32}
                            color={colors.textPrimary}
                        />
                    </View>
                    <Text style={modalStyles.title}>Settings Successfully Set</Text>
                    <TouchableOpacity
                        style={modalStyles.closeBtn}
                        onPress={onClose}
                        activeOpacity={0.85}
                        testID="display-success-close"
                    >
                        <Text style={modalStyles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Display View ────────────────────────────────────────────────────────
function DisplayMenu({
    language,
    currency,
    theme,
    changeBasis,
    onNavigate,
}: {
    language: string;
    currency: string;
    theme: string;
    changeBasis: string;
    onNavigate: (view: SubView) => void;
}): React.ReactElement {
    const items = [
        {
            icon: GlobalFreeIcons,
            label: 'Language',
            value: language,
            view: 'language' as SubView,
            testID: 'display-language',
        },
        {
            icon: DollarCircleFreeIcons,
            label: 'Currency',
            value: currency,
            view: 'currency' as SubView,
            testID: 'display-currency',
        },
        {
            icon: GlobalFreeIcons,
            label: 'Theme',
            value: theme,
            view: 'theme' as SubView,
            testID: 'display-theme',
        },
        {
            icon: GlobalFreeIcons,
            label: 'Change Basis',
            value: changeBasis,
            view: 'change_basis' as SubView,
            testID: 'display-change-basis',
        },
    ];

    return (
        <View style={styles.menuList}>
            {items.map((item, idx) => (
                <View key={item.label}>
                    {idx > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                        style={styles.menuRow}
                        onPress={() => onNavigate(item.view)}
                        activeOpacity={0.6}
                        accessibilityLabel={item.label}
                        accessibilityRole="button"
                        testID={item.testID}
                    >
                        <View style={styles.menuLeft}>
                            <HugeiconsIcon
                                icon={item.icon}
                                size={22}
                                color={colors.textPrimary}
                            />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <Text style={styles.menuValue}>{item.value}</Text>
                            <HugeiconsIcon
                                icon={ArrowRight01FreeIcons}
                                size={18}
                                color={colors.textMuted}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

// ─── Currency Selection View ──────────────────────────────────────────────────
function CurrencyView({
    selected,
    onSelect,
    onBack,
}: {
    selected: string;
    onSelect: (code: string) => void;
    onBack: () => void;
}): React.ReactElement {
    const [picked, setPicked] = useState(selected);
    const [showSuccess, setShowSuccess] = useState(false);

    const onUpdate = () => {
        onSelect(picked);
        setShowSuccess(true);
    };

    return (
        <>
            <Header title="Select Currency" onBack={onBack} testID="currency-back" />
            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.listScroll}
                showsVerticalScrollIndicator={false}
            >
                {CURRENCIES.map((c) => (
                    <TouchableOpacity
                        key={c.code}
                        style={listStyles.row}
                        onPress={() => setPicked(c.code)}
                        activeOpacity={0.6}
                        testID={`currency-${c.code.toLowerCase()}`}
                    >
                        <View style={listStyles.flagWrap}>
                            <Text style={listStyles.flag}>{c.flag}</Text>
                        </View>
                        <Text style={listStyles.label}>
                            {c.name} ({c.code})
                        </Text>
                        <View
                            style={[
                                listStyles.checkbox,
                                picked === c.code && listStyles.checkboxActive,
                            ]}
                        >
                            {picked === c.code && (
                                <HugeiconsIcon
                                    icon={CheckmarkCircle02FreeIcons}
                                    size={22}
                                    color={colors.buttonText}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.updateBtn}
                    onPress={onUpdate}
                    activeOpacity={0.85}
                    testID="currency-update"
                >
                    <Text style={styles.updateBtnText}>Update Settings</Text>
                </TouchableOpacity>
            </View>
            <SuccessModal
                visible={showSuccess}
                onClose={() => {
                    setShowSuccess(false);
                    onBack();
                }}
            />
        </>
    );
}

// ─── Language Selection View ──────────────────────────────────────────────────
function LanguageView({
    selected,
    onSelect,
    onBack,
}: {
    selected: string;
    onSelect: (lang: string) => void;
    onBack: () => void;
}): React.ReactElement {
    const [picked, setPicked] = useState(selected);
    const [showSuccess, setShowSuccess] = useState(false);

    const onUpdate = () => {
        onSelect(picked);
        setShowSuccess(true);
    };

    return (
        <>
            <Header title="Select Language" onBack={onBack} testID="language-back" />
            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.listScroll}
                showsVerticalScrollIndicator={false}
            >
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang}
                        style={listStyles.row}
                        onPress={() => setPicked(lang)}
                        activeOpacity={0.6}
                        testID={`language-${lang.toLowerCase()}`}
                    >
                        <Text style={[listStyles.label, { flex: 1 }]}>{lang}</Text>
                        <View
                            style={[
                                listStyles.checkbox,
                                picked === lang && listStyles.checkboxActive,
                            ]}
                        >
                            {picked === lang && (
                                <HugeiconsIcon
                                    icon={CheckmarkCircle02FreeIcons}
                                    size={22}
                                    color={colors.buttonText}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.updateBtn}
                    onPress={onUpdate}
                    activeOpacity={0.85}
                    testID="language-update"
                >
                    <Text style={styles.updateBtnText}>Update Settings</Text>
                </TouchableOpacity>
            </View>
            <SuccessModal
                visible={showSuccess}
                onClose={() => {
                    setShowSuccess(false);
                    onBack();
                }}
            />
        </>
    );
}

// ─── Theme View ───────────────────────────────────────────────────────────────
function ThemeView({
    currentTheme,
    onUpdate,
    onBack,
}: {
    currentTheme: string;
    onUpdate: (theme: string) => void;
    onBack: () => void;
}): React.ReactElement {
    const isSystem = currentTheme === 'system';
    const isLight = currentTheme === 'light';

    const toggleSystem = (val: boolean) => {
        onUpdate(val ? 'system' : 'light');
    };

    const toggleLight = (val: boolean) => {
        onUpdate(val ? 'light' : 'system');
    };

    return (
        <>
            <Header title="Theme" onBack={onBack} testID="theme-back" />
            <View style={styles.themeList}>
                <View style={styles.themeRow}>
                    <View style={styles.themeContent}>
                        <Text style={styles.themeLabel}>System Theme</Text>
                        <Text style={styles.themeSubtitle}>
                            Auto change based on system settings
                        </Text>
                    </View>
                    <Switch
                        value={isSystem}
                        onValueChange={toggleSystem}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                        testID="theme-system-toggle"
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.themeRow}>
                    <View style={styles.themeContent}>
                        <Text style={styles.themeLabel}>Light Mode</Text>
                        <Text style={styles.themeSubtitle}>
                            Switch to light theme
                        </Text>
                    </View>
                    <Switch
                        value={isLight}
                        onValueChange={toggleLight}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                        testID="theme-light-toggle"
                    />
                </View>
            </View>
        </>
    );
}

// ─── Change Basis View ────────────────────────────────────────────────────────
function ChangeBasisView({
    currentBasis,
    onUpdate,
    onBack,
}: {
    currentBasis: string;
    onUpdate: (basis: string) => void;
    onBack: () => void;
}): React.ReactElement {
    const isUTC = currentBasis === 'utc';
    const is24h = currentBasis === '24h';

    const toggleUTC = (val: boolean) => {
        onUpdate(val ? 'utc' : '24h');
    };

    const toggle24h = (val: boolean) => {
        onUpdate(val ? '24h' : 'utc');
    };

    return (
        <>
            <Header title="Change Basis" onBack={onBack} testID="basis-back" />
            <View style={styles.themeList}>
                <View style={styles.themeRow}>
                    <View style={styles.themeContent}>
                        <Text style={styles.themeLabel}>UTC+2 0:00</Text>
                        <Text style={styles.themeSubtitle}>
                            Based on local time 0:00
                        </Text>
                    </View>
                    <Switch
                        value={isUTC}
                        onValueChange={toggleUTC}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                        testID="basis-utc-toggle"
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.themeRow}>
                    <View style={styles.themeContent}>
                        <Text style={styles.themeLabel}>Last 24 Hours</Text>
                        <Text style={styles.themeSubtitle}>
                            Based on quote 24hrs earlier
                        </Text>
                    </View>
                    <Switch
                        value={is24h}
                        onValueChange={toggle24h}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.background}
                        testID="basis-24h-toggle"
                    />
                </View>
            </View>
        </>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AppearanceDisplayScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: settings, isLoading } = useAppearanceSettings();
    const updateMutation = useUpdateAppearanceSettings();

    const [subView, setSubView] = useState<SubView>('main');

    const onUpdate = (update: Parameters<typeof updateMutation.mutate>[0]) => {
        updateMutation.mutate(update, {
            onError: (err) => {
                Alert.alert('Error', handleApiError(err).message);
            },
        });
    };

    // Derive display values
    const currencyName = useMemo(() => {
        const c = CURRENCIES.find((c) => c.code === (settings?.currency_display ?? 'USD'));
        return c?.name ?? 'US Dollar';
    }, [settings?.currency_display]);

    const themeLabel = useMemo(() => {
        switch (settings?.theme) {
            case 'system':
                return 'Linked';
            case 'dark':
                return 'Dark';
            case 'light':
            default:
                return 'Light';
        }
    }, [settings?.theme]);

    const basisLabel = useMemo(() => {
        return (settings as any)?.change_basis === 'utc' ? 'UTC' : 'Last 24h';
    }, [(settings as any)?.change_basis]);

    const onGoBack = () => {
        if (subView === 'main') {
            navigation.goBack();
        } else {
            setSubView('main');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <Header title="Display" onBack={() => navigation.goBack()} testID="display-back" />
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {subView === 'main' && (
                <>
                    <Header title="Display" onBack={onGoBack} testID="display-back" />
                    <DisplayMenu
                        language={settings?.language ?? 'English'}
                        currency={currencyName}
                        theme={themeLabel}
                        changeBasis={basisLabel}
                        onNavigate={setSubView}
                    />
                </>
            )}

            {subView === 'language' && (
                <LanguageView
                    selected={settings?.language ?? 'English'}
                    onSelect={(lang) => onUpdate({ language: lang })}
                    onBack={() => setSubView('main')}
                />
            )}

            {subView === 'currency' && (
                <CurrencyView
                    selected={settings?.currency_display ?? 'USD'}
                    onSelect={(code) => onUpdate({ currency_display: code as any })}
                    onBack={() => setSubView('main')}
                />
            )}

            {subView === 'theme' && (
                <ThemeView
                    currentTheme={settings?.theme ?? 'system'}
                    onUpdate={(theme) => onUpdate({ theme: theme as any })}
                    onBack={() => setSubView('main')}
                />
            )}

            {subView === 'change_basis' && (
                <ChangeBasisView
                    currentBasis={(settings as any)?.change_basis ?? '24h'}
                    onUpdate={(basis) => onUpdate({ change_basis: basis } as any)}
                    onBack={() => setSubView('main')}
                />
            )}
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Header
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

    // Main menu
    menuList: {
        marginHorizontal: spacing.base,
        marginTop: spacing.sm,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.base,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    menuLabel: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    menuValue: {
        ...typography.bodySm,
        color: colors.textMuted,
    },
    divider: {
        height: 0.5,
        backgroundColor: colors.border,
    },

    // List scroll (currency/language)
    listScroll: {
        paddingHorizontal: spacing.base,
        paddingBottom: 100,
    },

    // Bottom bar
    bottomBar: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    updateBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },

    // Theme view
    themeList: {
        marginHorizontal: spacing.base,
        marginTop: spacing.sm,
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
    },
    themeContent: {
        flex: 1,
        marginRight: spacing.base,
    },
    themeLabel: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    themeSubtitle: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 4,
    },
});

// ─── List Styles (Currency / Language) ────────────────────────────────────────
const listStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        marginBottom: spacing.sm,
    },
    flagWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.base,
    },
    flag: {
        fontSize: 24,
    },
    label: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    checkbox: {
        marginLeft: 'auto',
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.textPrimary,
        borderColor: colors.textPrimary,
    },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.base,
        alignItems: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginBottom: spacing.lg,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.xl,
    },
    closeBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    closeBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
