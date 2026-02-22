/**
 * Environment Configuration Utilities
 * Provides type-safe access to environment variables
 */

// ============================================================================
// Environment Variable Types
// ============================================================================

interface EnvConfig {
  // Application
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  port: number;

  // Database
  databaseUrl: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;

  // Redis
  redisUrl: string;
  redisHost: string;
  redisPort: number;

  // AI Services (Optional)
  openaiApiKey?: string;
  anthropicApiKey?: string;
  replicateApiToken?: string;

  // Storage (Optional)
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  s3Bucket?: string;

  // Authentication (Optional)
  nextauthUrl?: string;
  nextauthSecret?: string;
}

// ============================================================================
// Environment Variable Helpers
// ============================================================================

/**
 * Get a required environment variable
 * Throws an error if the variable is not set
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable
 * Returns undefined if the variable is not set
 */
function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get an environment variable with a default value
 */
function getEnvWithDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Parse an environment variable as a number
 */
function parseNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return parsed;
}

/**
 * Validate that a value is one of the allowed values
 */
function validateEnum<T extends string>(value: string, allowedValues: readonly T[]): T {
  if (allowedValues.includes(value as T)) {
    return value as T;
  }
  throw new Error(`Invalid value "${value}". Allowed values: ${allowedValues.join(', ')}`);
}

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Get the complete environment configuration
 */
export function getEnv(): EnvConfig {
  const nodeEnv = getEnvWithDefault('NODE_ENV', 'development');
  const validatedNodeEnv = validateEnum(nodeEnv, ['development', 'production', 'test'] as const);

  return {
    // Application
    nodeEnv: validatedNodeEnv,
    apiUrl: getEnvWithDefault('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
    port: parseNumberEnv('PORT', 3000),

    // Database
    databaseUrl: getEnvWithDefault(
      'DATABASE_URL',
      'postgresql://photoidentifier:photoidentifier_dev_password@localhost:5432/photoidentifier'
    ),
    databaseHost: getEnvWithDefault('DATABASE_HOST', 'localhost'),
    databasePort: parseNumberEnv('DATABASE_PORT', 5432),
    databaseName: getEnvWithDefault('DATABASE_NAME', 'photoidentifier'),
    databaseUser: getEnvWithDefault('DATABASE_USER', 'photoidentifier'),
    databasePassword: getEnvWithDefault('DATABASE_PASSWORD', 'photoidentifier_dev_password'),

    // Redis
    redisUrl: getEnvWithDefault('REDIS_URL', 'redis://localhost:6379'),
    redisHost: getEnvWithDefault('REDIS_HOST', 'localhost'),
    redisPort: parseNumberEnv('REDIS_PORT', 6379),

    // AI Services (Optional)
    openaiApiKey: getOptionalEnv('OPENAI_API_KEY'),
    anthropicApiKey: getOptionalEnv('ANTHROPIC_API_KEY'),
    replicateApiToken: getOptionalEnv('REPLICATE_API_TOKEN'),

    // Storage (Optional)
    awsAccessKeyId: getOptionalEnv('AWS_ACCESS_KEY_ID'),
    awsSecretAccessKey: getOptionalEnv('AWS_SECRET_ACCESS_KEY'),
    awsRegion: getOptionalEnv('AWS_REGION'),
    s3Bucket: getOptionalEnv('S3_BUCKET'),

    // Authentication (Optional)
    nextauthUrl: getOptionalEnv('NEXTAUTH_URL'),
    nextauthSecret: getOptionalEnv('NEXTAUTH_SECRET'),
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Validate that all required environment variables are set
 */
export function validateEnv(requiredKeys: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get a summary of the current environment configuration (for logging)
 * Excludes sensitive values like API keys and passwords
 */
export function getEnvSummary(): Record<string, string | number | boolean> {
  const env = getEnv();
  return {
    nodeEnv: env.nodeEnv,
    port: env.port,
    databaseHost: env.databaseHost,
    databasePort: env.databasePort,
    databaseName: env.databaseName,
    redisHost: env.redisHost,
    redisPort: env.redisPort,
    hasOpenaiKey: !!env.openaiApiKey,
    hasAnthropicKey: !!env.anthropicApiKey,
    hasReplicateToken: !!env.replicateApiToken,
    hasAwsCredentials: !!(env.awsAccessKeyId && env.awsSecretAccessKey),
    hasNextauthConfig: !!(env.nextauthUrl && env.nextauthSecret),
  };
}
