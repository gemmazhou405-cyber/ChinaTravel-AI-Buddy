import { Check, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PAYPAL_USERNAME } from '../firebase-config';
import type { UserState } from '../hooks/useAuth';

const PLANS = [
  {
    key: 'free',
    price: '$0',
    period: '',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
  {
    key: 'trip',
    price: '$9.90',
    period: '',
    ctaStyle: 'bg-white text-[#155e63] hover:bg-gray-50 font-bold',
    highlighted: true,
  },
  {
    key: 'group',
    price: '$39.90',
    period: '',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
];

interface Props {
  userState: UserState | null;
}

export default function PricingPlans({ userState }: Props) {
  const { t } = useTranslation();

  const handlePurchase = (plan: string, price: string) => {
    if (plan === 'free') {
      window.location.reload();
      return;
    }

    if (!PAYPAL_USERNAME) {
      alert(t('pay.paymentSoon'));
      return;
    }

    window.open(`https://paypal.me/${PAYPAL_USERNAME}/${price}`, '_blank');
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
              {plan.period && (
                <span className={plan.highlighted ? 'text-white/60' : 'text-gray-400'}>{plan.period}</span>
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
              onClick={() => {
                if (plan.key === 'trip') handlePurchase('trip', '9.90');
                else if (plan.key === 'group') handlePurchase('group', '39.90');
                else handlePurchase('free', '0');
              }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${plan.ctaStyle}`}
            >
              {t(`pay.plans.${plan.key}.cta`)}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">
        {t('pay.refund')}
      </p>
    </section>
  );
}
