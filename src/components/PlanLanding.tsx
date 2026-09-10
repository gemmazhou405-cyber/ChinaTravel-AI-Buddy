import TripPlanLead from './home/TripPlanLead';

// Standalone landing page for TikTok / Instagram bio-link traffic.
// Mobile-first: logo + one-line title + the free-itinerary form, nothing else.
// Reuses the homepage <TripPlanLead> form (in `standalone` mode) so the
// submission, itinerary generation and UTM passthrough logic stays in one place.
export default function PlanLanding() {
  const assetBase = import.meta.env.BASE_URL;

  return (
    <div className="flex min-h-screen flex-col bg-canvas pb-[env(safe-area-inset-bottom)] font-sans">
      <header className="border-b border-hairline bg-[#FFFDFA]">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 md:px-8">
          <a href="/" aria-label="ChinaEase Buddy home" className="flex items-center gap-2.5">
            <img src={`${assetBase}logo.png`} width="28" height="28" alt="" className="h-7 w-7 rounded-lg" />
            <span className="text-sm font-semibold tracking-tight text-ink">ChinaEase Buddy</span>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 pt-5 md:px-8 md:pt-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-jade">Free personalised China itinerary</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-[1.12] tracking-[-0.02em] text-ink sm:text-3xl">
            Tell us your dates and cities — get your free China itinerary.
          </h1>
        </div>
        <TripPlanLead standalone />
      </main>

      <footer className="border-t border-hairline bg-surface">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-xs text-ink-tertiary md:px-8">
          <a href="/privacy/" className="transition-colors hover:text-ink">Privacy</a>
          <a href="/terms/" className="transition-colors hover:text-ink">Terms</a>
          <a href="/refund/" className="transition-colors hover:text-ink">Refund</a>
          <a href="/contact/" className="transition-colors hover:text-ink">Contact</a>
        </div>
      </footer>
    </div>
  );
}
