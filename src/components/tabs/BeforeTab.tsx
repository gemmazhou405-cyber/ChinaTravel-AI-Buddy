import { CheckCircle, Circle, Wifi, CreditCard, Smartphone, FileText, ChevronRight, Lock, X, MapPin, Train, Globe, BookOpen, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import type { CityPack } from '../../types/cityPack';
import { isTripOrGroup } from '../../lib/membership';
import TabSectionHeader from '../TabSectionHeader';
import CitySurvivalPack from '../CitySurvivalPack';
import ToolDisclosure from '../ToolDisclosure';

// City pack imports
import shanghaiData from '../../data/cityPacks/shanghai.json';
import beijingData from '../../data/cityPacks/beijing.json';
import chengduData from '../../data/cityPacks/chengdu.json';
import chongqingData from '../../data/cityPacks/chongqing.json';
import guangzhouData from '../../data/cityPacks/guangzhou.json';
import hangzhouData from '../../data/cityPacks/hangzhou.json';
import shenzhenData from '../../data/cityPacks/shenzhen.json';
import suzhouData from '../../data/cityPacks/suzhou.json';
import xianData from '../../data/cityPacks/xian.json';

// Before You Go checklists
import documentsData from '../../data/beforeYouGo/documents.json';
import paymentsData from '../../data/beforeYouGo/payments.json';
import appsData from '../../data/beforeYouGo/apps.json';
import healthData from '../../data/beforeYouGo/health.json';
import connectivityData from '../../data/beforeYouGo/connectivity.json';
import packingData from '../../data/beforeYouGo/packing.json';

// Visa guides
import usVisa from '../../data/visaGuides/us.json';
import ukVisa from '../../data/visaGuides/uk.json';
import caVisa from '../../data/visaGuides/ca.json';
import auVisa from '../../data/visaGuides/au.json';
import frVisa from '../../data/visaGuides/fr.json';
import deVisa from '../../data/visaGuides/de.json';
import esVisa from '../../data/visaGuides/es.json';
import itVisa from '../../data/visaGuides/it.json';
import jpVisa from '../../data/visaGuides/jp.json';
import krVisa from '../../data/visaGuides/kr.json';

// Culture guides
import etiquetteGuide from '../../data/cultureGuides/etiquette.json';
import diningGuide from '../../data/cultureGuides/dining.json';
import transportGuide from '../../data/cultureGuides/transport.json';
import shoppingGuide from '../../data/cultureGuides/shopping.json';
import socialNormsGuide from '../../data/cultureGuides/socialNorms.json';
import religionGuide from '../../data/cultureGuides/religion.json';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface ChecklistItem { id: string; task: string; detail: string; priority: string; }
interface ChecklistCategory { id: string; title: string; description: string; items: ChecklistItem[]; }

interface VisaStep { step: number; title: string; detail: string; }
interface CustomsRule { item: string; limit: string; }
interface VisaGuide {
  id: string; country: string; disclaimer: string; visaRequired: boolean;
  visaFreeNote?: string; applicationSteps: VisaStep[]; requiredDocuments: string[];
  arrivalTips: string[]; customsRules: CustomsRule[];
}

interface CultureTip { id: string; tip: string; detail: string; do: boolean; }
interface CultureGuide { id: string; title: string; tips: CultureTip[]; }

interface EssentialApp { name: string; purpose: string; tip: string; }

// ── Static data ─────────────────────────────────────────────────────────────

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

const BEFORE_YOU_GO_CATS: { id: string; emoji: string; label: string; data: ChecklistCategory; free: boolean }[] = [
  { id: 'documents', emoji: '📄', label: 'Documents', data: documentsData as unknown as ChecklistCategory, free: true },
  { id: 'apps', emoji: '📱', label: 'Apps', data: appsData as unknown as ChecklistCategory, free: true },
  { id: 'payments', emoji: '💳', label: 'Payments', data: paymentsData as unknown as ChecklistCategory, free: false },
  { id: 'health', emoji: '🏥', label: 'Health', data: healthData as unknown as ChecklistCategory, free: false },
  { id: 'connectivity', emoji: '📡', label: 'Connectivity', data: connectivityData as unknown as ChecklistCategory, free: false },
  { id: 'packing', emoji: '🎒', label: 'Packing', data: packingData as unknown as ChecklistCategory, free: false },
];

const VISA_COUNTRIES: { id: string; flag: string; label: string; data: VisaGuide; free: boolean }[] = [
  { id: 'us', flag: '🇺🇸', label: 'US', data: usVisa as unknown as VisaGuide, free: true },
  { id: 'uk', flag: '🇬🇧', label: 'UK', data: ukVisa as unknown as VisaGuide, free: true },
  { id: 'ca', flag: '🇨🇦', label: 'Canada', data: caVisa as unknown as VisaGuide, free: false },
  { id: 'au', flag: '🇦🇺', label: 'Australia', data: auVisa as unknown as VisaGuide, free: false },
  { id: 'fr', flag: '🇫🇷', label: 'France', data: frVisa as unknown as VisaGuide, free: false },
  { id: 'de', flag: '🇩🇪', label: 'Germany', data: deVisa as unknown as VisaGuide, free: false },
  { id: 'es', flag: '🇪🇸', label: 'Spain', data: esVisa as unknown as VisaGuide, free: false },
  { id: 'it', flag: '🇮🇹', label: 'Italy', data: itVisa as unknown as VisaGuide, free: false },
  { id: 'jp', flag: '🇯🇵', label: 'Japan', data: jpVisa as unknown as VisaGuide, free: false },
  { id: 'kr', flag: '🇰🇷', label: 'Korea', data: krVisa as unknown as VisaGuide, free: false },
];

const CULTURE_CATEGORIES: { id: string; emoji: string; label: string; data: CultureGuide }[] = [
  { id: 'etiquette', emoji: '🤝', label: 'Etiquette', data: etiquetteGuide as unknown as CultureGuide },
  { id: 'dining', emoji: '🍜', label: 'Dining', data: diningGuide as unknown as CultureGuide },
  { id: 'transport', emoji: '🚇', label: 'Transport', data: transportGuide as unknown as CultureGuide },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping', data: shoppingGuide as unknown as CultureGuide },
  { id: 'socialNorms', emoji: '👥', label: 'Social Norms', data: socialNormsGuide as unknown as CultureGuide },
  { id: 'religion', emoji: '🙏', label: 'Religious Sites', data: religionGuide as unknown as CultureGuide },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function CityModal({ city, emoji, onClose }: { city: CityPack; emoji: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onClose}>
      <div className="bg-gray-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <div className="text-3xl mb-1">{emoji}</div>
            <h3 className="text-lg font-bold text-gray-900">{city.cityName}</h3>
            <p className="text-sm text-gray-400">{city.cityNameCN}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4"><CitySurvivalPack city={city} /></div>
      </div>
    </div>
  );
}

function BottomSheet({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onClose}>
      <div className="bg-gray-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function TipRow({ tip }: { tip: CultureTip }) {
  return (
    <div className="pt-2.5 border-t border-gray-50 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-2 mb-1">
        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tip.do ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {tip.do ? '✓ Do' : '✕ Don\'t'}
        </span>
        <p className="text-xs font-medium text-gray-800 leading-snug">{tip.tip}</p>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed pl-0">{tip.detail}</p>
    </div>
  );
}

function VisaContent({ data }: { data: VisaGuide }) {
  return (
    <div className="space-y-3">
      <div className={`rounded-2xl p-3 text-center border ${data.visaRequired ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
        <p className={`text-sm font-bold ${data.visaRequired ? 'text-amber-700' : 'text-green-700'}`}>
          {data.visaRequired ? '⚠️ Visa Required' : '✅ Visa-Free Entry May Apply'}
        </p>
        {data.visaFreeNote && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{data.visaFreeNote}</p>}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-3">Application Steps</p>
        <div className="space-y-2.5">
          {data.applicationSteps.map((s) => (
            <div key={s.step} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#155e63]/10 text-[#155e63] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">Required Documents</p>
        <ul className="space-y-1.5">
          {data.requiredDocuments.map((doc, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-gray-500"><span className="text-[#155e63] shrink-0">•</span>{doc}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">Arrival Tips</p>
        <ul className="space-y-1.5">
          {data.arrivalTips.map((tip, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-gray-500"><span className="text-[#155e63] shrink-0">•</span>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">Customs Rules</p>
        <div className="space-y-2">
          {data.customsRules.map((rule, i) => (
            <div key={i}>
              <p className="text-xs font-medium text-gray-700">{rule.item}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{rule.limit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

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
  const [checklistModal, setChecklistModal] = useState<ChecklistCategory | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [openCultureId, setOpenCultureId] = useState<string | null>(null);

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

  const visaData = selectedVisa ? (VISA_COUNTRIES.find((c) => c.id === selectedVisa)?.data ?? null) : null;

  return (
    <div className="space-y-6">
      <TabSectionHeader title={t('tabs.before')} subtitle={t('tabHeaders.before')} onAskBuddy={onAskBuddy} />

      {/* Quick Checklist */}
      <ToolDisclosure
        id="tool-checklist"
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
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50 ${i !== CHECKLIST.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className={`flex-shrink-0 transition-colors ${done ? 'text-[#155e63]' : 'text-gray-300'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t(item.labelKey)}</p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{t(item.sublabelKey)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </ToolDisclosure>

      {/* Essential Apps */}
      <ToolDisclosure
        id="tool-apps"
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
                <span className="rounded-full bg-[#155e63]/10 px-2 py-0.5 text-[10px] font-semibold text-[#155e63]">{t('before.essentialApps.badge')}</span>
              </div>
              <p className="mt-1 text-xs font-medium leading-relaxed text-gray-600">{app.purpose}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">{app.tip}</p>
            </div>
          ))}
        </div>
      </ToolDisclosure>

      {/* Payment Basics */}
      <ToolDisclosure
        id="tool-payment"
        title={t('journey.before.payment')}
        subtitle={t('journey.before.paymentNote')}
        icon={<CreditCard className="w-4 h-4" />}
        defaultOpen={deepTool === 'payment'}
        onOpen={() => onToolOpened?.('payment')}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(t('before.paymentBasics.items', { returnObjects: true }) as string[]).map((item) => (
            <div key={item} className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs font-medium leading-relaxed text-gray-600 shadow-sm">{item}</div>
          ))}
        </div>
      </ToolDisclosure>

      {/* Transport Basics */}
      <ToolDisclosure
        id="tool-transport"
        title={t('journey.before.transport')}
        subtitle={t('journey.before.transportNote')}
        icon={<Train className="w-4 h-4" />}
        defaultOpen={deepTool === 'transport'}
        onOpen={() => onToolOpened?.('transport')}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(t('before.transportBasics.items', { returnObjects: true }) as string[]).map((item) => (
            <div key={item} className="rounded-2xl border border-white/70 bg-white/70 p-3 text-xs font-medium leading-relaxed text-gray-600 shadow-sm">{item}</div>
          ))}
        </div>
      </ToolDisclosure>

      {/* City Survival Guides */}
      <ToolDisclosure
        id="tool-city"
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
                className={`relative bg-white border rounded-2xl p-3 text-center shadow-sm transition-all ${locked ? 'border-gray-100 opacity-70' : 'border-gray-100 hover:border-[#155e63]/30 hover:shadow-md'}`}
              >
                {locked && <div className="absolute top-1.5 right-1.5"><Lock className="w-3 h-3 text-gray-300" /></div>}
                <div className="text-2xl mb-1">{emoji}</div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{data.cityName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{data.cityNameCN}</p>
                {locked && <p className="text-[9px] text-[#155e63] mt-1 font-medium leading-tight">{t('common.unlockWithTrip')}</p>}
              </button>
            );
          })}
        </div>
      </ToolDisclosure>

      {/* Pre-Trip Checklist */}
      <ToolDisclosure
        title="Pre-Trip Checklist"
        subtitle="6 essential categories — complete before departure"
        icon={<ClipboardList className="w-4 h-4" />}
        defaultOpen={deepTool === 'pretrip'}
        onOpen={() => onToolOpened?.('pretrip')}
      >
        <div className="grid grid-cols-2 gap-2">
          {BEFORE_YOU_GO_CATS.map((cat) => {
            const locked = !cat.free && !hasFullAccess;
            return (
              <button
                key={cat.id}
                onClick={() => locked ? onUpgradeClick('Unlock all pre-trip checklists with Trip Pass.') : setChecklistModal(cat.data)}
                className={`relative bg-white rounded-2xl p-3.5 border shadow-sm text-left transition-all ${locked ? 'border-gray-100 opacity-75' : 'border-gray-100 hover:border-[#155e63]/30 hover:shadow-md'}`}
              >
                {locked && <Lock className="absolute top-2 right-2 w-3 h-3 text-gray-300" />}
                <span className="text-2xl">{cat.emoji}</span>
                <p className="text-sm font-semibold text-gray-800 mt-1.5 leading-tight">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.data.items.length} tasks</p>
                {locked && <p className="text-[9px] text-[#155e63] font-medium mt-1.5">Unlock with Trip Pass</p>}
              </button>
            );
          })}
        </div>
      </ToolDisclosure>

      {/* Visa & Entry Guide */}
      <ToolDisclosure
        title="Visa & Entry Guide"
        subtitle="Requirements by nationality — select your passport"
        icon={<Globe className="w-4 h-4" />}
        defaultOpen={deepTool === 'visa'}
        onOpen={() => onToolOpened?.('visa')}
      >
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-4">
          <p className="text-xs text-amber-700 leading-relaxed">Visa policies change frequently. Always verify current requirements with the official Chinese Embassy or Consulate before traveling.</p>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {VISA_COUNTRIES.map((c) => {
            const locked = !c.free && !hasFullAccess;
            const active = selectedVisa === c.id;
            return (
              <button
                key={c.id}
                onClick={() => locked ? onUpgradeClick('Unlock all 10 visa guides with Trip Pass.') : setSelectedVisa(active ? null : c.id)}
                className={`relative flex flex-col items-center p-2 rounded-xl border transition-all ${active ? 'border-[#155e63] bg-[#155e63]/5' : 'border-gray-100 bg-white'} ${locked ? 'opacity-60' : 'hover:border-[#155e63]/30'}`}
              >
                {locked && <Lock className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-gray-300" />}
                <span className="text-xl">{c.flag}</span>
                <span className="text-[9px] text-gray-600 font-medium mt-0.5 leading-tight text-center">{c.label}</span>
              </button>
            );
          })}
        </div>

        {visaData && <VisaContent data={visaData} />}
      </ToolDisclosure>

      {/* Culture Guide */}
      <ToolDisclosure
        title="China Culture Guide"
        subtitle="Do's and don'ts for respectful travel"
        icon={<BookOpen className="w-4 h-4" />}
        defaultOpen={deepTool === 'culture'}
        onOpen={() => onToolOpened?.('culture')}
      >
        <div className="space-y-1">
          {CULTURE_CATEGORIES.map((cat) => {
            const isOpen = openCultureId === cat.id;
            const freeTips = cat.data.tips.slice(0, 3);
            const lockedTips = cat.data.tips.slice(3);
            return (
              <div key={cat.id} className="rounded-2xl bg-white/70 border border-white/60 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenCultureId(isOpen ? null : cat.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/40 transition-colors"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <p className="flex-1 text-sm font-semibold text-gray-800">{cat.label}</p>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-0 border-t border-gray-50">
                    {freeTips.map((tip) => <TipRow key={tip.id} tip={tip} />)}

                    {lockedTips.length > 0 && (
                      hasFullAccess
                        ? lockedTips.map((tip) => <TipRow key={tip.id} tip={tip} />)
                        : (
                          <button
                            onClick={() => onUpgradeClick('Unlock all culture guide tips with Trip Pass.')}
                            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#155e63]/25 p-2.5 text-xs text-[#155e63] hover:bg-[#155e63]/5 transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            +{lockedTips.length} more tips — Unlock with Trip Pass
                          </button>
                        )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ToolDisclosure>

      {/* Modals */}
      {selectedCity && (
        <CityModal city={selectedCity.city} emoji={selectedCity.emoji} onClose={() => setSelectedCity(null)} />
      )}

      {checklistModal && (
        <BottomSheet title={checklistModal.title} subtitle={checklistModal.description} onClose={() => setChecklistModal(null)}>
          <div className="space-y-2">
            {checklistModal.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-800 leading-snug flex-1">{item.task}</p>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    item.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{item.priority}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
