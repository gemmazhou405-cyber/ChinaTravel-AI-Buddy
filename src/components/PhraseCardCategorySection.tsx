import type { ReactNode } from 'react';
import PhraseCardItem from './PhraseCardItem';
import type { PhraseCardData } from '../types/phraseCard';

interface Props {
  title: string;
  icon: ReactNode;
  cards: PhraseCardData[];
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
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visibleCards.map((card, index) => {
          const isLocked = !isPaidUser && index >= freeLimit;
          return (
            <div key={card.id} onClick={isLocked ? onUpgradeClick : undefined} className={isLocked ? 'cursor-pointer' : ''}>
              <PhraseCardItem card={card} isLocked={isLocked} showToast={showToast} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
