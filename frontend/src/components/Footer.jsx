import { Download, ExternalLink, Globe2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { t } from '../i18n';

export default function Footer() {
  const { pathname } = useLocation();
  const showDownload = pathname === '/profile';

  return (
    <footer className="site-footer" data-name="site footer">
      <div className="site-footer-inner">
        {showDownload && (
          <section className="footer-download" data-name="download app section">
            <div className="footer-download-icon"><Download className="h-5 w-5" /></div>
            <div className="footer-download-copy"><strong>{t('footer_download_title')}</strong><span>{t('footer_download_hint')}</span></div>
            <div className="footer-download-actions">
              <a href="#download-ios" onClick={(event) => event.preventDefault()}>{t('footer_app_store')}</a>
              <a href="#download-android" onClick={(event) => event.preventDefault()}>{t('footer_google_play')}</a>
            </div>
          </section>
        )}
        <div className="footer-base">
          <span>{t('footer_copyright')}</span>
          <div className="footer-links">
            <a href="https://blinkem.in" target="_blank" rel="noreferrer"><Globe2 className="h-4 w-4" />{t('footer_website')}</a>
            <a href="https://github.com/Firex-007/Blinkem" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />{t('footer_project')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
