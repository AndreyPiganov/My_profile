import Joi from 'joi';
import { DEVELOPMENT_DATABASE_URL } from './configuration';

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly').default('info'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .default(DEVELOPMENT_DATABASE_URL),
}).unknown(true);

export function validateEnvironment(environment: Record<string, unknown>): Record<string, unknown> {
  const result = environmentSchema.validate(environment, {
    abortEarly: false,
    convert: true,
  }) as Joi.ValidationResult<Record<string, unknown>>;

  if (result.error) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  const validatedEnvironment: unknown = result.value;

  if (
    typeof validatedEnvironment !== 'object' ||
    validatedEnvironment === null ||
    Array.isArray(validatedEnvironment)
  ) {
    throw new Error('Environment validation returned an invalid value');
  }

  return { ...validatedEnvironment };
}
