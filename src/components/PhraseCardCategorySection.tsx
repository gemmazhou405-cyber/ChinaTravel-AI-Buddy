import type { ReactNode } from 'react';
import PhraseCard from './PhraseCard';
import type { PhraseCardData } from '../types/phraseCard';

interface Props {
  title: string;
  icon: ReactNode;
  cards: PhraseCardData[];
  freeLimit?: number;
  lockedPreviewLimit?: number;
  isPaidUser?: boolean;
  onUpgradeClick?: () => void;
}

export default function PhraseCardCategorySection({
  title,
  icon,
  cards,
  freeLimit = 3,
  lockedPreviewLimit = 3,
  isPaidUser = false,
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
        {visibleCards.map((card, index) => (
          <PhraseCard key={card.id} card={card} locked={!isPaidUser && index >= freeLimit} onUpgradeClick={onUpgradeClick} />
        ))}
      </div>
    </section>
  );
}
