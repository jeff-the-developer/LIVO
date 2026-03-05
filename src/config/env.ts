export const ENV = {
    BASE_URL: 'https://api.livopay.com/v1',
    MOCK_MODE: true,
    ENVIRONMENT: 'development',
} as const;

export type Environment = typeof ENV;
