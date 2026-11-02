export function isLocalPreview(environment: string | undefined, enabled: string | undefined, hostname: string): boolean {
  return environment === 'development' && enabled === 'true' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}

export const localPreview = isLocalPreview(
  process.env.NODE_ENV, process.env.REACT_APP_PREVIEW_DEMO, window.location.hostname,
);
