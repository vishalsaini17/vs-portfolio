const PRIVACY_COOKIE = 'portfolio_privacy_mode';
export const PRIVACY_DURATION_MS = 12 * 60 * 60 * 1000;

export interface PrivacyState {
  enabled: boolean;
  expiresAt: number | null;
}

export function readPrivacyCookie(): number | null {
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(`${PRIVACY_COOKIE}=`));
  if (!cookie) return null;

  const expiresAt = Number(decodeURIComponent(cookie.slice(PRIVACY_COOKIE.length + 1)));
  return Number.isFinite(expiresAt) && expiresAt > Date.now() ? expiresAt : null;
}

export function savePrivacyCookie(): number {
  const expiresAt = Date.now() + PRIVACY_DURATION_MS;
  document.cookie = `${PRIVACY_COOKIE}=${expiresAt}; Max-Age=${PRIVACY_DURATION_MS / 1000}; Path=/; SameSite=Lax`;
  return expiresAt;
}

export function clearPrivacyCookie() {
  document.cookie = `${PRIVACY_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getPrivacyState(search: string): PrivacyState {
  if (new URLSearchParams(search).has('p')) {
    return { enabled: true, expiresAt: savePrivacyCookie() };
  }

  const expiresAt = readPrivacyCookie();
  if (expiresAt) return { enabled: true, expiresAt };

  clearPrivacyCookie();
  return { enabled: false, expiresAt: null };
}
