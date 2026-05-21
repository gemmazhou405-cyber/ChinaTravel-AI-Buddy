import { ChevronDown, Lock } from 'lucide-react';
import { ReactNode, useState } from 'react';
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
}

export default function PhraseCategoryAccordion({
  categories,
  freeLimit = 3,
  lockedPreviewLimit = 3,
  isPaidUser = false,
  showToast,
  onUpgradeClick,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Phrase Cards</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Pick a situation first. Open only the phrases you need right now.
        </p>
      </div>

      <div className="space-y-2.5">
        {categories.map((category) => {
          const open = openId === category.id;
          const lockedCount = Math.max(category.cards.length - freeLimit, 0);
          return (
            <div key={category.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : category.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
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
                        {freeLimit} free
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {category.subtitle || `${category.cards.length} practical cards`}
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
