import { Phone, FileText, Heart, MapPin, Shield, ChevronRight, Building2, Pill, Siren, Lock, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import { emergencyCards, hospitalCards, pharmacyCards, policeCards } from '../../data/phraseCards';
import type { UserState } from '../../hooks/useAuth';
import { isTripOrGroup } from '../../lib/membership';

// Emergency kit data
import medicalCardsData from '../../data/emergencyKit/medicalCards.json';
import allergyCardsData from '../../data/emergencyKit/allergyCards.json';
import emergencyNumbersData from '../../data/emergencyKit/emergencyNumbers.json';
import lostDocumentsData from '../../data/emergencyKit/lostDocuments.json';
import embassyContactsData from '../../data/emergencyKit/embassyContacts.json';
import hospitalPhrasesData from '../../data/emergencyKit/hospitalPhrases.json';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface MedPhrase { id: string; english: string; chinese: string; pinyin: string; }
interface AllergyCard { id: string; allergen: string; english: string; chinese: string; pinyin: string; severity: string; }
interface EmergencyNumberEntry { service: string; number: string; chinese: string; notes: string; }
interface CityHotline { city: string; number: string; notes: string; }
interface EmergencyNumbersDataShape { id: string; national: EmergencyNumberEntry[]; cityHotlines: CityHotline[]; }
interface LostDocPhrase { english: string; chinese: string; pinyin: string; }
interface LostDocItem { type: string; steps: string[]; phrases: LostDocPhrase[]; }
interface LostDocDataShape { id: string; items: LostDocItem[]; }
interface Embassy { country: string; phone: string; emergency: string; address: string; }
interface EmbassyDataShape { id: string; disclaimer: string; embassies: Embassy[]; }
interface HospitalPhrase { id: string; section: string; english: string; chinese: string; pinyin: string; }

const emNumbers = emergencyNumbersData as unknown as EmergencyNumbersDataShape;
const lostDocs = lostDocumentsData as unknown as LostDocDataShape;
const embassyData = embassyContactsData as unknown as EmbassyDataShape;
const medPhrases = medicalCardsData as unknown as MedPhrase[];
const allergies = allergyCardsData as unknown as AllergyCard[];
const hospitalPhrases = hospitalPhrasesData as unknown as HospitalPhrase[];

const KIT_CATEGORIES = [
  { id: 'medical', emoji: '💊', title: 'Medical Phrases', description: 'Show to doctors & paramedics', free: true },
  { id: 'allergy', emoji: '⚠️', title: 'Allergy Cards', description: 'Show at restaurants', free: true },
  { id: 'numbers', emoji: '📞', title: 'Emergency Numbers', description: 'National & city hotlines', free: true },
  { id: 'lost', emoji: '📄', title: 'Lost Documents', description: 'Steps if passport or cards lost', free: true },
  { id: 'embassy', emoji: '🏛️', title: 'Embassy Contacts', description: 'Embassy phones & addresses', free: false },
  { id: 'hospital', emoji: '🏥', title: 'Hospital Phrases', description: 'Communicate with hospital staff', free: false },
];

// ── Existing component data ──────────────────────────────────────────────────

const EMERGENCY_NUMBERS = [
  { number: '110', labelKey: 'emergency.numbers.police', sublabel: '警察 · Jǐngchá', color: 'bg-red-500', hoverColor: 'hover:bg-red-600', ringColor: 'ring-red-200', descKey: 'emergency.numbers.policeDesc' },
  { number: '120', labelKey: 'emergency.numbers.ambulance', sublabel: '急救 · Jíjiù', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600', ringColor: 'ring-orange-200', descKey: 'emergency.numbers.ambulanceDesc' },
  { number: '119', labelKey: 'emergency.numbers.fire', sublabel: '消防 · Xiāofáng', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600', ringColor: 'ring-amber-200', descKey: 'emergency.numbers.fireDesc' },
];

function EmergencyCallButton({ number, labelKey, sublabel, color, hoverColor, ringColor, descKey }: typeof EMERGENCY_NUMBERS[0]) {
  const { t } = useTranslation();
  return (
    <a
      href={`tel:${number}`}
      className={`flex items-center gap-4 ${color} ${hoverColor} ring-4 ${ringColor} text-white rounded-2xl p-4 transition-all active:scale-95 shadow-lg shadow-black/10`}
    >
      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Phone className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{number}</span>
          <span className="font-semibold text-sm opacity-90">{t(labelKey)}</span>
        </div>
        <p className="text-white/70 text-xs">{sublabel}</p>
        <p className="text-white/60 text-xs mt-0.5 leading-tight">{t(descKey)}</p>
      </div>
      <ChevronRight className="w-5 h-5 opacity-50 flex-shrink-0" />
    </a>
  );
}

function PhraseCard({ title, icon, en, zh, color, showToast }: { title: string; icon: React.ReactNode; en: string; zh: string; color: string; showToast: (msg: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };
  const handleCopy = async () => {
    await navigator.clipboard?.writeText(zh);
    showToast(t('toast.copied'));
  };
  return (
    <div className={`border rounded-2xl p-4 ${color} cursor-pointer`} onClick={() => setOpen(true)}>
      <div className="flex items-center gap-2 mb-3">{icon}<h3 className="font-semibold text-gray-800 text-sm">{title}</h3></div>
      <p className="text-gray-500 text-xs mb-2 leading-relaxed">{en}</p>
      <div className="bg-white rounded-xl p-3 shadow-sm"><p className="text-gray-800 text-sm font-medium leading-relaxed">{zh}</p></div>
      <div className="flex gap-2 mt-1">
        <button onClick={(e) => { e.stopPropagation(); speakChinese(zh); }} className="text-xs text-[#155e63] flex items-center gap-1">🔊 {t('common.speak')}</button>
        <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="text-xs text-gray-400">📋 {t('common.copy')}</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="ml-auto mb-4 block text-gray-400 text-xl">✕</button>
            <p className="text-sm font-semibold text-[#155e63] mb-5">{title}</p>
            <p className="text-4xl font-bold text-gray-950 leading-tight mb-4">{zh}</p>
            <p className="text-gray-500 text-base mb-6">{en}</p>
            <div className="flex gap-2">
              <button onClick={() => speakChinese(zh)} className="flex-1 bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium">🔊 {t('common.speak')}</button>
              <button onClick={handleCopy} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">📋 {t('common.copy')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Emergency Kit modal content ──────────────────────────────────────────────

function KitBottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onClose}>
      <div className="bg-gray-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function PhraseRow({ english, chinese, pinyin, speak, copy }: { english: string; chinese: string; pinyin: string; speak: (t: string) => void; copy: (t: string) => void }) {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm">
      <p className="text-xs text-gray-400 mb-0.5">{english}</p>
      <p className="text-sm font-medium text-gray-900">{chinese}</p>
      <p className="text-xs text-gray-400 mt-0.5">{pinyin}</p>
      <div className="flex gap-3 mt-1.5">
        <button onClick={() => speak(chinese)} className="text-xs text-[#155e63]">🔊 Speak</button>
        <button onClick={() => copy(chinese)} className="text-xs text-gray-400">📋 Copy</button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

export default function EmergencyTab({ userState, showToast, onAskBuddy, onUpgradeClick, deepTool, onToolOpened }: Props) {
  const { t } = useTranslation();
  const hasFullAccess = isTripOrGroup(userState);
  const [kitModal, setKitModal] = useState<string | null>(null);

  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    showToast(t('toast.copied'));
  };

  const copyEmergencyText = async (text: string, successMessage: string) => {
    try {
      await window.navigator.clipboard?.writeText(text);
      showToast(successMessage);
    } catch {
      showToast(t('emergency.copyFailed'));
    }
  };

  const copyLocation = () => {
    const nav = window.navigator;
    const fallbackText = [
      'I need help, but my browser could not share my GPS location. Please help me explain my current address to emergency services.',
      '我需要帮助，但浏览器无法分享我的GPS位置。请帮我向救援人员说明我现在的地址。',
    ].join('\n');
    if (nav.geolocation) {
      nav.geolocation.getCurrentPosition(
        (pos) => {
          const text = [
            `My current location: latitude ${pos.coords.latitude.toFixed(4)}, longitude ${pos.coords.longitude.toFixed(4)}.`,
            `我的位置：纬度${pos.coords.latitude.toFixed(4)}，经度${pos.coords.longitude.toFixed(4)}。`,
            'Please help me contact emergency services if needed.',
            '如有需要，请帮我联系救援人员。',
          ].join('\n');
          copyEmergencyText(text, t('emergency.locationCopied'));
        },
        () => { copyEmergencyText(fallbackText, t('emergency.locationBlocked')); }
      );
    } else {
      copyEmergencyText(fallbackText, t('emergency.locationUnavailable'));
    }
  };

  // Group hospital phrases by section
  const hospitalSections = hospitalPhrases.reduce<Record<string, HospitalPhrase[]>>((acc, p) => {
    if (!acc[p.section]) acc[p.section] = [];
    acc[p.section].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <TabSectionHeader title={t('tabs.emergency')} subtitle={t('tabHeaders.emergency')} onAskBuddy={onAskBuddy} />

      {/* Emergency Kit */}
      <section className="overflow-hidden rounded-[1.65rem] border border-white/60 bg-white/[0.48] shadow-[0_18px_46px_rgba(11,63,67,0.08)] backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/60">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#155e63]/10 text-[#155e63]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-gray-950">Emergency Kit</h2>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-gray-500">Cards and info to have ready before you need them</p>
          </div>
        </div>
        <div className="px-4 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KIT_CATEGORIES.map((cat) => {
              const locked = !cat.free && !hasFullAccess;
              return (
                <button
                  key={cat.id}
                  onClick={() => locked ? onUpgradeClick('Unlock Embassy Contacts and Hospital Phrases with Trip Pass.') : setKitModal(cat.id)}
                  className={`relative bg-white rounded-2xl p-3.5 border shadow-sm text-left transition-all ${locked ? 'border-gray-100 opacity-75' : 'border-gray-100 hover:border-[#155e63]/30 hover:shadow-md'}`}
                >
                  {locked && <Lock className="absolute top-2 right-2 w-3 h-3 text-gray-300" />}
                  <span className="text-2xl">{cat.emoji}</span>
                  <p className="text-xs font-semibold text-gray-800 mt-1.5 leading-tight">{cat.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{cat.description}</p>
                  {locked && <p className="text-[9px] text-[#155e63] font-medium mt-1.5">Trip Pass only</p>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Warning banner */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-700 font-semibold text-sm">{t('emergency.bannerTitle')}</p>
          <p className="text-red-500 text-xs mt-0.5 leading-relaxed">{t('emergency.bannerSub')}</p>
        </div>
      </div>

      {/* Call buttons */}
      <section id="tool-emergency-numbers" className="scroll-mt-20">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('emergency.callTitle')}</h2>
        <div className="space-y-3">
          {EMERGENCY_NUMBERS.map((n) => <EmergencyCallButton key={n.number} {...n} />)}
        </div>
      </section>

      {/* Core action cards */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">{t('emergency.coreHelp')}</h2>
        <PhraseCard title={t('emergency.lostPassportPhone')} icon={<FileText className="w-4 h-4 text-blue-500" />} en={t('emergency.embassyPhrase')} zh="请联系我的大使馆。我是外国公民，需要领事协助。" color="bg-blue-50 border-blue-200" showToast={showToast} />
        <PhraseCard title={t('emergency.lostPhone')} icon={<FileText className="w-4 h-4 text-indigo-500" />} en={t('emergency.lostPhonePhrase')} zh="我的手机丢了。请帮我联系警察或酒店。" color="bg-indigo-50 border-indigo-200" showToast={showToast} />
        <PhraseCard title={t('emergency.medical')} icon={<Heart className="w-4 h-4 text-red-500" />} en={t('emergency.medicalPhrase')} zh="请叫救护车。我需要紧急医疗救助。" color="bg-red-50 border-red-200" showToast={showToast} />
      </section>

      {/* Location share */}
      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#155e63]" />
          <h3 className="font-semibold text-gray-800 text-sm">{t('emergency.locationTitle')}</h3>
        </div>
        <p className="text-gray-500 text-xs mb-3 leading-relaxed">{t('emergency.locationSub')}</p>
        <button onClick={copyLocation} className="w-full bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#0e4a4e] transition-colors active:scale-95">
          {t('emergency.locationBtn')}
        </button>
      </div>

      <PhraseCategoryAccordion
        categories={[
          { id: 'emergency', title: t('emergency.emergencyPhrases'), subtitle: t('emergency.emergencyCardsSubtitle', { count: emergencyCards.length }), icon: <Shield className="w-4 h-4" />, cards: emergencyCards },
          { id: 'hospital', title: t('emergency.hospital'), subtitle: t('emergency.hospitalCardsSubtitle', { count: hospitalCards.length }), icon: <Building2 className="w-4 h-4" />, cards: hospitalCards },
          { id: 'police', title: t('emergency.police'), subtitle: t('emergency.policeCardsSubtitle', { count: policeCards.length }), icon: <Siren className="w-4 h-4" />, cards: policeCards },
          { id: 'pharmacy', title: t('emergency.pharmacy'), subtitle: t('emergency.pharmacyCardsSubtitle', { count: pharmacyCards.length }), icon: <Pill className="w-4 h-4" />, cards: pharmacyCards },
        ]}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
        initialOpenId={deepTool === 'hospital' ? 'hospital' : deepTool === 'police' ? 'police' : deepTool === 'lost' ? 'emergency' : null}
        onCategoryOpen={(category) => onToolOpened?.(category)}
      />

      {/* Kit modals */}
      {kitModal === 'medical' && (
        <KitBottomSheet title="Medical Phrases" onClose={() => setKitModal(null)}>
          <p className="text-xs text-[#155e63] font-medium mb-3">Show these to doctors or paramedics</p>
          <div className="space-y-2">
            {medPhrases.map((p) => <PhraseRow key={p.id} english={p.english} chinese={p.chinese} pinyin={p.pinyin} speak={speakChinese} copy={copyText} />)}
          </div>
        </KitBottomSheet>
      )}

      {kitModal === 'allergy' && (
        <KitBottomSheet title="Allergy Cards" onClose={() => setKitModal(null)}>
          <p className="text-xs text-[#155e63] font-medium mb-3">Show these to restaurant staff before ordering</p>
          <div className="space-y-2">
            {allergies.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-900">{a.allergen}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.severity === 'severe' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.severity}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{a.english}</p>
                <p className="text-sm font-medium text-gray-900">{a.chinese}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.pinyin}</p>
                <div className="flex gap-3 mt-1.5">
                  <button onClick={() => speakChinese(a.chinese)} className="text-xs text-[#155e63]">🔊 Speak</button>
                  <button onClick={() => copyText(a.chinese)} className="text-xs text-gray-400">📋 Copy</button>
                </div>
              </div>
            ))}
          </div>
        </KitBottomSheet>
      )}

      {kitModal === 'numbers' && (
        <KitBottomSheet title="Emergency Numbers" onClose={() => setKitModal(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">National Numbers</p>
              <div className="space-y-2">
                {emNumbers.national.map((n) => (
                  <a key={n.service} href={`tel:${n.number}`} className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm">
                    <span className="text-2xl font-bold text-red-500">{n.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{n.service} <span className="text-gray-400 font-normal">· {n.chinese}</span></p>
                      <p className="text-xs text-gray-400 leading-snug mt-0.5">{n.notes}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">City Hotlines</p>
              <div className="space-y-2">
                {emNumbers.cityHotlines.map((h) => (
                  <div key={h.city} className="bg-white rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-gray-800">{h.city}</p>
                      <a href={`tel:${h.number}`} className="text-sm font-bold text-[#155e63]">{h.number}</a>
                    </div>
                    <p className="text-xs text-gray-400 leading-snug">{h.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </KitBottomSheet>
      )}

      {kitModal === 'lost' && (
        <KitBottomSheet title="Lost Documents" onClose={() => setKitModal(null)}>
          <div className="space-y-4">
            {lostDocs.items.map((doc) => (
              <div key={doc.type}>
                <p className="text-xs font-semibold text-[#155e63] uppercase tracking-wide mb-2">{doc.type}</p>
                <div className="bg-white rounded-2xl p-3.5 shadow-sm mb-2">
                  <ol className="space-y-1.5">
                    {doc.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-600">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-[#155e63]/10 text-[#155e63] text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                {doc.phrases.length > 0 && (
                  <div className="space-y-1.5">
                    {doc.phrases.map((p, i) => (
                      <PhraseRow key={i} english={p.english} chinese={p.chinese} pinyin={p.pinyin} speak={speakChinese} copy={copyText} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </KitBottomSheet>
      )}

      {kitModal === 'embassy' && (
        <KitBottomSheet title="Embassy Contacts" onClose={() => setKitModal(null)}>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3 leading-relaxed">{embassyData.disclaimer} — Verify before travel.</p>
          <div className="space-y-2">
            {embassyData.embassies.map((e) => (
              <div key={e.country} className="bg-white rounded-2xl p-3.5 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-1.5">{e.country}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Phone: </span>{e.phone}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Emergency: </span>{e.emergency}</p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">{e.address}</p>
              </div>
            ))}
          </div>
        </KitBottomSheet>
      )}

      {kitModal === 'hospital' && (
        <KitBottomSheet title="Hospital Phrases" onClose={() => setKitModal(null)}>
          <p className="text-xs text-[#155e63] font-medium mb-3">Show these to hospital staff — tap to speak or copy</p>
          <div className="space-y-4">
            {Object.entries(hospitalSections).map(([section, phrases]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{section}</p>
                <div className="space-y-1.5">
                  {phrases.map((p) => (
                    <PhraseRow key={p.id} english={p.english} chinese={p.chinese} pinyin={p.pinyin} speak={speakChinese} copy={copyText} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </KitBottomSheet>
      )}
    </div>
  );
}
