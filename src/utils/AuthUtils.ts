import TokenCache from './TokenCache';

/**
 * Authentication utilities for debugging and manual cache management
 */
export class AuthUtils {
  /**
   * Check current authentication status
   */
  static getAuthStatus() {
    const isValid = TokenCache.isValidCachedToken();
    const user = TokenCache.getCachedUser();
    const tokens = TokenCache.getCachedTokens();
    
    return {
      isAuthenticated: isValid,
      user,
      tokenInfo: tokens ? {
        expiresAt: new Date(tokens.expiresAt).toISOString(),
        timeUntilExpiry: Math.max(0, tokens.expiresAt - Date.now()),
        needsRefresh: TokenCache.needsRefresh()
      } : null
    };
  }

  /**
   * Clear all authentication data (useful for debugging)
   */
  static clearAllAuth() {
    // Clear token cache
    TokenCache.clearTokens();
    
    // Clear session storage
    sessionStorage.removeItem('tpstimeAuthed');
    sessionStorage.removeItem('tpstimeUser');
    
    console.log('All authentication data cleared');
  }

  /**
   * Log current auth status to console (useful for debugging)
   */
  static logAuthStatus() {
    const status = this.getAuthStatus();
    console.group('🔐 Authentication Status');
    console.log('Authenticated:', status.isAuthenticated);
    console.log('User:', status.user);
    console.log('Token Info:', status.tokenInfo);
    console.groupEnd();
  }

  /**
   * Force a token refresh check
   */
  static checkTokenRefresh(): boolean {
    return TokenCache.needsRefresh();
  }
}

// Make these available globally for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).AuthUtils = AuthUtils;
  (window as any).clearAuth = () => AuthUtils.clearAllAuth();
  (window as any).authStatus = () => AuthUtils.logAuthStatus();
}

export default AuthUtils;
