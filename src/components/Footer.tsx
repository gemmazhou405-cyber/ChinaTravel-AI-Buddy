import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0a2829] text-white/60">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" width="32" height="32" alt="ChinaEase Buddy" style={{ borderRadius: '6px' }} />
              <span className="text-white font-semibold text-base tracking-tight">ChinaEase Buddy</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
          <div className="flex gap-6 text-xs">
            <div className="space-y-2">
              <p className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-3">{t('footer.product')}</p>
              <a href="#" className="block hover:text-white transition-colors">{t('footer.features')}</a>
              <a href="#" className="block hover:text-white transition-colors">{t('footer.pricing')}</a>
              <a href="#" className="block hover:text-white transition-colors">{t('footer.download')}</a>
            </div>
            <div className="space-y-2">
              <p className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-3">{t('footer.support')}</p>
              <a href="#" className="block hover:text-white transition-colors">{t('footer.helpCenter')}</a>
              <a href="#" className="block hover:text-white transition-colors">{t('footer.contact')}</a>
              <a href="#" className="block hover:text-white transition-colors">{t('footer.status')}</a>
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
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">{t('footer.terms')}</a>
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
