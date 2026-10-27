import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  registerUser,
  signInUser,
  verifyPhoneLogin,
  isSupabaseConfigured,
} from '../../utils/supabase';
import { CITIES } from '../../data/cities';
import LiquidGlass from '../../components/LiquidGlass';
import { t } from '../../i18n';

export default function Login() {
  const { loginUser, isAuthenticated, location: appLocation } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [signInMethod, setSignInMethod] = useState('phone'); // 'phone' | 'password'

  // Sign In Form States
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

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

  const supabaseActive = isSupabaseConfigured();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const dest = location.state?.from || (signupRole === 'worker' ? '/worker' : '/');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, navigate, location, signupRole]);

  // Handle Phone OTP Send
  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpStep(true);
    setSuccessMessage(`OTP sent to +91 ${clean.slice(-10)}`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Handle Phone OTP Verify
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await verifyPhoneLogin({ phone: phoneNumber, otp });
      if (res.success && res.user) {
        loginUser(res.user);
        navigate(res.user.role === 'worker' ? '/worker' : '/');
      }
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed. Please try again.');
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

        {/* ===================== MODE 1: SIGN IN ===================== */}
        {mode === 'signin' && (
          <div className="space-y-4">
            {/* Method Toggle: Mobile OTP vs Password */}
            <div className="flex items-center justify-center gap-4 text-xs font-700 text-muted pb-1 border-b border-line/50">
              <button
                type="button"
                onClick={() => {
                  setSignInMethod('phone');
                  setOtpStep(false);
                }}
                className={`pb-1.5 transition-colors relative ${
                  signInMethod === 'phone'
                    ? 'text-primary font-800 border-b-2 border-primary -mb-[1px]'
                    : 'hover:text-ink'
                }`}
              >
                Phone OTP
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

            {/* Sub-form 1: Phone OTP */}
            {signInMethod === 'phone' && (
              <>
                {!otpStep ? (
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-800 text-muted uppercase tracking-wider block mb-1.5">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <span className="px-3.5 py-3 rounded-xl bg-surface2 border border-line text-xs font-800 text-ink flex items-center flex-shrink-0">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="98401 23456"
                          className="flex-1 px-3.5 py-3 rounded-xl bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-700 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phoneNumber.length < 10}
                      className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-800 text-sm transition shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-sm font-800 text-ink block">Enter Verification Code</span>
                      <span className="text-xs text-muted block">
                        Sent to +91 {phoneNumber}
                      </span>
                      <span className="inline-block mt-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        Test code: 1234
                      </span>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-3.5 text-center text-2xl font-black tracking-widest rounded-xl bg-surface2 border-2 border-line text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={loading || otp.length < 4}
                        className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary600 text-onprimary font-800 text-sm transition shadow-sm disabled:opacity-50"
                      >
                        {loading ? 'Verifying…' : 'Verify & Enter'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep(false);
                          setOtp('');
                        }}
                        className="text-xs font-700 text-muted hover:text-primary transition py-1"
                      >
                        Change Phone Number
                      </button>
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

        {/* Security & Database Status Footer */}
        <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-primary" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span className="font-700 text-primary">
            {supabaseActive ? 'Supabase Auth' : 'Blink\'em Secure'}
          </span>
        </div>
      </LiquidGlass>
    </div>
  );
}
