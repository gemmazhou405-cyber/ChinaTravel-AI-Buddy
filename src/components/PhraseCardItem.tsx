import { useState } from 'react';
import { Copy, Lock, Volume2, X } from 'lucide-react';
import type { PhraseCard } from '../types/phraseCard';

interface Props {
  card: PhraseCard;
  isLocked: boolean;
  showToast: (msg: string) => void;
}

export default function PhraseCardItem({ card, isLocked, showToast }: Props) {
  const [showLocal, setShowLocal] = useState(false);

  const speakChinese = () => {
    if (isLocked || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.audioText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const copyChinese = async () => {
    if (isLocked) return;
    await navigator.clipboard?.writeText(card.chinese);
    showToast('Copied!');
  };

  return (
    <>
      <div className={`relative bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm transition-all ${
        isLocked ? 'overflow-hidden opacity-80' : 'hover:shadow-md hover:border-[#155e63]/20'
      }`}>
        {isLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-[2px]">
            <div className="flex items-center gap-1.5 rounded-full bg-[#155e63] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              <Lock className="h-3 w-3" />
              Upgrade to unlock
            </div>
          </div>
        )}

        <div className={isLocked ? 'blur-[1px]' : ''}>
          <p className="text-gray-500 text-xs mb-1">{card.english}</p>
          <p className="text-gray-900 font-medium text-sm">{card.chinese}</p>
          <p className="text-gray-400 text-xs mt-0.5">{card.pinyin}</p>
          <p className="text-gray-500 text-xs mt-2 leading-relaxed">{card.usageNote}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={speakChinese}
              disabled={isLocked}
              className="text-xs text-[#155e63] flex items-center gap-1 disabled:cursor-not-allowed"
            >
              <Volume2 className="h-3 w-3" />
              Speak
            </button>
            <button
              onClick={copyChinese}
              disabled={isLocked}
              className="text-xs text-gray-400 flex items-center gap-1 disabled:cursor-not-allowed"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
            {card.showToLocal && (
              <button
                onClick={() => !isLocked && setShowLocal(true)}
                disabled={isLocked}
                className="text-xs text-[#155e63] font-medium disabled:cursor-not-allowed"
              >
                Show to local
              </button>
            )}
          </div>
        </div>
      </div>

      {showLocal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLocal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowLocal(false)} className="ml-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63] mb-5">{card.scene}</p>
            <p className="text-4xl font-bold text-gray-950 leading-tight mb-4">{card.chinese}</p>
            <p className="text-gray-500 text-base">{card.pinyin}</p>
          </div>
        </div>
      )}
    </>
  );
}
