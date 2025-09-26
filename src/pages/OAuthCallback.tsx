import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');

      if (!idToken) {
        console.error('[OAuth] ID token not found in URL');
        navigate('/login'); // Redirect to login page if token is missing
        return;
      }

      try {
        const payload = parseJwt(idToken);
        const requiredDomain = process.env.REACT_APP_GOOGLE_REQUIRED_EMAIL_DOMAIN || '@trinityprep.org';

        if (!payload.email || !payload.email.endsWith(requiredDomain)) {
          console.error('[OAuth] Email domain not allowed:', payload.email);
          navigate('/login'); // Redirect to login if email domain is invalid
          return;
        }

        localStorage.setItem('user', JSON.stringify({ email: payload.email, name: payload.name }));
        localStorage.setItem('accessToken', idToken);
        console.log('[OAuth] Authentication successful');
        navigate('/'); // Redirect to home page after successful login
      } catch (error) {
        console.error('[OAuth] Authentication failed:', error);
        navigate('/login'); // Redirect to login on error
      }
    };

    const parseJwt = (token: string): any => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('[OAuth] Failed to parse JWT:', error);
        return null;
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="text-text bg-background min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl mb-4">Authenticating...</div>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuthCallback;
