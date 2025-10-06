// Google OAuth Service using redirect flow

import { generateGoogleAuthUrl, getUserInfoFromToken } from '../utils/auth';

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
    this.isInitialized = true;
    
    // Check if we already have a stored session
    return Promise.resolve();
  }

  /**
   * Redirect to Google authentication page
   */
  signIn(): void {
    try {
      // Clear any previous auth data before starting new flow
      localStorage.removeItem('auth_code');
      
      const authUrl = generateGoogleAuthUrl();
      console.log('Redirecting to Google auth:', authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate Google sign-in:', error);
    }
  }

  /**
   * Process the authentication response after redirect
   */
  async handleRedirectResponse(accessToken: string): Promise<GoogleAuthResponse> {
    if (!accessToken) {
      return { success: false, error: 'No access token provided' };
    }

    try {
      console.log('Processing authentication token:', accessToken.substring(0, 10) + '...');
      const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';
      
      // Try to get user info from the token
      const userInfo = await getUserInfoFromToken(accessToken);
      
      if (!userInfo || !userInfo.email) {
        console.error('Failed to get user email from token');
        return { success: false, error: 'Failed to get user email' };
      }
      
      console.log('Got user email:', userInfo.email);
      
      // Check if email ends with required domain
      if (!userInfo.email.endsWith(requiredDomain)) {
        console.error('Email domain not allowed:', userInfo.email);
        return { 
          success: false, 
          error: `Please use your ${requiredDomain} school account to sign in` 
        };
      }
      
      console.log('User email domain validated, storing auth data');
      
      // Store the token and metadata
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('loginTimestamp', Date.now().toString());
      localStorage.setItem('userEmail', userInfo.email);
      localStorage.setItem('userName', userInfo.name || '');
      if (userInfo.picture) {
        localStorage.setItem('userPicture', userInfo.picture);
      }
      
      return {
        success: true,
        user: userInfo
      };
    } catch (error) {
      console.error('Error in handleRedirectResponse:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }
}

export default GoogleAuthService;
