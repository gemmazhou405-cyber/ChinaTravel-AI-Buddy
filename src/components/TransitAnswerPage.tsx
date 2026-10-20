import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Calculator, ExternalLink } from 'lucide-react';
import transitAnswers from '../data/transitAnswers.json';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { groupedPortRows, type TransitAnswerSlug } from '../lib/transitAnswers';

// 240-hour transit question pages. Content lives in src/data/transitAnswers.json and is shared with
// scripts/copy-policy-pages.mjs, which writes the same text into the prerendered HTML (and the FAQPage JSON-LD).

const siteUrl = 'https://chinaeasebuddy.com';

type AnswerPage = (typeof transitAnswers.pages)[number];
type SourceKey = 'officialSource' | 'niaSource';

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

function CalculatorCta({ slug, placement }: { slug: string; placement: string }) {
  return (
    <a
      href={transitAnswers.calculatorPath}
      onClick={() => void trackEvent('transit_answer_calculator_click', { slug, placement })}
      className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-[#155e63] px-5 py-4 font-bold text-white transition hover:bg-[#104c50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155e63]"
    >
      <span className="flex items-center gap-3">
        <Calculator className="h-5 w-5 shrink-0" aria-hidden="true" />
        Calculate your exact 240-hour deadline
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </a>
  );
}

export default function TransitAnswerPage({ slug }: { slug: TransitAnswerSlug }) {
  const page = transitAnswers.pages.find((item) => item.slug === slug) as AnswerPage;
  const path = `/${page.slug}/`;
  const others = transitAnswers.pages.filter((item) => item.slug !== slug);

  useEffect(() => {
    document.title = page.title;
    setMeta('meta[name="description"]', page.description);
    setMeta('meta[property="og:title"]', page.title);
    setMeta('meta[property="og:description"]', page.description);
    setMeta('meta[property="og:url"]', `${siteUrl}${path}`);
    setMeta('meta[name="twitter:title"]', page.title);
    setMeta('meta[name="twitter:description"]', page.description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteUrl}${path}`;
    initAttribution();
    trackEventOnce(`guide:${page.slug}`, 'guide_page_viewed', { pageType: page.slug, path });
  }, [page, path]);

  const sources = (page.sources as SourceKey[]).map((key) => transitAnswers[key]);
  const example = page.example;
  const lastUpdated = 'lastUpdated' in page && typeof page.lastUpdated === 'string' ? page.lastUpdated : transitAnswers.lastUpdated;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ea] px-4 py-8 text-[#122022] md:px-6">
      <article className="mx-auto max-w-3xl">
        <a href={transitAnswers.calculatorPath} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 240-hour transit calculator
        </a>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">China 240-hour visa-free transit · Updated {lastUpdated}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-gray-950 md:text-5xl">{page.question}</h1>

        <section aria-labelledby="short-answer" className="mt-6 rounded-3xl border border-[#155e63]/20 bg-white p-5 md:p-7">
          <h2 id="short-answer" className="text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Short answer</h2>
          {page.answer.map((sentence) => (
            <p key={sentence} className="mt-3 text-lg leading-8 text-gray-900">{sentence}</p>
          ))}
        </section>

        <div className="mt-5">
          <CalculatorCta slug={page.slug} placement="top" />
        </div>

        <section aria-labelledby="worked-example" className="mt-8 rounded-3xl border border-[#155e63]/15 bg-[#edf5f2] p-5 md:p-7">
          <h2 id="worked-example" className="text-2xl font-bold">{example.title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">{example.intro}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse bg-white text-left text-sm">
              <thead>
                <tr>{example.headers.map((header) => <th key={header} scope="col" className="border-b-2 border-[#155e63]/20 p-3 font-bold text-gray-900">{header}</th>)}</tr>
              </thead>
              <tbody>
                {example.rows.map((row) => (
                  <tr key={row.join('|')}>{row.map((cell, index) => <td key={`${index}-${cell}`} className="border-b border-[#155e63]/10 p-3 align-top text-gray-700">{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-700">{example.note}</p>
        </section>

        {page.sections.map((section, index) => {
          const items = section.items.map((item) => <li key={item}>{item}</li>);
          return (
            <section key={section.title} aria-labelledby={`answer-section-${index}`} className="mt-8">
              <h2 id={`answer-section-${index}`} className="text-2xl font-bold">{section.title}</h2>
              {'ordered' in section && section.ordered
                ? <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-7 text-gray-700">{items}</ol>
                : <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7 text-gray-700">{items}</ul>}
            </section>
          );
        })}

        {'portsTable' in page && page.portsTable && (
          <section aria-labelledby="ports-table" className="mt-8">
            <h2 id="ports-table" className="text-2xl font-bold">All 65 designated ports by region</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead><tr><th scope="col" className="border-b-2 border-[#155e63]/20 p-3">Province or region</th><th scope="col" className="border-b-2 border-[#155e63]/20 p-3">Designated ports</th><th scope="col" className="border-b-2 border-[#155e63]/20 p-3">Where you may travel in this region</th></tr></thead>
                <tbody>{groupedPortRows().map(([province, ports, area]) => <tr key={province}><td className="border-b border-gray-100 p-3 align-top font-semibold">{province}</td><td className="border-b border-gray-100 p-3 align-top text-gray-700">{ports}</td><td className="border-b border-gray-100 p-3 align-top text-gray-700">{area}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        <section aria-labelledby="answer-faq" className="mt-10">
          <h2 id="answer-faq" className="text-2xl font-bold">Related questions</h2>
          <div className="mt-4 grid gap-3">
            {page.faqs.map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-bold">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-700">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <CalculatorCta slug={page.slug} placement="bottom" />
        </div>

        <nav aria-labelledby="more-answers" className="mt-10">
          <h2 id="more-answers" className="text-xl font-bold">More 240-hour transit answers</h2>
          <ul className="mt-3 grid gap-2">
            {others.map((item) => <li key={item.slug}><a href={`/${item.slug}/`} className="font-semibold text-[#155e63] underline underline-offset-4">{item.question}</a></li>)}
            <li><a href="/china-240-hour-visa-free-transit-2026/" className="font-semibold text-[#155e63] underline underline-offset-4">Full guide: China 240-hour visa-free transit (57 countries, 65 ports)</a></li>
          </ul>
        </nav>

        <footer className="mt-10 border-t border-gray-300 pt-6 text-sm leading-6 text-gray-600">
          <h2 className="text-base font-bold text-gray-900">Official sources</h2>
          <ul className="mt-2 grid gap-2">
            {sources.map((source) => (
              <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#155e63] underline underline-offset-4">{source.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></li>
            ))}
          </ul>
          <p className="mt-4">Last updated: {lastUpdated}. Rules can change; Chinese border inspection makes the final decision on entry.</p>
        </footer>
      </article>
    </main>
  );
}
