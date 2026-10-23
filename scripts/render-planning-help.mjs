const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function renderPlanningHelp(content, placement = 'guide') {
  // This public contact must also work without JavaScript. Exempt only this box
  // from Cloudflare's HTML email rewriting; retain the zone's other settings.
  return `<!--email_off--><section id="lin-help" aria-labelledby="lin-help-heading" data-planning-help-box style="margin: 24px 0; padding: 24px; border: 1px solid rgba(21,94,99,.2); border-radius: 20px; background: rgba(21,94,99,.05);">
    ${content.imagePath ? `<img src="${escape(content.imagePath)}" alt="Lin, ChinaEase Buddy trip-planning contact" width="88" height="88" loading="lazy" style="border-radius:12px;object-fit:cover;" />` : ''}
    <h2 id="lin-help-heading" style="margin: 0 0 12px; font-size: 1.4rem;">${escape(content.heading)}</h2>
    <p style="line-height:1.7;color:#374151;">${escape(content.body)}</p>
    <p style="font-weight:600;line-height:1.7;color:#155e63;">${escape(content.paidScope)}</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:20px;">
      <a href="${escape(content.emailHref)}" data-planning-help="email" data-planning-placement="${escape(placement)}" style="display:inline-flex;align-items:center;min-height:44px;box-sizing:border-box;padding:12px 20px;border-radius:12px;background:#155e63;color:white;font-weight:700;text-decoration:none;">${escape(content.emailLabel)}</a>
      <a href="${escape(content.paidHref)}" target="_blank" rel="noopener noreferrer" data-planning-help="fiverr" data-planning-placement="${escape(placement)}" style="display:inline-flex;align-items:center;min-height:44px;box-sizing:border-box;padding:12px 20px;border:1px solid rgba(21,94,99,.25);border-radius:12px;color:#155e63;font-weight:700;text-decoration:none;">${escape(content.paidLabel)}</a>
    </div>
    <p style="overflow-wrap:anywhere;user-select:all;font-weight:700;color:#155e63;">${escape(content.email)}</p>
    <p style="font-size:.8rem;line-height:1.6;color:#6b7280;">${escape(content.note)}</p>
  </section><!--/email_off-->`;
}
