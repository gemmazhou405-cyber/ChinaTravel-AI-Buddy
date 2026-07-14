import { Check } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import { trackEvent } from '../../lib/analytics';
import { PLANS } from '../PricingPlans';
import { useRevealOnView } from '../../hooks/useRevealOnView';

const GUMROAD_LINKS = {
  trip: 'https://gemmazhou.gumroad.com/l/oentc',
  group: 'https://gemmazhou.gumroad.com/l/mbgkxz',
} as const;

type PaidPlan = 'trip' | 'group';

interface Props {
  user: User | null;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onNeedAuth: () => void;
  onOpenToolkit: () => void;
}

export default function HomePasses({ user, userState, showToast, onNeedAuth, onOpenToolkit }: Props) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const hasActivePaidPass = Boolean(
    userState
      && (userState.plan === 'trip' || userState.plan === 'group')
      && (!userState.planExpiresAt || userState.planExpiresAt > Date.now()),
  );

  const handleCta = (plan: string) => {
    if (loadingPlan) return;
    const isPaid = plan === 'trip' || plan === 'group';
    void trackEvent('cta_clicked', {
      ctaName: plan === 'trip' ? 'Get Trip Pass' : plan === 'group' ? 'Get Group Pass' : 'Start Free',
      destination: isPaid ? 'Gumroad Checkout' : 'free-toolkit',
      tool: 'pay',
      plan: plan === 'trip' ? 'trip_pass' : plan === 'group' ? 'group_pass' : 'free',
    }, userState?.uid);

    if (!isPaid) {
      setLoadingPlan(plan);
      window.setTimeout(() => setLoadingPlan(null), 500);
      onOpenToolkit();
      return;
    }
    if (!user) {
      showToast(t('pay.claim.signInFirst'));
      onNeedAuth();
      return;
    }
    if (hasActivePaidPass) {
      showToast(t('pay.checkout.activePass'));
      return;
    }
    setLoadingPlan(plan);
    window.open(GUMROAD_LINKS[plan as PaidPlan], '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setLoadingPlan(null), 900);
  };

  return (
    <section ref={ref} id="travel-passes" className={`scroll-mt-20 bg-canvas py-20 md:py-32 ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="motion-reveal-item max-w-[26rem] font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-ink md:max-w-[34rem] md:text-[44px]">
          {t('home.passes.header')}
        </h2>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {PLANS.map(({ key, price, periodKey, highlighted }, planIndex) => {
            const isFree = key === 'free';
            const paidDisabled = !isFree && hasActivePaidPass;
            const isLoading = loadingPlan === key;
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
                  disabled={paidDisabled || isLoading}
                  className={`mt-8 w-full rounded-lg px-6 py-3.5 text-base font-semibold transition-[background-color,border-color,transform,opacity] duration-hover ease-out active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                    highlighted
                      ? 'bg-jade text-white hover:-translate-y-0.5 hover:bg-[#0B4145]'
                      : 'border border-hairline bg-surface text-ink hover:-translate-y-0.5 hover:border-ink-tertiary'
                  }`}
                >
                  {isLoading ? t('pay.checkout.opening') : paidDisabled ? t('pay.checkout.activeButton') : t(`pay.plans.${key}.cta`)}
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
