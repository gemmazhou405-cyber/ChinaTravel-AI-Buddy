import { Smartphone, DollarSign, Info, ChevronRight, Check, Zap, CreditCard } from 'lucide-react';
import { PAYPAL_USERNAME } from '../../firebase-config';
import { UserState } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import PhraseCardCategorySection from '../PhraseCardCategorySection';
import { paymentCards } from '../../data/phraseCards';

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
  onUpgradeClick: () => void;
}

interface PaymentMethod {
  name: string;
  label: string;
  desc: string;
  status: string;
  statusColor: string;
  icon: string;
}

export default function PayTab({ userState, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const assetBase = import.meta.env.BASE_URL;
  const paymentMethods = t('pay.methods', { returnObjects: true }) as PaymentMethod[];
  const setupSteps = [
    t('pay.setup.step1'),
    t('pay.setup.step2'),
    t('pay.setup.step3'),
    t('pay.setup.step4'),
    t('pay.setup.step5'),
  ];

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
    <div className="space-y-6">
      {/* Email header banner */}
      <section>
        <img
          src={`${assetBase}email_header.jpg`}
          alt={t('pay.bannerAlt')}
          style={{
            width: '100%',
            borderRadius: '16px',
            marginBottom: '2rem',
            display: 'block',
          }}
        />
      </section>

      {/* Pricing cards */}
      <section>
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

      {/* Payment methods */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('pay.paymentTitle')}</h2>
        <div className="space-y-2.5">
          {paymentMethods.map((m) => (
            <div key={m.name} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">{m.name}</span>
                    <span className="text-gray-400 text-xs ml-1.5">{m.label}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.statusColor}`}>
                  {m.status}
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed pl-8">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PhraseCardCategorySection
        title="Payment Phrase Cards"
        icon={<CreditCard className="w-4 h-4 text-[#155e63]" />}
        cards={paymentCards}
        freeLimit={3}
        onUpgradeClick={onUpgradeClick}
      />

      {/* WeChat Pay setup */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-[#155e63]" />
          <h2 className="text-base font-semibold text-gray-900">{t('pay.wechatSetup')}</h2>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {setupSteps.map((stepText, i) => (
            <div
              key={stepText}
              className={`flex items-center gap-3 px-4 py-3.5 ${i !== setupSteps.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="w-6 h-6 rounded-full bg-[#155e63]/10 text-[#155e63] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-gray-700 text-sm">{stepText}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 font-semibold text-sm">{t('pay.exchangeTip')}</p>
          <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
            {t('pay.exchangeBody')}
          </p>
        </div>
      </div>

      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#155e63] text-sm flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> {t('pay.currency')}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{t('pay.currencyLive')}</p>
        </div>
        <button className="bg-[#155e63] text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-[#0e4a4e] transition-colors flex items-center gap-1">
          {t('pay.open')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
