import { getAmapLanguageFix } from '../src/lib/amapLanguageHelp.mjs';
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function renderAmapLanguageHelp(content) {
  const help = content.helper;
  return `<section id="amap-language-help" aria-labelledby="amap-help-heading" style="margin:0 0 24px;padding:22px;border:1px solid rgba(21,94,99,.2);border-radius:20px;background:white;">
    <h2 id="amap-help-heading">${escape(help.heading)}</h2>
    <p>${escape(help.intro)}</p>
    <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th scope="col" style="padding:12px;text-align:left;">What you see</th><th scope="col" style="padding:12px;text-align:left;">Open the relevant checks</th></tr></thead><tbody>
      ${help.issues.map((issue) => `<tr><th scope="row" style="padding:12px;text-align:left;border-top:1px solid #e5e7eb;">${escape(issue.label)}</th><td style="padding:12px;line-height:1.8;border-top:1px solid #e5e7eb;">${(issue.platformSpecific ? help.devices : [help.devices[0]]).map((device) => {
    const fix = getAmapLanguageFix(help, device.id, issue.id);
    return `<a href="${escape(fix.href)}" style="display:inline-block;padding:8px;color:#155e63;font-weight:700;">${escape(issue.platformSpecific ? device.label : fix.label)}</a>`;
  }).join(' · ')}</td></tr>`).join('')}
    </tbody></table></div>
    <p style="font-size:.85rem;line-height:1.7;color:#6b7280;">${escape(content.evidenceNote)}</p>
  </section>`;
}
