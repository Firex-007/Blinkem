import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  signInUser,
  verifyPhoneLogin,
  registerUser,
} from '../utils/supabase';
import LiquidGlass from './LiquidGlass';

export default function LoginModal({ open, onClose }) {
  const { loginUser, location } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState('phone'); // 'phone' | 'password' | 'signup'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('customer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setError('');
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpStep(true);
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyPhoneLogin({ phone: phoneNumber, otp });
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

          {/* Tab Switcher */}
          <div className="grid grid-cols-3 p-1 bg-surface2/80 rounded-xl border border-line my-3 text-xs font-700">
            <button
              onClick={() => {
                setTab('phone');
                setError('');
                setOtpStep(false);
              }}
              className={`py-2 rounded-lg transition ${
                tab === 'phone' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              Phone OTP
            </button>
            <button
              onClick={() => {
                setTab('password');
                setError('');
              }}
              className={`py-2 rounded-lg transition ${
                tab === 'password' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              Password
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

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PHONE OTP */}
          {tab === 'phone' && (
            <div className="space-y-3 py-1">
              {!otpStep ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-3">
                  <label className="text-xs font-700 text-muted uppercase tracking-wider block">
                    Enter Mobile Number
                  </label>
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
                    disabled={phoneNumber.length < 10}
                    className="w-full py-3 rounded-xl bg-primary text-onprimary font-800 text-sm hover:bg-primary600 transition disabled:opacity-50"
                  >
                    Send OTP
                  </button>
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
                    className="w-full py-3 rounded-xl bg-primary text-onprimary font-800 text-sm hover:bg-primary600 transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying…' : 'Verify & Enter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="w-full text-xs font-700 text-muted hover:text-ink transition py-1 text-center"
                  >
                    Change Number
                  </button>
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
        </LiquidGlass>
      </div>
    </>
  );
}
