import { Brain as Train, Car, Plane, Navigation, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import ToolDisclosure from '../ToolDisclosure';
import { airportCards, taxiCards, trainCards } from '../../data/phraseCards';
import type { UserState } from '../../hooks/useAuth';
import { isTripOrGroup } from '../../lib/membership';

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
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
}

export default function TransportTab({ userState, showToast, onAskBuddy, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const [selectedPhrase, setSelectedPhrase] = useState<(typeof METRO_PHRASES)[number] | null>(null);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const apps = t('transport.apps', { returnObjects: true }) as TransportApp[];
  const hasFullAccess = isTripOrGroup(userState);

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
    if (normalized.includes('didi')) window.open('https://www.didiglobal.com/', '_blank', 'noopener,noreferrer');
    else if (normalized.includes('amap') || normalized.includes('高德')) window.open('https://www.amap.com/', '_blank', 'noopener,noreferrer');
    else if (normalized.includes('trip')) window.open('https://www.trip.com/trains/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title={t('tabs.transport')}
        subtitle={t('tabHeaders.transport')}
        onAskBuddy={onAskBuddy}
      />

      <ToolDisclosure
        title={t('transport.trainTitle')}
        subtitle={t('transport.trainHelperShort')}
        icon={<Navigation className="w-4 h-4" />}
      >
        <p className="text-gray-500 text-xs leading-relaxed mb-3">
          {t('transport.trainSub')}
        </p>
        <div className="flex gap-2">
          <input
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            placeholder={t('transport.from')}
            className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2 text-xs text-gray-700 border border-gray-100 outline-none focus:border-[#155e63]/40 placeholder:text-gray-400"
          />
          <input
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            placeholder={t('transport.to')}
            className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2 text-xs text-gray-700 border border-gray-100 outline-none focus:border-[#155e63]/40 placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={() => window.open('https://www.trip.com/trains/', '_blank', 'noopener,noreferrer')}
          className="mt-2 w-full bg-[#155e63] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0e4a4e] transition-colors flex items-center justify-center gap-2"
        >
          <Plane className="w-4 h-4" /> {t('transport.search')}
        </button>
      </ToolDisclosure>

      <ToolDisclosure
        title={t('transport.appsTitle')}
        subtitle={t('transport.appsShort')}
        icon={<Car className="w-4 h-4" />}
      >
        <div className="space-y-2.5">
          {apps.map((app) => (
            <button
              key={app.name}
              onClick={() => openAppLink(app.name)}
              className={`min-h-[4.7rem] w-full rounded-2xl border p-4 text-left shadow-[0_12px_34px_rgba(11,63,67,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(11,63,67,0.10)] ${app.color}`}
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
      </ToolDisclosure>

      <ToolDisclosure
        title={t('transport.metroTrainPhrases')}
        subtitle={t('transport.metroTrainPhrasesSub')}
        icon={<Train className="w-4 h-4" />}
      >
        <div className="flex items-center gap-2 mb-3">
          <Train className="w-4 h-4 text-[#155e63]" />
          <h2 className="text-base font-semibold text-gray-900">{t('transport.metroTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {METRO_PHRASES.map((p) => (
            <div
              key={p.key}
              onClick={() => setSelectedPhrase(p)}
                className="rounded-2xl border border-white/60 bg-white/[0.58] p-3.5 text-left shadow-[0_12px_34px_rgba(11,63,67,0.07)] backdrop-blur-xl transition-all hover:border-[#155e63]/20 hover:shadow-md group"
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
                  🔊 {t('common.speak')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyPhrase(p.zh);
                  }}
                  className="text-xs text-gray-400"
                >
                  📋 {t('common.copy')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </ToolDisclosure>

      <PhraseCategoryAccordion
        categories={[
          {
            id: 'taxi',
            title: t('transport.taxiTitle'),
            subtitle: t('transport.taxiCardsSubtitle', { count: taxiCards.length }),
            icon: <Car className="w-4 h-4" />,
            cards: taxiCards,
          },
          {
            id: 'train',
            title: t('transport.trainPhrases'),
            subtitle: t('transport.trainCardsSubtitle', { count: trainCards.length }),
            icon: <Train className="w-4 h-4" />,
            cards: trainCards,
          },
          {
            id: 'airport',
            title: t('transport.airportPhrases'),
            subtitle: t('transport.airportCardsSubtitle', { count: airportCards.length }),
            icon: <Plane className="w-4 h-4" />,
            cards: airportCards,
          },
        ]}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
      />

      {selectedPhrase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedPhrase(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPhrase(null)} className="ml-auto mb-4 block text-gray-400 text-xl">✕</button>
            <p className="text-sm font-semibold text-[#155e63] mb-5">{t(selectedPhrase.key)}</p>
            <p className="text-4xl font-bold text-gray-950 leading-tight mb-4">{selectedPhrase.zh}</p>
            <p className="text-gray-500 text-base mb-6">{selectedPhrase.pinyin}</p>
            <div className="flex gap-2">
              <button onClick={() => speakChinese(selectedPhrase.zh)} className="flex-1 bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium">🔊 {t('common.speak')}</button>
              <button onClick={() => copyPhrase(selectedPhrase.zh)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">📋 {t('common.copy')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
