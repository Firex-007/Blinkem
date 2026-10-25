/**
 * Cookie Manager for Blink'em
 * Handles cookie consent, storage, and preference persistence.
 * If consent is 'none', preferences are NOT stored across sessions.
 */

export const CONSENT_COOKIE_KEY = 'blinkem_cookie_consent';
export const PREF_USER_KEY = 'blinkem_user_profile';
export const PREF_LOC_KEY = 'blinkem_user_location';

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getCookieConsent() {
  return getCookie(CONSENT_COOKIE_KEY); // 'all' | 'essential' | 'none' | null
}

export function setCookieConsent(level) {
  // Always store the consent choice itself (essential so we don't ask on every single click)
  setCookie(CONSENT_COOKIE_KEY, level, 365);

  if (level === 'none') {
    // If no cookies: wipe all stored preferences
    deleteCookie(PREF_USER_KEY);
    deleteCookie(PREF_LOC_KEY);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('userLocation');
      localStorage.removeItem('userProfile');
    }
  }
}

export function saveUserPreferences(profile, location) {
  const consent = getCookieConsent();
  if (consent === 'none') {
    // User rejected cookies: do NOT persist
    return;
  }

  // Store in cookies if 'all'
  if (consent === 'all') {
    if (profile) setCookie(PREF_USER_KEY, JSON.stringify(profile), 365);
    if (location) setCookie(PREF_LOC_KEY, JSON.stringify(location), 365);
  }

  // Also in localStorage for quick SPA state if not 'none'
  if (typeof localStorage !== 'undefined') {
    if (profile) localStorage.setItem('userProfile', JSON.stringify(profile));
    if (location) localStorage.setItem('userLocation', JSON.stringify(location));
  }
}

export function loadUserPreferences() {
  const consent = getCookieConsent();
  if (consent === 'none') {
    // Return null so user starts fresh each time
    return { profile: null, location: null };
  }

  let profile = null;
  let location = null;

  try {
    const rawProf = getCookie(PREF_USER_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem('userProfile') : null);
    if (rawProf) profile = JSON.parse(rawProf);

    const rawLoc = getCookie(PREF_LOC_KEY) || (typeof localStorage !== 'undefined' ? localStorage.getItem('userLocation') : null);
    if (rawLoc) location = JSON.parse(rawLoc);
  } catch {
    // Fallback on corrupt JSON
  }

  return { profile, location };
}
