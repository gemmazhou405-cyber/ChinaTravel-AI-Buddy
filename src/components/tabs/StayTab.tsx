import { AlertTriangle, Building2, Car, ChevronRight, CreditCard, Key, Lock, MapPin, Plane, Utensils, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import { hotelCards } from '../../data/phraseCards';
import type { UserState } from '../../hooks/useAuth';
import { isGroup, isTripOrGroup } from '../../lib/membership';
import { cityPacks } from '../../data/cityPacks';

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
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
}

export default function StayTab({ userState, showToast, onAskBuddy, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const [customPhrase, setCustomPhrase] = useState('');
  const [showCustomResult, setShowCustomResult] = useState(false);
  const [showCustomLocal, setShowCustomLocal] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('shanghai');
  const customPhraseCard = {
    english: 'What time is the latest checkout?',
    chinese: '请问我最晚几点退房？',
    pinyin: 'Qǐngwèn wǒ zuì wǎn jǐ diǎn tuìfáng?',
  };
  const hasFullAccess = isTripOrGroup(userState);
  const canUseCustomPhraseHelper = isGroup(userState);
  const selectedCity = cityPacks.find((city) => city.cityId === selectedCityId) || cityPacks[0];
  const isCityLocked = (cityId: string) => !hasFullAccess && cityId !== 'shanghai';

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
      <TabSectionHeader
        title="Stay"
        subtitle="Handle hotel check-in, room issues, and front desk conversations."
        onAskBuddy={onAskBuddy}
      />

      <section className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#155e63] text-sm">Custom Phrase Helper</p>
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
              Create custom Chinese cards for your real travel situations.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#155e63]/10 px-2.5 py-1 text-[11px] font-semibold text-[#155e63]">
            Available with Group Pass
          </span>
        </div>
        <textarea
          value={customPhrase}
          onChange={(e) => {
            setCustomPhrase(e.target.value);
            setShowCustomResult(false);
          }}
          placeholder="What do you want to say?"
          className="mt-4 min-h-24 w-full resize-none rounded-xl border border-[#155e63]/15 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-[#155e63]/40"
        />
        {showCustomResult && customPhrase.trim() && (
          <div className="mt-3 rounded-2xl border border-[#155e63]/15 bg-white p-3.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#155e63]">Available with Group Pass</p>
              <span className="rounded-full bg-[#155e63]/10 px-2 py-0.5 text-[10px] font-semibold text-[#155e63]">Preview</span>
            </div>
            <p className="text-gray-500 text-xs mb-1">{customPhraseCard.english}</p>
            <p className="text-gray-900 font-medium text-sm">{customPhraseCard.chinese}</p>
            <p className="text-gray-400 text-xs mt-0.5">{customPhraseCard.pinyin}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => speakChinese(customPhraseCard.chinese)} className="text-xs text-[#155e63] flex items-center gap-1">
                🔊 Speak
              </button>
              <button onClick={() => copyPhrase(customPhraseCard.chinese)} className="text-xs text-gray-400">
                📋 Copy
              </button>
              <button onClick={() => setShowCustomLocal(true)} className="text-xs font-medium text-[#155e63]">
                Show to local
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (!canUseCustomPhraseHelper) {
              onUpgradeClick('Unlock custom phrase cards with Group Pass.');
              return;
            }
            setShowCustomResult(true);
          }}
          disabled={!customPhrase.trim()}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-[#155e63] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0e4a4e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {canUseCustomPhraseHelper ? 'Generate Chinese Card' : 'Upgrade to Group Pass'} <ChevronRight className="w-3 h-3" />
        </button>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">City Guide</h2>
        <p className="text-gray-500 text-sm mb-3">Pick your city for arrival, transport, payment, food, and safety basics.</p>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {cityPacks.map((city) => {
            const locked = isCityLocked(city.cityId);
            const active = city.cityId === selectedCity.cityId;
            return (
              <button
                key={city.cityId}
                onClick={() => {
                  if (locked) {
                    onUpgradeClick('Unlock city survival packs with Trip Pass.');
                    return;
                  }
                  setSelectedCityId(city.cityId);
                }}
                className={`relative min-h-16 rounded-2xl border px-2 py-2 text-center text-xs font-semibold shadow-sm transition-all ${
                  active
                    ? 'border-[#155e63] bg-[#155e63] text-white'
                    : 'border-gray-100 bg-white text-gray-700 hover:border-[#155e63]/30 hover:text-[#155e63]'
                } ${locked ? 'opacity-70' : ''}`}
              >
                {locked && <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-gray-400" />}
                <span className="block">{city.cityName}</span>
                <span className={active ? 'text-white/60' : 'text-gray-400'}>{city.cityNameCN}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-950">{selectedCity.cityName} Survival Pack</h3>
              <p className="text-xs text-gray-500">{selectedCity.cityNameCN} · Best time: {selectedCity.bestTimeToVisit}</p>
            </div>
            {!hasFullAccess && (
              <span className="rounded-full bg-[#155e63]/10 px-2.5 py-1 text-[11px] font-semibold text-[#155e63]">
                Shanghai free
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Plane className="h-4 w-4 text-[#155e63]" /> Airport & Getting Around
              </div>
              <p className="text-sm text-gray-600">{selectedCity.airport.name} ({selectedCity.airport.iataCode})</p>
              <p className="text-xs leading-relaxed text-gray-500">{selectedCity.airport.toCity}</p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Car className="h-4 w-4 text-[#155e63]" /> Transport
              </div>
              <p className="text-xs leading-relaxed text-gray-500">Metro: {selectedCity.transport.metro}</p>
              <p className="text-xs leading-relaxed text-gray-500">Taxi: {selectedCity.transport.taxi}</p>
              <p className="text-xs leading-relaxed text-gray-500">DiDi: {selectedCity.transport.didi}</p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <CreditCard className="h-4 w-4 text-[#155e63]" /> Payment
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(selectedCity.payment).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-[#f7f3ea] px-3 py-2">
                    <p className="text-[11px] font-semibold capitalize text-[#155e63]">{key}</p>
                    <p className="text-xs leading-relaxed text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Utensils className="h-4 w-4 text-[#155e63]" /> Food Must-Try
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCity.food.mustTry.map((item) => (
                  <span key={item} className="rounded-full bg-[#155e63]/10 px-2.5 py-1 text-xs font-medium text-[#155e63]">{item}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Watch Out For
              </div>
              <ul className="space-y-1">
                {selectedCity.commonScams.map((item) => (
                  <li key={item} className="text-xs text-gray-500">• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-[#155e63]" /> Tourist Tips
              </div>
              <ul className="space-y-1">
                {selectedCity.touristTips.map((tip) => (
                  <li key={tip} className="text-xs text-gray-500">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
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

      <PhraseCategoryAccordion
        categories={[
          {
            id: 'hotel',
            title: 'Hotel Phrase Cards',
            subtitle: `${hotelCards.length} check-in and front desk cards`,
            icon: <Building2 className="w-4 h-4" />,
            cards: hotelCards,
          },
        ]}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
      />

      {showCustomLocal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCustomLocal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCustomLocal(false)} className="ml-auto mb-4 block text-gray-400 text-xl">✕</button>
            <p className="text-sm font-semibold text-[#155e63] mb-5">{customPhraseCard.english}</p>
            <p className="text-4xl font-bold text-gray-950 leading-tight mb-4">{customPhraseCard.chinese}</p>
            <p className="text-gray-500 text-base mb-6">{customPhraseCard.pinyin}</p>
            <div className="flex gap-2">
              <button onClick={() => speakChinese(customPhraseCard.chinese)} className="flex-1 bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium">🔊 Speak</button>
              <button onClick={() => copyPhrase(customPhraseCard.chinese)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">📋 Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
