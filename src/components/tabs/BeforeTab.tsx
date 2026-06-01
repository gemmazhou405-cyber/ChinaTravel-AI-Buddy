import { CheckCircle, Circle, Wifi, CreditCard, Smartphone, FileText, ChevronRight, Lock, X, MapPin, Train } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import type { CityPack } from '../../types/cityPack';
import { isTripOrGroup } from '../../lib/membership';
import TabSectionHeader from '../TabSectionHeader';
import CitySurvivalPack from '../CitySurvivalPack';
import ToolDisclosure from '../ToolDisclosure';

import shanghaiData from '../../data/cityPacks/shanghai.json';
import beijingData from '../../data/cityPacks/beijing.json';
import chengduData from '../../data/cityPacks/chengdu.json';
import chongqingData from '../../data/cityPacks/chongqing.json';
import guangzhouData from '../../data/cityPacks/guangzhou.json';
import hangzhouData from '../../data/cityPacks/hangzhou.json';
import shenzhenData from '../../data/cityPacks/shenzhen.json';
import suzhouData from '../../data/cityPacks/suzhou.json';
import xianData from '../../data/cityPacks/xian.json';

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

interface EssentialApp {
  name: string;
  purpose: string;
  tip: string;
}

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

        <div className="p-4">
          <CitySurvivalPack city={city} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  userState: UserState | null;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

export default function BeforeTab({ userState, onAskBuddy, onUpgradeClick, deepTool, onToolOpened }: Props) {
  const { t } = useTranslation();
  const hasFullAccess = isTripOrGroup(userState);
  const [selectedCity, setSelectedCity] = useState<{ city: CityPack; emoji: string } | null>(null);
  const essentialApps = t('before.essentialApps.items', { returnObjects: true }) as EssentialApp[];
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
      onUpgradeClick(t('before.cityUnlockToast'));
      return;
    }
    setSelectedCity({ city, emoji });
  };

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title={t('tabs.before')}
        subtitle={t('tabHeaders.before')}
        onAskBuddy={onAskBuddy}
      />

      <ToolDisclosure
        title={t('journey.before.checklist')}
        subtitle={t('journey.before.checklistNote')}
        icon={<CheckCircle className="w-4 h-4" />}
        defaultOpen={deepTool === 'checklist'}
        onOpen={() => onToolOpened?.('checklist')}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">{t('before.title')}</h2>
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
      </ToolDisclosure>

      <ToolDisclosure
        title={t('journey.before.apps')}
        subtitle={t('journey.before.appsNote')}
        icon={<Smartphone className="w-4 h-4" />}
        defaultOpen={deepTool === 'apps'}
        onOpen={() => onToolOpened?.('apps')}
      >
        <div className="space-y-2.5">
          {essentialApps.map((app) => (
            <div key={app.name} className="rounded-2xl border border-white/70 bg-white/70 p-3.5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-gray-950">{app.name}</p>
                <span className="rounded-full bg-[#155e63]/10 px-2 py-0.5 text-[10px] font-semibold text-[#155e63]">
                  {t('before.essentialApps.badge')}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium leading-relaxed text-gray-600">{app.purpose}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">{app.tip}</p>
            </div>
          ))}
        </div>
      </ToolDisclosure>

      <ToolDisclosure
        title={t('journey.before.payment')}
        subtitle={t('journey.before.paymentNote')}
        icon={<CreditCard className="w-4 h-4" />}
        defaultOpen={deepTool === 'payment'}
        onOpen={() => onToolOpened?.('payment')}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(t('before.paymentBasics.items', { returnObjects: true }) as string[]).map((item) => (
            <div key={item} className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs font-medium leading-relaxed text-gray-600 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </ToolDisclosure>

      <ToolDisclosure
        title={t('journey.before.transport')}
        subtitle={t('journey.before.transportNote')}
        icon={<Train className="w-4 h-4" />}
        defaultOpen={deepTool === 'transport'}
        onOpen={() => onToolOpened?.('transport')}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(t('before.transportBasics.items', { returnObjects: true }) as string[]).map((item) => (
            <div key={item} className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs font-medium leading-relaxed text-gray-600 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </ToolDisclosure>

      {/* City Survival Guides */}
      <ToolDisclosure
        title={t('journey.before.cityGuides')}
        subtitle={t('journey.before.cityGuidesNote')}
        icon={<MapPin className="w-4 h-4" />}
        defaultOpen={deepTool === 'city'}
        onOpen={() => onToolOpened?.('city')}
      >
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
                  <p className="text-[9px] text-[#155e63] mt-1 font-medium leading-tight">{t('common.unlockWithTrip')}</p>
                )}
              </button>
            );
          })}
        </div>
      </ToolDisclosure>

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
