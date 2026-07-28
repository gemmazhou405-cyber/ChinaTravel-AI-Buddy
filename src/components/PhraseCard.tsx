import { useState } from 'react';
import { Copy, Lock, Volume2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PhraseCard } from '../types/phraseCard';

interface Props {
  card: PhraseCard;
  locked?: boolean;
  onUpgradeClick?: () => void;
}

export default function PhraseCardDisplay({ card, locked = false, onUpgradeClick }: Props) {
  const { t } = useTranslation();
  const [showLocal, setShowLocal] = useState(false);

  const speakChinese = () => {
    if (locked || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.zh);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const copyChinese = async () => {
    if (locked) return;
    await navigator.clipboard?.writeText(card.zh);
  };

  return (
    <>
      <div
        onClick={() => locked && onUpgradeClick?.()}
        className={`relative rounded-2xl border border-white/60 bg-white/[0.58] p-3.5 shadow-[0_12px_34px_rgba(11,63,67,0.07)] backdrop-blur-xl transition-all ${locked ? 'opacity-55 cursor-pointer' : 'hover:shadow-md hover:border-[#155e63]/20'}`}
      >
        {locked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onUpgradeClick?.(); }}
              className="flex items-center gap-1.5 rounded-full bg-[#155e63] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
            >
              <Lock className="h-3 w-3" />
              {t('common.upgradeToUnlock')}
            </button>
          </div>
        )}

        {/* zh — dominant */}
        <p className="text-[26px] font-bold leading-tight text-gray-950">{card.zh}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-300">{card.pinyin}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-400">{card.en}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={speakChinese}
            disabled={locked}
            className="flex items-center gap-1 text-xs text-[#155e63] disabled:cursor-not-allowed"
          >
            <Volume2 className="h-3 w-3" />
            {t('common.speak')}
          </button>
          <button
            onClick={copyChinese}
            disabled={locked}
            className="flex items-center gap-1 text-xs text-gray-400 disabled:cursor-not-allowed"
          >
            <Copy className="h-3 w-3" />
            {t('common.copy')}
          </button>
          <button
            onClick={() => !locked && setShowLocal(true)}
            disabled={locked}
            className="text-xs font-medium text-[#155e63] disabled:cursor-not-allowed"
          >
            {t('common.showCard')}
          </button>
        </div>
      </div>

      {showLocal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLocal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLocal(false)}
              className="mb-4 ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-[#155e63]">{card.en}</p>
            <p className="mb-4 text-4xl font-bold leading-tight text-gray-950">{card.zh}</p>
            <p className="text-base text-gray-500">{card.pinyin}</p>
          </div>
        </div>
      )}
    </>
  );
}
