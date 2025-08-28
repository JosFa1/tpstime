# Google OAuth Token Caching Implementation

## Overview

The Trinity Prep Schedule application now implements persistent token caching for Google OAuth authentication. This means users will remain signed in across browser sessions and won't need to re-authenticate every time they visit the app.

## How It Works

### Token Storage
- **Google JWT tokens** are cached in `localStorage` for persistence across browser sessions
- **User information** (email, name, picture) is stored alongside the token
- **Expiration times** are tracked to ensure tokens are only used when valid
- **Automatic cleanup** removes expired tokens

### Authentication Flow
1. **First Visit**: User signs in with Google OAuth
2. **Token Caching**: JWT token and user info are stored in localStorage
3. **Subsequent Visits**: App checks for valid cached tokens
4. **Auto Sign-in**: If valid token exists, user is automatically signed in
5. **Token Expiry**: Expired tokens are automatically cleared

## Implementation Details

### TokenCache Utility (`src/utils/TokenCache.ts`)
- `storeTokens()` - Saves OAuth tokens and user data
- `getCachedTokens()` - Retrieves valid cached tokens
- `isValidCachedToken()` - Checks if cached token is still valid
- `clearTokens()` - Removes all cached authentication data
- `needsRefresh()` - Checks if token needs to be refreshed soon

### Enhanced GoogleAuthService (`src/services/GoogleAuthService.ts`)
- Checks for cached tokens before prompting for new authentication
- Automatically stores tokens after successful authentication
- Handles token expiration and cleanup
- Provides methods to check authentication status

### Updated AuthContext (`src/contexts/AuthContext.tsx`)
- Checks for cached OAuth tokens on app startup
- Falls back to session storage for backward compatibility
- Properly clears both token cache and session storage on logout

## Security Features

### Token Validation
- **Expiration checking**: Tokens are validated for expiration before use
- **Domain restriction**: Only @trinityprep.org emails are allowed
- **Automatic cleanup**: Expired or invalid tokens are automatically removed

### Buffer Time
- Tokens are considered "needing refresh" 5 minutes before expiration
- This prevents using tokens that might expire during a request

## Usage

### For Users
- **First sign-in**: Click "Sign in with Google" as usual
- **Subsequent visits**: App automatically signs you in if your token is valid
- **Manual sign-out**: Use the logout option in the hamburger menu to clear all tokens
- **Token expiry**: You'll be prompted to sign in again when your token expires

### For Developers

#### Debugging Authentication
The app includes debugging utilities available in the browser console:

```javascript
// Check current authentication status
authStatus()

// Clear all authentication data
clearAuth()

// Get detailed auth information
AuthUtils.getAuthStatus()
```

#### Manual Token Management
```typescript
import TokenCache from './utils/TokenCache';

// Check if user has valid cached token
const isAuthenticated = TokenCache.isValidCachedToken();

// Get cached user info
const user = TokenCache.getCachedUser();

// Clear all cached tokens
TokenCache.clearTokens();
```

## Configuration

No additional configuration is required. The token caching works with your existing Google OAuth setup:

```bash
# Your existing environment variables still apply
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Migration

This update is **backward compatible**:
- Existing users with session-based auth will continue to work
- New token caching will activate on their next sign-in
- No action required for existing deployments

## Troubleshooting

### User Can't Sign In
1. Check browser console for errors
2. Verify Google OAuth configuration is correct
3. Try clearing authentication data: `clearAuth()` in console
4. Check if cookies/localStorage are enabled

### Tokens Not Persisting
1. Verify localStorage is available and not disabled
2. Check if browser is in private/incognito mode
3. Ensure domain restrictions allow localStorage usage

### Automatic Sign-in Not Working
1. Check if cached token exists: `authStatus()` in console
2. Verify token hasn't expired
3. Check browser console for authentication errors
4. Try signing out and signing in again

## Benefits

### For Users
- **Seamless experience**: No need to sign in repeatedly
- **Faster access**: Immediate access to the app on return visits
- **Reduced friction**: Less authentication prompts

### For Developers
- **Better UX**: Improved user retention and satisfaction
- **Debugging tools**: Built-in utilities for troubleshooting auth issues
- **Flexible implementation**: Easy to extend or modify as needed

## Security Considerations

- Tokens are stored in localStorage (persistent but accessible to scripts on the domain)
- Domain restriction ensures only Trinity Prep users can authenticate
- Automatic token expiration provides security against stale credentials
- Manual logout clears all cached data for security

## Testing

Run the token cache tests:
```bash
npm test TokenCache
```

The test suite covers:
- Token storage and retrieval
- Expiration handling
- Cache clearing functionality
- Refresh timing logic
