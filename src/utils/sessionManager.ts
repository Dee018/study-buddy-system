// Legacy sessionManager removed.
// The application now uses Supabase Auth as the single source of truth for sessions.
// This module intentionally throws when imported to prevent accidental reintroduction
// of local session fallbacks. Use `AuthContext` (`useAuth()`) or `AuthService` instead.

function notSupported(): never {
  throw new Error('sessionManager has been removed. Use AuthContext/useAuth or AuthService (Supabase) for session management.');
}

export const sessionManager = {
  createSession: notSupported,
  authenticateUser: notSupported,
  resetPasswordWithUUID: notSupported,
  updateActivity: notSupported,
  endSession: notSupported,
  getSessionInfo: notSupported,
  isSessionActive: notSupported,
  restoreSession: notSupported,
  getAllActiveSessions: notSupported
};