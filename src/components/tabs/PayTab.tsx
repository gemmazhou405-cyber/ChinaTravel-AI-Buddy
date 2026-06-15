import { Smartphone, DollarSign, Info, ChevronRight, CreditCard, WalletCards, Banknote, QrCode } from 'lucide-react';
import type { User } from 'firebase/auth';
import { UserState } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import ToolDisclosure from '../ToolDisclosure';
import { paymentCards } from '../../data/phraseCards';
import PricingPlans from '../PricingPlans';
import { isTripOrGroup } from '../../lib/membership';
import PhraseCard from '../PhraseCard';
import type { PhraseCardData } from '../../types/phraseCard';

interface Props {
  user: User | null;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onNeedAuth: () => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  onRefreshUserState?: () => Promise<UserState | null>;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

interface PaymentMethod {
  name: string;
  label: string;
  desc: string;
  status: string;
  statusColor: string;
  icon: string;
}

export default function PayTab({ user, userState, showToast, onNeedAuth, onAskBuddy, onUpgradeClick, onRefreshUserState, deepTool, onToolOpened }: Props) {
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
  const paymentFailedCards: PhraseCardData[] = [
    {
      id: 'payment_failed_alipay',
      scene: t('pay.failed.scene'),
      priority: 'high',
      english: t('pay.failed.alipay.en'),
      chinese: '可以用支付宝付款吗？',
      pinyin: 'Kěyǐ yòng Zhīfùbǎo fùkuǎn ma?',
      usageNote: t('pay.failed.alipay.note'),
      showToLocal: true,
      emergencyRelevant: false,
      audioText: '可以用支付宝付款吗？',
      tags: ['payment', 'alipay'],
    },
    {
      id: 'payment_failed_wechat',
      scene: t('pay.failed.scene'),
      priority: 'high',
      english: t('pay.failed.wechat.en'),
      chinese: '可以用微信支付吗？',
      pinyin: 'Kěyǐ yòng Wēixìn zhīfù ma?',
      usageNote: t('pay.failed.wechat.note'),
      showToLocal: true,
      emergencyRelevant: false,
      audioText: '可以用微信支付吗？',
      tags: ['payment', 'wechat'],
    },
    {
      id: 'payment_failed_cash',
      scene: t('pay.failed.scene'),
      priority: 'medium',
      english: t('pay.failed.cash.en'),
      chinese: '我的银行卡不能用，可以付现金吗？',
      pinyin: 'Wǒ de yínhángkǎ bù néng yòng, kěyǐ fù xiànjīn ma?',
      usageNote: t('pay.failed.cash.note'),
      showToLocal: true,
      emergencyRelevant: false,
      audioText: '我的银行卡不能用，可以付现金吗？',
      tags: ['payment', 'cash', 'card'],
    },
    {
      id: 'payment_failed_qr',
      scene: t('pay.failed.scene'),
      priority: 'medium',
      english: t('pay.failed.qr.en'),
      chinese: '你能帮我扫这个二维码吗？',
      pinyin: 'Nǐ néng bāng wǒ sǎo zhège èrwéimǎ ma?',
      usageNote: t('pay.failed.qr.note'),
      showToLocal: true,
      emergencyRelevant: false,
      audioText: '你能帮我扫这个二维码吗？',
      tags: ['payment', 'qr'],
    },
  ];

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title={t('tabs.pay')}
        subtitle={t('tabHeaders.pay')}
        onAskBuddy={onAskBuddy}
      />

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('pay.toolsTitle')}</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: <QrCode className="h-4 w-4" />, title: t('pay.tools.mobilePay'), body: t('pay.tools.mobilePayBody') },
            { icon: <WalletCards className="h-4 w-4" />, title: t('pay.tools.foreignCards'), body: t('pay.tools.foreignCardsBody') },
            { icon: <Banknote className="h-4 w-4" />, title: t('pay.tools.cash'), body: t('pay.tools.cashBody') },
            { icon: <CreditCard className="h-4 w-4" />, title: t('pay.tools.failed'), body: t('pay.tools.failedBody') },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#155e63]/10 text-[#155e63]">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ToolDisclosure
        id="tool-failed"
        title={t('pay.failed.title')}
        subtitle={t('pay.tools.failedBody')}
        icon={<CreditCard className="h-4 w-4" />}
        defaultOpen={deepTool === 'failed'}
        onOpen={() => onToolOpened?.('failed')}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {paymentFailedCards.map((card) => (
            <PhraseCard key={card.id} card={card} />
          ))}
        </div>
      </ToolDisclosure>

      {/* Pricing cards */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('pay.plansTitle')}</h2>
        <div className="mb-4 rounded-2xl border border-[#155e63]/10 bg-white/70 p-4">
          <h3 className="text-sm font-bold text-gray-950">{t('value.whyTitle')}</h3>
          <ul className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            {(t('value.points', { returnObjects: true }) as string[]).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155e63]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <PricingPlans user={user} userState={userState} showToast={showToast} onNeedAuth={onNeedAuth} onRefreshUserState={onRefreshUserState} onCtaClick={(plan) => onToolOpened?.(`early-access-${plan}`)} />
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
      <ToolDisclosure
        id="tool-pay"
        title={t('pay.paymentTitle')}
        subtitle={t('pay.tools.mobilePayBody')}
        icon={<WalletCards className="h-4 w-4" />}
        defaultOpen={deepTool === 'pay'}
        onOpen={() => onToolOpened?.('pay')}
      >
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
      </ToolDisclosure>

      {/* WeChat Pay setup */}
      <ToolDisclosure
        id="tool-wechat"
        title={t('pay.wechatSetup')}
        subtitle={t('pay.setupShort')}
        icon={<Smartphone className="h-4 w-4" />}
        defaultOpen={deepTool === 'wechat'}
        onOpen={() => onToolOpened?.('wechat')}
      >
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
      </ToolDisclosure>

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
            title: t('pay.paymentPhraseCards'),
            subtitle: t('pay.paymentCardsSubtitle', { count: paymentCards.length }),
            icon: <CreditCard className="w-4 h-4" />,
            cards: paymentCards,
          },
        ]}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
        initialOpenId={deepTool === 'phrases' ? 'payment' : null}
        onCategoryOpen={(category) => onToolOpened?.(category)}
      />
    </div>
  );
}
