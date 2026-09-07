import { ArrowRight, Check, Map, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneDemo from './home/PhoneDemo';

const TRUST_KEYS = ['trust1', 'trust2', 'trust3'] as const;

interface Props {
  onOpenToolkit: () => void;
  onAskBuddy: () => void;
  onOpenTripPlan: () => void;
}

export default function Hero({ onOpenToolkit, onAskBuddy, onOpenTripPlan }: Props) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="relative mx-auto grid max-w-container items-center px-5 pb-7 pt-7 md:grid-cols-2 md:gap-10 md:px-8 md:pb-20 md:pt-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {t('home.hero.badge')}
          </span>

          <h1 className="mt-5 font-display text-[36px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[42px] md:mt-6 md:text-[58px]">
            <span className="block">{t('home.hero.title1')}</span>
            <span className="block text-jade">{t('home.hero.title2')}</span>
          </h1>

          <p className="mt-4 max-w-xl text-lg font-normal leading-relaxed text-ink-secondary md:mt-6 md:text-xl">{t('home.hero.subtitle')}</p>

          <button
            type="button"
            onClick={onOpenTripPlan}
            className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-xl bg-jade px-5 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(15,82,87,0.22)] transition-[background-color,transform,box-shadow] duration-hover ease-out hover:-translate-y-0.5 hover:bg-jade-dark hover:shadow-[0_16px_36px_rgba(15,82,87,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-jade sm:w-auto md:mt-7 md:px-6 md:text-lg"
          >
            <Map className="h-5 w-5" strokeWidth={1.7} />
            {t('home.hero.ctaTripPlan')}
            <ArrowRight className="h-5 w-5" strokeWidth={1.7} />
          </button>
          <p className="mt-3 text-center text-sm font-medium leading-relaxed text-ink-secondary sm:text-left">Instant preview · Detailed plan by email · Free</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              onClick={onAskBuddy}
              className="inline-flex items-center gap-2 text-sm font-semibold text-jade transition-colors hover:text-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-jade"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              {t('home.hero.ctaSecondary')}
            </button>
            <button
              onClick={onOpenToolkit}
              className="text-sm font-semibold text-jade transition-colors hover:text-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-jade"
            >
              {t('home.hero.ctaPrimary')}
            </button>
          </div>

          <div className="glass mt-10 hidden grid-cols-1 gap-x-6 gap-y-2.5 rounded-xl px-5 py-4 sm:grid-cols-2 md:grid">
            {TRUST_KEYS.map((key) => (
              <span key={key} className="flex items-center gap-2 text-sm font-medium text-ink">
                <Check className="h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                {t(`home.hero.${key}`)}
              </span>
            ))}
          </div>

        </div>

        <div className="hidden md:block"><PhoneDemo /></div>
      </div>
    </section>
  );
}
