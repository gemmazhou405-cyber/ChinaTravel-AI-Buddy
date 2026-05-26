import { Smartphone, DollarSign, Info, ChevronRight, CreditCard } from 'lucide-react';
import { UserState } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import { paymentCards } from '../../data/phraseCards';
import PricingPlans from '../PricingPlans';
import { isTripOrGroup } from '../../lib/membership';

interface Props {
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
}

interface PaymentMethod {
  name: string;
  label: string;
  desc: string;
  status: string;
  statusColor: string;
  icon: string;
}

export default function PayTab({ userState, showToast, onAskBuddy, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const assetBase = import.meta.env.BASE_URL;
  const paymentMethods = t('pay.methods', { returnObjects: true }) as PaymentMethod[];
  const hasFullAccess = isTripOrGroup(userState);
  const setupSteps = [
    t('pay.setup.step1'),
    t('pay.setup.step2'),
    t('pay.setup.step3'),
    t('pay.setup.step4'),
    t('pay.setup.step5'),
  ];

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title="Pay in China"
        subtitle="Understand Alipay, WeChat Pay, cards, and cash."
        onAskBuddy={onAskBuddy}
      />

      {/* Pricing cards */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Upgrade Your Trip Pass</h2>
        <div className="mb-4 rounded-2xl border border-[#155e63]/10 bg-white/70 p-4">
          <h3 className="text-sm font-bold text-gray-950">Why travelers use ChinaEase Buddy</h3>
          <ul className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            {[
              'Show useful Chinese phrases to locals',
              'Understand food, payment, hotel, and transport situations',
              'Keep emergency numbers and key phrases in one place',
              'Ask Buddy when phrase cards are not enough',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155e63]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <PricingPlans userState={userState} />
      </section>

      {/* Email header banner */}
      <section aria-label={t('pay.bannerAlt')}>
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

      <PhraseCategoryAccordion
        categories={[
          {
            id: 'payment',
            title: 'Payment Phrase Cards',
            subtitle: `${paymentCards.length} Alipay, WeChat Pay, card, and cash cards`,
            icon: <CreditCard className="w-4 h-4" />,
            cards: paymentCards,
          },
        ]}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
}
