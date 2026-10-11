import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, AlertTriangle, ArrowLeft, Calculator, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react';
import { CHECKER_COUNTRY_OPTIONS, normalizeNationalityToIso, OFFICIAL_VISA_SOURCES } from '../data/chinaVisaPolicies';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { calculateTransitDeadline, type TransitCalculatorResult } from '../lib/transitCalculator';

const siteUrl = 'https://chinaeasebuddy.com';
const path = '/china-240-hour-transit-calculator/';
const title = 'China 240-Hour Transit Calculator: Latest Departure Time';
const description = 'Calculate the latest departure time under China’s 240-hour visa-free transit clock, then verify your nationality, port, route and permitted stay area.';
const lastVerified = 'October 11, 2026';

const faqs = [
  ['When does the 240-hour clock start?', 'Under the current National Immigration Administration rule, the 240-hour period is calculated from 00:00 on the day after entry. This calculator uses China Standard Time. Your immigration record and the border authority’s calculation control, so leave a practical buffer before the displayed boundary.'],
  ['Does this calculator confirm that I qualify?', 'No. It calculates the time window only. Eligibility also depends on your passport nationality, ordinary-passport status, confirmed onward ticket, third-country or region route, designated entry and exit ports, permitted stay area, purpose of travel and the policy in force on your travel date.'],
  ['Can I return to the same country or region I departed from?', 'A simple route such as United States to Mainland China to United States does not meet the third-country or region transit pattern. The origin and onward destination normally need to be different. Airlines and border authorities should confirm complex routes before travel.'],
  ['Does every airport or port qualify?', 'No. The policy applies through designated ports and within permitted areas. Selecting an entry city here does not verify a particular terminal, airport, railway port or seaport. Check the latest official port list and confirm your planned entry and exit points.'],
  ['Which time zone does the calculator use?', 'All results use China Standard Time, UTC+8. The date and time you enter should be the local scheduled arrival time in Mainland China. Flight changes, immigration processing and the actual entry record can affect planning, so do not schedule departure at the exact final minute.'],
] as const;

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

export default function TransitCalculatorPage() {
  const [arrivalLocal, setArrivalLocal] = useState('');
  const [entryCity, setEntryCity] = useState('');
  const [passportNationality, setPassportNationality] = useState('');
  const [originRegion, setOriginRegion] = useState('');
  const [onwardRegion, setOnwardRegion] = useState('');
  const [result, setResult] = useState<TransitCalculatorResult | null>(null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

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

    document.getElementById('chinaease-guide-schema')?.remove();
    const schema = document.createElement('script');
    schema.id = 'chinaease-transit-calculator-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${siteUrl}${path}#webpage`, url: `${siteUrl}${path}`, name: title, description, dateModified: '2026-10-11' },
        { '@type': 'WebApplication', '@id': `${siteUrl}${path}#application`, name: 'China 240-Hour Transit Calculator', url: `${siteUrl}${path}`, applicationCategory: 'TravelApplication', operatingSystem: 'Web', description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
        { '@type': 'BreadcrumbList', '@id': `${siteUrl}${path}#breadcrumb`, itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides/` },
          { '@type': 'ListItem', position: 3, name: '240-Hour Transit Calculator', item: `${siteUrl}${path}` },
        ] },
        { '@type': 'FAQPage', '@id': `${siteUrl}${path}#faq`, mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      ],
    });
    document.head.appendChild(schema);
    initAttribution();
    trackEventOnce('guide:china-240-hour-transit-calculator', 'guide_page_viewed', { pageType: 'china-240-hour-transit-calculator', path });
    return () => document.getElementById(schema.id)?.remove();
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    void trackEvent('visa_checker_start', { policyType: 'transit_240_hour', completed: false });
    try {
      const passportNationalityCode = passportNationality.trim() ? normalizeNationalityToIso(passportNationality) : '';
      const nextResult = calculateTransitDeadline({ arrivalLocal, entryCity, passportNationalityCode, originRegion, onwardRegion });
      setResult(nextResult);
      void trackEvent('visa_checker_complete', {
        resultCategory: nextResult.eligibilityStatus,
        policyType: 'transit_240_hour',
        completed: true,
      });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setResult(null);
      setError('Complete all fields with a valid arrival date and time.');
    }
  };

  const reset = () => {
    setArrivalLocal('');
    setEntryCity('');
    setPassportNationality('');
    setOriginRegion('');
    setOnwardRegion('');
    setResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ea] px-4 py-8 text-[#122022] md:px-6">
      <div className="mx-auto max-w-5xl">
        <a href="/guides/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to guides</a>
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Free planning tool · Last policy check {lastVerified}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-gray-950 md:text-6xl">China 240-Hour Visa-Free Transit Calculator</h1>
          <p className="mt-4 text-base leading-7 text-gray-600 md:text-lg">Enter your planned arrival and route to calculate the 240-hour clock in China Standard Time. This is a timing tool, not an eligibility or admission decision.</p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start" aria-labelledby="calculator-title">
          <form onSubmit={submit} className="rounded-3xl border border-[#155e63]/15 bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f4f1] text-[#155e63]"><Calculator className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#155e63]">240-hour clock</p><h2 id="calculator-title" className="text-xl font-bold">Calculate your departure boundary</h2></div></div>
            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-bold">Arrival date and time in Mainland China<input required type="datetime-local" value={arrivalLocal} onChange={(event) => setArrivalLocal(event.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base font-normal focus:border-[#155e63] focus:outline-none focus:ring-2 focus:ring-[#155e63]/20" /></label>
              <label className="grid gap-2 text-sm font-bold">Entry city<input required list="china-entry-cities" value={entryCity} onChange={(event) => setEntryCity(event.target.value)} placeholder="For example, Shanghai" className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base font-normal focus:border-[#155e63] focus:outline-none focus:ring-2 focus:ring-[#155e63]/20" /><span className="text-xs font-normal leading-5 text-gray-500">A city selection does not confirm that your exact port qualifies.</span></label>
              <datalist id="china-entry-cities"><option value="Beijing" /><option value="Shanghai" /><option value="Guangzhou" /><option value="Shenzhen" /><option value="Chengdu" /><option value="Chongqing" /><option value="Xi'an" /><option value="Hangzhou" /><option value="Nanjing" /><option value="Xiamen" /></datalist>
              <label className="grid gap-2 text-sm font-bold">Passport nationality<input list="transit-passport-nationalities" value={passportNationality} onChange={(event) => setPassportNationality(event.target.value)} placeholder="Search nationality" autoComplete="off" className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base font-normal focus:border-[#155e63] focus:outline-none focus:ring-2 focus:ring-[#155e63]/20" /><span className="text-xs font-normal leading-5 text-gray-500">Checked against the current public NIA 240-hour policy list.</span></label>
              <datalist id="transit-passport-nationalities">{CHECKER_COUNTRY_OPTIONS.filter((country) => country.code !== 'CN' && country.code !== 'ZZ').map((country) => <option key={`nationality-${country.code}`} value={country.name} />)}</datalist>
              <label className="grid gap-2 text-sm font-bold">Country or region before Mainland China<select required value={originRegion} onChange={(event) => setOriginRegion(event.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base font-normal focus:border-[#155e63] focus:outline-none focus:ring-2 focus:ring-[#155e63]/20"><option value="">Select origin</option>{CHECKER_COUNTRY_OPTIONS.map((country) => <option key={`origin-${country.code}`} value={country.code}>{country.name}</option>)}</select></label>
              <label className="grid gap-2 text-sm font-bold">Onward country or region after Mainland China<select required value={onwardRegion} onChange={(event) => setOnwardRegion(event.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base font-normal focus:border-[#155e63] focus:outline-none focus:ring-2 focus:ring-[#155e63]/20"><option value="">Select onward destination</option>{CHECKER_COUNTRY_OPTIONS.map((country) => <option key={`onward-${country.code}`} value={country.code}>{country.name}</option>)}</select></label>
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
            <button type="submit" className="mt-6 min-h-12 w-full rounded-xl bg-[#155e63] px-5 py-3 font-bold text-white transition hover:bg-[#104c50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155e63]">Calculate latest departure time</button>
          </form>

          <div ref={resultRef} tabIndex={-1} aria-live="polite" className="rounded-3xl border border-[#155e63]/15 bg-[#edf5f2] p-5 outline-none md:p-7">
            {result ? <>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Calculated in China Standard Time</p>
              <h2 className="mt-3 text-2xl font-bold">Plan to clear exit inspection by</h2>
              <p className="mt-3 break-words text-3xl font-bold text-[#155e63]">{result.planningLatestLabel}</p>
              <dl className="mt-6 grid gap-4 rounded-2xl bg-white p-5 text-sm">
                <div><dt className="font-semibold text-gray-500">240-hour clock starts</dt><dd className="mt-1 font-bold">{result.clockStartLabel}</dd></div>
                <div><dt className="font-semibold text-gray-500">Exact 240-hour boundary</dt><dd className="mt-1 font-bold">{result.deadlineExclusiveLabel}</dd></div>
              </dl>
              <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${result.eligibilityStatus === 'basic_requirements_match' ? 'border-[#155e63]/25 bg-white text-[#123f42]' : result.eligibilityStatus === 'nationality_not_eligible' ? 'border-red-200 bg-red-50 text-red-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                {result.eligibilityStatus === 'basic_requirements_match' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#155e63]" aria-hidden="true" /> : result.eligibilityStatus === 'nationality_not_eligible' ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
                <p className="text-sm leading-6">{
                  result.eligibilityStatus === 'basic_requirements_match'
                    ? 'Your passport nationality and route pattern appear to match the basic public requirements for China’s 240-hour visa-free transit. This is not a final eligibility decision.'
                    : result.eligibilityStatus === 'nationality_not_eligible'
                      ? 'Your passport nationality does not appear to be listed for China’s 240-hour visa-free transit under the current public NIA policy. You may need a Chinese visa or another visa-free policy.'
                      : result.eligibilityStatus === 'route_pattern_invalid'
                        ? 'Your origin and onward destination do not appear to form a third-country or third-region transit route.'
                        : 'Add your passport nationality to check whether this route may fit the 240-hour policy.'
                }</p>
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-gray-800">This calculator does not confirm final eligibility.</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700"><li>Use your actual immigration entry record if it differs from the scheduled arrival.</li><li>Verify passport nationality, ordinary-passport status, designated entry and exit ports, a confirmed onward ticket, permitted stay area, and the actual border inspection decision.</li><li>Do not plan to complete exit inspection at the exact boundary; allow a practical buffer.</li></ul>
              <a href="/plan/" onClick={() => void trackEvent('visa_checker_cta_click', { resultCategory: result.eligibilityStatus, policyType: 'transit_240_hour', completed: true })} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0f4c4a] px-5 py-3 text-center font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f4c4a]">Get my free China trip plan</a>
              <button type="button" onClick={reset} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#155e63]/25 bg-white px-4 py-2 text-sm font-bold text-[#155e63]"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Calculate another route</button>
            </> : <div className="flex min-h-[360px] flex-col justify-center"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Your result</p><h2 className="mt-3 text-2xl font-bold">See the China Standard Time boundary</h2><p className="mt-3 text-sm leading-7 text-gray-600">Add your route and passport nationality to calculate the 240-hour boundary and compare the basic nationality and third-country-or-region requirements.</p><div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Important:</strong> The calculator cannot confirm final eligibility, your exact port or permitted stay area.</div></div>}
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2" aria-labelledby="how-it-works"><div className="rounded-2xl border border-gray-200 bg-white p-5"><h2 id="how-it-works" className="text-xl font-bold">How the calculation works</h2><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-gray-600"><li>Read the local arrival date in Mainland China.</li><li>Start the clock at 00:00 on the following day.</li><li>Add 240 hours using China Standard Time.</li><li>Display one minute before the boundary as the latest planning time.</li></ol></div><div className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="text-xl font-bold">What you still need to verify</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600"><li>Your nationality is on the current eligible list.</li><li>Your entry and exit points are designated ports.</li><li>Your route continues to a different country or region.</li><li>Your travel remains inside the permitted area.</li></ul></div></section>

        <section className="mt-10" aria-labelledby="transit-faq"><h2 id="transit-faq" className="text-2xl font-bold">Frequently asked questions</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{faqs.map(([question, answer]) => <article key={question} className="rounded-2xl border border-gray-200 bg-white p-5"><h3 className="font-bold">{question}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{answer}</p></article>)}</div></section>

        <section className="mt-10 border-t border-gray-300 pt-6"><h2 className="text-xl font-bold">Official source and related checks</h2><div className="mt-4 flex flex-wrap gap-3"><a href={OFFICIAL_VISA_SOURCES.transit240} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#155e63]/25 bg-white px-4 py-2 text-sm font-bold text-[#155e63]">NIA 240-hour transit policy <ExternalLink className="h-4 w-4" aria-hidden="true" /></a><a href="/china-240-hour-visa-free-transit-2026/" className="inline-flex min-h-11 items-center rounded-xl border border-[#155e63]/25 bg-white px-4 py-2 text-sm font-bold text-[#155e63]">Read the full transit guide</a><a href="/china-visa-free-checker/" className="inline-flex min-h-11 items-center rounded-xl border border-[#155e63]/25 bg-white px-4 py-2 text-sm font-bold text-[#155e63]">Check visa-free policies</a></div><p className="mt-5 max-w-3xl text-sm leading-6 text-gray-500">Policy and port practice can change. Confirm the latest official rules before booking. Chinese border inspection authorities make the final admission and temporary-entry decision.</p></section>
      </div>
    </main>
  );
}
