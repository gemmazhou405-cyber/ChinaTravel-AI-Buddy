import { parseInline, shotMaxWidth, splitShots } from '../src/lib/amapGuideMarkup.mjs';

const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const linkStyle = 'color:#155e63;font-weight:600;text-underline-offset:4px;';
const textStyle = 'margin:0 0 12px;color:#536365;line-height:1.7;';

export function renderAmapInline(text) {
  return parseInline(text).map((token) => {
    if (token.type === 'strong') return `<strong style="color:#122022;">${escape(token.text)}</strong>`;
    if (token.type === 'em') return `<em>${escape(token.text)}</em>`;
    if (token.type === 'link') {
      const external = token.href.startsWith('http');
      return `<a href="${escape(token.href)}"${external ? ' rel="noopener noreferrer"' : ''} style="${linkStyle}">${escape(token.text)}</a>`;
    }
    return escape(token.text);
  }).join('');
}

export function createAmapGuideRenderer(content) {
  let renderedShots = 0;

  const figure = (id, maxWidth, label) => {
    const shot = content.screenshots[id];
    if (!shot) throw new Error(`Amap guide: missing screenshot ${id}`);
    const lazy = renderedShots > 0 || content.lazyAllShots ? ' loading="lazy"' : '';
    renderedShots += 1;
    return `<figure style="margin:0;flex:1 1 ${Math.min(maxWidth, 160)}px;max-width:${maxWidth}px;">
      <img src="${escape(shot.src)}" width="${shot.width}" height="${shot.height}" alt="${escape(shot.alt)}"${lazy} decoding="async" style="display:block;width:100%;height:auto;border:1px solid rgba(21,94,99,0.14);border-radius:18px;">
      ${label || content.screenshotCaption ? `<figcaption style="margin:6px 0 0;color:#6b7678;font-size:0.8rem;line-height:1.5;">${label ? `<strong style="display:block;color:#122022;font-size:0.9rem;">${escape(label)}</strong>` : ''}${escape(content.screenshotCaption || '')}</figcaption>` : ''}
    </figure>`;
  };

  // Rows wrap on narrow screens and stay centred.
  const shotRow = (ids, labels = []) => `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin:12px 0 16px;">${ids.map((id, index) => figure(id, shotMaxWidth(ids.length, content.pairShotMaxWidth), labels[index])).join('')}</div>`;

  const flow = (text, paragraphStyle = textStyle) => splitShots(text).map((segment) => segment.type === 'shots'
    ? shotRow(segment.ids)
    : `<p style="${paragraphStyle}">${renderAmapInline(segment.text.trim())}</p>`).join('');

  const block = (item) => {
    if (item.type === 'p') return flow(item.text);
    if (item.type === 'shots') return shotRow(item.ids, item.labels);
    if (item.type === 'note') return `<aside aria-label="Local note" style="margin:0 0 16px;padding:14px 16px;border:1px solid rgba(180,120,20,0.28);border-left:4px solid #b7791f;border-radius:14px;background:#fff7e6;color:#4a3b1f;line-height:1.7;"><p style="margin:0;"><strong style="letter-spacing:0.04em;">LOCAL NOTE:</strong> ${renderAmapInline(item.text)}</p></aside>`;
    if (item.type === 'table') return `<div style="margin:0 0 16px;overflow-x:auto;">
      <table style="width:100%;min-width:520px;border-collapse:collapse;color:#536365;">
        <thead><tr>${item.headers.map((header) => `<th scope="col" style="border-bottom:2px solid rgba(21,94,99,0.18);padding:10px;text-align:left;color:#122022;">${escape(header)}</th>`).join('')}</tr></thead>
        <tbody>${item.rows.map((row) => `<tr>${row.map((cell, index) => `<td style="border-bottom:1px solid rgba(21,94,99,0.12);padding:10px;vertical-align:top;${index === 0 ? 'color:#122022;font-weight:600;' : ''}">${renderAmapInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
    const tag = item.type === 'ol' ? 'ol' : 'ul';
    return `<${tag} style="margin:0 0 16px;padding-left:22px;color:#536365;line-height:1.7;">${item.items.map((entry) => `<li style="margin:0 0 10px;">${flow(entry, 'margin:0;color:#536365;line-height:1.7;')}</li>`).join('')}</${tag}>`;
  };

  return {
    byline: (linkHref) => `<p style="margin:0 0 20px;color:#536365;font-size:0.95rem;"><a href="${escape(linkHref)}" style="color:#155e63;font-weight:600;">${escape(content.byline.name)}</a> · ${escape(content.byline.tested)}</p>`,
    quickAnswer: () => content.quickAnswer.map((entry, index) => typeof entry === 'string'
      ? `<p style="margin:${index === content.quickAnswer.length - 1 ? '0' : '0 0 12px'};color:#536365;line-height:1.7;">${renderAmapInline(entry)}</p>`
      : block(entry)).join(''),
    cta: () => !content.cta ? '' : `<aside aria-label="App setup help" style="margin:0 0 24px;padding:20px 22px;border:1px solid rgba(21,94,99,0.22);border-radius:22px;background:rgba(21,94,99,0.06);">
      <p style="margin:0 0 14px;color:#122022;line-height:1.7;">${renderAmapInline(content.cta.text)}</p>
      <a href="${escape(content.cta.href)}" target="_blank" rel="noopener noreferrer" data-planning-help="fiverr" data-planning-placement="${escape(content.cta.placement || 'amap-setup')}" style="display:inline-flex;min-height:44px;align-items:center;border-radius:999px;background:#155e63;color:#fffdf8;padding:10px 18px;font-weight:700;text-decoration:none;">${escape(content.cta.label)}</a>
    </aside>`,
    // Optional lead blocks (such as a comparison table) come before the first section.
    body: () => (content.lead ? `<div style="margin:0 0 24px;">${content.lead.map(block).join('')}</div>` : '') + content.sections.map((section) => `
      <section aria-labelledby="${escape(section.id)}" style="margin:0 0 24px;padding:20px;border:1px solid rgba(21,94,99,0.12);border-radius:20px;background:rgba(255,253,248,0.72);">
        <h2 id="${escape(section.id)}" style="margin:0 0 12px;font-size:1.25rem;">${escape(section.title)}</h2>
        ${section.blocks.map(block).join('')}
        ${(section.subsections || []).map((sub) => `
          <h3 id="${escape(sub.id)}" style="margin:20px 0 10px;font-size:1.05rem;">${escape(sub.title)}</h3>
          ${sub.blocks.map(block).join('')}
        `).join('')}
      </section>`).join(''),
  };
}
