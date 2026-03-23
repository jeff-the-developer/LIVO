import { useAppStore } from '@stores/appStore';
import type { DisplayMode, AssetTypeFilter } from '@stores/appStore';
import { formatAmount, getCurrencySymbol } from '@utils/currency';

export type { DisplayMode, AssetTypeFilter };

// ─── useDisplaySettings ───────────────────────────────────────────────────────
// Single hook to read all display preferences from the global store.
// Use this in any screen that needs to show currency amounts, apply theme,
// respect language, or use the change basis setting.
//
// Example usage:
//   const { formatAmount, currencySymbol, currency, changeBasis } = useDisplaySettings();
//   <Text>{formatAmount(1234.56)}</Text>  →  "$1,234.56"  (or "€1.234,56" if EUR selected)

export function useDisplaySettings() {
    const currency = useAppStore((s) => s.currency);
    const language = useAppStore((s) => s.language);
    const theme = useAppStore((s) => s.theme);
    const changeBasis = useAppStore((s) => s.changeBasis);
    const displayMode = useAppStore((s) => s.displayMode);
    const assetTypeFilter = useAppStore((s) => s.assetTypeFilter);
    const setCurrency = useAppStore((s) => s.setCurrency);
    const setDisplayMode = useAppStore((s) => s.setDisplayMode);
    const setAssetTypeFilter = useAppStore((s) => s.setAssetTypeFilter);

    return {
        currency,
        language,
        theme,
        changeBasis,
        displayMode,
        assetTypeFilter,
        setCurrency,
        setDisplayMode,
        setAssetTypeFilter,
        /** Pre-bound symbol for the selected currency e.g. "$", "€", "£" */
        currencySymbol: getCurrencySymbol(currency),
        /** Format a number using the selected currency e.g. formatAmount(1234) → "$1,234.00" */
        formatAmount: (amount: number) => formatAmount(amount, currency),
    } as const;
}
