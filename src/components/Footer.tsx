import { Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../App';

interface Props {
  onTabChange: (tab: TabId) => void;
  onAskBuddy?: () => void;
}

export default function Footer({ onTabChange, onAskBuddy }: Props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState<'cookies' | null>(null);
  const [email, setEmail] = useState('');
  const assetBase = import.meta.env.BASE_URL;

  const scrollToTabs = () => {
    document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTab = (tab: TabId) => {
    onTabChange(tab);
    window.setTimeout(scrollToTabs, 0);
  };

  return (
    <footer className="relative overflow-hidden bg-[#061e1f] text-white/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(214,168,90,0.13),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(18,123,120,0.22),transparent_32%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-12 md:px-6 md:py-14">
        <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.3fr_2fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src={`${assetBase}logo.png`} width="40" height="40" alt="ChinaEase Buddy" className="h-10 w-10 rounded-xl ring-1 ring-white/15" />
              <span className="text-lg font-semibold tracking-tight text-white">ChinaEase Buddy</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
            <div className="space-y-2.5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#e8c27a]">{t('footer.product')}</p>
              <button onClick={scrollToTabs} className="block text-left transition-colors hover:text-white">{t('footer.tools')}</button>
              <button onClick={onAskBuddy ?? (() => goToTab('food'))} className="block text-left transition-colors hover:text-white">{t('footer.askBuddy')}</button>
              <a href="/china-travel-apps" className="block transition-colors hover:text-white">{t('footer.guides')}</a>
              <a href="/china-travel-checklist" className="block transition-colors hover:text-white">{t('footer.destinations')}</a>
            </div>
            <div className="space-y-2.5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#e8c27a]">{t('footer.support')}</p>
              <button onClick={scrollToTabs} className="block text-left transition-colors hover:text-white">{t('footer.helpCenter')}</button>
              <a href="/contact" className="block transition-colors hover:text-white">{t('footer.contactUs')}</a>
              <button onClick={() => goToTab('emergency')} className="block text-left transition-colors hover:text-white">{t('footer.emergencyHelp')}</button>
              <a href="/contact" className="block transition-colors hover:text-white">{t('footer.feedback')}</a>
            </div>
            <div className="space-y-2.5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#e8c27a]">{t('footer.company')}</p>
              <a href="/about" className="block transition-colors hover:text-white">{t('footer.aboutUs')}</a>
              <a href="/contact" className="block transition-colors hover:text-white">{t('footer.careers')}</a>
              <a href="/contact" className="block transition-colors hover:text-white">{t('footer.press')}</a>
              <a href="/contact" className="block transition-colors hover:text-white">{t('footer.partnerships')}</a>
            </div>
            <div className="space-y-2.5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#e8c27a]">{t('footer.legalColumn')}</p>
              <a href="/terms" className="block transition-colors hover:text-white">{t('footer.terms')}</a>
              <a href="/privacy" className="block transition-colors hover:text-white">{t('footer.privacy')}</a>
              <a href="/refund" className="block transition-colors hover:text-white">{t('footer.refundPolicy')}</a>
              <button onClick={() => setModal('cookies')} className="block text-left transition-colors hover:text-white">{t('footer.cookies')}</button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c27a]">{t('footer.stayInKnow')}</p>
            <form
              className="mt-4 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                alert(t('footer.subscribeThanks'));
                setEmail('');
              }}
            >
              <label className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-2.5 text-sm text-white/80 backdrop-blur-xl">
                <Mail className="h-4 w-4 text-[#e8c27a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
              </label>
              <button className="w-full rounded-full bg-[#e8c27a] px-4 py-2.5 text-sm font-bold text-[#061e1f] transition-colors hover:bg-[#f4d78f]">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="mb-6 mt-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-white/40" />
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t('footer.legalTitle')}</p>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">
            {t('footer.legalBody')}
          </p>
        </div>

        {/* Refund policy */}
        <div className="mb-8">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">{t('footer.refundTitle')}</p>
          <p className="text-white/50 text-xs leading-relaxed">
            {t('footer.refundBody')}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10">
          <p className="text-white/40 text-xs">{t('footer.rights')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <a href="/privacy" className="text-white/50 hover:text-white/75 transition-colors">{t('footer.privacy')}</a>
            <a href="/terms" className="text-white/50 hover:text-white/75 transition-colors">{t('footer.terms')}</a>
            <a href="/refund" className="text-white/50 hover:text-white/75 transition-colors">{t('footer.refundPolicy')}</a>
            <button onClick={() => setModal('cookies')} className="text-white/50 hover:text-white/75 transition-colors">{t('footer.cookies')}</button>
          </div>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white text-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3 text-[#155e63]">
              {t('footer.cookies')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">{t('footer.cookiesBody')}</p>
            <button onClick={() => setModal(null)} className="mt-5 w-full bg-[#155e63] text-white rounded-xl py-2.5 text-sm font-medium">
              {t('footer.close')}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
