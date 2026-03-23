import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import BottomSheet from '@components/common/BottomSheet';
import EmptyState from '@components/common/EmptyState';
import AssetRow from './AssetRow';
import { spacing } from '@theme/spacing';
import { colors } from '@theme/colors';

interface WalletAssetItem {
    symbol: string;
    name: string;
    price: string;
    change_24h: string;
    balance: string;
    icon_url?: string;
}

interface WalletAssetPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    assets: WalletAssetItem[];
    onSelect: (symbol: string, name: string) => void;
    isLoading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    isUnavailable?: boolean;
    unavailableTitle?: string;
    unavailableDescription?: string;
}

export default function WalletAssetPickerSheet({
    visible,
    onClose,
    title,
    assets,
    onSelect,
    isLoading = false,
    emptyTitle = 'No assets available',
    emptyDescription = 'Available wallet assets will show up here once they load.',
    isUnavailable = false,
    unavailableTitle = 'Assets unavailable',
    unavailableDescription = 'This selection is not available right now.',
}: WalletAssetPickerSheetProps): React.ReactElement {
    const hasAssets = assets.length > 0;

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            maxHeight="85%"
            title={title}
            showBackButton
        >
            <View style={styles.list}>
                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : isUnavailable ? (
                    <EmptyState
                        title={unavailableTitle}
                        description={unavailableDescription}
                        style={styles.empty}
                    />
                ) : hasAssets ? (
                    assets.map((asset) => (
                        <AssetRow
                            key={asset.symbol}
                            symbol={asset.symbol}
                            name={asset.name}
                            price={asset.price}
                            change24h={asset.change_24h}
                            balance={asset.balance}
                            usdValue={`${asset.balance} USD`}
                            iconUrl={asset.icon_url}
                            isHidden={false}
                            onPress={() => onSelect(asset.symbol, asset.name)}
                        />
                    ))
                ) : (
                    <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        style={styles.empty}
                    />
                )}
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: spacing.sm,
    },
    empty: {
        paddingVertical: spacing.xl,
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
});
