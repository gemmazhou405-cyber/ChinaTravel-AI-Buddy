import { Building2, MapPin, Wifi, Key, MessageSquare, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCardCategorySection from '../PhraseCardCategorySection';
import { hotelCards } from '../../data/phraseCards';

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
  const [selectedPhrase, setSelectedPhrase] = useState<(typeof HOTEL_PHRASES)[number] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [city, setCity] = useState('Shanghai');

  const cities: Record<string, string> = {
    Beijing: '北京',
    Shanghai: '上海',
    Chengdu: '成都',
    "Xi'an": '西安',
    Guangzhou: '广州',
    Hangzhou: '杭州',
    Chongqing: '重庆',
    Shenzhen: '深圳',
    Guilin: '桂林',
    Harbin: '哈尔滨',
  };

  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

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
            <div
              key={p.key}
              onClick={() => setSelectedPhrase(p)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-[#155e63]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-500 text-xs group-hover:text-[#155e63] transition-colors">{t(p.key)}</p>
                <MessageSquare className="w-3 h-3 text-gray-300 group-hover:text-[#155e63] transition-colors" />
              </div>
              <p className="text-gray-900 font-medium text-sm">{p.zh}</p>
              <p className="text-gray-400 text-xs mt-0.5">{p.pinyin}</p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakChinese(p.zh);
                  }}
                  className="text-xs text-[#155e63] flex items-center gap-1"
                >
                  🔊 Speak
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyPhrase(p.zh);
                  }}
                  className="text-xs text-gray-400"
                >
                  📋 Copy
                </button>
              </div>
            </div>
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

      <PhraseCardCategorySection
        title="Hotel Phrase Cards"
        icon={<Building2 className="w-4 h-4 text-[#155e63]" />}
        cards={hotelCards}
        freeLimit={3}
      />

      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#155e63] text-sm">{t('stay.addressCard')}</p>
          <p className="text-gray-500 text-xs mt-0.5">{t('stay.addressSub')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#155e63] text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-[#0e4a4e] transition-colors flex items-center gap-1"
        >
          {t('stay.generate')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {selectedPhrase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedPhrase(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPhrase(null)} className="ml-auto mb-4 block text-gray-400 text-xl">✕</button>
            <p className="text-sm font-semibold text-[#155e63] mb-5">{t(selectedPhrase.key)}</p>
            <p className="text-4xl font-bold text-gray-950 leading-tight mb-4">{selectedPhrase.zh}</p>
            <p className="text-gray-500 text-base mb-6">{selectedPhrase.pinyin}</p>
            <div className="flex gap-2">
              <button onClick={() => speakChinese(selectedPhrase.zh)} className="flex-1 bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium">🔊 Speak</button>
              <button onClick={() => copyPhrase(selectedPhrase.zh)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">📋 Copy</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Address Card Generator</h3>
            <input
              placeholder="Hotel name in English"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mb-3 text-sm"
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 mb-4 text-sm"
            >
              {Object.keys(cities).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {hotelName && (
              <div className="bg-[#f7f3ea] rounded-xl p-4 mb-4 text-center">
                <p className="text-2xl font-bold text-[#155e63] mb-1">请带我去{cities[city]}的{hotelName}</p>
                <p className="text-sm text-gray-500">Please take me to {hotelName} in {city}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border rounded-xl py-2 text-sm">Close</button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`请带我去${cities[city]}的${hotelName}`);
                  setShowModal(false);
                  showToast(t('toast.copied'));
                }}
                className="flex-1 bg-[#155e63] text-white rounded-xl py-2 text-sm font-medium"
              >
                Copy Chinese
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
