import TokenCache from '../utils/TokenCache';

describe('TokenCache', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should store and retrieve tokens correctly', () => {
    const mockUser = {
      email: 'test@trinityprep.org',
      name: 'Test User',
      picture: 'https://example.com/picture.jpg'
    };

    const accessToken = 'mock-access-token';
    const expiresIn = 3600; // 1 hour

    // Store tokens
    TokenCache.storeTokens(accessToken, expiresIn, mockUser);

    // Retrieve tokens
    const cachedTokens = TokenCache.getCachedTokens();
    expect(cachedTokens).not.toBeNull();
    expect(cachedTokens?.accessToken).toBe(accessToken);
    expect(cachedTokens?.user).toEqual(mockUser);
  });

  test('should return null for expired tokens', () => {
    const mockUser = {
      email: 'test@trinityprep.org',
      name: 'Test User'
    };

    const accessToken = 'mock-access-token';
    const expiresIn = -1; // Expired

    // Store expired token
    TokenCache.storeTokens(accessToken, expiresIn, mockUser);

    // Should return null for expired token
    const cachedTokens = TokenCache.getCachedTokens();
    expect(cachedTokens).toBeNull();
  });

  test('should clear tokens correctly', () => {
    const mockUser = {
      email: 'test@trinityprep.org',
      name: 'Test User'
    };

    const accessToken = 'mock-access-token';
    const expiresIn = 3600;

    // Store tokens
    TokenCache.storeTokens(accessToken, expiresIn, mockUser);

    // Verify tokens are stored
    expect(TokenCache.isValidCachedToken()).toBe(true);

    // Clear tokens
    TokenCache.clearTokens();

    // Verify tokens are cleared
    expect(TokenCache.isValidCachedToken()).toBe(false);
    expect(TokenCache.getCachedTokens()).toBeNull();
  });

  test('should check if token needs refresh', () => {
    const mockUser = {
      email: 'test@trinityprep.org',
      name: 'Test User'
    };

    const accessToken = 'mock-access-token';
    const expiresIn = 300; // 5 minutes - within refresh buffer

    // Store token that needs refresh
    TokenCache.storeTokens(accessToken, expiresIn, mockUser);

    // Should indicate refresh is needed
    expect(TokenCache.needsRefresh()).toBe(true);
  });
});
