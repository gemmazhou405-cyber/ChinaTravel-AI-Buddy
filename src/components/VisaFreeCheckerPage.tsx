import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import transit240Guide from '../data/seoPages/china-240-hour-visa-free-transit-2026.json';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import {
  NATIONALITIES,
  evaluateVisaFree,
  type VisaCheckerInput,
  type VisaCheckerResult,
  type VisaPurpose,
} from '../lib/visaChecker';

const siteUrl = 'https://chinaeasebuddy.com';
const path = '/china-visa-free-checker/';
const title = 'China Visa-Free Checker (2026) | ChinaEase Buddy';
const description = 'Check whether a current ordinary-passport, 240-hour transit, UK/Canada temporary, mutual, or Hainan visa-free rule may fit your China trip.';
const transitPorts = transit240Guide.contentSections
  .find((section) => section.title.startsWith('65 designated ports'))
  ?.table?.rows.map((row) => row[1]) ?? [];

const purposes: Array<{ value: VisaPurpose; label: string }> = [
  { value: 'tourism', label: 'Tourism' },
  { value: 'business', label: 'Business' },
  { value: 'family_visit', label: 'Visit family or friends' },
  { value: 'exchange', label: 'Exchange or visit' },
  { value: 'transit', label: 'Transit to a third country or region' },
  { value: 'medical', label: 'Medical visit' },
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'journalism', label: 'Journalism' },
  { value: 'other', label: 'Other' },
];

const initialInput: VisaCheckerInput = {
  nationality: '',
  ordinaryPassport: true,
  entryDate: '',
  stayDays: 10,
  purpose: 'tourism',
  arrivalPort: '',
  departurePort: '',
  continuesToThirdCountryOrRegion: false,
  originCountryOrRegion: '',
  onwardCountryOrRegion: '',
  hainanOnly: false,
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

export default function VisaFreeCheckerPage() {
  const [input, setInput] = useState<VisaCheckerInput>(initialInput);
  const [result, setResult] = useState<VisaCheckerResult | null>(null);
  const canCheck = Boolean(input.nationality && input.entryDate && input.stayDays > 0);
  const portOptions = useMemo(() => [...transitPorts].sort((a, b) => a.localeCompare(b)), []);

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', `${siteUrl}${path}`);
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
        {
          '@type': 'WebApplication',
          '@id': `${siteUrl}${path}#application`,
          name: 'China Visa-Free Checker',
          url: `${siteUrl}${path}`,
          applicationCategory: 'TravelApplication',
          operatingSystem: 'Web',
          description,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides/` },
            { '@type': 'ListItem', position: 3, name: 'China Visa-Free Checker', item: `${siteUrl}${path}` },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            ['Does this checker guarantee visa-free entry?', 'No. It checks selected published rules against the information you provide. Chinese border inspection, the carrier, and the relevant embassy or consulate make operational and final decisions.'],
            ['Does 240-hour transit require a third country?', 'Yes. The ticketed route must continue from mainland China to a country or region different from the origin. The exact ports and permitted stay areas must also match the current official list.'],
            ['Is the Hainan policy the same as nationwide visa-free entry?', 'No. Hainan has a separate regional policy for eligible nationalities and covered purposes. It requires travelers to remain in Hainan and should not be treated as permission to travel elsewhere in mainland China.'],
          ].map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
        },
      ],
    });
    document.head.appendChild(schema);

    initAttribution();
    trackEventOnce('guide:china-visa-free-checker', 'guide_page_viewed', { pageType: 'china-visa-free-checker', path });
    return () => document.getElementById(schema.id)?.remove();
  }, []);

  const update = <K extends keyof VisaCheckerInput>(key: K, value: VisaCheckerInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
    setResult(null);
  };

  const handleCheck = () => {
    if (!canCheck) return;
    setResult(evaluateVisaFree(input, transitPorts));
  };

  const handleCta = () => {
    void trackEvent('guide_cta_click', { guidePage: 'china-visa-free-checker', destination: '/#trip-plan' });
    window.location.href = '/#trip-plan';
  };

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-gray-900 md:px-6">
      <div className="mx-auto max-w-5xl">
        <a href="/guides/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63]">
          <ArrowLeft className="h-4 w-4" /> Back to guides
        </a>
        <article className="min-w-0 overflow-hidden rounded-3xl border border-[#155e63]/10 bg-white/90 p-5 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Beta · last verified October 1, 2026</p>
          <h1 className="mt-3 max-w-3xl break-words text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">China Visa-Free Checker</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
            Check whether a verified ordinary entry, temporary UK/Canada, 240-hour transit, mutual agreement, or Hainan rule may fit your planned route. This tool is a planning aid, not an entry authorization.
          </p>

          <section aria-labelledby="checker-heading" className="mt-8 min-w-0 rounded-2xl border border-[#155e63]/15 bg-[#f8fbfa] p-4 md:p-6">
            <h2 id="checker-heading" className="text-xl font-bold text-gray-950">Check your planned trip</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-800">Passport nationality
                <input list="visa-checker-nationalities" value={input.nationality} onChange={(event) => update('nationality', event.target.value)} placeholder="Start typing a nationality" className="mt-2 min-w-0 w-full max-w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal" />
                <datalist id="visa-checker-nationalities">
                  {NATIONALITIES.map((country) => <option key={country} value={country} />)}
                </datalist>
              </label>
              <label className="text-sm font-semibold text-gray-800">Purpose of visit
                <select value={input.purpose} onChange={(event) => update('purpose', event.target.value as VisaPurpose)} className="mt-2 min-w-0 w-full max-w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal">
                  {purposes.map((purpose) => <option key={purpose.value} value={purpose.value}>{purpose.label}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-800">Planned entry date
                <input type="date" value={input.entryDate} onChange={(event) => update('entryDate', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal" />
              </label>
              <label className="text-sm font-semibold text-gray-800">Length of stay (days)
                <input type="number" min="1" max="180" value={input.stayDays} onChange={(event) => update('stayDays', Number(event.target.value))} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal" />
              </label>
              <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800">
                <input className="shrink-0" type="checkbox" checked={input.ordinaryPassport} onChange={(event) => update('ordinaryPassport', event.target.checked)} /> <span className="min-w-0">I hold an ordinary passport</span>
              </label>
              <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800">
                <input className="shrink-0" type="checkbox" checked={input.hainanOnly} onChange={(event) => update('hainanOnly', event.target.checked)} /> <span className="min-w-0">My entire mainland stay is limited to Hainan</span>
              </label>
            </div>

            <fieldset className="mt-6 min-w-0 border-t border-gray-200 pt-5">
              <legend className="px-2 text-sm font-bold text-gray-950">Route details for 240-hour transit</legend>
              <label className="mt-3 flex items-start gap-3 text-sm text-gray-700">
                <input className="mt-1" type="checkbox" checked={input.continuesToThirdCountryOrRegion} onChange={(event) => update('continuesToThirdCountryOrRegion', event.target.checked)} />
                I will continue to a country or region different from where I started.
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-gray-800">Origin country or region
                  <input value={input.originCountryOrRegion} onChange={(event) => update('originCountryOrRegion', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal" />
                </label>
                <label className="text-sm font-semibold text-gray-800">Onward country or region
                  <input value={input.onwardCountryOrRegion} onChange={(event) => update('onwardCountryOrRegion', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal" />
                </label>
                <label className="text-sm font-semibold text-gray-800">Arrival port
                  <select value={input.arrivalPort} onChange={(event) => update('arrivalPort', event.target.value)} className="mt-2 min-w-0 w-full max-w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal">
                    <option value="">Select exact port</option>
                    {portOptions.map((port) => <option key={port}>{port}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-gray-800">Departure port
                  <select value={input.departurePort} onChange={(event) => update('departurePort', event.target.value)} className="mt-2 min-w-0 w-full max-w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal">
                    <option value="">Select exact port</option>
                    {portOptions.map((port) => <option key={port}>{port}</option>)}
                  </select>
                </label>
              </div>
            </fieldset>
            <button type="button" disabled={!canCheck} onClick={handleCheck} className="mt-6 w-full rounded-xl bg-[#155e63] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-45 md:w-auto">Check possible visa-free routes</button>
          </section>

          {result && (
            <section aria-live="polite" className="mt-6 rounded-2xl border border-[#d6a85a]/40 bg-[#fff9ec] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8a641f]">Planning result</p>
              <h2 className="mt-2 text-xl font-bold text-gray-950">{result.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-700">Based on the information provided: {result.explanation}</p>
              {result.checks.length > 0 && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">{result.checks.map((check) => <li key={check}>{check}</li>)}</ul>}
              <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#155e63]">Check the official source <ExternalLink className="h-4 w-4" /></a>
            </section>
          )}

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['Does this checker guarantee visa-free entry?', 'No. It checks selected published rules against your inputs. Chinese border inspection, the carrier, and the relevant embassy or consulate make operational and final decisions.'],
              ['Does 240-hour transit require a third country?', 'Yes. Your ticketed route must continue from mainland China to a country or region different from the origin, using eligible ports and permitted stay areas.'],
              ['Is Hainan the same as nationwide visa-free entry?', 'No. Hainan has a separate regional policy. Eligible travelers must remain in Hainan and should not treat it as permission to travel elsewhere in mainland China.'],
            ].map(([question, answer]) => <article key={question} className="rounded-2xl border border-gray-100 bg-white p-4"><h2 className="text-base font-bold">{question}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{answer}</p></article>)}
          </section>

          <nav aria-label="Related China entry and travel guides" className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[#155e63]">
            <a href="/china-240-hour-visa-free-transit-2026/">240-hour transit guide</a>
            <a href="/china-visa-free-travel-guide/">Visa-free travel guide</a>
            <a href="/china-airport-arrival-guide/">Airport arrival guide</a>
            <a href="/china-travel-checklist/">China travel checklist</a>
          </nav>

          <section className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600">Planning your first trip to China? Get a free personalized trip starter.</p>
            <button type="button" onClick={handleCta} className="mt-3 rounded-xl bg-[#155e63] px-5 py-3 text-sm font-bold text-white">Get my free trip starter</button>
          </section>
          <p className="mt-6 text-xs leading-6 text-gray-500">Final eligibility and admission depend on current official rules and decisions by Chinese embassies or consulates, the operating carrier, and Chinese border inspection. Recheck all rules immediately before travel.</p>
        </article>
      </div>
    </main>
  );
}
