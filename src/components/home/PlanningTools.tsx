import { BadgeCheck, Clock3, Hotel, WalletCards } from 'lucide-react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../lib/analytics';
import { useRevealOnView } from '../../hooks/useRevealOnView';

type Resource = {
  slug: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  featured?: boolean;
};

const RESOURCES: Resource[] = [
  {
    slug: 'china-visa-free-checker',
    href: '/china-visa-free-checker/',
    icon: BadgeCheck,
    featured: true,
  },
  {
    slug: 'china-240-hour-visa-free-transit-2026',
    href: '/china-240-hour-visa-free-transit-2026/',
    icon: Clock3,
  },
  {
    slug: 'nia-12367-online-accommodation-registration-guide',
    href: '/nia-12367-online-accommodation-registration-guide/',
    icon: Hotel,
  },
  {
    slug: 'tenpaygo-for-tourists',
    href: '/tenpaygo-for-tourists/',
    icon: WalletCards,
  },
];

export default function PlanningTools() {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();

  const trackResource = (resourceSlug: string) => {
    void trackEvent('homepage_resource_click', {
      resourceSlug,
      placement: 'planning_tools_section',
    });
  };

  return (
    <section
      ref={ref}
      aria-labelledby="planning-tools-title"
      className={`bg-canvas py-16 md:py-20 ${revealed ? 'motion-reveal-on' : ''}`}
    >
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="motion-reveal-item max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-jade">
            {t('home.planningTools.kicker')}
          </p>
          <h2
            id="planning-tools-title"
            className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl"
          >
            {t('home.planningTools.title')}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
            {t('home.planningTools.subtitle')}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {RESOURCES.map(({ slug, href, icon: Icon, featured }, index) => (
            <a
              key={slug}
              href={href}
              onClick={() => trackResource(slug)}
              className={`motion-reveal-item group flex min-h-[230px] flex-col rounded-2xl border p-6 shadow-soft transition-[border-color,background-color,box-shadow,transform] duration-hover ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade active:translate-y-0 ${
                featured
                  ? 'border-jade/25 bg-jade-wash/70 hover:border-jade/45 hover:bg-jade-wash'
                  : 'border-hairline bg-white hover:border-jade/30'
              }`}
              style={{ '--reveal-index': index + 1 } as CSSProperties}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${featured ? 'bg-jade text-white' : 'bg-jade-wash text-jade'}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="rounded-full border border-jade/15 bg-white/75 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-jade">
                  {t(`home.planningTools.cards.${slug}.label`)}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">
                {t(`home.planningTools.cards.${slug}.title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary sm:text-base">
                {t(`home.planningTools.cards.${slug}.description`)}
              </p>
              <span className="mt-6 inline-flex items-center text-sm font-bold text-jade">
                {t(`home.planningTools.cards.${slug}.cta`)}
              </span>
            </a>
          ))}
        </div>

        <div className="motion-reveal-item mt-8 text-center" style={{ '--reveal-index': 5 } as CSSProperties}>
          <a
            href="/guides/"
            onClick={() => trackResource('guides')}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-jade underline decoration-jade/25 underline-offset-4 transition hover:decoration-jade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade"
          >
            {t('home.planningTools.browseAll')}
          </a>
        </div>
      </div>
    </section>
  );
}
