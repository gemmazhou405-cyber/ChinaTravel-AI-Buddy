import { useRef, useState } from 'react';
import { Check, Clipboard, ExternalLink, RotateCcw } from 'lucide-react';
import {
  CHECKER_COUNTRY_OPTIONS,
  POLICY_LAST_VERIFIED_LABEL,
  type PassportType,
  type TripType,
  type VisaPurpose,
} from '../data/chinaVisaPolicies';
import { trackEvent } from '../lib/analytics';
import { evaluateVisaFree, type VisaCheckerInput, type VisaCheckerResult } from '../lib/visaChecker';
import { useVisaAccount } from '../hooks/useVisaAccount';
import VisaAccountGate from './VisaAccountGate';

const purposeOptions: Array<{ value: VisaPurpose; label: string }> = [
  { value: 'tourism', label: 'Tourism' },
  { value: 'business', label: 'Business' },
  { value: 'family_visit', label: 'Visit family or friends' },
  { value: 'exchange', label: 'Exchange visit' },
  { value: 'transit', label: 'Transit' },
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'journalism', label: 'Journalism/news reporting' },
  { value: 'other', label: 'Other' },
];

const tripTypeOptions: Array<{ value: TripType; label: string }> = [
  { value: 'mainland_visit', label: 'Mainland China visit' },
  { value: 'transit', label: 'Transit through Mainland China to another country or region' },
  { value: 'hainan_only', label: 'Hainan only' },
];

const initialInput: VisaCheckerInput = {
  nationalityCode: '',
  passportType: '',
  entryDate: '',
  purpose: '',
  stayDays: 10,
  tripType: '',
  originCountryOrRegion: '',
  onwardCountryOrRegion: '',
};

const resultTone: Record<VisaCheckerResult['category'], string> = {
  likely_eligible: 'border-emerald-700/25 bg-emerald-50',
  additional_checks: 'border-amber-700/25 bg-amber-50',
  date_unconfirmed: 'border-amber-700/25 bg-amber-50',
  visa_may_be_required: 'border-rose-700/20 bg-rose-50',
  cannot_determine: 'border-slate-400/35 bg-slate-50',
};

function tripStarterUrl() {
  const incoming = new URLSearchParams(window.location.search);
  const outgoing = new URLSearchParams();
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source', 'partner', 'channel', 'campaign'].forEach((key) => {
    const value = incoming.get(key);
    if (value) outgoing.set(key, value);
  });
  const query = outgoing.toString();
  return `/${query ? `?${query}` : ''}#trip-plan`;
}

function resultSummary(result: VisaCheckerResult) {
  return [
    result.heading,
    result.summary,
    `Maximum stay: ${result.maximumStay}`,
    `Policy validity: ${result.policyValidity}`,
    `Next step: ${result.nextAction}`,
    `Last policy check: ${POLICY_LAST_VERIFIED_LABEL}`,
  ].join('\n');
}

interface VisaFreeCheckerToolProps {
  id?: string;
  compact?: boolean;
  onResultChange?: (result: VisaCheckerResult | null) => void;
}

type ValidationField = keyof VisaCheckerInput;

function validateInput(input: VisaCheckerInput): { field: ValidationField; message: string } | null {
  if (!input.nationalityCode) return { field: 'nationalityCode', message: 'Please select your passport nationality.' };
  if (!input.passportType) return { field: 'passportType', message: 'Please select your passport type.' };
  if (!input.entryDate) return { field: 'entryDate', message: 'Please select your planned entry date.' };
  if (!input.purpose) return { field: 'purpose', message: 'Please select the purpose of your visit.' };
  if (!Number.isFinite(input.stayDays) || input.stayDays < 1 || input.stayDays > 180) {
    return { field: 'stayDays', message: 'Please enter a planned stay between 1 and 180 days.' };
  }
  if (!input.tripType) return { field: 'tripType', message: 'Please select your trip type.' };
  if (input.tripType === 'transit' && !input.originCountryOrRegion.trim()) {
    return { field: 'originCountryOrRegion', message: 'Please enter the country or region before Mainland China.' };
  }
  if (input.tripType === 'transit' && !input.onwardCountryOrRegion.trim()) {
    return { field: 'onwardCountryOrRegion', message: 'Please enter the next country or region after Mainland China.' };
  }
  return null;
}

export default function VisaFreeCheckerTool({
  id = 'visa-checker-form',
  compact = false,
  onResultChange,
}: VisaFreeCheckerToolProps) {
  const [input, setInput] = useState<VisaCheckerInput>(initialInput);
  const [result, setResult] = useState<VisaCheckerResult | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [validation, setValidation] = useState<{ field: ValidationField; message: string } | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState<VisaCheckerResult | null>(null);
  const startedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { user, loading: authLoading, signup, login, loginWithGoogle, resetPassword } = useVisaAccount();

  const revealResult = (next: VisaCheckerResult) => {
    setResult(next);
    setPendingResult(null);
    onResultChange?.(next);
    setCopyStatus('');
    void trackEvent('visa_checker_complete', {
      resultCategory: next.category,
      policyType: next.policyType,
      completed: true,
    });
  };

  const update = <K extends keyof VisaCheckerInput>(key: K, value: VisaCheckerInput[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      void trackEvent('visa_checker_start', { completed: false });
    }
    setInput((current) => ({ ...current, [key]: value }));
    setResult(null);
    onResultChange?.(null);
    setCopyStatus('');
    if (validation?.field === key) setValidation(null);
  };

  const handleCheck = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateInput(input);
    if (validationError) {
      setValidation(validationError);
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>(`[data-field="${validationError.field}"]`)?.focus();
      });
      return;
    }
    setValidation(null);
    const next = evaluateVisaFree(input);
    if (!user) {
      setPendingResult(next);
      setAuthOpen(true);
      return;
    }
    revealResult(next);
  };

  const copyText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(successMessage);
    } catch {
      setCopyStatus('Copy failed. Please open the official source directly.');
    }
  };

  const reset = () => {
    setInput(initialInput);
    setResult(null);
    onResultChange?.(null);
    setCopyStatus('');
    setValidation(null);
    startedRef.current = false;
  };

  const inputClass = `mt-1.5 w-full min-w-0 max-w-full overflow-hidden text-ellipsis rounded-xl border border-gray-300 bg-white font-normal focus:border-[#155e63] focus:outline-none focus:ring-2 focus:ring-[#155e63]/15 ${compact ? 'px-3 py-2.5 text-sm' : 'px-3 py-3'}`;

  return (
    <div id={id} className="min-w-0 max-w-full scroll-mt-5">
      <form
        ref={formRef}
        onSubmit={handleCheck}
        noValidate
        aria-labelledby={`${id}-heading`}
        className={`min-w-0 max-w-full ${compact ? '' : 'rounded-2xl border border-[#155e63]/15 bg-[#f8fbfa] p-4 md:p-6'}`}
      >
        <div className={compact ? 'mb-4' : ''}>
          {compact && <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-jade">Free policy checker</p>}
          <h2 id={`${id}-heading`} className={compact ? 'mt-1.5 text-xl font-bold text-ink' : 'text-xl font-bold text-gray-950'}>
            Check your planned trip
          </h2>
          {compact && <p className="mt-1 text-xs leading-5 text-ink-secondary">Complete the check, then create a free account to view your result.</p>}
        </div>

        <div className={`grid min-w-0 gap-4 ${compact ? 'sm:grid-cols-2' : 'mt-5 md:grid-cols-2'}`}>
          <label className="min-w-0 text-sm font-semibold text-gray-800">Passport nationality
            <select required name="nationalityCode" data-field="nationalityCode" aria-invalid={validation?.field === 'nationalityCode'} value={input.nationalityCode} onChange={(event) => update('nationalityCode', event.target.value)} className={inputClass}>
              <option value="">Select nationality</option>
              {CHECKER_COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold text-gray-800">Passport type
            <select required name="passportType" data-field="passportType" aria-invalid={validation?.field === 'passportType'} value={input.passportType} onChange={(event) => update('passportType', event.target.value as PassportType)} className={inputClass}>
              <option value="">Select passport type</option>
              <option value="ordinary">Ordinary passport</option>
              <option value="other">Diplomatic/service/official/other</option>
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold text-gray-800">Planned entry date
            <input required name="entryDate" data-field="entryDate" aria-invalid={validation?.field === 'entryDate'} type="date" value={input.entryDate} onChange={(event) => update('entryDate', event.target.value)} className={inputClass} />
          </label>
          <label className="min-w-0 text-sm font-semibold text-gray-800">Purpose of visit
            <select required name="purpose" data-field="purpose" aria-invalid={validation?.field === 'purpose'} value={input.purpose} onChange={(event) => update('purpose', event.target.value as VisaPurpose)} className={inputClass}>
              <option value="">Select purpose</option>
              {purposeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold text-gray-800">Planned stay (days)
            <input required name="stayDays" data-field="stayDays" aria-invalid={validation?.field === 'stayDays'} type="number" min="1" max="180" value={input.stayDays} onChange={(event) => update('stayDays', Number(event.target.value))} className={inputClass} />
          </label>
          <label className="min-w-0 text-sm font-semibold text-gray-800">Trip type
            <select required name="tripType" data-field="tripType" aria-invalid={validation?.field === 'tripType'} value={input.tripType} onChange={(event) => update('tripType', event.target.value as TripType)} className={inputClass}>
              <option value="">Select trip type</option>
              {tripTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {input.tripType === 'transit' && (
          <fieldset className={`mt-5 grid min-w-0 gap-4 border-t border-gray-200 pt-5 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'}`}>
            <legend className="px-2 text-sm font-bold text-gray-950">Third-country transit route</legend>
            <label className="min-w-0 text-sm font-semibold text-gray-800">Country or region before Mainland China
              <input required name="originCountryOrRegion" data-field="originCountryOrRegion" aria-invalid={validation?.field === 'originCountryOrRegion'} value={input.originCountryOrRegion} onChange={(event) => update('originCountryOrRegion', event.target.value)} autoComplete="off" className={inputClass} />
            </label>
            <label className="min-w-0 text-sm font-semibold text-gray-800">Next country or region after Mainland China
              <input required name="onwardCountryOrRegion" data-field="onwardCountryOrRegion" aria-invalid={validation?.field === 'onwardCountryOrRegion'} value={input.onwardCountryOrRegion} onChange={(event) => update('onwardCountryOrRegion', event.target.value)} autoComplete="off" className={inputClass} />
            </label>
            <p className={`text-xs leading-5 text-gray-500 ${compact ? 'sm:col-span-2' : 'md:col-span-2'}`}>Do not enter passport numbers, identity numbers or other sensitive personal information.</p>
          </fieldset>
        )}

        {validation && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{validation.message}</p>}

        <button type="submit" disabled={authLoading} className="mt-5 w-full rounded-xl bg-[#155e63] px-5 py-3 font-bold text-white transition hover:bg-[#104c50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155e63] disabled:cursor-wait disabled:opacity-60">
          {authLoading ? 'Checking account...' : 'Check my China visa policy'}
        </button>
        <p className="mt-2 text-center text-[11px] font-medium text-gray-500">Free account required · Takes less than 1 minute</p>
      </form>

      {authOpen && (
        <VisaAccountGate
          onClose={() => setAuthOpen(false)}
          onAuthenticated={() => {
            if (pendingResult) revealResult(pendingResult);
          }}
          signup={signup}
          login={login}
          loginWithGoogle={loginWithGoogle}
          resetPassword={resetPassword}
        />
      )}

      {result && (
        <section aria-live="polite" aria-atomic="true" className={`mt-5 rounded-2xl border p-4 ${resultTone[result.category]}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Planning result</p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">{result.heading}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">{result.summary}</p>
          <div className={`mt-5 grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
            <div>
              <h3 className="font-bold">Why this result</h3>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-gray-700">
                {result.basis.map((item) => <li key={item} className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Conditions still to check</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">{result.remainingConditions.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <dl className={`mt-5 grid gap-3 rounded-xl bg-white/70 p-4 text-sm ${compact ? '' : 'md:grid-cols-2'}`}>
            <div><dt className="font-semibold text-gray-500">Maximum stay</dt><dd className="mt-1 font-semibold">{result.maximumStay}</dd></div>
            <div><dt className="font-semibold text-gray-500">Policy validity</dt><dd className="mt-1 font-semibold">{result.policyValidity}</dd></div>
            <div className={compact ? '' : 'md:col-span-2'}><dt className="font-semibold text-gray-500">Next action</dt><dd className="mt-1">{result.nextAction}</dd></div>
            <div className={compact ? '' : 'md:col-span-2'}><dt className="font-semibold text-gray-500">Last policy check</dt><dd className="mt-1">{POLICY_LAST_VERIFIED_LABEL}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {result.sources.map((source, index) => (
              <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" onClick={() => void trackEvent('visa_checker_official_source_click', { resultCategory: result.category, policyType: result.policyType, completed: true })} className="inline-flex items-center gap-1.5 rounded-lg border border-[#155e63]/25 bg-white px-3 py-2 text-xs font-bold text-[#155e63]">
                {index === 0 ? 'Open official source' : source.label} <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            ))}
            <button type="button" onClick={() => void copyText(resultSummary(result), 'Result summary copied.')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold"><Clipboard aria-hidden="true" className="h-4 w-4" /> Copy result</button>
            <button type="button" onClick={() => void copyText(result.sources[0]?.url ?? '', 'Official source link copied.')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold"><Clipboard aria-hidden="true" className="h-4 w-4" /> Copy official source link</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Check another passport</button>
          </div>
          {copyStatus && <p role="status" className="mt-3 text-sm text-gray-700">{copyStatus}</p>}
          <p className="mt-5 border-t border-gray-300/60 pt-4 text-xs leading-5 text-gray-600">This result does not guarantee entry. Chinese border inspection authorities make the final decision.</p>
          <a
            href={tripStarterUrl()}
            onClick={() => void trackEvent('visa_checker_cta_click', { resultCategory: result.category, policyType: result.policyType, completed: true })}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0f4c4a] px-4 py-2.5 text-sm font-bold text-white"
          >
            Open Free Trip Starter
          </a>
        </section>
      )}
    </div>
  );
}
