import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Loader2, MapPinned, ShieldCheck } from 'lucide-react';
import { markFunnelOnce, trackEvent } from '../lib/analytics';
import { requestPhoneVerification, submitVerifiedTripLead } from '../lib/tripLead';

const COUNTRY_CODES = [
  { label: 'United Kingdom', code: '+44' },
  { label: 'United States / Canada', code: '+1' },
  { label: 'Australia', code: '+61' },
  { label: 'New Zealand', code: '+64' },
  { label: 'France', code: '+33' },
  { label: 'Germany', code: '+49' },
  { label: 'Spain', code: '+34' },
  { label: 'Italy', code: '+39' },
  { label: 'Japan', code: '+81' },
  { label: 'South Korea', code: '+82' },
  { label: 'Singapore', code: '+65' },
  { label: 'Other', code: '+' },
];

type Step = 'details' | 'verify' | 'success';

function requestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

function errorCopy(code: string | null) {
  if (code === 'invalid_phone') return 'Please enter a valid mobile number with the country code.';
  if (code === 'invalid_code') return 'That code is not valid or has expired. Please try again.';
  if (code === 'too_many_requests') return 'Too many attempts. Please wait a few minutes and try again.';
  if (code === 'phone_verification_unavailable') return 'Phone verification is temporarily unavailable. Please try again later.';
  if (code === 'consent_required') return 'Please agree to the verification and contact notice before continuing.';
  if (code === 'code_required') return 'Please enter the verification code from your SMS.';
  return 'We could not complete this request. Please try again.';
}

export default function LeadCaptureSection() {
  const [step, setStep] = useState<Step>('details');
  const [countryCode, setCountryCode] = useState('+44');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [destinations, setDestinations] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [requestKey, setRequestKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (markFunnelOnce('lead_cta_shown')) {
      void trackEvent('lead_cta_shown', { location: 'homepage_free_trip_plan' });
    }
  }, []);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const phoneE164 = useMemo(() => {
    const digits = phone.replace(/\D/g, '').replace(/^0+/, '');
    return countryCode === '+' ? '+' + digits : countryCode + digits;
  }, [countryCode, phone]);

  const phoneIsValid = /^\+[1-9]\d{7,14}$/.test(phoneE164);
  const maskedPhone = phoneE164.length > 4
    ? phoneE164.slice(0, -4).replace(/\d/g, '•') + phoneE164.slice(-4)
    : phoneE164;

  const sendCode = async () => {
    setError(null);
    if (!phoneIsValid) {
      setError('invalid_phone');
      return false;
    }
    if (!consent) {
      setError('consent_required');
      return false;
    }
    setBusy(true);
    if (markFunnelOnce('lead_submit_started')) {
      void trackEvent('lead_submit_started', { location: 'homepage_free_trip_plan' });
    }
    const result = await requestPhoneVerification(phoneE164);
    setBusy(false);
    if (!result.ok) {
      setError(result.errorCode);
      void trackEvent('lead_submit_failed', { location: 'homepage_free_trip_plan', errorCode: result.errorCode });
      return false;
    }
    setRequestKey(requestId());
    setCooldown(60);
    setStep('verify');
    void trackEvent('lead_form_opened', { trigger: 'phone_verification_started', location: 'homepage_free_trip_plan' });
    return true;
  };

  const handleDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendCode();
  };

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{4,8}$/.test(code.trim())) {
      setError('code_required');
      return;
    }
    setBusy(true);
    const result = await submitVerifiedTripLead({
      requestId: requestKey || requestId(),
      phone: phoneE164,
      code: code.trim(),
      email,
      travelDate,
      travelers: Number(travelers),
      destinations,
      consentVersion: 'free-trip-plan-2026-09',
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.errorCode);
      void trackEvent('lead_submit_failed', { location: 'homepage_free_trip_plan', errorCode: result.errorCode });
      return;
    }
    setStep('success');
    void trackEvent('lead_submit_success', { location: 'homepage_free_trip_plan', verifiedPhone: true });
  };

  return (
    <section id="free-trip-plan" className="scroll-mt-24 bg-jade-wash">
      <div className="mx-auto grid max-w-container gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-20">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-jade/20 bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-jade">
            <span className="h-1.5 w-1.5 rounded-full bg-jade" />
            Free first-trip starter plan
          </span>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-normal leading-tight tracking-[-0.02em] text-ink md:text-5xl">
            Your China trip should feel clear before you fly.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-secondary md:text-lg">
            Tell us when you are coming, how long you have, and what you want to see. We will prepare a practical starter route with the essentials first: city order, transport reminders, payment setup, and the mistakes first-time visitors can avoid.
          </p>
          <div className="mt-8 grid gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-jade/15 bg-surface/75 p-4">
              <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-jade" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-ink">A route you can actually use</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">A sensible city order for your time, not a generic list of attractions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-jade/15 bg-surface/75 p-4">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-jade" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-ink">First-trip essentials</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">Payment, connectivity, transport and arrival checks in one short checklist.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-jade/15 bg-surface/75 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-jade" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-ink">A verified contact, not a spam list</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">We verify your number once and use it only for this trip-plan request.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-jade/15 bg-surface p-6 shadow-[0_20px_70px_rgba(21,94,99,0.10)] md:p-8">
          {step === 'details' && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jade">Step 1 of 2</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">Request your free plan</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">We only need a few details to make the first draft useful.</p>
                </div>
                <span className="rounded-full bg-jade-wash px-3 py-1 text-xs font-semibold text-jade">No payment</span>
              </div>
              <form onSubmit={handleDetailsSubmit} className="mt-7 space-y-4">
                <div>
                  <label htmlFor="trip-phone" className="text-sm font-semibold text-ink">Mobile number *</label>
                  <div className="mt-1.5 grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] gap-2">
                    <select
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      aria-label="Country calling code"
                      className="min-w-0 rounded-xl border border-hairline bg-canvas px-3 py-3 text-sm text-ink outline-none focus:border-jade"
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option key={country.label + country.code} value={country.code}>{country.code} · {country.label}</option>
                      ))}
                    </select>
                    <input
                      id="trip-phone"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Mobile number"
                      maxLength={18}
                      required
                      className="min-w-0 rounded-xl border border-hairline bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-jade"
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-tertiary">We will send one verification code. No marketing texts.</p>
                </div>

                <div>
                  <label htmlFor="trip-email" className="text-sm font-semibold text-ink">Email for the plan <span className="font-normal text-ink-tertiary">(optional)</span></label>
                  <input
                    id="trip-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    maxLength={160}
                    className="mt-1.5 w-full rounded-xl border border-hairline bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-jade"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="trip-date" className="text-sm font-semibold text-ink">Travel month <span className="font-normal text-ink-tertiary">(optional)</span></label>
                    <input
                      id="trip-date"
                      type="month"
                      value={travelDate}
                      onChange={(event) => setTravelDate(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-hairline bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-jade"
                    />
                  </div>
                  <div>
                    <label htmlFor="trip-travelers" className="text-sm font-semibold text-ink">Travellers</label>
                    <select
                      id="trip-travelers"
                      value={travelers}
                      onChange={(event) => setTravelers(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-hairline bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-jade"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => <option key={value} value={value}>{value}{value === 8 ? '+' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="trip-destinations" className="text-sm font-semibold text-ink">Cities or interests <span className="font-normal text-ink-tertiary">(optional)</span></label>
                  <input
                    id="trip-destinations"
                    type="text"
                    value={destinations}
                    onChange={(event) => setDestinations(event.target.value)}
                    placeholder="Beijing, Chengdu, food, nature…"
                    maxLength={160}
                    className="mt-1.5 w-full rounded-xl border border-hairline bg-canvas px-3 py-3 text-base text-ink outline-none focus:border-jade"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-hairline bg-canvas/70 p-3.5 text-xs leading-relaxed text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-jade"
                  />
                  <span>I agree that ChinaEase Buddy may verify this number and contact me about this trip-plan request. See our <a href="/privacy" className="font-semibold text-jade underline">Privacy Notice</a>.</span>
                </label>

                {error && <p role="alert" className="text-sm font-semibold text-red-600">{errorCopy(error)}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-jade px-5 py-3.5 text-base font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-jade-dark disabled:cursor-wait disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
                  {busy ? 'Sending code…' : 'Send me my free plan'}
                </button>
              </form>
            </>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifySubmit}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jade">Step 2 of 2</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">Verify your number</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">Enter the one-time code sent to <span className="font-semibold text-ink">{maskedPhone}</span>.</p>
              <label htmlFor="trip-code" className="mt-7 block text-sm font-semibold text-ink">Verification code</label>
              <input
                id="trip-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="123456"
                maxLength={8}
                required
                className="mt-1.5 w-full rounded-xl border border-hairline bg-canvas px-3 py-3 text-center text-2xl tracking-[0.35em] text-ink outline-none focus:border-jade"
              />
              {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{errorCopy(error)}</p>}
              <button
                type="submit"
                disabled={busy}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-jade px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-jade-dark disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />}
                {busy ? 'Checking…' : 'Verify and request plan'}
              </button>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-tertiary">
                <button type="button" onClick={() => { setStep('details'); setCode(''); setError(null); }} className="font-semibold text-jade underline">Change number</button>
                {cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <button type="button" onClick={() => void sendCode()} disabled={busy} className="font-semibold text-jade underline disabled:opacity-50">Send a new code</button>
                )}
              </div>
            </form>
          )}

          {step === 'success' && (
            <div role="status" aria-live="polite" className="flex min-h-[330px] flex-col justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jade text-white">
                <Check className="h-6 w-6" strokeWidth={1.7} />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-jade">Request received</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink">Your number is verified.</h3>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                We will review your dates and interests, then contact you using the verified number about your free China trip starter plan.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-tertiary">Please do not send passport numbers, payment-card details or other sensitive information in a message.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
