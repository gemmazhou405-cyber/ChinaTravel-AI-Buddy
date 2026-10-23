import { useEffect } from 'react';
import planningHelp from '../data/planningHelp.json';
import { initAttribution } from '../lib/analytics';

export default function LinBox({ placement = 'guide', className = '' }: { placement?: string; className?: string }) {
  useEffect(() => { initAttribution(); }, []);
  const imagePath = (planningHelp as { imagePath?: string | null }).imagePath;

  return (
    <section id="lin-help" aria-labelledby="lin-help-heading" data-planning-help-box className={`rounded-2xl border border-[#155e63]/20 bg-[#155e63]/5 p-5 md:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        {imagePath && <img src={imagePath} alt="Lin, ChinaEase Buddy trip-planning contact" width="88" height="88" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0">
          <h2 id="lin-help-heading" className="text-xl font-bold text-gray-950">{planningHelp.heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-base">{planningHelp.body}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold leading-relaxed text-[#155e63]">{planningHelp.paidScope}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={planningHelp.emailHref} data-planning-help="email" data-planning-placement={placement} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#155e63] px-5 py-3 text-sm font-bold text-white hover:bg-[#0e4a4e]">{planningHelp.emailLabel}</a>
        <a href={planningHelp.paidHref} target="_blank" rel="noopener noreferrer" data-planning-help="fiverr" data-planning-placement={placement} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#155e63]/25 px-5 py-3 text-sm font-bold text-[#155e63] hover:bg-white">{planningHelp.paidLabel}</a>
      </div>
      <p className="mt-3 break-all text-sm font-semibold text-[#155e63] select-all">{planningHelp.email}</p>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">{planningHelp.note}</p>
    </section>
  );
}
