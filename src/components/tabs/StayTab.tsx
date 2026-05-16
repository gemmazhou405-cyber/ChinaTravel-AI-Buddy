import { MapPin, Wifi, Key, MessageSquare, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HOTEL_PHRASES = [
  { key: 'stay.phrases.reservation', zh: '我有预订', pinyin: 'Wǒ yǒu yùdìng' },
  { key: 'stay.phrases.earlyCheckin', zh: '我可以提前入住吗？', pinyin: 'Wǒ kěyǐ tíqián rùzhù ma?' },
  { key: 'stay.phrases.lateCheckout', zh: '我想申请延迟退房', pinyin: 'Wǒ xiǎng shēnqǐng yánchí tuìfáng' },
  { key: 'stay.phrases.wifi', zh: 'WiFi密码是多少？', pinyin: 'WiFi mìmǎ shì duōshao?' },
  { key: 'stay.phrases.towels', zh: '请再给我一些毛巾', pinyin: 'Qǐng zài gěi wǒ yīxiē máojīn' },
  { key: 'stay.phrases.roomService', zh: '客房服务', pinyin: 'Kèfáng fúwù' },
];

const TIPS = [
  {
    icon: <Key className="w-4 h-4 text-[#155e63]" />,
    titleKey: 'stay.tips.registration.title',
    bodyKey: 'stay.tips.registration.body',
  },
  {
    icon: <Wifi className="w-4 h-4 text-[#155e63]" />,
    titleKey: 'stay.tips.wifi.title',
    bodyKey: 'stay.tips.wifi.body',
  },
  {
    icon: <MapPin className="w-4 h-4 text-[#155e63]" />,
    titleKey: 'stay.tips.address.title',
    bodyKey: 'stay.tips.address.body',
  },
];

interface Props {
  showToast: (msg: string) => void;
}

export default function StayTab({ showToast }: Props) {
  const { t } = useTranslation();

  const copyPhrase = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    showToast(t('toast.copied'));
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">{t('stay.phrasesTitle')}</h2>
        <p className="text-gray-500 text-sm mb-3">{t('stay.phrasesSub')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HOTEL_PHRASES.map((p) => (
            <button
              key={p.key}
              onClick={() => copyPhrase(p.zh)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-[#155e63]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-500 text-xs group-hover:text-[#155e63] transition-colors">{t(p.key)}</p>
                <MessageSquare className="w-3 h-3 text-gray-300 group-hover:text-[#155e63] transition-colors" />
              </div>
              <p className="text-gray-900 font-medium text-sm">{p.zh}</p>
              <p className="text-gray-400 text-xs mt-0.5">{p.pinyin}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('stay.tipsTitle')}</h2>
        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.titleKey} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3">
              <div className="w-8 h-8 bg-[#155e63]/8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                {tip.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{t(tip.titleKey)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t(tip.bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#155e63] text-sm">{t('stay.addressCard')}</p>
          <p className="text-gray-500 text-xs mt-0.5">{t('stay.addressSub')}</p>
        </div>
        <button className="bg-[#155e63] text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-[#0e4a4e] transition-colors flex items-center gap-1">
          {t('stay.generate')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
