import { Brain as Train, Car, Plane, Navigation, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import taxiCards from '../../data/phraseCards/taxi.json';
import PhraseCard from '../PhraseCard';
import type { PhraseCardData } from '../../types/phraseCard';

const METRO_PHRASES = [
  { key: 'transport.phrases.whereSubway', zh: '地铁站在哪里？', pinyin: 'Dìtiě zhàn zài nǎlǐ?' },
  { key: 'transport.phrases.whichLine', zh: '几号线去...？', pinyin: 'Jǐ hào xiàn qù...?' },
  { key: 'transport.phrases.howManyStops', zh: '几站？', pinyin: 'Jǐ zhàn?' },
  { key: 'transport.phrases.transfer', zh: '在这里换乘吗？', pinyin: 'Zài zhèlǐ huànchéng ma?' },
];

interface TransportApp {
  name: string;
  label: string;
  desc: string;
  color: string;
}

interface Props {
  showToast: (msg: string) => void;
}

export default function TransportTab({ showToast }: Props) {
  const { t } = useTranslation();
  const [selectedPhrase, setSelectedPhrase] = useState<(typeof METRO_PHRASES)[number] | null>(null);
  const apps = t('transport.apps', { returnObjects: true }) as TransportApp[];
  const taxiPhraseCards = taxiCards as PhraseCardData[];

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

  const openAppLink = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('didi')) window.open('https://www.didiglobal.com', '_blank');
    else if (normalized.includes('amap') || normalized.includes('高德')) window.open('https://mobile.amap.com', '_blank');
    else if (normalized.includes('trip')) window.open('https://www.trip.com', '_blank');
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('transport.appsTitle')}</h2>
        <div className="space-y-2.5">
          {apps.map((app) => (
            <button
              key={app.name}
              onClick={() => openAppLink(app.name)}
              className={`w-full text-left border rounded-2xl p-4 flex items-center justify-between ${app.color}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{app.name}</span>
                  <span className="text-xs opacity-70">{app.label}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-70">{app.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Train className="w-4 h-4 text-[#155e63]" />
          <h2 className="text-base font-semibold text-gray-900">{t('transport.metroTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {METRO_PHRASES.map((p) => (
            <div
              key={p.key}
              onClick={() => setSelectedPhrase(p)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-[#155e63]/20 transition-all group"
            >
              <p className="text-gray-500 text-xs group-hover:text-[#155e63] mb-1 transition-colors">{t(p.key)}</p>
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
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-4 h-4 text-[#155e63]" />
          <h2 className="text-base font-semibold text-gray-900">{t('transport.taxiTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {taxiPhraseCards.map((card, index) => (
            <PhraseCard key={card.id} card={card} locked={index >= 3} />
          ))}
        </div>
      </section>

      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-4 h-4 text-[#155e63]" />
          <p className="font-semibold text-[#155e63] text-sm">{t('transport.trainTitle')}</p>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-3">
          {t('transport.trainSub')}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-xl px-3 py-2 text-xs text-gray-400 border border-gray-100">{t('transport.from')}</div>
          <div className="flex-1 bg-white rounded-xl px-3 py-2 text-xs text-gray-400 border border-gray-100">{t('transport.to')}</div>
        </div>
        <button
          onClick={() => window.open('https://www.trip.com/trains/', '_blank')}
          className="mt-2 w-full bg-[#155e63] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0e4a4e] transition-colors flex items-center justify-center gap-2"
        >
          <Plane className="w-4 h-4" /> {t('transport.search')}
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
    </div>
  );
}
