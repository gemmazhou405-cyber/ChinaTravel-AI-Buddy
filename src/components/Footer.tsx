import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../App';

interface Props {
  onTabChange: (tab: TabId) => void;
}

export default function Footer({ onTabChange }: Props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState<'cookies' | null>(null);
  const assetBase = import.meta.env.BASE_URL;

  const scrollToTabs = () => {
    document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTab = (tab: TabId) => {
    onTabChange(tab);
    window.setTimeout(scrollToTabs, 0);
  };

  const downloadInstructions = () => {
    alert(t('footer.downloadInstructions'));
  };

  return (
    <footer className="bg-[#0a2829] text-white/60">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-10">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={`${assetBase}logo.png`} width="32" height="32" alt="ChinaEase Buddy" style={{ borderRadius: '6px' }} />
              <span className="text-white font-semibold text-base tracking-tight">ChinaEase Buddy</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
          <div className="flex gap-6 text-xs">
            <div className="space-y-2">
              <p className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-3">{t('footer.product')}</p>
              <button onClick={() => goToTab('food')} className="block hover:text-white transition-colors text-left">{t('footer.features')}</button>
              <a href="/about" className="block hover:text-white transition-colors text-left">{t('footer.about')}</a>
              <a href="/pricing" className="block hover:text-white transition-colors text-left">{t('footer.pricing')}</a>
              <button onClick={downloadInstructions} className="block hover:text-white transition-colors text-left">{t('footer.download')}</button>
            </div>
            <div className="space-y-2">
              <p className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-3">{t('footer.support')}</p>
              <button onClick={scrollToTabs} className="block hover:text-white transition-colors text-left">{t('footer.helpCenter')}</button>
              <a href="/contact" className="block hover:text-white transition-colors">{t('footer.contact')}</a>
              <a href="/contact" className="block hover:text-white transition-colors">{t('footer.status')}</a>
            </div>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-white/40" />
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t('footer.legalTitle')}</p>
          </div>
          <p className="text-white/30 text-xs leading-relaxed">
            {t('footer.legalBody')}
          </p>
        </div>

        {/* Refund policy */}
        <div className="mb-8">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">{t('footer.refundTitle')}</p>
          <p className="text-white/30 text-xs leading-relaxed">
            {t('footer.refundBody')}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10">
          <p className="text-white/25 text-xs">{t('footer.rights')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <a href="/privacy" className="text-white/30 hover:text-white/60 transition-colors">{t('footer.privacy')}</a>
            <a href="/terms" className="text-white/30 hover:text-white/60 transition-colors">{t('footer.terms')}</a>
            <a href="/refund" className="text-white/30 hover:text-white/60 transition-colors">{t('footer.refundPolicy')}</a>
            <button onClick={() => setModal('cookies')} className="text-white/30 hover:text-white/60 transition-colors">{t('footer.cookies')}</button>
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
