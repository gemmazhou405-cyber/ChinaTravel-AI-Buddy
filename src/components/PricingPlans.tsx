import { Check, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PassState } from '../hooks/usePass';
import { trackEvent, trackGumroadClick } from '../lib/analytics';

export const PLANS = [
  { key: 'free',  price: '$0',     periodKey: '',            highlighted: false },
  { key: 'trip',  price: '$9.90',  periodKey: 'pay.oneTime', highlighted: true  },
  { key: 'group', price: '$29.90', periodKey: 'pay.oneTime', highlighted: false },
] as const;

const GUMROAD_TRIP_URL  = import.meta.env.VITE_GUMROAD_TRIP_URL  || 'https://chinaease.gumroad.com/l/trip-pass';
const GUMROAD_GROUP_URL = import.meta.env.VITE_GUMROAD_GROUP_URL || 'https://chinaease.gumroad.com/l/group-pass';

function gumroadUrl(plan: string) {
  if (plan === 'trip') return GUMROAD_TRIP_URL;
  if (plan === 'group') return GUMROAD_GROUP_URL;
  return '#';
}

interface Props {
  passState: PassState | null;
  showToast: (msg: string) => void;
  onCtaClick?: (plan: string) => void;
}

export default function PricingPlans({ passState, showToast, onCtaClick }: Props) {
  const { t } = useTranslation();

  const hasActivePaidPass = Boolean(passState && passState.tier !== 'free' && !passState.expired);

  const currentPlanExpires = passState?.expiresAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(passState.expiresAt))
    : null;

  const handlePlanCta = (plan: string) => {
    onCtaClick?.(plan);
    const isTrip = plan === 'trip';
    const isGroup = plan === 'group';
    const isPaid = isTrip || isGroup;

    void trackEvent('cta_clicked', {
      ctaName: isTrip ? 'Get Trip Pass' : isGroup ? 'Get Group Pass' : 'Start Free',
      destination: isPaid ? 'Gumroad' : 'free-toolkit',
      tool: 'pay',
      plan: isTrip ? 'trip_pass' : isGroup ? 'group_pass' : 'free',
    });

    if (!isPaid) {
      showToast(t('pay.freeToolkitReady'));
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
    <section id="plans">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-[#155e63]" />
        <h2 className="text-base font-semibold text-gray-900">{t('pay.plansTitle')}</h2>
      </div>

      {passState && passState.tier !== 'free' && !passState.expired && (
        <p className="text-xs text-gray-500 mb-3">
          {t('pay.currentPlan')} <span className="font-semibold text-[#155e63]">{passState.tier}</span>
          {' · '}{t('pay.aiUsed')}{' '}
          <span className="font-semibold text-[#155e63]">{passState.messagesUsed ?? 0}/{passState.messageAllowance ?? 0}</span>
          {currentPlanExpires && (
            <span> · {t('pay.checkout.expires', { date: currentPlanExpires })}</span>
          )}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl p-5 transition-all hover:shadow-md ${
              plan.highlighted
                ? 'bg-[#155e63] text-white shadow-lg shadow-[#155e63]/20'
                : 'bg-white border border-gray-100 shadow-sm'
            }`}
          >
            <h3 className={`font-semibold text-sm ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
              {t(`pay.plans.${plan.key}.name`)}
            </h3>
            <div className="mt-2 mb-1">
              <span className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
              {plan.periodKey && (
                <span className={plan.highlighted ? 'text-white/60' : 'text-gray-400'}> {t(plan.periodKey)}</span>
              )}
            </div>
            <p className={`text-xs mb-4 ${plan.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
              {t(`pay.plans.${plan.key}.desc`)}
            </p>
            <ul className="space-y-2 mb-5">
              {(t(`pay.plans.${plan.key}.features`, { returnObjects: true }) as string[]).map((f) => (
                <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlighted ? 'text-white/85' : 'text-gray-600'}`}>
                  <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#7dd3d8]' : 'text-[#155e63]'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanCta(plan.key)}
              disabled={plan.key !== 'free' && hasActivePaidPass}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                plan.highlighted
                  ? 'bg-white text-[#155e63] hover:bg-gray-50 font-bold'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {plan.key !== 'free' && hasActivePaidPass ? t('pay.checkout.activeButton') : t(`pay.plans.${plan.key}.cta`)}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">{t('pay.refund')}</p>
    </section>
  );
}
