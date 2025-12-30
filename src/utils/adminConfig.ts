/**
 * Admin Account Configuration
 * 
 * These credentials are absolute and immutable.
 * The admin account cannot be modified, deleted, or duplicated.
 */

export const ADMIN_CONFIG = {
  UUID: 'YCW-158-KA-4678',
  USERNAME: 'UserAdministrator123',
  PASSWORD: 'Admin123', // Default password (hashed in storage)
} as const;

/**
 * Check if a UUID is the admin UUID
 */
export function isAdminUUID(uuid: string): boolean {
  return uuid === ADMIN_CONFIG.UUID;
}

/**
 * Check if a username is the admin username
 */
export function isAdminUsername(username: string): boolean {
  return username === ADMIN_CONFIG.USERNAME;
}

/**
 * Check if credentials match admin account
 */
export function isAdminAccount(userId: string, username: string): boolean {
  return userId === ADMIN_CONFIG.UUID && username === ADMIN_CONFIG.USERNAME;
}
