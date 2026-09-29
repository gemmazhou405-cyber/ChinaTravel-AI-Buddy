import { FormEvent, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Mail, MapPin, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitTripLead } from '../../lib/tripLead';
import { trackEvent } from '../../lib/analytics';

const CITY_OPTIONS = [
  'beijing', 'shanghai', 'chengdu', 'xian', 'guilin', 'zhangjiajie', 'hangzhou', 'chongqing',
] as const;

const INTEREST_OPTIONS = [
  'food', 'culture', 'nature', 'photography', 'family', 'nightlife', 'shopping', 'easyChinese',
] as const;

type CityId = (typeof CITY_OPTIONS)[number];
type InterestId = (typeof INTEREST_OPTIONS)[number];

export default function TripPlanForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cities, setCities] = useState<CityId[]>([]);
  const [dates, setDates] = useState('');
  const [interests, setInterests] = useState<InterestId[]>([]);
  const [travelers, setTravelers] = useState(1);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formStarted = useRef(false);

  const markFormStarted = () => {
    if (formStarted.current || success) return;
    formStarted.current = true;
    void trackEvent('itinerary_form_started', { journey: 'now' });
  };

  const toggleCity = (city: CityId) => {
    markFormStarted();
    setError(null);
    setCities((current) =>
      current.includes(city) ? current.filter((item) => item !== city) : [...current, city],
    );
  };

  const toggleInterest = (interest: InterestId) => {
    markFormStarted();
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const continueFromCities = () => {
    markFormStarted();
    if (cities.length === 0) {
      setError(t('lead.progressive.cityRequired'));
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    markFormStarted();
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t('lead.errorEmail'));
      return;
    }

    setSending(true);
    void trackEvent('itinerary_submit_started', { journey: 'now' });
    try {
      const result = await submitTripLead({
        email: email.trim(),
        cities,
        dates: dates.trim(),
        travelers,
        interests,
        consentAccepted: true,
        consentVersion: 'trip-lead-2026-09',
        locale: document.documentElement.lang || 'en',
        sourcePath: window.location.pathname + window.location.search,
        requestId: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });

      if (result === 'success') {
        setSuccess(true);
        return;
      }
      setError(t(result === 'too_many' ? 'lead.errorTooMany' : 'lead.errorGeneric'));
    } catch {
      setError(t('lead.errorGeneric'));
    } finally {
      setSending(false);
    }
  };

  const cityLabels = cities.map((city) => t(`lead.progressive.cities.${city}`));
  const interestLabels = interests.map((interest) => t(`lead.progressive.interests.${interest}`));

  return (
    <section id="free-itinerary" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">
            {t('lead.progressive.eyebrow')}
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight text-ink md:text-[42px]">
            {t('lead.progressive.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-secondary">
            {t('lead.progressive.subtitle')}
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-[#fffdfa] shadow-card md:mt-10">
          <div className="border-b border-hairline px-5 py-4 sm:px-8">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary">
              <span>{t('lead.progressive.stepLabel', { current: step })}</span>
              <span>{t(`lead.progressive.step${step}Name`)}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
              {[1, 2, 3].map((item) => (
                <div key={item} className={`h-1.5 rounded-full transition-colors ${item <= step ? 'bg-jade' : 'bg-hairline'}`} />
              ))}
            </div>
          </div>

          {success ? (
            <div className="px-5 py-12 text-center sm:px-10">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-jade-wash text-jade">
                <Check className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl text-ink">{t('lead.progressive.successTitle')}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-secondary">{t('lead.success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} onFocusCapture={markFormStarted} onInput={markFormStarted} onChange={markFormStarted} noValidate>
              <div className="px-5 py-7 sm:px-8 sm:py-9">
                {step === 1 && (
                  <div>
                    <StepHeading icon={<MapPin className="h-5 w-5" />} title={t('lead.progressive.cityTitle')} help={t('lead.progressive.cityHelp')} />
                    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {CITY_OPTIONS.map((city) => {
                        const selected = cities.includes(city);
                        return (
                          <button key={city} type="button" aria-pressed={selected} onClick={() => toggleCity(city)} className={chipClass(selected, false)}>
                            {t(`lead.progressive.cities.${city}`)}
                          </button>
                        );
                      })}
                    </div>
                    <label htmlFor="trip-dates" className="mt-7 block text-sm font-semibold text-ink">{t('lead.progressive.whenLabel')}</label>
                    <input id="trip-dates" value={dates} onChange={(event) => setDates(event.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-tertiary focus:border-jade focus:ring-2 focus:ring-jade/15" placeholder={t('lead.progressive.whenPlaceholder')} />
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <StepHeading icon={<Sparkles className="h-5 w-5" />} title={t('lead.progressive.interestTitle')} help={t('lead.progressive.interestHelp')} />
                    <div className="mt-6 flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((interest) => {
                        const selected = interests.includes(interest);
                        return (
                          <button key={interest} type="button" aria-pressed={selected} onClick={() => toggleInterest(interest)} className={chipClass(selected, true)}>
                            {selected && <Check className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />}
                            {t(`lead.progressive.interests.${interest}`)}
                          </button>
                        );
                      })}
                    </div>
                    <label htmlFor="trip-travelers" className="mt-7 flex items-center gap-2 text-sm font-semibold text-ink">
                      <Users className="h-4 w-4 text-jade" aria-hidden="true" />
                      {t('lead.progressive.travelersLabel')}
                    </label>
                    <select id="trip-travelers" value={travelers} onChange={(event) => setTravelers(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-jade focus:ring-2 focus:ring-jade/15">
                      {[1, 2, 3, 4, 5, 6].map((count) => (
                        <option key={count} value={count}>
                          {count === 6
                            ? t('lead.progressive.travelersSixPlus')
                            : t(
                                count === 1
                                  ? 'lead.progressive.travelersOption'
                                  : 'lead.progressive.travelersOption_plural',
                                { count },
                              )}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <StepHeading icon={<Mail className="h-5 w-5" />} title={t('lead.progressive.previewTitle')} help={t('lead.progressive.previewHelp')} />
                    <div className="mt-6 rounded-xl border border-jade/15 bg-jade-wash/60 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jade">{t('lead.progressive.dayOnePreview')}</p>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <PreviewItem label={t('lead.progressive.routeLabel')} value={cityLabels.join(' → ')} />
                        <PreviewItem label={t('lead.progressive.datesLabel')} value={dates || t('lead.progressive.flexibleDates')} />
                        <PreviewItem label={t('lead.progressive.interestsLabel')} value={interestLabels.length > 0 ? interestLabels.join(', ') : t('lead.progressive.openRecommendations')} />
                      </dl>
                    </div>
                    <label htmlFor="itinerary-email" className="mt-6 block text-sm font-semibold text-ink">{t('lead.fieldEmail')}</label>
                    <input id="itinerary-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} autoComplete="email" inputMode="email" className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-tertiary focus:border-jade focus:ring-2 focus:ring-jade/15" placeholder={t('lead.progressive.emailPlaceholder')} />
                    <p className="mt-3 text-xs leading-relaxed text-ink-secondary">{t('lead.progressive.privacyNote')}</p>
                  </div>
                )}
                {error && <p className="mt-5 text-sm font-medium text-red-600" role="alert">{error}</p>}
              </div>

              <div className="border-t border-hairline bg-white/70 px-5 py-5 sm:px-8">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <button type="button" onClick={() => { setError(null); setStep((step - 1) as 1 | 2); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-ink-secondary transition hover:bg-jade-wash hover:text-jade">
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('lead.progressive.back')}
                    </button>
                  ) : <span />}
                  {step === 1 && <PrimaryButton label={t('lead.progressive.continuePreview')} onClick={continueFromCities} />}
                  {step === 2 && <PrimaryButton label={t('lead.progressive.continue')} onClick={() => { markFormStarted(); setError(null); setStep(3); }} />}
                  {step === 3 && (
                    <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-jade-dark disabled:cursor-wait disabled:opacity-60">
                      {sending ? t('lead.submitting') : t('lead.progressive.submit')}
                      {!sending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  )}
                </div>
                <p className="mt-4 text-center text-xs font-medium text-jade">{t('lead.progressive.trust')}</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function StepHeading({ icon, title, help }: { icon: ReactNode; title: string; help: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 rounded-lg bg-jade-wash p-2 text-jade" aria-hidden="true">{icon}</span>
      <div><h3 className="text-xl font-semibold text-ink">{title}</h3><p className="mt-1 text-sm text-ink-secondary">{help}</p></div>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-ink-secondary">{label}</dt><dd className="mt-1 font-semibold text-ink">{value}</dd></div>;
}

function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-jade-dark">
      {label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function chipClass(selected: boolean, rounded: boolean) {
  return `min-h-11 border px-4 py-2.5 text-sm font-medium transition ${rounded ? 'rounded-full' : 'rounded-xl'} ${
    selected
      ? 'border-jade bg-jade text-white shadow-sm'
      : 'border-hairline bg-white text-ink hover:border-jade/40 hover:bg-jade-wash/50'
  }`;
}
