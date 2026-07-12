import { Check } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import { trackEvent } from '../../lib/analytics';
import { PLANS } from '../PricingPlans';

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

  const hasActivePaidPass = Boolean(
    userState
      && (userState.plan === 'trip' || userState.plan === 'group')
      && (!userState.planExpiresAt || userState.planExpiresAt > Date.now()),
  );

  const handleCta = (plan: string) => {
    const isPaid = plan === 'trip' || plan === 'group';
    void trackEvent('cta_clicked', {
      ctaName: plan === 'trip' ? 'Get Trip Pass' : plan === 'group' ? 'Get Group Pass' : 'Start Free',
      destination: isPaid ? 'Gumroad Checkout' : 'free-toolkit',
      tool: 'pay',
      plan: plan === 'trip' ? 'trip_pass' : plan === 'group' ? 'group_pass' : 'free',
    }, userState?.uid);

    if (!isPaid) {
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
    window.open(GUMROAD_LINKS[plan as PaidPlan], '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="travel-passes" className="scroll-mt-20 bg-canvas py-20 md:py-32">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="max-w-[26rem] font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-ink md:max-w-[34rem] md:text-[44px]">
          {t('home.passes.header')}
        </h2>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {PLANS.map(({ key, price, periodKey, highlighted }) => {
            const isFree = key === 'free';
            const paidDisabled = !isFree && hasActivePaidPass;
            return (
              <div
                key={key}
                className={
                  isFree
                    ? 'rounded-2xl border border-hairline p-6 md:p-8'
                    : `rounded-2xl bg-surface p-6 shadow-card md:p-8 ${highlighted ? 'border border-jade' : 'border border-hairline'}`
                }
              >
                <h3 className="text-xl font-semibold text-ink">{t(`pay.plans.${key}.name`)}</h3>
                <p className="mt-1 text-sm leading-snug text-ink-tertiary">{t(`pay.plans.${key}.desc`)}</p>
                <p className="mt-4">
                  <span className="text-[32px] font-semibold tracking-tight text-ink">{price}</span>
                  {periodKey && <span className="ml-2 text-sm text-ink-tertiary">{t(periodKey)}</span>}
                </p>
                <ul className="mt-6 space-y-3">
                  {(t(`pay.plans.${key}.features`, { returnObjects: true }) as string[]).map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-snug text-ink-secondary md:text-base">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCta(key)}
                  disabled={paidDisabled}
                  className={`mt-8 w-full rounded-lg px-6 py-3.5 text-base font-semibold transition-colors duration-hover ease-out disabled:cursor-not-allowed disabled:opacity-50 ${
                    highlighted
                      ? 'bg-jade text-white hover:bg-[#0B4145]'
                      : 'border border-hairline bg-surface text-ink hover:border-ink-tertiary'
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
