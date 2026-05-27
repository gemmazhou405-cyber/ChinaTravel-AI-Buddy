import { CheckCircle, Circle, Wifi, CreditCard, Smartphone, FileText, ChevronRight, Lock, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import { isTripOrGroup } from '../../lib/membership';
import TabSectionHeader from '../TabSectionHeader';

import shanghaiData from '../../data/cityPacks/shanghai.json';
import beijingData from '../../data/cityPacks/beijing.json';
import chengduData from '../../data/cityPacks/chengdu.json';
import chongqingData from '../../data/cityPacks/chongqing.json';
import guangzhouData from '../../data/cityPacks/guangzhou.json';
import hangzhouData from '../../data/cityPacks/hangzhou.json';
import shenzhenData from '../../data/cityPacks/shenzhen.json';
import suzhouData from '../../data/cityPacks/suzhou.json';
import xianData from '../../data/cityPacks/xian.json';

interface CityPack {
  cityId: string;
  cityName: string;
  cityNameCN: string;
  airport: { name: string; iataCode: string; toCity: string };
  transport: { metro: string; taxi: string; didi: string; tips: string[] };
  payment: { alipay: string; wechatPay: string; cash: string; foreignCard: string };
  food: { mustTry: string[]; foodStreets: string[]; tips: string[] };
  commonScams: string[];
  touristTips: string[];
}

const CITIES: { emoji: string; data: CityPack; freeAccess: boolean }[] = [
  { emoji: '🏙️', data: shanghaiData as CityPack, freeAccess: true },
  { emoji: '🏯', data: beijingData as CityPack, freeAccess: true },
  { emoji: '🐼', data: chengduData as CityPack, freeAccess: false },
  { emoji: '🌶️', data: chongqingData as CityPack, freeAccess: false },
  { emoji: '🌸', data: guangzhouData as CityPack, freeAccess: false },
  { emoji: '🍵', data: hangzhouData as CityPack, freeAccess: false },
  { emoji: '🏗️', data: shenzhenData as CityPack, freeAccess: false },
  { emoji: '🌿', data: suzhouData as CityPack, freeAccess: false },
  { emoji: '🏛️', data: xianData as CityPack, freeAccess: false },
];

const CHECKLIST = [
  { id: 1, labelKey: 'before.items.paySetup', sublabelKey: 'before.items.paySetupSub', icon: <CreditCard className="w-4 h-4" /> },
  { id: 2, labelKey: 'before.items.appsDownload', sublabelKey: 'before.items.appsDownloadSub', icon: <Smartphone className="w-4 h-4" /> },
  { id: 3, labelKey: 'before.items.emergencyNumbers', sublabelKey: 'before.items.emergencyNumbersSub', icon: <FileText className="w-4 h-4" /> },
  { id: 4, labelKey: 'before.items.hotelAddress', sublabelKey: 'before.items.hotelAddressSub', icon: <FileText className="w-4 h-4" /> },
  { id: 5, labelKey: 'before.items.offlinePhrases', sublabelKey: 'before.items.offlinePhrasesSub', icon: <Wifi className="w-4 h-4" /> },
];

const TIPS = [
  { titleKey: 'before.tips.sim.title', bodyKey: 'before.tips.sim.body', tagKey: 'before.tips.sim.tag' },
  { titleKey: 'before.tips.apps.title', bodyKey: 'before.tips.apps.body', tagKey: 'before.tips.apps.tag' },
  { titleKey: 'before.tips.cash.title', bodyKey: 'before.tips.cash.body', tagKey: 'before.tips.cash.tag' },
];

function CityModal({ city, emoji, onClose }: { city: CityPack; emoji: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <div className="text-3xl mb-1">{emoji}</div>
            <h3 className="text-lg font-bold text-gray-900">{city.cityName}</h3>
            <p className="text-sm text-gray-400">{city.cityNameCN}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Airport */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">✈️ Getting There</p>
            <p className="text-sm font-medium text-gray-800 mb-1">{city.airport.name} ({city.airport.iataCode})</p>
            <p className="text-xs text-gray-500 leading-relaxed">{city.airport.toCity}</p>
          </div>

          {/* Transport */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">🚇 Getting Around</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-700">Metro</p>
                <p className="text-xs text-gray-500 leading-relaxed">{city.transport.metro}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Taxi / Didi</p>
                <p className="text-xs text-gray-500 leading-relaxed">{city.transport.didi}</p>
              </div>
              {city.transport.tips.length > 0 && (
                <ul className="space-y-1 pt-1">
                  {city.transport.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                      <span className="text-[#155e63] shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">💳 Paying</p>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Alipay: </span>{city.payment.alipay}</p>
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">WeChat Pay: </span>{city.payment.wechatPay}</p>
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Cash: </span>{city.payment.cash}</p>
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Foreign Card: </span>{city.payment.foreignCard}</p>
            </div>
          </div>

          {/* Must-try food */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">🍜 Must-Try Food</p>
            <div className="flex flex-wrap gap-1.5">
              {city.food.mustTry.map((item, i) => (
                <span key={i} className="bg-[#155e63]/8 text-[#155e63] text-xs px-2.5 py-1 rounded-full font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Common scams */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">⚠️ Scam Watch</p>
            <ul className="space-y-1.5">
              {city.commonScams.map((scam, i) => (
                <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                  <span className="shrink-0">•</span>
                  {scam}
                </li>
              ))}
            </ul>
          </div>

          {/* Tourist tips */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">💡 Tourist Tips</p>
            <ul className="space-y-1.5">
              {city.touristTips.map((tip, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-[#155e63] shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  userState: UserState | null;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
}

export default function BeforeTab({ userState, onAskBuddy, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const hasFullAccess = isTripOrGroup(userState);
  const [selectedCity, setSelectedCity] = useState<{ city: CityPack; emoji: string } | null>(null);
  const [checked, setChecked] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('chinaease-checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('chinaease-checklist', JSON.stringify(next));
      return next;
    });
  };

  const handleCityClick = (city: CityPack, emoji: string, freeAccess: boolean) => {
    if (!freeAccess && !hasFullAccess) {
      onUpgradeClick('Unlock all 9 city survival guides with Trip Pass.');
      return;
    }
    setSelectedCity({ city, emoji });
  };

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title="Before You Go"
        subtitle="Set up the essentials before landing in China."
        onAskBuddy={onAskBuddy}
      />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t('before.title')}</h2>
          <span className="text-xs text-gray-400">{checked.length}/{CHECKLIST.length} {t('before.done')}</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {CHECKLIST.map((item, i) => {
            const done = checked.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50 ${
                  i !== CHECKLIST.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className={`flex-shrink-0 transition-colors ${done ? 'text-[#155e63]' : 'text-gray-300'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {t(item.labelKey)}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{t(item.sublabelKey)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </section>

      {/* City Survival Guides */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">City Survival Guides</h2>
        <p className="text-gray-500 text-sm mb-3">Airport, transport, payment & local tips for each city.</p>
        <div className="grid grid-cols-3 gap-2">
          {CITIES.map(({ emoji, data, freeAccess }) => {
            const locked = !freeAccess && !hasFullAccess;
            return (
              <button
                key={data.cityId}
                onClick={() => handleCityClick(data, emoji, freeAccess)}
                className={`relative bg-white border rounded-2xl p-3 text-center shadow-sm transition-all ${
                  locked
                    ? 'border-gray-100 opacity-70'
                    : 'border-gray-100 hover:border-[#155e63]/30 hover:shadow-md'
                }`}
              >
                {locked && (
                  <div className="absolute top-1.5 right-1.5">
                    <Lock className="w-3 h-3 text-gray-300" />
                  </div>
                )}
                <div className="text-2xl mb-1">{emoji}</div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{data.cityName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{data.cityNameCN}</p>
                {locked && (
                  <p className="text-[9px] text-[#155e63] mt-1 font-medium leading-tight">Unlock with Trip Pass</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('before.tipsTitle')}</h2>
        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.titleKey} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-[#155e63]/10 text-[#155e63] px-2 py-0.5 rounded-full font-medium">{t(tip.tagKey)}</span>
                <h3 className="font-semibold text-gray-800 text-sm">{t(tip.titleKey)}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{t(tip.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {selectedCity && (
        <CityModal
          city={selectedCity.city}
          emoji={selectedCity.emoji}
          onClose={() => setSelectedCity(null)}
        />
      )}
    </div>
  );
}
