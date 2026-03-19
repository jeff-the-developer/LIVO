import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowDown01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import BottomSheet from '@components/common/BottomSheet';

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRange = 'All Dates' | 'Custom date range';
type FilterType =
    | 'All'
    | 'Online Usage'
    | 'Offline Usage'
    | 'ATM Withdrawals'
    | 'VISA Payments'
    | 'Account Deposit and Withdrawal';

interface OrderFilterState {
    dateRange: DateRange;
    startYear: number;
    startMonth: number;
    endYear: number;
    endMonth: number;
    filterType: FilterType;
}

const FILTER_TYPES: FilterType[] = [
    'All',
    'Online Usage',
    'Offline Usage',
    'ATM Withdrawals',
    'VISA Payments',
    'Account Deposit and Withdrawal',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// ─── Date Picker Sheet (iOS-style wheel) ──────────────────────────────────────
function DatePickerSheet({
    visible,
    onClose,
    onConfirm,
    initialYear,
    initialMonth,
}: {
    visible: boolean;
    onClose: () => void;
    onConfirm: (year: number, month: number) => void;
    initialYear: number;
    initialMonth: number;
}) {
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <View style={dpStyles.container}>
                {/* Column headers */}
                <View style={dpStyles.headerRow}>
                    <Text style={dpStyles.headerLabel}>Year</Text>
                    <Text style={dpStyles.headerLabel}>Month</Text>
                </View>

                {/* Picker wheels */}
                <View style={dpStyles.pickerRow}>
                    <Picker
                        selectedValue={year}
                        onValueChange={(v) => setYear(v)}
                        style={dpStyles.picker}
                        itemStyle={dpStyles.pickerItem}
                    >
                        {YEARS.map((y) => (
                            <Picker.Item key={y} label={String(y)} value={y} />
                        ))}
                    </Picker>
                    <Picker
                        selectedValue={month}
                        onValueChange={(v) => setMonth(v)}
                        style={dpStyles.picker}
                        itemStyle={dpStyles.pickerItem}
                    >
                        {MONTHS.map((m) => (
                            <Picker.Item
                                key={m}
                                label={String(m).padStart(2, '0')}
                                value={m}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Confirm Date */}
                <TouchableOpacity
                    style={dpStyles.confirmBtn}
                    onPress={() => { onConfirm(year, month); onClose(); }}
                    activeOpacity={0.85}
                    accessibilityLabel="Confirm Date"
                    testID="datepicker-confirm"
                >
                    <Text style={dpStyles.confirmBtnText}>Confirm Date</Text>
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity
                    style={dpStyles.cancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                    accessibilityLabel="Cancel"
                    testID="datepicker-cancel"
                >
                    <Text style={dpStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}

// ─── Dropdown Row (Custom) ────────────────────────────────────────────────────
function DropdownRow({
    label,
    placeholder,
    onPress,
}: {
    label?: string;
    placeholder?: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={ofStyles.dropdownRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[ofStyles.dropdownText, !label && ofStyles.dropdownPlaceholder]}>
                {label || placeholder || 'Select'}
            </Text>
            <HugeiconsIcon icon={ArrowDown01FreeIcons} size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function OrderFilterSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const [filter, setFilter] = useState<OrderFilterState>({
        dateRange: 'All Dates',
        startYear: CURRENT_YEAR,
        startMonth: 1,
        endYear: CURRENT_YEAR,
        endMonth: 12,
        filterType: 'All',
    });

    const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

    const isCustom = filter.dateRange === 'Custom date range';

    const onReset = () => {
        setFilter({
            dateRange: 'All Dates',
            startYear: CURRENT_YEAR,
            startMonth: 1,
            endYear: CURRENT_YEAR,
            endMonth: 12,
            filterType: 'All',
        });
    };

    const onConfirmFilter = () => {
        // Apply filter logic here — for now just close
        onClose();
    };

    const formatDate = (y: number, m: number) =>
        `${String(m).padStart(2, '0')}/${y}`;

    return (
        <>
            <BottomSheet visible={visible} onClose={onClose}>
                <View style={ofStyles.container}>
                    {/* Header */}
                    <View style={ofStyles.header}>
                        <Text style={ofStyles.title}>Order Filter</Text>
                        <TouchableOpacity
                            style={ofStyles.resetBtn}
                            onPress={onReset}
                            activeOpacity={0.7}
                            accessibilityLabel="Reset filters"
                            testID="filter-reset"
                        >
                            <Text style={ofStyles.resetText}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Currency / Date Range */}
                    <Text style={ofStyles.sectionLabel}>Currency</Text>
                    <DropdownRow
                        label={filter.dateRange}
                        onPress={() =>
                            setFilter((f) => ({
                                ...f,
                                dateRange:
                                    f.dateRange === 'All Dates'
                                        ? 'Custom date range'
                                        : 'All Dates',
                            }))
                        }
                    />

                    {/* Custom date range fields */}
                    {isCustom && (
                        <>
                            <DropdownRow
                                label={formatDate(filter.startYear, filter.startMonth)}
                                placeholder="Select start date"
                                onPress={() => setShowDatePicker('start')}
                            />
                            <DropdownRow
                                label={formatDate(filter.endYear, filter.endMonth)}
                                placeholder="Select end date"
                                onPress={() => setShowDatePicker('end')}
                            />
                        </>
                    )}

                    {/* Type */}
                    <Text style={[ofStyles.sectionLabel, { marginTop: spacing.lg }]}>Type</Text>
                    <View style={ofStyles.pillWrap}>
                        {FILTER_TYPES.map((ft) => (
                            <TouchableOpacity
                                key={ft}
                                style={[
                                    ofStyles.pill,
                                    filter.filterType === ft && ofStyles.pillActive,
                                ]}
                                onPress={() => setFilter((f) => ({ ...f, filterType: ft }))}
                                activeOpacity={0.7}
                                accessibilityLabel={`Filter ${ft}`}
                                testID={`filter-type-${ft.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                                <Text
                                    style={[
                                        ofStyles.pillText,
                                        filter.filterType === ft && ofStyles.pillTextActive,
                                    ]}
                                >
                                    {ft}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Confirm Filter */}
                    <TouchableOpacity
                        style={ofStyles.confirmBtn}
                        onPress={onConfirmFilter}
                        activeOpacity={0.85}
                        accessibilityLabel="Confirm Filter"
                        testID="filter-confirm"
                    >
                        <Text style={ofStyles.confirmBtnText}>Confirm Filter</Text>
                    </TouchableOpacity>

                    {/* Cancel */}
                    <TouchableOpacity
                        style={ofStyles.cancelBtn}
                        onPress={onClose}
                        activeOpacity={0.7}
                        accessibilityLabel="Cancel"
                        testID="filter-cancel"
                    >
                        <Text style={ofStyles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>

            {/* Date Picker (shown on top of filter) */}
            <DatePickerSheet
                visible={showDatePicker !== null}
                onClose={() => setShowDatePicker(null)}
                initialYear={
                    showDatePicker === 'start' ? filter.startYear : filter.endYear
                }
                initialMonth={
                    showDatePicker === 'start' ? filter.startMonth : filter.endMonth
                }
                onConfirm={(y, m) => {
                    if (showDatePicker === 'start') {
                        setFilter((f) => ({ ...f, startYear: y, startMonth: m }));
                    } else {
                        setFilter((f) => ({ ...f, endYear: y, endMonth: m }));
                    }
                }}
            />
        </>
    );
}

// ─── Order Filter Styles ──────────────────────────────────────────────────────
const ofStyles = StyleSheet.create({
    container: {
        paddingBottom: spacing.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
    },
    resetBtn: {
        backgroundColor: '#F0FFF4',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
    },
    resetText: {
        ...typography.bodySm,
        color: '#1DB954',
        fontWeight: '600',
    },
    sectionLabel: {
        ...typography.bodySm,
        color: colors.textMuted,
        fontWeight: '500',
        marginBottom: spacing.sm,
    },
    dropdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.card,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.md,
    },
    dropdownText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    dropdownPlaceholder: {
        color: colors.textMuted,
    },
    pillWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xxl,
    },
    pill: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pillActive: {
        borderColor: '#1DB954',
        backgroundColor: '#F0FFF4',
    },
    pillText: {
        ...typography.bodySm,
        color: colors.textMuted,
        fontWeight: '500',
    },
    pillTextActive: {
        color: '#1DB954',
        fontWeight: '600',
    },
    confirmBtn: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    confirmBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
    cancelBtn: {
        backgroundColor: '#F5F5F5',
        borderRadius: borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelBtnText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});

// ─── Date Picker Styles ───────────────────────────────────────────────────────
const dpStyles = StyleSheet.create({
    container: {
        paddingBottom: spacing.base,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.md,
    },
    headerLabel: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    pickerRow: {
        flexDirection: 'row',
        height: 200,
    },
    picker: {
        flex: 1,
    },
    pickerItem: {
        ...typography.bodyLg,
        color: colors.textPrimary,
    },
    confirmBtn: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    confirmBtnText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '600',
    },
    cancelBtn: {
        backgroundColor: '#F5F5F5',
        borderRadius: borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelBtnText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
