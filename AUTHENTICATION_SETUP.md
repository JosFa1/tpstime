# Trinity Prep Schedule Authentication Setup

This document explains how to configure Google OAuth authentication for the Trinity Prep Schedule web application.

## Overview

The application can run in two modes:
1. **Public Mode**: No authentication required (default when OAuth is not configured)
2. **Authenticated Mode**: Requires Google OAuth with @trinityprep.org email addresses

## Setting Up Google OAuth

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity and Access Management (IAM) API

### 2. Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "Internal" (for G Suite/Workspace) or "External"
3. Fill in the application information:
   - App name: "Trinity Prep Schedule"
   - User support email: Your Trinity Prep email
   - Developer contact information: Your Trinity Prep email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (if using External): Add @trinityprep.org email addresses

### 3. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure the settings:
   - Name: "Trinity Prep Schedule Web Client"
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)

### 4. Configure Environment Variables

1. Copy the Client ID and Client Secret from the Google Cloud Console
2. Update your `.env` file:

```bash
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

3. **Important**: Never commit the `.env` file with real credentials to version control

### 5. Testing Authentication

1. Start the development server: `npm start`
2. Navigate to `http://localhost:3000`
3. If OAuth is configured, you'll be redirected to the login page
4. Click "Sign in with Google" and use a @trinityprep.org account
5. After successful authentication, you'll be redirected to the schedule

## Security Features

- **Domain Restriction**: Only @trinityprep.org email addresses are allowed
- **Session Storage**: Authentication state is stored in sessionStorage (cleared when browser closes)
- **Route Protection**: All application routes require authentication when OAuth is enabled
- **Logout Functionality**: Users can log out via the hamburger menu

## Disabling Authentication

To run the application without authentication (public mode):
1. Remove or comment out the Google OAuth environment variables in `.env`
2. Restart the application
3. The app will run without requiring login

## Production Deployment

For production deployment:
1. Update the OAuth redirect URIs in Google Cloud Console to match your production domain
2. Set the environment variables in your hosting platform
3. Ensure HTTPS is enabled for your production domain
4. Test the authentication flow thoroughly

## Troubleshooting

### Common Issues

1. **"Please use your @trinityprep.org Google account" error**
   - The user is trying to sign in with a non-Trinity Prep email address
   - Ensure they're using their school Google account

2. **OAuth not working**
   - Check that the Client ID is correctly set in the environment variables
   - Verify the redirect URIs match in Google Cloud Console
   - Ensure the domain is authorized in the OAuth consent screen

3. **App works without authentication unexpectedly**
   - Check that the environment variables are properly set
   - Restart the development server after changing environment variables

### Debug Mode

To see authentication debug information, check the browser console for any error messages during the login process.

## Support

For technical issues, contact the development team or check the application logs for detailed error information.
