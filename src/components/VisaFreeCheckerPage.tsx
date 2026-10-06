import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import visaCheckerContent from '../data/seoPages/china-visa-free-checker.json';
import { POLICY_LAST_VERIFIED_LABEL } from '../data/chinaVisaPolicies';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import type { VisaCheckerResult } from '../lib/visaChecker';
import VisaFreeCheckerTool from './VisaFreeCheckerTool';

const siteUrl = 'https://chinaeasebuddy.com';
const path = '/china-visa-free-checker/';
const title = visaCheckerContent.title;
const description = visaCheckerContent.description;

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
  const [result, setResult] = useState<VisaCheckerResult | null>(null);

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

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f7f3ea] px-4 py-8 text-[#122022] md:px-6">
      <div className="mx-auto w-full min-w-0 max-w-5xl">
        <a href="/guides/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63]"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to guides</a>
        <article className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-[#155e63]/10 bg-white/90 p-5 shadow-sm md:p-8">
          <p className="break-words text-xs font-bold uppercase tracking-[0.14em] text-[#155e63]">Free planning tool · policy check {POLICY_LAST_VERIFIED_LABEL}</p>
          <h1 className="mt-3 max-w-3xl break-words text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">China Visa-Free Checker</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">Check which China visa-free policy may apply to your passport, travel date and itinerary.</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">This is a policy screening tool, not a government visa decision. It does not guarantee admission, and final entry decisions are made by Chinese border inspection authorities.</p>

          <div className="mt-8"><VisaFreeCheckerTool id="visa-checker-form" onResultChange={setResult} /></div>

          <div className="mt-10 space-y-5">{visaCheckerContent.contentSections.map((section, index) => <section key={section.title} aria-labelledby={`visa-section-${index}`} className="rounded-2xl border border-[#155e63]/10 bg-[#fffdf8] p-5"><h2 id={`visa-section-${index}`} className="text-xl font-bold">{section.title}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600">{section.items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>

          <section aria-labelledby="visa-faq" className="mt-10"><h2 id="visa-faq" className="text-2xl font-bold">Frequently asked questions</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{visaCheckerContent.faqs.map(([question, answer]) => <article key={question} className="rounded-2xl border border-gray-200 bg-white p-5"><h3 className="font-bold">{question}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{answer}</p></article>)}</div></section>

          <nav aria-label="Related China entry guides" className="mt-10"><h2 className="text-xl font-bold">Related entry guides</h2><div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-[#155e63]"><a href="/china-240-hour-visa-free-transit-2026/">240-hour transit guide</a><a href="/china-visa-free-travel-guide/">Visa-free travel guide</a><a href="/china-airport-arrival-guide/">Airport arrival guide</a><a href="/nia-12367-online-accommodation-registration-guide/">12367 accommodation registration guide</a><a href="/first-trip-to-china/">First trip to China</a></div></nav>

          <section aria-labelledby="visa-sources" className="mt-10 border-t border-gray-200 pt-6"><h2 id="visa-sources" className="text-xl font-bold">Official sources</h2><ul className="mt-3 space-y-2 text-sm leading-6">{visaCheckerContent.sourceLinks.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" onClick={() => void trackEvent('visa_checker_official_source_click', { resultCategory: result?.category ?? 'cannot_determine', policyType: result?.policyType ?? 'none', completed: Boolean(result) })} className="font-semibold text-[#155e63]">{label} <ExternalLink aria-hidden="true" className="inline h-3.5 w-3.5" /></a></li>)}</ul></section>
        </article>
      </div>
    </main>
  );
}
