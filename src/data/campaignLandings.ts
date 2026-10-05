import type { CampaignLandingVariant } from './campaignPartners';

export type CampaignIcon =
  | 'apps'
  | 'car'
  | 'emergency'
  | 'food'
  | 'hotel'
  | 'internet'
  | 'language'
  | 'payment'
  | 'route'
  | 'safety'
  | 'visa';

export type CampaignCard = {
  icon: CampaignIcon;
  href: string;
  titleKey: string;
  descriptionKey: string;
};

export type CampaignCta = {
  href?: string;
  action?: 'buddy';
  labelKey: string;
};

export type CampaignLandingConfig = {
  variant: CampaignLandingVariant;
  path: string;
  translationKey: 'hostel' | 'visa' | 'firstTrip';
  title: string;
  description: string;
  primary: CampaignCta;
  secondary: CampaignCta[];
  cards: CampaignCard[];
};

export const campaignLandings: Record<CampaignLandingVariant, CampaignLandingConfig> = {
  hostel: {
    variant: 'hostel',
    path: '/partners/hostel-china-travel-help/',
    translationKey: 'hostel',
    title: 'China Travel Help for Hotel and Hostel Guests | ChinaEase Buddy',
    description: 'Practical help with payments, taxis, hotel addresses, food, useful Chinese and emergencies while you are in China.',
    primary: { href: '/plan/', labelKey: 'hostel.primaryCta' },
    secondary: [
      { href: '/?journey=china&tool=transport', labelKey: 'hostel.toolkitCta' },
      { action: 'buddy', labelKey: 'hostel.buddyCta' },
    ],
    cards: [
      { icon: 'payment', href: '/china-payment-guide/', titleKey: 'hostel.cards.payment.title', descriptionKey: 'hostel.cards.payment.description' },
      { icon: 'car', href: '/didi-in-china-for-foreigners/', titleKey: 'hostel.cards.taxi.title', descriptionKey: 'hostel.cards.taxi.description' },
      { icon: 'hotel', href: '/?journey=china&tool=stay', titleKey: 'hostel.cards.hotel.title', descriptionKey: 'hostel.cards.hotel.description' },
      { icon: 'emergency', href: '/china-emergency-numbers/', titleKey: 'hostel.cards.emergency.title', descriptionKey: 'hostel.cards.emergency.description' },
      { icon: 'language', href: '/?journey=china&tool=food', titleKey: 'hostel.cards.phrases.title', descriptionKey: 'hostel.cards.phrases.description' },
      { icon: 'food', href: '/?journey=china&tool=food', titleKey: 'hostel.cards.food.title', descriptionKey: 'hostel.cards.food.description' },
    ],
  },
  visa: {
    variant: 'visa',
    path: '/partners/china-visa-checker/',
    translationKey: 'visa',
    title: 'Free China Visa Policy Check for Travelers | ChinaEase Buddy',
    description: 'Check if you may need a visa for China before your trip. Use ChinaEase Buddy’s free visa policy checker, then prepare payments, apps, internet, and your first China itinerary.',
    primary: { href: '/china-visa-free-checker/', labelKey: 'visa.primaryCta' },
    secondary: [{ href: '/plan/', labelKey: 'visa.planCta' }],
    cards: [
      { icon: 'payment', href: '/china-payment-guide/', titleKey: 'visa.cards.payment.title', descriptionKey: 'visa.cards.payment.description' },
      { icon: 'internet', href: '/china-sim-card-for-foreigners/', titleKey: 'visa.cards.internet.title', descriptionKey: 'visa.cards.internet.description' },
      { icon: 'apps', href: '/china-travel-apps/', titleKey: 'visa.cards.apps.title', descriptionKey: 'visa.cards.apps.description' },
      { icon: 'car', href: '/china-airport-arrival-guide/', titleKey: 'visa.cards.arrival.title', descriptionKey: 'visa.cards.arrival.description' },
      { icon: 'route', href: '/plan/', titleKey: 'visa.cards.plan.title', descriptionKey: 'visa.cards.plan.description' },
    ],
  },
  'first-trip': {
    variant: 'first-trip',
    path: '/partners/first-trip-to-china/',
    translationKey: 'firstTrip',
    title: 'First Trip to China: Start Here | ChinaEase Buddy',
    description: 'A practical starting point for payments, internet, transport, hotels, food, language, safety and itinerary planning.',
    primary: { href: '/plan/', labelKey: 'firstTrip.primaryCta' },
    secondary: [
      { href: '/first-trip-to-china/', labelKey: 'firstTrip.guideCta' },
      { href: '/?journey=before&tool=apps', labelKey: 'firstTrip.toolkitCta' },
    ],
    cards: [
      { icon: 'route', href: '/china-travel-checklist/', titleKey: 'firstTrip.cards.checklist.title', descriptionKey: 'firstTrip.cards.checklist.description' },
      { icon: 'payment', href: '/china-payment-guide/', titleKey: 'firstTrip.cards.payment.title', descriptionKey: 'firstTrip.cards.payment.description' },
      { icon: 'internet', href: '/china-sim-card-for-foreigners/', titleKey: 'firstTrip.cards.internet.title', descriptionKey: 'firstTrip.cards.internet.description' },
      { icon: 'car', href: '/didi-in-china-for-foreigners/', titleKey: 'firstTrip.cards.transport.title', descriptionKey: 'firstTrip.cards.transport.description' },
      { icon: 'hotel', href: '/china-hotels-for-foreigners/', titleKey: 'firstTrip.cards.hotels.title', descriptionKey: 'firstTrip.cards.hotels.description' },
      { icon: 'food', href: '/?journey=china&tool=food', titleKey: 'firstTrip.cards.food.title', descriptionKey: 'firstTrip.cards.food.description' },
      { icon: 'language', href: '/?journey=china&tool=food', titleKey: 'firstTrip.cards.language.title', descriptionKey: 'firstTrip.cards.language.description' },
      { icon: 'safety', href: '/china-emergency-numbers/', titleKey: 'firstTrip.cards.safety.title', descriptionKey: 'firstTrip.cards.safety.description' },
    ],
  },
};

export function getCampaignVariant(pathname: string): CampaignLandingVariant | null {
  const clean = pathname.replace(/\/+$/, '');
  if (clean === '/partners/hostel-china-travel-help') return 'hostel';
  if (clean === '/partners/china-visa-checker') return 'visa';
  if (clean === '/partners/first-trip-to-china') return 'first-trip';
  return null;
}
