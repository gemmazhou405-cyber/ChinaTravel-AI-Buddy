import { ArrowRight, CalendarDays, Check, Mail, Map, MessageCircle, Send } from 'lucide-react';
import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { markFunnelOnce, trackEvent, trackEventOnce } from '../../lib/analytics';
import { isValidWhatsApp, submitTripLead } from '../../lib/tripLead';
import type { TripPlanPreview } from '../../lib/tripLead';

type ContactMethod = 'email' | 'whatsapp';
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type SelectOption = string | { value: string; label: string };

const arrivalCities = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Chongqing', 'Xi’an', 'Guilin', 'Kunming', 'Hangzhou', 'Hong Kong', 'Other / not listed'];
const departureCountries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'France', 'Germany', 'Italy', 'Spain', 'Singapore', 'Malaysia', 'Other / not listed'];
const priorities = ['Scenery & nature', 'Local culture & history', 'Food', 'Shopping & city life', 'Family-friendly activities', 'Medical / hospital visit'];
const concerns = ['Language & translation', 'Food allergies / dietary needs', 'Accommodation experience', 'Transport & navigation', 'Payments & mobile apps', 'Accessibility / mobility'];

function createRequestId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `trip_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function SelectField({ id, label, value, onChange, options, placeholder, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; options: SelectOption[]; placeholder: string; disabled: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-ink">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60">
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const normalized = typeof option === 'string' ? { value: option, label: option } : option;
          return <option key={normalized.value} value={normalized.value}>{normalized.label}</option>;
        })}
      </select>
    </div>
  );
}

function CompactChecks({ label, items, values, onToggle, disabled }: { label: string; items: string[]; values: string[]; onToggle: (value: string) => void; disabled: boolean }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const checked = values.includes(item);
          return (
            <label key={item} className={`cursor-pointer rounded-full border px-3 py-2 text-xs transition-colors ${checked ? 'border-jade bg-jade text-white' : 'border-hairline bg-white/50 text-ink-secondary'}`}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(item)} disabled={disabled} className="sr-only" />
              {item}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SamplePreview() {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-soft md:mt-7">
      <div className="relative h-36 overflow-hidden md:h-44">
        <img src="/images/great-wall-1600.webp" alt="The Great Wall of China winding over forested mountains" className="h-full w-full object-cover" loading="lazy" />
        {/* Bottom-up deep-jade scrim, weighted to the lower ~40% so the white label stays readable. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,65,69,0.92)_0%,rgba(11,65,69,0.55)_20%,rgba(11,65,69,0.15)_40%,transparent_62%)]" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Sample route</p>
          <p className="mt-1 text-xl font-bold leading-tight">7 days: Beijing → Xi’an → Chengdu</p>
        </div>
      </div>
      <div className="grid gap-3 p-4 text-sm md:grid-cols-3">
        {[
          ['Day 1 · Beijing', 'Easy check-in, first dinner, Alipay setup'],
          ['Day 2 · Beijing', 'Forbidden City, hutong walk, local food'],
          ['Full itinerary', 'Daily route, transport notes, app checklist'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl bg-jade-wash/70 p-3">
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripPlanLead({ standalone = false }: { standalone?: boolean } = {}) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const planStartFired = useRef(false);
  const [email, setEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [tripLength, setTripLength] = useState('7');
  const [departureCountry, setDepartureCountry] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [citiesInput, setCitiesInput] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<'email' | 'whatsapp' | 'free_plan_used' | 'generic' | null>(null);
  const [planPreview, setPlanPreview] = useState<TripPlanPreview | null>(null);
  const [planGenerated, setPlanGenerated] = useState(false);

  useEffect(() => {
    if (markFunnelOnce('lead_homepage_shown')) trackEventOnce('lead-homepage-shown', 'lead_cta_shown', { trigger: 'homepage_trip_plan' });
  }, []);

  const selectedCities = useMemo(() => citiesInput.split(/[,，;；]/).map((city) => city.trim()).filter(Boolean).filter((city, index, all) => all.indexOf(city) === index).slice(0, 6), [citiesInput]);
  const routeCities = useMemo(() => {
    const first = arrivalCity && arrivalCity !== 'Other / not listed' ? [arrivalCity] : [];
    return [...first, ...selectedCities].filter((city, index, all) => all.indexOf(city) === index).slice(0, 6);
  }, [arrivalCity, selectedCities]);
  const previewRoute = routeCities.length ? routeCities.join(' → ') : 'Route to be tailored after review';
  const formattedTravelDate = travelDate ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${travelDate}T00:00:00Z`)) : '';

  // Fires once per page view when the visitor first touches any field. Shared by
  // the homepage section and the /plan landing page; sourcePath on the event
  // distinguishes the two entry points.
  const handleFirstFieldInteraction = () => {
    if (planStartFired.current) return;
    planStartFired.current = true;
    void trackEvent('plan_form_start', {});
  };

  // Mobile intro CTA. On /plan the form is right below — just focus its first
  // field; on the homepage, smooth-scroll the form into view then focus it.
  const handleIntroCta = () => {
    void trackEvent('lead_form_opened', { trigger: standalone ? 'plan_hero' : 'homepage_hero' });
    const focusFirstField = () => document.getElementById('homepage-lead-date')?.focus();
    if (standalone) {
      focusFirstField();
      return;
    }
    document.getElementById('trip-plan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(focusFirstField, 500);
  };

  const IntroHeading = standalone ? 'h1' : 'h2';

  const toggle = (value: string, current: string[], setter: (values: string[]) => void) => setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const resetForm = () => {
    setEmail(''); setTravelDate(''); setTravelers('2'); setTripLength('7'); setDepartureCountry(''); setArrivalCity(''); setCitiesInput(''); setSelectedPriorities([]); setSelectedConcerns([]); setShowPreferences(false); setWhatsapp(''); setContactMethod('email'); setStatus('idle'); setError(null); setPlanPreview(null); setPlanGenerated(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) { setError('email'); return; }
    if (contactMethod === 'whatsapp' && !isValidWhatsApp(whatsapp)) { setError('whatsapp'); return; }
    setStatus('submitting');
    setError(null);
    if (markFunnelOnce('lead_homepage_submit_started')) void trackEvent('lead_submit_started', { trigger: 'homepage_trip_plan' });
    const result = await submitTripLead({
      requestId: createRequestId(),
      email: emailTrimmed,
      travelDate: travelDate || undefined,
      travelers: travelers === '9+' ? 9 : Number(travelers),
      tripLength: Number(tripLength),
      departureCountry: departureCountry || undefined,
      arrivalCity: arrivalCity === 'Other / not listed' ? selectedCities[0] || undefined : arrivalCity || undefined,
      destinationCities: routeCities,
      priorities: selectedPriorities,
      concerns: selectedConcerns,
      whatsapp: whatsapp.trim() || undefined,
      contactMethod,
    });
    if (result.status === 'success') {
      setPlanPreview(result.planPreview);
      setPlanGenerated(result.planGenerated);
      setStatus('success');
      void trackEvent('lead_submit_success', { trigger: 'homepage_trip_plan', planGenerated: result.planGenerated });
      void trackEvent('plan_form_submit', { tripLength: Number(tripLength), cityCount: routeCities.length });
    } else {
      setStatus('error');
      setError(result.status === 'free_plan_used' ? 'free_plan_used' : 'generic');
      void trackEvent('lead_submit_failed', { trigger: 'homepage_trip_plan', errorCode: result.status });
    }
  };

  return (
    <section ref={ref} id="trip-plan" className={`relative overflow-hidden bg-[#F4F8F6] ${standalone ? 'py-5 md:py-8' : 'scroll-mt-16 py-9 md:scroll-mt-20 md:py-14'} ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className={`absolute inset-x-0 top-0 bg-gradient-to-b from-jade-wash to-transparent ${standalone ? 'h-32' : 'h-56'}`} />
      <div className={`relative mx-auto grid gap-6 px-4 md:gap-10 md:px-8 ${standalone ? 'max-w-2xl' : 'max-w-container md:grid-cols-[0.92fr_1.08fr]'}`}>
        <div className="motion-reveal-item">
          <div className="inline-flex items-center gap-2 rounded-full bg-jade-wash px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-jade">{t('home.tripPlan.kicker')}</span>
          </div>

          <IntroHeading
            className="mt-6 max-w-[22rem] font-display text-[30px] text-ink [text-wrap:balance] sm:max-w-[34rem] sm:text-[40px] md:mt-4 md:text-[54px]"
            style={{
              // Fraunces variable axes: lighter weight, SOFT/WONK off for a crisp
              // high-contrast display cut, opsz maxed for large sizes.
              fontWeight: 540,
              fontVariationSettings: "'wght' 540, 'SOFT' 0, 'WONK' 0, 'opsz' 144",
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
            }}
          >
            Your first China trip, planned for you.
          </IntroHeading>

          {/* Mobile: one line. Desktop: full supporting paragraph (layout unchanged). */}
          <p className="mt-4 text-base font-medium text-ink-secondary md:hidden">
            Free personalised itinerary in 30 seconds.
          </p>
          <p className="mt-4 hidden max-w-[33rem] text-lg font-medium leading-relaxed text-ink-secondary md:block md:text-xl">
            Get a free personalised route preview before you travel. We help with cities, transport, payments, food and the small details that make China easier.
          </p>

          {/* Mobile-only primary CTA — scrolls to / focuses the form. */}
          <button
            type="button"
            onClick={handleIntroCta}
            className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-jade px-6 py-4 text-base font-extrabold text-white shadow-soft transition-colors hover:bg-jade-dark md:hidden"
          >
            <Map className="h-4 w-4" strokeWidth={1.9} />
            Get my free itinerary
          </button>

          {/* Mobile: plain reassurance line. Desktop: bg chips (minus "Built for first-time visitors"). */}
          <p className="mt-4 text-xs text-ink-tertiary md:hidden">No payment · No spam</p>
          <div className="mt-5 hidden flex-wrap gap-2 text-xs font-semibold text-jade md:flex">
            <span className="rounded-full bg-jade-wash px-3 py-2">No payment</span>
            <span className="rounded-full bg-jade-wash px-3 py-2">No spam</span>
          </div>

          <SamplePreview />
        </div>

        <div id="trip-plan-form" className="motion-reveal-item glass rounded-2xl p-4 sm:p-5 md:p-7" style={standalone ? undefined : ({ '--reveal-index': 2 } as CSSProperties)}>
          {status === 'success' ? (
            <div className="flex flex-col items-start">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jade text-white"><Check className="h-5 w-5" strokeWidth={1.7} /></span>
              <h3 className="mt-5 text-2xl font-bold text-ink md:text-3xl">{planGenerated ? 'Your personalised route is ready' : 'We received your trip details'}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary md:text-base">{planGenerated ? 'Here is your Day 1 preview. Your complete day-by-day itinerary has been sent to your email.' : 'We could not generate your personalised plan this time. Please try submitting again in a few minutes.'}</p>
              <div className="mt-5 w-full rounded-xl border border-jade/20 bg-white/70 p-4">
                {planPreview ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jade">Day 1 preview</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{planPreview.title}</p>
                    <div className="mt-4 space-y-3">
                      {planPreview.days.slice(0, 1).map((day) => (
                        <div key={`${day.day}-${day.city}`} className="rounded-lg border border-hairline bg-white/80 p-3">
                          <p className="text-sm font-semibold text-ink">{day.day}{day.city ? ` · ${day.city}` : ''}</p>
                          {day.morning && <p className="mt-1 text-xs leading-relaxed text-ink-secondary"><strong>Morning:</strong> {day.morning}</p>}
                          {day.afternoon && <p className="mt-1 text-xs leading-relaxed text-ink-secondary"><strong>Afternoon:</strong> {day.afternoon}</p>}
                          {day.evening && <p className="mt-1 text-xs leading-relaxed text-ink-secondary"><strong>Evening:</strong> {day.evening}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-jade px-4 py-3 text-white">
                      <p className="text-sm font-semibold">Your remaining day-by-day itinerary is in your inbox.</p>
                      <p className="mt-1 text-xs text-white/80">Check {email} for the complete personalised plan.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jade">Your trip request</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{previewRoute}</p>
                    <p className="mt-1 text-sm text-ink-secondary">{tripLength} days · {travelers} traveller{travelers === '1' ? '' : 's'}{formattedTravelDate ? ` · starting ${formattedTravelDate}` : ''}</p>
                  </>
                )}
                <p className="mt-4 text-xs leading-relaxed text-ink-tertiary">{planGenerated ? (contactMethod === 'whatsapp' ? `A confirmation reminder will be sent to WhatsApp (${whatsapp}). Your detailed plan was sent to ${email}.` : `Detailed plan delivery: ${email}.`) : 'No automatic 48-hour delivery has been scheduled.'}</p>
              </div>
              <button type="button" onClick={resetForm} className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-jade/30 px-4 py-2.5 text-sm font-semibold text-jade hover:bg-jade hover:text-white">{t('home.tripPlan.submitAnother')}<ArrowRight className="h-4 w-4" strokeWidth={1.5} /></button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} onFocusCapture={handleFirstFieldInteraction} onChange={handleFirstFieldInteraction} noValidate>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade text-white sm:h-11 sm:w-11"><Map className="h-5 w-5" strokeWidth={1.6} /></span>
                <div>
                  <h3 className={`font-bold leading-tight text-ink ${standalone ? 'text-lg sm:text-xl' : 'text-2xl'}`}>Get your free itinerary</h3>
                  <p className="mt-1 text-sm text-ink-secondary">Instant Day 1 preview. Full plan by email. No payment.</p>
                </div>
              </div>
              {error && (error === 'free_plan_used' ? (
                <div role="alert" className="mt-4 rounded-lg border border-jade/20 bg-jade-wash px-4 py-3 text-sm text-ink">
                  <p className="font-semibold">Your free plan quota has been used.</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">Please use a new email address or upgrade your membership.</p>
                  <a href="#pricing" className="mt-3 inline-flex items-center gap-1 font-semibold text-jade underline underline-offset-4">View membership options <ArrowRight className="h-3.5 w-3.5" /></a>
                </div>
              ) : <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{t(error === 'email' ? 'lead.errorEmail' : error === 'whatsapp' ? 'lead.errorWhatsApp' : 'lead.errorGeneric')}</p>)}

              <div className="mt-5 space-y-4">
                <fieldset>
                  <legend className="flex items-center gap-2 text-sm font-semibold text-ink"><CalendarDays className="h-4 w-4 text-jade" />Trip basics</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="homepage-lead-date" className="text-xs font-semibold text-ink">Date</label>
                      <input id="homepage-lead-date" lang="en-US" type="date" min={new Date().toISOString().slice(0, 10)} value={travelDate} onChange={(e) => setTravelDate(e.target.value)} disabled={status === 'submitting'} className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink" />
                    </div>
                    <SelectField id="homepage-lead-length" label="Days" value={tripLength} onChange={setTripLength} options={['3', '5', '7', '10', '14', '21']} placeholder="Select" disabled={status === 'submitting'} />
                    <SelectField id="homepage-lead-travelers" label="Travellers" value={travelers} onChange={setTravelers} options={['1', '2', '3', '4', '5', '6', '7', '8', { value: '9+', label: '9+' }]} placeholder="Select" disabled={status === 'submitting'} />
                    <SelectField id="homepage-lead-departure" label="Travelling from" value={departureCountry} onChange={setDepartureCountry} options={departureCountries} placeholder="Select a country" disabled={status === 'submitting'} />
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="text-sm font-semibold text-ink">Destination</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <SelectField id="homepage-lead-arrival" label="First arrival city" value={arrivalCity} onChange={setArrivalCity} options={arrivalCities} placeholder="Not sure yet" disabled={status === 'submitting'} />
                    <div>
                      <label htmlFor="homepage-lead-cities" className="text-xs font-semibold text-ink">Cities you want to visit</label>
                      <input id="homepage-lead-cities" type="text" value={citiesInput} onChange={(e) => setCitiesInput(e.target.value)} disabled={status === 'submitting'} placeholder="e.g. Beijing, Xi’an, Chengdu" className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-ink-tertiary">Separate cities with commas. You can enter any city.</p>
                </fieldset>
                <button type="button" onClick={() => setShowPreferences((value) => !value)} className="text-left text-sm font-semibold text-jade hover:text-jade-dark">{showPreferences ? 'Hide preferences' : 'Add preferences (optional)'}</button>
                {showPreferences && (
                  <div className="space-y-5">
                    <CompactChecks label="What matters most?" items={priorities} values={selectedPriorities} onToggle={(v) => toggle(v, selectedPriorities, setSelectedPriorities)} disabled={status === 'submitting'} />
                    <CompactChecks label="Anything you’re concerned about?" items={concerns} values={selectedConcerns} onToggle={(v) => toggle(v, selectedConcerns, setSelectedConcerns)} disabled={status === 'submitting'} />
                  </div>
                )}
                <fieldset>
                  <legend className="text-sm font-semibold text-ink">How should we follow up?</legend>
                  <div className="mt-3">
                    <label htmlFor="homepage-lead-email" className="text-xs font-semibold text-ink">Email for the full itinerary *</label>
                    <input id="homepage-lead-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={status === 'submitting'} placeholder="you@example.com" className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${contactMethod === 'email' ? 'border-jade bg-white text-ink' : 'border-hairline text-ink-secondary'}`}><input type="radio" name="homepage-contact-method" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} className="accent-[#0F5257]" /><Mail className="h-4 w-4 text-jade" /><span>Email</span></label>
                    <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${contactMethod === 'whatsapp' ? 'border-jade bg-white text-ink' : 'border-hairline text-ink-secondary'}`}><input type="radio" name="homepage-contact-method" checked={contactMethod === 'whatsapp'} onChange={() => setContactMethod('whatsapp')} className="accent-[#0F5257]" /><MessageCircle className="h-4 w-4 text-jade" /><span>WhatsApp</span></label>
                  </div>
                  {contactMethod === 'whatsapp' && (
                    <div className="mt-3">
                      <label htmlFor="homepage-lead-whatsapp" className="text-xs font-semibold text-ink">WhatsApp number</label>
                      <input id="homepage-lead-whatsapp" type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={status === 'submitting'} placeholder="+44 7700 900000" className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink" />
                      <p className="mt-1 text-xs text-ink-tertiary">We’ll send a confirmation message. Your full plan still goes to email.</p>
                    </div>
                  )}
                </fieldset>
              </div>
              <button type="submit" disabled={status === 'submitting'} className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-jade px-5 py-3 text-base font-bold text-white shadow-[0_12px_28px_rgba(15,82,87,0.22)] hover:bg-jade-dark"><Send className="h-4 w-4" />{status === 'submitting' ? t('lead.submitting') : 'Get my free China itinerary'}</button>
              <p className="mt-3 text-xs leading-relaxed text-ink-tertiary">We only use your email to send your trip plan. No newsletter unless you choose it. <a href="/privacy/" className="underline">{t('lead.consentLink')}</a></p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
