import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../App';

interface Props {
  onTabChange: (tab: TabId) => void;
}

const LEGAL_TEXT = {
  privacy: 'ChinaEase Buddy collects only your email and usage data to provide AI services. We never sell your data. Stored securely on Google Firebase. Request deletion: gemmazhou405@gmail.com',
  terms: 'AI responses are for informational purposes only. Not a substitute for professional advice. 3-day refund policy applies to all paid plans.',
  cookies: 'We use essential cookies only: auth session and language preference. No advertising cookies.',
};

export default function Footer({ onTabChange }: Props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState<keyof typeof LEGAL_TEXT | null>(null);
  const assetBase = import.meta.env.BASE_URL;

  const scrollToTabs = () => {
    document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToTab = (tab: TabId) => {
    onTabChange(tab);
    window.setTimeout(scrollToTabs, 0);
  };

  const downloadInstructions = () => {
    alert('Open this site in your mobile browser and tap Share → Add to Home Screen');
  };

  return (
    <footer className="bg-[#0a2829] text-white/60">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
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
              <button onClick={() => goToTab('pay')} className="block hover:text-white transition-colors text-left">{t('footer.pricing')}</button>
              <button onClick={downloadInstructions} className="block hover:text-white transition-colors text-left">{t('footer.download')}</button>
            </div>
            <div className="space-y-2">
              <p className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-3">{t('footer.support')}</p>
              <button onClick={scrollToTabs} className="block hover:text-white transition-colors text-left">{t('footer.helpCenter')}</button>
              <a href="mailto:gemmazhou405@gmail.com" className="block hover:text-white transition-colors">{t('footer.contact')}</a>
              <a href="mailto:gemmazhou405@gmail.com" className="block hover:text-white transition-colors">{t('footer.status')}</a>
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
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setModal('privacy')} className="text-white/30 hover:text-white/60 transition-colors">{t('footer.privacy')}</button>
            <button onClick={() => setModal('terms')} className="text-white/30 hover:text-white/60 transition-colors">{t('footer.terms')}</button>
            <button onClick={() => setModal('cookies')} className="text-white/30 hover:text-white/60 transition-colors">{t('footer.cookies')}</button>
          </div>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white text-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3 text-[#155e63]">
              {modal === 'privacy' ? t('footer.privacy') : modal === 'terms' ? t('footer.terms') : t('footer.cookies')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">{LEGAL_TEXT[modal]}</p>
            <button onClick={() => setModal(null)} className="mt-5 w-full bg-[#155e63] text-white rounded-xl py-2.5 text-sm font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
