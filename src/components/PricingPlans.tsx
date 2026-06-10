import { Check, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../hooks/useAuth';
import { trackEvent } from '../lib/analytics';

const PAYPAL_LINKS = {
  trip: 'https://www.paypal.com/ncp/payment/863ZKSY6RJ64J',
  group: 'https://www.paypal.com/ncp/payment/CL8J5WJVK3TAJ',
} as const;

const PLANS = [
  {
    key: 'free',
    price: '$0',
    periodKey: '',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
  {
    key: 'trip',
    price: '$9.90',
    periodKey: 'pay.oneTime',
    ctaStyle: 'bg-white text-[#155e63] hover:bg-gray-50 font-bold',
    highlighted: true,
  },
  {
    key: 'group',
    price: '$29.90',
    periodKey: 'pay.oneTime',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
];

interface Props {
  userState: UserState | null;
  showToast: (msg: string) => void;
  onCtaClick?: (plan: string) => void;
}

export default function PricingPlans({ userState, showToast, onCtaClick }: Props) {
  const { t } = useTranslation();

  const handlePlanCta = (plan: string) => {
    onCtaClick?.(plan);
    const isTrip = plan === 'trip';
    const isGroup = plan === 'group';
    const isPaid = isTrip || isGroup;

    void trackEvent('cta_clicked', {
      ctaName: isTrip ? 'Get Trip Pass' : isGroup ? 'Get Group Pass' : 'Start Free',
      destination: isTrip ? 'PayPal Trip Pass' : isGroup ? 'PayPal Group Pass' : 'free-toolkit',
      tool: 'pay',
      plan: isTrip ? 'trip_pass' : isGroup ? 'group_pass' : 'free',
    }, userState?.uid);

    if (!isPaid) {
      showToast(t('pay.freeToolkitReady'));
      return;
    }

    window.open(isTrip ? PAYPAL_LINKS.trip : PAYPAL_LINKS.group, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="plans">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-[#155e63]" />
        <h2 className="text-base font-semibold text-gray-900">{t('pay.plansTitle')}</h2>
      </div>
      {userState && (
        <p className="text-xs text-gray-500 mb-3">
          {t('pay.currentPlan')} <span className="font-semibold text-[#155e63]">{userState.plan}</span> · {t('pay.aiUsed')}{' '}
          <span className="font-semibold text-[#155e63]">{userState.buddyAiQuotaUsed}/{userState.buddyAiQuotaTotal}</span>
        </p>
      )}
      <div className="mb-4 rounded-[1.35rem] border border-[#155e63]/15 bg-white/60 p-4 shadow-[0_14px_34px_rgba(11,63,67,0.06)] backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#155e63]" />
          <p className="text-sm font-bold text-gray-950">{t('pay.manualPayment.title')}</p>
        </div>
        <p className="text-xs font-medium leading-relaxed text-gray-600">{t('pay.manualPayment.body')}</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{t('pay.manualPayment.note')}</p>
        <p className="mt-2 text-xs font-semibold text-[#155e63]">{t('pay.manualPayment.safety')}</p>
      </div>
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
              <span className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.price}
              </span>
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
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${plan.ctaStyle}`}
            >
              {t(`pay.plans.${plan.key}.cta`)}
            </button>
            {plan.key !== 'free' && (
              <p className={`mt-3 text-[11px] leading-relaxed ${plan.highlighted ? 'text-white/70' : 'text-gray-400'}`}>
                {t('pay.manualPayment.paidNote')}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">
        {t('pay.refund')}
      </p>
    </section>
  );
}
