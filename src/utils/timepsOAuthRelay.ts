const TIMEPS_CALLBACK =
  'https://bbeswtssigkglspkleyc.supabase.co/functions/v1/oauth-bridge/tpstime/callback';

export async function exchangeTimePSIdToken(hash: string): Promise<string | null> {
  const incoming = new URLSearchParams(hash.replace(/^#/, ''));
  const state = incoming.get('state');
  if (!state?.startsWith('timeps_')) return null;
  if (incoming.has('error')) return buildTimePSOAuthRelayUrl(incoming.toString());
  const idToken = incoming.get('id_token');
  if (
    !/^timeps_[A-Za-z0-9_-]{43}$/.test(state) ||
    !idToken ||
    idToken.length > 8192 ||
    incoming.has('access_token') ||
    incoming.has('code')
  ) {
    throw new Error('Invalid TimePS sign-in response.');
  }
  // Strip the fragment before any network call; never persist or log the Google ID token.
  window.history.replaceState({}, document.title, window.location.pathname);
  const response = await fetch(TIMEPS_CALLBACK, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, idToken }),
  });
  if (!response.ok) throw new Error('TimePS could not verify your Google sign-in.');
  const result = await response.json();
  const redirect = new URL(result.redirectUrl);
  if (
    redirect.origin !== 'https://kjjmokfjlgabfhkookiedbfhfdehgbcl.chromiumapp.org' ||
    redirect.pathname !== '/oauth2' ||
    redirect.searchParams.get('state') !== state ||
    (!redirect.searchParams.get('code') && !redirect.searchParams.get('error'))
  ) {
    throw new Error('Invalid TimePS return address.');
  }
  return redirect.toString();
}

/** Preserve normal TPSTime sign-in; relay only the extension's namespaced flow. */
export function buildTimePSOAuthRelayUrl(search: string): string | null {
  const incoming = new URLSearchParams(search);
  const state = incoming.get('state');
  if (!state?.startsWith('timeps_')) return null;
  if (!/^timeps_[A-Za-z0-9_-]{43}$/.test(state)) {
    throw new Error('Invalid TimePS sign-in state.');
  }
  const code = incoming.get('code');
  const error = incoming.get('error');
  if (
    (code && error) ||
    (!code && !error) ||
    (code && code.length > 4096) ||
    (error && !/^[a-z_]{1,100}$/.test(error))
  ) {
    throw new Error('Invalid TimePS sign-in response.');
  }
  const target = new URL(TIMEPS_CALLBACK);
  target.searchParams.set('state', state);
  if (code) target.searchParams.set('code', code);
  if (error) target.searchParams.set('error', error);
  return target.toString();
}
