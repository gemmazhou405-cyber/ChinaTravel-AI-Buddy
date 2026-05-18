import { Building2, MapPin, Wifi, Key, MessageSquare, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCardCategorySection from '../PhraseCardCategorySection';
import { hotelCards } from '../../data/phraseCards';
import type { UserState } from '../../hooks/useAuth';
import AskBuddyHint from '../AskBuddyHint';
import { isGroup, isTripOrGroup } from '../../lib/membership';

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
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
}

export default function StayTab({ userState, showToast, onAskBuddy, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const [selectedPhrase, setSelectedPhrase] = useState<(typeof HOTEL_PHRASES)[number] | null>(null);
  const [customPhrase, setCustomPhrase] = useState('');
  const [showCustomResult, setShowCustomResult] = useState(false);
  const [showCustomLocal, setShowCustomLocal] = useState(false);
  const customPhraseCard = {
    english: 'What time is the latest checkout?',
    chinese: '请问我最晚几点退房？',
    pinyin: 'Qǐngwèn wǒ zuì wǎn jǐ diǎn tuìfáng?',
  };
  const hasFullAccess = isTripOrGroup(userState);
  const canUseCustomPhraseHelper = isGroup(userState);

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
        title="Hotel Phrases"
        icon={<Building2 className="w-4 h-4 text-[#155e63]" />}
        cards={hotelCards}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
      />

      <AskBuddyHint onClick={onAskBuddy} />

      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4">
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
