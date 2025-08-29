// Google OAuth Service using the Google Identity Services API

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

interface GoogleAuthResponse {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  token?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
  user: GoogleUser;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  private readonly TOKEN_CACHE_KEY = 'tpstimeOAuthToken';

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  // Check if there's a valid cached token
  getCachedAuth(): GoogleAuthResponse | null {
    try {
      const cached = localStorage.getItem(this.TOKEN_CACHE_KEY);
      if (!cached) return null;

      const cachedToken: CachedToken = JSON.parse(cached);
      
      // Check if token is expired (with 5 minute buffer)
      if (Date.now() > (cachedToken.expiresAt - 5 * 60 * 1000)) {
        this.clearCachedAuth();
        return null;
      }

      return {
        success: true,
        user: cachedToken.user,
        token: cachedToken.token
      };
    } catch (error) {
      console.error('Error reading cached auth:', error);
      this.clearCachedAuth();
      return null;
    }
  }

  // Save auth token to cache
  saveAuthToCache(token: string, user: GoogleUser): void {
    try {
      const payload = this.parseJwt(token);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      
      const cachedToken: CachedToken = {
        token,
        expiresAt,
        user
      };

      localStorage.setItem(this.TOKEN_CACHE_KEY, JSON.stringify(cachedToken));
    } catch (error) {
      console.error('Error saving auth to cache:', error);
    }
  }

  // Clear cached auth
  clearCachedAuth(): void {
    localStorage.removeItem(this.TOKEN_CACHE_KEY);
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
              
              // Check if email is from the required domain
              const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';
              if (!payload.email.endsWith(requiredDomain)) {
                resolve({ 
                  success: false, 
                  error: `Please use your ${requiredDomain} Google account` 
                });
                return;
              }

              const user = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture
              };

              // Save token to cache
              this.saveAuthToCache(response.credential, user);

              resolve({
                success: true,
                user,
                token: response.credential
              });
            } catch (error) {
              resolve({ 
                success: false, 
                error: 'Failed to process authentication response' 
              });
            }
          }
        });

        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile, we'll render a button instead of using prompt()
          // The button rendering will be handled by the calling component
          resolve({ 
            success: false, 
            error: 'MOBILE_BUTTON_REQUIRED' 
          });
        } else {
          // For desktop, use the prompt
          window.google.accounts.id.prompt();
        }
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  // Initialize Google Auth and set up callback for mobile button
  async initializeForMobile(callback: (response: any) => void): Promise<boolean> {
    try {
      await this.initialize();

      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId || !window.google) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callback
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Auth for mobile:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    this.clearCachedAuth();
    
    // Also clear any Google session if available
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.warn('Error disabling Google auto-select:', error);
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

// Extend the Window interface to include google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: Element | null, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default GoogleAuthService;
