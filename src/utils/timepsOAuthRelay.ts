const TIMEPS_CALLBACK =
  'https://bbeswtssigkglspkleyc.supabase.co/functions/v1/oauth-bridge/tpstime/callback';

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
