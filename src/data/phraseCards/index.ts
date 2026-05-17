import airportCards from './airport.json';
import hospitalCards from './hospital.json';
import hotelCards from './hotel.json';
import paymentCards from './payment.json';
import pharmacyCards from './pharmacy.json';
import policeCards from './police.json';
import taxiCards from './taxi.json';
import trainCards from './train.json';
import type { PhraseCardData } from '../../types/phraseCard';

export const airportCardsData = airportCards as PhraseCardData[];
export const taxiCardsData = taxiCards as PhraseCardData[];
export const trainCardsData = trainCards as PhraseCardData[];
export const hotelCardsData = hotelCards as PhraseCardData[];
export const hospitalCardsData = hospitalCards as PhraseCardData[];
export const policeCardsData = policeCards as PhraseCardData[];
export const pharmacyCardsData = pharmacyCards as PhraseCardData[];
export const paymentCardsData = paymentCards as PhraseCardData[];

export {
  airportCardsData as airportCards,
  taxiCardsData as taxiCards,
  trainCardsData as trainCards,
  hotelCardsData as hotelCards,
  hospitalCardsData as hospitalCards,
  policeCardsData as policeCards,
  pharmacyCardsData as pharmacyCards,
  paymentCardsData as paymentCards,
};
