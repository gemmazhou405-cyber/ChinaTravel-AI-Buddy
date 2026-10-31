import { Check, Zap } from 'lucide-react';
import planningHelp from '../data/planningHelp.json';
import { useTranslation } from 'react-i18next';
import type { PassState } from '../hooks/usePass';
import { trackEvent, trackGumroadClick } from '../lib/analytics';
import { gumroadCheckoutUrl } from '../lib/gumroad';

export const PLANS = [
  { key: 'free',  price: '$0',     periodKey: '',            highlighted: false },
  { key: 'trip',  price: '$9.90',  periodKey: 'pay.oneTime', highlighted: true  },
  { key: 'group', price: '$29.90', periodKey: 'pay.oneTime', highlighted: false },
] as const;

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

    trackGumroadClick(plan as 'trip' | 'group');
    window.open(gumroadCheckoutUrl(plan as 'trip' | 'group'), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="plans">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-[#155e63]" />
        <h2 className="text-base font-semibold text-gray-900">{t('pay.plansTitle')}</h2>
      </div>

      <p className="mb-5 text-sm font-semibold leading-relaxed text-gray-700">{planningHelp.digitalHeading}. {planningHelp.digitalScope}</p>
      <p id="toolkit-pass-purchase-notice" className="mb-5 text-sm leading-relaxed text-gray-600">{t('pay.checkout.separatePassNotice')}</p>

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
            {hasActivePaidPass && passState?.tier === plan.key && (
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${plan.highlighted ? 'bg-white/15 text-white' : 'bg-[#155e63]/10 text-[#155e63]'}`}>{t('pay.checkout.currentPass')}</span>
            )}
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
              aria-describedby={plan.key === 'free' ? undefined : 'toolkit-pass-purchase-notice'}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                plan.highlighted
                  ? 'bg-white text-[#155e63] hover:bg-gray-50 font-bold'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {hasActivePaidPass && passState?.tier === plan.key ? t('pay.checkout.buyAgain', { pass: t(`pay.plans.${plan.key}.name`) }) : t(`pay.plans.${plan.key}.cta`)}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">{t('pay.refund')}</p>
    </section>
  );
}
