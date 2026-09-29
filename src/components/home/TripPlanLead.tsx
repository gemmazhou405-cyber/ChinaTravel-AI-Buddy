import { Map } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { markFunnelOnce, trackEvent, trackEventOnce } from '../../lib/analytics';
import TripPlanForm from './TripPlanForm';

function SamplePreview() {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-soft md:mt-7">
      <div className="relative h-36 overflow-hidden md:h-44">
        <img
          src="/images/great-wall-1600.webp"
          alt="The Great Wall of China winding over forested mountains"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,65,69,0.92)_0%,rgba(11,65,69,0.55)_20%,rgba(11,65,69,0.15)_40%,transparent_62%)]" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Sample route</p>
          <p className="mt-1 text-xl font-bold leading-tight">7 days: Beijing → Xi’an → Chengdu</p>
        </div>
      </div>
      <div className="grid gap-3 p-4 text-sm md:grid-cols-3">
        {[
          ['Day 1 · Beijing', 'Easy check-in, first dinner, Alipay setup'],
          ['Day 2 · Beijing', 'Forbidden City, hutong walk, local food'],
          ['Full itinerary', 'Daily route, transport notes, app checklist'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl bg-jade-wash/70 p-3">
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripPlanLead({ standalone = false }: { standalone?: boolean } = {}) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();

  useEffect(() => {
    if (markFunnelOnce('lead_homepage_shown')) {
      trackEventOnce('lead-homepage-shown', 'lead_cta_shown', { trigger: 'homepage_trip_plan' });
    }
  }, []);

  const handleIntroCta = () => {
    void trackEvent('lead_form_opened', { trigger: standalone ? 'plan_hero' : 'homepage_hero' });
    document.getElementById('trip-plan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('trip-plan-city-beijing')?.focus(), 450);
  };

  const IntroHeading = 'h1';

  return (
    <section
      ref={ref}
      id="trip-plan"
      className={`relative overflow-hidden bg-[#F4F8F6] ${standalone ? 'py-5 md:py-8' : 'scroll-mt-16 py-9 md:scroll-mt-20 md:py-14'} ${revealed ? 'motion-reveal-on' : ''}`}
    >
      <div className={`absolute inset-x-0 top-0 bg-gradient-to-b from-jade-wash to-transparent ${standalone ? 'h-32' : 'h-56'}`} />
      <div className={`relative mx-auto grid gap-6 px-4 md:gap-10 md:px-8 ${standalone ? 'max-w-2xl' : 'max-w-container md:grid-cols-[0.92fr_1.08fr]'}`}>
        <div className="motion-reveal-item">
          <div className="inline-flex items-center gap-2 rounded-full bg-jade-wash px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-jade">{t('home.tripPlan.kicker')}</span>
          </div>

          <IntroHeading
            className="mt-6 max-w-[22rem] font-display text-[30px] text-ink [text-wrap:balance] sm:max-w-[34rem] sm:text-[40px] md:mt-4 md:text-[54px]"
            style={{
              fontWeight: 540,
              fontVariationSettings: "'wght' 540, 'SOFT' 0, 'WONK' 0, 'opsz' 144",
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
            }}
          >
            {standalone ? 'Your first China trip, planned for you.' : 'The AI Travel Assistant That Actually Works in China'}
          </IntroHeading>

          <p className="mt-4 text-base font-medium text-ink-secondary md:hidden">
            Free personalised itinerary in 30 seconds.
          </p>
          <p className="mt-4 hidden max-w-[33rem] text-lg font-medium leading-relaxed text-ink-secondary md:block md:text-xl">
            Get a free personalised route preview before you travel. We help with cities, transport, payments, food and the small details that make China easier.
          </p>

          <button
            type="button"
            onClick={handleIntroCta}
            className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-jade px-6 py-4 text-base font-extrabold text-white shadow-soft transition-colors hover:bg-jade-dark md:hidden"
          >
            <Map className="h-4 w-4" strokeWidth={1.9} />
            Get my free itinerary
          </button>

          <p className="mt-4 text-xs text-ink-tertiary md:hidden">No payment · No spam</p>
          <div className="mt-5 hidden flex-wrap gap-2 text-xs font-semibold text-jade md:flex">
            <span className="rounded-full bg-jade-wash px-3 py-2">No payment</span>
            <span className="rounded-full bg-jade-wash px-3 py-2">No spam</span>
          </div>

          <SamplePreview />
        </div>

        <div
          className="motion-reveal-item flex items-start justify-center"
          style={standalone ? undefined : ({ '--reveal-index': 2 } as CSSProperties)}
        >
          <TripPlanForm embedded />
        </div>
      </div>
    </section>
  );
}
