import { Mail, PhoneCall } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { subscribeNewsletter } from '../lib/newsletter';
import { trackAppError, trackEvent, trackEventOnce } from '../lib/analytics';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  onOpenEmergency: () => void;
}

export default function Footer({ onOpenEmergency }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error' | 'invalid'>('idle');
  const assetBase = import.meta.env.BASE_URL;

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('invalid');
      return;
    }
    setStatus('loading');
    void trackEvent('cta_clicked', {
      ctaName: 'Subscribe',
      destination: 'newsletter',
    });
    try {
      const result = await subscribeNewsletter(trimmed, document.documentElement.lang || 'en', honeypot);
      setStatus(result === 'already_subscribed' ? 'duplicate' : 'success');
      if (result !== 'already_subscribed') {
        trackEventOnce(`newsletter:${trimmed.toLowerCase()}`, 'newsletter_subscribed', {
          destination: 'newsletter',
          status: 'success',
        });
      }
      setEmail('');
    } catch {
      trackAppError('newsletter_error', {
        destination: 'newsletter',
        context: 'footer_subscribe',
      });
      setStatus('error');
    }
  };

  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-container px-6 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-14 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_auto] md:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <img src={`${assetBase}logo.png`} width="32" height="32" alt="" className="h-8 w-8 rounded-lg" />
              <span className="text-base font-semibold tracking-tight text-ink">ChinaEase Buddy</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-secondary">{t('footer.tagline')}</p>
            <button
              onClick={onOpenEmergency}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-hairline px-3.5 py-2 text-sm font-medium text-jade transition-colors duration-hover ease-out hover:border-jade"
            >
              <PhoneCall className="h-4 w-4" strokeWidth={1.5} />
              {t('footer.emergencyHelp')}
            </button>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-sm font-semibold text-ink">{t('footer.stayInKnow')}</p>
            <form className="mt-4 space-y-2" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="newsletter-email">{t('footer.emailPlaceholder')}</label>
              <label className="flex items-center gap-2 rounded-lg border border-white/60 bg-white/55 px-3 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
                <Mail className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  autoComplete="email"
                  className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-tertiary focus:outline-none"
                />
              </label>
              <input
                type="text"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-lg bg-jade px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-hover ease-out hover:bg-[#0B4145] disabled:opacity-60"
              >
                {status === 'loading' ? t('footer.subscribing') : t('footer.subscribe')}
              </button>
              <p className="text-xs leading-relaxed text-ink-tertiary">{t('footer.subscribeConsent')}</p>
              {status !== 'idle' && status !== 'loading' && (
                <p className={`text-xs font-medium ${status === 'success' || status === 'duplicate' ? 'text-jade' : 'text-red-600'}`} aria-live="polite">
                  {t(`footer.newsletterStatus.${status}`)}
                </p>
              )}
            </form>
          </div>

          {/* Language */}
          <div>
            <p className="text-sm font-semibold text-ink">{t('home.footer.language')}</p>
            <div className="mt-4">
              <LanguageSwitcher direction="up" />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 border-t border-hairline pt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">{t('footer.legalTitle')}</p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-ink-tertiary">{t('footer.legalBody')}</p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-tertiary">{t('footer.rights')}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <a href="/privacy" className="text-ink-tertiary transition-colors duration-hover ease-out hover:text-ink">{t('footer.privacy')}</a>
            <a href="/terms" className="text-ink-tertiary transition-colors duration-hover ease-out hover:text-ink">{t('footer.terms')}</a>
            <a href="/refund" className="text-ink-tertiary transition-colors duration-hover ease-out hover:text-ink">{t('footer.refundPolicy')}</a>
            <a href="/contact" className="text-ink-tertiary transition-colors duration-hover ease-out hover:text-ink">{t('footer.contactUs')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
