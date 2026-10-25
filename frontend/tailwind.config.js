/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', surface2: 'var(--surface-2)',
        ink: 'var(--text)', muted: 'var(--muted)', line: 'var(--border)',
        primary: 'var(--primary)', primary600: 'var(--primary-600)',
        onprimary: 'var(--primary-ink)', soft: 'var(--primary-soft)',
        accent: 'var(--accent)', onaccent: 'var(--accent-ink)',
        success: 'var(--success)', successsoft: 'var(--success-soft)',
        warning: 'var(--warning)', danger: 'var(--danger)', dangersoft: 'var(--danger-soft)',
      },
      fontFamily: {
        uber: ["'Outfit'", "'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        display: ["'Outfit'", "'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        sans: ["'Plus Jakarta Sans'", "'Outfit'", 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: 'var(--radius)', chip: 'var(--radius-sm)' },
      boxShadow: { card: 'var(--shadow)', sm2: 'var(--shadow-sm)' },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(.9)', opacity: '.6' }, '100%': { transform: 'scale(1.8)', opacity: '0' } },
        wave: { '0%,100%': { transform: 'scaleY(.3)' }, '50%': { transform: 'scaleY(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        slideUp: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        slideLeft: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        scaleUp: { '0%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: '0' }, '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' } },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s ease-out infinite',
        wave: 'wave 1s ease-in-out infinite',
        shimmer: 'shimmer 1.4s infinite',
        slideUp: 'slideUp .28s cubic-bezier(.2,.8,.2,1)',
        slideLeft: 'slideLeft .3s cubic-bezier(.16, 1, 0.3, 1)',
        scaleUp: 'scaleUp .2s cubic-bezier(.16, 1, 0.3, 1)',
        fade: 'fade .2s ease-out',
      },
    },
  },
  plugins: [],
};
