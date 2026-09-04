export const DEVELOPMENT_DATABASE_URL = 'postgresql://profile:profile@localhost:5432/profile?schema=public';

export default () => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    logLevel: process.env.LOG_LEVEL ?? 'info',
  },
  database: {
    url: process.env.DATABASE_URL ?? DEVELOPMENT_DATABASE_URL,
  },
});
