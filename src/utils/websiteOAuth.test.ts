import { finishWebsiteGoogleSignIn, startWebsiteGoogleSignIn } from './websiteOAuth';

const state = `website_${'a'.repeat(43)}`;
const flowKey = 'tpstime.website.google-flow.v1';
const callback = 'https://www.tpstime.com/auth/callback/';

describe('verified website login', () => {
  const previousFetch = global.fetch;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(flowKey, JSON.stringify({ state, verifier: 'v'.repeat(86), createdAt: Date.now() }));
    window.history.replaceState({}, '', `/auth/callback/#state=${state}&id_token=google.signed.token`);
  });
  afterEach(() => {
    global.fetch = previousFetch;
    jest.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('exchanges a verified website callback once and keeps the Google token out of storage and URLs', async () => {
    global.fetch = jest.fn(async (url, options) => {
      expect(window.location.hash).toBe('');
      expect(options?.credentials).toBe('omit');
      if (String(url).endsWith('/callback')) {
        expect(JSON.parse(options!.body as string)).toEqual({ state, idToken: 'google.signed.token' });
        return { ok: true, json: async () => ({ redirectUrl: `${callback}?state=${state}&code=${'c'.repeat(43)}` }) } as Response;
      }
      expect(String(url)).toMatch(/\/website\/exchange$/);
      expect(JSON.parse(options!.body as string)).toEqual({ state, code: 'c'.repeat(43), codeVerifier: 'v'.repeat(86), redirectUri: callback });
      return { ok: true, json: async () => ({ user: { email: 'student@trinityprep.org', email_verified: true }, session: { access_token: 'verified-session' } }) } as Response;
    });
    expect(await finishWebsiteGoogleSignIn()).toEqual({ email: 'student@trinityprep.org', name: 'student' });
    expect(localStorage.getItem('accessToken')).toBe('verified-session');
    expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain('google.signed.token');
    expect(sessionStorage.getItem(flowKey)).toBeNull();
    expect(await finishWebsiteGoogleSignIn()).toBeNull();
  });

  it('rejects mismatched or expired state before sending a token', async () => {
    global.fetch = jest.fn();
    sessionStorage.setItem(flowKey, JSON.stringify({ state: `website_${'b'.repeat(43)}`, verifier: 'v'.repeat(86), createdAt: Date.now() }));
    await expect(finishWebsiteGoogleSignIn()).rejects.toThrow(/expired|cancelled/);
    expect(global.fetch).not.toHaveBeenCalled();
    sessionStorage.setItem(flowKey, JSON.stringify({ state, verifier: 'v'.repeat(86), createdAt: Date.now() - 600001 }));
    window.history.replaceState({}, '', `/auth/callback/#state=${state}&id_token=google.signed.token`);
    await expect(finishWebsiteGoogleSignIn()).rejects.toThrow(/expired|cancelled/);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects an external return address without persisting a session', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ redirectUrl: `https://attacker.example/?state=${state}&code=code` }) } as Response));
    await expect(finishWebsiteGoogleSignIn()).rejects.toThrow('Invalid website return');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('does not mistake extension/admin relays or restored sessions for website sign-ins', async () => {
    window.history.replaceState({}, '', `/auth/callback/#state=timeps_${'a'.repeat(43)}&id_token=extension.token`);
    expect(await finishWebsiteGoogleSignIn()).toBeNull();
    window.history.replaceState({}, '', '/auth/callback/');
    localStorage.setItem('accessToken', 'existing');
    expect(await finishWebsiteGoogleSignIn()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBe('existing');
  });

  it('surfaces bridge failures without accepting an unverified user', async () => {
    global.fetch = jest.fn(async () => ({ ok: false } as Response));
    await expect(finishWebsiteGoogleSignIn()).rejects.toThrow('Google sign-in could not be completed');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('starts a PKCE-bound website flow and validates its fixed Google callback', async () => {
    Object.defineProperty(window, 'crypto', { configurable: true, value: require('crypto').webcrypto });
    Object.defineProperty(global, 'TextEncoder', { configurable: true, value: require('util').TextEncoder });
    global.fetch = jest.fn(async (_url, options) => {
      const body = JSON.parse(options!.body as string);
      expect(body.redirectUri).toBe(callback);
      expect(body.codeChallengeMethod).toBe('S256');
      expect(body.codeChallenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
      return { ok: true, json: async () => ({ state, authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(callback)}&state=${state}&response_type=id_token` }) } as Response;
    });
    expect(await startWebsiteGoogleSignIn()).toContain('https://accounts.google.com/');
    expect(JSON.parse(sessionStorage.getItem(flowKey)!).state).toBe(state);
  });
});
