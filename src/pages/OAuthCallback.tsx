import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const enableServerAccount = process.env.REACT_APP_ENABLE_SERVER_ACCOUNT === 'true';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enableServerAccount) {
      console.log('[OAuth] Server account disabled, redirecting to home');
      navigate('/');
      return;
    }

    const handleOAuthCallback = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');

      if (!idToken) {
        console.error('[OAuth] ID token not found in URL');
        navigate('/');
        return;
      }

      try {
        const data = await apiFetch('/api/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('accessToken', idToken);
        console.log('[OAuth] Authentication successful');
        navigate('/');
      } catch (error) {
        console.error('[OAuth] Authentication failed:', error);
        navigate('/');
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
