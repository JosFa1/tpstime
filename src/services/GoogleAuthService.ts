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
      await this.initialize();

      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return { success: false, error: 'Google Client ID not configured' };
      }

      const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';

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
              
              // Check if email ends with required domain from env
              if (!payload.email.endsWith(requiredDomain)) {
                resolve({ 
                  success: false, 
                  error: `Please use your ${requiredDomain} school account to sign in` 
                });
                return;
              }

              resolve({
                success: true,
                user: {
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture
                }
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
        };
      };
    };
  }
}

export default GoogleAuthService;
