import { useState } from 'react';
import content from '../data/amapEnglishSetup.json';
import { getAmapLanguageFix } from '../lib/amapLanguageHelp.mjs';
import { trackEvent } from '../lib/analytics';

export default function AmapLanguageHelp() {
  const [device, setDevice] = useState('');
  const [issue, setIssue] = useState('');
  const help = content.helper;
  const fix = getAmapLanguageFix(help, device, issue);
  return (
    <section id="amap-language-help" aria-labelledby="amap-help-heading" className="rounded-2xl border border-[#155e63]/20 bg-white p-4 md:p-5">
      <h2 id="amap-help-heading" className="text-xl font-bold text-gray-950">{help.heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{help.intro}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label htmlFor="amap-help-device" className="text-sm font-semibold text-gray-800">{help.deviceQuestion}
          <select id="amap-help-device" value={device} onChange={(event) => setDevice(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal">
            <option value="">Choose your phone</option>
            {help.devices.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label htmlFor="amap-help-issue" className="text-sm font-semibold text-gray-800">{help.issueQuestion}
          <select id="amap-help-issue" value={issue} onChange={(event) => setIssue(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal">
            <option value="">Choose what you see</option>
            {help.issues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div aria-live="polite" aria-atomic="true" className="mt-5 rounded-xl bg-[#155e63]/5 p-4">
        {fix ? <>
          <h3 className="font-bold text-gray-950">{fix.title}</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700">{fix.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <a href={fix.href} onClick={() => void trackEvent('guide_cta_click', { guidePage: 'amap-english-mode-guide-2026', destination: fix.href })} className="mt-3 inline-flex min-h-11 items-center font-bold text-[#155e63] underline underline-offset-4">{fix.label}</a>
        </> : <p className="text-sm text-gray-700">{help.emptyState}</p>}
      </div>
    </section>
  );
}
