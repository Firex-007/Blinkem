import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, User, Building2, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';

const ROLES = [
  {
    id: '1',
    label: 'Customer',
    desc: 'Book plumbers, electricians & more with voice/tap',
    icon: <User className="w-5 h-5" />,
    color: 'bg-primary-soft text-primary',
    path: '/',
  },
  {
    id: '3',
    label: 'Worker',
    desc: 'Online toggle, send quotes, enter start OTP',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'bg-success-soft text-success',
    path: '/worker',
  },
  {
    id: '99',
    label: 'Admin',
    desc: 'Verify KYC, live dispatches & metrics',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300',
    path: '/admin',
  },
];

export default function Login() {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState('roles');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);

  // Auth guard: redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (id, path) => {
    login(id);
    navigate(path);
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) setOtpStep(true);
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      login('1');
      navigate('/');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-bg flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.08] blur-[120px] -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-[100px] -mb-24 pointer-events-none" />

      <div className="w-full max-w-md glass-card border border-line shadow-card p-8 relative z-10 rounded-[28px]">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-amber-500/10 border border-amber-500/20 shadow-[0_8px_20px_rgba(245,158,11,0.2)]">
            <img
              src="/logo-mark.png"
              alt="Blink'em Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="flex items-center justify-center tracking-[-0.03em] font-black leading-none mb-2">
            <span className="text-3xl font-black text-ink uppercase">BLINK</span>
            <span className="text-3xl font-black text-amber-500 dark:text-amber-400 uppercase ml-[2px]">'EM</span>
          </div>
          <p className="text-muted text-sm leading-relaxed">{t('app_tagline')}</p>
        </div>

        <div className="space-y-5">
          {tab === 'roles' && (
            <div className="space-y-3">
              <span className="text-[11px] font-700 text-muted uppercase tracking-wider block mb-4">
                {t('choose_role')}
              </span>
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id, role.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-surface hover:bg-surface2 border border-line transition-all duration-200 text-left group hover:border-primary/30 hover:shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl ${role.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {role.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-800 text-sm text-ink block leading-tight">{role.label}</span>
                    <span className="text-xs text-muted block mt-0.5 leading-relaxed">{role.desc}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-line" />
                <span className="text-xs text-muted font-600">{t('or')}</span>
                <div className="flex-1 h-px bg-line" />
              </div>
              <button
                onClick={() => setTab('phone')}
                className="w-full py-3.5 rounded-[14px] bg-surface2 border border-line text-sm font-700 text-muted hover:text-ink hover:bg-surface hover:border-primary/30 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> {t('phone_login')}
              </button>
            </div>
          )}

          {tab === 'phone' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setTab('roles'); setOtpStep(false); }}
                  className="w-9 h-9 rounded-full bg-surface2 hover:bg-soft text-muted hover:text-ink flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-700 text-muted uppercase tracking-wider">
                  {t('phone_login')}
                </span>
              </div>
              {!otpStep ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <label className="text-xs font-700 text-muted uppercase tracking-wider block">
                    {t('enter_mobile')}
                  </label>
                  <div className="flex gap-2">
                    <span className="px-4 py-3 rounded-[14px] bg-surface2 border border-line text-sm font-700 text-ink flex-shrink-0">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98401 23456"
                      className="flex-1 px-4 py-3 rounded-[14px] bg-surface2 border border-line text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-600 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={phoneNumber.length < 10}
                    className="w-full py-3.5 rounded-[14px] bg-primary text-onprimary font-700 text-sm hover:bg-primary600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('send_otp')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div className="text-center space-y-2">
                    <span className="text-sm font-800 text-ink block">{t('enter_otp')}</span>
                    <span className="text-xs text-muted block leading-relaxed">{t('otp_sent_to', { phone: phoneNumber })}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-700 border border-primary/20">
                      Demo code: 1234
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="· · · ·"
                    inputMode="numeric"
                    style={{ letterSpacing: '0.5em' }}
                    className="w-full py-4 text-center text-3xl font-800 rounded-[14px] bg-surface2 border-2 border-line text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button type="submit" disabled={otp.length !== 4} className="w-full py-3.5 rounded-[14px] bg-primary text-onprimary font-700 text-sm hover:bg-primary600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('verify_enter')}
                  </button>
                  <button type="button" onClick={() => setOtpStep(false)} className="w-full py-2.5 rounded-[14px] text-sm font-700 text-muted hover:text-primary transition">
                    {t('change_number')}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-line/60 flex items-center justify-center gap-2 text-xs text-muted">
          <span>{t('demo_mode')}</span>
          <span className="text-primary font-700">No password needed</span>
        </div>
      </div>
    </div>
  );
}
