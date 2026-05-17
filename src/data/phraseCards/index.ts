import hospitalCards from './hospital.json';
import pharmacyCards from './pharmacy.json';
import policeCards from './police.json';
import taxiCards from './taxi.json';
import type { PhraseCardData } from '../../types/phraseCard';

export const taxiCardsData = taxiCards as PhraseCardData[];
export const hospitalCardsData = hospitalCards as PhraseCardData[];
export const policeCardsData = policeCards as PhraseCardData[];
export const pharmacyCardsData = pharmacyCards as PhraseCardData[];

export {
  taxiCardsData as taxiCards,
  hospitalCardsData as hospitalCards,
  policeCardsData as policeCards,
  pharmacyCardsData as pharmacyCards,
};
