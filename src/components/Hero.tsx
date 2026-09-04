import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneDemo from './home/PhoneDemo';

const TRUST_KEYS = ['trust1', 'trust2', 'trust3'] as const;

interface Props {
  onOpenToolkit: () => void;
  onAskBuddy: () => void;
  onOpenLead: () => void;
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* Ask Buddy — primary visual weight: jade solid with AI icon */}
            <button
              onClick={onAskBuddy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-jade px-6 py-3.5 text-base font-semibold text-white transition-[background-color,transform] duration-hover ease-out hover:-translate-y-0.5 hover:bg-jade-dark active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              {t('home.hero.ctaSecondary')}
            </button>
            {/* Open Toolkit — secondary */}
            <button
              onClick={onOpenToolkit}
              className="rounded-lg border border-jade/40 bg-jade/8 px-6 py-3.5 text-base font-semibold text-jade transition-colors duration-hover ease-out hover:bg-jade hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
            >
              {t('home.hero.ctaPrimary')}
            </button>
          </div>

          <button
            onClick={onOpenLead}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-jade transition-colors duration-hover ease-out hover:text-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
          >
            Get a free personalised China trip plan
            <ArrowRight className="h-4 w-4 transition-transform duration-hover ease-out motion-safe:group-hover:translate-x-0.5" strokeWidth={1.5} />
          </button>

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
