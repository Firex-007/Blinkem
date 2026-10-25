import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, User, Building2, ArrowRight, Check, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginModal({ open, onClose }) {
  const { setUserId } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState('demo'); // 'demo' | 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  if (!open) return null;

  const handleSelectRole = (roleId, path) => {
    setUserId(roleId);
    onClose();
    navigate(path);
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setOtpStep(true);
    }
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      setUserId('1');
      onClose();
      navigate('/');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] rounded-t-[28px] glass-card border-t border-l border-r border-line shadow-2xl z-50 p-6 flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h2 className="font-800 text-ink text-lg">Welcome to Blink'em</h2>
            <p className="text-xs text-muted">Hyperlocal blue-collar services across Chennai</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-surface2 rounded-chip border border-line my-4">
          <button
            onClick={() => setTab('demo')}
            className={`py-2 text-xs font-700 rounded-chip transition ${
              tab === 'demo' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
            }`}
          >
            Demo Quick Access
          </button>
          <button
            onClick={() => setTab('phone')}
            className={`py-2 text-xs font-700 rounded-chip transition ${
              tab === 'phone' ? 'bg-surface text-ink shadow-sm' : 'text-muted'
            }`}
          >
            Phone & OTP
          </button>
        </div>

        {tab === 'demo' ? (
          <div className="space-y-2.5">
            <span className="text-[11px] font-700 text-muted uppercase tracking-wider block">
              Instant Persona Switch
            </span>

            {/* Customer */}
            <button
              onClick={() => handleSelectRole('1', '/')}
              className="w-full flex items-center gap-3 p-3 rounded-card bg-surface hover:bg-surface2 border border-line transition text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-800 text-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-800 text-sm text-ink block">Customer • Priya S</span>
                <span className="text-xs text-muted block">Book plumbers, electricians with voice/tap</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-1 transition" />
            </button>

            {/* Worker */}
            <button
              onClick={() => handleSelectRole('3', '/worker')}
              className="w-full flex items-center gap-3 p-3 rounded-card bg-surface hover:bg-surface2 border border-line transition text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-success-soft text-success flex items-center justify-center font-800 text-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-800 text-sm text-ink block">Worker • Muthu K (Plumber)</span>
                <span className="text-xs text-muted block">Online toggle, send quotes, enter start OTP</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-success group-hover:translate-x-1 transition" />
            </button>

            {/* Admin */}
            <button
              onClick={() => handleSelectRole('99', '/admin')}
              className="w-full flex items-center gap-3 p-3 rounded-card bg-surface hover:bg-surface2 border border-line transition text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-800 text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-800 text-sm text-ink block">Admin • Meera R</span>
                <span className="text-xs text-muted block">Verify KYC documents, live dispatches & stats</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-purple-600 group-hover:translate-x-1 transition" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {!otpStep ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <label className="text-xs font-700 text-muted uppercase tracking-wider block">
                  Enter Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 rounded-chip bg-surface2 border border-line text-sm font-700 text-ink">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98401 23456"
                    className="flex-1 px-4 py-2.5 rounded-chip bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary font-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneNumber.length < 10}
                  className="w-full py-3 rounded-chip bg-primary text-onprimary font-700 text-sm hover:bg-primary600 transition disabled:opacity-50"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-3">
                <div className="text-center space-y-1">
                  <span className="text-sm font-800 text-ink block">Enter 4-Digit OTP</span>
                  <span className="text-xs text-muted block">
                    Sent to +91 {phoneNumber} (Use demo OTP: 1234)
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="• • • •"
                  className="w-full py-3 text-center text-2xl font-800 tracking-widest rounded-chip bg-surface2 border border-line text-ink focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={otp.length !== 4}
                  className="w-full py-3 rounded-chip bg-primary text-onprimary font-700 text-sm hover:bg-primary600 transition disabled:opacity-50"
                >
                  Verify & Enter
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
