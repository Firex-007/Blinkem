import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  User,
  Building2,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  ChevronLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  registerUser,
  signInUser,
  verifyPhoneLogin,
  signInWithGoogleOAuth,
  sendEmailOtp,
  verifyEmailOtp,
} from '../../utils/supabase';
import { sendRealPhoneOtp } from '../../utils/firebase';
import { CITIES } from '../../data/cities';
import LiquidGlass from '../../components/LiquidGlass';
import { t } from '../../i18n';

export default function Login() {
  const { loginUser, isAuthenticated, location: appLocation } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [signInMethod, setSignInMethod] = useState('email_otp'); // 'email_otp' | 'password'
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpStep, setEmailOtpStep] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);

  // Sign In Form States
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Sign Up Form States
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('customer'); // 'customer' | 'worker'
  const [signupCity, setSignupCity] = useState(appLocation?.city || 'Chennai');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 30s rate limiting countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Email countdown timer
  useEffect(() => {
    if (emailCountdown <= 0) return;
    const timer = setInterval(() => {
      setEmailCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailCountdown]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const dest = location.state?.from || (signupRole === 'worker' ? '/worker' : '/');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, navigate, location, signupRole]);

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await signInWithGoogleOAuth(mode === 'signup' ? signupRole : 'customer');
      if (res.success && res.user) {
        loginUser(res.user);
        setTimeout(() => {
          navigate(res.user.role === 'worker' ? '/worker' : '/');
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email OTP Send
  const handleSendEmailOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendEmailOtp(clean);
      setEmailOtpStep(true);
      setEmailCountdown(30);
      if (res.isRealEmail) {
        setSuccessMessage(`Verification code sent to ${clean}. Please check your inbox.`);
      } else {
        setSuccessMessage(`Verification code: ${res.code} (or test code: 1234)`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email OTP Verify
  const handleVerifyEmailOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await verifyEmailOtp({ email, otp: emailOtp, role: 'customer' });
      if (res.success && res.user) {
        loginUser(res.user);
        setTimeout(() => {
          navigate(res.user.role === 'worker' ? '/worker' : '/');
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Send
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendRealPhoneOtp(clean, 'recaptcha-container-page');
      if (res && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setOtpStep(true);
        setCountdown(30);
        setSuccessMessage(`Verification code sent to +91 ${clean}`);
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
        setErrorMessage('');
        setSuccessMessage(`Enter verification code (or test code: 1234)`);
      } else {
        setErrorMessage(err.message || 'Failed to send OTP. Please check the number.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Verify
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await verifyPhoneLogin({
        phone: phoneNumber,
        otp,
        confirmationResult,
      });
      if (res.success && res.user) {
        loginUser(res.user);
        const target = location.state?.from || (res.user.role === 'worker' ? '/worker' : '/');
        navigate(target, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Phone + Password Sign In
  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await signInUser({ identifier, password: loginPassword });
      if (res.success && res.user) {
        loginUser(res.user);
        navigate(res.user.role === 'worker' ? '/worker' : '/');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Sign in failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle New Account Registration
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupPhone && !signupEmail) {
      setErrorMessage('Please enter either a mobile number or email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: signupName,
        phone: signupPhone,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        city: signupCity,
      });

      if (res.success && res.user) {
        setSuccessMessage('Account created successfully!');
        loginUser(res.user);
        setTimeout(() => {
          navigate(signupRole === 'worker' ? '/worker' : '/');
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-bg">
      {/* Background Soft Lighting Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full bg-primary/[0.07] blur-[130px] -mt-36 pointer-events-none" />
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[540px] h-[540px] rounded-full bg-accent/[0.06] blur-[110px] -mb-28 pointer-events-none" />

      {/* Main Liquid Glass Auth Card */}
      <LiquidGlass
        radius={28}
        glow={1.1}
        className="w-full max-w-[460px] p-6 sm:p-8 relative z-10 animate-slideUp shadow-2xl"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-amber-500/10 border border-amber-500/25 shadow-[0_8px_20px_rgba(245,158,11,0.2)]">
            <img
              src="/logo-mark.png"
              alt="Blink'em Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]"
            />
          </div>
          <div className="flex items-center justify-center tracking-[-0.03em] font-black leading-none mb-1">
            <span className="text-2xl sm:text-3xl font-black text-ink uppercase">BLINK</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 uppercase ml-[2px]">'EM</span>
          </div>
          <p className="text-muted text-xs sm:text-sm font-600">
            {mode === 'signin'
              ? 'Hyperlocal on-demand services across India'
              : 'Create your account to book or provide services'}
          </p>
        </div>

        {/* Primary Auth Mode Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-surface2/80 rounded-2xl border border-line mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setOtpStep(false);
            }}
            className={`py-2.5 text-xs sm:text-sm font-800 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-surface text-ink shadow-sm border border-line/60'
                : 'text-muted hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`py-2.5 text-xs sm:text-sm font-800 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-surface text-ink shadow-sm border border-line/60'
                : 'text-muted hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-700 flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Tap Google Sign-In */}
        <div className="mb-4">
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

          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line/60" />
            </div>
            <span className="relative bg-surface px-3 text-[11px] font-700 uppercase tracking-wider text-muted">
              or continue with credentials
            </span>
          </div>
        </div>

        {/* ===================== MODE 1: SIGN IN ===================== */}
        {mode === 'signin' && (
          <div className="space-y-4">
            {/* Method Toggle: Email OTP vs Password */}
            <div className="flex items-center justify-center gap-4 text-xs font-700 text-muted pb-1 border-b border-line/50">
              <button
                type="button"
                onClick={() => {
                  setSignInMethod('email_otp');
                  setEmailOtpStep(false);
                }}
                className={`pb-1.5 transition-colors relative ${
                  signInMethod === 'email_otp'
                    ? 'text-primary font-800 border-b-2 border-primary -mb-[1px]'
                    : 'hover:text-ink'
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => setSignInMethod('password')}
                className={`pb-1.5 transition-colors relative ${
                  signInMethod === 'password'
                    ? 'text-primary font-800 border-b-2 border-primary -mb-[1px]'
                    : 'hover:text-ink'
                }`}
              >
                Password Login
              </button>
            </div>

            {/* Sub-form 1: Email OTP */}
            {signInMethod === 'email_otp' && (
              <>
                {!emailOtpStep ? (
                  <form onSubmit={handleSendEmailOtp} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email.includes('@')}
                      className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-800 text-sm transition shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Code…</span>
                        </>
                      ) : (
                        <>
                          <span>Receive Email Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-muted text-center">
                      We'll send a 6-digit verification code to your email.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-sm font-800 text-ink block">Enter Verification Code</span>
                      <span className="text-xs text-muted block">
                        Sent to {email}
                      </span>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-3.5 text-center text-2xl font-black tracking-widest rounded-xl bg-surface2 border-2 border-line text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={loading || emailOtp.length < 4}
                        className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-800 text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying…</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <div className="flex items-center justify-between text-xs text-muted pt-1 px-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailOtpStep(false);
                            setEmailOtp('');
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="font-700 hover:text-ink transition"
                        >
                          ← Change Email
                        </button>
                        {emailCountdown > 0 ? (
                          <span className="text-muted font-600">
                            Resend in <span className="font-700 text-primary">{emailCountdown}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleSendEmailOtp}
                            className="font-700 text-primary hover:underline transition flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Sub-form 2: Email or Phone + Password */}
            {signInMethod === 'password' && (
              <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="name@example.com or 9840123456"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
                    />
                    <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
                    />
                    <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier || !loginPassword}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-800 text-sm transition shadow-sm active:scale-98 disabled:opacity-50"
                >
                  {loading ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ===================== MODE 2: CREATE ACCOUNT ===================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            {/* Account Role Selector */}
            <div>
              <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('customer')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    signupRole === 'customer'
                      ? 'bg-primary-soft text-primary border-primary ring-2 ring-primary/20'
                      : 'bg-surface2 text-muted border-line hover:text-ink'
                  }`}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span className="font-800 text-xs block text-ink">Customer</span>
                    <span className="text-[10px] text-muted block">Book services</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('worker')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    signupRole === 'worker'
                      ? 'bg-success-soft text-success border-success ring-2 ring-success/20'
                      : 'bg-surface2 text-muted border-line hover:text-ink'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span className="font-800 text-xs block text-ink">Service Partner</span>
                    <span className="text-[10px] text-muted block">Earn & get jobs</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                Mobile Number (+91)
              </label>
              <div className="flex gap-2">
                <span className="px-3 py-2.5 rounded-xl bg-surface2 border border-line text-xs font-800 text-ink flex items-center flex-shrink-0">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98401 23456"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                Operating City
              </label>
              <select
                value={signupCity}
                onChange={(e) => setSignupCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-line text-sm font-700 text-ink focus:outline-none focus:border-primary transition"
              >
                {Object.values(CITIES).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !signupName || signupPassword.length < 6}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-800 text-sm transition shadow-sm active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Consumer Trust Footer */}
        <div className="mt-6 pt-4 border-t border-line/60 text-center text-[11px] text-muted">
          <span>
            By continuing, you agree to Blink'em{' '}
            <Link to="/terms" className="text-primary font-700 hover:underline">
              Terms of Service
            </Link>{' '}
            &{' '}
            <Link to="/privacy" className="text-primary font-700 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </div>
      </LiquidGlass>
    </div>
  );
}
