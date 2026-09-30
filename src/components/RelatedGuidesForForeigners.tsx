import { ArrowRight } from 'lucide-react';

const relatedGuides = [
  { label: 'China payment guide', href: '/china-payment-guide/' },
  { label: 'China SIM card for foreigners', href: '/china-sim-card-for-foreigners/' },
  { label: 'China travel checklist', href: '/china-travel-checklist/' },
  { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
];

export function RelatedGuidesForForeigners() {
  return (
    <nav
      aria-label="Related guides for foreign visitors"
      className="rounded-2xl border border-[#155e63]/15 bg-[#155e63]/5 p-4 shadow-sm md:p-5"
    >
      <h2 className="text-lg font-bold text-gray-950">Related guides for foreign visitors</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {relatedGuides.map((guide) => (
          <a
            key={guide.href}
            href={guide.href}
            className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[#155e63]/10 bg-white px-3 py-2.5 text-sm font-semibold text-[#155e63] transition hover:border-[#155e63]/25 hover:bg-[#fffdf8]"
          >
            <span>{guide.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </nav>
  );
}
