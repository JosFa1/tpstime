// Token cache utility for Google OAuth
interface CachedToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  user: {
    email: string;
    name: string;
    picture?: string;
  };
}

class TokenCache {
  private static readonly CACHE_KEY = 'tpstime_oauth_tokens';
  private static readonly TOKEN_BUFFER_MS = 5 * 60 * 1000; // 5 minutes buffer for token refresh

  /**
   * Store OAuth tokens in localStorage
   */
  static storeTokens(
    accessToken: string,
    expiresIn: number,
    user: { email: string; name: string; picture?: string },
    refreshToken?: string
  ): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    const cachedToken: CachedToken = {
      accessToken,
      refreshToken,
      expiresAt,
      tokenType: 'Bearer',
      user
    };

    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedToken));
    } catch (error) {
      console.error('Failed to store tokens in cache:', error);
    }
  }

  /**
   * Retrieve cached tokens from localStorage
   */
  static getCachedTokens(): CachedToken | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const tokens: CachedToken = JSON.parse(cached);
      
      // Check if token is expired
      if (this.isTokenExpired(tokens)) {
        this.clearTokens();
        return null;
      }

      return tokens;
    } catch (error) {
      console.error('Failed to retrieve cached tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Check if the current cached token is valid and not expired
   */
  static isValidCachedToken(): boolean {
    const tokens = this.getCachedTokens();
    return tokens !== null && !this.isTokenExpired(tokens);
  }

  /**
   * Check if token needs refresh (within buffer time)
   */
  static needsRefresh(): boolean {
    const tokens = this.getCachedTokens();
    if (!tokens) return false;
    
    const timeUntilExpiry = tokens.expiresAt - Date.now();
    return timeUntilExpiry <= this.TOKEN_BUFFER_MS;
  }

  /**
   * Update access token after refresh
   */
  static updateAccessToken(newAccessToken: string, expiresIn: number): void {
    const existingTokens = this.getCachedTokens();
    if (!existingTokens) return;

    existingTokens.accessToken = newAccessToken;
    existingTokens.expiresAt = Date.now() + (expiresIn * 1000);

    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(existingTokens));
    } catch (error) {
      console.error('Failed to update access token:', error);
    }
  }

  /**
   * Clear all cached tokens
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear cached tokens:', error);
    }
  }

  /**
   * Get the cached user info
   */
  static getCachedUser(): { email: string; name: string; picture?: string } | null {
    const tokens = this.getCachedTokens();
    return tokens?.user || null;
  }

  /**
   * Check if a token is expired
   */
  private static isTokenExpired(tokens: CachedToken): boolean {
    return Date.now() >= tokens.expiresAt;
  }

  /**
   * Get the current access token if valid
   */
  static getValidAccessToken(): string | null {
    const tokens = this.getCachedTokens();
    return tokens?.accessToken || null;
  }
}

export default TokenCache;
export type { CachedToken };
