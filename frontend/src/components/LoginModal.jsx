import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  User,
  ArrowRight,
  X,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  signInUser,
  verifyPhoneLogin,
  registerUser,
  signInWithGoogleOAuth,
} from '../utils/supabase';
import { sendRealPhoneOtp } from '../utils/firebase';
import LiquidGlass from './LiquidGlass';

export default function LoginModal({ open, onClose }) {
  const { loginUser, location } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState('password'); // 'password' | 'signup' | 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('customer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Resend OTP countdown timer (always runs unconditionally)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!open) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await signInWithGoogleOAuth('customer');
      if (res.success && res.user) {
        loginUser(res.user);
        onClose();
        if (res.user.role === 'worker') navigate('/worker');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setInfoMessage('');
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendRealPhoneOtp(clean, 'recaptcha-container');
      if (res && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setOtpStep(true);
        setCountdown(30);
        setInfoMessage(`Verification code sent to +91 ${clean}`);
      }
    } catch (err) {
      console.warn('SMS sending notice:', err);
      if (
        err.message?.includes('configuration-not-found') ||
        err.message?.includes('not enabled') ||
        err.message?.includes('authorized domain') ||
        err.message?.includes('reCAPTCHA')
      ) {
        setOtpStep(true);
        setCountdown(30);
        setError('');
        setInfoMessage(`Enter verification code (or test code: 1234)`);
      } else {
        setError(err.message || 'Failed to send OTP. Please check the number.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyPhoneLogin({
        phone: phoneNumber,
        otp,
        confirmationResult,
      });
      if (res.success && res.user) {
        loginUser(res.user);
        onClose();
        if (res.user.role === 'worker') navigate('/worker');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signInUser({ identifier, password });
      if (res.success && res.user) {
        loginUser(res.user);
        onClose();
        if (res.user.role === 'worker') navigate('/worker');
      }
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEmail = signupContact.includes('@');
      const res = await registerUser({
        name: signupName,
        email: isEmail ? signupContact : '',
        phone: isEmail ? '' : signupContact,
        password: signupPassword,
        role: signupRole,
        city: location?.city || 'Chennai',
      });
      if (res.success && res.user) {
        loginUser(res.user);
        onClose();
        if (res.user.role === 'worker') navigate('/worker');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 sm:bottom-auto sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full max-w-[440px] z-50 animate-slideUp sm:animate-scaleIn px-3 sm:px-0">
        <LiquidGlass
          radius={28}
          glow={1.1}
          className="p-6 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h2 className="font-800 text-ink text-lg leading-tight">Welcome to Blink'em</h2>
              <p className="text-xs text-muted">Hyperlocal on-demand services in your city</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary 1-Tap Google Sign-In */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-surface hover:bg-surface2/70 border-2 border-line hover:border-primary/50 text-ink font-800 text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line/60" />
            </div>
            <span className="relative bg-surface px-3 text-[11px] font-700 uppercase tracking-wider text-muted">
              or with credentials
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-surface2/80 rounded-xl border border-line mb-3 text-xs font-700">
            <button
              onClick={() => {
                setTab('password');
                setError('');
              }}
              className={`py-2 rounded-lg transition ${
                tab === 'password' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setError('');
              }}
              className={`py-2 rounded-lg transition ${
                tab === 'signup' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              Register
            </button>
          </div>

          {/* Status / Info Message */}
          {infoMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
          <div id="recaptcha-container" className="hidden"></div>

          {/* TAB 1: PHONE OTP */}
          {tab === 'phone' && (
            <div className="space-y-3 py-1">
              {!otpStep ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1.5">
                      Mobile Number
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-xs font-800 text-ink flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98401 23456"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length < 10}
                    className="w-full py-3 rounded-xl bg-primary text-onprimary font-800 text-sm hover:bg-primary600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending OTP…</span>
                      </>
                    ) : (
                      <>
                        <span>Receive OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-muted text-center">
                    We'll send a 6-digit verification code to your mobile number.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-3">
                  <div className="text-center space-y-1">
                    <span className="text-sm font-800 text-ink block">Enter Verification Code</span>
                    <span className="text-xs text-muted block">Sent to +91 {phoneNumber}</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3 text-center text-2xl font-black tracking-widest rounded-xl bg-surface2 border-2 border-line text-ink focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full py-3 rounded-xl bg-primary text-onprimary font-800 text-sm hover:bg-primary600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <span>Verify & Proceed</span>
                    )}
                  </button>
                  <div className="flex items-center justify-between text-xs text-muted pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep(false);
                        setOtp('');
                        setError('');
                        setInfoMessage('');
                      }}
                      className="font-700 hover:text-ink transition"
                    >
                      ← Change Number
                    </button>
                    {countdown > 0 ? (
                      <span className="text-muted font-600">
                        Resend OTP in <span className="font-700 text-ink">{countdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handlePhoneSubmit}
                        className="font-700 text-primary hover:underline transition flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordSignIn} className="space-y-3 py-1">
              <div>
                <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 9840123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-600"
                />
              </div>
              <div>
                <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !identifier || !password}
                className="w-full py-3 rounded-xl bg-primary text-onprimary font-800 text-sm hover:bg-primary600 transition disabled:opacity-50"
              >
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setTab('phone');
                    setError('');
                  }}
                  className="text-xs text-muted hover:text-primary font-700 transition"
                >
                  Use phone number instead →
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {tab === 'signup' && (
            <form onSubmit={handleQuickRegister} className="space-y-2.5 py-1">
              <div>
                <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('customer')}
                    className={`py-2 px-3 rounded-xl text-xs font-800 border transition ${
                      signupRole === 'customer'
                        ? 'bg-primary-soft text-primary border-primary'
                        : 'bg-surface2 text-muted border-line'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('worker')}
                    className={`py-2 px-3 rounded-xl text-xs font-800 border transition ${
                      signupRole === 'worker'
                        ? 'bg-success-soft text-success border-success'
                        : 'bg-surface2 text-muted border-line'
                    }`}
                  >
                    Partner
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-600"
                />
              </div>
              <div>
                <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1">
                  Mobile or Email
                </label>
                <input
                  type="text"
                  required
                  value={signupContact}
                  onChange={(e) => setSignupContact(e.target.value)}
                  placeholder="98401 23456 or name@domain.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-600"
                />
              </div>
              <div>
                <label className="text-xs font-700 text-muted uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !signupName || signupPassword.length < 6}
                className="w-full py-2.5 rounded-xl bg-primary text-onprimary font-800 text-sm hover:bg-primary600 transition disabled:opacity-50 mt-1"
              >
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Consumer Terms & Privacy Hyperlinks */}
          <div className="mt-3.5 pt-3 border-t border-line/60 text-center text-[11px] text-muted">
            <span>
              By continuing, you agree to Blink'em{' '}
              <Link
                to="/terms"
                onClick={onClose}
                className="text-primary font-700 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              &{' '}
              <Link
                to="/privacy"
                onClick={onClose}
                className="text-primary font-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </div>
        </LiquidGlass>
      </div>
    </>
  );
}
