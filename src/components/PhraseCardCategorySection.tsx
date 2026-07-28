import type { ReactNode } from 'react';
import PhraseCardItem from './PhraseCardItem';
import type { PhraseCard } from '../types/phraseCard';

interface Props {
  title: string;
  icon: ReactNode;
  cards: PhraseCard[];
  freeLimit?: number;
  lockedPreviewLimit?: number;
  isPaidUser?: boolean;
  showToast: (msg: string) => void;
  onUpgradeClick?: () => void;
}

export default function PhraseCardCategorySection({
  title,
  icon,
  cards,
  freeLimit = 3,
  lockedPreviewLimit = 3,
  isPaidUser = false,
  showToast,
  onUpgradeClick,
}: Props) {
  const visibleCards = isPaidUser ? cards : cards.slice(0, freeLimit + lockedPreviewLimit);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {visibleCards.map((card, index) => {
          const isLocked = !isPaidUser && index >= freeLimit;
          return (
            <PhraseCardItem
              key={card.id}
              card={card}
              isLocked={isLocked}
              showToast={showToast}
              onLockedClick={isLocked ? onUpgradeClick : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
