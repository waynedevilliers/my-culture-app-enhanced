// Seed configuration, read from the environment.
// Seeds never contain or print passwords.

const MIN_PASSWORD_LENGTH = 12;

interface SeedAdminConfig {
  email: string;
  password: string;
}

/**
 * Read the super admin credentials for the seed script.
 * Throws when the password is missing or too short, so the seed never
 * falls back to a known default.
 */
export function readSeedAdminConfig(
  env: Record<string, string | undefined> = process.env
): SeedAdminConfig {
  const password = env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `SEED_ADMIN_PASSWORD must be set to at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }

  return {
    email: env.SEED_ADMIN_EMAIL || 'admin@myculture.app',
    password,
  };
}
