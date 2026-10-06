// Google OAuth Service using redirect flow

import { startWebsiteGoogleSignIn } from '../utils/websiteOAuth';

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
  async signIn(): Promise<void> {
    localStorage.removeItem('auth_code');
    const authUrl = await startWebsiteGoogleSignIn();
    window.location.assign(authUrl);
  }
}

export default GoogleAuthService;
