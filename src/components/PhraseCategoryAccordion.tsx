import { ChevronDown, Lock } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhraseCardCategorySection from './PhraseCardCategorySection';
import type { PhraseCardData } from '../types/phraseCard';

interface PhraseCategory {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  cards: PhraseCardData[];
}

interface Props {
  categories: PhraseCategory[];
  freeLimit?: number;
  lockedPreviewLimit?: number;
  isPaidUser?: boolean;
  showToast: (msg: string) => void;
  onUpgradeClick?: () => void;
  initialOpenId?: string | null;
  onCategoryOpen?: (categoryId: string) => void;
}

export default function PhraseCategoryAccordion({
  categories,
  freeLimit = 3,
  lockedPreviewLimit = 3,
  isPaidUser = false,
  showToast,
  onUpgradeClick,
  initialOpenId = null,
  onCategoryOpen,
}: Props) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  const trackedInitialOpenId = useRef<string | null>(null);

  useEffect(() => {
    if (initialOpenId) {
      setOpenId(initialOpenId);
      if (trackedInitialOpenId.current !== initialOpenId) {
        trackedInitialOpenId.current = initialOpenId;
        onCategoryOpen?.(initialOpenId);
        window.setTimeout(() => {
          const element = document.getElementById(`phrase-category-${initialOpenId}`);
          if (!element) return;
          const top = Math.max(element.getBoundingClientRect().top + window.scrollY - 76, 0);
          window.scrollTo({ top, behavior: 'auto' });
        }, 450);
      }
    }
  }, [initialOpenId, onCategoryOpen]);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{t('common.phraseCards')}</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {t('common.phraseCardsHint')}
        </p>
      </div>

      <div className="space-y-2.5">
        {categories.map((category) => {
          const open = openId === category.id;
          const lockedCount = Math.max(category.cards.length - freeLimit, 0);
          return (
            <div id={`phrase-category-${category.id}`} key={category.id} className="scroll-mt-20 overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/[0.52] shadow-[0_16px_42px_rgba(11,63,67,0.08)] backdrop-blur-2xl">
              <button
                type="button"
                onClick={() => {
                  const next = open ? null : category.id;
                  setOpenId(next);
                  if (next) onCategoryOpen?.(next);
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#155e63]/8 text-[#155e63]">
                  {category.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{category.title}</p>
                    {!isPaidUser && lockedCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#155e63]/8 px-2 py-0.5 text-[10px] font-semibold text-[#155e63]">
                        <Lock className="h-2.5 w-2.5" />
                        {t('common.freeCount', { count: freeLimit })}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {category.subtitle || t('common.cardCount', { count: category.cards.length })}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="border-t border-gray-50 p-4 pt-3">
                  <PhraseCardCategorySection
                    title={category.title}
                    icon={category.icon}
                    cards={category.cards}
                    freeLimit={freeLimit}
                    lockedPreviewLimit={lockedPreviewLimit}
                    isPaidUser={isPaidUser}
                    showToast={showToast}
                    onUpgradeClick={onUpgradeClick}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
