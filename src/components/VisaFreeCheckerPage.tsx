import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Clipboard, ExternalLink, RotateCcw } from 'lucide-react';
import visaCheckerContent from '../data/seoPages/china-visa-free-checker.json';
import {
  CHECKER_COUNTRY_OPTIONS,
  POLICY_LAST_VERIFIED_LABEL,
  type PassportType,
  type TripType,
  type VisaPurpose,
} from '../data/chinaVisaPolicies';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { evaluateVisaFree, type VisaCheckerInput, type VisaCheckerResult } from '../lib/visaChecker';

const siteUrl = 'https://chinaeasebuddy.com';
const path = '/china-visa-free-checker/';
const title = visaCheckerContent.title;
const description = visaCheckerContent.description;

const purposeOptions: Array<{ value: VisaPurpose; label: string }> = [
  { value: 'tourism', label: 'Tourism' }, { value: 'business', label: 'Business' },
  { value: 'family_visit', label: 'Visit family or friends' }, { value: 'exchange', label: 'Exchange visit' },
  { value: 'transit', label: 'Transit' }, { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' }, { value: 'journalism', label: 'Journalism/news reporting' },
  { value: 'other', label: 'Other' },
];

const tripTypeOptions: Array<{ value: TripType; label: string }> = [
  { value: 'mainland_visit', label: 'Mainland China visit' },
  { value: 'transit', label: 'Transit through Mainland China to another country or region' },
  { value: 'hainan_only', label: 'Hainan only' },
];

const initialInput: VisaCheckerInput = {
  nationalityCode: '', passportType: '', entryDate: '', purpose: '', stayDays: 10,
  tripType: '', originCountryOrRegion: '', onwardCountryOrRegion: '',
};

const resultTone: Record<VisaCheckerResult['category'], string> = {
  likely_eligible: 'border-emerald-700/25 bg-emerald-50',
  additional_checks: 'border-amber-700/25 bg-amber-50',
  date_unconfirmed: 'border-amber-700/25 bg-amber-50',
  visa_may_be_required: 'border-rose-700/20 bg-rose-50',
  cannot_determine: 'border-slate-400/35 bg-slate-50',
};

function setMeta(selector: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    const property = selector.match(/property="([^"]+)"/)?.[1];
    const name = selector.match(/name="([^"]+)"/)?.[1];
    if (property) element.setAttribute('property', property);
    if (name) element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.content = value;
}

function tripStarterUrl() {
  const incoming = new URLSearchParams(window.location.search);
  const outgoing = new URLSearchParams();
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source'].forEach((key) => {
    const value = incoming.get(key);
    if (value) outgoing.set(key, value);
  });
  const query = outgoing.toString();
  return `/${query ? `?${query}` : ''}#trip-plan`;
}

function resultSummary(result: VisaCheckerResult) {
  return [result.heading, result.summary, `Maximum stay: ${result.maximumStay}`,
    `Policy validity: ${result.policyValidity}`, `Next step: ${result.nextAction}`,
    `Last policy check: ${POLICY_LAST_VERIFIED_LABEL}`].join('\n');
}

export default function VisaFreeCheckerPage() {
  const [input, setInput] = useState<VisaCheckerInput>(initialInput);
  const [result, setResult] = useState<VisaCheckerResult | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const startedRef = useRef(false);

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', `${siteUrl}${path}`);
    setMeta('meta[property="og:type"]', 'website');
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteUrl}${path}`;

    const schema = document.createElement('script');
    schema.id = 'chinaease-visa-checker-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${siteUrl}${path}#webpage`, url: `${siteUrl}${path}`, name: title, description, dateModified: visaCheckerContent.lastModified },
        { '@type': 'WebApplication', '@id': `${siteUrl}${path}#application`, name: 'China Visa-Free Checker', url: `${siteUrl}${path}`, applicationCategory: 'TravelApplication', operatingSystem: 'Web', description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
        { '@type': 'BreadcrumbList', '@id': `${siteUrl}${path}#breadcrumb`, itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides/` },
          { '@type': 'ListItem', position: 3, name: 'China Visa-Free Checker', item: `${siteUrl}${path}` },
        ] },
        { '@type': 'FAQPage', '@id': `${siteUrl}${path}#faq`, mainEntity: visaCheckerContent.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      ],
    });
    document.head.appendChild(schema);
    initAttribution();
    trackEventOnce('guide:china-visa-free-checker', 'guide_page_viewed', { pageType: 'china-visa-free-checker', path });
    return () => document.getElementById(schema.id)?.remove();
  }, []);

  const update = <K extends keyof VisaCheckerInput>(key: K, value: VisaCheckerInput[K]) => {
    if (!startedRef.current) {
      startedRef.current = true;
      void trackEvent('visa_checker_start', { completed: false });
    }
    setInput((current) => ({ ...current, [key]: value }));
    setResult(null);
    setCopyStatus('');
  };

  const handleCheck = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = evaluateVisaFree(input);
    setResult(next);
    setCopyStatus('');
    void trackEvent('visa_checker_complete', { resultCategory: next.category, policyType: next.policyType, completed: true });
  };

  const handleCta = () => {
    void trackEvent('visa_checker_cta_click', { resultCategory: result?.category ?? 'cannot_determine', policyType: result?.policyType ?? 'none', completed: Boolean(result) });
    window.location.href = tripStarterUrl();
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
    setCopyStatus('');
    startedRef.current = false;
  };

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f7f3ea] px-4 py-8 text-[#122022] md:px-6">
      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <a href="/guides/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63]"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to guides</a>
        <article className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-[#155e63]/10 bg-white/90 p-5 shadow-sm md:p-8">
          <p className="break-words text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Free planning tool · policy check {POLICY_LAST_VERIFIED_LABEL}</p>
          <h1 className="mt-3 max-w-3xl break-words text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">China Visa-Free Checker</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">Check which China visa-free policy may apply to your passport, travel date and itinerary.</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">This is a policy screening tool, not a government visa decision. It does not guarantee admission, and final entry decisions are made by Chinese border inspection authorities.</p>

          <form onSubmit={handleCheck} aria-labelledby="checker-heading" className="mt-8 rounded-2xl border border-[#155e63]/15 bg-[#f8fbfa] p-4 md:p-6">
            <h2 id="checker-heading" className="text-xl font-bold text-gray-950">Check your planned trip</h2>
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
              <label className="min-w-0 text-sm font-semibold text-gray-800">Passport nationality
                <select required value={input.nationalityCode} onChange={(event) => update('nationalityCode', event.target.value)} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal">
                  <option value="">Select nationality</option>{CHECKER_COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                </select>
              </label>
              <label className="min-w-0 text-sm font-semibold text-gray-800">Passport type
                <select required value={input.passportType} onChange={(event) => update('passportType', event.target.value as PassportType)} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal">
                  <option value="">Select passport type</option><option value="ordinary">Ordinary passport</option><option value="other">Diplomatic/service/official/other</option>
                </select>
              </label>
              <label className="min-w-0 text-sm font-semibold text-gray-800">Planned entry date
                <input required type="date" value={input.entryDate} onChange={(event) => update('entryDate', event.target.value)} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal" />
              </label>
              <label className="min-w-0 text-sm font-semibold text-gray-800">Purpose of visit
                <select required value={input.purpose} onChange={(event) => update('purpose', event.target.value as VisaPurpose)} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal">
                  <option value="">Select purpose</option>{purposeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="min-w-0 text-sm font-semibold text-gray-800">Planned stay (days)
                <input required type="number" min="1" max="180" value={input.stayDays} onChange={(event) => update('stayDays', Number(event.target.value))} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal" />
              </label>
              <label className="min-w-0 text-sm font-semibold text-gray-800">Trip type
                <select required value={input.tripType} onChange={(event) => update('tripType', event.target.value as TripType)} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal">
                  <option value="">Select trip type</option>{tripTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            {input.tripType === 'transit' && (
              <fieldset className="mt-5 grid min-w-0 gap-4 border-t border-gray-200 pt-5 md:grid-cols-2">
                <legend className="px-2 text-sm font-bold text-gray-950">Third-country transit route</legend>
                <label className="min-w-0 text-sm font-semibold text-gray-800">Country or region before Mainland China
                  <input required value={input.originCountryOrRegion} onChange={(event) => update('originCountryOrRegion', event.target.value)} autoComplete="off" className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal" />
                </label>
                <label className="min-w-0 text-sm font-semibold text-gray-800">Next country or region after Mainland China
                  <input required value={input.onwardCountryOrRegion} onChange={(event) => update('onwardCountryOrRegion', event.target.value)} autoComplete="off" className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal" />
                </label>
                <p className="text-xs leading-5 text-gray-500 md:col-span-2">Do not enter passport numbers, identity numbers or other sensitive personal information.</p>
              </fieldset>
            )}
            <button type="submit" className="mt-6 w-full rounded-xl bg-[#155e63] px-5 py-3 font-bold text-white transition hover:bg-[#104c50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155e63] md:w-auto">Check possible visa-free policy</button>
          </form>

          {result && (
            <section aria-live="polite" aria-atomic="true" className={`mt-6 rounded-2xl border p-5 md:p-6 ${resultTone[result.category]}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Planning result</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">{result.heading}</h2>
              <p className="mt-3 leading-7 text-gray-700">{result.summary}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div><h3 className="font-bold">Why this result</h3><ul className="mt-2 space-y-2 text-sm leading-6 text-gray-700">{result.basis.map((item) => <li key={item} className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />{item}</li>)}</ul></div>
                <div><h3 className="font-bold">Conditions still to check</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">{result.remainingConditions.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <dl className="mt-5 grid gap-3 rounded-xl bg-white/70 p-4 text-sm md:grid-cols-2">
                <div><dt className="font-semibold text-gray-500">Maximum stay</dt><dd className="mt-1 font-semibold">{result.maximumStay}</dd></div>
                <div><dt className="font-semibold text-gray-500">Policy validity</dt><dd className="mt-1 font-semibold">{result.policyValidity}</dd></div>
                <div className="md:col-span-2"><dt className="font-semibold text-gray-500">Next action</dt><dd className="mt-1">{result.nextAction}</dd></div>
                <div className="md:col-span-2"><dt className="font-semibold text-gray-500">Last policy check</dt><dd className="mt-1">{POLICY_LAST_VERIFIED_LABEL}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                {result.sources.map((source, index) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" onClick={() => void trackEvent('visa_checker_official_source_click', { resultCategory: result.category, policyType: result.policyType, completed: true })} className="inline-flex items-center gap-1.5 rounded-lg border border-[#155e63]/25 bg-white px-3 py-2 text-sm font-bold text-[#155e63]">{index === 0 ? 'Open official source' : source.label} <ExternalLink aria-hidden="true" className="h-4 w-4" /></a>)}
                <button type="button" onClick={() => void copyText(resultSummary(result), 'Result summary copied.')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"><Clipboard aria-hidden="true" className="h-4 w-4" /> Copy result summary</button>
                <button type="button" onClick={() => void copyText(result.sources[0]?.url ?? '', 'Official source link copied.')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"><Clipboard aria-hidden="true" className="h-4 w-4" /> Copy official source link</button>
                <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Check another passport</button>
              </div>
              {copyStatus && <p role="status" className="mt-3 text-sm text-gray-700">{copyStatus}</p>}
              <p className="mt-5 border-t border-gray-300/60 pt-4 text-sm leading-6 text-gray-600">This result does not guarantee entry. Chinese border inspection authorities make the final decision.</p>
              <div className="mt-5 rounded-xl bg-[#0f4c4a] p-5 text-white"><p className="font-semibold">Planning your first trip to China? Get your free personalized trip starter.</p><button type="button" onClick={handleCta} className="mt-3 rounded-lg bg-[#f8f3ea] px-4 py-2.5 text-sm font-bold text-[#0f4c4a]">Open Free Trip Starter</button></div>
            </section>
          )}

          <div className="mt-10 space-y-5">{visaCheckerContent.contentSections.map((section, index) => <section key={section.title} aria-labelledby={`visa-section-${index}`} className="rounded-2xl border border-[#155e63]/10 bg-[#fffdf8] p-5"><h2 id={`visa-section-${index}`} className="text-xl font-bold">{section.title}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600">{section.items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>

          <section aria-labelledby="visa-faq" className="mt-10"><h2 id="visa-faq" className="text-2xl font-bold">Frequently asked questions</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{visaCheckerContent.faqs.map(([question, answer]) => <article key={question} className="rounded-2xl border border-gray-200 bg-white p-5"><h3 className="font-bold">{question}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{answer}</p></article>)}</div></section>

          <nav aria-label="Related China entry guides" className="mt-10"><h2 className="text-xl font-bold">Related entry guides</h2><div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-[#155e63]"><a href="/china-240-hour-visa-free-transit-2026/">240-hour transit guide</a><a href="/china-visa-free-travel-guide/">Visa-free travel guide</a><a href="/china-airport-arrival-guide/">Airport arrival guide</a><a href="/nia-12367-online-accommodation-registration-guide/">12367 accommodation registration guide</a><a href="/first-trip-to-china/">First trip to China</a></div></nav>

          <section aria-labelledby="visa-sources" className="mt-10 border-t border-gray-200 pt-6"><h2 id="visa-sources" className="text-xl font-bold">Official sources</h2><ul className="mt-3 space-y-2 text-sm leading-6">{visaCheckerContent.sourceLinks.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" onClick={() => void trackEvent('visa_checker_official_source_click', { resultCategory: result?.category ?? 'cannot_determine', policyType: result?.policyType ?? 'none', completed: Boolean(result) })} className="font-semibold text-[#155e63]">{label} <ExternalLink aria-hidden="true" className="inline h-3.5 w-3.5" /></a></li>)}</ul></section>
        </article>
      </div>
    </main>
  );
}
