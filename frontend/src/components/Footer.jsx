import { Link } from 'react-router-dom';
import BrandIcon from './BrandIcon';
import { t } from '../i18n';

const STORES = [
  { key: 'apple', href: 'https://apps.apple.com', small: 'footer_download_on', big: 'footer_app_store' },
  { key: 'googleplay', href: 'https://play.google.com', small: 'footer_get_it_on', big: 'footer_google_play' },
];

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { key: 'x', label: 'X', href: 'https://x.com' },
  { key: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
  { key: 'threads', label: 'Threads', href: 'https://threads.net' },
];

export default function Footer() {
  return (
    <footer className="site-footer" data-name="site footer">
      <div className="site-footer-inner">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs text-muted">
          <p className="footer-copyright">{t('footer_copyright')}</p>
          <span className="hidden sm:inline opacity-40">•</span>
          <div className="flex items-center gap-3 font-600">
            <Link to="/terms" className="hover:text-ink hover:underline transition">
              Terms of Service
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/privacy" className="hover:text-ink hover:underline transition">
              Privacy Policy
            </Link>
          </div>
        </div>

        <div className="footer-download" data-name="download app">
          <span className="footer-download-label">{t('footer_download_app')}</span>
          {STORES.map((store) => (
            <a
              key={store.key}
              href={store.href}
              target="_blank"
              rel="noreferrer"
              className="store-badge"
              aria-label={t(store.big)}
            >
              <BrandIcon name={store.key} className="store-badge-icon" />
              <span className="store-badge-copy">
                <small>{t(store.small)}</small>
                <strong>{t(store.big)}</strong>
              </span>
            </a>
          ))}
        </div>

        <nav className="footer-socials" aria-label={t('footer_socials')}>
          {SOCIALS.map((social) => (
            <a
              key={social.key}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="social-circle"
              aria-label={social.label}
              title={social.label}
            >
              <BrandIcon name={social.key} className="social-circle-icon" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
