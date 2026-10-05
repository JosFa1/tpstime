import { buildTimePSOAuthRelayUrl, exchangeTimePSIdToken } from './timepsOAuthRelay';

const state = `timeps_${'a'.repeat(43)}`;

describe('TPSTime website handoff', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('posts the ID token with no URL token exposure and validates the extension return', async () => {
    const redirectUrl = `https://kjjmokfjlgabfhkookiedbfhfdehgbcl.chromiumapp.org/oauth2?state=${state}&code=one-time`;
    const fetchMock = jest.fn(async (_url: string, options: any) => {
      expect(window.location.hash).toBe('');
      expect(options.credentials).toBe('omit');
      expect(JSON.parse(options.body)).toEqual({ state, idToken: 'signed.google.token' });
      return { ok: true, json: async () => ({ redirectUrl }) };
    });
    const previousFetch = global.fetch;
    global.fetch = fetchMock as any;
    try {
      const hash = `#state=${state}&id_token=signed.google.token`;
      window.history.replaceState({}, '', '/auth/callback/' + hash);
      expect(await exchangeTimePSIdToken(hash)).toBe(redirectUrl);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/tpstime/callback'),
        expect.objectContaining({ method: 'POST' }),
      );
      const adminUrl = `https://admin.timeps.buzz/auth/google/callback?state=${state}&code=admin-code`;
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ redirectUrl: adminUrl }) });
      expect(await exchangeTimePSIdToken(hash)).toBe(adminUrl);
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ redirectUrl: 'https://attacker.test' }),
      });
      await expect(exchangeTimePSIdToken(hash)).rejects.toThrow('Invalid TimePS return');
    } finally {
      global.fetch = previousFetch;
    }
  });

  it('rejects access-token or mixed responses and ignores normal website tokens', async () => {
    expect(await exchangeTimePSIdToken('#id_token=normal-website-token')).toBeNull();
    await expect(
      exchangeTimePSIdToken(`#state=${state}&id_token=jwt&access_token=access`),
    ).rejects.toThrow('Invalid TimePS');
  });
  it('keeps normal website login on its existing path', () => {
    expect(buildTimePSOAuthRelayUrl('?code=website-code&state=normal')).toBeNull();
    expect(buildTimePSOAuthRelayUrl('?code=website-code')).toBeNull();
  });

  it('relays code and state only to the fixed backend callback', () => {
    const target = new URL(
      buildTimePSOAuthRelayUrl(
        `?state=${state}&code=google-code&redirect_uri=https://attacker.test&email=fake`,
      )!,
    );
    expect(target.origin).toBe('https://bbeswtssigkglspkleyc.supabase.co');
    expect(target.pathname).toBe('/functions/v1/oauth-bridge/tpstime/callback');
    expect(target.searchParams.get('state')).toBe(state);
    expect(target.searchParams.get('code')).toBe('google-code');
    expect(target.searchParams.has('redirect_uri')).toBe(false);
    expect(target.searchParams.has('email')).toBe(false);
  });

  it('relays cancellation and fails closed on malformed extension responses', () => {
    expect(buildTimePSOAuthRelayUrl(`?state=${state}&error=access_denied`)).toContain(
      'error=access_denied',
    );
    for (const query of [
      '?state=timeps_short&code=code',
      `?state=${state}`,
      `?state=${state}&code=code&error=access_denied`,
      `?state=${state}&code=${'a'.repeat(4097)}`,
    ])
      expect(() => buildTimePSOAuthRelayUrl(query)).toThrow('Invalid TimePS');
  });
});
