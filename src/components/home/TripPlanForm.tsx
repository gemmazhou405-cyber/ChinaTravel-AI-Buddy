import { FormEvent, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitTripLead } from '../../lib/tripLead';
import type { TripPlanPreview } from '../../lib/tripLead';
import { trackEvent } from '../../lib/analytics';

const CITY_OPTIONS = [
  'beijing', 'shanghai', 'chengdu', 'xian', 'guilin', 'zhangjiajie', 'hangzhou', 'chongqing',
] as const;

const INTEREST_OPTIONS = [
  'food', 'pandas', 'history', 'mountains', 'photography', 'family', 'noChinese', 'nightlife',
] as const;

type CityId = (typeof CITY_OPTIONS)[number];
type InterestId = (typeof INTEREST_OPTIONS)[number];
type TravelerOption = '1' | '2' | '3-4' | 'family';

function tripLengthFromDates(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 7;
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 7;
  return Math.min(Math.max(Math.round((end - start) / 86_400_000) + 1, 1), 60);
}

function travelerCount(option: TravelerOption) {
  if (option === '3-4' || option === 'family') return 4;
  return Number(option);
}

export default function TripPlanForm({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cities, setCities] = useState<CityId[]>([]);
  const [dates, setDates] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [interests, setInterests] = useState<InterestId[]>([]);
  const [travelers, setTravelers] = useState<TravelerOption>('1');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [planPreview, setPlanPreview] = useState<TripPlanPreview | null>(null);
  const formStarted = useRef(false);

  const markFormStarted = () => {
    if (formStarted.current || success) return;
    formStarted.current = true;
    void trackEvent('itinerary_form_started', { journey: 'now' });
  };

  const toggleCity = (city: CityId) => {
    markFormStarted();
    setError(null);
    setCities((current) => {
      if (current.includes(city)) return current.filter((item) => item !== city);
      if (current.length >= 3) {
        setError(t('lead.progressive.cityMax'));
        return current;
      }
      return [...current, city];
    });
  };

  const updateDates = (nextStart: string, nextEnd: string) => {
    setStartDate(nextStart);
    setEndDate(nextEnd);
    setDates([nextStart, nextEnd].filter(Boolean).join(' → '));
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
        travelers: travelerCount(travelers),
        interests,
        travelDate: startDate || undefined,
        tripLength: tripLengthFromDates(startDate, endDate),
        arrivalCity: cityLabels[0],
        destinationCities: cityLabels,
        priorities: interestLabels,
        helpWith: interestLabels.join(', '),
        contactMethod: 'email',
        consentAccepted: true,
        consentVersion: 'trip-lead-2026-09',
        locale: document.documentElement.lang || 'en',
        sourcePath: window.location.pathname + window.location.search,
        requestId: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });

      if (result.status === 'success') {
        setPlanPreview(result.planPreview);
        setSuccess(true);
        void trackEvent('lead_submit_success', { trigger: 'homepage_trip_plan', planGenerated: result.planGenerated });
        return;
      }
      void trackEvent('lead_submit_failed', { trigger: 'homepage_trip_plan', errorCode: result.status });
      setError(t(result.status === 'too_many' ? 'lead.errorTooMany' : 'lead.errorGeneric'));
    } catch {
      setError(t('lead.errorGeneric'));
    } finally {
      setSending(false);
    }
  };

  const cityLabels = cities.map((city) => t(`lead.progressive.cities.${city}`));
  const interestLabels = interests.map((interest) => t(`lead.progressive.interests.${interest}`));
  const travelerLabel = t(`lead.progressive.travelers.${travelers}`);

  return (
    <div id="trip-plan-form" className={`w-full max-w-[420px] scroll-mt-20 ${embedded ? '' : 'mx-auto px-4 py-16 sm:px-0 md:py-24'}`}>
      {!embedded && (
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">
            {t('lead.progressive.eyebrow')}
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight text-ink md:text-[42px]">
            {t('lead.progressive.title')}
          </h2>
          <p className="mx-auto mt-3 text-base leading-relaxed text-ink-secondary">
            {t('lead.progressive.subtitle')}
          </p>
        </div>
      )}

        <div className={`${embedded ? '' : 'mt-8 md:mt-10'} overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10`}>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary">
              <span>{t('lead.progressive.stepLabel', { current: step })}</span>
              <span>{step}/3</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
              {[1, 2, 3].map((item) => (
                <div key={item} className={`h-1.5 rounded-full transition-colors ${item <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
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
              {planPreview?.days?.[0] && (
                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{t('lead.progressive.dayOnePreview')}</p>
                  <p className="mt-2 text-base font-semibold text-ink">{planPreview.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {[planPreview.days[0].morning, planPreview.days[0].afternoon, planPreview.days[0].evening].filter(Boolean).join(' · ')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} onFocusCapture={markFormStarted} onInput={markFormStarted} onChange={markFormStarted} noValidate>
              <div className="px-5 py-6 sm:px-6 sm:py-7">
                {step === 1 && (
                  <div>
                    <StepHeading title={t('lead.progressive.cityTitle')} help={t('lead.progressive.cityHelp')} />
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {CITY_OPTIONS.map((city) => {
                        const selected = cities.includes(city);
                        return (
                          <button id={city === 'beijing' ? 'trip-plan-city-beijing' : undefined} key={city} type="button" aria-pressed={selected} disabled={!selected && cities.length >= 3} onClick={() => toggleCity(city)} className={chipClass(selected, false)}>
                            {selected && <Check className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />}
                            <span>{t(`lead.progressive.cities.${city}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-6 text-sm font-semibold text-ink">{t('lead.progressive.whenLabel')}</p>
                    <button
                      type="button"
                      aria-expanded={datePickerOpen}
                      onClick={() => { markFormStarted(); setDatePickerOpen((open) => !open); }}
                      className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-ink transition hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <CalendarDays className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                      <span className="flex-1 truncate">{dates || t('lead.progressive.selectDates')}</span>
                      <ArrowRight className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    </button>
                    {datePickerOpen && (
                      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-blue-50 p-3">
                        <label className="text-xs font-medium text-slate-600">
                          {t('lead.progressive.startDate')}
                          <input type="date" value={startDate} onChange={(event) => updateDates(event.target.value, endDate)} className="mt-1.5 w-full rounded-lg border border-blue-100 bg-white px-2 py-2 text-sm text-ink outline-none focus:border-blue-500" />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          {t('lead.progressive.endDate')}
                          <input type="date" min={startDate || undefined} value={endDate} onChange={(event) => updateDates(startDate, event.target.value)} className="mt-1.5 w-full rounded-lg border border-blue-100 bg-white px-2 py-2 text-sm text-ink outline-none focus:border-blue-500" />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <StepHeading title={t('lead.progressive.interestTitle')} help={t('lead.progressive.interestHelp')} />
                    <div className="mt-5 flex flex-wrap gap-2">
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
                    <label htmlFor="trip-travelers" className="mt-6 block text-sm font-semibold text-ink">{t('lead.progressive.travelersLabel')}</label>
                    <select id="trip-travelers" value={travelers} onChange={(event) => setTravelers(event.target.value as TravelerOption)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                      {(['1', '2', '3-4', 'family'] as TravelerOption[]).map((option) => (
                        <option key={option} value={option}>{t(`lead.progressive.travelers.${option}`)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <StepHeading title={t('lead.progressive.previewTitle')} help={t('lead.progressive.previewHelp')} />
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{t('lead.progressive.dayOnePreview')}</p>
                      <dl className="mt-3 grid gap-2.5 text-sm">
                        <PreviewItem icon="📍" label={t('lead.progressive.routeLabel')} value={cityLabels.join(' → ')} />
                        <PreviewItem icon="📅" label={t('lead.progressive.datesLabel')} value={dates || t('lead.progressive.flexibleDates')} />
                        <PreviewItem icon="👥" label={t('lead.progressive.travelersPreviewLabel')} value={travelerLabel} />
                        <PreviewItem icon="🎯" label={t('lead.progressive.interestsLabel')} value={interestLabels.length > 0 ? interestLabels.join(', ') : t('lead.progressive.openRecommendations')} />
                      </dl>
                    </div>
                    <label htmlFor="itinerary-email" className="mt-6 block text-sm font-semibold text-ink">{t('lead.fieldEmail')}</label>
                    <input id="itinerary-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} autoComplete="email" inputMode="email" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-tertiary focus:border-jade focus:ring-2 focus:ring-jade/15" placeholder={t('lead.progressive.emailPlaceholder')} />
                    <p className="mt-3 text-xs leading-relaxed text-ink-secondary">{t('lead.progressive.privacyNote')}</p>
                  </div>
                )}
                {error && <p className="mt-5 text-sm font-medium text-red-600" role="alert">{error}</p>}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <button type="button" onClick={() => { setError(null); setStep((step - 1) as 1 | 2); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-ink-secondary transition hover:bg-jade-wash hover:text-jade">
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('lead.progressive.back')}
                    </button>
                  ) : <span />}
                  {step === 1 && <PrimaryButton label={t('lead.progressive.continuePreview')} onClick={continueFromCities} disabled={cities.length === 0} />}
                  {step === 2 && <PrimaryButton label={t('lead.progressive.continue')} onClick={() => { markFormStarted(); setError(null); setStep(3); }} />}
                  {step === 3 && (
                    <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0F4C4A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3d3b] disabled:cursor-wait disabled:opacity-60">
                      {sending ? t('lead.submitting') : t('lead.progressive.submit')}
                    </button>
                  )}
                </div>
                <p className="mt-4 text-center text-[11px] font-medium leading-relaxed text-slate-600">{t('lead.progressive.trust')}</p>
                {step === 1 && <p className="mt-1.5 text-center text-[11px] text-slate-500">{t('lead.progressive.adjustLater')}</p>}
              </div>
            </form>
          )}
        </div>
    </div>
  );
}

function StepHeading({ title, help }: { title: string; help: string }) {
  return (
    <div><h3 className="text-2xl font-semibold tracking-tight text-ink">{title}</h3><p className="mt-1.5 text-sm text-ink-secondary">{help}</p></div>
  );
}

function PreviewItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="grid grid-cols-[24px_74px_1fr] items-start gap-1"><span aria-hidden="true">{icon}</span><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="font-semibold leading-snug text-ink">{value}</dd></div>;
}

function PrimaryButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
      {label}
    </button>
  );
}

function chipClass(selected: boolean, rounded: boolean) {
  return `inline-flex min-h-11 items-center justify-center border px-3 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${rounded ? 'rounded-full' : 'rounded-xl'} ${
    selected
      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
      : 'border-slate-200 bg-white text-ink hover:border-blue-400 hover:bg-blue-50'
  }`;
}
