import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export default function CampaignShell({ children, compactFooter = true }: { children: ReactNode; compactFooter?: boolean }) {
  const { t, i18n } = useTranslation('campaign');
  const assetBase = import.meta.env.BASE_URL;
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';
  const changeLanguage = (next: 'en' | 'zh') => {
    window.localStorage.setItem('chinaease-lang', next);
    void i18n.changeLanguage(next);
    document.documentElement.lang = next;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas font-sans text-ink">
      <header className="border-b border-hairline bg-[#FFFDFA]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6 md:px-8">
          <a href="/" aria-label={t('brandHome')} className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade">
            <img src={`${assetBase}logo.png`} width="32" height="32" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-sm font-semibold tracking-tight sm:text-base">ChinaEase Buddy</span>
          </a>
          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-white p-1" aria-label={t('language')}>
            {(['en', 'zh'] as const).map((code) => (
              <button key={code} type="button" onClick={() => changeLanguage(code)} aria-pressed={language === code} className={`min-h-9 rounded-md px-3 text-xs font-semibold transition ${language === code ? 'bg-jade text-white' : 'text-ink-secondary hover:bg-jade-wash'}`}>
                {code === 'en' ? 'EN' : '中文'}
              </button>
            ))}
          </div>
        </div>
      </header>
      {children}
      {compactFooter && (
        <footer className="border-t border-hairline bg-surface">
          <div className="mx-auto flex max-w-container flex-col gap-4 px-4 py-8 text-xs text-ink-tertiary sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
            <p>© 2026 ChinaEase Buddy</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a href="/privacy/" className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-jade">{t('privacy')}</a>
              <a href="/terms/" className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-jade">{t('terms')}</a>
              <a href="/contact/" className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-jade">{t('contact')}</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
