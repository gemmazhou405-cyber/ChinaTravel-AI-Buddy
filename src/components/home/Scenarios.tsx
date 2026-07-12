import { useTranslation } from 'react-i18next';

const SCENARIOS = [
  { key: 's1', image: '/scenario-arrival-900.webp' },
  { key: 's2', image: '/scenario-food-900.webp' },
  { key: 's3', image: '/scenario-help-900.webp' },
] as const;

export default function Scenarios() {
  const { t } = useTranslation();

  return (
    <section id="features" className="scroll-mt-20 bg-canvas py-20 md:py-32">
      <div className="mx-auto max-w-container space-y-6 px-6 md:space-y-8 md:px-8">
        {SCENARIOS.map(({ key, image }, index) => (
          <div key={key} className="grid overflow-hidden rounded-2xl shadow-card md:grid-cols-2">
            <div className={`flex flex-col justify-center bg-jade p-8 md:p-12 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
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
                {([1, 2, 3, 4] as const).map((n) => (
                  <span key={n} className="rounded-full border border-white/25 px-3 py-1 text-xs font-medium text-white/85">
                    {t(`home.scenarios.${key}.tag${n}`)}
                  </span>
                ))}
              </div>
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
