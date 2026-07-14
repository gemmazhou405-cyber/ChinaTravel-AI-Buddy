import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../../App';
import { useRevealOnView } from '../../hooks/useRevealOnView';

type TagTarget = { tab: TabId; tool?: string };

// Each tag deep-links into the toolkit via the same openToolkit flow the
// header CTA and toolkit grid use — no separate navigation logic.
const SCENARIOS: Array<{ key: 's1' | 's2' | 's3'; image: string; tags: TagTarget[] }> = [
  {
    key: 's1',
    image: '/scenario-arrival-900.webp',
    tags: [
      { tab: 'before', tool: 'apps' },      // Essential apps
      { tab: 'before', tool: 'payment' },   // Alipay setup
      { tab: 'before', tool: 'apps' },      // eSIM & data (lives in the apps tool)
      { tab: 'before', tool: 'transport' }, // Airport transfer
    ],
  },
  {
    key: 's2',
    image: '/scenario-food-900.webp',
    tags: [
      { tab: 'food', tool: 'food' },  // Menu photo translation
      { tab: 'food', tool: 'food' },  // Allergen alerts (part of the menu tool)
      { tab: 'food', tool: 'food' },  // Dietary filters (part of the menu tool)
      { tab: 'stay', tool: 'stay' },  // Show it in Chinese (phrase cards)
    ],
  },
  {
    key: 's3',
    image: '/emergency-kit-scene.png',
    tags: [
      { tab: 'emergency', tool: 'numbers' },
      { tab: 'emergency', tool: 'hospital' },
      { tab: 'emergency', tool: 'police' },
      { tab: 'emergency', tool: 'lost' },
    ],
  },
];

const TAG_HINTS: Record<string, string> = {
  's1-0': 'Five apps to set up before arrival',
  's1-1': 'Foreign-card payment setup',
  's2-0': 'Dish, ingredients, spice, allergens',
  's3-1': 'Chinese phrases ready to show',
};

interface Props {
  onOpenTool: (tab: TabId, tool?: string) => void;
}

export default function Scenarios({ onOpenTool }: Props) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const handleTagClick = (tagKey: string, target: TagTarget) => {
    setActiveTag(tagKey);
    window.setTimeout(() => {
      onOpenTool(target.tab, target.tool);
      setActiveTag(null);
    }, 150);
  };

  return (
    <section ref={ref} id="features" className={`scroll-mt-20 bg-canvas py-20 md:py-32 ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className="mx-auto max-w-container space-y-6 px-6 md:space-y-8 md:px-8">
        {SCENARIOS.map(({ key, image, tags }, index) => (
          <div
            key={key}
            className="motion-reveal-item group/scenario grid overflow-hidden rounded-2xl shadow-card md:grid-cols-2"
            style={{ '--reveal-index': index } as CSSProperties}
          >
            <div
              className={`flex flex-col justify-center p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] md:p-12 ${index % 2 === 1 ? 'md:order-2' : ''}`}
              style={{ background: 'var(--surface-jade-deep)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                {t(`home.scenarios.${key}.kicker`)}
              </p>
              <h3 className="mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-white md:text-[40px]">
                {t(`home.scenarios.${key}.title`)}
              </h3>
              <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-white/75">
                {t(`home.scenarios.${key}.body`)}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((target, n) => {
                  const label = t(`home.scenarios.${key}.tag${n + 1}`);
                  const tagKey = `${key}-${n}`;
                  const hint = TAG_HINTS[tagKey];
                  const isActive = activeTag === tagKey;
                  return (
                    <span key={n} className="group/tag relative">
                      <button
                        onClick={() => handleTagClick(tagKey, target)}
                        aria-label={t('home.scenarios.tagAria', { name: label })}
                        className={`min-h-[40px] cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-[background-color,border-color,transform,box-shadow] duration-hover ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 active:bg-[#0B4145] active:text-white motion-safe:hover:-translate-y-0.5 md:min-h-[32px] ${
                          isActive
                            ? 'border-white/70 bg-white/24 text-white shadow-[0_0_0_3px_rgba(255,255,255,0.08)]'
                            : 'border-white/25 bg-white/10 text-white/90 hover:border-white/50 hover:bg-white/20'
                        }`}
                      >
                        {label}
                      </button>
                      {hint && (
                        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-48 -translate-x-1/2 rounded-xl border border-white/20 bg-white/14 px-3 py-2 text-center text-[11px] font-medium leading-snug text-white opacity-0 shadow-[0_14px_38px_rgba(0,0,0,0.2)] backdrop-blur-md transition-opacity duration-hover ease-out group-hover/tag:opacity-100 group-focus-within/tag:opacity-100 lg:block">
                          {hint}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              {key === 's1' && (
                <button
                  onClick={() => onOpenTool('before', 'checklist')}
                  className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white/90 transition-colors duration-hover ease-out hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90"
                >
                  {t('home.scenarios.s1.cta')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-hover ease-out motion-safe:group-hover:translate-x-0.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className={`relative min-h-[240px] md:min-h-[420px] ${index % 2 === 1 ? 'md:order-1' : ''}`}>
              <img
                src={image}
                alt={t(`home.scenarios.${key}.title`)}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
