import { ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneDemo from './home/PhoneDemo';

const TRUST_KEYS = ['trust1', 'trust2', 'trust3', 'trust4'] as const;

interface Props {
  onOpenToolkit: () => void;
  onAskBuddy: () => void;
}

export default function Hero({ onOpenToolkit, onAskBuddy }: Props) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="relative mx-auto grid max-w-container items-center gap-12 px-6 pb-16 pt-12 md:grid-cols-2 md:gap-10 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {t('home.hero.badge')}
          </span>

          <h1 className="mt-6 font-display text-[40px] font-normal leading-[1.05] tracking-[-0.02em] text-ink md:text-[64px]">
            <span className="block">{t('home.hero.title1')}</span>
            <span className="block italic text-jade">{t('home.hero.title2')}</span>
          </h1>

          <p className="mt-6 text-xl font-medium text-ink md:text-2xl">{t('home.hero.subtitle')}</p>
          <p className="mt-3 max-w-[30rem] text-base leading-relaxed text-ink-secondary md:text-lg">
            {t('home.hero.supporting')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onOpenToolkit}
              className="rounded-lg bg-jade px-6 py-3.5 text-base font-semibold text-white transition-colors duration-hover ease-out hover:bg-[#0B4145]"
            >
              {t('home.hero.ctaPrimary')}
            </button>
            <button
              onClick={onAskBuddy}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors duration-hover ease-out hover:border-ink-tertiary"
            >
              {t('home.hero.ctaSecondary')}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="glass mt-10 grid grid-cols-1 gap-x-6 gap-y-2.5 rounded-xl px-5 py-4 sm:grid-cols-2">
            {TRUST_KEYS.map((key) => (
              <span key={key} className="flex items-center gap-2 text-sm font-medium text-ink">
                <Check className="h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                {t(`home.hero.${key}`)}
              </span>
            ))}
          </div>
        </div>

        <PhoneDemo />
      </div>
    </section>
  );
}
