import React, { forwardRef } from 'react';
import type { TextInput } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01FreeIcons } from '@hugeicons/core-free-icons';
import Input from './Input';
import { colors } from '@theme/colors';
import { ui } from '@theme/ui';

interface SearchBarProps {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    /** Focus when sheet opens (pair with ref + useEffect if autoFocus does not re-run) */
    autoFocus?: boolean;
}

// Note: avoid `forwardRef<TextInput, Props>` — Metro/Babel can parse `<` as JSX and break.
const SearchBar = forwardRef(function SearchBar(
    {
        value,
        onChangeText,
        placeholder = 'Search',
        autoFocus = false,
    }: SearchBarProps,
    ref: React.Ref<TextInput>,
): React.ReactElement {
    return (
        <Input
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            autoFocus={autoFocus}
            blurOnSubmit={false}
            leftAdornment={
                <HugeiconsIcon
                    icon={Search01FreeIcons}
                    size={ui.iconSize.sm}
                    color={colors.textMuted}
                />
            }
            accessibilityLabel={placeholder}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
        />
    );
});

export default SearchBar;
