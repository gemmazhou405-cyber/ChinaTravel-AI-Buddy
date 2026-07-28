import rawData from '../../../docs/launch/phrase-cards.json';
import type { PhraseCard, PhraseAllergen } from '../../types/phraseCard';

interface RawCategory {
  id: string;
  en?: string;
  priority?: number;
  cards: PhraseCard[];
}

interface RawData {
  categories: RawCategory[];
  allergens: PhraseAllergen[];
}

const data = rawData as unknown as RawData;

const byId = (id: string): PhraseCard[] =>
  data.categories.find((c) => c.id === id)?.cards ?? [];

export const universalCards: PhraseCard[] = byId('universal');
export const taxiCards: PhraseCard[] = byId('taxi');
export const restaurantCards: PhraseCard[] = byId('restaurant');
export const hotelCards: PhraseCard[] = byId('hotel');
export const medicalCards: PhraseCard[] = byId('medical');
export const policeCards: PhraseCard[] = byId('police');
export const paymentCards: PhraseCard[] = byId('payment');
export const allergens: PhraseAllergen[] = data.allergens;

// Deprecated exports — kept so any remaining imports don't hard-fail at build time
export const airportCards: PhraseCard[] = [];
export const trainCards: PhraseCard[] = [];
export const hospitalCards: PhraseCard[] = [];
export const pharmacyCards: PhraseCard[] = [];
export const emergencyCards: PhraseCard[] = [];
export const lostItemsCards: PhraseCard[] = [];
export const shoppingCards: PhraseCard[] = [];
