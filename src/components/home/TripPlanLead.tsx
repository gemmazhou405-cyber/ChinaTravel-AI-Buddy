import { ArrowRight, Check, Mail, MessageCircle, Send } from 'lucide-react';
import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { markFunnelOnce, trackEvent, trackEventOnce } from '../../lib/analytics';
import { isValidWhatsApp, submitTripLead } from '../../lib/tripLead';

type ContactMethod = 'email' | 'whatsapp';
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

function createRequestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function TripPlanLead() {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const [email, setEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('');
  const [helpWith, setHelpWith] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<'email' | 'whatsapp' | 'generic' | null>(null);

  useEffect(() => {
    if (markFunnelOnce('lead_homepage_shown')) {
      trackEventOnce('lead-homepage-shown', 'lead_cta_shown', { trigger: 'homepage_trip_plan' });
    }
  }, []);

  const resetForm = () => {
    setEmail('');
    setTravelDate('');
    setTravelers('');
    setHelpWith('');
    setWhatsapp('');
    setContactMethod('email');
    setStatus('idle');
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('email');
      return;
    }
    if (contactMethod === 'whatsapp' && !isValidWhatsApp(whatsapp)) {
      setError('whatsapp');
      return;
    }

    setStatus('submitting');
    setError(null);
    if (markFunnelOnce('lead_homepage_submit_started')) {
      void trackEvent('lead_submit_started', { trigger: 'homepage_trip_plan' });
    }

    const travelerCount = travelers ? parseInt(travelers, 10) : undefined;
    const result = await submitTripLead({
      requestId: createRequestId(),
      email: emailTrimmed,
      travelDate: travelDate.trim() || undefined,
      travelers: travelerCount && travelerCount >= 1 && travelerCount <= 20 ? travelerCount : undefined,
      helpWith: helpWith.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      contactMethod,
    });

    if (result === 'success') {
      setStatus('success');
      void trackEvent('lead_submit_success', { trigger: 'homepage_trip_plan' });
      return;
    }

    setStatus('error');
    setError(result === 'too_many' ? 'generic' : 'generic');
    void trackEvent('lead_submit_failed', { trigger: 'homepage_trip_plan', errorCode: result });
  };

  return (
    <section
      ref={ref}
      id="trip-plan"
      className={`scroll-mt-20 bg-jade-wash py-16 md:py-24 ${revealed ? 'motion-reveal-on' : ''}`}
    >
      <div className="mx-auto grid max-w-container gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8">
        <div className="motion-reveal-item">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jade">{t('home.tripPlan.kicker')}</p>
          <h2 className="mt-4 max-w-[34rem] font-display text-3xl font-normal leading-[1.08] tracking-[-0.01em] text-ink md:text-[44px]">
            {t('home.tripPlan.title')}
          </h2>
          <p className="mt-4 max-w-[31rem] text-base leading-relaxed text-ink-secondary md:text-lg">
            {t('home.tripPlan.description')}
          </p>
          <ul className="mt-7 space-y-3">
            {(['item1', 'item2', 'item3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-ink md:text-base">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                <span>{t(`home.tripPlan.${key}`)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-7 max-w-[31rem] text-xs leading-relaxed text-ink-tertiary">{t('home.tripPlan.note')}</p>
        </div>

        <div className="motion-reveal-item glass rounded-2xl p-5 md:p-8" style={{ '--reveal-index': 2 } as CSSProperties}>
          {status === 'success' ? (
            <div className="flex min-h-[360px] flex-col items-start justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jade text-white">
                <Check className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <h3 className="mt-5 font-display text-2xl text-ink md:text-3xl">{t('home.tripPlan.successTitle')}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-secondary md:text-base">{t('home.tripPlan.success')}</p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-jade/30 px-4 py-2.5 text-sm font-semibold text-jade transition-colors duration-hover ease-out hover:bg-jade hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
              >
                {t('home.tripPlan.submitAnother')}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade text-white">
                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{t('home.tripPlan.formTitle')}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{t('home.tripPlan.formSubtitle')}</p>
                </div>
              </div>

              {error && (
                <p role="alert" aria-live="assertive" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {t(error === 'email' ? 'lead.errorEmail' : error === 'whatsapp' ? 'lead.errorWhatsApp' : 'lead.errorGeneric')}
                </p>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="homepage-lead-email" className="text-xs font-semibold text-ink">
                    {t('lead.fieldEmail')} *
                  </label>
                  <input
                    id="homepage-lead-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={status === 'submitting'}
                    maxLength={160}
                    style={{ fontSize: '16px' }}
                    className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label htmlFor="homepage-lead-date" className="text-xs font-semibold text-ink">{t('lead.fieldDate')}</label>
                  <input
                    id="homepage-lead-date"
                    type="text"
                    autoComplete="off"
                    value={travelDate}
                    onChange={(event) => setTravelDate(event.target.value)}
                    disabled={status === 'submitting'}
                    maxLength={80}
                    placeholder={t('lead.fieldDatePlaceholder')}
                    style={{ fontSize: '16px' }}
                    className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label htmlFor="homepage-lead-travelers" className="text-xs font-semibold text-ink">{t('lead.fieldTravelers')}</label>
                  <input
                    id="homepage-lead-travelers"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={20}
                    step={1}
                    value={travelers}
                    onChange={(event) => setTravelers(event.target.value)}
                    disabled={status === 'submitting'}
                    style={{ fontSize: '16px' }}
                    className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="homepage-lead-help" className="text-xs font-semibold text-ink">{t('lead.fieldHelp')}</label>
                  <textarea
                    id="homepage-lead-help"
                    rows={3}
                    maxLength={500}
                    value={helpWith}
                    onChange={(event) => setHelpWith(event.target.value)}
                    disabled={status === 'submitting'}
                    placeholder={t('lead.fieldHelpPlaceholder')}
                    style={{ fontSize: '16px' }}
                    className="mt-1 w-full resize-none rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                  />
                  <p className="mt-0.5 text-right text-xs text-ink-tertiary">{t('lead.fieldHelpCount', { count: helpWith.length })}</p>
                </div>
              </div>

              <fieldset className="mt-5">
                <legend className="text-xs font-semibold text-ink">{t('lead.contactMethod')}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${contactMethod === 'email' ? 'border-jade/40 bg-white/75 text-ink' : 'border-hairline bg-white/35 text-ink-secondary'}`}>
                    <input
                      type="radio"
                      name="homepage-contact-method"
                      value="email"
                      checked={contactMethod === 'email'}
                      onChange={() => setContactMethod('email')}
                      disabled={status === 'submitting'}
                      className="accent-[#0F5257]"
                    />
                    <Mail className="h-4 w-4 text-jade" strokeWidth={1.5} />
                    <span>{t('lead.contactEmailOption')}</span>
                  </label>
                  <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${contactMethod === 'whatsapp' ? 'border-jade/40 bg-white/75 text-ink' : 'border-hairline bg-white/35 text-ink-secondary'}`}>
                    <input
                      type="radio"
                      name="homepage-contact-method"
                      value="whatsapp"
                      checked={contactMethod === 'whatsapp'}
                      onChange={() => setContactMethod('whatsapp')}
                      disabled={status === 'submitting'}
                      className="accent-[#0F5257]"
                    />
                    <MessageCircle className="h-4 w-4 text-jade" strokeWidth={1.5} />
                    <span>{t('lead.contactWhatsAppOption')}</span>
                  </label>
                </div>
              </fieldset>

              {contactMethod === 'whatsapp' && (
                <div className="mt-4">
                  <label htmlFor="homepage-lead-whatsapp" className="text-xs font-semibold text-ink">{t('lead.fieldWhatsApp')} *</label>
                  <input
                    id="homepage-lead-whatsapp"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    disabled={status === 'submitting'}
                    maxLength={40}
                    placeholder={t('lead.fieldWhatsAppPlaceholder')}
                    style={{ fontSize: '16px' }}
                    className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                  />
                  <p className="mt-1 text-xs leading-relaxed text-ink-tertiary">{t('lead.whatsappNote')}</p>
                </div>
              )}

              {/* Honeypot — hidden from real users */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <button
                type="submit"
                disabled={status === 'submitting'}
                aria-busy={status === 'submitting'}
                className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-jade px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform,opacity] duration-hover ease-out hover:-translate-y-0.5 hover:bg-jade-dark active:scale-[0.99] disabled:translate-y-0 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
                {status === 'submitting' ? t('lead.submitting') : t('home.tripPlan.submit')}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-ink-tertiary">
                {t('lead.consent')}{' '}
                <a href="/privacy/" className="underline hover:text-ink-secondary">{t('lead.consentLink')}</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
