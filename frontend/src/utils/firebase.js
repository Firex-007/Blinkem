import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBn7QhFODST3Q3VxsJ7YHTOIqG3lc2UQC4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'blinkem-5276d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'blinkem-5276d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'blinkem-5276d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '59166602153',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:59166602153:web:6588018a15d39c06638ab8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7MC8RXW9JN',
};

// Initialize Firebase App singleton
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

/**
 * Initialize invisible reCAPTCHA for phone OTP verification
 * @param {string} containerId - DOM ID of container element
 * @returns {RecaptchaVerifier|null}
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  // Clear existing verifier if any
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    window.recaptchaVerifier = null;
  }

  // Ensure container element exists in DOM
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved automatically
      },
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch {
            // ignore
          }
          window.recaptchaVerifier = null;
        }
      },
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error('Failed to initialize RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Send real 6-digit SMS OTP to an Indian mobile number via Firebase Phone Auth
 * @param {string} phone - 10-digit phone number
 * @param {string} [containerId='recaptcha-container']
 * @returns {Promise<{success: boolean, confirmationResult: any}>}
 */
export async function sendRealPhoneOtp(phone, containerId = 'recaptcha-container') {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  const formattedPhone = `+91${cleanPhone}`;

  // Always re-initialize verifier for freshness
  const verifier = setupRecaptcha(containerId);
  if (!verifier) {
    throw new Error('Could not initialize SMS verification. Please refresh and try again.');
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, formattedPhone, verifier);
    window.confirmationResult = confirmationResult;
    return {
      success: true,
      phone: formattedPhone,
      confirmationResult,
    };
  } catch (err) {
    console.error('Firebase signInWithPhoneNumber error:', err);

    // Reset verifier on failure so user can retry immediately
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      window.recaptchaVerifier = null;
    }

    if (err.code === 'auth/invalid-phone-number') {
      throw new Error('The phone number format is invalid. Please check the 10 digits.');
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many OTP attempts. Please wait 1-2 minutes before trying again.');
    }
    if (err.code === 'auth/unauthorized-domain') {
      throw new Error(
        'This domain is not yet authorized in Firebase Console. Please add blinkem.vercel.app under Authentication > Settings > Authorized domains.'
      );
    }
    if (err.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded for today. Please try again later.');
    }

    throw new Error(err.message || 'Failed to send SMS verification code.');
  }
}

/**
 * Verify received 6-digit OTP code with Firebase Phone Auth
 * @param {string} otp - 6-digit OTP code received via SMS
 * @param {any} [confirmationResult] - Optional cached confirmationResult
 * @returns {Promise<{success: boolean, user: any}>}
 */
export async function verifyRealPhoneOtp(otp, confirmationResult = null) {
  const activeConfirmation = confirmationResult || window.confirmationResult;
  if (!activeConfirmation) {
    throw new Error('Verification session expired or not found. Please click Resend OTP.');
  }

  const cleanOtp = String(otp).trim();
  if (cleanOtp.length < 6) {
    throw new Error('Please enter the complete 6-digit OTP sent to your phone.');
  }

  try {
    const userCredential = await activeConfirmation.confirm(cleanOtp);
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (err) {
    console.error('Firebase OTP confirmation error:', err);
    if (err.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP code. Please check the 6-digit SMS and re-enter.');
    }
    if (err.code === 'auth/code-expired') {
      throw new Error('This verification code has expired. Please request a new OTP.');
    }
    throw new Error(err.message || 'OTP verification failed.');
  }
}
