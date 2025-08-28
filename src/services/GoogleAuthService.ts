// Google OAuth Service using the Google Identity Services API
import TokenCache from '../utils/TokenCache';

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

interface GoogleAuthResponse {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  fromCache?: boolean;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isInitialized = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<GoogleAuthResponse> {
    try {
      // First check if we have a valid cached token
      if (TokenCache.isValidCachedToken()) {
        const cachedUser = TokenCache.getCachedUser();
        if (cachedUser) {
          return {
            success: true,
            user: cachedUser,
            fromCache: true
          };
        }
      }

      await this.initialize();

      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return { success: false, error: 'Google Client ID not configured' };
      }

      return new Promise((resolve) => {
        if (!window.google) {
          resolve({ success: false, error: 'Google Identity Services not loaded' });
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            try {
              // Decode the JWT token to get user info
              const payload = this.parseJwt(response.credential);
              
              // Check if email is from Trinity Prep
              if (!payload.email.endsWith('@trinityprep.org')) {
                resolve({ 
                  success: false, 
                  error: 'Please use your @trinityprep.org Google account' 
                });
                return;
              }

              const user = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture
              };

              // Cache the token for future use
              // Note: Google Identity Services provides JWT tokens, not traditional OAuth tokens
              // We'll store the user info and treat the JWT as our "access token"
              const expiresIn = payload.exp - payload.iat; // JWT expiration time
              TokenCache.storeTokens(
                response.credential,
                expiresIn,
                user
              );

              resolve({
                success: true,
                user,
                fromCache: false
              });
            } catch (error) {
              resolve({ 
                success: false, 
                error: 'Failed to process authentication response' 
              });
            }
          }
        });

        window.google.accounts.id.prompt();
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  /**
   * Check if user is currently authenticated (from cache or session)
   */
  isAuthenticated(): boolean {
    return TokenCache.isValidCachedToken();
  }

  /**
   * Get current user from cache
   */
  getCurrentUser(): GoogleUser | null {
    return TokenCache.getCachedUser();
  }

  /**
   * Sign out and clear all cached tokens
   */
  signOut(): void {
    TokenCache.clearTokens();
    
    // Also clear any Google session
    if (window.google?.accounts?.id) {
      try {
        // Cancel any ongoing auth prompts
        (window.google.accounts.id as any).cancel?.();
      } catch (error) {
        console.warn('Failed to cancel Google auth prompt:', error);
      }
    }
  }

  renderSignInButton(elementId: string): void {
    if (!window.google) return;

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      { 
        theme: 'outline', 
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular'
      }
    );
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}

export default GoogleAuthService;
