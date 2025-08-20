import React from 'react';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_OAUTH_REDIRECT_URI || 'localhost:3000';
const GOOGLE_SCOPE = 'openid email profile';
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(GOOGLE_SCOPE)}&prompt=select_account`;

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-text">
            Trinity Prep Schedule
          </h2>
          <p className="mt-2 text-sm text-text opacity-80">
            Please sign in with your Gmail Google account
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text mb-2">
                  Sign in to access your schedule
                </h3>
                <p className="text-sm text-text opacity-70 mb-4">
                  You must use your @gmail.com Google account
                </p>
              </div>
              <div className="flex justify-center">
                <a
                  href={GOOGLE_AUTH_URL}
                  className="bg-primary hover:bg-primary/90 text-background font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </a>
              </div>
              <div className="text-xs text-text opacity-60 text-center mt-4">
                Only @gmail.com accounts are allowed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
