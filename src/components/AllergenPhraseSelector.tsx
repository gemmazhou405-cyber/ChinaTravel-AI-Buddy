import { useState } from 'react';
import { X, Volume2, Copy, Expand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PhraseCard, PhraseAllergen } from '../types/phraseCard';
import { allergens } from '../data/phraseCards';

interface AllergenCardPreviewProps {
  card: PhraseCard;
  allergenZh: string;
  allergenEn: string;
  showToast: (msg: string) => void;
  onFullscreen: (zh: string, en: string, pinyin: string) => void;
}

function fillSlot(template: string, value: string): string {
  return template.replace(/___/, value);
}

function AllergenCardPreview({ card, allergenZh, allergenEn, showToast, onFullscreen }: AllergenCardPreviewProps) {
  const { t } = useTranslation();
  const filledZh = fillSlot(card.zh, allergenZh);
  const filledEn = fillSlot(card.en, allergenEn);
  const filledPinyin = card.pinyin.replace(/___/, allergenZh);

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(filledZh);
    u.lang = 'zh-CN';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const copy = async () => {
    await navigator.clipboard?.writeText(filledZh);
    showToast(t('toast.copied'));
  };

  return (
    <div className="rounded-2xl border border-white/60 bg-white/[0.58] p-4 shadow-[0_12px_34px_rgba(11,63,67,0.07)] backdrop-blur-xl">
      <p className="text-[28px] font-bold leading-tight text-gray-950">{filledZh}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-300">{filledPinyin}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-400">{filledEn}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
        <button onClick={speak} className="flex items-center gap-1 text-xs text-[#155e63]">
          <Volume2 className="h-3 w-3" /> {t('common.speak')}
        </button>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400">
          <Copy className="h-3 w-3" /> {t('common.copy')}
        </button>
        <button
          onClick={() => onFullscreen(filledZh, filledEn, filledPinyin)}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-[#155e63]/8 px-2.5 py-1 text-xs font-semibold text-[#155e63]"
        >
          <Expand className="h-3 w-3" /> {t('common.showCard')}
        </button>
      </div>
    </div>
  );
}

interface Props {
  /** Phrase cards to show when an allergen is selected. Each card's ___ slot is filled with the allergen. */
  cards: PhraseCard[];
  showToast: (msg: string) => void;
}

interface FullscreenState {
  zh: string;
  en: string;
  pinyin: string;
}

export default function AllergenPhraseSelector({ cards, showToast }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<PhraseAllergen | null>(null);
  const [fullscreen, setFullscreen] = useState<FullscreenState | null>(null);

  const selectedNote = selected?.note ?? null;

  const speakFullscreen = () => {
    if (!fullscreen || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fullscreen.zh);
    u.lang = 'zh-CN';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const copyFullscreen = async () => {
    if (!fullscreen) return;
    await navigator.clipboard?.writeText(fullscreen.zh);
    showToast(t('toast.copied'));
  };

  return (
    <>
      {/* Allergen chip grid */}
      <div className="flex flex-wrap gap-2">
        {allergens.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(selected?.id === a.id ? null : a)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              selected?.id === a.id
                ? 'border-[#155e63] bg-[#155e63] text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#155e63]/40 hover:text-[#155e63]'
            }`}
          >
            {a.zh}
            <span className={`ml-1 ${selected?.id === a.id ? 'text-white/70' : 'text-gray-400'}`}>
              ({a.en})
            </span>
          </button>
        ))}
      </div>

      {/* Allergen-specific note */}
      {selected && selectedNote && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
          ⚠️ {selectedNote}
        </div>
      )}

      {/* Phrase card previews */}
      {selected && (
        <div className="mt-4 space-y-3">
          {cards.map((card) => (
            <AllergenCardPreview
              key={card.id}
              card={card}
              allergenZh={selected.zh}
              allergenEn={selected.en}
              showToast={showToast}
              onFullscreen={(zh, en, pinyin) => setFullscreen({ zh, en, pinyin })}
            />
          ))}
        </div>
      )}

      {/* Fullscreen display */}
      {fullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white p-8 text-center">
          <button
            onClick={() => setFullscreen(null)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="mb-8 text-xs font-semibold uppercase tracking-wide text-[#155e63]">
            {fullscreen.en}
          </p>
          <p className="max-w-full break-words text-[48px] font-bold leading-tight text-gray-950">
            {fullscreen.zh}
          </p>
          <p className="mt-4 text-base text-gray-400">{fullscreen.pinyin}</p>
          <div className="absolute bottom-10 left-4 right-4 flex gap-3">
            <button
              onClick={speakFullscreen}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#155e63] py-4 text-sm font-semibold text-white"
            >
              <Volume2 className="h-4 w-4" /> {t('common.speak')}
            </button>
            <button
              onClick={copyFullscreen}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-4 text-sm font-semibold text-gray-600"
            >
              <Copy className="h-4 w-4" /> {t('common.copy')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
