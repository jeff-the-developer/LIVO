module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@': './src',
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@hooks': './src/hooks',
                        '@stores': './src/stores',
                        '@api': './src/api',
                        '@theme': './src/theme',
                        '@utils': './src/utils',
                        '@app-types': './src/types',
                        '@config': './src/config',
                        '@assets': './src/assets',
                        '@i18n': './src/i18n/index',
                    },
                },
            ],
        ],
    };
};
