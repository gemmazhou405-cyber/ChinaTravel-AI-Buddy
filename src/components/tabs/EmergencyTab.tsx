import { Phone, FileText, Heart, MapPin, Shield, ChevronRight, Building2, Pill, Siren } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCardCategorySection from '../PhraseCardCategorySection';
import { hospitalCards, pharmacyCards, policeCards } from '../../data/phraseCards';

const EMERGENCY_NUMBERS = [
  {
    number: '110',
    labelKey: 'emergency.numbers.police',
    sublabel: '警察 · Jǐngchá',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    ringColor: 'ring-red-200',
    descKey: 'emergency.numbers.policeDesc',
  },
  {
    number: '120',
    labelKey: 'emergency.numbers.ambulance',
    sublabel: '急救 · Jíjiù',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    ringColor: 'ring-orange-200',
    descKey: 'emergency.numbers.ambulanceDesc',
  },
  {
    number: '119',
    labelKey: 'emergency.numbers.fire',
    sublabel: '消防 · Xiāofáng',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    ringColor: 'ring-amber-200',
    descKey: 'emergency.numbers.fireDesc',
  },
];

function EmergencyCallButton({ number, labelKey, sublabel, color, hoverColor, ringColor, descKey }: typeof EMERGENCY_NUMBERS[0]) {
  const { t } = useTranslation();

  return (
    <a
      href={`tel:${number}`}
      className={`
        flex items-center gap-4 ${color} ${hoverColor} ring-4 ${ringColor}
        text-white rounded-2xl p-4 transition-all active:scale-95 shadow-lg shadow-black/10
      `}
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
      u.lang = 'zh-CN';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };
  const handleCopy = async () => {
    await navigator.clipboard?.writeText(zh);
    showToast(t('toast.copied'));
  };

  return (
    <div className={`border rounded-2xl p-4 ${color} cursor-pointer`} onClick={() => setOpen(true)}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <p className="text-gray-500 text-xs mb-2 leading-relaxed">{en}</p>
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <p className="text-gray-800 text-sm font-medium leading-relaxed">{zh}</p>
      </div>
      <div className="flex gap-2 mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            speakChinese(zh);
          }}
          className="text-xs text-[#155e63] flex items-center gap-1"
        >
          🔊 Speak
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="text-xs text-gray-400"
        >
          📋 Copy
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="ml-auto mb-4 block text-gray-400 text-xl">✕</button>
            <p className="text-sm font-semibold text-[#155e63] mb-5">{title}</p>
            <p className="text-4xl font-bold text-gray-950 leading-tight mb-4">{zh}</p>
            <p className="text-gray-500 text-base mb-6">{en}</p>
            <div className="flex gap-2">
              <button onClick={() => speakChinese(zh)} className="flex-1 bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium">🔊 Speak</button>
              <button onClick={handleCopy} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">📋 Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  showToast: (msg: string) => void;
}

export default function EmergencyTab({ showToast }: Props) {
  const { t } = useTranslation();

  const copyLocation = () => {
    const nav = window.navigator;
    if (nav.geolocation) {
      nav.geolocation.getCurrentPosition(
        (pos) => {
          const text = `我的位置：纬度${pos.coords.latitude.toFixed(4)}，经度${pos.coords.longitude.toFixed(4)}`;
          nav.clipboard?.writeText(text);
          alert('Location copied in Chinese!');
        },
        () => {
          nav.clipboard?.writeText('无法获取位置，请告诉救援人员您的地址。');
          alert('Could not get location. Generic message copied.');
        }
      );
    } else {
      nav.clipboard?.writeText('无法获取位置，请告诉救援人员您的地址。');
      alert('Could not get location. Generic message copied.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-700 font-semibold text-sm">{t('emergency.bannerTitle')}</p>
          <p className="text-red-500 text-xs mt-0.5 leading-relaxed">
            {t('emergency.bannerSub')}
          </p>
        </div>
      </div>

      {/* Call buttons */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('emergency.callTitle')}</h2>
        <div className="space-y-3">
          {EMERGENCY_NUMBERS.map((n) => (
            <EmergencyCallButton key={n.number} {...n} />
          ))}
        </div>
      </section>

      {/* Lost passport card */}
      <PhraseCard
        title={t('emergency.lostPassport')}
        icon={<FileText className="w-4 h-4 text-blue-500" />}
        en={t('emergency.embassyPhrase')}
        zh="请联系我的大使馆。我是外国公民，需要领事协助。"
        color="bg-blue-50 border-blue-200"
        showToast={showToast}
      />

      {/* Medical card */}
      <PhraseCard
        title={t('emergency.medical')}
        icon={<Heart className="w-4 h-4 text-red-500" />}
        en={t('emergency.medicalPhrase')}
        zh="请叫救护车。我需要紧急医疗救助。"
        color="bg-red-50 border-red-200"
        showToast={showToast}
      />

      <section className="space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Emergency Phrase Cards</h2>
        <PhraseCardCategorySection
          title="Hospital"
          icon={<Building2 className="w-4 h-4 text-[#155e63]" />}
          cards={hospitalCards}
          freeLimit={3}
        />
        <PhraseCardCategorySection
          title="Police"
          icon={<Siren className="w-4 h-4 text-[#155e63]" />}
          cards={policeCards}
          freeLimit={3}
        />
        <PhraseCardCategorySection
          title="Pharmacy"
          icon={<Pill className="w-4 h-4 text-[#155e63]" />}
          cards={pharmacyCards}
          freeLimit={3}
        />
      </section>

      {/* Location share */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#155e63]" />
          <h3 className="font-semibold text-gray-800 text-sm">{t('emergency.locationTitle')}</h3>
        </div>
        <p className="text-gray-500 text-xs mb-3 leading-relaxed">
          {t('emergency.locationSub')}
        </p>
        <button
          onClick={copyLocation}
          className="w-full bg-[#155e63] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#0e4a4e] transition-colors active:scale-95"
        >
          {t('emergency.locationBtn')}
        </button>
      </div>
    </div>
  );
}
