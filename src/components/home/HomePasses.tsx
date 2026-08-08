import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { PassState } from '../../hooks/usePass';
import { trackEvent, trackGumroadClick } from '../../lib/analytics';
import { PLANS } from '../PricingPlans';
import { useRevealOnView } from '../../hooks/useRevealOnView';

const GUMROAD_TRIP_URL = import.meta.env.VITE_GUMROAD_TRIP_URL || 'https://chinaease.gumroad.com/l/trip-pass';
const GUMROAD_GROUP_URL = import.meta.env.VITE_GUMROAD_GROUP_URL || 'https://chinaease.gumroad.com/l/group-pass';

function gumroadUrl(plan: string) {
  if (plan === 'trip') return GUMROAD_TRIP_URL;
  if (plan === 'group') return GUMROAD_GROUP_URL;
  return '#';
}

interface Props {
  passState: PassState | null;
  showToast: (msg: string) => void;
  onOpenToolkit: () => void;
}

export default function HomePasses({ passState, showToast, onOpenToolkit }: Props) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();

  const hasActivePaidPass = Boolean(
    passState && passState.tier !== 'free' && !passState.expired,
  );

  const handleCta = (plan: string) => {
    const isPaid = plan === 'trip' || plan === 'group';

    void trackEvent('cta_clicked', {
      ctaName: plan === 'trip' ? 'Get Trip Pass' : plan === 'group' ? 'Get Group Pass' : 'Start Free',
      destination: isPaid ? 'Gumroad' : 'free-toolkit',
      tool: 'pay',
      plan: plan === 'trip' ? 'trip_pass' : plan === 'group' ? 'group_pass' : 'free',
    });

    if (!isPaid) {
      onOpenToolkit();
      return;
    }

    if (hasActivePaidPass) {
      showToast(t('pay.checkout.activePass'));
      return;
    }

    trackGumroadClick(plan as 'trip' | 'group');
    window.open(gumroadUrl(plan), '_blank', 'noopener,noreferrer');
  };

  return (
    <section ref={ref} id="travel-passes" className={`scroll-mt-20 bg-canvas py-16 md:py-24 ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="motion-reveal-item max-w-[26rem] font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-ink md:max-w-[34rem] md:text-[44px]">
          {t('home.passes.header')}
        </h2>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {PLANS.map(({ key, price, periodKey, highlighted }, planIndex) => {
            const isFree = key === 'free';
            const paidDisabled = !isFree && hasActivePaidPass;
            return (
              <div
                key={key}
                className={`motion-reveal-item motion-safe-hover-lift ${
                  isFree
                    ? 'rounded-2xl border border-hairline bg-white/40 p-6 backdrop-blur-sm md:p-8'
                    : highlighted
                      ? 'glass rounded-2xl border-jade/40 p-6 !shadow-[var(--glass-highlight),var(--jade-glow)] md:p-8'
                      : 'glass rounded-2xl p-6 md:p-8'
                }`}
                style={{ '--reveal-index': planIndex + 1 } as CSSProperties}
              >
                <h3 className="text-xl font-semibold text-ink">{t(`pay.plans.${key}.name`)}</h3>
                <p className="mt-1 text-sm leading-snug text-ink-tertiary">{t(`pay.plans.${key}.desc`)}</p>
                <p className="mt-4">
                  <span className="text-[32px] font-semibold tracking-tight text-ink">{price}</span>
                  {periodKey && <span className="ml-2 text-sm text-ink-tertiary">{t(periodKey)}</span>}
                </p>
                <ul className="mt-6 space-y-3">
                  {(t(`pay.plans.${key}.features`, { returnObjects: true }) as string[]).map((feature, featureIndex) => (
                    <li
                      key={feature}
                      className="motion-reveal-item flex items-start gap-2.5 text-sm leading-snug text-ink-secondary md:text-base"
                      style={{ '--reveal-index': planIndex + featureIndex + 2 } as CSSProperties}
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCta(key)}
                  disabled={paidDisabled}
                  className={`mt-8 w-full rounded-lg px-6 py-3.5 text-base font-semibold transition-[background-color,border-color,transform,opacity] duration-hover ease-out active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                    highlighted
                      ? 'bg-jade text-white hover:-translate-y-0.5 hover:bg-jade-dark'
                      : 'border border-hairline bg-surface text-ink hover:-translate-y-0.5 hover:border-ink-tertiary'
                  }`}
                >
                  {paidDisabled ? t('pay.checkout.activeButton') : t(`pay.plans.${key}.cta`)}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-ink-tertiary">{t('home.passes.note')}</p>
      </div>
    </section>
  );
}
