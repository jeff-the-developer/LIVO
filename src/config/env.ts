export const ENV = {
    BASE_URL: 'http://192.168.68.101:8080',
    MOCK_MODE: false,
    ENVIRONMENT: 'development',
} as const;

export type Environment = typeof ENV;
