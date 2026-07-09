import { Check } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import { trackEvent } from '../../lib/analytics';

const GUMROAD_LINKS = {
  trip: 'https://gemmazhou.gumroad.com/l/oentc',
  group: 'https://gemmazhou.gumroad.com/l/mbgkxz',
} as const;

const PASSES = [
  { key: 'trip', price: '$9.90', featured: true },
  { key: 'group', price: '$29.90', featured: false },
] as const;

type PaidPlan = 'trip' | 'group';

interface Props {
  user: User | null;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onNeedAuth: () => void;
}

export default function HomePasses({ user, userState, showToast, onNeedAuth }: Props) {
  const { t } = useTranslation();

  const hasActivePaidPass = Boolean(
    userState
      && (userState.plan === 'trip' || userState.plan === 'group')
      && (!userState.planExpiresAt || userState.planExpiresAt > Date.now()),
  );

  const handleCta = (plan: PaidPlan) => {
    void trackEvent('cta_clicked', {
      ctaName: plan === 'trip' ? 'Get Trip Pass' : 'Get Group Pass',
      destination: 'Gumroad Checkout',
      tool: 'pay',
      plan: plan === 'trip' ? 'trip_pass' : 'group_pass',
    }, userState?.uid);

    if (!user) {
      showToast(t('pay.claim.signInFirst'));
      onNeedAuth();
      return;
    }
    if (hasActivePaidPass) {
      showToast(t('pay.checkout.activePass'));
      return;
    }
    window.open(GUMROAD_LINKS[plan], '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="travel-passes" className="scroll-mt-16 bg-canvas py-20 md:py-32">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="max-w-[26rem] text-2xl font-semibold tracking-tight text-ink md:max-w-[34rem] md:text-[32px] md:leading-tight">
          {t('home.passes.header')}
        </h2>
        <div className="mx-auto mt-10 grid max-w-[52rem] gap-4 md:mt-14 md:grid-cols-2 md:gap-6">
          {PASSES.map(({ key, price, featured }) => (
            <div
              key={key}
              className={`rounded-2xl bg-surface p-6 shadow-card md:p-8 ${featured ? 'border border-jade' : 'border border-hairline'}`}
            >
              <h3 className="text-xl font-semibold text-ink">{t(`pay.plans.${key}.name`)}</h3>
              <p className="mt-3">
                <span className="text-[32px] font-semibold tracking-tight text-ink">{price}</span>
                <span className="ml-2 text-sm text-ink-tertiary">{t('pay.oneTime')}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {([1, 2, 3] as const).map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-base leading-snug text-ink-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                    {t(`home.passes.${key}.line${line}`)}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCta(key)}
                disabled={hasActivePaidPass}
                className={`mt-8 w-full rounded-lg px-6 py-3.5 text-base font-semibold transition-colors duration-hover ease-out disabled:cursor-not-allowed disabled:opacity-50 ${
                  featured
                    ? 'bg-jade text-white hover:bg-[#0B4145]'
                    : 'border border-hairline bg-surface text-ink hover:border-ink-tertiary'
                }`}
              >
                {hasActivePaidPass ? t('pay.checkout.activeButton') : t(`pay.plans.${key}.cta`)}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ink-tertiary">{t('home.passes.note')}</p>
      </div>
    </section>
  );
}
