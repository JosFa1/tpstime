export {};

// Utility functions for authentication

/**
 * Generate Google OAuth redirect URL - now using authorization code flow
 */
export const generateGoogleAuthUrl = (): string => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_GOOGLE_OAUTH_REDIRECT_URI;
  
  if (!clientId) {
    throw new Error('Google Client ID not configured');
  }
  
  if (!redirectUri) {
    throw new Error('Google OAuth redirect URI not configured');
  }

  // Base URL for Google's OAuth 2.0
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  // Required parameters for OAuth 2.0 - using code flow instead of token
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',  // Changed from 'token' to 'code'
    scope: 'email profile openid',
    prompt: 'select_account',
    access_type: 'offline',
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Extract the access token from URL fragment after OAuth redirect
 */
export const extractTokenFromUrl = (): { accessToken: string | null; error: string | null } => {
  // First try from hash fragment (implicit flow response)
  const hash = window.location.hash.substring(1);
  if (hash) {
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');
    
    if (accessToken || error) {
      window.history.replaceState({}, document.title, window.location.pathname);
      return { accessToken, error };
    }
  }
  
  // Note: Query param extraction is now handled directly in the callback component
  return { accessToken: null, error: null };
};

/**
 * Parse JWT token to get payload
 */
export const parseJwt = (token: string): any => {
  try {
    // Check if token is valid format first
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Safer decoding approach
    try {
      // First try standard browser atob
      const jsonPayload = decodeURIComponent(
        Array.from(atob(base64))
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (decodeError) {
      // Fallback for special characters
      const rawPayload = atob(base64);
      try {
        return JSON.parse(rawPayload);
      } catch (parseError) {
        console.error('Failed to parse JWT payload', parseError);
        return null;
      }
    }
  } catch (error) {
    console.error('Failed to process JWT', error);
    return null;
  }
};

/**
 * Mock function to exchange authorization code for token
 * In a real application, this would be done server-side
 */
export const exchangeCodeForToken = async (code: string): Promise<string | null> => {
  console.log('Exchanging authorization code for token (mock implementation)');
  // In a real app, this would make a request to the token endpoint
  // Since we can't include the client secret in the frontend,
  // we'll create a mock implementation for demonstration
  
  if (!code) {
    return null;
  }
  
  // Create a mock token with the code embedded in it
  // This is just for demonstration - in a real app,
  // this exchange would happen on your backend
  return `mock_token_${code}`;
};

/**
 * Get mock user info for testing purposes
 */
export const getMockUserInfo = async (token: string): Promise<{
  email: string;
  name: string;
  picture?: string;
} | null> => {
  // Check if this is our mock token
  if (token.startsWith('mock_token_')) {
    // Return mock user data
    return {
      email: 'student@trinityprep.org',
      name: 'Test Student',
      picture: 'https://ui-avatars.com/api/?name=Test+Student&background=random'
    };
  }
  return null;
};

/**
 * Get user info from an OAuth token (either JWT or access token)
 */
export const getUserInfoFromToken = async (token: string): Promise<{
  email: string;
  name: string;
  picture?: string;
} | null> => {
  // Check if it's our mock token first
  const mockUserInfo = await getMockUserInfo(token);
  if (mockUserInfo) {
    return mockUserInfo;
  }
  
  // First try to parse as JWT (for id_token)
  const parsedJwt = parseJwt(token);
  if (parsedJwt?.email) {
    return {
      email: parsedJwt.email,
      name: parsedJwt.name,
      picture: parsedJwt.picture
    };
  }
  
  // If not JWT, use token to fetch user info from Google
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const data = await response.json();
    return {
      email: data.email,
      name: data.name,
      picture: data.picture
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};
