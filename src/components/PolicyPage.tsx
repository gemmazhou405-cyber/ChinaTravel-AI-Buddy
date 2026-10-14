Warning: truncated output (original token count: 151042)
Total output lines: 7359

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { unsubscribeNewsletter } from '../lib/newsletter';
import { RelatedGuidesForForeigners } from './RelatedGuidesForForeigners';
import suzhouGuide from '../data/seoPages/3-day-suzhou-itinerary.json';
import nanjingGuide from '../data/seoPages/3-day-nanjing-itinerary.json';
import daliGuide from '../data/seoPages/3-day-dali-itinerary.json';
import goldenWeekGuide from '../data/seoPages/china-golden-week-2026-travel-guide.json';
import greatWallGuide from '../data/seoPages/great-wall-of-china-day-trip-from-beijing.json';
import pandaBaseGuide from '../data/seoPages/chengdu-panda-base-guide.json';
import didiPaymentGuide from '../data/seoPages/didi-payment-for-foreigners.json';
import beijingAirportGuide from '../data/seoPages/beijing-airport-to-city-guide.json';
import mapsComparisonGuide from '../data/seoPages/amap-vs-google-maps-china.json';
import transit240Guide from '../data/seoPages/china-240-hour-visa-free-transit-2026.json';
import tenPayGoGuide from '../data/seoPages/tenpaygo-for-tourists.json';
import accommodationRegistrationGuide from '../data/seoPages/china-online-accommodation-registration-12367.json';
import visaFreeCheckerGuide from '../data/seoPages/china-visa-free-checker.json';
import VisaFreeCheckerPage from './VisaFreeCheckerPage';
import TransitCalculatorPage from './TransitCalculatorPage';
import TransitAnswerPage from './TransitAnswerPage';
import { isTransitAnswerSlug, type TransitAnswerSlug } from '../lib/transitAnswers';

type LegalPageType = 'terms' | 'privacy' | 'refund' | 'contact' | 'about' | 'unsubscribe';
type GuidePageType =
  | 'guides'
  | 'china-visa-free-travel-guide'
  | 'china-airport-arrival-guide'
  | 'china-hotels-for-foreigners'
  | 'china-food-ordering-guide'
  | 'chinese-travel-phrases'
  | 'china-travel-safety-guide'
  | 'china-travel-budget'
  | 'china-travel-apps'
  | 'amap-in-english'
  | 'china-metro-guide'
  | 'didi-in-china-for-foreigners'
  | 'china-train-travel-guide'
  | '7-day-china-itinerary'
  | '10-day-china-itinerary'
  | '14-day-china-itinerary'
  | 'beijing-vs-shanghai'
  | '3-day-beijing-itinerary'
  | '3-day-shanghai-itinerary'
  | '3-day-xian-itinerary'
  | '3-day-chongqing-itinerary'
  | '3-day-chengdu-itinerary'
  | '3-day-guilin-yangshuo-itinerary'
  | '3-day-zhangjiajie-itinerary'
  | '3-day-shenzhen-itinerary'
  | '3-day-guangzhou-itinerary'
  | '3-day-hangzhou-itinerary'
  | '3-day-suzhou-itinerary'
  | '3-day-nanjing-itinerary'
  | '3-day-dali-itinerary'
  | 'china-golden-week-2026-travel-guide'
  | 'great-wall-of-china-day-trip-from-beijing'
  | 'chengdu-panda-base-guide'
  | 'didi-payment-for-foreigners'
  | 'beijing-airport-to-city-guide'
  | 'amap-vs-google-maps-china'
  | 'best-time-to-visit-china'
  | 'china-esim-internet-guide'
  | 'china-sim-card-for-foreigners'
  | 'china-240-hour-visa-free-transit-2026'
  | 'tenpaygo-for-tourists'
  | 'china-visa-free-checker'
  | 'alipay-for-foreigners'
  | 'wechat-pay-for-foreigners'
  | 'china-payment-guide'
  | 'china-travel-checklist'
  | 'china-emergency-numbers'
  | 'china-visa-free-guide-2026'
  | 'how-to-pay-in-china-as-foreigner'
  | 'china-esim-internet-vpn-guide'
  | 'china-train-booking-foreigners-12306'
  | 'china-itinerary-first-time-7-10-14-days'
  | 'is-china-safe-for-tourists-2026'
  | 'best-apps-for-china-travel-2026'
  | 'how-to-use-didi-in-china-foreigners'
  | 'beijing-shanghai-layover-240-hour-guide'
  | 'how-much-does-china-trip-cost-2026-calculator'
  | 'china-hotels-for-foreigners-no-rejection-guide'
  | 'does-google-maps-work-in-china-amap-guide'
  | 'how-to-visit-great-wall-from-beijing-2026'
  | 'what-to-eat-in-china-first-time-guide'
  | 'how-to-use-wechat-as-foreigner-2026'
  | 'nia-12367-online-accommodation-registration-guide'
  | 'amap-english-mode-guide-2026'
  | 'alipay-metro-qr-transport-code-guide'
  | 'china-travel-ai-itinerary-generator'
  | '240-hour-transit-zone-map-high-speed-rail'
  | 'wechat-verification-without-friend-qr-2026'
  | 'faq';
type PageType = 'pricing' | 'china-240-hour-transit-calculator' | TransitAnswerSlug | LegalPageType | GuidePageType;

interface Props {
  type: PageType;
  userId?: string | null;
  onAskBuddy?: (prefill?: string) => void;
}

interface GuidePageData {
  path: string;
  title: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  quickAnswer: string;
  ctaLabel: string;
  ctaHref: string;
  lastReviewed?: string;
  lastModified?: string;
  isArticle?: boolean;
  featuredFaqCount?: number;
  ctaBeforeFeaturedFaqs?: boolean;
  buddyPrompt?: string;
  midCtaLabel?: string;
  reviewed?: string;
  howTo?: {
    name: string;
    description: string;
    steps: Array<{ name: string; text: string }>;
  };
  sections: Array<{
    title: string;
    items?: string[];
    links?: Array<{
      label: string;
      description: string;
      href: string;
    }>;
    ordered?: boolean;
    table?: {
      headers: string[];
      rows: string[][];
    };
    countryGroups?: Array<{
      region: string;
      countries: string[];
    }>;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  related: Array<{
    label: string;
    href: string;
  }>;
  sources?: Array<{
    label: string;
    href: string;
  }>;
}

function guideFromArticle(
  data: {
    heading: string;
    title: string;
    description: string;
    quickAnswer: string;
    lastReviewed: string;
    lastModified: string;
    contentSections: GuidePageData['sections'];
    faqs: string[][];
    sourceLinks: string[][];
  },
  path: string,
  ctaLabel: string,
  related: GuidePageData['related'],
): GuidePageData {
  return {
    path,
    title: data.heading,
    intro: data.description,
    metaTitle: data.title,
    metaDescription: data.description,
    quickAnswer: data.quickAnswer,
    ctaLabel,
    ctaHref: '/#trip-plan',
    lastReviewed: data.lastReviewed,
    lastModified: data.lastModified,
    isArticle: true,
    sections: data.contentSections,
    faqs: data.faqs.map(([question, answer]) => ({ question, answer })),
    related,
    sources: data.sourceLinks.map(([label, href]) => ({ label, href })),
  };
}

const contactEmail = 'chinaeastbuddy@gmail.com';
const siteUrl = 'https://chinaeasebuddy.com';
const gumroadLinks = {
  trip: import.meta.env.VITE_GUMROAD_TRIP_URL || 'https://chinaease.gumroad.com/l/trip-pass',
  group: import.meta.env.VITE_GUMROAD_GROUP_URL || 'https://chinaease.gumroad.com/l/group-pass',
} as const;
const standardDisclaimer =
  'ChinaEase Buddy is a digital travel toolkit. It is not an official travel authority, visa service, immigration service, medical service, legal service, financial service, hotel booking service, or flight booking service. Always confirm important travel, payment, health, and entry information with official sources or service providers.';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    note: 'Basic China travel toolkit for common travel situations',
    features: [
      'Essential apps, payments, transport, food, hotel and emergency tools',
      'Basic phrase cards and travel guides',
      '5 Buddy AI messages',
      'No payment required',
    ],
    cta: 'Start Free',
    href: '/',
    plan: 'free',
  },
  {
    name: 'Trip Pass',
    price: '$9.90',
    note: 'One-time payment',
    features: [
      '50 Buddy AI messages',
      'Valid for 14 days',
      'Extra travel help for one traveler',
      'One-time payment',
      'Instant access after purchase',
    ],
    cta: 'Get Trip Pass',
    href: gumroadLinks.trip,
    plan: 'trip_pass',
    featured: true,
  },
  {
    name: 'Group Pass',
    price: '$29.90',
    note: 'One-time payment',
    features: [
      '200 Buddy AI messages',
      'Valid for 14 days',
      'One account and one shared allowance for couples, families or small travel groups',
      'One-time payment',
      'Instant access after purchase',
    ],
    cta: 'Get Group Pass',
    href: gumroadLinks.group,
    plan: 'group_pass',
  },
];

const legalCopy = {
  terms: {
    title: 'Terms of Service',
    intro:
      'ChinaEase Buddy is a digital travel toolkit designed to help visitors understand practical travel situations in China.',
    sections: [
      {
        title: 'Service Scope',
        body:
          'ChinaEase Buddy provides travel information, bilingual phrase cards, menu references, payment setup guidance, and AI-assisted travel support for convenience only.',
      },
      {
        title: 'No Professional Services',
        body:
          'ChinaEase Buddy does not provide visa, immigration, medical, legal, financial, hotel booking, flight booking, or travel agency services. Users should make their own decisions and verify important information independently.',
      },
      {
        title: 'Emergencies',
        body:
          'In emergency situations, users should contact local emergency numbers, hospitals, police, embassies, consulates, or other qualified local professionals immediately.',
      },
      {
        title: 'Refunds',
        body:
          'ChinaEase Buddy passes are one-time purchases and are generally non-refundable once access is activated. This does not affect any statutory consumer rights you may have under your local laws.',
      },
      {
        title: 'Contact',
        body: `For support or legal questions, contact ${contactEmail}.`,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'ChinaEase Buddy collects only the information needed to provide account access, travel tools, and usage-limited digital services.',
    sections: [
      {
        title: 'Information We Collect',
        body:
          'We may collect your email address, account plan, entitlement status, usage quotas, basic app usage data, anonymous session ID, UTM attribution, newsletter email, trip planning details you choose to submit through Buddy, and information required to operate Buddy AI conversations and food reference tools.',
      },
      {
        title: 'Authentication and Storage',
        body:
          'ChinaEase Buddy uses Firebase Authentication for sign-in and Firebase Firestore to store account plan, quota, and related account data.',
      },
      {
        title: 'Buddy AI Conversations',
        body:
          'Buddy AI conversation content may be processed by ChinaEase Buddy service providers, including Coze, Cloudflare, Firebase, and Firestore, to provide the requested travel assistance, maintain service quality, and troubleshoot the service. Menu photo help is in private testing and is not sold as an active entitlement.',
      },
      {
        title: 'Payments and Entitlements',
        body:
          'For paid passes, we may store order identifiers, purchase email, plan, expiry, quota, and payment status. Payments are processed by Gumroad. We do not collect card details directly on this website.',
      },
      {
        title: 'Newsletter',
        body:
          'If you subscribe to travel updates, we store your email address, consent version, source path, UTM attribution, subscription status, and unsubscribe information. You can unsubscribe at any time.',
      },
      {
        title: 'Trip Planning Enquiries',
        body:
          'If you submit a trip planning enquiry through ChinaEase Buddy, we may collect your email address, approximate travel date, number of travelers, any information you choose to provide about the trip help you need, and an optional WhatsApp number if you ask us to reply there. This information is used only to review, process, and respond to your enquiry, and to provide help related to that specific trip. WhatsApp contact is optional and does not involve an automated verification code. Submitting a trip planning enquiry does not subscribe you to newsletters or marketing communications. Please do not submit passport information, payment card details, sensitive health or medical information, or other sensitive personal information you do not need to share for trip planning purposes. Trip planning enquiries are processed server-side. We may record a hashed version of your IP address for abuse prevention and security purposes. We do not store full Buddy conversation content as part of a trip planning submission. Trip enquiry data is retained for as long as needed to process your enquiry and for reasonable business record purposes. You may request access, correction, or deletion of your submitted information by contacting us. Trip planning enquiries may be reviewed by authorised team members to process and respond to your request. We may use a third-party email delivery service to send administrative notifications when a new enquiry is received. That provider processes only the information necessary to deliver the notification and is not used to send marketing communications to you. When you submit a trip planning enquiry, we may also send a transactional confirmation email to the address you provided to acknowledge receipt and to support any necessary follow-up communication. This email does not subscribe you to our newsletter or marketing communications. The email delivery service provider processes only the information necessary to deliver this confirmation.',
      },
      {
        title: 'Analytics and Service Improvement',
        body:
          'We use Cloudflare Web Analytics to measure aggregate page traffic and performance metrics. Cloudflare Web Analytics does not use cookies, does not store persistent identifiers, and does not track users across websites. Data is processed by Cloudflare, Inc. as described in Cloudflare\'s Privacy Policy. We also record limited interaction events — such as whether Buddy was opened or whether a trip planning enquiry form was submitted — to understand how the service is used and to improve it. These events are stored in our own systems. They do not include the contents of your conversations with Buddy, your trip enquiry text, your email address, payment information, or any other sensitive content. Events are not linked to a persistent user identifier and are not shared with advertising services.',
      },
      {
        title: 'Retention and Deletion',
        body:
          'We keep account, entitlement, payment, support, analytics, newsletter records, and trip planning enquiry records as needed to operate the service, investigate issues, meet legal obligations, and handle support requests. Contact us to request account deletion or privacy assistance.',
      },
      {
        title: 'No Sale of Data',
        body:
          'We do not sell user data to third parties. We use data only to operate, secure, and improve ChinaEase Buddy.',
      },
      {
        title: 'Contact',
        body: `For privacy requests, account deletion, or questions, contact ${contactEmail}.`,
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    intro: 'ChinaEase Buddy sells one-time digital travel passes for visitors traveling in China.',
    sections: [
      {
        title: 'Refund Approach',
        body:
          'All passes are one-time purchases and are generally non-refundable once access is activated. This does not affect any statutory consumer rights you may have under your local laws.',
      },
      {
        title: 'When to Contact Support',
        body:
          'Please contact support if the service was not provided, was materially different from its description, or you experienced a payment problem.',
      },
      {
        title: 'Payment Method',
        body:
          'If a refund is required under applicable law or after support review, processing times and method may depend on the payment provider.',
      },
      {
        title: 'No Auto-Renewal',
        body:
          'ChinaEase Buddy passes are one-time payments only. There is no auto-renewal and no subscription cancellation is needed.',
      },
      {
        title: 'Contact',
        body: `For payment problems or questions about your pass, contact ${contactEmail}.`,
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'Contact ChinaEase Buddy for account, refund, privacy, or product support.',
    sections: [
      {
        title: 'Email Support',
        body: `For all support requests, contact ${contactEmail}.`,
      },
      {
        title: 'What to Include',
        body:
          'Please include your account email, the issue you are experiencing, and any relevant purchase or account details. Do not send passwords, passport numbers, or sensitive medical information.',
      },
      {
        title: 'Important Note',
        body:
          'ChinaEase Buddy is a web-based digital China travel toolkit. It is not a visa, immigration, medical, financial, legal, hotel booking, flight booking, or travel agency service.',
      },
    ],
  },
  about: {
    title: 'About ChinaEase Buddy',
    intro:
      'ChinaEase Buddy is a web-based digital China travel toolkit built for foreign visitors in China.',
    sections: [
      {
        title: 'Use ChinaEase Buddy When You Need To',
        body:
          'Show useful Chinese phrases to locals; understand food, payment, transport, and hotel situations; get emergency help fast; and ask Buddy when you are stuck.',
      },
      {
        title: 'What It Does',
        body:
          'ChinaEase Buddy helps travelers access bilingual phrase cards, city survival guides, payment setup information, local transport tips, menu references, emergency guidance, and Buddy AI travel assistance.',
      },
      {
        title: 'What It Is Not',
        body:
          'ChinaEase Buddy is not a visa, immigration, medical, financial, legal, hotel booking, flight booking, or travel agency service. It does not replace local professionals or official authorities.',
      },
      {
        title: 'Traveler Responsibility',
        body:
          'Travelers should verify important information independently and contact local professional institutions, emergency services, embassies, consulates, hospitals, police, or payment providers when needed.',
      },
      {
        title: 'Contact',
        body: `Questions about ChinaEase Buddy can be sent to ${contactEmail}.`,
      },
    ],
  },
  unsubscribe: {
    title: 'Unsubscribe',
    intro: 'Stop receiving occasional China travel updates from ChinaEase Buddy.',
    sections: [
      {
        title: 'Newsletter',
        body:
          'Enter the email address you used for newsletter updates. This does not delete your ChinaEase Buddy account.',
      },
    ],
  },
};

// Keep conversion links and search-focused supporting content in the same data
// that renders the visible guide pages. The static build mirrors these additions.
function applyGuideSearchUpdates() {
Object.assign(guidePages['china-payment-guide'], {
  ctaLabel: 'Get my free China itinerary',
  ctaHref: '/#trip-plan',
  lastReviewed: 'September 30, 2026',
  lastModified: '2026-09-30',
  isArticle: true,
  featuredFaqCount: 3,
});
guidePages['china-payment-guide'].faqs.unshift(
  {
    question: 'Can foreigners use WeChat Pay without a Chinese bank account?',
    answer: 'Yes. Many foreign visitors can add an eligible Visa or Mastercard in WeChat by opening Me, then Services or Pay, Wallet, and Bank Cards. Complete any identity and issuer checks. Merchant support, card funding, fees, limits, and app labels can vary, so keep Alipay, a physical card, and RMB cash as backups.',
  },
  {
    question: 'Can foreigners use Alipay without a Chinese ID?',
    answer: 'Yes. Foreign visitors can register Alipay with an overseas mobile number and verify identity using a supported passport rather than a Chinese national ID. Add an eligible international Visa or Mastercard under Bank Cards. Approval, limits, merchant acceptance, and issuer verification vary, so prepare a second payment method.',
  },
  {
    question: 'Which is better for foreigners, Alipay or WeChat Pay?',
    answer: 'Alipay is often simpler as a dedicated payment and travel-services app, while WeChat Pay is convenient when you also use WeChat messaging and mini programs. Neither is universally better: set up both if possible, test them before relying on them, and carry a physical card and some RMB cash.',
  },
);
guidePages['china-payment-guide'].sections.push(
  {
    title: 'Prepare a payment backup before arrival',
    items: [
      'Install and verify payment apps while you can still receive messages on your usual phone number. Card linking, identity checks, issuer approval, and merchant acceptance can vary, so a successful setup is not guaranteed.',
      'Carry a physical Visa or Mastercard and a modest amount of RMB cash. Hotels, larger malls, and transport counters may accept cards, while smaller merchants often prefer a wallet QR code or cash.',
      'Save a payment-failure phrase in Chinese and avoid repeatedly retrying the same declined transaction. Try the other prepared wallet, ask whether cash is accepted, or contact your card issuer through a trusted channel.',
      'Check the fee, exchange rate, refund route, and any limit shown by the wallet or card issuer before confirming a large purchase. Payment rules and provider limits can change after this guide is reviewed.',
    ],
  },
  {
    title: 'Merchant QR codes and transport payments',
    items: [
      'A merchant-presented QR code and a personal transfer QR code can follow different rules. If a foreign card cannot fund a transfer-style payment, ask the merchant for its standard checkout code or use another method.',
      'Metro and bus payment options are city-specific. Some visitors activate a transport code inside Alipay, while others use a ticket machine, staffed counter, or local transit app. Keep a backup for the first ride.',
      'For DiDi, trains, hotels, and attractions, the payment method shown in one app may differ from what is accepted at an on-site counter. Read the checkout screen and preserve the booking receipt until the service is complete.',
    ],
  },
);

Object.assign(guidePages['china-travel-checklist'], {
  ctaLabel: 'Get my free China itinerary',
  ctaHref: '/#trip-plan',
  lastReviewed: 'September 30, 2026',
  lastModified: '2026-09-30',
  isArticle: true,
});
guidePages['china-travel-checklist'].sections.push(
  {
    title: 'Connectivity and app setup',
    items: [
      'Confirm that your phone is unlocked and supports the SIM, eSIM, or roaming plan you intend to use. Install the provider profile and save activation instructions before departure, but follow the provider timing for activation.',
      'Sign in to Alipay, WeChat, Amap, DiDi, Trip.com, and Railway 12306 where relevant. Keep access to your usual mobile number and email because identity or security checks may be required.',
      'Download offline copies of flight details, accommodation addresses, insurance contacts, and the first day route. Do not rely on one app or one connection for information needed immediately after landing.',
    ],
  },
  {
    title: 'Hotels, arrivals, and transport',
    items: [
      'Ask the accommodation to confirm foreign-passport check-in, late-arrival arrangements, the full Chinese address, phone number, and nearest entrance or station exit. Keep the reply with the booking confirmation.',
      'Check the exact airport terminal or railway station. Large cities have multiple airports and stations whose English names can look similar, so copy the destination directly from the ticket into your map or ride-hailing app.',
      'For a late arrival, compare the final airport rail or metro departure with a realistic immigration and baggage time. Save the official taxi queue location and a verified hotel transfer or DiDi pickup as alternatives.',
    ],
  },
  {
    title: 'Money, documents, and safety backups',
    items: [
      'Prepare at least two payment methods and some RMB cash. Tell your card issuer about the trip when appropriate, and never share a one-time password or payment PIN with a stranger offering setup help.',
      'Keep your passport, entry documents, onward booking, accommodation details, and emergency contacts accessible. Store secure copies separately, but do not leave sensitive identity images in a public photo album or shared device.',
      'Save 110 for police, 120 for ambulance, and 119 for fire. ChinaEase Buddy provides reference information and phrases, not emergency, medical, legal, immigration, or financial services.',
    ],
  },
);

guidePages['3-day-guilin-yangshuo-itinerary'].sections.push({
  title: 'Foreigner essentials: transport, payment, and hotels',
  items: [
    'Guilin has no city Metro, so save each destination in Chinese and use a verified DiDi, the official taxi queue, a public bus, or a pre-arranged hotel transfer. For the Li River, confirm the exact pier rather than entering only “Li River” in the app. In Yangshuo, vehicle access can stop short of pedestrian lanes, so ask the hotel for its recommended drop-off point and a Chinese message for the driver.',
    'For Xingping or Yangshuo rail connections, check the station printed on the ticket and the onward road transfer. Yangshuo railway station is near Xingping, not central Yangshuo. Build a buffer for luggage, station security, passport checks, and the possibility that a driver calls to clarify a pickup pin. Screenshot the car plate and destination before leaving reliable data coverage.',
    'Alipay and WeChat Pay are common at many restaurants, convenience shops, ticket desks, and tourism businesses, but a linked foreign card may not work for every merchant QR code. Keep a physical card and RMB cash as backups. For cruises, rafting, shows, and attraction tickets, use the payment channel named by the authorised seller and retain the receipt and cancellation terms.',
    'For the Guilin night, a staffed hotel near the central lakes, Guilin railway station, or a practical pickup corridor can simplify transfers. In Yangshuo, West Street is convenient but noisy; the Yulong River countryside is quieter but more dependent on road transport. Chinese authorities have said accommodation operators should not refuse overseas guests solely on qualification grounds, yet operational familiarity varies, so confirm foreign-passport check-in directly before paying.',
    'Ask the hotel to send its Chinese name, full address, phone number, map pin, and vehicle-access instructions. A platform listing alone is not enough when a property uses self-check-in or has limited reception hours. If registration is unclear, choose a staffed property with recent foreign-guest reviews and keep a second refundable option until confirmation arrives.',
  ],
});
guidePages['3-day-guilin-yangshuo-itinerary'].faqs.push({
  question: 'Do I need reservations for Guilin and Yangshuo attractions as a foreigner?',
  answer: 'Reserve the Li River cruise and any dated show or regulated activity in advance when availability matters. Passport details may be required. Public viewpoints and neighbourhood walks often do not need a reservation, but rules, weather closures, and capacity controls can change, so check the official operator before travel.',
});
guidePages['3-day-guilin-yangshuo-itinerary'].faqs.unshift(
  {
    question: 'Can foreign visitors pay with Alipay or WeChat Pay in Guilin and Yangshuo?',
    answer: 'Many foreign visitors can use Alipay or WeChat Pay after linking an eligible international card, but acceptance and card funding can vary. Keep a physical card and some RMB cash for small restaurants, countryside stops, or ticket sellers, and retain receipts for cruises, shows, and transport bookings.',
  },
  {
    question: 'How can I use DiDi in Guilin and Yangshuo without speaking Chinese?',
    answer: 'Guilin has no city Metro, so save every destination and the exact Li River pier in Chinese before booking DiDi. In Yangshuo, ask your hotel for the correct vehicle-access point because pedestrian lanes may block door-to-door pickup. Verify the licence plate and keep an official taxi backup.',
  },
  {
    question: 'What should foreign visitors confirm with hotels in Guilin or Yangshuo?',
    answer: 'Travelers do not need a special foreign-guest licence filter. Choose staffed accommodation that confirms foreign-passport registration and late-arrival arrangements. Bring the original passport used for booking, and save the Chinese hotel name, address, phone number, vehicle-access instructions, and written check-in confirmation offline before arrival.',
  },
);
Object.assign(guidePages['3-day-guilin-yangshuo-itinerary'], {
  featuredFaqCount: 3,
  lastReviewed: 'September 30, 2026',
  lastModified: '2026-09-30',
});

guidePages['3-day-shenzhen-itinerary'].sections.push({
  title: 'Foreigner essentials: Metro, DiDi, payment, and hotels',
  items: [
    'Shenzhen Metro is usually the simplest way to move between Futian, Luohu, and much of Nanshan. Save both the station name and exit number in Chinese because an attraction can be a long walk from the wrong exit. Ticket machines and staffed counters provide alternatives if a phone-based transport code is unavailable. Keep your passport accessible when a venue or intercity journey requires identity verification.',
    'Use DiDi for airport arrivals, late evenings, luggage transfers, or places beyond the central Metro network. Enter the exact attraction entrance or hotel lobby instead of a broad district name. At Bao’an Airport, a large mall, or Shenzhen North station, follow the marked ride-hailing pickup zone and send the bay or level to the driver. Verify the licence plate before entering.',
    'Alipay and WeChat Pay are widely used at shops, restaurants, malls, and many attractions, but foreign-card funding can still fail for a particular merchant or transaction type. Carry a physical bank card and some RMB cash. Confirm whether a timed attraction, museum exhibition, or theme park requires an online reservation before travelling across the city, and keep the booking QR code or passport record available.',
    'Futian is the easiest general base for central sights and transport; Nanshan suits OCT, Nantou, Shenzhen Bay, and Shekou; Luohu can suit Dongmen and Shenzhen Railway Station. There is not a special “foreign guest licence” that travelers should search for as a booking filter. Choose a staffed hotel that confirms it can register your foreign passport and provides a Chinese address and reception contact.',
    'Before paying a non-refundable rate, message the property with the passport nationality, arrival time, and number of guests. Ask whether reception will be open and whether every guest must be present for registration. Save the reply offline. For a Hong Kong transfer, also confirm the exact border checkpoint rather than selecting a hotel simply because it is advertised as close to Hong Kong.',
  ],
});
guidePages['3-day-shenzhen-itinerary'].faqs.push({
  question: 'Do I need reservations for Shenzhen attractions as a foreigner?',
  answer: 'Some museums, special exhibitions, observation decks, and theme parks use dated or timed reservations and may request passport details. Parks, waterfronts, and neighbourhood walks often do not. Check the official venue shortly before visiting because booking channels, closure days, and passport-entry procedures can change.',
});
guidePages['3-day-shenzhen-itinerary'].faqs.unshift(
  {
    question: 'Can foreign visitors pay with Alipay or WeChat Pay in Shenzhen?',
    answer: 'Many foreign visitors can use Alipay or WeChat Pay after linking an eligible international card, but acceptance and card funding can vary by merchant. Carry a physical card and some RMB cash, keep payment receipts, and confirm timed-attraction checkout requirements before travelling across the city.',
  },
  {
    question: 'How can I use DiDi in Shenzhen without speaking Chinese?',
    answer: 'Save the destination, entrance, and hotel address in Chinese, then place the pickup pin at the marked ride-hailing zone. At the airport, malls, and Shenzhen North station, send the bay or level to the driver and verify the licence plate before entering. Keep an official taxi backup.',
  },
  {
    question: 'What should foreign visitors confirm with Shenzhen hotels?',
    answer: 'Travelers do not need to search for a special foreign-guest licence as a booking filter. Choose a staffed hotel that confirms foreign-passport registration, reception hours, and the Chinese address before payment. Bring the physical passport used for booking and save the hotel\'s written confirmation offline.',
  },
);
Object.assign(guidePages['3-day-shenzhen-itinerary'], {
  featuredFaqCount: 3,
  lastReviewed: 'September 30, 2026',
  lastModified: '2026-09-30',
});

guidePages['china-travel-apps'].related.splice(
  8,
  1,
  { label: 'WeChat Pay without Chinese bank', href: '/china-payment-guide/' },
  { label: '3-day Shenzhen itinerary', href: '/3-day-shenzhen-itinerary/' },
  { label: '3-day Guilin and Yangshuo itinerary', href: '/3-day-guilin-yangshuo-itinerary/' },
);
guidePages['china-airport-arrival-guide'].related.splice(
  guidePages['china-airport-arrival-guide'].related.length - 1,
  0,
  { label: 'China travel checklist 2026', href: '/china-travel-checklist/' },
);
guidePages['3-day-guilin-yangshuo-itinerary'].related.push(
  { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
);
guidePages['3-day-shenzhen-itinerary'].related.push(
  { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
);
guidePages['3-day-guilin-yangshuo-itinerary'].ctaLabel = 'Get this as custom itinerary';
guidePages['3-day-shenzhen-itinerary'].ctaLabel = 'Get this as custom itinerary';
}

const guidePages: Record<GuidePageType, GuidePageData> = {
  guides: {
    path: '/guides/',
    title: 'China Travel Guides for Foreigners: Start Here',
    intro: 'Choose the right guide for entry rules, arrival, payments, apps, transport, hotels, food, safety, or a realistic first-trip route.',
    metaTitle: 'China Travel Guides for Foreigners: Visas, Apps & Itineraries',
    metaDescription:
      'Plan a China trip with practical guides for visa-free entry, airport arrival, payments, apps, transport, hotels, food, safety and itineraries.',
    quickAnswer:
      'Before booking, check entry rules and your arrival plan. Next, prepare mobile data, payments, maps and transport. Then choose a 7-, 10- or 14-day route and open the city guides that match your trip. Each section below links directly to the relevant guide or free tool.',
    reviewed: 'October 10, 2026',
    lastModified: '2026-10-10',
    ctaLabel: 'Open the free toolkit',
    ctaHref: '/',
    sections: [
      {
        title: 'Entry rules and arrival',
        links: [
          { label: 'China Visa-Free Checker', description: 'Check which verified policy may apply to your passport, date and route.', href: '/china-visa-free-checker/' },
          { label: 'China Visa-Free Travel Guide', description: 'Compare ordinary visa-free entry with third-country transit rules.', href: '/china-visa-free-travel-guide/' },
          { label: '240-Hour Visa-Free Transit', description: 'Check eligible countries, designated ports and permitted areas.', href: '/china-240-hour-visa-free-transit-2026/' },
          { label: 'China Airport Arrival Guide', description: 'Prepare immigration, baggage, customs, data and onward transport.', href: '/china-airport-arrival-guide/' },
          { label: 'Beijing Airport to City', description: 'Compare PEK and PKX express trains, taxis and late arrivals.', href: '/beijing-airport-to-city-guide/' },
          { label: '12367 Accommodation Registration', description: 'Understand online registration for private and non-hotel stays.', href: '/nia-12367-online-accommodation-registration-guide/' },
        ],
      },
      {
        title: 'Payments, apps and daily essentials',
        links: [
          { label: 'China Payment Guide', description: 'Prepare Alipay, WeChat Pay, cards and an RMB cash backup.', href: '/china-payment-guide/' },
          { label: 'China eSIM and Internet Guide', description: 'Choose, install and troubleshoot mobile data before arrival.', href: '/china-esim-internet-guide/' },
          { label: 'Essential China Travel Apps', description: 'Set up payments, maps, rides, trains and translation tools.', href: '/china-travel-apps/' },
          { label: 'China Food Ordering Guide', description: 'Use menus, explain dietary needs and handle payment.', href: '/china-food-ordering-guide/' },
          { label: 'Hotels for Foreigners', description: 'Book with a passport and understand accommodation registration.', href: '/china-hotels-for-foreigners/' },
          { label: 'China Travel Safety Guide', description: 'Prepare for scams, transport, local rules and emergencies.', href: '/china-travel-safety-guide/' },
        ],
      },
      {
        title: 'Transport and navigation',
        links: [
          { label: 'DiDi in China for Foreigners', description: 'Set up rides, pickup points, payment and safety checks.', href: '/didi-in-china-for-foreigners/' },
          { label: 'China Train Travel Guide', description: 'Book high-speed rail with a foreign passport and board correctly.', href: '/china-train-travel-guide/' },
          { label: 'China Metro Guide', description: 'Buy tickets, transfer lines and find the correct station exit.', href: '/china-metro-guide/' },
          { label: 'AMap in English', description: 'Search places and navigate China with English map support.', href: '/amap-in-english/' },
        ],
      },
      {
        title: 'First-trip routes and city itineraries',
        links: [
          { label: 'Compare 7, 10 and 14-Day Routes', description: 'Choose a realistic trip length and avoid unnecessary transfers.', href: '/china-itinerary-first-time-7-10-14-days/' },
          { label: '7-Day China Itinerary', description: 'Plan a focused two-city or faster three-city first trip.', href: '/7-day-china-itinerary/' },
          { label: '10-Day China Itinerary', description: 'Follow a balanced Beijing, Xi\'an and Shanghai route.', href: '/10-day-china-itinerary/' },
          { label: '14-Day China Itinerary', description: 'Add Chengdu, Guilin or another slower regional stop.', href: '/14-day-china-itinerary/' },
          { label: '3-Day Dali Itinerary', description: 'Plan Dali Old Town, Erhai Lake, Xizhou and Cangshan.', href: '/3-day-dali-itinerary/' },
          { label: 'China Golden Week 2026', description: 'Check October 1–7 dates, crowds, trains and booking priorities.', href: '/china-golden-week-2026-travel-guide/' },
        ],
      },
    ],
    faqs: [
      {
        question: 'What guide should I read first?',
        answer:
          'If you are preparing before arrival, start with China Travel Apps and China Travel Checklist. If you are already in China, open the payment guide or emergency numbers page based on your situation.',
      },
      {
        question: 'Are these official travel instructions?',
        answer:
          'No. These guides are practical travel references from ChinaEase Buddy. Confirm important entry, health, payment, and travel requirements with official sources or service providers.',
      },
    ],
    related: [
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'How to order food in China', href: '/china-food-ordering-guide/' },
      { label: 'Essential Chinese travel phrases', href: '/chinese-travel-phrases/' },
      { label: 'China travel safety guide', href: '/china-travel-safety-guide/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'AMap in English', href: '/amap-in-english/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: '3-day Xi\'an itinerary', href: '/3-day-xian-itinerary/' },
      { label: '3-day Chongqing itinerary', href: '/3-day-chongqing-itinerary/' },
      { label: '3-day Chengdu itinerary', href: '/3-day-chengdu-itinerary/' },
      { label: '3-day Guilin and Yangshuo itinerary', href: '/3-day-guilin-yangshuo-itinerary/' },
      { label: '3-day Zhangjiajie itinerary', href: '/3-day-zhangjiajie-itinerary/' },
      { label: '3-day Shenzhen itinerary', href: '/3-day-shenzhen-itinerary/' },
      { label: '3-day Guangzhou itinerary', href: '/3-day-guangzhou-itinerary/' },
      { label: '3-day Hangzhou itinerary', href: '/3-day-hangzhou-itinerary/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'WeChat Pay for foreigners', href: '/wechat-pay-for-foreigners/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
      { label: 'China 240-hour visa-free transit guide', href: '/china-240-hour-visa-free-transit-2026/' },
      { label: 'How to pay in China', href: '/china-payment-guide/' },
      { label: 'China eSIM and internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China train booking', href: '/china-train-booking-foreigners-12306/' },
      { label: 'First-time China itineraries', href: '/china-itinerary-first-time-7-10-14-days/' },
      { label: 'Is China safe for tourists?', href: '/is-china-safe-for-tourists-2026/' },
      { label: 'Best apps for China travel', href: '/best-apps-for-china-travel-2026/' },
      { label: 'How to use DiDi in China', href: '/didi-in-china-for-foreigners/' },
      { label: 'Beijing and Shanghai layover guide', href: '/beijing-shanghai-layover-240-hour-guide/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China hotels without rejection', href: '/china-hotels-for-foreigners-no-rejection-guide/' },
      { label: 'Google Maps and Amap guide', href: '/does-google-maps-work-in-china-amap-guide/' },
      { label: 'Great Wall from Beijing', href: '/how-to-visit-great-wall-from-beijing-2026/' },
      { label: 'What to eat in China', href: '/what-to-eat-in-china-first-time-guide/' },
      { label: 'WeChat for foreigners', href: '/how-to-use-wechat-as-foreigner-2026/' },
      { label: 'NIA 12367 accommodation registration', href: '/nia-12367-online-accommodation-registration-guide/' },
      { label: 'Amap English mode guide', href: '/amap-english-mode-guide-2026/' },
      { label: 'Alipay metro QR guide', href: '/alipay-metro-qr-transport-code-guide/' },
      { label: 'China travel AI itinerary generator', href: '/china-travel-ai-itinerary-generator/' },
      { label: '240-hour transit and high-speed rail', href: '/240-hour-transit-zone-map-high-speed-rail/' },
      { label: 'WeChat verification without a friend', href: '/wechat-verification-without-friend-qr-2026/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
  'tenpaygo-for-tourists': guideFromArticle(
    tenPayGoGuide,
    '/tenpaygo-for-tourists/',
    'Get my free China trip starter',
    [
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'WeChat Pay for foreigners', href: '/wechat-pay-for-foreigners/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
    ],
  ),
  'china-visa-free-checker': {
    path: '/china-visa-free-checker/',
    title: visaFreeCheckerGuide.heading,
    intro: visaFreeCheckerGuide.quickAnswer,
    metaTitle: visaFreeCheckerGuide.title,
    metaDescription: visaFreeCheckerGuide.description,
    quickAnswer: visaFreeCheckerGuide.quickAnswer,
    ctaLabel: 'Get my free trip starter',
    ctaHref: '/#trip-plan',
    lastReviewed: visaFreeCheckerGuide.lastReviewed,
    lastModified: visaFreeCheckerGuide.lastModified,
    sections: [],
    faqs: [],
    related: [],
  },
  'china-visa-free-travel-guide': {
    path: '/china-visa-free-travel-guide/',
    title: 'China Visa-Free Travel Guide for Tourists (2026)',
    intro:
      'A decision guide to ordinary 30-day visa-free entry, 240-hour visa-free transit, 24-hour transit, route rules, approved ports, and travel documents.',
    metaTitle: 'China Visa-Free Travel Guide (2026) | ChinaEase Buddy',
    metaDescription:
      'Compare China\'s 30-day visa-free entry and 240-hour transit rules. Check passport, route, purpose, ports, documents, and common mistakes.',
    quickAnswer:
      'First decide which policy fits your passport and route. China\'s ordinary visa-free entry lets eligible ordinary-passport holders visit for up to 30 days for approved purposes without needing a third-country itinerary. The separate 240-hour visa-free transit policy is available to eligible nationals only when they travel through mainland China to a third country or region, use an approved port, remain within the permitted area, and hold a confirmed onward ticket. A return trip such as London–Beijing–London is not third-country transit. Policies can change, and admission is still subject to border inspection, so verify your nationality, passport, purpose, route, ports, and exact dates with the official sources immediately before travel.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    isArticle: true,
    sections: [
      {
        title: 'Choose the correct entry route first',
        ordered: true,
        items: [
          'Ordinary visa-free entry: use this when your passport nationality is on the current visa-waiver list, your purpose is covered, and your intended stay is within the allowed period. A third-country route is not required.',
          '240-hour visa-free transit: use this only when your eligible itinerary continues from mainland China to a different country or region, through an approved port and within the permitted stay area.',
          '24-hour visa-free transit: this generally covers an international connection of no more than 24 hours while remaining in the restricted port area. Leaving that area requires a temporary entry permit.',
          'Visa required: arrange the correct visa in advance when your passport, purpose, route, port, destination area, or stay length does not satisfy a visa-free policy.',
          'Do not treat an airline ticket, arrival card, hotel booking, or this guide as approval to enter. Border inspection authorities make the final decision.',
        ],
      },
      {
        title: 'Ordinary visa-free entry: up to 30 days',
        items: [
          'As reviewed on 20 September 2026, China\'s Ministry of Foreign Affairs lists 50 nationalities whose valid ordinary-passport holders can enter without a visa for up to 30 days for business, tourism, family or friend visits, exchange, or transit.',
          'The route does not need to continue to a third country. Eligible travelers may depart for China from any country or region and may leave for the same country they came from.',
          'The 30-day stay is calculated from the day after entry and covers 30 calendar days, according to the Ministry of Foreign Affairs FAQ.',
          'No advance declaration to a Chinese embassy or consulate is required, but travelers should carry evidence consistent with the purpose of entry, such as flight tickets, accommodation reservations, and an itinerary or invitation when relevant.',
          'Work, long-term study, news reporting, and other purposes outside the waiver still require the appropriate visa or approval.',
          'Most of the listed waivers are scheduled to run through 31 December 2026; the official FAQ gives different validity for Brunei and Russia. Recheck the current list and policy period before every trip.',
        ],
      },
      {
        title: '240-hour visa-free transit: the route is essential',
        items: [
          'As reviewed on 20 September 2026, the National Immigration Administration lists 57 eligible nationalities, 65 approved ports, and permitted stay areas across 24 provincial-level regions.',
          'You need a valid ordinary passport and a confirmed onward international air, sea, or train ticket showing a seat and departure date within the permitted period.',
          'Your itinerary must transit mainland China on the way to a third country or region. The destination after mainland China must differ from the place from which you entered mainland China.',
          'You must enter through an approved port, leave through an approved port allowed for the itinerary, and remain inside the policy\'s designated area during the stay.',
          'Tourism, business, visits, and family reunions are allowed within the designated area. Work, study, and news reporting still require prior approval and the appropriate visa.',
          'Ten days is a maximum, not a guaranteed stay. Border officers examine the passport, route, ticket, purpose, and other circumstances at entry.',
        ],
      },
      {
        title: 'Route examples: what third-country transit means',
        items: [
          'London → Beijing → Tokyo: potentially qualifies as third-country transit when the passport, ports, tickets, dates, purpose, and permitted area all satisfy the current policy.',
          'London → Beijing → London: does not meet the third-country transit route requirement because the traveler returns to the same country.',
          'New York → Shanghai → Seoul: potentially qualifies for an eligible United States passport holder when every other condition is met.',
          'Sydney → Guangzhou → Bangkok: potentially qualifies for transit, although an eligible Australian ordinary-passport holder may also qualify for ordinary 30-day visa-free entry. Use the policy that accurately matches the journey.',
          'Separate tickets can create airline and missed-connection risks. Confirm that the carrier will check you in for the full route and that you can show the confirmed onward departure.',
        ],
      },
      {
        title: 'Documents to keep ready',
        ordered: true,
        items: [
          'Original valid ordinary passport. Check that its validity covers the intended stay and that the document type is accepted by the policy you plan to use.',
          'Confirmed inbound and outbound or onward bookings. Transit travelers should keep the ticket showing the confirmed seat and departure date to the third country or region.',
          'Accommodation reservation with the hotel\'s name, address, phone number, and Chinese-language details available offline.',
          'A simple itinerary and evidence matching the stated travel purpose; carry an invitation letter when it is relevant to a business, family, or exchange visit.',
          'Official policy pages saved offline, especially the current country list, approved ports, permitted areas, and policy dates applicable to the journey.',
          'Arrival-card confirmation when required. The National Immigration Administration\'s official online arrival-card service is free and does not replace entry eligibility.',
        ],
      },
      {
        title: 'Check the port and permitted area before booking',
        items: [
          'The 240-hour policy does not turn every mainland China airport, railway station, or seaport into an eligible entry or exit point.',
          'The permitted movement area varies by the port and region. Do not assume the policy allows unrestricted travel throughout mainland China.',
          'Check every mainland segment, including domestic connections. A connecting flight or train can take you outside the area allowed by the port through which you entered.',
          'Use the National Immigration Administration\'s current table of approved ports and permitted stay areas, then confirm the itinerary with the operating carrier before buying a restrictive ticket.',
          'If the route changes because of a cancellation or missed connection, contact the carrier and immigration authorities immediately rather than improvising a new domestic route.',
        ],
      },
      {
        title: 'At airline check-in and border inspection',
        ordered: true,
        items: [
          'Tell the airline which entry basis you intend to use and present the full confirmed itinerary. Check-in staff may need time to verify the current rule.',
          'At the China port, follow the sign or staff instruction for visa-free or temporary entry processing rather than joining a lane based only on an old airport video.',
          'Present the passport, onward booking, accommodation, and supporting travel-purpose documents clearly and consistently.',
          'Answer questions about the route, cities, stay length, and departure plan accurately. Do not describe a trip as transit when the ticket returns to the same country.',
          'Keep the entry record and confirm the permitted stay and area. If you are uncertain, ask the border officer before leaving the inspection area.',
        ],
      },
      {
        title: 'Common mistakes to avoid',
        items: [
          'Confusing ordinary 30-day visa-free entry with 240-hour visa-free transit. They have different nationality lists and route conditions.',
          'Assuming that any 10-day China stay is visa-free. Transit requires an eligible nationality, third-country route, approved ports, confirmed onward ticket, permitted area, and acceptable purpose.',
          'Counting a return to the origin country as third-country transit.',
          'Booking a domestic segment that leaves the permitted transit area or using a port not included in the current official table.',
          'Relying on a social-media country list or an old screenshot after the policy has changed.',
          'Treating the free arrival card as a visa application or entry approval.',
          'Planning work, study, or reporting activity under a tourist or transit exemption.',
        ],
      },
      {
        title: 'Final verification checklist',
        items: [
          'Passport nationality and document type are on the current official list for the policy you plan to use.',
          'Travel purpose is permitted and the stay is within the current maximum.',
          'For 240-hour transit, the origin and onward country or region are different and the ticket is confirmed.',
          'Every entry, domestic connection, destination, and exit fits the approved ports and permitted area.',
          'Accommodation, itinerary, onward ticket, and policy evidence are available offline.',
          'The airline and an official Chinese government, embassy, or consular source have been checked again immediately before departure.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is China visa-free for tourists in 2026?',
        answer:
          'China offers ordinary visa-free entry to eligible ordinary-passport holders and separate visa-free transit policies. Eligibility depends on nationality, passport type, purpose, route, port, permitted area, stay length, and travel dates.',
      },
      {
        question: 'What is the difference between 30-day visa-free entry and 240-hour transit?',
        answer:
          'Ordinary 30-day visa-free entry does not require a third-country route when the traveler meets that policy. The 240-hour policy requires eligible transit through mainland China to a different country or region and is limited to approved ports and permitted areas.',
      },
      {
        question: 'Does London to Beijing to London qualify for 240-hour visa-free transit?',
        answer:
          'No. It returns to the same country and therefore does not meet the third-country or region transit requirement.',
      },
      {
        question: 'Can a US passport holder visit China without a visa?',
        answer:
          'A United States passport holder is on the current 240-hour transit list but not the current ordinary 30-day unilateral visa-waiver list. The traveler must meet every transit condition or obtain the appropriate visa.',
      },
      {
        question: 'Can UK and Australian passport holders enter China visa-free?',
        answer:
          'As reviewed on 20 September 2026, the Ministry of Foreign Affairs lists the United Kingdom and Australia among the countries eligible for ordinary visa-free entry of up to 30 days for covered purposes. Recheck the official list and validity period before travel.',
      },
      {
        question: 'Can I travel anywhere in China during 240-hour visa-free transit?',
        answer:
          'No. You must remain within the permitted area associated with the approved entry port and use eligible entry and exit ports. Check the current National Immigration Administration table for the exact itinerary.',
      },
      {
        question: 'Does completing the China arrival card guarantee entry?',
        answer:
          'No. The arrival card records entry information; it does not replace a visa or visa-free eligibility, and it does not guarantee admission. The final decision is made by border inspection authorities.',
      },
    ],
    related: [
      { label: '240-hour visa-free transit guide', href: '/china-240-hour-visa-free-transit-2026/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'Ministry of Foreign Affairs: FAQs on visa-free entry into China',
        href: 'https://www.mfa.gov.cn/wjbzwfwpt/kzx/tzgg/202511/t20251110_11749824.html',
      },
      {
        label: 'National Immigration Administration: visa-free transit policies',
        href: 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html',
      },
      {
        label: 'National Immigration Administration: official arrival-card guidance',
        href: 'https://en.nia.gov.cn/n147418/n147463/c191530/content.html',
      },
      {
        label: 'Official China online arrival card form',
        href: 'https://s.nia.gov.cn/ArrivalCardFillingPC/',
      },
    ],
  },
  'china-airport-arrival-guide': {
    path: '/china-airport-arrival-guide/',
    title: 'Just Landed in China? Do These 5 Things in 30 Minutes',
    intro:
      'A step-by-step arrival plan for immigration, baggage, Customs, mobile data, payment, airport transfers, hotel check-in, and late-night backups.',
    metaTitle: 'China Airport Arrival Guide 2026: What to Do After Landing',
    metaDescription:
      'Follow China airport arrival step by step: arrival card, immigration, baggage, customs, eSIM, payments, taxi, metro and hotel check-in.',
    quickAnswer:
      'Before flying, confirm the entry rules for your exact passport, route, purpose, and travel dates, then complete China\'s free official online arrival card if it applies to you. Keep your passport, visa or other entry basis, accommodation details, and onward booking accessible offline. After landing, follow the airport signs through immigration, baggage claim, and Customs; connect your phone, test a payment backup, and use an official airport train, metro, taxi queue, or verified ride-hailing pickup. The arrival card is not a visa or permission to enter, and the final entry decision belongs to the immigration authorities.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 29, 2026',
    lastModified: '2026-10-09',
    isArticle: true,
    sections: [
      {
        title: 'Before your flight: prepare the arrival file',
        ordered: true,
        items: [
          'Confirm your visa, visa-free, or transit eligibility for your exact passport, route, purpose, and dates through an official Chinese embassy, consulate, or immigration source. Do not treat a general travel guide as an entry decision.',
          'Complete the free official National Immigration Administration online arrival card if required. The official form is available at s.nia.gov.cn/ArrivalCardFillingPC/. Beware of unofficial websites that charge a fee.',
          'Save your passport details, accommodation name, full address and phone number in both English and Chinese. Keep the first-night booking and any relevant onward ticket available offline.',
          'Install your eSIM before departure when the provider instructs you to, prepare Alipay or WeChat Pay, and carry a physical bank card plus some backup cash.',
          'Screenshot the airport terminal, hotel address, airport-transfer plan, and a backup route in case mobile data or an app fails after landing.',
        ],
      },
      {
        title: 'China arrival card: use the official free service',
        items: [
          'China\'s National Immigration Administration introduced online arrival-card submission for foreign travelers from 20 November 2025.',
          'The official service is free. It is available through the NIA website and official government channels; the direct web form is linked in the sources below.',
          'If you have not completed it before travel, the NIA says you can normally submit it at the arrival port using a mobile phone, airport device, official QR code, or paper card.',
          'Some traveler categories are exempt. Check the current NIA instructions rather than assuming the form applies to everyone.',
          'An arrival card does not replace a visa, visa-free eligibility, transit permission, passport inspection, or an immigration officer\'s entry decision.',
        ],
      },
      {
        title: 'Immigration after landing',
        ordered: true,
        items: [
          'Follow signs for International Arrivals, Immigration, or Border Inspection. Use the transit route only when you are actually remaining in or following the airport\'s international-transfer process.',
          'Keep your passport and applicable visa or entry documents ready, along with the arrival-card confirmation and accommodation or onward details when relevant.',
          'Answer questions clearly and consistently. If you do not understand a request, politely ask the officer to repeat it or request language help.',
          'Follow the instructions shown at that airport for photographs, fingerprints, inspection lanes, or additional checks; the process can differ by traveler and port.',
          'If a document or eligibility issue arises, speak with immigration or airline staff. China\'s NIA service hotline is 12367 within China.',
        ],
      },
      {
        title: 'Baggage claim and Customs',
        items: [
          'Check the airport screen for your flight\'s baggage belt and keep the baggage receipt until you have collected and inspected every checked bag.',
          'Report missing or damaged baggage to the airline or baggage-service desk before leaving the controlled claim area, and keep the written report or reference number.',
          'At Customs, follow the current declaration signs and declare goods when required. Personal-use and duty-free rules depend on the goods, quantity, value, and current Customs rules.',
          'If you are uncertain whether something must be declared, ask a Customs officer before choosing an exit channel. Do not rely on an old allowance screenshot or a social-media post.',
          'Keep medicines in their original packaging and carry supporting documents when relevant; restricted goods and medicine rules should be checked before departure.',
        ],
      },
      {
        title: 'Connect your phone and test payment',
        items: [
          'Turn on the travel eSIM or roaming line exactly as your provider instructs, select it for mobile data, and prevent the home line from using unintended roaming data.',
          'Airport Wi-Fi can be a temporary bridge, but login or verification requirements vary. Save essential information offline before flying.',
          'If an eSIM does not connect, check the selected data line, data-roaming setting, APN instructions, phone restart, and provider support. Do not delete the eSIM unless the provider tells you to.',
          'Open Alipay or WeChat Pay only after you have a stable connection and test a small purchase when practical.',
          'Keep a second wallet, physical card, and some RMB as backups. A linked international card can still fail because of verification, issuer, network, or merchant rules.',
        ],
      },
      {
        title: 'Choose a verified airport transfer',
        items: [
          'Airport rail or metro: usually clear and economical, but confirm the terminal, operating hours, destination station, transfers, luggage route, and final station exit.',
          'Official taxi queue: follow airport signs to the staffed or marked taxi rank. Show the hotel name and address in Chinese and ask for a receipt.',
          'DiDi or another approved ride-hailing service: confirm the numbered pickup zone, terminal, car model, licence plate, and driver details before entering.',
          'Hotel transfer: confirm the meeting point, driver contact, flight-number tracking, and late-arrival policy directly with the hotel.',
          'Avoid unsolicited drivers who approach you inside the terminal. When confused, return to an official transport desk, taxi queue, or clearly marked pickup area.',
        ],
      },
      {
        title: 'Hotel check-in and late-night arrivals',
        items: [
          'Keep the passport for every guest and the booking name ready. Tell the hotel in advance when your flight lands late or after the normal reception hours.',
          'Save the hotel name, Chinese address, phone number, nearest entrance, and a screenshot of the booking confirmation.',
          'Check whether the airport train or metro will still operate after immigration and baggage claim, not merely at the scheduled landing time.',
          'If the planned transport has stopped, use the official taxi queue or a verified ride-hailing pickup instead of accepting an unmarked ride.',
          'Hotels normally handle the accommodation registration process for their guests. For a private or non-hotel stay, confirm the current local registration steps with the host and local authorities.',
        ],
      },
      {
        title: 'Your first-hour backup plan',
        items: [
          'No mobile data: connect to official airport Wi-Fi or visit the information or telecom desk, then contact the eSIM or roaming provider.',
          'Payment failure: try the second wallet, a physical card, or cash; do not keep repeating a blocked transaction without checking the message.',
          'Cannot find the ride: verify the terminal and pickup-zone number, then use the in-app bilingual message or return to the official taxi queue.',
          'Missing baggage: report it before leaving baggage claim and give the airline a reachable phone number and hotel address.',
          'Entry or document problem: speak with immigration, the airline, or airport staff and use official channels such as the NIA 12367 service.',
        ],
      },
      {
        title: 'Useful airport phrases',
        items: [
          '国际到达在哪里？ — Where are international arrivals?',
          '入境检查在哪里？ — Where is immigration?',
          '我的行李没有到。 — My baggage did not arrive.',
          '海关申报在哪里？ — Where is the Customs declaration area?',
          '官方出租车上车点在哪里？ — Where is the official taxi pickup?',
          '请带我到这个地址。 — Please take me to this address.',
          '请帮我联系这家酒店。 — Please help me contact this hotel.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I need to complete a China arrival card?',
        answer:
          'Many foreign travelers entering China need an arrival card, but the National Immigration Administration lists exemptions for specific traveler categories. Check the current official instructions for your exact journey.',
      },
      {
        question: 'Is the China online arrival card free?',
        answer:
          'Yes. The National Immigration Administration states that the official online arrival-card service is free and warns travelers about unofficial websites that charge fees.',
      },
      {
        question: 'Can I fill in the arrival card after landing?',
        answer:
          'Yes. The NIA says travelers who have not completed it before travel can normally submit it at the port through official mobile or QR channels, on-site devices, or a paper card.',
      },
      {
        question: 'What documents should I keep ready at immigration?',
        answer:
          'Keep your passport and applicable visa or entry documents ready. It is also sensible to have your arrival-card confirmation, first accommodation details, and onward booking available when relevant to your route.',
      },
      {
        question: 'Should I wait until the airport to set up mobile data and payments?',
        answer:
          'No. Install and prepare your eSIM or roaming plan and payment apps before departure. After landing, activate them according to the provider instructions and test them while you still have airport help and Wi-Fi available.',
      },
      {
        question: 'What is the safest way to travel from a China airport to the city?',
        answer:
          'Use the official airport rail or metro, the marked taxi queue, a confirmed hotel transfer, or a verified ride-hailing pickup. Choose based on operating hours, terminal, luggage, destination, and arrival time.',
      },
      {
        question: 'What should I do for a late-night arrival?',
        answer:
          'Notify the hotel, save its Chinese address and phone number, check transport operating hours against your realistic exit time, and keep the official taxi queue or verified ride-hailing service as a backup.',
      },
    ],
    related: [
      { label: '240-hour visa-free transit guide', href: '/china-240-hour-visa-free-transit-2026/' },
      { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China visa-free checker', href: '/china-visa-free-checker/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'National Immigration Administration: warning about fake arrival-card websites',
        href: 'https://en.nia.gov.cn/n147418/n147463/c191530/content.html',
      },
      {
        label: 'Official China online arrival card form',
        href: 'https://s.nia.gov.cn/ArrivalCardFillingPC/',
      },
      {
        label: 'Chinese Embassy in the United States: online arrival card guidance',
        href: 'https://us.china-embassy.gov.cn/eng/lsfw/zj/qz2021/202512/t20251203_11765346.htm',
      },
      {
        label: 'General Administration of Customs of China',
        href: 'https://english.customs.gov.cn/',
      },
      {
        label: 'People\'s Bank of China: payment guide for visitors',
        href: 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html',
      },
    ],
  },
  'china-hotels-for-foreigners': {
    path: '/china-hotels-for-foreigners/',
    title: 'Can Foreigners Stay in Any Hotel in China? (2026 Guide)',
    intro:
      'A practical hotel guide for foreign-passport booking, check-in, accommodation registration, payments, late arrivals, and front-desk problems.',
    metaTitle: 'Can Foreigners Stay in Any Hotel in China? (2026)',
    metaDescription:
      'Can foreigners stay in any hotel in China? Learn the current rule, how to book with a foreign passport, confirm registration and handle check-in refusal.',
    quickAnswer:
      'Foreign visitors can book and stay in hotels in China using a valid passport. In 2024, China\'s public security, commerce, and immigration authorities said hotels must not refuse overseas guests merely because the property claims to lack a special foreign-guest qualification. In practice, some front desks may still be unfamiliar with passport registration, especially at small or newly opened properties. Before a non-refundable booking, confirm the exact property can register your passport, save the written confirmation, enter every guest\'s name exactly as shown on the passport, and notify the hotel if you will arrive late. A hotel normally completes the accommodation registration for its guests; a private or non-hotel stay follows separate local registration procedures.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'October 7, 2026',
    lastModified: '2026-10-07',
    isArticle: true,
    sections: [
      {
        title: 'Can foreigners stay in any hotel in China?',
        items: [
          'China\'s public security, commerce, and immigration authorities stated in 2024 that hotels must not refuse overseas travelers merely on the basis that they lack a so-called foreign-related qualification.',
          'Hotels still need to verify each guest\'s identity and report the required accommodation information to the local public security authority.',
          'A property may still be unavailable for ordinary reasons such as no rooms, renovation, age restrictions, or a booking problem. The policy does not guarantee a room at every property on every date.',
          'Operational mistakes can still occur when staff are unfamiliar with foreign passports or the registration system. Confirming directly before a restrictive booking reduces arrival risk.',
          'Special locations, controlled areas, or unusual accommodation types may have additional local requirements. Check the exact property and destination rather than relying on a general statement.',
        ],
      },
      {
        title: 'How to book a China hotel with a foreign passport',
        ordered: true,
        items: [
          'Confirm the exact hotel name, branch, street address, and city. Chinese chains can have several properties with almost identical English names.',
          'Ask in writing whether the property can check in guests using your passport nationality and document type. Save the reply in the booking app and as a screenshot.',
          'Choose free cancellation or pay-at-property terms when the hotel is small, remote, newly listed, or has few recent international reviews.',
          'Check the reception hours and late-arrival rule. A confirmed reservation can still be released when the property is not told about a post-midnight arrival.',
          'Review room occupancy, breakfast, window type, smoking status, lift access, deposit, tax, cancellation deadline, and whether every guest is included in the booking.',
        ],
      },
      {
        title: 'Use the passport name correctly',
        items: [
          'Enter the surname and given names as the booking form instructs and as they appear in the machine-readable passport. Avoid nicknames and translated names.',
          'Bring the original valid passport for every foreign guest, including children. A photo or photocopy may not be sufficient for identity verification and registration.',
          'If the booking is under one traveler but a different person arrives first, add the arriving guest to the reservation or contact the property in advance.',
          'For a recently renewed passport, make sure the booking and any visa or entry details use the current document number where required.',
          'Keep the reservation number, payment receipt, cancellation terms, and the hotel\'s written confirmation accessible offline.',
        ],
      },
      {
        title: 'Choose a useful location, not just a cheap room',
        items: [
          'Search the hotel\'s Chinese address in AMap and confirm the distance to the correct metro station exit, railway station, airport route, or attraction entrance.',
          'Check the full railway-station or airport name. A low room price can be poor value if it creates long transfers or an expensive late-night ride.',
          'Read recent reviews for noise, construction, smoke, heating or air-conditioning, lift access, reception service, and foreign-passport check-in experiences.',
          'Save the hotel name, address, phone number, nearest landmark, and entrance photo in Chinese for taxi and DiDi drivers.',
          'For the first night, prioritize a 24-hour reception and a straightforward airport transfer over a difficult apartment or unstaffed self-check-in.',
        ],
      },
      {
        title: 'Payment, deposits, and receipts',
        items: [
          'Check whether the booking is prepaid, guaranteed by card, or payable at the property. A card used to guarantee a room may not be the final payment method.',
          'International-card acceptance varies. Prepare Alipay or WeChat Pay where available, a physical card, and some RMB as backups.',
          'Hotels may request a refundable deposit for the room or incidental charges. Confirm the amount, payment route, release timing, and receipt before paying.',
          'Do not assume the price includes every tax, breakfast, extra bed, or child charge. Review the final booking summary and property policy.',
          'If you need a formal invoice, ask the property before checkout what information and payment evidence it requires.',
        ],
      },
      {
        title: 'China hotel check-in with a foreign passport',
        ordered: true,
        items: [
          'Show the original passport for every guest and the reservation confirmation. Staff may scan or manually enter passport and entry information.',
          'Confirm the room type, number of nights, breakfast, deposit, checkout time, and payment status before accepting the key.',
          'The hotel normally completes the required accommodation registration and submits the guest information to the local public security authority.',
          'Ask for the Wi-Fi name and password, hotel card or Chinese address, breakfast location, and the best entrance for taxis or ride-hailing.',
          'Inspect the room promptly and report a wrong room type, smoke smell, damage, missing item, or safety problem before settling in.',
        ],
      },
      {
        title: 'Late-night arrival plan',
        items: [
          'Message or call the hotel with the booking number, flight or train number, and realistic arrival time. Ask the property to hold the room for late arrival.',
          'Confirm that reception is staffed at your arrival time; self-check-in instructions designed for a Chinese ID card may not work with a foreign passport.',
          'Save the hotel\'s Chinese name, address, phone number, entrance image, and a screenshot of the late-arrival confirmation.',
          'Check airport rail and metro operating hours against the time you are likely to leave baggage claim, not the scheduled landing time.',
          'Keep an official taxi queue or verified DiDi pickup as the transport backup and one alternative hotel with 24-hour reception as an emergency option.',
        ],
      },
      {
        title: 'If a hotel refuses your passport at the desk',
        ordered: true,
        items: [
          'Stay calm and ask whether a manager or experienced staff member can complete the foreign-passport registration.',
          'Show the written booking confirmation and politely explain that national authorities have said hotels should not refuse overseas guests merely for lacking foreign-guest qualification.',
          'Ask the property to state the exact reason for refusal in the booking platform message. Save the reservation, payment, chat, and front-desk details.',
          'Contact the booking platform while you are still at the property and request a penalty-free cancellation, refund, and immediate alternative accommodation.',
          'If the issue cannot be resolved quickly, prioritize a safe replacement hotel. Later complaints can be directed through the platform or relevant local service channels with documentation.',
        ],
      },
      {
        title: 'Hotels versus private or non-hotel stays',
        items: [
          'When you stay in a hotel, the hotel is responsible for completing and reporting the accommodation registration required for its guests.',
          'When a foreign visitor stays in a home, apartment, friend\'s residence, or another non-hotel address, the foreign visitor or host generally must register with the local public security authority within 24 hours of arrival.',
          'From September 21, 2026, the National Immigration Administration expanded online non-hotel accommodation registration nationwide.',
          'The service can be accessed through the NIA government-service website, the NIA 12367 app, or official WeChat and Alipay mini-programs; in-person registration remains available.',
          'When the online service fails or an address cannot be matched, ask the host and local public security authority for help or call 12367.',
        ],
      },
      {
        title: 'Useful Chinese hotel phrases',
        items: [
          '请确认可以用外国护照入住。 — Please confirm that I can check in with a foreign passport.',
          '这是我的预订确认。 — This is my booking confirmation.',
          '我会很晚到，请帮我保留房间。 — I will arrive late; please hold the room.',
          '请帮我办理住宿登记。 — Please help me complete the accommodation registration.',
          '押金是多少？什么时候退？ — How much is the deposit, and when will it be returned?',
          '请告诉我不能入住的具体原因。 — Please tell me the exact reason I cannot check in.',
          '请在预订平台上确认退款。 — Please confirm the refund in the booking platform.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners stay in any hotel in China?',
        answer:
          'National authorities have said hotels must not refuse overseas guests merely because they lack a special foreign-guest qualification. However, room availability, property policy, local conditions, and staff familiarity can still affect a specific stay, so confirm before a restrictive booking.',
      },
      {
        question: 'Which hotels in China accept foreigners?',
        answer:
          'National authorities have said hotels must not reject overseas guests merely because they lack a special foreign-guest qualification. In practice, choose a property that can register your passport, confirm the exact branch in writing, and prefer flexible cancellation when staff experience is uncertain.',
      },
      {
        question: 'How can I confirm a China hotel accepts my foreign passport?',
        answer:
          'Message the exact property before booking and ask whether it can check in your passport nationality and document type. Save the reply, use every guest\'s passport name, confirm reception hours, and avoid a non-refundable rate when the answer is unclear.',
      },
      {
        question: 'Do Chinese hotels need a special licence to accept foreigners?',
        answer:
          'In 2024, public security, commerce, and immigration authorities stated that hotels must not use a lack of foreign-related qualification as the reason to refuse overseas guests. Hotels still have identity-checking and guest-registration duties.',
      },
      {
        question: 'Do I need my passport to check in?',
        answer:
          'Yes. Bring the original valid passport for every foreign guest. The hotel needs identity and travel-document information for check-in and accommodation registration.',
      },
      {
        question: 'Do I need to register with the police if I stay in a hotel?',
        answer:
          'The hotel normally handles and reports the accommodation registration for its guests. A private home, apartment, or other non-hotel stay follows a separate process and generally requires registration within 24 hours.',
      },
      {
        question: 'Can I book a China hotel through an international booking website?',
        answer:
          'Yes, but verify the exact property, passport check-in, guest names, cancellation terms, payment route, and late-arrival policy. A platform listing does not replace direct confirmation when the booking risk is high.',
      },
      {
        question: 'Can I pay a China hotel with a foreign credit card?',
        answer:
          'Some hotels accept international cards, while others use Alipay, WeChat Pay, cash, or domestic payment routes. Confirm the property\'s current options and keep more than one payment method.',
      },
      {
        question: 'What should I do if a hotel refuses me at check-in?',
        answer:
          'Ask for a manager, show the written confirmation, request the exact reason in writing, and contact the booking platform for a refund and replacement. Prioritize safe alternative accommodation instead of prolonging a late-night dispute.',
      },
    ],
    related: [
      { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'DiDi without Chinese', href: '/didi-in-china-for-foreigners/' },
      { label: 'How to pay for DiDi in China', href: '/didi-payment-for-foreigners/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'Gansu government: official response on hotel access for overseas travelers',
        href: 'https://www.gansu.gov.cn/gsszf/c100199/202406/173933391.shtml',
      },
      {
        label: 'National Immigration Administration: nationwide online non-hotel registration',
        href: 'https://www.nia.gov.cn/n897453/c1806111/content.html',
      },
      {
        label: 'People\'s Bank of China: payment guide for visitors',
        href: 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html',
      },
    ],
  },
  'china-food-ordering-guide': {
    path: '/china-food-ordering-guide/',
    title: 'How to Order Food in China: Menu and Allergy Guide (2026)',
    intro:
      'A practical restaurant guide for QR and photo menus, shared dishes, dietary needs, serious food allergies, payment, and useful Chinese phrases.',
    metaTitle: 'How to Order Food in China (2026) | ChinaEase Buddy',
    metaDescription:
      'Order food in China with confidence. Use photo and QR menus, explain allergies or dietary needs, pay, avoid common mistakes, and save useful Chinese phrases.',
    quickAnswer:
      'You can order without speaking Chinese by using a QR menu, a photo menu, or a translation app and pointing to the dish. Confirm the number of dishes, spice level, rice, drinks, and payment before finishing the order. If you have a serious food allergy, show a clinician-reviewed bilingual allergy card, name the exact allergen and its oils, sauces, stocks, and derivatives, ask about shared woks and utensils, and do not eat the dish when staff cannot confirm. A translation app or phrase card is useful communication support, but it is not a medical safeguard.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    isArticle: true,
    sections: [
      {
        title: 'The simplest way to order',
        ordered: true,
        items: [
          'Choose a restaurant where you can see a paper, wall, photo, counter, or QR menu and where staff can answer questions when you have dietary restrictions.',
          'Open the QR menu in WeChat, Alipay, or your browser when offered. If it does not load, ask for a paper or photo menu instead.',
          'Use photos and translated dish names to shortlist choices, then ask about ingredients, spice level, portion size, and allergens before submitting.',
          'Check the cart or repeat the order with staff. Confirm the quantity of each dish and whether steamed white rice, drinks, or tableware are separate charges.',
          'Pay through the menu or at the counter with Alipay, WeChat Pay, an accepted card, or cash. Keep a second payment method ready.',
        ],
      },
      {
        title: 'QR, photo, paper, and counter menus',
        items: [
          'QR ordering varies by restaurant. The code may open a WeChat mini-program, Alipay mini-program, or ordinary web page; some require a table number or phone verification.',
          'A photo menu is often easier than translating a long dish name, but a picture does not reveal cooking oil, stock, sauce, garnish, or cross-contact risk.',
          'At counter-service restaurants, point to the item and show the quantity with your phone. Check whether you must collect the food when a number is called.',
          'Keep an offline translation tool available, because a menu or mini-program may not offer English and mobile data can fail.',
          'Save the restaurant name and address in Chinese so you can return, share it with companions, or explain your location if help is needed.',
        ],
      },
      {
        title: 'Shared dishes, rice, spice, and portions',
        items: [
          'Many sit-down meals are ordered for the table and shared. Ask the server how many people a dish serves instead of ordering one main dish per person automatically.',
          'Steamed white rice is often ordered separately. Ask for the exact number of bowls you need: 请给我一碗白米饭。',
          'Spice levels are not standardized. “Not spicy” may still include chili oil or pepper, so ask whether the dish itself, sauce, garnish, or hotpot base contains chili.',
          'Cold dishes, tea, tableware, tissues, or snacks placed on the table may be chargeable. Ask before opening or using them if the price matters.',
          'For leftovers, ask 可以打包吗？ (“Can I take this away?”), but refrigerate perishable food promptly and discard it if storage has been unsafe.',
        ],
      },
      {
        title: 'Vegetarian, vegan, and halal needs',
        items: [
          'A dish described as vegetables or 素菜 may still contain meat stock, oyster sauce, lard, egg, or a garnish. Name everything you avoid rather than relying on one label.',
          'For vegetarian food, show: 我是素食者，不吃肉、鱼和海鲜。 Ask separately about broth, sauces, cooking fat, and shared cookware when those matter to you.',
          'For vegan food, also ask the restaurant to exclude egg, dairy, honey, fish sauce, oyster sauce, meat stock, and animal fat as applicable.',
          'For halal food, look for 清真, then confirm pork, lard, alcohol, meat sourcing, and shared utensils according to your requirements. A sign alone may not answer every question.',
          'When staff cannot confirm an ingredient or preparation method, choose a simpler dish or another restaurant instead of guessing.',
        ],
      },
      {
        title: 'Serious food allergies and cross-contact',
        items: [
          'Prepare a clinician-reviewed bilingual allergy card that states the exact allergen, common derivatives, severity, and what must be avoided. Do not rely on automatic translation alone.',
          'Show the card before ordering and ask staff to confirm sauces, oils, marinades, stock, garnish, shared woks, utensils, chopping boards, and fryers.',
          'Use direct wording such as 我对花生严重过敏。 (“I have a severe peanut allergy.”) and ask whether the dish contains peanuts, peanut oil, or peanut sauce.',
          'Cross-contamination can occur even when the main ingredient is absent. If staff appear unsure or the kitchen cannot prevent cross-contact, do not eat the dish.',
          'China\'s updated GB 7718-2025 prepackaged-food label standard includes allergen provisions but takes effect in 2027. In 2026, do not assume allergen declarations are uniform; read the full ingredient list and ask.',
        ],
      },
      {
        title: 'Food and water safety',
        items: [
          'Choose food that is cooked thoroughly and served steaming hot. Avoid raw or undercooked meat, poultry, seafood, eggs, and food that has been sitting lukewarm.',
          'Prefer busy stalls and restaurants where food is prepared fresh. Street food is safer when cooked in front of you and served hot rather than held at room temperature.',
          'Use factory-sealed bottled water or water that has been properly treated when safety is uncertain, and check that the bottle seal is intact.',
          'Wash your hands with soap and water before eating, or use an alcohol-based hand sanitizer when washing is not available.',
          'People who are pregnant, older, very young, or immunocompromised should take particular care with high-risk foods and seek personalized medical advice before travel.',
        ],
      },
      {
        title: 'Payment and receipts',
        items: [
          'Some QR menus combine ordering and payment; others only send the order and require payment at the counter. Check before leaving the table.',
          'Alipay and WeChat Pay are common, but availability and foreign-card transactions vary. Keep a physical card and some RMB as backups.',
          'Confirm the total, service or tableware charges, and any deposit before paying. Ask for a receipt when you need to review the order or claim reimbursement.',
          'If the mobile payment fails, try the second wallet, another linked card, a physical card accepted by the restaurant, or cash rather than repeatedly submitting the same charge.',
        ],
      },
      {
        title: 'If an allergic reaction starts',
        items: [
          'Treat breathing difficulty, throat or tongue swelling, faintness, or a rapidly worsening reaction as an emergency. Anaphylaxis can be life-threatening and progress quickly.',
          'Follow your personal emergency plan and use your prescribed adrenaline auto-injector immediately if instructed to do so; do not wait for a translation app to settle the diagnosis.',
          'Call 120 for an ambulance in China, or ask staff: 请帮我叫救护车，我可能严重过敏。 (“Please call an ambulance; I may be having a severe allergic reaction.”)',
          'Carry prescribed emergency medicine with you, not in checked luggage or back at the hotel, and tell companions where it is and how to help.',
          'This guide is general travel information, not medical advice. Discuss severe allergies and an emergency plan with a qualified clinician before travel.',
        ],
      },
      {
        title: 'Useful Chinese restaurant phrases',
        items: [
          '可以看一下英文菜单吗？ — Can I see an English menu?',
          '请给我看有图片的菜单。 — Please show me a menu with pictures.',
          '这个辣吗？ / 请不要放辣。 — Is this spicy? / Please do not make it spicy.',
          '请给我一碗白米饭。 / 可以打包吗？ — Please give me a bowl of steamed white rice. / Can I take this away?',
          '我对花生严重过敏。 — I have a severe peanut allergy.',
          '这道菜里有花生、花生油或花生酱吗？ — Does this contain peanuts, peanut oil, or peanut sauce?',
          '请不要使用含花生的调料、油或厨具。 — Do not use sauces, oil, or utensils containing peanuts.',
          '我不吃猪肉。 / 我是素食者，不吃肉、鱼和海鲜。 — I do not eat pork. / I am vegetarian; I do not eat meat, fish, or seafood.',
        ],
      },
      {
        title: 'Common mistakes to avoid',
        items: [
          'Assuming every QR menu has English, accepts a foreign phone number, or completes payment automatically.',
          'Ordering from a photo without checking hidden ingredients, cooking oil, sauce, stock, garnish, or cross-contact.',
          'Treating “vegetable,” 素菜, 清真, or a translated label as a complete guarantee for a dietary or medical requirement.',
          'Using a generic translation card for a severe allergy without clinician review, exact allergen names, derivatives, and an emergency plan.',
          'Relying on one payment app, ordering too many shared dishes, or forgetting that rice may need to be ordered separately.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can tourists order food in China without speaking Chinese?',
        answer:
          'Yes. Use a QR, paper, or photo menu; point to the dish; use an offline translation app; and show short Chinese phrases. Confirm the item, quantity, spice level, rice, and total before submitting the order.',
      },
      {
        question: 'Do restaurants in China have English menus?',
        answer:
          'Some tourist-area, hotel, chain, and larger restaurants do, but many local restaurants do not. A photo menu, translation app, and saved Chinese phrases are useful backups.',
      },
      {
        question: 'How do QR restaurant menus work in China?',
        answer:
          'Scan the table code with WeChat, Alipay, or your phone camera. It may open a mini-program or web page where you choose items and sometimes pay. If it requires unsupported verification or does not load, ask for a paper or photo menu.',
      },
      {
        question: 'Is Chinese food always spicy?',
        answer:
          'No. Chinese cuisines vary greatly, and many dishes are mild. Ask 这个辣吗？ and 请不要放辣, while remembering that chili may also appear in oil, sauce, garnish, or hotpot base.',
      },
      {
        question: 'How do I explain vegetarian, vegan, or halal needs?',
        answer:
          'Name the specific ingredients and preparation methods you avoid. Ask about stock, sauces, lard, egg, dairy, alcohol, meat sourcing, and shared cookware rather than relying only on a broad label.',
      },
      {
        question: 'How should I handle a severe food allergy in China?',
        answer:
          'Carry a clinician-reviewed bilingual allergy card and prescribed emergency medicine, ask about exact ingredients and cross-contact, and do not eat when staff cannot confirm. Follow your medical action plan and call 120 for a severe reaction.',
      },
      {
        question: 'How do tourists pay at restaurants in China?',
        answer:
          'Many restaurants accept Alipay or WeChat Pay, while some accept cards or cash. The QR menu may collect payment or you may pay at the counter. Keep at least one backup method.',
      },
    ],
    related: [
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Essential Chinese travel phrases', href: '/chinese-travel-phrases/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'WeChat Pay for foreigners', href: '/wechat-pay-for-foreigners/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
      { label: 'AMap in English', href: '/amap-in-english/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'CDC: food and drink safety while traveling', href: 'https://wwwnc.cdc.gov/travel/page/food-water-safety' },
      { label: 'China National Health Commission: GB 7718-2025 FAQ', href: 'https://www.nhc.gov.cn/sps/c100087/202509/bc824a504ec34c27883da73f14c20d44.shtml' },
      { label: 'China Customs: GB 7718-2025 standard record', href: 'https://jckspj.customs.gov.cn/spj/2024-07/25/article_2025121606074757815.html' },
      { label: 'NHS: anaphylaxis symptoms and emergency action', href: 'https://www.nhs.uk/conditions/anaphylaxis/' },
      { label: 'People\'s Bank of China: payment guide for visitors', href: 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html' },
    ],
  },
  'chinese-travel-phrases': {
    path: '/chinese-travel-phrases/',
    title: 'Essential Chinese Phrases for Travel in China (2026)',
    intro:
      'A practical Mandarin phrase guide with Chinese characters, pinyin, and English for transport, hotels, restaurants, payments, directions, and emergencies.',
    metaTitle: 'Essential Chinese Travel Phrases (2026) | ChinaEase Buddy',
    metaDescription:
      'Save essential Chinese phrases for travel in China, with characters, pinyin, and English for taxis, hotels, food, payments, trains, directions, and emergencies.',
    quickAnswer:
      'You do not need fluent Mandarin for a first trip to China, but you should save a compact set of phrases in Chinese characters. Show the Chinese sentence full-screen when pronunciation is difficult, keep the address or destination beside it, and download an offline translation tool before arrival. Pinyin helps you attempt the sound, but showing the characters is usually more reliable in a noisy station, taxi, restaurant, or emergency.',
    ctaLabel: 'Open the free phrase tools',
    ctaHref: '/?journey=china',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    isArticle: true,
    sections: [
      {
        title: 'How to use these phrases',
        ordered: true,
        items: [
          'Save this page and screenshot the phrases you are most likely to need. Do not assume mobile data will be available exactly when a problem occurs.',
          'Show the Chinese characters at a readable size. For an address, hotel, station, or attraction, show the exact Chinese name as well as the sentence.',
          'Use pinyin as a pronunciation aid, not as the only message. Tone marks matter, and an English approximation can easily be misunderstood.',
          'Keep each request short and specific. Ask one question at a time, then use 可以打字吗？ to invite the person to type the answer.',
          'For medical, allergy, police, immigration, or legal situations, use these phrases only to obtain help; contact the appropriate professional or authority directly.',
        ],
      },
      {
        title: 'Basic communication',
        items: [
          '你好 — nǐ hǎo — Hello.',
          '谢谢 — xièxie — Thank you.',
          '不好意思 — bù hǎo yìsi — Excuse me / sorry.',
          '我不会说中文。— wǒ bù huì shuō Zhōngwén — I do not speak Chinese.',
          '我听不懂。— wǒ tīng bù dǒng — I do not understand.',
          '请说慢一点。— qǐng shuō màn yìdiǎn — Please speak more slowly.',
          '可以打字吗？— kěyǐ dǎzì ma — Can you type it?',
          '请写下来。— qǐng xiě xiàlái — Please write it down.',
        ],
      },
      {
        title: 'Directions, taxis, and ride-hailing',
        items: [
          '请带我去这个地址。— qǐng dài wǒ qù zhège dìzhǐ — Please take me to this address.',
          '地铁站在哪里？— dìtiě zhàn zài nǎlǐ — Where is the metro station?',
          '这个入口在哪里？— zhège rùkǒu zài nǎlǐ — Where is this entrance?',
          '我走错了吗？— wǒ zǒu cuò le ma — Am I going the wrong way?',
          '请在这里停车。— qǐng zài zhèlǐ tíngchē — Please stop here.',
          '我在这个上车点。— wǒ zài zhège shàngchē diǎn — I am at this pickup point.',
          '我找不到您。— wǒ zhǎo bù dào nín — I cannot find you.',
          '车牌号是多少？— chēpái hào shì duōshao — What is the licence-plate number?',
        ],
      },
      {
        title: 'Hotel phrases',
        items: [
          '我有预订。— wǒ yǒu yùdìng — I have a reservation.',
          '我可以用护照入住吗？— wǒ kěyǐ yòng hùzhào rùzhù ma — Can I check in with my passport?',
          '请帮我办理住宿登记。— qǐng bāng wǒ bànlǐ zhùsù dēngjì — Please help me complete the accommodation registration.',
          'Wi-Fi密码是什么？— Wi-Fi mìmǎ shì shénme — What is the Wi-Fi password?',
          '房间里没有热水。— fángjiān lǐ méiyǒu rèshuǐ — There is no hot water in the room.',
          '可以晚一点退房吗？— kěyǐ wǎn yìdiǎn tuìfáng ma — Can I check out later?',
          '请帮我叫一辆出租车。— qǐng bāng wǒ jiào yí liàng chūzūchē — Please call a taxi for me.',
        ],
      },
      {
        title: 'Restaurant and food phrases',
        items: [
          '可以看一下英文菜单吗？— kěyǐ kàn yíxià Yīngwén càidān ma — Can I see an English menu?',
          '请给我看有图片的菜单。— qǐng gěi wǒ kàn yǒu túpiàn de càidān — Please show me a menu with pictures.',
          '这个辣吗？— zhège là ma — Is this spicy?',
          '请不要放辣。— qǐng bù yào fàng là — Please do not make it spicy.',
          '请给我一碗白米饭。— qǐng gěi wǒ yì wǎn bái mǐfàn — Please give me a bowl of steamed white rice.',
          '我对花生严重过敏。— wǒ duì huāshēng yánzhòng guòmǐn — I have a severe peanut allergy.',
          '我不吃猪肉。— wǒ bù chī zhūròu — I do not eat pork.',
          '可以打包吗？— kěyǐ dǎbāo ma — Can I take this away?',
        ],
      },
      {
        title: 'Payment and shopping phrases',
        items: [
          '这个多少钱？— zhège duōshao qián — How much is this?',
          '可以用支付宝吗？— kěyǐ yòng Zhīfùbǎo ma — Can I use Alipay?',
          '可以用微信支付吗？— kěyǐ yòng Wēixìn Zhīfù ma — Can I use WeChat Pay?',
          '可以刷卡吗？— kěyǐ shuākǎ ma — Can I pay by card?',
          '可以用现金吗？— kěyǐ yòng xiànjīn ma — Can I pay in cash?',
          '支付失败了。— zhīfù shībài le — The payment failed.',
          '请再试一次。— qǐng zài shì yí cì — Please try again.',
          '请给我收据。— qǐng gěi wǒ shōujù — Please give me a receipt.',
        ],
      },
      {
        title: 'Train, metro, and station phrases',
        items: [
          '站台在哪里？— zhàntái zài nǎlǐ — Where is the platform?',
          '这趟车去北京吗？— zhè tàng chē qù Běijīng ma — Does this train go to Beijing?',
          '我应该在哪一站下车？— wǒ yīnggāi zài nǎ yí zhàn xiàchē — At which station should I get off?',
          '换乘在哪里？— huànchéng zài nǎlǐ — Where do I transfer?',
          '这个出口对吗？— zhège chūkǒu duì ma — Is this the correct exit?',
          '我的座位在哪里？— wǒ de zuòwèi zài nǎlǐ — Where is my seat?',
          '我赶不上这趟车了。— wǒ gǎn bù shàng zhè tàng chē le — I am going to miss this train.',
        ],
      },
      {
        title: 'Internet and everyday needs',
        items: [
          '洗手间在哪里？— xǐshǒujiān zài nǎlǐ — Where is the toilet?',
          '这里有Wi-Fi吗？— zhèlǐ yǒu Wi-Fi ma — Is there Wi-Fi here?',
          '我的手机没有网络。— wǒ de shǒujī méiyǒu wǎngluò — My phone has no internet connection.',
          '这里可以充电吗？— zhèlǐ kěyǐ chōngdiàn ma — Can I charge my phone here?',
          '可以帮我拍照吗？— kěyǐ bāng wǒ pāizhào ma — Can you take a photo for me?',
          '营业到几点？— yíngyè dào jǐ diǎn — What time do you close?',
        ],
      },
      {
        title: 'Emergency and medical phrases',
        items: [
          '我需要帮助。— wǒ xūyào bāngzhù — I need help.',
          '请帮我报警。— qǐng bāng wǒ bàojǐng — Please help me call the police.',
          '请帮我叫救护车。— qǐng bāng wǒ jiào jiùhùchē — Please help me call an ambulance.',
          '我需要医生。— wǒ xūyào yīshēng — I need a doctor.',
          '我的护照丢了。— wǒ de hùzhào diū le — I lost my passport.',
          '我的手机丢了。— wǒ de shǒujī diū le — I lost my phone.',
          '我可能严重过敏。— wǒ kěnéng yánzhòng guòmǐn — I may be having a severe allergic reaction.',
          'China emergency numbers: 110 police, 120 ambulance, and 119 fire. Call the appropriate service directly in an urgent situation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I need to speak Chinese to travel in China?',
        answer:
          'No. Many first-time visitors travel with translation tools, Chinese addresses, and a short phrase list. Prepare offline backups because English support and mobile data vary by place and situation.',
      },
      {
        question: 'Should I speak the pinyin or show the Chinese characters?',
        answer:
          'Try the pinyin if you feel comfortable, but show the Chinese characters as well. Correct tones can be difficult for beginners, while a clear written sentence is often easier for the other person to understand.',
      },
      {
        question: 'What is the most useful Chinese phrase for tourists?',
        answer:
          '可以打字吗？ (“Can you type it?”) is especially useful because the reply can be copied into a translation app. For transport, also keep 请带我去这个地址 (“Please take me to this address”) beside the exact Chinese destination.',
      },
      {
        question: 'Will an English translation app work everywhere in China?',
        answer:
          'Do not rely on one online app. Download an offline Chinese language pack, test camera and text translation before departure, and keep screenshots for hotels, transport, payment, food, and emergencies.',
      },
      {
        question: 'How do I show a taxi driver my destination?',
        answer:
          'Show the exact Chinese place name and full address, not only an English name. Save the entrance or pickup point when a large station, mall, or attraction has several gates.',
      },
      {
        question: 'Can I use a translated phrase for a severe food allergy?',
        answer:
          'A translated phrase can start the conversation, but it is not a medical safeguard. Use a clinician-reviewed bilingual allergy card, ask about ingredients and cross-contact, carry prescribed medicine, and do not eat when staff cannot confirm.',
      },
      {
        question: 'Which emergency numbers should I save in China?',
        answer:
          'Save 110 for police, 120 for ambulance, and 119 for fire. ChinaEase Buddy provides reference phrases only and cannot contact emergency services for you.',
      },
    ],
    related: [
      { label: 'How to order food in China', href: '/china-food-ordering-guide/' },
      { label: 'China travel safety guide', href: '/china-travel-safety-guide/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Open the free phrase tools', href: '/?journey=china' },
    ],
    sources: [
      { label: 'People\'s Bank of China: payment guide for visitors', href: 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html' },
      { label: 'Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
      { label: 'China National Immigration Administration 12367 service', href: 'https://en.nia.gov.cn/n108/c117393/content.html' },
      { label: 'CDC: food and drink safety while traveling', href: 'https://wwwnc.cdc.gov/travel/page/food-water-safety' },
    ],
  },
  'china-travel-safety-guide': {
    path: '/china-travel-safety-guide/',
    title: 'Is It Safe to Travel to China in 2026?',
    intro:
      'A practical, evidence-based safety guide for crime, scams, solo and female travel, transport, local laws, health, weather, and emergencies in mainland China.',
    metaTitle: 'Is It Safe to Travel to China? Tourist Safety Guide (2026)',
    metaDescription:
      'Is China safe to visit in 2026? Understand tourist scams, solo travel, transport, local laws, health, weather, emergency numbers and practical precautions.',
    quickAnswer:
      'Many tourists visit mainland China without serious incidents, and UK guidance says serious crime against foreign nationals is relatively rare. That does not make every trip risk-free. Use verified transport, avoid common tourist scams, follow local laws, prepare payment and mobile-data backups, and know how to contact emergency services. Government advisories also highlight broad national-security laws, possible exit bans, and restrictions in sensitive areas, so check the current advice for your nationality and itinerary before departure.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'October 7, 2026',
    lastModified: '2026-10-07',
    isArticle: true,
    sections: [
      {
        title: 'Is it safe to travel to China right now?',
        items: [
          'Separate everyday tourist safety from legal and geopolitical risk. Street crime may be relatively uncommon while laws, restricted areas, business disputes, or a traveler\'s professional background can create different risks.',
          'As reviewed on 7 October 2026, the US Department of State rates mainland China Level 2, “Exercise increased caution,” citing arbitrary enforcement of local laws, exit bans, and the risk of unjust arrest or detention.',
          'UK guidance says serious crime against foreign nationals is relatively rare, but isolated violent incidents have occurred and ordinary precautions remain necessary.',
          'Travel advice varies by nationality and can change quickly. Read the current government advisory for your passport, not only social-media accounts or an old travel video.',
          'Hong Kong and Macao have separate entry, legal, emergency, and travel-advisory pages. Do not treat a mainland China guide as complete advice for either place.',
        ],
      },
      {
        title: 'Prepare a safety backup before departure',
        ordered: true,
        items: [
          'Share your route, hotel details, transport bookings, and check-in plan with one trusted person who is not traveling with you.',
          'Save your embassy or consulate contact, travel insurer, card issuer, airline, hotel, and the China emergency numbers 110, 120, and 119.',
          'Keep passport and visa details, insurance documents, prescriptions, and bookings available offline. Store a separate secure copy in case the original is lost.',
          'Set up at least two payment routes, mobile data plus an offline information backup, and Chinese-language addresses for every hotel and major destination.',
          'Buy travel insurance that matches your activities and check medical treatment, evacuation, trip disruption, valuables, and pre-existing-condition terms.',
        ],
      },
      {
        title: 'Solo and female traveler precautions',
        items: [
          'Use the same baseline precautions you would use in any large unfamiliar city: tell someone where you are going, avoid isolated shortcuts, and keep control of your transport home.',
          'Do not leave food or drinks unattended or accept open drinks from strangers. Official guidance notes that drink spiking and sexual assault are uncommon but can occur.',
          'Meet new contacts in public places, keep your own phone and payment access, and avoid moving to a second unknown venue when the situation changes unexpectedly.',
          'At night, use a verified DiDi or a marked, metered taxi; check the licence plate and driver details before entering and share the ride when practical.',
          'If a person or venue makes you uncomfortable, leave early and move toward hotel staff, station staff, security, police, or another busy public place.',
        ],
      },
      {
        title: 'Recognize common tourist scams',
        items: [
          'Tea-house, massage, bar, and “practice English” scams often begin with a friendly stranger inviting you to a nearby venue, followed by an inflated bill and pressure to pay.',
          'Decline spontaneous invitations from strangers in major tourist areas when you cannot independently verify the venue, menu, price,…91042 tokens truncated…', 'If verification cannot be completed before travel, keep Alipay and ordinary phone, email, hotel, and booking channels ready.'] },
      { title: 'What Not to Do', items: ['Do not pay an unknown “verification service” or buy an account.', 'Do not publish the verification QR code, phone number, SMS code, password, or identity documents in a public group.', 'Do not repeatedly create accounts with multiple numbers or devices to evade security checks.', 'Do not give remote-control access to your phone or let a stranger bind payment details.'] },
      { title: 'After the Account Opens', items: ['Add an available recovery email or trusted recovery method.', 'Review login devices, privacy settings, and payment security.', 'Link an eligible card to WeChat Pay only through the official wallet flow.', 'Prepare Alipay, a physical card, and RMB cash so WeChat is not a single point of failure.'] },
    ],
    faqs: [
      { question: 'Can I bypass WeChat friend verification?', answer: 'There is no guaranteed safe bypass. Use the official alternatives, appeal, or support options shown for your account.' },
      { question: 'Should I pay someone online to scan the QR code?', answer: 'No. Paid or unknown verification services can lead to fraud, account compromise, or later restrictions.' },
      { question: 'Can a university or employer help?', answer: 'A trusted institution or real-life contact may help if the official flow permits it and they are comfortable doing so.' },
      { question: 'Can I travel in China without WeChat?', answer: 'Yes, although WeChat is useful. Prepare Alipay, mobile data, email, hotel contacts, Trip.com or 12306, and other direct booking channels.' },
    ],
    related: [{ label: 'Complete WeChat setup guide', href: '/how-to-use-wechat-as-foreigner-2026/' }, { label: 'WeChat Pay guide', href: '/wechat-pay-for-foreigners/' }, { label: 'Best China travel apps', href: '/best-apps-for-china-travel-2026/' }],
  },
  'china-hotels-for-foreigners-no-rejection-guide': {
    path: '/china-hotels-for-foreigners-no-rejection-guide/',
    title: "Why Some Hotels in China Refuse Foreign Guests, and What to Do Next",
    intro: 'Foreign visitors are not limited to a special class of “foreigner-licensed” hotels. In practice, some properties still reject bookings because staff do not understand passport registration or platform information is wrong.',
    metaTitle: 'Why Hotels in China Refuse Foreign Guests (and How to Avoid It) [2026]',
    metaDescription: 'Can foreigners stay in any hotel in China? Learn why rejection still happens, how hotel registration works, what to confirm before arrival, and when to call 12367.',
    quickAnswer: 'Chinese authorities have instructed local departments and booking platforms not to restrict accommodation operators from receiving foreign guests based on qualification requirements, and operators may not illegally advertise that they refuse foreigners. This does not mean every reservation must be accepted regardless of room availability, booking details, identity checks, payment, or lawful property rules. If check-in is refused, identify the exact reason, ask a manager to review it, contact the booking platform, and prioritize safe replacement accommodation.',
    ctaLabel: 'Ask Buddy to check my hotel plan',
    midCtaLabel: 'Prepare my hotel confirmation message',
    ctaHref: '/',
    buddyPrompt: 'Help me check a China hotel booking. The hotel is [name/city], I booked through [platform], and I need a Chinese message confirming that they accept my passport and can register my stay.',
    reviewed: 'October 11, 2026',
    lastModified: '2026-10-11',
    sections: [
      {
        title: 'First identify why check-in was refused',
        table: {
          headers: ['Reason given', 'What it means for your next step'],
          rows: [
            ['“We cannot accept foreigners” or “we lack foreign-related qualification”', 'Ask a manager to review the booking and foreign-passport registration process. Save the reason in writing and contact the booking platform if the property will not reconsider.'],
            ['No room or the hotel is overbooked', 'Treat this as a failure to honor the reservation, not automatically as nationality discrimination. Ask the hotel or platform for immediate relocation and any refund due under the booking terms.'],
            ['Name, passport, guest count, date, or room details do not match', 'Compare the reservation with every guest’s original passport and correct the mismatch through the booking platform before arguing about foreign-guest policy.'],
            ['Payment, deposit, late arrival, or property-rule problem', 'Ask for the exact charge, deadline, or rule in writing. Check the reservation terms and use a prepared payment method or platform support where appropriate.'],
          ],
        },
        items: [
          'Do not assume every refusal has the same legal or practical cause. The written reason determines whether the fastest solution is manager review, booking correction, relocation, or a refund request.',
        ],
      },
      {
        title: 'What to do at the front desk, in order',
        ordered: true,
        items: [
          'Stay calm and ask for the specific reason the confirmed booking cannot be checked in. Distinguish a foreign-passport registration concern from no vacancy, a booking mismatch, payment, or another operational issue.',
          'Show the reservation and any written message confirming foreign-passport check-in. Ask for the duty manager or an experienced employee who knows the accommodation-registration process.',
          'Ask the property to put its reason in the booking-platform chat. Avoid a prolonged confrontation or photographing staff without permission.',
          'Contact the booking platform while you are still at the property. Request immediate relocation first when you need a room that night, then address refund or compensation through the booking terms.',
          'If the issue is not resolved quickly, move to a safe staffed alternative. Keep transport and replacement-hotel receipts for the later claim.',
        ],
      },
      {
        title: 'Short messages to copy and show',
        items: [
          '请告诉我无法办理入住的具体原因。是订单、房态，还是外国护照登记问题？ — Please tell me the specific reason check-in cannot be completed. Is it the booking, room availability, or foreign-passport registration?',
          '这是我的预订确认和护照。请让值班经理帮忙处理。 — Here are my booking confirmation and passport. Please ask the duty manager to help.',
          '请在预订平台的消息里写明拒绝入住的原因。 — Please state the reason for refusing check-in in the booking-platform message.',
          '如果酒店无法履行订单，请帮我免费改订到安全的同等住宿。 — If the hotel cannot honor the booking, please relocate me to safe, equivalent accommodation without an extra charge.',
          '如果无法改订，请在平台上确认取消和退款。 — If relocation is not possible, please confirm the cancellation and refund through the platform.',
        ],
      },
      {
        title: 'Evidence to save for relocation or refund support',
        items: [
          'The reservation number, exact property and branch, booked dates, room type, guest names, payment status, cancellation terms, and the original listing.',
          'Platform messages showing any pre-arrival confirmation that the property could check in the passport holders on the reservation.',
          'A written platform or hotel message stating the refusal reason, plus the time of arrival and the role of the staff member or manager you spoke with.',
          'Receipts for prepaid accommodation, replacement lodging, and necessary transport to the replacement property.',
          'Screenshots of platform support conversations and the final relocation, cancellation, or refund decision. Do not publish staff or guest personal information.',
        ],
      },
      {
        title: 'How to ask the booking platform for help',
        ordered: true,
        items: [
          'Open support from the exact reservation so the agent can see the property, payment, cancellation conditions, and previous messages.',
          'State the immediate need clearly: confirmed guest refused at check-in, exact reason given, current local time, and whether safe accommodation is needed tonight.',
          'Request relocation to comparable safe accommodation before accepting a cancellation that leaves you without a room. Ask who pays any price difference and transport.',
          'If relocation is unavailable, request the refund or cancellation remedy supported by the reservation terms and the platform’s failure-to-honor process.',
          'Keep the case number and written outcome. A refund route is a booking and payment matter; the NIA 12367 hotline is for immigration and accommodation-registration guidance, not platform refund decisions.',
        ],
      },
      {
        title: 'Accommodation registration still applies',
        items: [
          'A hotel that checks in a foreign guest must register the stay and submit the required accommodation information to the local public security authority.',
          'A private home or another non-hotel stay follows a separate process: the visitor or host generally completes accommodation registration within 24 hours.',
          'Use the separate 12367 accommodation-registration guide for the current online and in-person routes. A hotel refusal does not remove the registration requirement for the replacement stay.',
        ],
      },
    ],
    faqs: [
      { question: 'Can a hotel refuse me only because I have a foreign passport?', answer: 'Chinese authorities have instructed local departments and booking platforms not to impose blanket foreign-guest qualification restrictions on accommodation operators. That does not remove normal booking, identity, room-availability, payment, safety, or property rules, so ask for the exact reason in writing.' },
      { question: 'What should I do if I am refused late at night?', answer: 'Prioritize a safe staffed replacement rather than a prolonged front-desk dispute. Ask the booking platform for immediate relocation, confirm who covers any price difference and transport, and keep the original booking, refusal message, replacement receipt, and support case number.' },
      { question: 'What evidence should I keep for a hotel refund request?', answer: 'Keep the reservation, payment and cancellation terms, written passport check-in confirmation, refusal reason, platform messages, case number, and receipts for replacement lodging and necessary transport. Ask the hotel or platform to record the decision in writing.' },
      { question: 'Can 12367 arrange my hotel refund?', answer: '12367 provides National Immigration Administration guidance, including accommodation-registration questions. Refunds, relocation, and failure-to-honor remedies should be handled with the hotel and booking platform under the reservation terms.' },
    ],
    related: [{ label: 'Full China hotels guide', href: '/china-hotels-for-foreigners/' }, { label: '12367 accommodation registration guide', href: '/nia-12367-online-accommodation-registration-guide/' }, { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' }, { label: 'China travel safety guide', href: '/china-travel-safety-guide/' }],
    sources: [{ label: 'Chinese government: facilitating accommodation for foreign travelers', href: 'https://english.www.gov.cn/news/202407/26/content_WS66a2d827c6d0868f4e8e975c.html' }, { label: 'NIA: hotel and non-hotel accommodation registration rules', href: 'https://english.www.gov.cn/services/visitchina/202603/21/content_WS69ce124cc6d00ca5f9a0a368.html' }],
  },
  'does-google-maps-work-in-china-amap-guide': {
    path: '/does-google-maps-work-in-china-amap-guide/',
    title: "Google Maps Is Not the Best Navigation Choice in China. Use Amap Instead.",
    intro: 'Google services are generally unavailable on ordinary mainland connections, and Google Maps is not designed around current local navigation data. Amap Global now offers English and multilingual navigation for international visitors.',
    metaTitle: 'Does Google Maps Work in China? Use Amap English Instead [2026]',
    metaDescription: 'Google Maps is generally unavailable on ordinary mainland connections. Use Amap Global in English or Apple Maps for accurate China navigation, transit, and ride-hailing.',
    quickAnswer: 'Google Maps is generally unavailable on ordinary mainland China connections, and its local navigation data may be incomplete even if you can open it. Download Amap Global before departure and select English or another supported language; Apple Maps is another option for many iPhone users. Save your hotel address in Chinese and verify the exact entrance or station before you travel.',
    ctaLabel: 'Convert my destination for China maps',
    midCtaLabel: 'Create my navigation backup',
    ctaHref: '/',
    buddyPrompt: 'Convert this China destination into a map-ready English and Chinese address, plus a taxi message: [place/address].',
    reviewed: 'September 27, 2026',
    sections: [
      { title: 'Why Not to Rely on Google Maps', items: ['Google services are generally blocked on ordinary mainland Wi-Fi and local mobile data.', 'Even when connectivity is available, place listings, transit information, and local navigation may be incomplete or outdated.', 'China uses regulated coordinate systems, which can create visible offsets when different map and satellite layers are combined.', 'Use a current local navigation product rather than building a trip around Google Maps alone.'] },
      { title: 'Set Up Amap Global in English', ordered: true, items: ['Download Amap Global from your app store before departure.', 'Select English or another supported language and allow location access while using the app.', 'Search for your hotel and major attractions, then save them before the trip.', 'Compare walking, transit, driving, cycling, and ride-hailing options and confirm the correct entrance or gate.'] },
      { title: 'Amap vs Apple Maps vs Baidu Maps', table: { headers: ['Map', 'Best for visitors', 'Main limitation'], rows: [['Amap Global', 'Detailed local navigation, transit, traffic, and ride-hailing', 'Some listings or service flows may still contain Chinese'], ['Apple Maps', 'Simple English navigation on iPhone using local map data', 'Feature depth varies by place and mode'], ['Baidu Maps', 'Broad local place data and Chinese-language searches', 'Less convenient for travelers who cannot read Chinese']] } },
      { title: 'Navigation Backups', items: ['Save every hotel and station address in Chinese.', 'Screenshot the destination, nearest metro station, exit number, and pickup gate.', 'Download essential information before leaving Wi-Fi.', 'Show a driver the Chinese address rather than only an English place name.'] },
    ],
    faqs: [
      { question: 'Does Google Maps work in mainland China?', answer: 'It is generally unavailable on ordinary mainland connections, and its local data may not be suitable for dependable navigation. Prepare Amap Global or Apple Maps.' },
      { question: 'Is Amap available in English?', answer: 'Yes. Amap Global offers English and multiple other languages for overseas users.' },
      { question: 'Does Apple Maps work in China?', answer: 'Apple Maps is commonly usable in mainland China and can be a convenient English-language option, though local feature availability varies.' },
      { question: 'Should I use Baidu Maps?', answer: 'Baidu Maps has strong local coverage, but Amap Global or Apple Maps is usually easier for visitors who need an English interface.' },
    ],
    related: [{ label: 'Full Amap English guide', href: '/amap-in-english/' }, { label: 'Best China travel apps', href: '/best-apps-for-china-travel-2026/' }, { label: 'DiDi guide', href: '/didi-in-china-for-foreigners/' }],
    sources: [{ label: 'Shanghai government: Amap English map', href: 'https://english.shanghai.gov.cn/en-InFocus/20250123/78d115a256af4c29a607b3d326ac2d8a.html' }, { label: 'Shanghai government: multilingual Amap services', href: 'https://english.shanghai.gov.cn/en-EasyShanghai/20260713/379bcea6e1bd4defaa7db2451d68d3dd.html' }],
  },
  'how-to-visit-great-wall-from-beijing-2026': {
    path: '/how-to-visit-great-wall-from-beijing-2026/',
    title: 'How to Visit the Great Wall from Beijing Without a Tour',
    intro: 'Choose Badaling for the easiest rail connection or Mutianyu for a scenic day with shuttle, cable-car, chairlift, and toboggan options.',
    metaTitle: 'How to Visit the Great Wall from Beijing Without a Tour (2026 Guide)',
    metaDescription: 'Compare Badaling and Mutianyu Great Wall, transport from Beijing, tickets, walking difficulty, crowds, cable cars, and a realistic independent day trip.',
    quickAnswer: 'You can visit the Great Wall from Beijing without a tour. Badaling has a high-speed train connection from Beijing North or Qinghe to Badaling Great Wall station. Mutianyu usually needs a bus connection or a verified road transfer. Choose your section first, check the official ticket and transport options for your date, and secure a realistic return trip before leaving Beijing.',
    ctaLabel: 'Plan my Great Wall day with Buddy',
    midCtaLabel: 'Choose Badaling or Mutianyu for me',
    ctaHref: '/',
    buddyPrompt: 'Plan my independent Great Wall day from Beijing. I travel on [date], stay near [hotel/area], have [fitness level], and prefer [easy transport/fewer crowds/scenery/toboggan].',
    reviewed: 'September 27, 2026',
    sections: [
      { title: 'Badaling vs Mutianyu', table: { headers: ['Section', 'Best for', 'Transport trade-off'], rows: [['Badaling', 'First-time visitors prioritizing simple rail access and extensive facilities', 'Fast train is convenient but popular departures can sell out'], ['Mutianyu', 'Scenery, families, cable-car options, and a less compressed visit outside peaks', 'Requires a bus, shuttle, taxi, or private transfer']] } },
      { title: 'Independent Transport Options', items: ['Badaling: book the high-speed train from Beijing North or Qinghe to Badaling Great Wall station through Railway 12306; confirm the exact station and return train.', 'Mutianyu: use an authorized tourist bus, a public-bus combination, or a verified car service. Confirm where the internal scenic-area shuttle begins.', 'Avoid accepting an unverified “direct bus” or private car offer near a station without checking the operator, destination, and return terms.'] },
      { title: 'A Realistic Day Plan', ordered: true, items: ['Leave central Beijing early and carry your passport, booking confirmations, water, and weather protection.', 'Allow time for the station, bus transfer, ticket check, and any internal shuttle.', 'Spend roughly three to four hours on the wall, choosing cable-car assistance based on weather and mobility.', 'Start the return before late afternoon and keep the final train or bus details available offline.'] },
      { title: 'Tickets, Weather, and Walking', items: ['Reserve required admission and transport through official or clearly authorized channels.', 'Wear shoes with grip; restored sections still include steep and uneven stairs.', 'Cable cars, chairlifts, and the Mutianyu toboggan can close because of wind, ice, maintenance, or other conditions.', 'Avoid unrestored or closed wild-wall sections unless you have lawful access and appropriate specialist support.'] },
    ],
    faqs: [
      { question: 'Can I visit the Great Wall without a tour?', answer: 'Yes. Badaling is accessible by high-speed rail, while Mutianyu can be reached by authorized bus, public transport plus shuttle, taxi, or private transfer.' },
      { question: 'Is Badaling or Mutianyu better?', answer: 'Choose Badaling for easier rail access and extensive facilities. Choose Mutianyu for scenery and cable-car or toboggan options, accepting a more complex transfer.' },
      { question: 'How long should I spend at the Great Wall?', answer: 'Most independent visitors should allow a full day from central Beijing, including transfers, ticket checks, and roughly three to four hours at the wall.' },
      { question: 'Do I need to book in advance?', answer: 'Advance booking is strongly recommended for admission and train or tourist-bus seats, especially on weekends and holidays.' },
    ],
    related: [{ label: 'Full Great Wall day-trip guide', href: '/great-wall-of-china-day-trip-from-beijing/' }, { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' }, { label: 'China train booking guide', href: '/china-train-booking-foreigners-12306/' }],
  },
  'what-to-eat-in-china-first-time-guide': {
    path: '/what-to-eat-in-china-first-time-guide/',
    title: 'What to Eat in China: 15 Dishes for a First Visit',
    intro: 'Start with regional classics rather than treating Chinese food as one cuisine. This practical list covers breakfasts, noodles, dumplings, street snacks, shared dishes, and ordering safety.',
    metaTitle: 'What to Eat in China: 15 Must-Try Dishes for First-Time Visitors',
    metaDescription: 'Discover 15 dishes to try in China, including jianbing, xiaolongbao, Peking duck, hot pot, biangbiang noodles, dumplings, and regional specialties.',
    quickAnswer: 'Try dishes where they are regional strengths: Peking duck and zhajiangmian in Beijing, xiaolongbao and shengjian in Shanghai, biangbiang noodles and roujiamo in Xi’an, hot pot and mapo tofu in Sichuan or Chongqing, plus jianbing, dumplings, barbecue skewers, and seasonal vegetables across many cities.',
    ctaLabel: 'Ask Buddy what to order',
    midCtaLabel: 'Build my personal food list',
    ctaHref: '/',
    buddyPrompt: 'Recommend dishes for my China trip. I will visit [cities], eat [meat/vegetarian/etc.], avoid [allergens/ingredients], and prefer [mild/spicy/adventurous] food.',
    reviewed: 'September 27, 2026',
    sections: [
      { title: '15 Dishes to Put on Your List', items: ['Jianbing: a savory breakfast crepe with egg, sauces, herbs, and a crisp filling.', 'Xiaolongbao: steamed soup dumplings associated with Jiangnan and Shanghai.', 'Shengjianbao: pan-fried buns with a crisp base and juicy filling.', 'Peking duck: roast duck served with thin pancakes, scallion, cucumber, and sauce.', 'Zhajiangmian: Beijing-style noodles with fermented soybean meat sauce.', 'Biangbiang noodles: wide, hand-pulled Shaanxi noodles.', 'Roujiamo: chopped meat in a crisp flatbread, strongly associated with Shaanxi.', 'Hot pot: broth-based communal cooking, especially famous in Chongqing and Sichuan.', 'Mapo tofu: tofu with minced meat, chili, and Sichuan pepper in the classic version.', 'Kung pao chicken: diced chicken with chili and peanuts.', 'Lanzhou beef noodles: hand-pulled noodles in a clear beef broth.', 'Jiaozi: boiled, steamed, or pan-fried dumplings.', 'Yangzhou fried rice: rice with egg and mixed ingredients in the classic style.', 'Lamb skewers: cumin-seasoned grilled meat associated with northwestern flavors.', 'Seasonal stir-fried greens: a useful balance to richer shared dishes.'] },
      { title: 'Order by City', table: { headers: ['City or region', 'Good starting choices'], rows: [['Beijing', 'Peking duck, zhajiangmian, dumplings'], ['Shanghai / Jiangnan', 'Xiaolongbao, shengjianbao, braised dishes'], ["Xi'an / Shaanxi", 'Biangbiang noodles, roujiamo, lamb dishes'], ['Chengdu / Sichuan', 'Mapo tofu, hot pot, dry-fried dishes'], ['Guangzhou / Guangdong', 'Dim sum, roast meats, seafood, soups']] } },
      { title: 'Food Safety and Allergies', items: ['Choose busy, clean-looking vendors that cook food thoroughly and serve it hot.', 'Drink sealed bottled or properly treated water when safety is uncertain.', 'Allergy communication is difficult because sauces, broths, oils, and shared equipment may contain hidden ingredients.', 'Show a specific Chinese allergy card and confirm with staff; Buddy provides communication support, not a medical guarantee.'] },
      { title: 'How to Order', items: ['Use photo menus, displayed dishes, or a translation tool, but confirm portion size before ordering.', 'Shared dishes are common; a rough starting point is one dish per person plus one additional vegetable or staple for the table.', 'Ask whether the price is per dish, per person, per 500 grams, or by live weight when seafood and market ingredients are involved.', 'Keep Alipay or WeChat Pay ready and carry a cash backup.'] },
    ],
    faqs: [
      { question: 'What food should I try first in China?', answer: 'Start with the regional specialties of your destination, such as Peking duck in Beijing, xiaolongbao in Shanghai, biangbiang noodles in Xi’an, or hot pot in Chengdu and Chongqing.' },
      { question: 'Is Chinese street food safe?', answer: 'Risk varies. Choose busy vendors with clean preparation areas, food cooked thoroughly and served hot, and safe water and ice practices.' },
      { question: 'Is it easy to eat vegetarian food in China?', answer: 'Vegetable dishes are common, but meat stock, lard, oyster sauce, or small meat pieces may be used. Show a precise Chinese request and confirm ingredients.' },
      { question: 'How do I communicate a food allergy?', answer: 'Carry a detailed Chinese allergy card naming the allergen and the need to avoid sauces, broths, oils, and cross-contact. Seek professional medical advice for severe allergies.' },
    ],
    related: [{ label: 'Full China food-ordering guide', href: '/china-food-ordering-guide/' }, { label: 'Essential Chinese phrases', href: '/chinese-travel-phrases/' }, { label: 'China payment guide', href: '/china-payment-guide/' }],
  },
  'how-to-use-wechat-as-foreigner-2026': {
    path: '/how-to-use-wechat-as-foreigner-2026/',
    title: 'How to Use WeChat as a Foreigner in 2026',
    intro: 'Set up messaging, account recovery, WeChat Pay, QR contacts, and mini-programs before your trip, while keeping Alipay and other backups available.',
    metaTitle: 'How to Use WeChat as a Foreigner (2026): Registration, Verification & Pay',
    metaDescription: 'Set up WeChat before China using a foreign mobile number. Learn registration, possible security verification, WeChat Pay card linking, QR contacts, and mini-programs.',
    quickAnswer: 'Download the official WeChat app, register with a reachable foreign or Chinese mobile number, complete any security verification shown, and set recovery options before travel. Eligible foreign users can link supported international bank cards to WeChat Pay. Verification, features, limits, fees, and merchant acceptance vary, so keep Alipay, a physical card, and some RMB as backups.',
    ctaLabel: 'Build my WeChat setup checklist',
    midCtaLabel: 'Troubleshoot my WeChat setup',
    ctaHref: '/',
    buddyPrompt: 'Help me set up WeChat for China. I am stuck at [registration/security verification/WeChat Pay/mini-program], my phone is [model], and my card is [type].',
    reviewed: 'September 27, 2026',
    sections: [
      { title: 'Register Before You Arrive', ordered: true, items: ['Download the official WeChat app and register with a mobile number you can continue to access.', 'Use your real account details and complete the security checks shown in the app.', 'If WeChat requests assistance from an existing user, follow the exact in-app process; not every registration requires the same verification.', 'Add an email or other available recovery method and review privacy and login settings.', 'Test messaging and save your account details before departure.'] },
      { title: 'Set Up WeChat Pay', ordered: true, items: ['Open the wallet or payment section available in your WeChat account.', 'Complete identity verification with your passport when requested.', 'Link a supported Visa, Mastercard, American Express, JCB, Diners Club, Discover, or other card currently shown as eligible.', 'Complete the issuing bank’s verification step and review the limits and fees displayed in the app.', 'Test the payment route in China and retain Alipay, a physical card, and RMB cash as backups.'] },
      { title: 'Contacts, QR Codes, and Mini-Programs', items: ['Use personal QR codes to add local contacts without spelling usernames.', 'Official accounts can provide attraction notices, bookings, and customer service, but verify the account before paying or sharing information.', 'Mini-programs can support transport, food, attractions, hotels, and other services without installing a separate app.', 'Do not scan unknown QR codes or share login, payment, or SMS verification codes.'] },
      { title: 'Common Setup Problems', items: ['Security verification can vary by phone number, device, region, account history, and risk controls.', 'A card can fail because of issuer authorization, identity mismatch, unsupported settings, or app limits.', 'Changing devices, numbers, or networks repeatedly may trigger additional security checks.', 'Use official in-app support and never pay an unknown person to “unlock” or verify an account.'] },
    ],
    faqs: [
      { question: 'Can foreigners register for WeChat?', answer: 'Yes. Foreign users can register with supported international mobile numbers, subject to the security verification displayed for that account.' },
      { question: 'Do I always need another user to verify my account?', answer: 'No. Verification requirements vary. Follow the exact official in-app instructions rather than assuming every account needs friend-assisted verification.' },
      { question: 'Can foreigners use WeChat Pay?', answer: 'Eligible foreign visitors can link supported international bank cards after completing the required identity and bank verification.' },
      { question: 'Should I use WeChat Pay or Alipay?', answer: 'Prepare both. WeChat Pay is useful for merchants and mini-programs inside WeChat, while many visitors find Alipay easier as a primary travel wallet.' },
    ],
    related: [{ label: 'Full WeChat Pay guide', href: '/wechat-pay-for-foreigners/' }, { label: 'China payment setup', href: '/china-payment-guide/' }, { label: 'Best China travel apps', href: '/best-apps-for-china-travel-2026/' }],
    sources: [{ label: 'Chinese government: payment guide for overseas visitors', href: 'https://english.www.gov.cn/news/202404/11/content_WS6617c858c6d0868f4e8e5f4d.html' }],
  },
  'is-china-safe-for-tourists-2026': {
    path: '/is-china-safe-for-tourists-2026/',
    title: 'Is China Safe for US Citizens in 2026?',
    intro: 'A practical safety guide for US citizens visiting China, covering the current Level 2 advisory, local laws, exit-ban risks, common scams, transport, and emergency preparation.',
    metaTitle: 'Is China Safe for US Citizens in 2026? Travel Advice',
    metaDescription: 'Is China safe for US citizens in 2026? Understand the US Level 2 advisory, local laws, exit-ban risks, common scams and practical tourist precautions.',
    quickAnswer: 'Many US citizens visit mainland China without serious incidents, but the US Department of State currently rates mainland China Level 2, Exercise Increased Caution. Its September 4, 2026 advisory highlights arbitrary enforcement of local laws, exit bans, and the risk of unjust arrest or detention. Read the complete current advisory, consider your individual circumstances, follow local laws, and keep a practical emergency plan.',
    ctaLabel: 'Ask Buddy for a city safety check',
    midCtaLabel: 'Build my personal safety checklist',
    ctaHref: '/',
    buddyPrompt: 'Give me a practical safety checklist for [city] in China. I am traveling [solo/with family], my nationality is [country], and my main concerns are [concerns].',
    reviewed: 'October 9, 2026',
    lastModified: '2026-10-09',
    sections: [
      { title: 'Is China Safe for US Citizens Right Now?', items: ['Many US citizens visit mainland China without a serious incident, but that does not make every trip risk-free or suitable for every traveler.', 'The current US Department of State advisory for mainland China is Level 2, Exercise Increased Caution. Reissued on September 4, 2026, it highlights arbitrary enforcement of local laws, exit bans, and the risk of unjust arrest or detention.', 'Level 2 is not Level 3 “Reconsider Travel” or Level 4 “Do Not Travel.” Travelers should understand the named risks, read the complete current advisory, and prepare accordingly.', 'Mainland China, Hong Kong, and Macau have separate advisory sections and should be checked individually.'] },
      { title: 'Who Should Read the Advisory Especially Carefully?', items: ['The advisory identifies additional concerns for people involved in business or family disputes, research, journalism, government-funded programs, and current or former government, military, law-enforcement, or intelligence work.', 'US citizens of Chinese heritage, former Chinese citizens, dual nationals, and travelers using Chinese-issued identity or travel documents should read the nationality and consular-assistance sections closely.', 'A leisure tourist does not automatically share every higher-risk circumstance, but an online guide cannot assess an individual legal, professional, family, or personal exposure.'] },
      { title: 'Before a US Citizen Travels to China', ordered: true, items: ['Read the current US Department of State China Travel Advisory and China country information again shortly before departure.', 'Consider enrolling in the free Smart Traveler Enrollment Program (STEP) for embassy or consulate alerts and emergency contact support.', 'Confirm entry documents, travel insurance, prescriptions, accommodation registration, and emergency contacts for the exact route.', 'Save the hotel name and address in Chinese, document copies, transport bookings, and emergency numbers offline.', 'Seek appropriate official or professional advice for business disputes, dual-nationality questions, prior government work, journalism, research, or other higher-risk circumstances.'] },
      { title: 'Everyday Precautions in Mainland China', items: ['Use licensed transport and official booking channels, verify the licence plate, and protect your passport, phone, payment accounts, and verification codes.', 'Follow local laws and instructions at attractions, border areas, demonstrations, government facilities, and places where photography or access may be restricted.', 'Avoid carrying packages for strangers, paying an unexpected bill without reviewing it, or sharing SMS and account-recovery codes.', 'Save 110 for police, 120 for ambulance, and 119 for fire. Ask staffed locations for help when language is a barrier.', 'For detention, a lost passport, a serious dispute, or another consular emergency, contact the nearest US embassy or consulate.'] },
    ],
    faqs: [
      { question: 'Is China safe for US citizens in 2026?', answer: 'Many US citizens visit without serious incidents. The current US advisory is Level 2, Exercise Increased Caution, because of arbitrary enforcement of local laws, exit-ban risks, and the risk of unjust arrest or detention. Read the full current advisory, consider your individual circumstances, and follow local laws.' },
      { question: 'Is China safe for solo female travelers?', answer: 'Many women travel independently in China, but standard precautions still apply: share plans, use verified transport, keep control of drinks, avoid isolated areas, and leave situations that feel unsafe.' },
      { question: 'Is China safe for children and families?', answer: 'China can be practical for family travel. Plan for crowds, carry medicine and hotel details, use child-appropriate restraints where available, and agree on a meeting point.' },
      { question: 'What emergency numbers should I save?', answer: 'Save 110 for police, 120 for ambulance, and 119 for fire. Ask hotel, station, or attraction staff to help call if language is a barrier.' },
    ],
    related: [{ label: 'Full China travel safety guide', href: '/china-travel-safety-guide/' }, { label: 'Emergency numbers', href: '/china-emergency-numbers/' }, { label: 'China visa-free checker', href: '/china-visa-free-checker/' }, { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' }, { label: 'Essential travel apps', href: '/best-apps-for-china-travel-2026/' }, { label: 'First trip to China', href: '/first-trip-to-china/' }],
    sources: [{ label: 'US Department of State: China Travel Advisory', href: 'https://travel.state.gov/en/international-travel/travel-advisories/china.html' }, { label: 'US Department of State: Smart Traveler Enrollment Program', href: 'https://travel.state.gov/en/international-travel/travel-advisories/smart-traveler-enrollment-program.html' }, { label: 'CDC: China traveler health guidance', href: 'https://wwwnc.cdc.gov/travel/destinations/traveler/none/china' }],
  },
  'best-apps-for-china-travel-2026': {
    path: '/best-apps-for-china-travel-2026/',
    title: '10 Apps You Should Download Before Landing in China',
    intro: 'Prepare payments, taxis, maps, messaging, trains, hotels, food delivery, and metro navigation before your flight so account verification does not consume your first day.',
    metaTitle: '10 Best Apps for China Travel (2026): What to Download Before You Land',
    metaDescription: "Don't land without these 10 apps. Alipay and WeChat Pay for payment, DiDi for taxis, Amap for maps, 12306 for trains. Full setup guide for foreigners.",
    quickAnswer: 'Start with Alipay, WeChat, DiDi, Amap or Apple Maps, and Trip.com or Railway 12306. Then add tools for metro navigation, translation, food delivery, and your international eSIM. Complete passport, card, and phone-number verification before departure whenever possible.',
    ctaLabel: 'Generate my personal app checklist',
    midCtaLabel: 'Check the apps for my phone and trip',
    ctaHref: '/',
    buddyPrompt: 'Create my China app checklist. My phone is [model], I use [iPhone/Android], I will visit [cities], and I need help with [payments/maps/taxis/trains/translation].',
    reviewed: 'September 26, 2026',
    sections: [
      { title: 'The Essential App Stack', table: { headers: ['Need', 'Primary app', 'Backup or alternative'], rows: [['Payments', 'Alipay', 'WeChat Pay and RMB cash'], ['Taxis', 'DiDi', 'Official taxi queue'], ['Maps', 'Amap (Gaode)', 'Apple Maps in mainland China'], ['Messaging', 'WeChat', 'Your travel eSIM for overseas services'], ['Trains and hotels', 'Railway 12306 / Trip.com', 'Hotel or station counter']] } },
      { title: 'Five Apps to Prepare Before Your Flight', items: ['Alipay: verify identity and link a supported international card.', 'WeChat: create the account and prepare WeChat Pay as a payment backup.', 'DiDi: register with your reachable mobile number or learn the Alipay/WeChat ride-hailing route.', 'Amap or Apple Maps: save hotels and destinations in Chinese.', 'Trip.com and Railway 12306: register passenger names exactly as shown in the passport.'] },
      { title: 'Useful Apps After Landing', items: ['Meituan for food and local services where its interface and payment route are practical for you.', 'MetroMan or official city metro tools for station maps and route planning.', 'Alipay Transport for local bus or metro QR codes where supported.', 'An offline-capable translation tool with Chinese downloaded before arrival.', 'Your eSIM provider app or account page, with setup instructions saved offline.'] },
      { title: 'Setup Rules That Prevent First-Day Problems', items: ['Keep access to the home phone number used for SMS verification.', 'Use the exact passport spelling for train and hotel accounts.', 'Prepare at least two payment methods and save hotel addresses offline.', 'Do not assume Google Maps, Google Pay, Uber, or WhatsApp will work on ordinary mainland Wi-Fi or a local SIM.'] },
    ],
    faqs: [
      { question: 'What apps do foreigners need most in China?', answer: 'For most trips, prioritize Alipay, WeChat, DiDi, Amap or Apple Maps, and Trip.com or Railway 12306.' },
      { question: 'Should I download China travel apps before landing?', answer: 'Yes. Account creation, passport checks, card linking, language packs, and SMS verification are easier while your normal phone number and internet access are available.' },
      { question: 'Does Google Maps work in China?', answer: 'Google services are generally unavailable on ordinary mainland connections, and local map data can be unsuitable for navigation. Use Amap or Apple Maps in mainland China.' },
      { question: 'Can I use Uber in China?', answer: 'Uber is not the standard ride-hailing option in mainland China. Use DiDi or an official taxi service.' },
    ],
    related: [{ label: 'Full China travel apps guide', href: '/china-travel-apps/' }, { label: 'DiDi guide for foreigners', href: '/didi-in-china-for-foreigners/' }, { label: 'China eSIM guide', href: '/china-esim-internet-guide/' }],
  },
  'how-to-use-didi-in-china-foreigners': {
    path: '/how-to-use-didi-in-china-foreigners/',
    title: 'How to Use DiDi in China Without a Chinese Phone Number',
    intro: 'Foreign visitors can use the DiDi China app with a supported international number or access ride-hailing through Alipay and WeChat. Prepare the payment route and hotel address before requesting your first ride.',
    metaTitle: 'How to Use DiDi in China as a Foreigner (No Chinese Number Needed)',
    metaDescription: 'Foreigners can use DiDi with a supported international number or through Alipay and WeChat. Enter destinations, verify the car, and pay in-app.',
    quickAnswer: 'Open DiDi China or the supported ride-hailing option in Alipay or WeChat, confirm the pickup pin, search for the destination, compare the displayed car categories and estimate, then verify the licence plate before entering. A Chinese phone number is not always required, but keep access to the number used for registration.',
    ctaLabel: 'Translate my hotel address for DiDi',
    midCtaLabel: 'Create my pickup message',
    ctaHref: '/',
    buddyPrompt: 'Translate this destination and create a short DiDi driver message: [hotel/address]. My pickup point is [airport/station/gate].',
    reviewed: 'September 26, 2026',
    sections: [
      { title: 'Book a DiDi Step by Step', ordered: true, items: ['Open the DiDi China app or the ride-hailing service available through Alipay or WeChat.', 'Allow location access, then correct the pickup pin to the exact gate, road side, floor, or ride-hailing zone.', 'Search for the destination in English or paste its Chinese name and address.', 'Review the displayed category, fare estimate, and pickup time before confirming.', 'At pickup, match the licence plate, car model, and driver shown in the app. Complete payment through the route shown in the booking platform.'] },
      { title: 'Airport and Station Pickups', items: ['Follow signs to the designated ride-hailing pickup area; drivers often cannot stop at the ordinary arrivals curb.', 'Send the exact terminal, floor, zone, gate, or pillar number.', 'Ask airport, station, or hotel staff to confirm the pickup point when the pin is unclear.', 'Do not accept an unsolicited off-platform ride from someone approaching inside the terminal.'] },
      { title: 'Useful Driver Messages', table: { headers: ['English', 'Chinese'], rows: [['I am at Gate 3.', '我在三号门。'], ['I am at the ride-hailing pickup point.', '我在网约车上车点。'], ['Please take me to this address.', '请送我到这个地址。'], ['Please stop here.', '请在这里停车。'], ['I left something in the car.', '我把东西落在车上了。']] } },
      { title: 'Payment and Ride Safety', items: ['Check the estimated fare and category before confirming; tolls, waiting, and route changes can affect the final amount.', 'Keep communication and payment in the platform when possible.', 'Wear a seat belt and share the trip through the app when available.', 'Save the completed trip record for lost items, disputed charges, or safety reports.'] },
    ],
    faqs: [
      { question: 'Can foreigners use DiDi in China?', answer: 'Yes. DiDi China supports inbound visitors, and ride-hailing may also be available through Alipay and WeChat.' },
      { question: 'Do I need a Chinese phone number for DiDi?', answer: 'Not always. The official DiDi China app supports global mobile-number login, subject to current availability and verification.' },
      { question: 'Can I enter a destination in English?', answer: 'Many major places can be found in English, but saving the Chinese hotel or destination name and address is the safest backup.' },
      { question: 'What if the driver cannot find me?', answer: 'Send the exact gate, floor, zone, or nearby landmark. At airports and stations, confirm that you are in the official ride-hailing pickup area.' },
    ],
    related: [{ label: 'Full DiDi guide', href: '/didi-in-china-for-foreigners/' }, { label: 'China payment guide', href: '/china-payment-guide/' }, { label: 'Best China travel apps', href: '/best-apps-for-china-travel-2026/' }],
    sources: [{ label: 'Shanghai government: online ride-hailing for foreign visitors', href: 'https://english.shanghai.gov.cn/en-UsefulApps/20240206/976515bc601f4803b9ce2f64ae9f0cd3.html' }, { label: 'DiDi official website', href: 'https://www.didiglobal.com/' }],
  },
  'beijing-shanghai-layover-240-hour-guide': {
    path: '/beijing-shanghai-layover-240-hour-guide/',
    title: 'Beijing and Shanghai Layovers: Turn Transit Time into a Real Trip',
    intro: 'Use a short airport layover for one realistic city highlight, or use eligible 240-hour visa-free transit for a longer route within the officially permitted areas.',
    metaTitle: 'Beijing & Shanghai Layover Guide 2026: 240-Hour Visa-Free Transit Explained',
    metaDescription: 'Plan a Beijing or Shanghai layover with China 240-hour visa-free transit. Check the third-country route, 65 ports, allowed areas, and realistic itineraries.',
    quickAnswer: 'For a short Beijing or Shanghai layover, plan at most one nearby city area after allowing for immigration, airport transport, security and check-in. For a longer stop, eligible ordinary-passport holders may use China\'s 240-hour visa-free transit policy with a confirmed onward ticket to a different country or region, a designated entry and exit port, and travel only within the officially permitted areas. Check the current rules for your exact route before booking.',
    ctaLabel: 'Plan my layover with Buddy',
    midCtaLabel: 'Check whether my route qualifies',
    ctaHref: '/',
    buddyPrompt: 'Plan my China layover. I arrive at [airport] on [date/time], depart from [airport] to [country/region] on [date/time], hold a [country] passport, and want to see [interests].',
    reviewed: 'September 26, 2026',
    sections: [
      { title: 'Who Qualifies for 240-Hour Transit?', items: ['You must hold an eligible ordinary passport and travel from country or region A through mainland China to a different country or region C.', 'You need a confirmed onward ticket with a departure date within the permitted stay.', 'Entry and exit must use designated ports, and every overnight stop and domestic journey must remain inside the currently permitted areas.', 'A return such as United States -> China -> United States is not third-country transit. Hong Kong and Macao can count as separate regions for route analysis, subject to all other conditions.'] },
      { title: 'Choose an Itinerary That Fits the Clock', table: { headers: ['Available time', 'Practical scope', 'Important buffer'], rows: [['About 10 hours', 'One nearby city area only; avoid ambitious cross-city plans', 'Allow immigration, baggage, transport, security, and return to the airport'], ['About 24 hours', 'One city with an overnight stay or one carefully planned day trip', 'Confirm hotel registration and airport transfer timing'], ['72-240 hours', 'A multi-city route may be possible inside permitted areas', 'Verify each province, port, domestic ticket, and onward departure']] } },
      { title: 'Beijing Layover Ideas', items: ['For a short layover, choose one cluster such as Tiananmen and the hutong area rather than combining it with the Great Wall.', 'For a full day or overnight stay, pre-book the Palace Museum or choose a Great Wall section with reliable transport.', 'PEK and PKX are far from central sights. Build airport transfer time and a large return buffer into the plan.'] },
      { title: 'Shanghai Layover Ideas', items: ['For a short city visit, focus on the Bund, Nanjing Road, or one neighborhood rather than crossing the city repeatedly.', 'A longer stay can add the Former French Concession, museums, Pudong, or an eligible Yangtze Delta side trip.', 'PVG is far from central Shanghai. Check the last practical metro, Maglev connection, or DiDi timing for your flight.'] },
      { title: 'Can You Take a Train During Transit?', items: ['Yes, domestic rail can be used when the journey remains entirely within the officially permitted areas and your entry and exit ports comply.', 'The policy allows cross-province travel within permitted areas in 24 provincial-level regions; it does not mean unrestricted travel everywhere in mainland China.', 'Carry your passport, temporary entry documentation, domestic bookings, hotel details, and confirmed onward international ticket.'] },
    ],
    faqs: [
      { question: 'Does a US passport holder qualify for 240-hour visa-free transit?', answer: 'US citizens are on the current eligible-nationality list, but the passport, third-country route, ports, dates, tickets, and permitted-area conditions must all be met.' },
      { question: 'Can I fly to China and return to the same country?', answer: 'Not under the 240-hour transit route. The destination after mainland China must be a different country or region from the place you entered from.' },
      { question: 'Can I take a bullet train between cities?', answer: 'Yes, when every part of the domestic journey remains within the officially permitted areas and the entry and exit arrangements comply with the policy.' },
      { question: 'Is a 10-hour layover enough to leave the airport?', answer: 'Sometimes, but only after allowing for immigration, baggage, airport-city travel, security, and airline check-in. A single nearby area is safer than a multi-stop itinerary.' },
    ],
    related: [{ label: 'Complete visa-free transit guide', href: '/china-visa-free-travel-guide/' }, { label: 'China train booking', href: '/china-train-booking-foreigners-12306/' }, { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' }],
    sources: [{ label: 'National Immigration Administration: visa-free transit policy', href: 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html' }, { label: 'Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' }],
  },
  'how-much-does-china-trip-cost-2026-calculator': {
    path: '/how-much-does-china-trip-cost-2026-calculator/',
    title: 'How Much Does a China Trip Cost in 2026? Real Planning Numbers',
    intro: 'Build a realistic daily budget for accommodation, food, local transport, attractions, and intercity travel, then adjust it for your cities, dates, room sharing, and travel style.',
    metaTitle: 'How Much Does a China Trip Cost in 2026? Daily Budget Calculator',
    metaDescription: 'Plan China trip costs for 2026. Compare budget, mid-range, and comfortable daily spending for hotels, food, transport, attractions, and trains.',
    quickAnswer: 'A useful planning range is RMB 350-650 per person per day for budget travel, RMB 800-1,500 for mid-range travel, or RMB 1,800-3,000+ for a comfortable trip. These ranges exclude international flights and are not fixed prices. Holidays, central hotels, private tours, room sharing, and late booking can change the total substantially.',
    ctaLabel: 'Calculate my China budget with Buddy',
    midCtaLabel: 'Estimate my trip total',
    ctaHref: '/',
    buddyPrompt: 'Estimate my China trip budget. I have [days] days, will visit [cities], travel in [month], prefer [budget/mid-range/comfortable] hotels, and travel with [number] people.',
    reviewed: 'September 26, 2026',
    sections: [
      { title: 'Daily Budget at a Glance', table: { headers: ['Travel style', 'Per person/day', 'Typical approach'], rows: [['Budget', 'RMB 350-650', 'Hostel or simple room, local meals, metro, selective paid sights'], ['Mid-range', 'RMB 800-1,500', 'Comfortable hotel, mixed dining, metro plus some DiDi, several paid sights'], ['Comfortable', 'RMB 1,800-3,000+', 'Higher-grade hotel, frequent taxis, premium meals, tours or shows']] }, items: ['International flights and major intercity journeys are excluded from these daily ranges.', 'Two people sharing one room may spend less per person than a solo traveler.'] },
      { title: 'Where the Money Goes', table: { headers: ['Category', 'Budget approach', 'Mid-range approach', 'Comfortable approach'], rows: [['Hotel', 'Hostel or simple local room', 'Well-reviewed 3-4 star hotel', 'Premium or landmark hotel'], ['Food', 'Local restaurants and simple meals', 'Mixed local and destination dining', 'Premium restaurants and hotel dining'], ['City transport', 'Metro and bus', 'Metro plus some DiDi', 'Frequent DiDi or private transfer'], ['Attractions', 'Free areas and selected tickets', 'Several major paid sights', 'Tours, shows, cable cars, or private guide']] } },
      { title: 'Estimate a Full Trip', items: ['Multiply the daily range by the number of travelers and travel days.', 'Add exact high-speed train or domestic-flight prices for every intercity leg.', 'Add international flights, insurance, visas when required, mobile data, payment fees, shopping, and special activities.', 'Add a contingency of roughly 10-15 percent for price changes and unplanned transport.'] },
      { title: 'When China Costs More', items: ['Chinese New Year, Labor Day, National Day Golden Week, school holidays, fairs, and major events can raise hotel and transport prices.', 'Central Beijing, Shanghai, Shenzhen, resort areas, and famous nature destinations can cost more than secondary cities.', 'Fast multi-city trips create more train, flight, transfer, and hotel-change costs than slower routes.', 'Live prices from hotels, airlines, attractions, and Railway 12306 should replace estimates before booking.'] },
    ],
    faqs: [
      { question: 'How much should I budget per day in China?', answer: 'A practical planning range is RMB 350-650 for budget travel, RMB 800-1,500 for mid-range travel, or RMB 1,800-3,000+ for comfortable travel per person per day.' },
      { question: 'Are international flights included?', answer: 'No. Add international flights separately because origin, season, cabin, and booking date create large price differences.' },
      { question: 'How much does a 10-day China trip cost?', answer: 'Multiply your chosen daily range by ten, then add major intercity transport, international flights, insurance, visa costs where applicable, and a contingency.' },
      { question: 'When is China most expensive to visit?', answer: 'Major public holidays, school holidays, trade fairs, summer peaks, and late booking can tighten availability and raise prices.' },
    ],
    related: [{ label: 'Full China travel budget guide', href: '/china-travel-budget/' }, { label: '7, 10 and 14-day itineraries', href: '/china-itinerary-first-time-7-10-14-days/' }, { label: 'China train booking guide', href: '/china-train-booking-foreigners-12306/' }],
  },
  'china-visa-free-guide-2026': {
    path: '/china-visa-free-guide-2026/',
    title: 'Do You Need a Visa for China in 2026? Probably Not.',
    intro:
      'China now offers several visa-free routes for eligible visitors. The rule that applies depends on your passport, trip purpose, length of stay, and onward itinerary.',
    metaTitle: 'China Visa-Free Guide 2026: 45+ Countries, 30/60 Days & 240-Hour Transit Explained',
    metaDescription:
      'Check if you can visit China visa-free in 2026. Full list of 45+ countries, 30-day rules, 240-hour transit via 65 ports, and entry checklist. Ask ChinaEase Buddy AI.',
    quickAnswer:
      'Many European, Oceanian, and Asian passport holders can enter China for up to 30 days without a visa for eligible purposes. The United Kingdom and Canada joined under a separately announced policy effective February 17, 2026. Travelers who are not covered by the 30-day list may still qualify for 240-hour visa-free transit when traveling from country A through China to a different country or region C.',
    ctaLabel: "Ask Buddy if you're visa-free",
    midCtaLabel: 'Check my passport and route with Buddy',
    ctaHref: '/',
    buddyPrompt: 'Can I enter China visa-free in 2026? My passport is from [country], I plan to stay [days], and my route is [origin] -> China -> [next destination].',
    reviewed: 'September 26, 2026',
    sections: [
      {
        title: 'Who Qualifies in 2026?',
        table: {
          headers: ['Country group', 'Stay', 'Policy period'],
          rows: [
            ['45+ country policy group', 'Up to 30 days', 'Includes France, Germany, Italy, Spain, Malaysia, and other eligible passports; current extensions run through December 31, 2026.'],
            ['United Kingdom', 'Up to 30 days', 'Separate policy batch effective February 17, 2026, through December 31, 2026.'],
            ['Canada', 'Up to 30 days', 'Separate policy batch effective February 17, 2026, through December 31, 2026.'],
            ['Other bilateral arrangements', 'May vary, including some 60-day arrangements', 'Check the rule for your specific passport before departure.'],
          ],
        },
        items: [
          'The United Kingdom and Canada were announced as a separate policy batch. They should not be treated as part of the earlier 45-country announcement.',
          'Visa-free entry normally covers tourism, business, family visits, exchanges, and transit. It does not permit employment or other activities that require prior approval.',
          'Your airline and Chinese immigration officers make the final eligibility and boarding decisions, so verify the current rule before travel.',
        ],
      },
      {
        title: '240-Hour Visa-Free Transit: The 10-Day Option',
        items: [
          'This route can help eligible travelers whose passports are not on the 30-day visa-free list, including travelers from the United States, Brazil, and Mexico.',
          'Your itinerary must be country or region A -> an eligible Chinese port and permitted area -> a different country or region C.',
          'You cannot use the transit policy to fly from your origin country to China and then return directly to that same origin country. A round trip such as United States -> China -> United States does not meet the third-country transit requirement.',
          'The policy covers 65 eligible entry ports and allows travel within the permitted areas attached to your arrival port; it is not limited to staying inside the transit city.',
          'Carry a confirmed onward ticket showing departure within 240 hours and accommodation details for your stay.',
        ],
      },
      {
        title: 'Entry Checklist (No Visa Still Needs This)',
        items: [
          'Passport with at least six months of remaining validity recommended.',
          'Confirmed return or onward ticket that matches the visa-free route you are using.',
          'Hotel booking or local address, including the first night of your stay.',
          '12306 account prepared if you plan to use China Railway trains.',
          'Evidence supporting your purpose of travel if an airline or border officer asks for it.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I make multiple visa-free entries?', answer: 'The policy does not generally impose a published annual entry count, but each entry is assessed separately. Frequent or back-to-back visits may prompt questions about your purpose, itinerary, and whether you are effectively living or working in China.' },
      { question: 'Can I work in China during a visa-free stay?', answer: 'No. Visa-free entry does not authorize employment. You need the appropriate work authorization and residence documents before working in China.' },
      { question: 'Do I need to register with the police?', answer: 'Yes. Hotels normally complete temporary accommodation registration for guests. If you stay in a private home, you and your host should complete registration with the local public security authority within the required local timeframe.' },
      { question: 'Can a US passport holder use the 240-hour transit policy?', answer: 'Potentially, yes, if all eligibility conditions are met. The itinerary must continue to a different country or region after China; United States -> China -> United States is not a qualifying transit route.' },
    ],
    related: [
      { label: 'China train booking guide', href: '/china-train-booking-foreigners-12306/' },
      { label: 'First-time China itineraries', href: '/china-itinerary-first-time-7-10-14-days/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
    ],
  },
  'how-to-pay-in-china-as-foreigner': {
    path: '/how-to-pay-in-china-as-foreigner/',
    title: 'How to Pay in China When Cash Is No Longer the Default',
    intro: 'QR payments dominate daily life in China. Set up both Alipay and WeChat Pay before your trip so you have two payment options when foreign cards are not accepted directly.',
    metaTitle: 'How to Pay in China as a Foreigner (2026): Alipay & WeChat Pay Setup Guide',
    metaDescription: 'The easiest way to pay in China in 2026 is Alipay linked to Visa/Mastercard, with WeChat Pay as backup. Step-by-step setup, fees under ¥200 free.',
    quickAnswer: 'Set up Alipay with a supported international Visa or Mastercard before landing, then prepare WeChat Pay as a backup. Small merchants, taxis, street stalls, and even some attractions rely on QR payments. Carry about ¥200 cash and one physical card as fallbacks.',
    ctaLabel: 'Build my China payment checklist',
    midCtaLabel: 'Ask Buddy about my cards and setup',
    ctaHref: '/',
    buddyPrompt: 'Create a personal China payment setup checklist for me. My phone is [iPhone/Android], my cards are [Visa/Mastercard/etc.], and I arrive on [date].',
    reviewed: 'September 26, 2026',
    sections: [
      { title: 'The 5-Minute Setup You Must Do Before Landing', ordered: true, items: ['Download the standard Alipay app and create an account with your home mobile number.', 'Look for the current international visitor or Tour Pass options in the app if direct card linking is unavailable for your account.', 'Complete identity verification using your passport and face verification when requested.', 'Link a supported Visa or Mastercard and complete your bank\'s verification step.', 'Test the setup with a small payment when possible, then add WeChat Pay as a backup.'] },
      { title: 'Alipay vs WeChat Pay: Which First?', table: { headers: ['Feature', 'Alipay', 'WeChat Pay'], rows: [['Tourist setup', 'Usually easier for foreign visitors', 'Useful backup; setup may vary'], ['Typical published transaction limit', 'Up to ¥3,000 per transaction', 'Up to ¥6,000 per transaction'], ['Best use', 'Primary choice for street stalls, transport, and shops', 'Small merchants that display only a WeChat QR code'], ['Recommendation', 'Set up first', 'Set up second']] }, items: ['Limits and supported cards can change. Confirm the amount displayed in your own app before making a large payment.'] },
      { title: 'Fees You Must Know', items: ['International-card payments of ¥200 or less are generally free of the platform service fee.', 'For a single transaction above ¥200, expect a service fee of about 3%.', 'Splitting a legitimate large purchase into smaller payments may reduce platform fees only when the merchant agrees; never use splitting to bypass app or bank controls.', 'Your card issuer may separately charge foreign-transaction or currency-conversion fees.'] },
      { title: 'What If a QR Payment Fails?', items: ['Try the second wallet: use WeChat Pay if Alipay fails, or vice versa.', 'Keep about ¥200 in RMB cash for taxis, food, and small emergencies.', 'Use Trip.com for hotels and train bookings when you need an English checkout that accepts foreign cards.', 'Call your bank if it blocks the verification or China-based transaction.'] },
    ],
    faqs: [
      { question: 'Can foreigners use Alipay without a Chinese bank account?', answer: 'Many foreign visitors can link supported international cards directly to Alipay. Verification and card acceptance can vary, so complete setup before departure and keep backups.' },
      { question: 'Should I set up both Alipay and WeChat Pay?', answer: 'Yes. Alipay is usually the easier primary wallet for visitors, while WeChat Pay is valuable when a small merchant accepts only a WeChat QR payment.' },
      { question: 'Is cash accepted in China?', answer: 'RMB cash remains legal tender, but QR payment is the practical default in many places. Carry small notes because some merchants may not have change.' },
      { question: 'Why did my foreign card payment fail?', answer: 'Common causes include identity verification, bank fraud controls, unsupported card settings, merchant restrictions, or limits. Try your backup wallet or card and contact your issuer.' },
    ],
    related: [{ label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' }, { label: 'China eSIM and internet', href: '/china-esim-internet-guide/' }, { label: 'China travel apps', href: '/china-travel-apps/' }],
  },
  'china-esim-internet-vpn-guide': {
    path: '/china-esim-internet-vpn-guide/',
    title: 'Stay Connected Without Losing Google',
    intro: 'Mainland hotel Wi-Fi and local SIMs do not provide direct access to many familiar overseas services. An international travel eSIM can route data through an overseas gateway and keep those services available without a separate VPN app.',
    metaTitle: 'China eSIM for Tourists 2026: Use Google, WhatsApp & Instagram Without VPN',
    metaDescription: 'WhatsApp & Google blocked in China? Get a China eSIM with built-in VPN on China Unicom. 5G, activates on arrival, no VPN app needed.',
    quickAnswer: 'For most short trips, choose a travel eSIM that explicitly says it routes mainland China data through an overseas gateway such as Hong Kong or Singapore. It can roam on China Unicom or China Mobile while preserving access to Google, WhatsApp, and Instagram without a separate VPN app.',
    ctaLabel: 'Ask Buddy which connection fits my phone',
    midCtaLabel: 'Check my phone and data needs',
    ctaHref: '/',
    buddyPrompt: 'Help me choose internet access for China. My phone model is [model], it is [locked/unlocked], my trip is [days] days, and I need [Google/WhatsApp/Instagram/work apps].',
    reviewed: 'September 26, 2026',
    sections: [
      { title: 'What Is Blocked?', table: { headers: ['Service', 'Hotel Wi-Fi or local SIM'], rows: [['Google Search and Gmail', 'Blocked without a working circumvention route'], ['YouTube', 'Blocked'], ['Instagram and Facebook', 'Blocked'], ['WhatsApp', 'Blocked'], ['Google Maps', 'Blocked and not recommended for local map accuracy']] }, items: ['Availability can change. Chinese apps such as Alipay, WeChat, Amap, and DiDi work on ordinary local connections.'] },
      { title: 'Best Solution in 2026: Travel eSIM with Overseas Routing', items: ['The eSIM roams on a mainland network such as China Unicom or China Mobile but sends traffic through a foreign gateway, often in Hong Kong or Singapore.', 'Because routing happens at the carrier level, no separate VPN app is normally required.', 'Providers commonly offering China travel plans include Airalo, Holafly, UPeSIM, and ByteSIM. Check the current plan wording, routing, allowance, hotspot rules, and refund terms before buying.', 'Install the eSIM before departure, but activate or enable data roaming according to the provider\'s instructions.'] },
      { title: 'Local SIM Plus VPN App: The Older Route', items: ['A local SIM can provide a Chinese number and inexpensive data, but blocked overseas services still require a working connection method.', 'VPN availability and use sit in a regulated area; rules and reliability can change.', 'Download and sign in to any necessary app before landing because provider sites and app stores may be difficult to reach after arrival.', 'Do not rely on one connection for critical work, authentication, or travel documents.'] },
      { title: 'Check Your Phone Before Buying', items: ['iPhone XS, XS Max, XR, and newer models generally support eSIM, though models sold for some markets may differ.', 'Confirm that your exact model supports eSIM and is carrier-unlocked.', 'Many newer Google Pixel and Samsung Galaxy models support eSIM, but regional variants differ.', 'Keep your home SIM active if you need bank or account verification SMS, and disable its data roaming to avoid charges.'] },
    ],
    faqs: [
      { question: 'Does WhatsApp work in mainland China?', answer: 'WhatsApp is generally blocked on hotel Wi-Fi and ordinary local mobile data. A properly routed international eSIM or another working connection method may preserve access.' },
      { question: 'Do I need a VPN with a China travel eSIM?', answer: 'Not necessarily. If the plan explicitly routes data through an overseas gateway, blocked services may work without a separate VPN app. Confirm this with the provider before purchase.' },
      { question: 'Can I buy and activate the eSIM after arriving?', answer: 'It may be possible, but installing it before departure is safer. Save the QR code and setup instructions offline, and follow the provider\'s activation timing.' },
      { question: 'Will my phone support a China eSIM?', answer: 'Support depends on the exact model, region, and carrier lock. Check the phone settings and manufacturer specifications before buying a non-refundable plan.' },
    ],
    related: [{ label: 'Essential China travel apps', href: '/china-travel-apps/' }, { label: 'China payment setup', href: '/china-payment-guide/' }, { label: 'First-time itinerary guide', href: '/china-itinerary-first-time-7-10-14-days/' }],
  },
  'china-train-booking-foreigners-12306': {
    path: '/china-train-booking-foreigners-12306/',
    title: "China's 350 km/h Trains Are Open to Foreigners",
    intro: 'Foreign passport holders can book high-speed rail tickets through the official 12306 website or app. Your verified passport is linked to the e-ticket, so no Chinese ID is required.',
    metaTitle: 'How to Book China High-Speed Train Tickets as a Foreigner: 12306 English Guide',
    metaDescription: 'Foreigners can buy China bullet train tickets on 12306 English with passport. No Chinese ID needed. E-ticket linked to passport, scan to board.',
    quickAnswer: 'Use the official Railway 12306 app for real-time inventory with no booking fee, or Trip.com for easier English support with a service fee. Register the passenger name exactly as shown on the passport. At the station, the passport linked to the booking is your ticket.',
    ctaLabel: 'Ask Buddy to plan my train booking',
    midCtaLabel: 'Get help with my route and booking date',
    ctaHref: '/',
    buddyPrompt: 'Help me book a China train. My route is [city] to [city], travel date is [date], passenger passport country is [country], and I prefer [fastest/cheapest/most comfortable].',
    reviewed: 'September 26, 2026',
    howTo: { name: 'How to register on Railway 12306 English with a foreign passport', description: 'Create and verify a Railway 12306 account so you can book China train tickets with a foreign passport.', steps: [{ name: 'Download and switch language', text: 'Download the official Railway 12306 app and switch the interface to English.' }, { name: 'Register your passport', text: 'Create an account with your email and passport number. Enter your name exactly as printed in your passport.' }, { name: 'Complete verification', text: 'Follow the in-app identity or face-verification instructions and wait for passenger verification before booking.' }] },
    sections: [
      { title: '12306 vs Trip.com', table: { headers: ['Option', 'Advantages', 'Trade-off'], rows: [['Railway 12306', 'Official inventory, real seats, no booking fee', 'Registration and verification can take more effort'], ['Trip.com', 'English support, foreign-card checkout, easier interface', 'Usually adds a booking fee of about ¥20-50']] } },
      { title: 'How to Register on 12306 English', ordered: true, items: ['Download the official Railway 12306 app and switch the interface to English.', 'Register with your email and foreign passport number. Enter the passenger name exactly as it appears on the passport.', 'Complete the requested identity or face verification. Do this before tickets for your travel date go on sale.'] },
      { title: 'Boarding: No Paper Ticket', items: ['Your verified passport is linked to the e-ticket and acts as your ticket.', 'At an automated gate that reads foreign passports, scan the passport used for the booking.', 'If the gate does not accept the passport, use the staffed channel; do not buy a duplicate ticket.', 'Arrive 45-60 minutes early at a large station for security, navigation, and passport checks.'] },
      { title: 'Top Routes to Book', table: { headers: ['Route', 'Typical fastest time', 'Why take the train'], rows: [['Beijing -> Shanghai', 'About 4.5 hours', 'City-center travel with frequent departures'], ["Beijing -> Xi'an", 'About 4.5 hours', 'Faster door to door than flying for many trips'], ['Shanghai -> Hangzhou', 'About 45 minutes', 'Easy day trip or onward connection']] } },
    ],
    faqs: [
      { question: 'Can foreigners book China trains on 12306?', answer: 'Yes. Foreign passport holders recognized by the system can register, verify passenger details, and buy tickets on the official Railway 12306 platform.' },
      { question: 'Do I need a Chinese ID card?', answer: 'No. Use the foreign passport entered during registration and carry the same physical passport when traveling.' },
      { question: 'Do I need to collect a paper ticket?', answer: 'Usually no. The booking is an e-ticket linked to your passport. Use the passport at the gate or ask staff to use the manual channel.' },
      { question: 'When should I book popular routes?', answer: 'Book when sales open for your date, especially around national holidays and weekends. Current sale windows and schedules can change, so check 12306.' },
    ],
    related: [{ label: 'China itinerary planner', href: '/china-itinerary-first-time-7-10-14-days/' }, { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' }, { label: 'China payment guide', href: '/china-payment-guide/' }],
  },
  'china-itinerary-first-time-7-10-14-days': {
    path: '/china-itinerary-first-time-7-10-14-days/',
    title: 'China Itinerary for First-Time Visitors: 7, 10 or 14 Days',
    intro: 'Choose two cities in seven days, the Beijing-Xi\'an-Shanghai golden triangle in ten, or add one nature or food destination for a well-paced fourteen-day first visit.',
    metaTitle: 'China Itinerary for First-Timers: 7, 10 or 14 Days (2026)',
    metaDescription: "Compare practical 7-, 10- and 14-day China itineraries, including Beijing, Xi'an, Shanghai, Chengdu and Guilin, with realistic transfer advice.",
    quickAnswer: "For seven days, choose Beijing plus Xi'an or Shanghai. With ten days, follow the classic Beijing-Xi'an-Shanghai route. With fourteen days, add Guilin for landscapes or Chengdu for food and pandas without turning the trip into a daily transfer marathon.",
    ctaLabel: 'Get my free personalised China itinerary',
    midCtaLabel: 'Personalize this route for my interests',
    ctaHref: '/#trip-plan',
    buddyPrompt: 'Build my first China itinerary. I have [7/10/14] days, I like [history/food/nature], my budget is [budget], and I arrive in [city].',
    reviewed: 'September 26, 2026',
    lastModified: '2026-10-10',
    sections: [
      { title: 'Quick Picker', table: { headers: ['Days', 'Cities', 'Pace', 'Best for'], rows: [['7 days', '2 cities', 'Focused', 'A first look with minimal transfers'], ['10 days', '3 cities', 'Balanced', "Beijing, Xi'an, and Shanghai highlights"], ['14 days', '4-5 destinations', 'Varied', 'Adding nature, pandas, or regional food']] } },
      { title: 'Route 1: The Golden Triangle', items: ['Beijing: 3 days for the Forbidden City, Great Wall, hutongs, and imperial history.', "Xi'an: 2 days for the Terracotta Warriors, city wall, and Muslim Quarter.", 'Shanghai: 3 days for the Bund, neighborhoods, museums, and modern city life.', 'Add a Suzhou day trip when your schedule has at least one flexible Shanghai day.'] },
      { title: 'Route 2: Culture Plus Nature', items: ["Begin with Beijing and Xi'an for China’s essential historical arc.", 'Continue to Guilin and Yangshuo for the Li River, karst landscapes, and a slower finish.', 'Use this route when scenery matters more than finishing in Shanghai.'] },
      { title: 'Route 3: Pandas and Mountains', items: ['Base in Chengdu for pandas, Sichuan food, teahouses, and a relaxed urban pace.', 'Continue to Zhangjiajie for dramatic sandstone peaks and hiking viewpoints.', 'Allow a buffer day because the transfer is longer and mountain weather can affect plans.'] },
      { title: 'Train or Flight?', items: ['If the fastest high-speed train takes under five hours, take the train in most cases.', "Beijing to Xi'an is a good example: the train takes about 4.5 hours and is often faster door to door after airport travel, check-in, and security.", 'Fly when the rail journey is long, the flight schedule is substantially better, or you are connecting distant regions.', 'Avoid one-night city stops. Two or three nights per major destination makes a first trip more enjoyable.'] },
    ],
    faqs: [
      { question: 'Is seven days enough for a first trip to China?', answer: 'Yes, if you choose two cities. Beijing plus Xi\'an emphasizes history; Beijing plus Shanghai gives a stronger old-and-new contrast.' },
      { question: 'What is the best 10-day China itinerary?', answer: "The classic first-time route is Beijing for three days, Xi'an for two, and Shanghai for three, using the remaining time for transfers and a Suzhou day trip." },
      { question: 'Should I add Guilin or Chengdu to a 14-day trip?', answer: 'Choose Guilin for landscapes and outdoor time. Choose Chengdu for pandas, Sichuan food, and a more relaxed city experience.' },
      { question: 'Should I book trains or flights between Chinese cities?', answer: 'Use high-speed rail when the journey is under about five hours. Compare total door-to-door time rather than the scheduled flight duration alone.' },
    ],
    related: [{ label: '7-day China itinerary', href: '/7-day-china-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: 'First trip to China guide', href: '/first-trip-to-china/' }, { label: 'China train booking guide', href: '/china-train-booking-foreigners-12306/' }, { label: 'China travel budget', href: '/china-travel-budget/' }, { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' }, { label: 'China eSIM guide', href: '/china-esim-internet-guide/' }],
  },
  faq: {
    path: '/faq/',
    title: 'ChinaEase Buddy FAQ',
    intro: 'Short answers for travelers using ChinaEase Buddy and preparing for practical travel situations in China.',
    metaTitle: 'ChinaEase Buddy FAQ | China Travel Tools for Foreign Visitors',
    metaDescription:
      'Answers about ChinaEase Buddy, China travel apps, Alipay, WeChat Pay, Google Maps, taxis, emergency numbers, and service limitations.',
    quickAnswer:
      'ChinaEase Buddy is a web-based digital travel toolkit for foreign visitors in China. It helps with phrase cards, payment situations, food, transport, hotels, emergency references, and Buddy AI travel questions.',
    ctaLabel: 'Open the free toolkit',
    ctaHref: '/',
    sections: [
      {
        title: 'Useful starting points',
        items: [
          'Use the app checklist before your trip.',
          'Open payment phrases when Alipay, WeChat Pay, cards, or cash become confusing.',
          'Use emergency help for reference numbers and simple Chinese phrases.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is ChinaEase Buddy?',
        answer:
          'ChinaEase Buddy is a web-based digital China travel toolkit for foreign visitors. It helps with phrase cards, payments, food, transport, hotels, emergency references, and Buddy AI travel questions.',
      },
      {
        question: 'Is ChinaEase Buddy free?',
        answer:
          'ChinaEase Buddy has a free starting plan with core tools and limited Buddy AI usage. Paid passes may unlock additional digital access, but checkout availability can vary during early access.',
      },
      {
        question: 'How do paid passes work?',
        answer:
          'Paid passes are one-time digital travel passes purchased through Gumroad. Access is activated immediately after purchase using your sale ID.',
      },
      {
        question: 'Is ChinaEase Buddy an official travel service?',
        answer:
          'No. ChinaEase Buddy is not an official travel authority or government service. It is a digital travel toolkit for convenience.',
      },
      {
        question: 'Does ChinaEase Buddy provide visa, immigration, medical, legal, or financial services?',
        answer:
          'No. ChinaEase Buddy does not provide visa, immigration, medical, legal, financial, hotel booking, flight booking, or official travel services.',
      },
      {
        question: 'What apps should I download before visiting China?',
        answer:
          'Commonly useful apps include Alipay, WeChat, Amap, Didi, and Trip.com. Setup and availability can vary, so check each app before traveling.',
      },
      {
        question: 'Can foreigners use Alipay in China?',
        answer:
          'Many foreign visitors can try using Alipay with supported cards, but setup and acceptance may vary. Keep backup payment options.',
      },
      {
        question: 'Can tourists use WeChat Pay in China?',
        answer:
          'Some tourists may be able to use WeChat Pay with supported cards and verification. Rules and availability can change.',
      },
      {
        question: 'Does Google Maps work in China?',
        answer:
          'Google services may be limited in mainland China. Amap is often more useful for local navigation and Chinese addresses.',
      },
      {
        question: 'How do I take a taxi in China without speaking Chinese?',
        answer:
          'Use Didi when possible, save your destination in Chinese, and show short driver phrase cards such as “Please take me to this address.”',
      },
      {
        question: 'What emergency numbers should travelers know in China?',
        answer:
          'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services directly.',
      },
    ],
    related: [
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
    ],
  },
};

applyGuideSearchUpdates();

Object.assign(
  guidePages['nia-12367-online-accommodation-registration-guide'],
  guideFromArticle(
    accommodationRegistrationGuide,
    '/nia-12367-online-accommodation-registration-guide/',
    'Get your free personalized trip starter',
    [
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
    ],
  ),
  { featuredFaqCount: 3, ctaBeforeFeaturedFaqs: true, buddyPrompt: undefined },
);

guidePages['china-payment-guide'].related.unshift({ label: 'TenPayGo for tourists', href: '/tenpaygo-for-tourists/' });
guidePages['china-hotels-for-foreigners'].related.unshift({ label: 'Online accommodation registration', href: '/nia-12367-online-accommodation-registration-guide/' });
guidePages['china-airport-arrival-guide'].related.unshift({ label: 'Register a non-hotel stay with NIA 12367', href: '/nia-12367-online-accommodation-registration-guide/' });
guidePages['china-airport-arrival-guide'].related.unshift({ label: 'China visa-free checker', href: '/china-visa-free-checker/' });
guidePages['nia-12367-online-accommodation-registration-guide'].related.unshift({ label: 'China visa-free checker', href: '/china-visa-free-checker/' });
guidePages['china-visa-free-travel-guide'].related.unshift({ label: 'China visa-free checker', href: '/china-visa-free-checker/' });
guidePages['china-240-hour-visa-free-transit-2026'].related.unshift(
  { label: '240-hour transit calculator', href: '/china-240-hour-transit-calculator/' },
  { label: 'China visa-free checker', href: '/china-visa-free-checker/' },
);

function setMetaContent(selector: string, attr: 'content', value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.includes('property=')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) element.setAttribute('property', property);
    } else {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
}

function useNoIndexPage(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    setMetaContent('meta[name="robots"]', 'content', 'noindex, follow');
  }, [enabled]);
}

function useGuideSeo(page: GuidePageData) {
  useEffect(() => {
    document.title = page.metaTitle;
    setMetaContent('meta[name="description"]', 'content', page.metaDescription);
    setMetaContent('meta[property="og:title"]', 'content', page.metaTitle);
    setMetaContent('meta[property="og:description"]', 'content', page.metaDescription);
    setMetaContent('meta[property="og:url"]', 'content', `${siteUrl}${page.path}`);
    setMetaContent('meta[name="twitter:title"]', 'content', page.metaTitle);
    setMetaContent('meta[name="twitter:description"]', 'content', page.metaDescription);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteUrl}${page.path}`;

    document.getElementById('chinaease-guide-schema')?.remove();
    const schema = document.createElement('script');
    schema.id = 'chinaease-guide-schema';
    schema.type = 'application/ld+json';
  const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}${page.path}#webpage`,
        url: `${siteUrl}${page.path}`,
        name: page.metaTitle,
        description: page.metaDescription,
        isPartOf: {
          '@type': 'WebSite',
          name: 'ChinaEase Buddy',
          url: `${siteUrl}/`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}${page.path}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides/` },
          { '@type': 'ListItem', position: 3, name: page.title, item: `${siteUrl}${page.path}` },
        ],
      },
    ];

    if (page.isArticle) {
      graph.push({
        '@type': 'Article',
        '@id': `${siteUrl}${page.path}#article`,
        headline: page.title,
        description: page.metaDescription,
        dateModified: page.lastModified,
        mainEntityOfPage: { '@id': `${siteUrl}${page.path}#webpage` },
        author: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
      });
    }

    graph.push({
      '@type': 'FAQPage',
      '@id': `${siteUrl}${page.path}#faq`,
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });

    if (page.howTo) {
      graph.push({
        '@type': 'HowTo',
        '@id': `${siteUrl}${page.path}#howto`,
        name: page.howTo.name,
        description: page.howTo.description,
        step: page.howTo.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      });
    }

    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
    document.head.appendChild(schema);

    return () => {
      document.getElementById('chinaease-guide-schema')?.remove();
    };
  }, [page]);
}

function PageShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  const assetBase = import.meta.env.BASE_URL;

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-gray-900 md:px-6">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63] hover:text-[#0e4a4e]">
          <ArrowLeft className="h-4 w-4" />
          Back to ChinaEase Buddy
        </a>

        <div className="rounded-3xl border border-[#155e63]/10 bg-white/85 p-5 shadow-sm backdrop-blur md:p-8">
          <div className="mb-6 flex items-start gap-3">
            <img src={`${assetBase}logo.png`} width="42" height="42" alt="ChinaEase Buddy" className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">ChinaEase Buddy</p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{title}</h1>
            </div>
          </div>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">{intro}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

function PricingPage() {
  useNoIndexPage(true);
  return (
    <PageShell
      title="Pricing"
      intro="ChinaEase Buddy starts with a free toolkit. Paid passes are optional one-time purchases processed securely through Gumroad."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-5 shadow-sm ${
              plan.featured ? 'bg-[#155e63] text-white' : 'border border-gray-100 bg-white'
            }`}
          >
            <h2 className={`text-sm font-semibold ${plan.featured ? 'text-white' : 'text-gray-950'}`}>{plan.name}</h2>
            <p className={`mt-2 text-3xl font-bold ${plan.featured ? 'text-white' : 'text-gray-950'}`}>{plan.price}</p>
            <p className={`mt-1 text-xs ${plan.featured ? 'text-white/70' : 'text-gray-500'}`}>{plan.note}</p>
            <ul className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className={`flex items-start gap-2 text-xs ${plan.featured ? 'text-white/85' : 'text-gray-600'}`}>
                  <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.featured ? 'text-[#7dd3d8]' : 'text-[#155e63]'}`} />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={plan.href}
              target={plan.plan === 'free' ? undefined : '_blank'}
              rel={plan.plan === 'free' ? undefined : 'noopener noreferrer'}
              onClick={() => {
                void trackEvent('cta_clicked', {
                  ctaName: plan.cta,
                  destination: plan.plan === 'trip_pass' ? 'Gumroad Trip Pass' : plan.plan === 'group_pass' ? 'Gumroad Group Pass' : 'free-toolkit',
                  tool: 'pricing',
                  plan: plan.plan,
                });
              }}
              className={`mt-5 inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                plan.featured ? 'bg-white text-[#155e63] hover:bg-gray-50' : 'border border-[#155e63]/15 bg-[#155e63]/5 text-[#155e63] hover:bg-[#155e63]/10'
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-[#155e63]/10 bg-[#155e63]/5 p-4">
        <p className="text-sm font-semibold text-[#155e63]">One-time payment · No auto-renewal.</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-600">
          How is payment processed? Payments are processed securely by Gumroad. ChinaEase Buddy never sees or stores your card details.
        </p>
      </div>
    </PageShell>
  );
}

function LegalPage({ type }: { type: LegalPageType }) {
  useNoIndexPage(type === 'about' || type === 'refund');
  const page = legalCopy[type];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('loading');
    try {
      await unsubscribeNewsletter(trimmed, new URLSearchParams(window.location.search).get('token'));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <PageShell title={page.title} intro={page.intro}>
      {type === 'unsubscribe' && (
        <section className="mb-6 rounded-2xl border border-[#155e63]/15 bg-white p-5 shadow-sm">
          <label htmlFor="unsubscribe-email" className="text-sm font-bold text-gray-900">Email address</label>
          <input
            id="unsubscribe-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#155e63]/40"
            placeholder="you@example.com"
          />
          <button
            onClick={handleUnsubscribe}
            disabled={status === 'loading'}
            className="mt-3 rounded-full bg-[#155e63] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {status === 'loading' ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
          {status === 'success' && <p className="mt-3 text-sm font-semibold text-[#155e63]">You have been unsubscribed.</p>}
          {status === 'error' && <p className="mt-3 text-sm font-semibold text-red-600">Could not unsubscribe. Please contact support.</p>}
        </section>
      )}
      <div className="space-y-4">
        {page.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="text-base font-semibold text-gray-950">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{section.body}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function FilterableCountryChecklist({ groups }: { groups: Array<{ region: string; countries: string[] }> }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      countries: group.countries.filter((country) => country.toLocaleLowerCase().includes(normalizedQuery)),
    }))
    .filter((group) => group.countries.length > 0);
  const resultCount = filteredGroups.reduce((total, group) => total + group.countries.length, 0);

  return (
    <div className="mt-4">
      <label htmlFor="eligible-country-filter" className="text-sm font-semibold text-gray-950">
        Check an eligible nationality
      </label>
      <input
        id="eligible-country-filter"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the 57-country list"
        className="mt-2 w-full rounded-xl border border-[#155e63]/20 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#155e63] focus:ring-2 focus:ring-[#155e63]/15"
      />
      <p className="mt-2 text-xs text-gray-500" aria-live="polite">
        {resultCount} {resultCount === 1 ? 'country' : 'countries'} shown. Nationality alone does not confirm eligibility.
      </p>
      <div className="mt-4 space-y-4">
        {filteredGroups.map((group) => (
          <div key={group.region}>
            <h3 className="text-sm font-bold text-gray-950">{group.region}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {group.countries.map((country) => (
                <li key={country} className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
                  {country}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {filteredGroups.length === 0 && (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">No country in the current list matches that search.</p>
        )}
      </div>
    </div>
  );
}

function GuidePage({ type, userId, onAskBuddy }: { type: GuidePageType; userId?: string | null; onAskBuddy?: (prefill?: string) => void }) {
  const page = guidePages[type];
  const isItineraryPage = type.includes('itinerary') && type !== 'china-travel-ai-itinerary-generator';
  const featuredFaqs = page.featuredFaqCount ? page.faqs.slice(0, page.featuredFaqCount) : [];
  const remainingFaqs = page.featuredFaqCount ? page.faqs.slice(page.featuredFaqCount) : page.faqs;
  useGuideSeo(page);

  const handlePrimaryCta = () => {
    void trackEvent('guide_cta_click', {
      guidePage: type,
      destination: onAskBuddy && page.buddyPrompt ? 'buddy' : page.ctaHref,
    }, userId);
    void trackEvent('cta_clicked', {
      ctaName: page.ctaLabel,
      destination: onAskBuddy && page.buddyPrompt ? 'buddy' : page.ctaHref,
      tool: type,
    }, userId);
    if (onAskBuddy && page.buddyPrompt) onAskBuddy(page.buddyPrompt);
    else window.location.href = page.ctaHref;
  };

  useEffect(() => {
    initAttribution();
    trackEventOnce(
      `guide:${type}:${window.location.search}`,
      'guide_page_viewed',
      {
        pageType: type,
        path: `${window.location.pathname}${window.location.search}`,
      },
      userId,
    );
  }, [type, userId]);

  return (
    <PageShell title={page.title} intro={page.intro}>
      <div className="space-y-6">
        {type !== 'guides' && (
          <nav aria-label="Breadcrumb" className="text-sm">
            <a
              href="/guides/"
              className="font-semibold text-[#155e63] underline decoration-[#155e63]/25 underline-offset-4 transition hover:decoration-[#155e63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155e63] focus-visible:ring-offset-2"
            >
              Browse all China travel guides
            </a>
          </nav>
        )}
        <section className="rounded-2xl border border-[#155e63]/15 bg-[#155e63]/5 p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Quick answer</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 md:text-base">{page.quickAnswer}</p>
          <p className="mt-3 text-xs font-semibold text-gray-500">Last reviewed: {page.reviewed ?? page.lastReviewed ?? 'June 12, 2026'}</p>
          {featuredFaqs.length === 0 && !isItineraryPage && (
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="mt-4 inline-flex rounded-full bg-[#155e63] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e4a4e]"
            >
              {page.ctaLabel}
            </button>
          )}
        </section>

        <nav className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">On this page</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {page.sections.map((section) => (
              <a key={section.title} href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
                {section.title}
              </a>
            ))}
            <a href="#faq" className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
              FAQ
            </a>
          </div>
        </nav>

        <div className="grid gap-4 md:grid-cols-2">
          {page.sections.map((section) => (
            <section
              id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              key={section.title}
              className={`rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm${section.table ? ' md:col-span-2' : ''}`}
            >
              <h2 className="text-lg font-bold text-gray-950">{section.title}</h2>
              {section.countryGroups && <FilterableCountryChecklist groups={section.countryGroups} />}
              {section.links && section.links.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {section.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="group rounded-xl border border-[#155e63]/15 bg-[#155e63]/5 p-3 transition hover:border-[#155e63]/30 hover:bg-[#155e63]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155e63] focus-visible:ring-offset-2"
                    >
                      <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#155e63]">{link.label}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">{link.description}</p>
                    </a>
                  ))}
                </div>
              )}
              {section.table && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {section.table.headers.map((h) => (
                          <th key={h} className="pb-2 pr-4 font-semibold text-gray-950 first:w-1/4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-gray-50 last:border-0">
                          {row.map((cell, i) => (
                            <td key={i} className={`py-2 pr-4 leading-relaxed text-gray-600${i === 0 ? ' font-semibold text-gray-800' : ''}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.items && section.items.length > 0 && (
                section.ordered ? (
                  <ol className="mt-3 list-decimal list-outside space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item} className="pl-1 text-sm leading-relaxed text-gray-600">{item}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className={`space-y-2 ${section.table ? 'mt-4 border-t border-gray-100 pt-4' : 'mt-3'}`}>
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#155e63]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>

        {page.buddyPrompt && (
          <section className="border-y border-[#155e63]/15 bg-[#155e63] px-5 py-6 text-white md:px-7">
            <p className="text-sm font-semibold text-white/75">Need an answer for your exact trip?</p>
            <button
              type="button"
              onClick={() => onAskBuddy?.(page.buddyPrompt)}
              className="mt-3 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#155e63] transition hover:bg-gray-50"
            >
              {page.midCtaLabel ?? page.ctaLabel}
            </button>
          </section>
        )}

        {isItineraryPage && featuredFaqs.length === 0 && (
          <>
            <RelatedGuidesForForeigners />
            <section className="border-y border-[#155e63]/15 py-6 text-center">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="inline-flex rounded-lg bg-[#155e63] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e4a4e]"
              >
                {page.ctaLabel}
              </button>
            </section>
          </>
        )}

        {page.ctaBeforeFeaturedFaqs && featuredFaqs.length > 0 && (
          <section className="border-y border-[#155e63]/15 py-6 text-center">
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="inline-flex rounded-lg bg-[#155e63] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e4a4e]"
            >
              {page.ctaLabel}
            </button>
          </section>
        )}

        {featuredFaqs.length > 0 && (
          <section id="faq" className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:p-5">
            <h2 className="text-xl font-bold text-gray-950">FAQ</h2>
            <div className="mt-4 divide-y divide-gray-100">
              {featuredFaqs.map((faq) => (
                <details key={faq.question} className="group py-3 first:pt-0 last:pb-0">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-gray-950">
                    {faq.question}
                    <span className="float-right text-[#155e63] group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {featuredFaqs.length > 0 && !page.ctaBeforeFeaturedFaqs && (
          <>
            {isItineraryPage && <RelatedGuidesForForeigners />}
            <section className="border-y border-[#155e63]/15 py-6 text-center">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="inline-flex rounded-lg bg-[#155e63] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e4a4e]"
              >
                {page.ctaLabel}
              </button>
            </section>
          </>
        )}

        {remainingFaqs.length > 0 && <section id={featuredFaqs.length > 0 ? 'more-faq' : 'faq'} className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:p-5">
          <h2 className="text-xl font-bold text-gray-950">FAQ</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {remainingFaqs.map((faq) => (
              <details key={faq.question} className="group py-3 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-950">
                  {faq.question}
                  <span className="float-right text-[#155e63] group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>}

        {page.buddyPrompt && (
          <section className="border-y border-[#155e63]/15 py-6 text-center">
            <h2 className="text-xl font-bold text-gray-950">Still deciding?</h2>
            <button
              type="button"
              onClick={() => onAskBuddy?.(page.buddyPrompt)}
              className="mt-4 inline-flex rounded-lg bg-[#155e63] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e4a4e]"
            >
              {page.ctaLabel}
            </button>
          </section>
        )}

        <section className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <h2 className="text-base font-bold text-gray-950">Related guides</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {page.related.map((link) => (
              <a key={link.href} href={link.href} className="rounded-full border border-[#155e63]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#155e63] hover:bg-[#155e63]/5">
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <h2 className="text-base font-bold text-gray-950">Official or primary sources to verify</h2>
          <ul className="mt-3 space-y-2">
            {(page.sources || [
              { label: 'Official app instructions from Alipay, WeChat, Didi, Amap, and Trip.com.', href: '#' },
              { label: 'Your airline, hotel, card issuer, embassy, consulate, or relevant official authority for time-sensitive requirements.', href: '#' },
            ]).map((source) => (
              <li key={source.label} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#155e63]" />
                {source.href === '#' ? (
                  <span>{source.label}</span>
                ) : (
                  <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-medium text-[#155e63] underline decoration-[#155e63]/30 underline-offset-2 hover:decoration-[#155e63]">
                    {source.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4">
          <h2 className="text-sm font-bold text-amber-900">Conservative travel note</h2>
          <p className="mt-2 text-xs leading-relaxed text-amber-900/80">{standardDisclaimer}</p>
        </section>
      </div>
    </PageShell>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function getPolicyPageType(pathname: string): PageType | null {
  const cleanPath = pathname.replace(/\/+$/, '');
  if (cleanPath.endsWith('/pricing')) return 'pricing';
  if (cleanPath.endsWith('/guides')) return 'guides';
  if (cleanPath.endsWith('/terms')) return 'terms';
  if (cleanPath.endsWith('/privacy')) return 'privacy';
  if (cleanPath.endsWith('/refund')) return 'refund';
  if (cleanPath.endsWith('/contact')) return 'contact';
  if (cleanPath.endsWith('/about')) return 'about';
  if (cleanPath.endsWith('/unsubscribe')) return 'unsubscribe';
  if (cleanPath.endsWith('/china-visa-free-travel-guide')) return 'china-visa-free-travel-guide';
  if (cleanPath.endsWith('/china-airport-arrival-guide')) return 'china-airport-arrival-guide';
  if (cleanPath.endsWith('/china-hotels-for-foreigners')) return 'china-hotels-for-foreigners';
  if (cleanPath.endsWith('/china-food-ordering-guide')) return 'china-food-ordering-guide';
  if (cleanPath.endsWith('/chinese-travel-phrases')) return 'chinese-travel-phrases';
  if (cleanPath.endsWith('/china-travel-safety-guide')) return 'china-travel-safety-guide';
  if (cleanPath.endsWith('/china-travel-budget')) return 'china-travel-budget';
  if (cleanPath.endsWith('/china-travel-apps')) return 'china-travel-apps';
  if (cleanPath.endsWith('/amap-in-english')) return 'amap-in-english';
  if (cleanPath.endsWith('/china-metro-guide')) return 'china-metro-guide';
  if (cleanPath.endsWith('/didi-in-china-for-foreigners')) return 'didi-in-china-for-foreigners';
  if (cleanPath.endsWith('/china-train-travel-guide')) return 'china-train-travel-guide';
  if (cleanPath.endsWith('/7-day-china-itinerary')) return '7-day-china-itinerary';
  if (cleanPath.endsWith('/10-day-china-itinerary')) return '10-day-china-itinerary';
  if (cleanPath.endsWith('/14-day-china-itinerary')) return '14-day-china-itinerary';
  if (cleanPath.endsWith('/beijing-vs-shanghai')) return 'beijing-vs-shanghai';
  if (cleanPath.endsWith('/3-day-beijing-itinerary')) return '3-day-beijing-itinerary';
  if (cleanPath.endsWith('/3-day-shanghai-itinerary')) return '3-day-shanghai-itinerary';
  if (cleanPath.endsWith('/3-day-xian-itinerary')) return '3-day-xian-itinerary';
  if (cleanPath.endsWith('/3-day-chongqing-itinerary')) return '3-day-chongqing-itinerary';
  if (cleanPath.endsWith('/3-day-chengdu-itinerary')) return '3-day-chengdu-itinerary';
  if (cleanPath.endsWith('/3-day-guilin-yangshuo-itinerary')) return '3-day-guilin-yangshuo-itinerary';
  if (cleanPath.endsWith('/3-day-zhangjiajie-itinerary')) return '3-day-zhangjiajie-itinerary';
  if (cleanPath.endsWith('/3-day-shenzhen-itinerary')) return '3-day-shenzhen-itinerary';
  if (cleanPath.endsWith('/3-day-guangzhou-itinerary')) return '3-day-guangzhou-itinerary';
  if (cleanPath.endsWith('/3-day-hangzhou-itinerary')) return '3-day-hangzhou-itinerary';
  if (cleanPath.endsWith('/3-day-suzhou-itinerary')) return '3-day-suzhou-itinerary';
  if (cleanPath.endsWith('/3-day-nanjing-itinerary')) return '3-day-nanjing-itinerary';
  if (cleanPath.endsWith('/3-day-dali-itinerary')) return '3-day-dali-itinerary';
  if (cleanPath.endsWith('/china-golden-week-2026-travel-guide')) return 'china-golden-week-2026-travel-guide';
  if (cleanPath.endsWith('/great-wall-of-china-day-trip-from-beijing')) return 'great-wall-of-china-day-trip-from-beijing';
  if (cleanPath.endsWith('/chengdu-panda-base-guide')) return 'chengdu-panda-base-guide';
  if (cleanPath.endsWith('/didi-payment-for-foreigners')) return 'didi-payment-for-foreigners';
  if (cleanPath.endsWith('/beijing-airport-to-city-guide')) return 'beijing-airport-to-city-guide';
  if (cleanPath.endsWith('/amap-vs-google-maps-china')) return 'amap-vs-google-maps-china';
  if (cleanPath.endsWith('/best-time-to-visit-china')) return 'best-time-to-visit-china';
  if (cleanPath.endsWith('/china-sim-card-for-foreigners')) return 'china-sim-card-for-foreigners';
  if (cleanPath.endsWith('/china-240-hour-transit-calculator')) return 'china-240-hour-transit-calculator';
  const lastSegment = cleanPath.split('/').pop() || '';
  if (isTransitAnswerSlug(lastSegment)) return lastSegment;
  if (cleanPath.endsWith('/china-240-hour-visa-free-transit-2026')) return 'china-240-hour-visa-free-transit-2026';
  if (cleanPath.endsWith('/tenpaygo-for-tourists')) return 'tenpaygo-for-tourists';
  if (cleanPath.endsWith('/china-visa-free-checker')) return 'china-visa-free-checker';
  if (cleanPath.endsWith('/china-esim-internet-guide')) return 'china-esim-internet-guide';
  if (cleanPath.endsWith('/alipay-for-foreigners')) return 'alipay-for-foreigners';
  if (cleanPath.endsWith('/wechat-pay-for-foreigners')) return 'wechat-pay-for-foreigners';
  if (cleanPath.endsWith('/china-payment-guide')) return 'china-payment-guide';
  if (cleanPath.endsWith('/china-travel-checklist')) return 'china-travel-checklist';
  if (cleanPath.endsWith('/china-emergency-numbers')) return 'china-emergency-numbers';
  if (cleanPath.endsWith('/china-visa-free-guide-2026')) return 'china-visa-free-guide-2026';
  if (cleanPath.endsWith('/how-to-pay-in-china-as-foreigner')) return 'how-to-pay-in-china-as-foreigner';
  if (cleanPath.endsWith('/china-esim-internet-vpn-guide')) return 'china-esim-internet-vpn-guide';
  if (cleanPath.endsWith('/china-train-booking-foreigners-12306')) return 'china-train-booking-foreigners-12306';
  if (cleanPath.endsWith('/china-itinerary-first-time-7-10-14-days')) return 'china-itinerary-first-time-7-10-14-days';
  if (cleanPath.endsWith('/is-china-safe-for-tourists-2026')) return 'is-china-safe-for-tourists-2026';
  if (cleanPath.endsWith('/best-apps-for-china-travel-2026')) return 'best-apps-for-china-travel-2026';
  if (cleanPath.endsWith('/how-to-use-didi-in-china-foreigners')) return 'how-to-use-didi-in-china-foreigners';
  if (cleanPath.endsWith('/beijing-shanghai-layover-240-hour-guide')) return 'beijing-shanghai-layover-240-hour-guide';
  if (cleanPath.endsWith('/how-much-does-china-trip-cost-2026-calculator')) return 'how-much-does-china-trip-cost-2026-calculator';
  if (cleanPath.endsWith('/china-hotels-for-foreigners-no-rejection-guide')) return 'china-hotels-for-foreigners-no-rejection-guide';
  if (cleanPath.endsWith('/does-google-maps-work-in-china-amap-guide')) return 'does-google-maps-work-in-china-amap-guide';
  if (cleanPath.endsWith('/how-to-visit-great-wall-from-beijing-2026')) return 'how-to-visit-great-wall-from-beijing-2026';
  if (cleanPath.endsWith('/what-to-eat-in-china-first-time-guide')) return 'what-to-eat-in-china-first-time-guide';
  if (cleanPath.endsWith('/how-to-use-wechat-as-foreigner-2026')) return 'how-to-use-wechat-as-foreigner-2026';
  if (cleanPath.endsWith('/nia-12367-online-accommodation-registration-guide')) return 'nia-12367-online-accommodation-registration-guide';
  if (cleanPath.endsWith('/amap-english-mode-guide-2026')) return 'amap-english-mode-guide-2026';
  if (cleanPath.endsWith('/alipay-metro-qr-transport-code-guide')) return 'alipay-metro-qr-transport-code-guide';
  if (cleanPath.endsWith('/china-travel-ai-itinerary-generator')) return 'china-travel-ai-itinerary-generator';
  if (cleanPath.endsWith('/240-hour-transit-zone-map-high-speed-rail')) return '240-hour-transit-zone-map-high-speed-rail';
  if (cleanPath.endsWith('/wechat-verification-without-friend-qr-2026')) return 'wechat-verification-without-friend-qr-2026';
  if (cleanPath.endsWith('/faq')) return 'faq';
  return null;
}

export default function PolicyPage({ type, userId, onAskBuddy }: Props) {
  if (type === 'pricing') return <PricingPage />;
  if (type === 'china-visa-free-checker') return <VisaFreeCheckerPage />;
  if (type === 'china-240-hour-transit-calculator') return <TransitCalculatorPage />;
  if (isTransitAnswerSlug(type)) return <TransitAnswerPage slug={type} />;
  if (type in guidePages) return <GuidePage type={type as GuidePageType} userId={userId} onAskBuddy={onAskBuddy} />;
  return <LegalPage type={type as LegalPageType} />;
}
