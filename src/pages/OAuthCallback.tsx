import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ALLOWED_DOMAIN = 'gmail.com';

function parseHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const access_token = params.get('access_token');
  const id_token = params.get('id_token');
  return { access_token, id_token };
}

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { access_token, id_token } = parseHash(window.location.hash);
    const token = access_token || id_token;
    if (!token) {
      setError('No token returned from Google.');
      return;
    }

    let email: string | null = null;
    let name: string | null = null;
    let picture: string | null = null;
    if (id_token) {
      try {
        const payload = id_token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        email = decoded.email || null;
        name = decoded.name || null;
        picture = decoded.picture || null;
      } catch (e) {
        // ignore
      }
    }

    if (!email && access_token) {
      fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          email = data.email;
          name = data.name;
          picture = data.picture;
          finalize(email, name, picture);
        })
        .catch(() => finalize(null, null, null));
      return;
    }

    finalize(email, name, picture);

    function finalize(emailLocal: string | null, nameLocal: string | null, pictureLocal: string | null) {
      if (!emailLocal) {
        setError('Could not determine account email from Google response.');
        return;
      }

      if (!emailLocal.endsWith(`@${ALLOWED_DOMAIN}`)) {
        setError('Only @gmail.com accounts are allowed.');
        return;
      }

      // Use AuthContext login method to properly set authentication state
      login(emailLocal, nameLocal || emailLocal, pictureLocal || undefined);
      
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      navigate('/');
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="max-w-lg w-full border-2 border-accent rounded-lg p-6 bg-background">
        <h2 className="text-xl font-bold mb-2">Signing you in…</h2>
        {error ? (
          <div>
            <p className="text-red-600 mb-2">{error}</p>
            <p>If you used a non-Gmail account, please sign out and try again with your @gmail.com account.</p>
          </div>
        ) : (
          <p>Completing sign-in. You will be redirected shortly.</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
