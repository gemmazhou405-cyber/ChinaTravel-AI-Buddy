import { useState } from 'react';
import { Copy, Volume2, X, Expand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PhraseCard, PhraseSlot } from '../types/phraseCard';
import { allergens } from '../data/phraseCards';

interface Props {
  card: PhraseCard;
  isLocked?: boolean;
  showToast: (msg: string) => void;
  onLockedClick?: () => void;
}

const SLOT_LABEL: Record<string, string> = {
  address: 'Address / 地址',
  allergen: 'Select allergen',
  people: 'Number of people',
  time: 'Time (e.g. 3:30)',
  days: 'Number of days',
  item: 'Item (e.g. air conditioning)',
  room: 'Room number',
  place: 'Place / location',
};

function fillInline(zh: string, slots: PhraseSlot[], values: Record<string, string>): string {
  const inline = slots.filter((s) => s.position === 'inline');
  let i = 0;
  return zh.replace(/___/g, () => {
    const slot = inline[i++];
    if (!slot) return '___';
    return values[slot.id] || '___';
  });
}

export default function PhraseCardItem({ card, isLocked = false, showToast, onLockedClick }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'none' | 'input' | 'fullscreen'>('none');
  const [slotValues, setSlotValues] = useState<Record<string, string>>({});

  const slots = card.slots ?? [];
  const inlineSlots = slots.filter((s) => s.position === 'inline');
  const belowSlot = slots.find((s) => s.position === 'below') ?? null;

  const filledZh = slots.length > 0 ? fillInline(card.zh, slots, slotValues) : card.zh;
  const addressValue = belowSlot ? (slotValues[belowSlot.id] ?? '') : '';

  const slotsReady =
    inlineSlots.every((s) => (slotValues[s.id] ?? '').trim()) &&
    (!belowSlot || (slotValues[belowSlot.id] ?? '').trim());

  const speakZh = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const copyZh = async () => {
    const text = addressValue ? `${filledZh}\n${addressValue}` : filledZh;
    await navigator.clipboard?.writeText(text);
    showToast(t('toast.copied'));
  };

  const handleShowCard = () => {
    if (isLocked) { onLockedClick?.(); return; }
    if (slots.length > 0) {
      setPhase('input');
    } else {
      setPhase('fullscreen');
    }
  };

  const closeAll = () => {
    setPhase('none');
    setSlotValues({});
  };

  return (
    <>
      {/* Card tile */}
      <div
        className={`relative rounded-2xl border border-white/60 bg-white/[0.58] p-4 shadow-[0_12px_34px_rgba(11,63,67,0.07)] backdrop-blur-xl transition-all ${
          isLocked ? 'opacity-55' : 'hover:shadow-md hover:border-[#155e63]/20'
        }`}
      >
        {isLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
            <button
              type="button"
              onClick={onLockedClick}
              className="flex items-center gap-1.5 rounded-full bg-[#155e63] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
            >
              🔒 {t('common.upgradeToUnlock')}
            </button>
          </div>
        )}

        {/* zh — largest, dominant */}
        <p className="text-[30px] font-bold leading-tight text-gray-950">{card.zh}</p>
        {/* pinyin — smallest, lightest */}
        <p className="mt-1 text-xs leading-relaxed text-gray-300">{card.pinyin}</p>
        {/* en — muted, ~40% visual weight */}
        <p className="mt-1 text-sm leading-relaxed text-gray-400">{card.en}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
          <button
            onClick={() => !isLocked && speakZh(card.zh)}
            disabled={isLocked}
            className="flex items-center gap-1 text-xs text-[#155e63] disabled:cursor-not-allowed"
          >
            <Volume2 className="h-3 w-3" /> {t('common.speak')}
          </button>
          <button
            onClick={() => !isLocked && copyZh()}
            disabled={isLocked}
            className="flex items-center gap-1 text-xs text-gray-400 disabled:cursor-not-allowed"
          >
            <Copy className="h-3 w-3" /> {t('common.copy')}
          </button>
          <button
            onClick={handleShowCard}
            disabled={isLocked}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-[#155e63]/8 px-2.5 py-1 text-xs font-semibold text-[#155e63] disabled:cursor-not-allowed"
          >
            <Expand className="h-3 w-3" /> {t('common.showCard')}
          </button>
        </div>
      </div>

      {/* Slot input modal */}
      {phase === 'input' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={closeAll}
        >
          <div
            className="w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-sm sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{card.en}</p>
                <p className="mt-0.5 text-xs text-gray-400">{t('common.fillInDetails')}</p>
              </div>
              <button onClick={closeAll} className="ml-4 shrink-0 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {slots.map((slot) => (
                <div key={slot.id}>
                  <p className="mb-2 text-xs font-medium text-gray-600">
                    {SLOT_LABEL[slot.id] ?? SLOT_LABEL[slot.type] ?? slot.id}
                  </p>

                  {slot.type === 'allergen' && (
                    <div className="flex flex-wrap gap-2">
                      {allergens.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setSlotValues((v) => ({ ...v, [slot.id]: a.zh }))}
                          className={`rounded-full border px-2.5 py-1.5 text-xs transition-all ${
                            slotValues[slot.id] === a.zh
                              ? 'border-[#155e63] bg-[#155e63] text-white'
                              : 'border-gray-200 text-gray-600 hover:border-[#155e63]/40'
                          }`}
                        >
                          {a.zh} <span className="opacity-60">({a.en})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {slot.type === 'number' && (
                    <input
                      type="number"
                      inputMode="numeric"
                      value={slotValues[slot.id] ?? ''}
                      onChange={(e) => setSlotValues((v) => ({ ...v, [slot.id]: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#155e63]/40"
                      placeholder="0"
                    />
                  )}

                  {slot.type === 'text' && (
                    <input
                      type="text"
                      value={slotValues[slot.id] ?? ''}
                      onChange={(e) => setSlotValues((v) => ({ ...v, [slot.id]: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#155e63]/40"
                    />
                  )}

                  {slot.type === 'address' && (
                    <textarea
                      rows={3}
                      value={slotValues[slot.id] ?? ''}
                      onChange={(e) => setSlotValues((v) => ({ ...v, [slot.id]: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#155e63]/40"
                      placeholder={t('common.addressPlaceholder')}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => slotsReady && setPhase('fullscreen')}
              disabled={!slotsReady}
              className="mt-6 w-full rounded-xl bg-[#155e63] py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {t('common.showCard')} →
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen display — black text on white, max brightness */}
      {phase === 'fullscreen' && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white p-8 text-center">
          <button
            onClick={closeAll}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="mb-8 text-xs font-semibold uppercase tracking-wide text-[#155e63]">
            {card.en}
          </p>

          <p className="max-w-full break-words text-[52px] font-bold leading-tight text-gray-950">
            {filledZh}
          </p>

          {addressValue && (
            <p className="mt-4 max-w-full break-words text-2xl font-medium text-gray-700">
              {addressValue}
            </p>
          )}

          <p className="mt-4 text-base text-gray-400">{card.pinyin}</p>

          <div className="absolute bottom-10 left-4 right-4 flex gap-3">
            <button
              onClick={() => speakZh(filledZh)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#155e63] py-4 text-sm font-semibold text-white"
            >
              <Volume2 className="h-4 w-4" /> {t('common.speak')}
            </button>
            <button
              onClick={copyZh}
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
