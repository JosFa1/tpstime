import { buildTimePSOAuthRelayUrl } from './timepsOAuthRelay';

const state = `timeps_${'a'.repeat(43)}`;

describe('TPSTime website handoff', () => {
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
