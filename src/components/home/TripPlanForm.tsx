import { useState, useRef, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { submitTripLead } from '../../lib/tripLead';
import { trackEvent } from '../../lib/analytics';

export default function TripPlanForm() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formStarted = useRef(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [travelMonth, setTravelMonth] = useState('');
  const [travelers, setTravelers] = useState('');
  const [cities, setCities] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [consent, setConsent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const markFormStarted = () => {
    if (formStarted.current || success) return;
    formStarted.current = true;
    void trackEvent('itinerary_form_started', { journey: 'now' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError(t('lead.errorConsent'));
      return;
    }
    setSending(true);
    trackEvent('itinerary_submit_started', { journey: 'now' });
    try {
      const result = await submitTripLead({
        firstName,
        email,
        countryOfResidence: country,
        plannedTravelMonth: travelMonth,
        numberOfTravellers: travelers ? parseInt(travelers, 10) || undefined : undefined,
        citiesAndInterests: cities,
        whatsapp: whatsapp || undefined,
        consentAccepted: consent,
        consentVersion: 'trip-lead-2026-08',
        locale: document.documentElement.lang || 'en',
        sourcePath: window.location.pathname + window.location.search,
        requestId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      });
      if (result === 'success') {
        setSuccess(true);
      } else {
        setError(t('lead.errorGeneric'));
      }
    } catch {
      setError(t('lead.errorGeneric'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="free-itinerary" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <h2 className="font-display text-3xl font-normal tracking-tight text-ink md:text-[40px]">
          {t('lead.formTitle')}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-secondary">{t('lead.ctaDesc')}</p>
        <p className="mt-2 text-sm font-medium text-jade">{t('lead.trustNote')}</p>
        <ul className="mt-4 space-y-1.5">
          {(t('lead.benefits', { returnObjects: true }) as string[]).map((line: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
              <span className="text-jade">✓</span> {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-secondary">{t('lead.privacyNote')}</p>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onFocusCapture={markFormStarted}
          onInput={markFormStarted}
          onChange={markFormStarted}
          className="mt-6 space-y-4"
          noValidate
        >
          <label htmlFor="fn" className="block text-sm font-medium text-ink">{t('lead.fieldFirstName')}</label>
          <input id="fn" value={firstName} onChange={e => setFirstName(e.target.value)} required maxLength={60} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" />

          <label htmlFor="em" className="block text-sm font-medium text-ink">{t('lead.fieldEmail')}</label>
          <input id="em" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" />

          <label htmlFor="co" className="block text-sm font-medium text-ink">{t('lead.fieldCountry')}</label>
          <input id="co" value={country} onChange={e => setCountry(e.target.value)} required maxLength={100} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" />

          <label htmlFor="tm" className="block text-sm font-medium text-ink">{t('lead.fieldTravelMonth')}</label>
          <input id="tm" value={travelMonth} onChange={e => setTravelMonth(e.target.value)} maxLength={40} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" placeholder={t('lead.fieldTravelMonthPlaceholder') || ''} />

          <label htmlFor="nt" className="block text-sm font-medium text-ink">{t('lead.fieldTravelers')}</label>
          <input id="nt" value={travelers} onChange={e => setTravelers(e.target.value)} type="number" min={1} max={20} maxLength={2} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" />

          <label htmlFor="ci" className="block text-sm font-medium text-ink">{t('lead.fieldCities')}</label>
          <textarea id="ci" value={cities} onChange={e => setCities(e.target.value)} maxLength={2000} rows={3} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" placeholder={t('lead.fieldCitiesPlaceholder') || ''} />

          <label htmlFor="wa" className="block text-sm font-medium text-ink">{t('lead.fieldWhatsApp')}</label>
          <input id="wa" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} maxLength={30} className="w-full rounded-lg border border-hairline px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-jade/40" />

          <label className="flex items-start gap-3">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-hairline text-jade focus:ring-jade/40" />
            <span className="text-xs leading-relaxed text-ink-secondary">{t('lead.consentLabel')}</span>
          </label>

          <input type="hidden" name="consentVersion" value="trip-lead-2026-08" />
          <input type="hidden" name="locale" value={document.documentElement.lang || 'en'} />
          <input type="hidden" name="sourcePath" value={window.location.pathname + window.location.search} />
          <input type="hidden" name="honeypot" value="" />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-jade font-medium">{t('lead.success')}</p>}

          <button type="submit" disabled={sending || success} className="w-full rounded-lg bg-jade px-6 py-3.5 text-base font-semibold text-white transition hover:bg-jade-dark disabled:opacity-60">{sending ? t('lead.submitting') : t('lead.submit')}</button>
        </form>
      </div>
    </section>
  );
}
