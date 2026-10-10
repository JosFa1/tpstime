const API = 'https://bbeswtssigkglspkleyc.supabase.co/functions/v1/oauth-bridge/website';
const CALLBACK = 'https://www.tpstime.com/auth/callback/';
const FLOW_KEY = 'tpstime.website.google-flow.v1';
const STATE = /^website_[A-Za-z0-9_-]{43}$/;

type WebsiteUser = { email: string; name: string; picture?: string };

/** The callback reached a tab/profile without this flow's verifier; the caller may restart sign-in. */
export class WebsiteFlowLostError extends Error {}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid website sign-in response.');
  }
  return value as Record<string, unknown>;
}

async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(`${API}/${path}`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Google sign-in could not be completed. Try again.');
  return record(await response.json());
}

function base64Url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function startWebsiteGoogleSignIn(): Promise<string> {
  localStorage.removeItem(FLOW_KEY);
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(64)));
  const challenge = base64Url(new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
  ));
  const result = await post('start', {
    redirectUri: CALLBACK, codeChallenge: challenge, codeChallengeMethod: 'S256', prompt: 'select_account',
  });
  if (typeof result.authorizationUrl !== 'string' || typeof result.state !== 'string' || !STATE.test(result.state)) {
    throw new Error('Invalid Google authorization response.');
  }
  const authorization = new URL(result.authorizationUrl);
  if (authorization.origin !== 'https://accounts.google.com' || authorization.username || authorization.password ||
      authorization.searchParams.get('redirect_uri') !== CALLBACK ||
      authorization.searchParams.get('state') !== result.state ||
      authorization.searchParams.get('response_type') !== 'id_token') {
    throw new Error('Invalid Google authorization response.');
  }
  // localStorage, not sessionStorage: Google may return in a new tab or window of this browser.
  localStorage.setItem(FLOW_KEY, JSON.stringify({ state: result.state, verifier, createdAt: Date.now() }));
  return authorization.toString();
}

/** Handle website flows only; the existing extension/admin relay keeps its own namespace. */
export async function finishWebsiteGoogleSignIn(): Promise<WebsiteUser | null> {
  const incoming = new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : window.location.search);
  const state = incoming.get('state');
  if (!state?.startsWith('website_')) return null;
  // Clear Google's token before validation or network calls. Persist only the verified session.
  window.history.replaceState({}, document.title, window.location.pathname);
  const stored = localStorage.getItem(FLOW_KEY);
  localStorage.removeItem(FLOW_KEY);
  if (incoming.has('error')) throw new Error('Google sign-in expired or was cancelled. Try again.');
  if (!stored) throw new WebsiteFlowLostError('Start Google sign-in again from this browser.');
  const flow = record(JSON.parse(stored));
  if (flow.state !== state) throw new WebsiteFlowLostError('Start Google sign-in again from this browser.');
  const age = typeof flow.createdAt === 'number' ? Date.now() - flow.createdAt : NaN;
  if (!STATE.test(state) || flow.state !== state || typeof flow.verifier !== 'string' ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(flow.verifier) || !Number.isFinite(age) || age < 0 || age > 600000 || incoming.has('error')) {
    throw new Error('Google sign-in expired or was cancelled. Try again.');
  }
  if (incoming.has('access_token') || (incoming.has('id_token') && incoming.has('code'))) {
    throw new Error('Invalid website sign-in response.');
  }
  let code = incoming.get('code');
  if (incoming.has('id_token')) {
    const idToken = incoming.get('id_token');
    if (!idToken || idToken.length > 8192) throw new Error('Invalid website sign-in response.');
    const result = await post('callback', { state, idToken });
    if (typeof result.redirectUrl !== 'string') throw new Error('Invalid website return address.');
    const redirect = new URL(result.redirectUrl);
    if (redirect.origin !== new URL(CALLBACK).origin || redirect.pathname !== '/auth/callback/' ||
        redirect.username || redirect.password || redirect.hash || redirect.searchParams.get('state') !== state) {
      throw new Error('Invalid website return address.');
    }
    if (redirect.searchParams.has('error')) throw new Error('Google sign-in could not be completed. Try again.');
    code = redirect.searchParams.get('code');
  }
  if (!code || !/^[A-Za-z0-9_-]{43}$/.test(code)) throw new Error('Invalid website sign-in response.');
  const result = await post('exchange', { state, code, codeVerifier: flow.verifier, redirectUri: CALLBACK });
  const user = record(result.user);
  const session = record(result.session);
  if (typeof user.email !== 'string' || !/^[^@\s]+@trinityprep\.org$/.test(user.email) || user.email_verified !== true ||
      typeof session.access_token !== 'string' || !session.access_token) {
    throw new Error('Invalid verified website session.');
  }
  const websiteUser: WebsiteUser = {
    email: user.email,
    name: typeof user.name === 'string' && user.name ? user.name : user.email.split('@')[0],
    ...(typeof user.picture === 'string' ? { picture: user.picture } : {}),
  };
  // Preserve the website's existing session/profile storage contract.
  localStorage.setItem('accessToken', session.access_token);
  if (typeof session.refresh_token === 'string') localStorage.setItem('refreshToken', session.refresh_token);
  else localStorage.removeItem('refreshToken');
  localStorage.setItem('loginTimestamp', Date.now().toString());
  localStorage.setItem('userEmail', websiteUser.email);
  localStorage.setItem('userName', websiteUser.name);
  if (websiteUser.picture) localStorage.setItem('userPicture', websiteUser.picture);
  else localStorage.removeItem('userPicture');
  return websiteUser;
}
