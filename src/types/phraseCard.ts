export interface PhraseSlot {
  id: string;
  type: 'address' | 'allergen' | 'number' | 'text';
  position: 'below' | 'inline';
}

export interface PhraseAllergen {
  id: string;
  zh: string;
  en: string;
  note?: string;
}

export interface PhraseCard {
  id: string;
  zh: string;
  pinyin: string;
  en: string;
  priority: number;
  slots?: PhraseSlot[];
}

// Alias kept for any remaining references
export type PhraseCardData = PhraseCard;
