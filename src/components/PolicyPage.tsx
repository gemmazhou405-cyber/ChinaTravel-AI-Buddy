import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { PassState } from '../hooks/usePass';
import { isTripOrGroup } from '../lib/membership';
import { gumroadCheckoutUrl } from '../lib/gumroad';
import { ArrowLeft, Check } from 'lucide-react';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { unsubscribeNewsletter } from '../lib/newsletter';
import { RelatedGuidesForForeigners } from './RelatedGuidesForForeigners';
import LinBox from './LinBox';
import { AmapByline, AmapCtaCard, AmapFaqAnswer, AmapGuideBody, AmapQuickAnswer, AmapRichText, GuideProvider, type GuideContent } from './AmapGuide';
import { plainText, quickAnswerText } from '../lib/amapGuideMarkup.mjs';
import planningHelp from '../data/planningHelp.json';
import guideRelatedLinks from '../data/guideRelatedLinks.json';
import suzhouGuide from '../data/suzhouGuide.json';
import nanjingGuide from '../data/nanjingGuide.json';
import daliGuide from '../data/seoPages/3-day-dali-itinerary.json';
import goldenWeekGuide from '../data/seoPages/china-golden-week-2026-travel-guide.json';
import greatWallGuide from '../data/seoPages/great-wall-of-china-day-trip-from-beijing.json';
import emergencyGuideContent from '../data/emergencyGuideContent.json';
import tripCostEstimatorContent from '../data/tripCostEstimatorContent.json';
import beijingGuide from '../data/beijingGuide.json';
import zhangjiajieTianmenUpdate from '../data/zhangjiajieTianmenUpdate.json';
import sevenDayItineraryContent from '../data/sevenDayItineraryContent.json';
import tenDayItineraryContent from '../data/tenDayItineraryContent.json';
import shanghaiVisitPlanning from '../data/shanghaiVisitPlanning.json';
import chongqingVisitPlanning from '../data/chongqingVisitPlanning.json';
import ChinaTripCostEstimator from './ChinaTripCostEstimator';
import firstTimeItineraryContent from '../data/firstTimeItineraryContent.json';
import pandaBaseGuide from '../data/pandaBaseGuide.json';
import didiPaymentGuide from '../data/didiPaymentGuide.json';
import beijingAirportGuide from '../data/seoPages/beijing-airport-to-city-guide.json';
import mapsComparisonGuide from '../data/mapsGuide.json';
import transit240Guide from '../data/seoPages/china-240-hour-visa-free-transit-2026.json';
import tenPayGoGuide from '../data/tenpaygoGuide.json';
import accommodationRegistrationGuide from '../data/seoPages/china-online-accommodation-registration-12367.json';
import arrivalCardGuide from '../data/seoPages/china-online-arrival-card-2026.json';
import visaFreeCheckerGuide from '../data/seoPages/china-visa-free-checker.json';
import amapEnglishSetup from '../data/amapEnglishSetup.json';
import alipayMetroGuide from '../data/alipayMetroGuide.json';
import wechatVerificationGuide from '../data/wechatVerificationGuide.json';
import airportArrivalGuide from '../data/airportArrivalGuide.json';
import trainGuide from '../data/trainGuide.json';
import budgetGuide from '../data/budgetGuide.json';
import appsHubGuide from '../data/appsHubGuide.json';
import hotelsGuide from '../data/hotelsGuide.json';
import checklistGuide from '../data/checklistGuide.json';
import shenzhenItineraryPlanning from '../data/shenzhenItineraryPlanning.json';
import layoverAirportPlanning from '../data/layoverAirportPlanning.json';
import didiGuide from '../data/didiGuide.json';
// Extra sections, FAQs and in-body links (including content folded in from guides that now 301 here);
// the static prerender applies the same file.
import guideContentAdditions from '../data/guideContentAdditions.json';
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
  | 'china-itinerary-first-time-7-10-14-days'
  | 'beijing-shanghai-layover-240-hour-guide'
  | 'what-to-eat-in-china-first-time-guide'
  | 'how-to-use-wechat-as-foreigner-2026'
  | 'nia-12367-online-accommodation-registration-guide'
  | 'china-online-arrival-card-2026'
  | 'amap-english-mode-guide-2026'
  | 'alipay-metro-qr-transport-code-guide'
  | 'china-travel-ai-itinerary-generator'
  | 'wechat-verification-without-friend-qr-2026'
  | 'faq';
type PageType = 'pricing' | 'china-240-hour-transit-calculator' | TransitAnswerSlug | LegalPageType | GuidePageType;

interface Props {
  type: PageType;
  userId?: string | null;
  onAskBuddy?: (prefill?: string) => void;
  passState?: PassState | null;
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
    // One-sentence notes with inline links, from guideContentAdditions sectionNotes.
    notes?: string[];
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

const contactEmail = 'lin@chinaeasebuddy.com';
const siteUrl = 'https://chinaeasebuddy.com';
const gumroadLinks = {
  trip: gumroadCheckoutUrl('trip'),
  group: gumroadCheckoutUrl('group'),
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
      '10 Buddy AI messages per day',
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
      'Up to 2 devices',
      'Full Premium Toolkit, including all premium phrase cards',
      'One-time payment',
      'Access after activating your purchase',
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
      'Up to 5 devices on one shared pass',
      'Full Premium Toolkit, including all premium phrase cards',
      'One-time payment',
      'Access after activating your purchase',
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
          'Buddy AI conversation content may be processed by ChinaEase Buddy service providers, including DeepSeek (the AI model that answers Buddy chat messages), Coze (a backup AI provider), Cloudflare, Firebase, and Firestore, to provide the requested travel assistance, maintain service quality, and troubleshoot the service. The messages you send in a chat are passed to DeepSeek to generate a reply. Menu photo help is in private testing and is not sold as an active entitlement.',
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
          'If you submit a trip planning enquiry through ChinaEase Buddy, we may collect your email address, approximate travel date, number of travelers, any information you choose to provide about the trip help you need, an optional passport country (the issuing country only, never a passport number) so we can check visa-free entry rules for you, and an optional WhatsApp number if you ask us to reply there. This information is used only to review, process, and respond to your enquiry, and to provide help related to that specific trip. WhatsApp contact is optional and does not involve an automated verification code. If you choose WhatsApp as your contact method, we send one automated WhatsApp message to the number you gave, after your itinerary email has been sent, to tell you it is on its way; this message is delivered through the WhatsApp Business Platform operated by Meta Platforms, which receives your WhatsApp number to deliver it. Submitting a trip planning enquiry does not subscribe you to newsletters or marketing communications. Please do not submit passport numbers or other passport details beyond the issuing country, payment card details, sensitive health or medical information, or other sensitive personal information you do not need to share for trip planning purposes. Trip planning enquiries are processed server-side. To write your itinerary, the trip details you submit (such as dates, number of travelers, trip length, departure and passport country, cities, interests and the help you ask for) are sent to DeepSeek, an AI model provider; your email address and WhatsApp number are not sent to DeepSeek. We may record a salted, one-way hash of your IP address (keyed with a secret value, so the address cannot be recovered from it) for abuse prevention, security, and to limit free itineraries to five per IP address per day; we do not store the IP address itself. We do not store full Buddy conversation content as part of a trip planning submission. Trip enquiry data is retained for as long as needed to process your enquiry and for reasonable business record purposes. You may request access, correction, or deletion of your submitted information by contacting us. Trip planning enquiries may be reviewed by authorised team members to process and respond to your request. We use Resend, an email delivery service, to send your itinerary email and to send administrative notifications when a new enquiry is received. That provider processes only the information necessary to deliver the notification and is not used to send marketing communications to you. When you submit a trip planning enquiry, we may also send a transactional confirmation email to the address you provided to acknowledge receipt and to support any necessary follow-up communication. This email does not subscribe you to our newsletter or marketing communications. The email delivery service provider processes only the information necessary to deliver this confirmation.',
      },
      {
        title: 'Analytics and Service Improvement',
        body:
          'We use Cloudflare Web Analytics to measure aggregate page traffic and performance metrics. Cloudflare Web Analytics does not use cookies, does not store persistent identifiers, and does not track users across websites. Data is processed by Cloudflare, Inc. as described in Cloudflare\'s Privacy Policy. We also record limited interaction events — such as whether Buddy was opened or whether a trip planning enquiry form was submitted — to understand how the service is used and to improve it. These events are stored in our own systems. They do not include the contents of your conversations with Buddy, your trip enquiry text, your email address, payment information, or any other sensitive content. Events are not linked to a persistent user identifier and are not shared with advertising services. To understand which pages and channels bring visitors to us, your browser saves the source of your visit (the referring website, as a domain and page path without query parameters; the page you first landed on; and any UTM campaign tags in the link) in local storage for 30 days. This source information contains no name, email address, IP address, or other personal identifier, is sent to us only together with a trip planning enquiry you choose to submit, and can be removed at any time by clearing this site\'s data in your browser.',
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
    lastModified: '2026-10-21',
    ctaLabel: 'Open the free toolkit',
    ctaHref: '/',
    sections: [
      {
        title: 'Entry rules and arrival',
        links: [
          { label: 'China Visa-Free Checker', description: 'Check which verified policy may apply to your passport, date and route.', href: '/china-visa-free-checker/' },
          { label: 'China 240-Hour Visa-Free Transit Calculator', description: 'Enter your recorded entry date to calculate the transit exit deadline in China time. Check eligibility separately.', href: '/china-240-hour-transit-calculator/' },
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
          { label: 'AMap in English', description: 'Search places and navigate China with English map support.', href: '/amap-english-mode-guide-2026/' },
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
      { label: 'AMap in English', href: '/amap-english-mode-guide-2026/' },
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
      { label: 'First-time China itineraries', href: '/china-itinerary-first-time-7-10-14-days/' },
      { label: 'Is China safe for tourists?', href: '/china-travel-safety-guide/' },
      { label: 'Best apps for China travel', href: '/china-travel-apps/' },
      { label: 'How to use DiDi in China', href: '/didi-in-china-for-foreigners/' },
      { label: 'Beijing and Shanghai layover guide', href: '/beijing-shanghai-layover-240-hour-guide/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'Google Maps and Amap guide', href: '/amap-vs-google-maps-china/' },
      { label: 'Great Wall from Beijing', href: '/great-wall-of-china-day-trip-from-beijing/' },
      { label: 'What to eat in China', href: '/what-to-eat-in-china-first-time-guide/' },
      { label: 'WeChat for foreigners', href: '/how-to-use-wechat-as-foreigner-2026/' },
      { label: 'NIA 12367 accommodation registration', href: '/nia-12367-online-accommodation-registration-guide/' },
      { label: 'Amap English mode guide', href: '/amap-english-mode-guide-2026/' },
      { label: 'Alipay metro QR guide', href: '/alipay-metro-qr-transport-code-guide/' },
      { label: 'China travel AI itinerary generator', href: '/china-travel-ai-itinerary-generator/' },
      { label: 'WeChat verification without a friend', href: '/wechat-verification-without-friend-qr-2026/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
  'tenpaygo-for-tourists': {
    path: '/tenpaygo-for-tourists/',
    title: tenPayGoGuide.heading,
    intro: '',
    metaTitle: tenPayGoGuide.metaTitle,
    metaDescription: tenPayGoGuide.metaDescription,
    quickAnswer: quickAnswerText(tenPayGoGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); these fields feed the schema.
    ctaLabel: tenPayGoGuide.cta.label,
    ctaHref: tenPayGoGuide.cta.href,
    reviewed: tenPayGoGuide.reviewed,
    lastModified: tenPayGoGuide.modified,
    isArticle: true,
    sections: [],
    faqs: tenPayGoGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'How to Pay in China as a Foreigner', href: '/china-payment-guide/' }],
    sources: tenPayGoGuide.sources,
  },
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
      'Eligible ordinary-passport holders can visit China visa-free for up to 30 days for approved purposes, or use 240-hour transit en route to a third country.',
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
    title: airportArrivalGuide.heading,
    intro: '',
    metaTitle: airportArrivalGuide.metaTitle,
    metaDescription: airportArrivalGuide.metaDescription,
    quickAnswer: quickAnswerText(airportArrivalGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); these fields feed the schema.
    ctaLabel: airportArrivalGuide.cta.label,
    ctaHref: airportArrivalGuide.cta.href,
    reviewed: airportArrivalGuide.reviewed,
    lastModified: airportArrivalGuide.modified,
    isArticle: true,
    sections: [],
    faqs: airportArrivalGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'How to Fill in China\'s Online Arrival Card in 2026', href: '/china-online-arrival-card-2026/' }],
    sources: airportArrivalGuide.sources,
  },
  'china-hotels-for-foreigners': {
    path: '/china-hotels-for-foreigners/',
    title: hotelsGuide.heading,
    intro: '',
    metaTitle: hotelsGuide.metaTitle,
    metaDescription: hotelsGuide.metaDescription,
    quickAnswer: quickAnswerText(hotelsGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA.
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    reviewed: hotelsGuide.reviewed,
    lastModified: hotelsGuide.modified,
    isArticle: true,
    sections: [],
    faqs: hotelsGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
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
    sources: hotelsGuide.sources,
  },
  'china-food-ordering-guide': {
    path: '/china-food-ordering-guide/',
    title: 'How to Order Food in China: Menu and Allergy Guide (2026)',
    intro:
      'A practical restaurant guide for QR and photo menus, shared dishes, dietary needs, serious food allergies, payment, and useful Chinese phrases.',
    metaTitle: 'How to Order Food in China (2026) | ChinaEase Buddy',
    metaDescription:
      'You can order food in China without speaking Chinese: use a QR or photo menu and point to the dish. Explain allergies or diet needs and save key phrases.',
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
      { label: 'AMap in English', href: '/amap-english-mode-guide-2026/' },
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
    metaTitle: 'Chinese Phrases for Travelers: Essential Basics (2026)',
    metaDescription:
      'Save essential Chinese phrases for travel, with characters, pinyin and English for taxis, hotels, food, payments, trains, directions and emergencies.',
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
      'Many tourists visit mainland China without serious incidents; UK guidance says serious crime against foreigners is relatively rare. Know scams and laws.',
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
          'The US Department of State currently rates mainland China Level 2, “Exercise increased caution.” Its advisory reissued on September 4, 2026 cites arbitrary enforcement of local laws, exit bans, and the risk of unjust arrest or detention.',
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
          'Decline spontaneous invitations from strangers in major tourist areas when you cannot independently verify the venue, menu, price, and route back.',
          'Inspect payment requests before scanning or approving them. QR-code phishing, substituted payment codes, fake customer support, and suspicious links can expose money or account data.',
          'Use ATMs inside banks or established shopping centers where possible, shield the keypad, and stop if the machine or card slot looks altered.',
          'Never carry a parcel or luggage for a stranger. Pack your own bags and keep them under your control through airport and railway security.',
          'If a dispute becomes threatening, do not start a physical confrontation. Move to a public area, call 110, contact the card issuer if needed, and request a police report.',
        ],
      },
      {
        title: 'Transport and road safety',
        items: [
          'Use official airport taxi queues, verified ride-hailing, or marked and metered taxis. Avoid unmarked or unmetered vehicles even when the offer appears convenient.',
          'Check the licence plate, car model, and driver shown in the app before entering. Do not get into a different vehicle because someone knows your destination.',
          'Traffic direction and road behavior may differ from what you expect. Look both ways at crossings, watch for scooters and e-bikes, and do not assume a green pedestrian light removes every risk.',
          'A foreign or international driving permit alone does not normally authorize driving in mainland China. Confirm current licence and insurance requirements before renting a vehicle.',
          'At railway stations, airports, and overnight trains, keep your passport, phone, cards, and essential medicine on your person rather than in unattended luggage.',
        ],
      },
      {
        title: 'Local laws, identification, and sensitive places',
        items: [
          'Foreign visitors are subject to Chinese law. Rules and enforcement can differ from those in your home country, and saying that you did not know the rule may not prevent penalties.',
          'Official UK advice tells travelers to carry their original passport because police can conduct identity checks and may not accept a printed copy. Keep a separate secure copy as a loss backup.',
          'Avoid demonstrations and political gatherings. Do not photograph military, police, border, government, industrial, or other restricted facilities when permission is unclear.',
          'National-security, counterespionage, data, mapping, research, and publication rules can be broad. Travelers in journalism, academia, government, NGOs, technology, or business should obtain role-specific advice.',
          'Illegal-drug penalties are severe. Do not carry cannabis, CBD, unknown medicine, drug-containing products, or another person\'s bag without confirming legality through official channels.',
          'Drones are regulated. Check current Civil Aviation Administration and local rules before bringing, registering, or flying one.',
        ],
      },
      {
        title: 'Phone, payment, and data safety',
        items: [
          'Set up essential apps before departure and keep access to the phone number used for verification. Do not let a stranger take control of your unlocked phone to “fix” a payment.',
          'Check the merchant name and amount before approving an Alipay or WeChat Pay transaction. Keep receipts and screenshots when a charge is disputed.',
          'Use strong device locks, account recovery methods, and remote-loss controls. Avoid accessing highly sensitive accounts over unknown public Wi-Fi.',
          'Save hotel addresses, emergency phrases, bookings, and one map area offline because international services or mobile data may be unavailable.',
          'If a phone or wallet is lost, freeze cards and payment access quickly, change exposed credentials from a trusted device, and make a police report when required.',
        ],
      },
      {
        title: 'Health, medicine, food, and water',
        items: [
          'Check destination-specific vaccines and medicines with a qualified clinician ideally at least one month before travel. Recommendations depend on route, season, activities, and medical history.',
          'Carry routine and prescribed medicine in appropriate packaging with supporting documents, and verify Chinese import and controlled-medicine rules before travel.',
          'CDC guidance says tap water is not drinkable in China, including major cities. Use sealed bottled water or properly treated water when drinking safety is uncertain.',
          'Choose thoroughly cooked food served hot, practice hand hygiene, and use extra caution with raw or undercooked meat, seafood, eggs, and food held at unsafe temperatures.',
          'For a serious illness, injury, or allergic reaction, follow your personal medical plan and call 120. ChinaEase phrases are communication support, not medical advice.',
        ],
      },
      {
        title: 'Weather and outdoor safety',
        items: [
          'China covers many climates and is affected by earthquakes, heat, cold, altitude, flooding, and severe storms. Check the exact cities and season, not a national average.',
          'Typhoons and flooding commonly affect parts of southern and eastern China from May to November. Monitor official weather and follow local closure or evacuation instructions.',
          'Do not hike alone in isolated areas or on unrestored sections of the Great Wall. Leave the route and expected return time with another person.',
          'Carry water, power, offline navigation, weather-appropriate clothing, and an emergency contact plan for outdoor trips.',
          'When air quality, extreme heat, altitude, or an existing medical condition is relevant, seek personalized medical advice and reduce exposure rather than relying on a generic travel rule.',
        ],
      },
      {
        title: 'What to do in an emergency',
        ordered: true,
        items: [
          'Move away from immediate danger and toward a staffed, well-lit public place when it is safe to do so.',
          'Call 110 for police, 120 for ambulance, or 119 for fire. Ask a hotel, station, restaurant, or security employee to call if language is a barrier.',
          'Show a short Chinese phrase and your exact location: 请帮我报警 (“Please help me call the police”) or 请帮我叫救护车 (“Please help me call an ambulance”).',
          'Contact your embassy or consulate and travel insurer when the situation involves detention, a lost passport, serious medical care, crime, or emergency travel changes.',
          'Preserve booking records, receipts, card charges, screenshots, photos, and the police report number. Do not publish sensitive evidence before obtaining appropriate advice.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is it safe to travel to China in 2026?',
        answer:
          'Many tourists travel without serious incidents, and UK guidance says serious crime against foreign nationals is relatively rare. Travelers should still protect belongings, avoid scams, use verified transport, follow local laws, and check current government advice for their nationality and route.',
      },
      {
        question: 'Is China safe for solo female travelers?',
        answer:
          'Many women travel independently in China, but normal solo-travel precautions still matter. Keep control of drinks and transport, meet new contacts in public, share plans, avoid isolated places at night, and leave if a person or venue makes you uncomfortable.',
      },
      {
        question: 'What scams should tourists watch for in China?',
        answer:
          'Common warnings include tea-house, massage, bar, and “practice English” invitations that end with an inflated bill. Also check QR codes, payment amounts, ATM equipment, suspicious links, and anyone asking you to carry a parcel.',
      },
      {
        question: 'Should I carry my passport in China?',
        answer:
          'Official UK guidance advises carrying the original passport because police may conduct identity checks and may not accept a printed copy. Store a secure copy separately and check the current advice for your nationality and situation.',
      },
      {
        question: 'Is tap water safe to drink in China?',
        answer:
          'CDC traveler guidance says tap water is not drinkable in China, including major cities. Use factory-sealed bottled water or water that has been properly treated when drinking safety is uncertain.',
      },
      {
        question: 'What are the emergency numbers in China?',
        answer:
          'Call 110 for police, 120 for ambulance, and 119 for fire. Save the numbers and useful Chinese phrases offline before travel.',
      },
      {
        question: 'Do I need travel insurance for China?',
        answer:
          'Travel insurance is strongly recommended. Check that the policy covers your medical needs, planned activities, evacuation, trip disruption, valuables, and any pre-existing conditions; exclusions vary by policy.',
      },
    ],
    related: [
      { label: 'Is China safe for US citizens?', href: '/china-travel-safety-guide/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
      { label: 'Essential Chinese travel phrases', href: '/chinese-travel-phrases/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'How to order food in China', href: '/china-food-ordering-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'UK government: China safety and security advice', href: 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security' },
      { label: 'US Department of State: China travel advisory', href: 'https://travel.state.gov/en/international-travel/travel-advisories/china.html' },
      { label: 'Australian Smartraveller: China travel advice', href: 'https://www.smartraveller.gov.au/destinations/asia/china' },
      { label: 'CDC: China traveler health guidance', href: 'https://wwwnc.cdc.gov/travel/destinations/traveler/none/china' },
      { label: 'China Meteorological Administration', href: 'https://www.cma.gov.cn/en/' },
    ],
  },
  'china-travel-budget': {
    path: '/china-travel-budget/',
    title: budgetGuide.heading,
    intro:
      'A practical RMB budget for hotels, food, local transport, trains, attractions, mobile data, and 5-, 10-, or 14-day trips in mainland China.',
    metaTitle: budgetGuide.metaTitle,
    metaDescription: budgetGuide.metaDescription,
    quickAnswer: quickAnswerText(budgetGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components) after the calculator; keeps its own itinerary CTA.
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    reviewed: budgetGuide.reviewed,
    lastModified: budgetGuide.modified,
    isArticle: true,
    sections: [],
    faqs: budgetGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: '7-day China itinerary', href: '/7-day-china-itinerary/' }],
    sources: budgetGuide.sources,
  },
  'china-travel-apps': {
    path: '/china-travel-apps/',
    title: appsHubGuide.heading,
    intro: '',
    metaTitle: appsHubGuide.metaTitle,
    metaDescription: appsHubGuide.metaDescription,
    quickAnswer: quickAnswerText(appsHubGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA as well as the gig card.
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    reviewed: appsHubGuide.reviewed,
    lastModified: appsHubGuide.modified,
    isArticle: true,
    sections: [],
    faqs: appsHubGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'Amap in English', href: '/amap-english-mode-guide-2026/' }, { label: 'Set up and use DiDi', href: '/didi-in-china-for-foreigners/' }],
    sources: appsHubGuide.sources,
  },
  'china-train-travel-guide': {
    path: '/china-train-travel-guide/',
    title: trainGuide.heading,
    intro: '',
    metaTitle: trainGuide.metaTitle,
    metaDescription: trainGuide.metaDescription,
    quickAnswer: quickAnswerText(trainGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); this guide has no CTA card, only LinBox.
    ctaLabel: '',
    ctaHref: '',
    reviewed: trainGuide.reviewed,
    lastModified: trainGuide.modified,
    isArticle: true,
    sections: [],
    faqs: trainGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'How to Use DiDi in China as a Foreigner', href: '/didi-in-china-for-foreigners/' }],
    sources: trainGuide.sources,
  },
  'china-metro-guide': {
    path: '/china-metro-guide/',
    title: 'China Metro Guide for Foreigners (2026)',
    intro: 'A practical guide to tickets, overseas cards, transport QR codes, security, transfers, station exits, luggage, and late trains.',
    metaTitle: 'China Metro Guide for Foreigners (2026) | ChinaEase Buddy',
    metaDescription:
      'Foreign visitors can ride China\'s metro with a single-journey ticket from an English machine; some cities also take QR codes or selected overseas cards.',
    quickAnswer:
      'Foreign visitors can use metro systems in major Chinese cities, but ticket and payment options vary by city. The most dependable first-ride method is to plan the route in AMap, note the destination station and exit, then buy a single-journey ticket from an English-language machine or staffed counter. Some cities also support Alipay or WeChat transport QR codes, local transit cards, or direct contactless payment with selected overseas bank cards. Check the signs on the machine and gate instead of assuming one payment method works nationwide, keep the same ticket, card, or QR method for entry and exit, and allow time for the security check.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    isArticle: true,
    sections: [
      {
        title: 'Prepare your first metro trip',
        ordered: true,
        items: [
          'Use AMap to find the nearest station, destination station, line direction, transfer stations, estimated journey time, and recommended exit.',
          'Save the station names in Chinese and English. A station can serve several lines, exits, shopping centres, and large road junctions.',
          'Check the approximate last-train time for the complete route, especially when a transfer or airport line is involved.',
          'Keep a payment backup: some cash in RMB, a working Alipay or WeChat Pay account, and a physical bank card.',
          'Allow extra time for ticket purchase, security screening, transfers, and walking through a large interchange.',
        ],
      },
      {
        title: 'Choose a ticket or payment method',
        table: {
          headers: ['Method', 'What to know'],
          rows: [
            ['Single-journey ticket', 'Buy for a specific destination from a machine or staffed counter; a useful universal backup.'],
            ['Transport QR code', 'May be available through Alipay, WeChat, or a city app; activation and foreign-card support vary.'],
            ['Contactless overseas card', 'Available on supported gates or machines in certain cities; check the card and gate logos.'],
            ['Local transit card or pass', 'Useful for repeated rides, but purchase, top-up, refund, and cross-city rules vary.'],
            ['Cash or staffed counter', 'Keep as a fallback when a phone, QR code, card, or vending machine does not work.'],
          ],
        },
        items: [
          'Beijing officially supports five major card organizations across its metro network. Do not assume that the same card or gate support applies in every other city.',
        ],
      },
      {
        title: 'Buy a single-journey ticket',
        ordered: true,
        items: [
          'Find a ticket vending machine and switch it to English when that option is available.',
          'Select the destination line and station, not the attraction name. Confirm similarly named stations carefully.',
          'Choose the number of passengers and review the fare shown on the screen.',
          'Pay with one of the methods displayed on that machine. Card brands, cash acceptance, notes, coins, and mobile-payment support can differ.',
          'Collect the ticket or token and any change. Keep it until you have fully exited at the destination.',
          'If the machine will not accept your payment, show the destination station to staff at the service counter.',
        ],
      },
      {
        title: 'Enter the station and pass security',
        items: [
          'Follow signs for the correct metro line. Airport, railway, and shopping-centre entrances may connect to several transport areas.',
          'Place bags on the security scanner when directed and carry liquids or other items through the passenger screening route. Follow local instructions because procedures can vary.',
          'Use the designated gate for your ticket, QR code, transit card, or overseas bank card. Not every gate necessarily accepts every method.',
          'Use the same payment medium at entry and exit. Do not enter with a physical card and try to exit with the phone wallet linked to that card.',
          'Do not follow another passenger through the gate. If the gate does not open, use the service point instead of repeatedly tapping.',
        ],
      },
      {
        title: 'Find the correct platform and direction',
        items: [
          'After entering, follow the line number, line colour, and terminus or next-station direction shown on overhead signs.',
          'Check the next one or two station names against your route before boarding. Opposite directions often use different platforms or corridors.',
          'Stand behind the platform safety line and let passengers leave before boarding.',
          'Watch or listen for the destination station. English announcements and signage are common in major systems, but coverage can vary.',
          'Keep bags close during busy periods and avoid blocking doors or priority areas.',
        ],
      },
      {
        title: 'Transfer between metro lines',
        items: [
          'Follow the transfer signs for the next line without passing through an exit gate unless the route specifically requires an out-of-station transfer.',
          'Large interchange stations can involve long corridors, stairs, escalators, or a separate platform level, so the map time may not include every delay.',
          'Confirm the direction again when you reach the new line. The same line number has two opposite terminus directions.',
          'If you accidentally exit, ask staff before buying another ticket or attempting to re-enter.',
        ],
      },
      {
        title: 'Choose the right station exit',
        items: [
          'Check the exit letter or number in AMap before the train arrives, then compare it with the station exit map and signs.',
          'Different exits can be on opposite sides of a wide road, inside a shopping centre, or several hundred metres apart.',
          'For attractions, hotels, hospitals, and railway stations, use the exit linked to the correct entrance rather than simply choosing the nearest-looking exit.',
          'If an exit is closed, follow the station notice to the alternative and recalculate the walking route after reaching street level.',
        ],
      },
      {
        title: 'Airport, railway-station, and luggage tips',
        items: [
          'Confirm the exact airport terminal or full railway-station name. Major cities can have several airports, terminals, and distant railway stations.',
          'Check that the metro or airport line will still be operating when you land or when your train arrives; do not assume service runs all night.',
          'Allow more transfer time with suitcases, because some routes involve long walks, stairs, crowded trains, or limited lift access.',
          'Follow signs for lifts and accessible routes when needed, but allow a backup route because facilities and access points can change.',
          'During peak periods, an official taxi queue or DiDi may be more practical than several crowded metro transfers with heavy luggage.',
        ],
      },
      {
        title: 'Common metro problems and fixes',
        items: [
          'Card or phone will not open the gate: confirm the gate accepts that brand or QR service, remove other contactless cards, and ask staff rather than tapping repeatedly.',
          'Ticket will not work at exit: take it to the service counter; the fare may need adjustment if the destination or journey time differs.',
          'QR code will not load: check mobile data, screen brightness, account status, and whether the correct city transport code is active.',
          'You boarded in the wrong direction: leave at the next station and follow signs to the opposite platform without exiting the paid area when possible.',
          'You missed the last train or a connection: use the official taxi queue, DiDi, or another verified transport option rather than accepting an unsolicited ride.',
        ],
      },
      {
        title: 'Useful Chinese metro phrases',
        items: [
          '我要去这个地铁站。 — I want to go to this metro station.',
          '怎么买单程票？ — How do I buy a single-journey ticket?',
          '这张银行卡可以用吗？ — Can I use this bank card?',
          '我应该坐哪个方向？ — Which direction should I take?',
          '在哪里换乘？ — Where do I transfer?',
          '我应该从哪个出口出去？ — Which exit should I use?',
          '末班车是几点？ — What time is the last train?',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners use the metro in China?',
        answer:
          'Yes. Foreign visitors can use metro systems in Chinese cities. A passport is not normally needed for an ordinary metro ride, but local security, payment, and ticket rules apply.',
      },
      {
        question: 'Can I buy a China metro ticket with cash?',
        answer:
          'Many systems provide ticket machines or staffed counters that accept RMB, but the denominations and cash support can differ by machine and city. Carry smaller notes and keep a digital or card backup.',
      },
      {
        question: 'Can I use a foreign bank card on the metro?',
        answer:
          'It depends on the city and card. Beijing officially supports contactless access through five major card organizations across its network, and Shanghai offers several international-card routes. Check the gate or machine logo in each city.',
      },
      {
        question: 'Can I use Alipay or WeChat Pay for the metro?',
        answer:
          'Many cities offer a transport QR code or ticket payment through Alipay, WeChat, or a local metro app. Activation, city selection, identity checks, and support for an international card can vary.',
      },
      {
        question: 'Do I need a Chinese phone number to ride the metro?',
        answer:
          'Not if you buy a supported single-journey ticket or use an accepted contactless card. App-based transport codes may have their own account, verification, and phone-number requirements.',
      },
      {
        question: 'Does every Chinese metro use the same ticket or QR code?',
        answer:
          'No. Metro payment products and transport codes are usually city-specific. A method that works in Beijing or Shanghai may require separate activation or may not work in another city.',
      },
      {
        question: 'How late do metros run in China?',
        answer:
          'Operating hours differ by city, line, station, weekday, and special date. Check the official operator or live route information for every line in your journey, especially the final transfer.',
      },
    ],
    related: [
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'AMap in English', href: '/amap-english-mode-guide-2026/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'Beijing government: How to buy subway tickets',
        href: 'https://english.beijing.gov.cn/specials/beijinglifeonthesubway/noticeforpassengers/202206/t20220623_2749418.html',
      },
      {
        label: 'Beijing government: Overseas card tap-and-go',
        href: 'https://english.beijing.gov.cn/latest/news/202506/t20250616_4114250.html',
      },
      {
        label: 'Shanghai government: How to take the metro',
        href: 'https://english.shanghai.gov.cn/en-Transportation/20231214/c727f5e15eff4b8c9340651dd95f3f7c.html',
      },
      { label: 'AMap official mobile website', href: 'https://mobile.amap.com/' },
    ],
  },
  'didi-in-china-for-foreigners': {
    path: '/didi-in-china-for-foreigners/',
    title: didiGuide.heading,
    intro: '',
    metaTitle: didiGuide.metaTitle,
    metaDescription: didiGuide.metaDescription,
    quickAnswer: quickAnswerText(didiGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); these fields feed the schema.
    ctaLabel: didiGuide.cta.label,
    ctaHref: didiGuide.cta.href,
    reviewed: didiGuide.reviewed,
    lastModified: didiGuide.modified,
    isArticle: true,
    sections: [],
    faqs: didiGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'DiDi Pay for Foreigners: How to Pay for DiDi in China', href: '/didi-payment-for-foreigners/' }],
    sources: didiGuide.sources,
  },
  '7-day-china-itinerary': {
    path: '/7-day-china-itinerary/',
    title: '7-Day China Itinerary for First-Time Visitors (2026)',
    intro: sevenDayItineraryContent.intro,
    metaTitle: '7-Day China Itinerary for First-Time Visitors (2026)',
    metaDescription:
      'A 7-day China itinerary works well as three nights in Beijing and three in Shanghai, with a faster Xi\'an option. See day-by-day timing, trains and costs.',
    quickAnswer: sevenDayItineraryContent.quickAnswer,
    ctaLabel: 'Get my personalised 7-day itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 20, 2026',
    lastModified: sevenDayItineraryContent.modified,
    isArticle: true,
    sections: sevenDayItineraryContent.sections,
    faqs: sevenDayItineraryContent.faqs,
    related: [
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: 'Compare 7, 10 and 14-day China itineraries', href: '/china-itinerary-first-time-7-10-14-days/' },
      { label: '3-day Xi\'an itinerary', href: '/3-day-xian-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'Palace Museum: official tickets and Monday closure', href: 'https://young.dpm.org.cn/en/category/279' },
      { label: 'The Palace Museum official international website', href: 'https://intl.dpm.org.cn/index.html' },
      { label: 'Emperor Qinshihuang\'s Mausoleum Site Museum official website', href: 'https://www.bmy.com.cn/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/' },
      { label: 'Railway 12306 official English FAQ', href: 'https://www.12306.cn/en/faq.html' },
    ],
  },
  '10-day-china-itinerary': {
    path: '/10-day-china-itinerary/',
    title: '10-Day China Itinerary for First-Time Visitors',
    intro: tenDayItineraryContent.intro,
    metaTitle: '10-Day China Itinerary for First-Time Visitors',
    metaDescription:
      'Plan a classic 10-day China trip through Beijing, Xi\'an, and Shanghai with daily highlights, train advice, booking tips, and flexible alternatives.',
    quickAnswer: tenDayItineraryContent.quickAnswer,
    ctaLabel: 'Get my personalised 10-day itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 18, 2026',
    lastModified: tenDayItineraryContent.modified,
    isArticle: true,
    sections: tenDayItineraryContent.sections,
    faqs: tenDayItineraryContent.faqs,
    related: [
      { label: "3-day Beijing itinerary", href: "/3-day-beijing-itinerary/" },
      { label: "3-day Shanghai itinerary", href: "/3-day-shanghai-itinerary/" },
      { label: 'Compare 7, 10 and 14-day China itineraries', href: '/china-itinerary-first-time-7-10-14-days/' },
      { label: '3-day Xi\'an itinerary', href: '/3-day-xian-itinerary/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Get a personalised China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'The Palace Museum official international website', href: 'https://intl.dpm.org.cn/index.html' },
      { label: 'Emperor Qinshihuang\'s Mausoleum Site Museum official website', href: 'https://www.bmy.com.cn/' },
      { label: 'Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
      { label: 'Railway 12306 official English FAQ', href: 'https://www.12306.cn/en/faq.html' },
    ],
  },
  '14-day-china-itinerary': {
    path: '/14-day-china-itinerary/',
    title: '14-Day China Itinerary for First-Time Visitors (2026)',
    intro:
      'A balanced two-week route through Beijing, Xi\'an, Chengdu, and Shanghai, with a Guilin alternative for travelers who prefer scenery to pandas and food.',
    metaTitle: '14-Day China Itinerary for First-Time Visitors (2026)',
    metaDescription:
      'A 14-day China itinerary can cover Beijing, Xi\'an, Chengdu and Shanghai. See transport advice, booking priorities, costs and a Guilin alternative.',
    quickAnswer:
      'For a first 14-day trip to China, limit the route to four bases: four nights in Beijing, three in Xi\'an, three in Chengdu, and three in Shanghai, with the final day reserved for departure. This gives you imperial history and the Great Wall, the Terracotta Warriors, Sichuan food and pandas, then historic and modern Shanghai. If landscapes matter more than pandas and food, replace Chengdu with Guilin and Yangshuo rather than adding a fifth destination. Use an open-jaw international ticket so you arrive in Beijing and depart from Shanghai, and verify every long-distance leg against the live 12306 or airline schedule before booking.',
    ctaLabel: 'Get my personalised 14-day itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-10-22',
    isArticle: true,
    sections: [
      {
        title: 'The 14-day route at a glance',
        table: {
          headers: ['Day', 'Base', 'Main plan'],
          rows: [
            ['1', 'Beijing', 'Arrive, check in, set up data and payments, then take a short local walk'],
            ['2', 'Beijing', 'Tiananmen area, Palace Museum, and Jingshan Park'],
            ['3', 'Beijing', 'Full-day Great Wall trip'],
            ['4', 'Beijing', 'Temple of Heaven and hutongs, or the Summer Palace'],
            ['5', 'Xi\'an', 'High-speed train, hotel check-in, then City Wall or Bell and Drum Tower area'],
            ['6', 'Xi\'an', 'Terracotta Warriors and a light evening'],
            ['7', 'Xi\'an', 'History museum or Tang-culture focus and Giant Wild Goose Pagoda area'],
            ['8', 'Chengdu', 'Train or flight, hotel check-in, Sichuan food, and an easy neighborhood walk'],
            ['9', 'Chengdu', 'Early Panda Base visit, then People\'s Park or a teahouse area'],
            ['10', 'Chengdu', 'Leshan day trip, food day, or a slower city day'],
            ['11', 'Shanghai', 'Travel east, check in, then a short Bund walk if energy allows'],
            ['12', 'Shanghai', 'Old city or Yu Garden area, the Bund, and Pudong skyline'],
            ['13', 'Shanghai', 'Neighborhoods, museum, architecture, food, or one focused day trip'],
            ['14', 'Shanghai', 'Flexible final half-day and airport transfer'],
          ],
        },
        items: [
          'This assumes 13 nights in China and an open-jaw flight. If your 14 days include both long-haul travel days, remove one optional day trip or one city.',
          'Four bases are enough. A fifth major destination creates another hotel change and often removes the recovery time that makes a two-week trip enjoyable.',
          'Reverse the route only when international flights and live domestic transport make the opposite direction clearly easier.',
        ],
      },
      {
        title: 'Choose four cities, not every famous place',
        table: {
          headers: ['Route style', 'Suggested bases', 'Best for'],
          rows: [
            ['Balanced classic', 'Beijing, Xi\'an, Chengdu, Shanghai', 'History, food, pandas, and modern cities'],
            ['History and scenery', 'Beijing, Xi\'an, Guilin/Yangshuo, Shanghai', 'Landscapes and outdoor photography'],
            ['Slower first trip', 'Beijing, Xi\'an, Shanghai', 'Families, mobility needs, deeper city time, or less packing'],
          ],
        },
        items: [
          'Chengdu and Guilin solve different travel goals. Choose one instead of trying to fit both between Xi\'an and Shanghai.',
          'Zhangjiajie can replace Chengdu or Xi\'an, but mountain weather, park transfers, walking, and flight schedules require more buffer.',
          'Hong Kong is a separate immigration and border-planning decision. Add it only after checking entry documents and the effect on your mainland route.',
        ],
      },
      {
        title: 'Days 1–4: Beijing with recovery time',
        items: [
          'Keep Day 1 light because immigration, baggage, airport transfer, hotel registration, mobile data, payments, and jet lag can consume much of the day.',
          'Group the Tiananmen area, Palace Museum, and Jingshan on Day 2. Verify the current reservation, identity-document, closure, and entry rules before travel.',
          'Give the Great Wall a full day and choose the section, transfer, walking difficulty, weather backup, and return time in advance.',
          'Use Day 4 for the Temple of Heaven and hutongs, or choose the Summer Palace if gardens and architecture are a higher priority.',
          'Stay near a useful metro line. A slightly less central hotel can be more practical than a landmark address with awkward transport.',
        ],
      },
      {
        title: 'Days 5–7: Xi\'an history without rushing',
        items: [
          'Take a daytime high-speed train from Beijing. Confirm the complete station names because both cities have multiple railway stations.',
          'Keep the arrival evening flexible: choose the City Wall or Bell and Drum Tower area according to hotel location and energy.',
          'Reserve Day 6 for the Terracotta Warriors. The museum is outside central Xi\'an, and its official site says visits use real-name reservations, including for foreign visitors.',
          'Use Day 7 for a history museum or Tang-culture focus, then the Giant Wild Goose Pagoda area. Confirm any separate reservation requirement.',
          'Do not schedule a late-night transfer after every full sightseeing day; the third Xi\'an night protects the pace of the entire trip.',
        ],
      },
      {
        title: 'Days 8–10: Chengdu for pandas and food',
        items: [
          'Travel from Xi\'an on Day 8, then keep the first Chengdu evening for a neighborhood walk and a planned Sichuan meal.',
          'Visit the Chengdu Research Base of Giant Panda Breeding early on Day 9. Check its official opening hours, ticket route, transport, and visitor notices before departure.',
          'Pair the Panda Base with a lighter afternoon such as People\'s Park, a teahouse area, or a food-focused neighborhood rather than another distant excursion.',
          'Use Day 10 for Leshan only if the live transport and your walking pace work. Otherwise stay in Chengdu for markets, food, culture, or rest.',
          'If spice, food allergies, or dietary restrictions matter, carry clear Chinese text and ask about ingredients and cross-contact rather than relying on appearance.',
        ],
      },
      {
        title: 'Days 11–14: Shanghai and departure',
        items: [
          'Compare a flight with a longer train from Chengdu to Shanghai using total door-to-door time. Either option consumes a meaningful part of Day 11.',
          'Use Day 12 for older streets or the Yu Garden area, the Bund, and the Pudong skyline, keeping nearby stops together.',
          'Use Day 13 for neighborhoods, architecture, a museum, food, or one focused day trip. Do not cross the city repeatedly for unrelated attractions.',
          'Keep Day 14 flexible for a missed highlight, shopping, weather changes, or an unhurried airport transfer.',
          'Shanghai has two major airports and several railway stations. Confirm the full name and terminal before leaving the hotel.',
        ],
      },
      {
        title: 'Nature alternative: replace Chengdu with Guilin and Yangshuo',
        items: [
          'Use Day 8 to reach Guilin or Yangshuo, but price the exact Xi\'an connection before committing because the best route may involve a flight or a long rail journey.',
          'Use Day 9 for the Li River or another major karst-landscape experience, subject to the current operator, weather, water, and ticket conditions.',
          'Use Day 10 for Yangshuo countryside at a pace that matches heat, rain, cycling ability, and road confidence.',
          'Travel toward Shanghai on Day 11. If the connection is poor, reduce the final Shanghai plan rather than scheduling an impossible transfer day.',
          'This swap is best for scenery and photography; Chengdu is better for pandas, Sichuan food, and an easier urban recovery block.',
        ],
      },
      {
        title: 'Intercity transport plan',
        table: {
          headers: ['Leg', 'Default choice', 'What to verify'],
          rows: [
            ['Beijing → Xi\'an', 'High-speed train', 'Exact stations, live duration, seat class, passport details, and hotel transfer'],
            ['Xi\'an → Chengdu', 'High-speed train or flight', 'Door-to-door time, schedule, baggage, and arrival hour'],
            ['Chengdu → Shanghai', 'Flight or longer train', 'Total travel day, airport or station transfer, and disruption buffer'],
            ['Shanghai → home', 'International flight', 'Correct airport, terminal, check-in time, and visa or transit implications'],
          ],
        },
        items: [
          'Use the official Railway 12306 English service to check the exact live rail schedule, fare, accepted identity document, change, and refund conditions.',
          'A third-party booking flow may be easier, but compare the final price, service fee, support, ticket-issuance status, and refund rules.',
          'Do not build the itinerary around estimated journey times from an old article. Timetables, fares, and availability are date-specific.',
        ],
      },
      {
        title: 'Book in this order',
        ordered: true,
        items: [
          'Confirm passport validity, visa or visa-free eligibility, route, permitted purpose, entry port, and departure plan.',
          'Compare open-jaw international flights into Beijing and out of Shanghai before fixing domestic transport.',
          'Reserve hotels with clear foreign-guest policies, useful transport, correct room occupancy, and workable cancellation terms.',
          'Book the Palace Museum, Terracotta Warriors, Panda Base, and other capacity-controlled attractions through official or clearly authorized channels.',
          'Book intercity rail or flights when the relevant sales window opens, entering the passport name and number exactly.',
          'Set up mobile data, Alipay, WeChat, AMap, translation, insurance, payment backups, and Chinese hotel addresses before departure.',
        ],
      },
      {
        title: 'Estimated budget for two weeks',
        items: [
          'For planning, allow roughly RMB 6,500–11,000 per person for a budget trip, RMB 13,000–25,000 for mid-range travel, or RMB 28,000–50,000+ for a comfortable trip.',
          'These are ChinaEase planning envelopes, not official averages or quotations. They exclude international flights and assume a broad domestic intercity allowance.',
          'Solo travelers often pay the full hotel-room price, while two people sharing one room may reduce the per-person total.',
          'Public holidays, major events, central hotels, premium tours, private transfers, and late booking can raise the cost substantially.',
          'Replace the broad transport allowance with live 12306 or airline prices, then add insurance, visa costs where applicable, card fees, shopping, and a contingency.',
        ],
      },
      {
        title: 'Adjust the route to your pace',
        items: [
          'For slower travel, remove Chengdu and redistribute the nights across Beijing, Xi\'an, and Shanghai.',
          'For families, older travelers, or limited mobility, plan one major anchor per day and keep hotel locations close to useful transport.',
          'For food-focused travel, keep Chengdu and add food experiences without turning every meal into a distant reservation.',
          'For scenery, replace Chengdu with Guilin and Yangshuo; for mountains, replace it with Zhangjiajie and add weather flexibility.',
          'For a late arrival or early departure, remove an optional day trip before removing the recovery time around long transport legs.',
        ],
      },
      {
        title: 'Common two-week itinerary mistakes',
        items: [
          'Adding five or six major cities because 14 days sounds long, then losing the holiday to packing, stations, airports, and check-in.',
          'Treating arrival, every transfer, and departure as full sightseeing days.',
          'Booking a round trip to one city when an open-jaw ticket could remove a long return journey.',
          'Leaving major attraction and peak-period train reservations until arrival.',
          'Choosing hotels by map distance without checking the metro line, station exit, luggage route, and airport connection.',
          'Depending on one payment method, one map app, or constant access to international services.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is 14 days enough for a first trip to China?',
        answer:
          'Yes. Fourteen days is enough for a balanced four-base trip through Beijing, Xi\'an, Chengdu, and Shanghai, or a slower three-city route. It is not enough to cover every major region comfortably.',
      },
      {
        question: 'What is the best two-week China itinerary?',
        answer:
          'A strong first-trip route is Beijing for imperial history and the Great Wall, Xi\'an for the Terracotta Warriors, Chengdu for pandas and Sichuan culture, then Shanghai for historic neighborhoods and modern China.',
      },
      {
        question: 'Should I choose Chengdu or Guilin?',
        answer:
          'Choose Chengdu for pandas, Sichuan food, teahouse culture, and an urban recovery block. Choose Guilin and Yangshuo for karst landscapes, outdoor experiences, and photography. Replace one with the other instead of adding both.',
      },
      {
        question: 'How many cities should I visit in 14 days?',
        answer:
          'Three cities create a relaxed trip; four bases create a varied but manageable route. Five or more major destinations usually introduce too much transport and too little flexibility for a first visit.',
      },
      {
        question: 'How much does a 14-day China trip cost?',
        answer:
          'A useful planning envelope is RMB 6,500–11,000 for budget travel, RMB 13,000–25,000 for mid-range travel, or RMB 28,000–50,000+ for a comfortable trip, excluding international flights.',
      },
      {
        question: 'Should I use trains or domestic flights?',
        answer:
          'High-speed rail is a natural choice from Beijing to Xi\'an. Compare rail and air for the longer legs using live door-to-door time, station or airport location, baggage, fare, and your preferred pace.',
      },
      {
        question: 'Can ChinaEase Buddy personalize this two-week itinerary?',
        answer:
          'Yes. Share your dates, flights, arrival and departure cities, interests, group size, pace, hotel preferences, and practical concerns to receive a route built around the real trip.',
      },
    ],
    related: [
      { label: 'Compare 7, 10 and 14-day China itineraries', href: '/china-itinerary-first-time-7-10-14-days/' },
      { label: '3-day Xi\'an itinerary', href: '/3-day-xian-itinerary/' },
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China food ordering guide', href: '/china-food-ordering-guide/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'The Palace Museum official international website', href: 'https://intl.dpm.org.cn/index.html' },
      { label: 'Emperor Qinshihuang\'s Mausoleum Site Museum official website', href: 'https://www.bmy.com.cn/' },
      { label: 'Chengdu Research Base of Giant Panda Breeding', href: 'https://www.panda.org.cn/en/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/' },
      { label: 'People\'s Bank of China: payment guide for visitors', href: 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html' },
    ],
  },
  'beijing-vs-shanghai': {
    path: '/beijing-vs-shanghai/',
    title: 'Beijing vs Shanghai: Which City Should You Visit First? (2026)',
    intro:
      'A practical comparison for first-time China visitors choosing between imperial Beijing and fast-moving Shanghai—or deciding how to combine both.',
    metaTitle: 'Beijing or Shanghai: Which Should You Visit? (2026)',
    metaDescription:
      'Choose Beijing for imperial history and the Great Wall, or Shanghai for modern city life and waterfront views. With seven days or more, consider both.',
    quickAnswer:
      'Choose Beijing if your first priority is imperial history, the Palace Museum, the Great Wall, monumental landmarks, and a stronger sense of China\'s political and historical centre. Choose Shanghai if you prefer a more compact urban introduction, waterfront architecture, modern city life, neighbourhood walks, easier short stays, and convenient onward travel through eastern China. For a trip of seven days or more, the strongest answer is often both: enter through Beijing, spend three to four full days there, take a high-speed train to Shanghai, spend two to three full days there, and fly home from Shanghai. Check live flights, rail schedules, attraction reservations, weather, and entry rules before fixing the order.',
    ctaLabel: 'Get my personalised China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    isArticle: true,
    sections: [
      {
        title: 'Beijing vs Shanghai at a glance',
        table: {
          headers: ['Question', 'Beijing', 'Shanghai'],
          rows: [
            ['Best for', 'Imperial history, major monuments, the Great Wall, traditional urban fabric', 'Modern China, waterfront architecture, neighbourhoods, design, food, and day trips'],
            ['Ideal first stay', '3–5 full days', '2–4 full days'],
            ['Sightseeing style', 'Large landmark days with longer transfers and more advance planning', 'Denser urban days that are easier to group by neighbourhood'],
            ['Signature experiences', 'Palace Museum, Temple of Heaven, hutongs, Great Wall', 'The Bund, Pudong skyline, Yuyuan area, former-concession streets'],
            ['Best onward route', 'Xi\'an, northern China, or south to Shanghai', 'Suzhou, Hangzhou, eastern China, or international departure'],
            ['Choose it when', 'History is the main reason for your China trip', 'You want the easiest short urban introduction'],
          ],
        },
        items: [
          'Neither city is objectively better. The right choice depends on what you want to understand, how many full days you have, your international flights, and the next destination.',
          'Count full sightseeing days rather than hotel nights. Arrival, jet lag, airport transfers, and departure can remove much of the first and last day.',
          'If the flight difference is large, let the better international connection influence the route rather than forcing a theoretical “best” city.',
        ],
      },
      {
        title: 'Choose Beijing for history and landmark experiences',
        items: [
          'Beijing is the stronger first choice when the Palace Museum, the Great Wall, the Temple of Heaven, imperial planning, and modern national history are central to the trip.',
          'The city rewards three to five full days because its major sights are large, security and reservation steps take time, and the Great Wall normally needs its own day.',
          'A strong first visit combines one imperial-core day, one Great Wall day, and one flexible day for the Temple of Heaven, Summer Palace, hutongs, museums, or food.',
          'The Palace Museum provides official opening-hour, ticket, service-map, and visitor-trail information. Check the current identity-document and reservation process before the visit.',
          'Beijing can feel more demanding on a very short trip because distances, walking, seasonal weather, and advance bookings shape the day.',
        ],
      },
      {
        title: 'Choose Shanghai for a shorter and more urban first stop',
        items: [
          'Shanghai is the stronger choice when your interests are architecture, modern city life, design, restaurants, shopping, waterfront views, and walkable neighbourhood clusters.',
          'A useful first visit can fit into two or three full days: combine the Bund and older central areas, spend another day in neighbourhoods and museums, then add a focused day trip only if time allows.',
          'The Shanghai municipal tourism pages identify the Bund as a protected historic waterfront and list Yuyuan Garden, Wukang Road, museums, parks, and other city attractions.',
          'Shanghai is not only skyscrapers. Its value comes from the contrast between the Bund, lane neighbourhoods, commercial streets, traditional gardens, and Pudong.',
          'It is often the easier final city because a flexible urban day can sit before an international departure without committing to a distant excursion.',
        ],
      },
      {
        title: 'Which city matches your travel style?',
        table: {
          headers: ['Traveler priority', 'Better starting point', 'Why'],
          rows: [
            ['Chinese history and famous monuments', 'Beijing', 'More imperial and national landmarks, plus access to the Great Wall'],
            ['Architecture, cafés, design, and city walks', 'Shanghai', 'Denser neighbourhood variety and strong historic-modern contrast'],
            ['Only 2–3 full days in China', 'Shanghai', 'A coherent first visit can be built with fewer long-distance attraction days'],
            ['First trip of 4–5 full days', 'Beijing', 'Enough time for the historic core, Great Wall, and one flexible day'],
            ['Travel with limited walking capacity', 'Depends', 'Shanghai can be easier to cluster, but hotel location and daily transport matter more than the city name'],
            ['Continue to Xi\'an', 'Beijing', 'The route fits a classic north-to-central itinerary'],
            ['Continue to Suzhou or Hangzhou', 'Shanghai', 'Both are natural additions to an eastern China route'],
          ],
        },
        items: [
          'Food is not a clean tie-breaker: both cities have deep local traditions and broad restaurant choice. Pick the city for the overall route, then plan food deliberately.',
          'Families, older travellers, and anyone sensitive to heat, cold, or long walking days should compare season and hotel location before deciding.',
        ],
      },
      {
        title: 'How many days do you need?',
        table: {
          headers: ['Time available', 'Recommended choice', 'Realistic plan'],
          rows: [
            ['2–3 full days', 'Choose one city', 'Shanghai for a compact urban trip; Beijing only if you prioritise two or three major sights'],
            ['4–5 full days', 'One city in depth', 'Beijing for a classic first visit, or Shanghai plus one nearby day trip'],
            ['6–7 full days', 'Both cities', '3–4 full days in Beijing, train day, then 2–3 full days in Shanghai'],
            ['8–10 full days', 'Both plus Xi\'an or a nearby region', 'Use an open-jaw route and avoid returning to the arrival city'],
            ['14 days', 'Both within a wider route', 'Add Xi\'an and one of Chengdu or Guilin without exceeding four bases'],
          ],
        },
        items: [
          'Do not count a late arrival as a full day or schedule a major timed attraction immediately after a long-haul flight.',
          'For seven days, flying into Beijing and home from Shanghai usually protects more sightseeing time than a round trip through one city.',
          'For ten or fourteen days, use the existing ChinaEase itinerary guides to decide whether Xi\'an, Chengdu, or Guilin deserves the additional nights.',
        ],
      },
      {
        title: 'Getting between Beijing and Shanghai',
        items: [
          'High-speed rail is usually the simplest city-to-city comparison because central-station access can reduce airport-transfer time, but the correct answer depends on the live departure, station, fare, and hotel locations.',
          'Use the official Railway 12306 English service to check the exact train, complete station name, journey time, fare, accepted identity document, availability, change, and refund rules.',
          'Both cities have multiple airports and railway stations. Never write only “Beijing station” or “Shanghai airport” in the plan; save the complete English and Chinese name plus terminal.',
          'A flight may make sense when it connects directly with another domestic leg or offers a much better schedule, but compare total door-to-door time rather than time in the air.',
          'Treat the transfer as a travel block. Even a fast train requires hotel checkout, station arrival, security, boarding, arrival, and another hotel transfer.',
        ],
      },
      {
        title: 'Weather, pace, and seasonal trade-offs',
        items: [
          'Beijing generally has a more continental feel, with colder winters, hotter summers, and drier conditions; Shanghai is typically more humid and has a different rain and heat pattern.',
          'Do not choose by average temperature alone. Check the short-range forecast, air conditions, rain, wind, attraction closures, and outdoor walking load immediately before travel.',
          'Public holidays and major events can change hotel prices, rail availability, attraction capacity, and crowd levels in both cities.',
          'In difficult weather, Beijing needs an alternative to the Great Wall day, while Shanghai needs a strong indoor plan for neighbourhood walks and skyline views.',
        ],
      },
      {
        title: 'Budget differences that actually matter',
        items: [
          'Both cities can support budget, mid-range, and comfortable trips; hotel location and standard usually matter more than a simple city-wide price label.',
          'Beijing can create extra transport or tour costs for a Great Wall day. Shanghai can create higher spending through central hotels, restaurants, nightlife, shopping, and paid skyline experiences.',
          'Compare real hotel quotes for your dates near a useful metro line, then add attraction tickets, local transport, food, airport or station transfers, and one contingency allowance.',
          'Do not assume the cheapest room is the cheapest trip. A remote hotel can add daily transfer time and ride-hailing costs.',
          'Use the China travel budget guide for broad planning, but replace every estimate with live prices before booking.',
        ],
      },
      {
        title: 'Best first-trip route using both cities',
        ordered: true,
        items: [
          'Fly into Beijing and keep the arrival day light for immigration, hotel registration, data, payments, and recovery.',
          'Spend three or four full days on the imperial core, the Great Wall, and one flexible Beijing day.',
          'Take a daytime high-speed train to Shanghai, using the exact station and passport details shown in the booking.',
          'Spend two or three full days on the Bund and central historic areas, neighbourhoods, museums, food, or one carefully chosen day trip.',
          'Fly home from Shanghai, or reverse the route when international flights, weather, reservations, or the wider itinerary clearly favour it.',
        ],
      },
      {
        title: 'Common Beijing vs Shanghai planning mistakes',
        items: [
          'Choosing only from social-media aesthetics instead of matching the city to the trip length and onward route.',
          'Trying to visit both cities in three or four days and losing most of the trip to transfers and check-in.',
          'Adding a distant Great Wall trip or regional day trip without protecting enough time for the city itself.',
          'Booking international round-trip flights before comparing an open-jaw arrival and departure.',
          'Assuming every major attraction accepts a spontaneous walk-in visit with no identity or reservation requirement.',
          'Ignoring the complete airport, railway-station, terminal, and hotel address until travel day.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Beijing or Shanghai better for a first trip to China?',
        answer:
          'Beijing is better for imperial history, major monuments, and the Great Wall. Shanghai is better for a shorter urban introduction, architecture, neighbourhoods, restaurants, and modern city life. Choose according to your main interest and onward route.',
      },
      {
        question: 'Is Beijing or Shanghai easier for tourists?',
        answer:
          'Shanghai can be easier to structure into compact neighbourhood days, while Beijing requires more time for large sights and the Great Wall. In both cities, a well-located hotel, mobile data, payment setup, maps, and saved Chinese addresses matter more than the city label.',
      },
      {
        question: 'Which city needs more days, Beijing or Shanghai?',
        answer:
          'Beijing usually needs more time. Allow three to five full days for a first visit, compared with two to four full days for Shanghai, depending on day trips and travel pace.',
      },
      {
        question: 'Can I visit Beijing and Shanghai in one week?',
        answer:
          'Yes. A realistic plan is three to four full days in Beijing, one rail travel block, and two to three full days in Shanghai. Use open-jaw flights if the price and schedule work.',
      },
      {
        question: 'Should I fly or take the train between Beijing and Shanghai?',
        answer:
          'High-speed rail is often the simplest city-centre-to-city-centre option, but compare live 12306 schedules, complete station locations, fares, flight times, airport transfers, and your hotel locations before deciding.',
      },
      {
        question: 'Which city is better for families or older travelers?',
        answer:
          'Either can work. Shanghai may be easier to cluster into shorter urban days, while Beijing offers more iconic historic sights. The best choice depends on mobility, weather, hotel location, transport, and whether a Great Wall day is essential.',
      },
      {
        question: 'Can ChinaEase Buddy choose the right city for my route?',
        answer:
          'Yes. Share your dates, flights, trip length, interests, group size, pace, budget, mobility needs, and next destination to receive a route built around the real trip.',
      },
    ],
    related: [
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'The Palace Museum official international website', href: 'https://intl.dpm.org.cn/index.html' },
      { label: 'Badaling Great Wall official website', href: 'https://www.badaling.cn/website/pc/index.html' },
      { label: 'Shanghai Municipal Government: scenic spots', href: 'https://english.shanghai.gov.cn/en-ScenicSpots/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
    ],
  },
  '3-day-beijing-itinerary': {
    path: '/3-day-beijing-itinerary/',
    title: beijingGuide.heading,
    intro: '',
    metaTitle: beijingGuide.metaTitle,
    metaDescription: beijingGuide.metaDescription,
    quickAnswer: quickAnswerText(beijingGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA.
    ctaLabel: 'Get my personalised Beijing itinerary',
    ctaHref: '/#trip-plan',
    reviewed: beijingGuide.reviewed,
    lastModified: beijingGuide.modified,
    isArticle: true,
    sections: [],
    faqs: beijingGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised Beijing itinerary', href: '/#trip-plan' },
    ],
    sources: beijingGuide.sources,
  },
  '3-day-shanghai-itinerary': {
    path: '/3-day-shanghai-itinerary/',
    title: '3-Day Shanghai Itinerary for First-Time Visitors (2026)',
    intro:
      'A practical first Shanghai plan combining the Bund, Yuyuan Garden, historic neighbourhoods, Pudong, museums, food, transport, and weather alternatives.',
    metaTitle: '3-Day Shanghai Itinerary for First-Time Visitors (2026)',
    metaDescription:
      'Plan three days in Shanghai with the Bund, Yuyuan Garden, Wukang Road, Pudong, museums, hotel areas, transport, food, costs, and alternatives.',
    quickAnswer: shanghaiVisitPlanning.quickAnswer,
    ctaLabel: 'Get my personalised Shanghai itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 21, 2026',
    lastModified: shanghaiVisitPlanning.modified,
    isArticle: true,
    sections: [
      {
        title: 'Three days in Shanghai at a glance',
        table: {
          headers: ['Day', 'Main plan', 'Why this grouping works'],
          rows: [
            ['Day 1', 'Yuyuan Garden area, old-city streets, the Bund, Nanjing Road', 'Links traditional and historic waterfront sights without repeated cross-city travel'],
            ['Day 2', 'Wukang Road, former French Concession neighbourhoods, Xintiandi or a museum', 'Creates a walkable day focused on architecture, local streets, cafés, and culture'],
            ['Day 3', 'Pudong skyline, riverfront, observation deck or museum, flexible evening', 'Groups the east-bank landmarks and leaves room for weather or a special interest'],
          ],
        },
        items: [
          'This itinerary assumes three complete sightseeing days after arrival and before departure.',
          'The order can be reversed. Put the Bund and any observation deck on the clearest day, then use museums and covered attractions during heavy rain or extreme heat.',
          'Do not add Suzhou, Hangzhou, Zhujiajiao, Shanghai Disney, and every central landmark to the same three-day visit. Each addition replaces a city day rather than fitting around it.',
        ],
      },
      ...shanghaiVisitPlanning.sections,
      {
        title: 'Day 1: Yuyuan Garden, old Shanghai, and the Bund',
        ordered: true,
        items: [
          shanghaiVisitPlanning.gardenNote,
          'Allow time to distinguish the historic garden from the surrounding commercial streets; trying to photograph every lane can consume the whole morning.',
          'Continue toward the Bund and walk a focused section of the waterfront. The Shanghai municipal government describes it as a 1.5-kilometre protected historical district.',
          'Cross to or view Pudong when visibility is good, but save the deeper Pudong visit for Day 3 instead of repeatedly crossing the river.',
          'Finish with Nanjing Road or an evening Bund view according to energy and crowd levels. Keep the hotel address and nearest metro exit saved in Chinese.',
        ],
      },
      {
        title: 'Day 2: Wukang Road and central neighbourhoods',
        ordered: true,
        items: [
          'Start around Wukang Road and the surrounding historic streets. The municipal visitor pages highlight its varied architecture, residences, and lane houses.',
          'Walk in one direction instead of jumping between social-media photo locations. Choose a small number of streets, a café or lunch stop, and one cultural attraction.',
          'Continue toward Xintiandi, the Former Residence or First CPC National Congress area, People\'s Square, or a museum based on your interests and live opening schedule.',
          'For art and design, replace part of the neighbourhood walk with one museum or gallery rather than adding it after a full walking day.',
          'Use the evening for a local meal, a performance, or a relaxed neighbourhood walk; leave enough time for the return metro or a verified ride-hailing pickup.',
        ],
      },
      {
        title: 'Day 3: Pudong and a flexible final day',
        items: [
          'Visit Lujiazui and the Pudong riverfront for the contrast with the Bund. Choose one observation deck only if visibility and the live price justify it.',
          'The Oriental Pearl Tower is listed by Shanghai\'s municipal visitor pages as a combined sightseeing, dining, shopping, exhibition, and entertainment complex.',
          shanghaiVisitPlanning.museumNote,
          'If modern Shanghai is not your priority, replace Pudong with the Shanghai Museum, an art district, a food-focused day, or a slower neighbourhood route.',
          'Keep the final evening near the hotel when departing early the next morning, and verify the complete airport or railway-station name and terminal before bed.',
        ],
      },
      {
        title: 'Book and check these before the trip',
        table: {
          headers: ['Item', 'What to confirm', 'When to act'],
          rows: [
            ['Yuyuan Garden or major museum', 'Live opening day, ticket or reservation, passport requirement, entry gate', 'Before fixing that day around a timed entry'],
            ['Observation deck or performance', 'Visibility, operating hours, ticket conditions, last admission', 'Book only after checking the actual plan and weather'],
            ['Hotel', 'Foreign-passport check-in, Chinese address, nearest useful metro station', 'Before paying a non-refundable rate'],
            ['Airport transfer', 'Pudong or Hongqiao airport, terminal, arrival time, metro and taxi options', 'Before arrival day'],
            ['Onward train', 'Shanghai Hongqiao, Shanghai, or another complete station name; passport and change rules', 'Check through the official Railway 12306 service'],
          ],
        },
        items: [
          'Shanghai has multiple railway stations and two major airports. Never save only “Shanghai station” or “Shanghai airport.”',
          'Opening hours, reservation systems, temporary exhibitions, event controls, ferry services, and observation-deck operations can change. Recheck official notices immediately before visiting.',
        ],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: [
          'People\'s Square and central Huangpu work well for first-time visitors who want convenient access to the Bund, metro lines, museums, and shopping.',
          'Jing\'an can suit travellers who prioritise restaurants, nightlife, and easy central transport while accepting a short ride to the Bund.',
          'Areas around the former French Concession suit neighbourhood walking and cafés, but the exact metro distance matters more than the district label.',
          'Lujiazui offers skyline views and modern hotels but is not automatically the most efficient base for a trip focused on historic central neighbourhoods.',
          'Confirm foreign-passport check-in, late-arrival arrangements, deposit method, breakfast time, and the hotel name and address in Chinese.',
        ],
      },
      {
        title: 'Transport, airports, and daily pace',
        items: [
          'Shanghai\'s municipal transportation guide identifies metro, bus, taxi, ferry, rail, and airport connections as the main travel options. Use the metro for predictable journeys and verified rides for awkward transfers.',
          'Allow time for station security, large interchanges, long corridors, the correct exit, and walking from the exit to the actual entrance.',
          'Pudong International Airport and Hongqiao Airport serve different routes and sit in very different parts of the city. Check the complete airport and terminal before planning transfer time.',
          'For the Bund, old city, and dense neighbourhoods, walking time can exceed the map estimate because of crowds, crossings, photographs, and heat or rain.',
          'Save Chinese destination names and screenshots for the hotel, station, airport, and each fixed booking. Mobile data and a payment backup should be ready before the first full day.',
        ],
      },
      {
        title: 'Adjust the itinerary for your trip',
        table: {
          headers: ['Situation', 'Best adjustment'],
          rows: [
            ['Only two full days', 'Keep Day 1 and Day 2; add only the Pudong view that fits naturally'],
            ['Four full days', 'Add Pudong in depth, one museum day, or one carefully selected nearby excursion'],
            ['Heavy rain or extreme heat', 'Move a museum or indoor attraction forward and shorten exposed waterfront walking'],
            ['Travelling with children', 'Reduce long neighbourhood walks and choose one clear family priority'],
            ['Limited mobility', 'Use shorter clusters, verify step-free access, and budget for more point-to-point transport'],
            ['Want Suzhou or Hangzhou', 'Add at least one extra day rather than squeezing a long excursion into the three city days'],
          ],
        },
        items: [
          'Shanghai Disney normally needs its own full day and advance planning. Treat it as a replacement for a city day or add another night.',
          'If Shanghai is part of a Beijing–Xi\'an–Shanghai route, connect this page with the 7-day, 10-day, or 14-day itinerary rather than planning every city independently.',
        ],
      },
    ],
    faqs: [
      ...shanghaiVisitPlanning.faqs,
      {
        question: 'Are three days enough for Shanghai?',
        answer:
          'Yes. Three full days are enough for the Bund and old city, central historic neighbourhoods, and Pudong or a major museum. Three hotel nights with a late arrival and early departure are not the same as three full sightseeing days.',
      },
      {
        question: 'What should I not miss on a first Shanghai trip?',
        answer:
          'Prioritise the Bund, one old-city or traditional sight such as Yuyuan Garden, one historic neighbourhood walk, and the Pudong skyline contrast. Add museums, food, shopping, or nightlife according to your interests.',
      },
      {
        question: 'Should I stay near the Bund or in the former French Concession?',
        answer:
          'Stay near the Bund or People\'s Square for classic sights and central connections; choose the former French Concession area for neighbourhood walks and cafés. The exact hotel-to-metro distance and passport check-in matter more than the label.',
      },
      {
        question: 'Can I visit Suzhou or Hangzhou during a three-day Shanghai trip?',
        answer:
          'You can, but it replaces a Shanghai day. For a first visit, add a fourth day if Suzhou or Hangzhou is important rather than compressing the Bund, neighbourhoods, Pudong, and a regional excursion.',
      },
      {
        question: 'Which Shanghai airport is closer to the city?',
        answer:
          'Hongqiao is generally closer to central Shanghai, while Pudong handles many international flights. Always plan from the actual airport, terminal, arrival time, hotel, and live transport options.',
      },
      {
        question: 'How should I get around Shanghai?',
        answer:
          'Use the metro for predictable cross-city journeys, walk within compact neighbourhood clusters, and use licensed taxis or app-based rides for awkward connections. Save Chinese addresses and verify the vehicle before entering.',
      },
      {
        question: 'Can ChinaEase Buddy personalise this Shanghai itinerary?',
        answer:
          'Yes. Share your dates, flights or trains, hotel, group, interests, walking ability, budget, and fixed bookings to receive a route adapted to the real trip.',
      },
    ],
    related: [
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised Shanghai itinerary', href: '/#trip-plan' },
    ],
    sources: [
      ...shanghaiVisitPlanning.sources,
      { label: 'Shanghai Municipal Government: scenic spots', href: 'https://english.shanghai.gov.cn/en-ScenicSpots/' },
      { label: 'Shanghai Municipal Government: transportation', href: 'https://english.shanghai.gov.cn/en-Transportation/' },
      { label: 'Shanghai Municipal Government: museums and galleries', href: 'https://english.shanghai.gov.cn/en-MuseumsGalleries/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
    ],
  },
  '3-day-xian-itinerary': {
    path: '/3-day-xian-itinerary/',
    title: '3-Day Xi\'an Itinerary for First-Time Visitors (2026)',
    intro:
      'A realistic first Xi\'an plan covering the Terracotta Army, city wall, Muslim Quarter, Shaanxi History Museum, pagodas, transport, bookings, and food.',
    metaTitle: '3-Day Xi\'an Itinerary for First-Time Visitors (2026)',
    metaDescription:
      'Plan three days in Xi\'an with the Terracotta Army, city wall, Muslim Quarter, Shaanxi History Museum, pagodas, hotels, transport, and alternatives.',
    quickAnswer:
      'With three full days in Xi\'an, keep the Terracotta Army as a separate day, use one day for the city wall and historic centre, and reserve the third for the Shaanxi History Museum plus the Big Wild Goose Pagoda area or another focused interest. The official Terracotta Army museum states that foreign visitors can make real-name reservations through its website or official WeChat channel, and that the Terracotta Warriors Museum and Lishan Garden each need substantial time. Book the hardest museum first, use the same passport details throughout, and do not treat arrival or departure as a full sightseeing day.',
    ctaLabel: 'Get my personalised Xi\'an itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    isArticle: true,
    sections: [
      {
        title: 'Three days in Xi\'an at a glance',
        table: {
          headers: ['Day', 'Main plan', 'Why this grouping works'],
          rows: [
            ['Day 1', 'City wall, Bell and Drum Tower area, Great Mosque and Muslim Quarter', 'Keeps the historic centre together and leaves room for food and evening atmosphere'],
            ['Day 2', 'Terracotta Army and optional Lishan Garden', 'Protects a full day for the out-of-centre transfer, real-name entry, and museum visit'],
            ['Day 3', 'Shaanxi History Museum, Big Wild Goose Pagoda area, flexible evening', 'Connects the region\'s history with Tang-era Xi\'an and allows an indoor alternative'],
          ],
        },
        items: [
          'This itinerary assumes three complete sightseeing days after arrival and before departure.',
          'Book the hardest reservation first, then organise the other two days around its date and time.',
          'Do not combine the Terracotta Army, city wall, Shaanxi History Museum, and a Tang show into one rushed day.',
        ],
      },
      {
        title: 'Day 1: City wall and historic centre',
        ordered: true,
        items: [
          'Start at a city-wall gate that fits the rest of the route, after checking live opening, ticket, bicycle, weather, and gate-access information.',
          'Walk or cycle only the distance suitable for your fitness and weather. The full wall is much longer than a short photo stop and has limited shade in some conditions.',
          'Continue to the Bell and Drum Tower area, then visit the Great Mosque and surrounding lanes with respectful clothing and behaviour.',
          'Treat the Muslim Quarter as a broad neighbourhood experience rather than one famous main street. Compare stalls, watch hygiene, and order smaller portions to try more dishes.',
          'Keep the evening flexible for a night view, food, or an early finish before the Terracotta Army day.',
        ],
      },
      {
        title: 'Day 2: Terracotta Army day trip',
        items: [
          'Use the official Emperor Qinshihuang\'s Mausoleum Site Museum channel for the current real-name reservation and entry rules. Match the booking exactly to the passport carried on the day.',
          'Allow enough time for the transfer to Lintong, security, entry, the three main pits, exhibitions, crowds, and the return to central Xi\'an.',
          'The official museum explains that the Terracotta Warriors Museum and Lishan Garden are separate parts of the site and each requires about 1.5 hours; a shuttle links them.',
          'Decide in advance whether Lishan Garden is essential. Adding it creates a longer day and should not be treated as a quick extra.',
          'Avoid unverified “official” guides or transport offers near stations and entrances. Confirm the vehicle, pickup point, inclusions, and return arrangement before leaving.',
        ],
      },
      {
        title: 'Day 3: Shaanxi History Museum and Tang Xi\'an',
        ordered: true,
        items: [
          'Visit the Shaanxi History Museum only with a confirmed reservation for the correct venue. Its official site publishes live opening times, notices, transport, ticket information, and exhibitions.',
          'Allow several hours for the collection rather than rushing through every gallery. If tickets are unavailable, use Xi\'an Museum, the Stele Forest Museum, or another verified museum as the backup.',
          'Continue to the Big Wild Goose Pagoda and surrounding public spaces, choosing the actual pagoda visit, a neighbourhood walk, or evening atmosphere according to time and energy.',
          'Add one evening show only after checking the venue, seat, language support, start time, duration, and return transport.',
        ],
      },
      {
        title: 'Book and check these before the trip',
        table: {
          headers: ['Item', 'What to confirm', 'When to act'],
          rows: [
            ['Terracotta Army', 'Official real-name ticket, passport details, entry time, Lishan Garden plan, transport', 'As soon as the official booking window allows'],
            ['Shaanxi History Museum', 'Correct venue, official reservation, opening date, passport entry, exhibition access', 'Before fixing Day 3'],
            ['City wall', 'Open gates, bicycle operation, weather restrictions, last entry', 'Recheck the day before'],
            ['Hotel', 'Foreign-passport check-in, Chinese address, metro access, late arrival', 'Before paying a non-refundable rate'],
            ['Onward train', 'Xi\'an North or Xi\'an station, passport name, departure time, change rules', 'Check through the official Railway 12306 service'],
          ],
        },
        items: [
          'Use the exact passport spelling and document number across tickets, trains, and hotel bookings.',
          'Museum opening hours, reservation releases, free-ticket rules, exhibitions, and temporary closures can change. Recheck official sources immediately before the visit.',
        ],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: [
          'Inside or near the city wall works well for first-time visitors who prioritise the historic centre, food, evening walks, and metro access.',
          'The Bell Tower area is central, but check the exact room location, noise, road crossings, and distance to a useful metro entrance.',
          'The Big Wild Goose Pagoda area can suit travellers prioritising museums, modern public spaces, and a calmer evening base.',
          'Staying near Xi\'an North station only saves time for a specific early train; it is not automatically the best base for central sightseeing.',
          'Confirm foreign-passport check-in, deposit method, breakfast time, and the hotel name and address in Chinese.',
        ],
      },
      {
        title: 'Transport and daily pace',
        items: [
          'Use the metro for central-city journeys and verified taxis or ride-hailing for awkward connections. Save the destination in Chinese and verify the licence plate.',
          'The Terracotta Army sits outside central Xi\'an, so compare official public transport with a clearly documented private transfer by total time and reliability.',
          'Xi\'an North and Xi\'an railway stations are different. Save the complete station name shown on the ticket and allow time for security and passport checks.',
          'Walking surfaces, stairs, heat, cold, rain, and crowds can change the pace. Build one flexible block into every day.',
        ],
      },
      {
        title: 'Adjust the itinerary for your trip',
        table: {
          headers: ['Situation', 'Best adjustment'],
          rows: [
            ['Only two full days', 'Keep the Terracotta Army and combine a focused city-wall visit with one central neighbourhood'],
            ['Four full days', 'Add a deeper museum day, Hanyangling, the Stele Forest, or a slower food and neighbourhood day'],
            ['Museum tickets unavailable', 'Use Xi\'an Museum or another official museum and keep the Big Wild Goose Pagoda area'],
            ['Extreme heat or poor air/weather', 'Shorten exposed wall time and move an indoor museum earlier'],
            ['Travelling with children', 'Reduce museum duration, protect meal breaks, and avoid stacking a late show after the Terracotta Army'],
            ['Limited mobility', 'Use shorter wall sections, verify accessibility, and budget for more point-to-point transport'],
          ],
        },
        items: [
          'If Xi\'an is part of a Beijing–Xi\'an–Shanghai trip, connect this plan with the 7-day, 10-day, or 14-day itinerary and protect the rail transfer blocks.',
          'A day trip to Mount Hua is not a casual addition to these three days; add another day and plan around weather, transport, tickets, and physical ability.',
        ],
      },
    ],
    faqs: [
      { question: 'Are three days enough for Xi\'an?', answer: 'Yes. Three full days are enough for one historic-centre day, one Terracotta Army day, and one museum plus pagoda day. A late arrival and early departure should not be counted as two of those days.' },
      { question: 'How much time do I need at the Terracotta Army?', answer: 'Protect most of a day including the transfer from central Xi\'an. The official museum says the Terracotta Warriors Museum and Lishan Garden each need about 1.5 hours, before transport, security, queues, and breaks.' },
      { question: 'Do foreigners need to book the Terracotta Army in advance?', answer: 'Use the live official real-name reservation process and carry the passport used for booking. The museum states that foreign visitors can reserve through its official website or WeChat channel.' },
      { question: 'Is the Shaanxi History Museum worth visiting?', answer: 'Yes for travellers who want context for Zhou, Qin, Han, and Tang history. It can be difficult to reserve, so confirm the correct venue and keep another official museum as a backup.' },
      { question: 'Where should a first-time visitor stay in Xi\'an?', answer: 'Near the city wall or a useful central metro station is usually the simplest choice. The Bell Tower area is convenient, while the Big Wild Goose Pagoda area suits museum and evening-space priorities.' },
      { question: 'Which railway station should I use in Xi\'an?', answer: 'Use the exact station printed on the ticket. Xi\'an North handles many high-speed trains and is separate from Xi\'an station, so compare hotel transfer time before booking.' },
      { question: 'Can ChinaEase Buddy personalise this Xi\'an itinerary?', answer: 'Yes. Share your dates, trains or flights, hotel, group, interests, walking ability, budget, and fixed bookings to receive a route adapted to the actual trip.' },
    ],
    related: [
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised Xi\'an itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'Emperor Qinshihuang\'s Mausoleum Site Museum official website', href: 'https://www.bmy.com.cn/index.html' },
      { label: 'Shaanxi History Museum official website', href: 'https://www.sxhm.com/index.html' },
      { label: 'Xi\'an City Wall official website', href: 'https://www.xacitywall.com/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
    ],
  },
  '3-day-chongqing-itinerary': {
    path: '/3-day-chongqing-itinerary/',
    title: '3-Day Chongqing Itinerary for First-Time Visitors (2026)',
    intro:
      'A realistic first Chongqing plan covering Jiefangbei, Hongya Cave, Liziba monorail, the Three Gorges Museum, hotpot, rivers, steep terrain, and transport.',
    metaTitle: '3-Day Chongqing Itinerary for First-Time Visitors (2026)',
    metaDescription:
      'Plan three days in Chongqing with Hongya Cave, Liziba monorail, Three Gorges Museum, hotpot, river views, hotels, transport, hills, and alternatives.',
    quickAnswer:
      chongqingVisitPlanning.quickAnswer,
    ctaLabel: 'Get my personalised Chongqing itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 22, 2026',
    lastModified: chongqingVisitPlanning.modified,
    isArticle: true,
    sections: [
      {
        title: 'Three days in Chongqing at a glance',
        table: {
          headers: ['Day', 'Main plan', 'Why this grouping works'],
          rows: [
            ['Day 1', 'Jiefangbei, central lanes, Chaotianmen area, Hongya Cave at night', 'Keeps the core peninsula together and saves the illuminated skyline for evening'],
            ['Day 2', 'Liziba monorail, Three Gorges Museum, People\'s Great Hall area, hotpot', 'Links an outdoor city icon with a substantial indoor history stop'],
            ['Day 3', 'Ciqikou and a slower neighbourhood day, or a pre-planned Dazu day trip', 'Lets you choose local atmosphere or one major heritage excursion without overloading the first two days'],
          ],
        },
        items: [
          'This plan assumes three complete sightseeing days after arrival and before departure.',
          'Do not judge transfers by straight-line distance alone: hills, stairs, bridges, lifts, and multi-level roads change the real journey.',
          'Keep one flexible block each day for weather, crowds, queues, and locating the correct building entrance.',
        ],
      },
      ...chongqingVisitPlanning.sections,
      {
        title: 'Day 1: Jiefangbei, rivers, and Hongya Cave',
        ordered: true,
        items: [
          'Start around Jiefangbei and explore a small number of nearby streets instead of collecting distant photo stops.',
          'Continue toward the Chaotianmen and river-confluence area, checking current access because construction, viewpoints, and walking routes can change.',
          'Take a meal break before the evening crowds. For hotpot, choose the spice level deliberately and confirm whether the broth, condiments, and dishes are priced separately.',
          'Visit Hongya Cave around dusk or after dark for the illuminated exterior. The famous viewpoint and the internal commercial complex are different experiences, so decide which matters most.',
          'Before leaving, save a specific ride-hailing pickup point or metro entrance. A driver on another road level may be physically close but difficult to reach.',
        ],
      },
      {
        title: 'Day 2: Liziba and Chongqing history',
        ordered: true,
        items: [
          chongqingVisitPlanning.lizibaNote,
          chongqingVisitPlanning.museumNote,
          'Pair the museum with the People\'s Great Hall exterior and nearby public space, allowing time for security, galleries, and breaks.',
          'Use the evening for one neighbourhood, a river view, or hotpot. Do not stack Liziba, every museum gallery, a cableway queue, a cruise, and Hongya Cave into the same day.',
        ],
      },
      {
        title: 'Day 3: choose one clear priority',
        items: [
          'For a slower city day, visit Ciqikou early, leave the busiest main lane when possible, and keep the afternoon flexible for a café, riverside walk, or another neighbourhood.',
          'For art and history, use the day for the UNESCO-listed Dazu Rock Carvings only after confirming current tickets, transport, opening information, and the exact site you will visit.',
          'Wulong is another major excursion, but long transfers make it a demanding addition to a short first visit. Treat it as a dedicated day with verified transport rather than a quick side trip.',
          'If rain, heat, or low visibility changes the plan, prioritise the museum and food experiences and move exposed viewpoints to the clearest period.',
        ],
      },
      {
        title: 'Plan around Chongqing\'s vertical terrain',
        table: {
          headers: ['Situation', 'What can go wrong', 'Practical fix'],
          rows: [
            ['Map says the stop is close', 'The route may include steep stairs or several road levels', 'Check the walking profile and allow extra time'],
            ['Ride-hailing pickup', 'Driver and passenger can wait on different levels', 'Choose a named gate, hotel entrance, or landmark'],
            ['Large building or mall', 'Street level on one side may be a high floor on another', 'Save the floor, entrance, and Chinese place name'],
            ['Night attraction', 'Crowds make crossings and pickups slower', 'Arrive before peak darkness and leave from a planned point'],
            ['Limited mobility', 'Stairs and slopes can make short routes difficult', 'Use more point-to-point rides and verify lift access'],
          ],
        },
        items: [
          'Wear shoes with grip and carry only what you need. Wet steps and long descents can be tiring even when the total distance looks modest.',
          'Download an offline copy of the hotel name, address, and phone number in Chinese.',
        ],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: [
          'Jiefangbei is convenient for a first visit focused on Hongya Cave, central food, and evening walks, but check noise and the exact walking route to the metro.',
          'Near a useful metro interchange can be more practical than staying beside one famous sight. Compare the entrance, elevation, and last part of the walk.',
          'Nan\'an can suit travellers prioritising skyline views, but river crossings add time to central sightseeing.',
          'Confirm foreign-passport check-in, late-arrival arrangements, deposit method, and the hotel\'s Chinese address before paying a non-refundable rate.',
        ],
      },
      {
        title: 'Bookings and transport to check',
        table: {
          headers: ['Item', 'What to confirm', 'When to check'],
          rows: [
            chongqingVisitPlanning.bookingRow,
            ['Dazu excursion', 'Official opening information, selected carving site, tickets, return transport', 'Before choosing Day 3'],
            ['Train', 'Chongqing North, West, Shapingba, or another exact station', 'Before booking hotel transfers'],
            ['Airport transfer', 'Terminal, metro operating time, realistic luggage route', 'Before arrival and departure'],
            ['Night activity', 'Weather, queue, final service, return pickup point', 'Recheck on the day'],
          ],
        },
        items: [
          'Use China Railway 12306 or another authorised channel and copy the complete station name from the ticket.',
          'Opening hours, reservations, transport operations, and temporary closures can change. Recheck official sources immediately before the visit.',
        ],
      },
      {
        title: 'Adjust the itinerary for your trip',
        items: [
          'With only two full days, keep the central peninsula and the Liziba–museum day; skip the out-of-city excursion.',
          'With four or five days, add Dazu or Wulong as a dedicated excursion and keep a recovery evening afterward.',
          'For families, shorten long museum blocks and protect regular meal and rest stops.',
          'For limited mobility, reduce hillside wandering, verify accessible entrances, and budget for more direct rides.',
          'If Chongqing is part of a longer China route, protect the transfer day and connect this plan with the 10-day or 14-day itinerary.',
        ],
      },
    ],
    faqs: [
      ...chongqingVisitPlanning.faqs,
      { question: 'Are three days enough for Chongqing?', answer: 'Yes. Three full days cover the central peninsula, Liziba and a museum day, plus either a slower neighbourhood day or one carefully planned excursion. Arrival and departure days should not be counted as full sightseeing days.' },
      { question: 'Is Chongqing difficult to walk around?', answer: 'It can be. Hills, stairs, lifts, bridges, and stacked roads make map distance misleading. Group sights by area and elevation, use the metro and ride-hailing strategically, and allow extra time.' },
      { question: 'When should I visit Hongya Cave?', answer: 'The illuminated exterior is the main reason many visitors go after dark. Arriving around dusk can make orientation easier before peak crowds, but check current lighting, access, weather, and transport on the day.' },
      { question: 'Is Liziba monorail worth visiting?', answer: 'Yes if Chongqing\'s vertical transport and urban design interest you. Combine the designated viewing area with a ride on Line 2 and nearby history stops rather than making it a long standalone visit.' },
      { question: 'Should I choose Dazu or Wulong for Day 3?', answer: 'Choose Dazu for historic rock carvings and Wulong for dramatic natural scenery. Both require a dedicated, pre-planned day; for a slower first visit, stay in the city and use Ciqikou or another neighbourhood instead.' },
      { question: 'Which Chongqing railway station should I use?', answer: 'Use the exact station printed on your ticket. Chongqing has multiple major stations, and transfer times vary substantially, so compare the station with your hotel before booking.' },
      { question: 'Can ChinaEase Buddy personalise this Chongqing itinerary?', answer: 'Yes. Share your dates, arrival station or airport, hotel, group, walking ability, food preferences, budget, and fixed bookings for a route adapted to the actual trip.' },
    ],
    related: [
      { label: '3-day Xi\'an itinerary', href: '/3-day-xian-itinerary/' },
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised Chongqing itinerary', href: '/#trip-plan' },
    ],
    sources: [
      ...chongqingVisitPlanning.sources,
      { label: 'Chongqing Municipal Government English website', href: 'https://english.cq.gov.cn/' },
      { label: 'Chongqing Rail Transit official website', href: 'https://www.cqmetro.cn/' },
      { label: 'Chongqing China Three Gorges Museum official website', href: 'https://www.3gmuseum.cn/' },
      { label: 'UNESCO: Dazu Rock Carvings', href: 'https://whc.unesco.org/en/list/912/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
    ],
  },
  '3-day-chengdu-itinerary': {
    path: '/3-day-chengdu-itinerary/',
    title: '3-Day Chengdu Itinerary for First-Time Visitors (2026)',
    intro: 'A realistic first Chengdu plan covering giant pandas, People\'s Park, teahouses, Sichuan food, historic streets, museums, transport, and day-trip choices.',
    metaTitle: '3-Day Chengdu Itinerary for First-Time Visitors (2026)',
    metaDescription: 'Plan three days in Chengdu with the Panda Base, People\'s Park, Sichuan food, museums, hotels, transport, Leshan, and Sanxingdui alternatives.',
    quickAnswer: 'With three full days in Chengdu, visit the Chengdu Research Base of Giant Panda Breeding early on one morning, use another day for People\'s Park, a teahouse, central neighbourhoods, and Sichuan food, then choose either a deeper city day or one focused excursion such as Leshan or Sanxingdui. The Panda Base requires advance online booking according to its official ticket notice. Do not combine pandas, Leshan, Sanxingdui, and every central attraction into three days; choose one out-of-city priority and leave room for meals, queues, and transport.',
    ctaLabel: 'Get my personalised Chengdu itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 22, 2026',
    lastModified: '2026-09-22',
    isArticle: true,
    sections: [
      {
        title: 'Three days in Chengdu at a glance',
        table: { headers: ['Day', 'Main plan', 'Why this grouping works'], rows: [
          ['Day 1', 'People\'s Park, teahouse, central neighbourhoods, Sichuan dinner', 'Starts slowly and keeps flexible city experiences together'],
          ['Day 2', 'Early Panda Base visit, Giant Panda Museum if booked, relaxed evening', 'Protects the best part of the day for animal activity and the large park'],
          ['Day 3', 'Leshan or Sanxingdui, or a second Chengdu culture-and-food day', 'Gives one clear priority instead of stacking incompatible excursions'],
        ] },
        items: ['This itinerary assumes three complete sightseeing days after arrival and before departure.', 'Book the Panda Base first, then organise the other days around its confirmed entry period.', 'Chengdu rewards slower meals and neighbourhood time, so avoid treating every stop as a short photo visit.'],
      },
      {
        title: 'Day 1: teahouse culture and central Chengdu', ordered: true,
        items: ['Start at People\'s Park and choose a teahouse experience without trying to schedule every park activity.', 'Continue through one or two central areas such as Kuanzhai Alley, Tianfu Square, or a nearby museum, depending on crowds and your interests.', 'Use the afternoon for a neighbourhood walk, café, or rest rather than crossing the city for another checklist sight.', 'Plan a Sichuan dinner with the spice level, allergies, offal, bones, and shared-dish format clearly communicated. Order conservatively before adding more.', 'Keep the evening flexible for Jinli, a performance, or a quieter local area, but verify current hours and transport before going.'],
      },
      {
        title: 'Day 2: Chengdu Panda Base', ordered: true,
        items: ['Reserve through the official Panda Base channel. Its current ticket notice says all visitors should book online in advance, with on-site sales subject to availability in special circumstances.', 'Choose the correct site: a Panda Base ticket does not cover the separate Dujiangyan Panda Valley.', 'Arrive early enough for your booked entry period and allow time for security, walking, orientation, crowds, and animal rest periods.', 'Use the official map to plan a limited route. The base is extensive, so prioritise a few enclosures instead of rushing everywhere.', 'If visiting the Chengdu Giant Panda Museum, follow its separate official reservation instructions. Keep the evening light after the long walking day.'],
      },
      {
        title: 'Day 3: choose Leshan, Sanxingdui, or Chengdu',
        items: ['Choose Leshan for the UNESCO-listed Giant Buddha and a full heritage excursion. Confirm the live rail or road plan, scenic-area tickets, weather, walking route, and return time.', 'Choose Sanxingdui for archaeology and bronze-age culture. Confirm the official museum reservation, the exact transport connection, passport entry rules, and return journey before fixing the day.', 'Stay in Chengdu if you prefer food, teahouses, markets, museums, or a lower-effort final day. Jinsha Site Museum can provide archaeological context without the longer Sanxingdui transfer.', 'Do not attempt both Leshan and Sanxingdui on the same day. Each deserves a focused visit and reliable return plan.'],
      },
      {
        title: 'Choose the right third day',
        table: { headers: ['Priority', 'Best choice', 'Main trade-off'], rows: [
          ['Giant Buddha and UNESCO heritage', 'Leshan', 'Longer transfer, weather and walking considerations'],
          ['Ancient archaeology and bronzes', 'Sanxingdui Museum', 'Advance reservation and out-of-city transport'],
          ['Food and relaxed local life', 'Stay in Chengdu', 'Fewer headline day-trip sights'],
          ['Travelling with young children', 'Panda day plus a gentle city day', 'Skip the longest excursion'],
          ['Limited mobility', 'Accessible city museums and direct rides', 'Verify each entrance and facility in advance'],
        ] },
        items: ['Mount Emei normally needs more time than a casual addition to this three-day plan. Add a separate day or overnight plan if it is a priority.', 'Weather, ticket availability, group energy, and onward transport should decide the final choice.'],
      },
      {
        title: 'Where to stay and how to get around',
        items: ['Tianfu Square and nearby metro stations offer a central base for first-time visitors, but check the exact walk from the station exit.', 'Chunxi Road and Taikoo Li suit travellers prioritising restaurants, shopping, and evening activity; compare noise and room location.', 'A hotel near one attraction is not automatically convenient for the whole trip. Prioritise a useful metro connection and verified foreign-passport check-in.', 'Use the metro for predictable city transfers and verified ride-hailing for awkward connections. Save destinations and your hotel address in Chinese.', 'Tianfu International Airport is far from central Chengdu. Shuangliu and Tianfu are different airports, so confirm the full airport and terminal before planning the transfer.'],
      },
      {
        title: 'Book and check these before the trip',
        table: { headers: ['Item', 'What to confirm', 'When to act'], rows: [
          ['Panda Base', 'Correct site, official ticket, entry period, passport details, route', 'As soon as the official window allows'],
          ['Giant Panda Museum', 'Separate reservation method and entry conditions', 'Before fixing Day 2'],
          ['Day 3 excursion', 'Ticket, passport rules, transport, weather, return time', 'Before paying for a fixed transfer'],
          ['Hotel', 'Foreign-passport check-in, metro access, Chinese address, late arrival', 'Before choosing a non-refundable rate'],
          ['Train or flight', 'Exact station, airport, terminal, passport name, baggage rules', 'Before planning arrival and departure day'],
        ] },
        items: ['Use the exact passport spelling across tickets, trains, flights, and hotels.', 'Opening hours, entry periods, museum reservations, animal visibility, and transport can change. Recheck official sources immediately before travel.'],
      },
      {
        title: 'Adjust the itinerary for your trip',
        items: ['With only two full days, keep the Panda Base and one central Chengdu day; skip the excursion.', 'With four days, add either Leshan or Sanxingdui without sacrificing the city experience.', 'With five or more days, consider Dujiangyan, Mount Qingcheng, or an overnight Emei plan after checking current access and transport.', 'For food allergies or dietary restrictions, carry a Chinese allergy card and confirm ingredients, broth, oils, garnishes, and shared utensils.', 'If Chengdu sits between Xi\'an and Shanghai, protect the transfer blocks and connect this plan with the 14-day China itinerary.'],
      },
    ],
    faqs: [
      { question: 'Are three days enough for Chengdu?', answer: 'Yes. Three full days allow one central city day, one Panda Base day, and either one excursion or a deeper city day. Arrival and departure days should not be counted as full sightseeing days.' },
      { question: 'Do I need to book the Chengdu Panda Base in advance?', answer: 'Yes. The official ticket page currently says all visitors are required to book online in advance, while on-site purchases in special circumstances depend on availability.' },
      { question: 'What time should I visit the pandas?', answer: 'An early visit is usually the most practical plan because it protects time for the large park and can avoid part of the later-day crowd. Animal activity is never guaranteed, so use the current official entry periods rather than relying on an old timetable.' },
      { question: 'Should I visit Leshan or Sanxingdui?', answer: 'Choose Leshan for the Giant Buddha and UNESCO heritage; choose Sanxingdui for archaeology and distinctive bronze culture. Both need a dedicated day and confirmed tickets and transport.' },
      { question: 'Where should a first-time visitor stay in Chengdu?', answer: 'A central hotel near a useful metro station around Tianfu Square, Chunxi Road, or another well-connected area is usually easiest. Confirm the exact station exit, noise, and foreign-passport check-in.' },
      { question: 'Which Chengdu airport should I use?', answer: 'Use the exact airport and terminal printed on the booking. Tianfu International and Shuangliu are different airports with very different transfer times from the centre.' },
      { question: 'Can ChinaEase Buddy personalise this Chengdu itinerary?', answer: 'Yes. Share your dates, arrival airport or station, hotel, group, walking ability, food needs, budget, and preferred excursion for a route adapted to the actual trip.' },
    ],
    related: [
      { label: '3-day Chongqing itinerary', href: '/3-day-chongqing-itinerary/' },
      { label: '3-day Xi\'an itinerary', href: '/3-day-xian-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China food ordering guide', href: '/china-food-ordering-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised Chengdu itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'Chengdu Research Base of Giant Panda Breeding: tickets', href: 'https://m.panda.org.cn/en/service/ticket/' },
      { label: 'Chengdu Research Base of Giant Panda Breeding: visitor services', href: 'https://m.panda.org.cn/en/service/' },
      { label: 'Chengdu Research Base of Giant Panda Breeding: official map', href: 'https://m.panda.org.cn/en/service/map/' },
      { label: 'UNESCO: Mount Emei Scenic Area and Leshan Giant Buddha', href: 'https://whc.unesco.org/en/list/779/' },
      { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
    ],
  },
  '3-day-guilin-yangshuo-itinerary': {
    path: '/3-day-guilin-yangshuo-itinerary/',
    title: '3-Day Guilin and Yangshuo Itinerary (2026)',
    intro: 'A realistic first Guilin and Yangshuo plan covering the Li River, Yulong River, karst countryside, Xingping, transport, hotels, weather, and activity choices.',
    metaTitle: '3-Day Guilin and Yangshuo Itinerary (2026)',
    metaDescription: 'Plan three days in Guilin and Yangshuo, or stay all three nights in Yangshuo. Compare Li River, Yulong River and Xingping routes, hotels and transfers.',
    quickAnswer: 'For three full days starting in Guilin, spend the first night there, travel down the Li River or transfer by road on Day 2, then use Yangshuo for the Yulong River and karst countryside. If you arrive directly near Yangshuo, stay there for all three nights and make Xingping a separate day instead of backtracking to Guilin. Confirm the actual station, pier, hotel access, weather and luggage transfers; Yangshuo town, Xingping and the river activities are not one compact stop.',
    ctaLabel: 'Get my personalised Guilin and Yangshuo itinerary', ctaHref: '/#trip-plan',
    lastReviewed: 'October 19, 2026', lastModified: '2026-10-19', isArticle: true,
    sections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Overnight'], rows: [
        ['Day 1', 'Arrive in Guilin, lakes or one central sight, prepare the river transfer', 'Guilin'],
        ['Day 2', 'Li River cruise or verified road transfer, arrive in Yangshuo, easy evening', 'Yangshuo'],
        ['Day 3', 'Yulong River and countryside, or Xingping as the main alternative', 'Yangshuo or depart'],
      ] }, items: ['This itinerary assumes three complete sightseeing days; a late arrival should not be counted as Day 1.', 'One night in Guilin and two in Yangshuo usually reduces backtracking for a landscape-focused first visit.', 'Longji rice terraces need additional transfer time and normally work better with a fourth day.'] },
      { title: 'Three days based in Yangshuo instead', table: { headers: ['Day', 'Main plan', 'Transfer check'], rows: [
        ['Day 1', 'Travel directly to your Yangshuo hotel; take a short town or countryside walk after check-in', 'Confirm your actual arrival station or airport and the hotel vehicle-access point'],
        ['Day 2', 'Keep one full day for the Yulong River countryside; add a regulated rafting section only if it is operating', 'Confirm section, pickup, return transport, weather and any booking rules'],
        ['Day 3', 'Choose Xingping and a Li River viewpoint, or use the day for a slower countryside route', 'Check the onward train or flight and leave a realistic transfer buffer'],
      ] }, items: ['This version works when the landscape is the priority and you do not need a Guilin city night or a full Guilin-to-Yangshuo cruise.', 'Yangshuo railway station is near Xingping rather than Yangshuo town; a train arrival still needs an onward road transfer.', 'If you depart from Guilin airport or a Guilin station, plan the return trip separately instead of treating Day 3 as a full sightseeing day.'] },
      { title: 'Day 1: arrive and keep Guilin simple', ordered: true, items: ['Check whether you arrive at Guilin Liangjiang International Airport, Guilin railway station, Guilin North, or Guilin West; they require different transfers.', 'Choose one compact city experience such as the central lakes, Elephant Trunk Hill area, or a relaxed food walk rather than filling the day with distant caves and parks.', 'Confirm the next morning\'s Li River cruise pier, pickup, ticket, passport requirements, luggage policy, and Yangshuo drop-off before sleeping.', 'If weather or river operations make the cruise unsuitable, keep a verified road transfer as the alternative.'] },
      { title: 'Day 2: Guilin to Yangshuo', ordered: true, items: ['For the classic river journey, use a verified Li River cruise product and confirm the actual departure pier. The Guilin travel guide notes that common piers sit outside the city centre.', 'Allow for the transfer to the pier, check-in, the cruise itself, disembarkation, and the final transfer to your Yangshuo hotel.', 'If travelling by road instead, use the saved Chinese hotel address and confirm whether the driver reaches the hotel entrance or a nearby vehicle-access point.', 'After check-in, keep the evening easy. West Street can be lively and crowded; it is optional rather than the whole Yangshuo experience.'] },
      { title: 'Day 3: Yulong River countryside or Xingping', items: ['Choose the Yulong River for a slower countryside day, cycling or walking, and a separately booked regulated rafting section if operating.', 'Choose Xingping for Li River viewpoints and an old-town base, but verify the transfer from Yangshuo and do not assume Yangshuo railway station sits beside Yangshuo town.', 'For cycling or e-bikes, check the vehicle, helmet, traffic comfort, weather, battery, route surface, and return plan before leaving.', 'Avoid entering closed river sections or using unverified boats. Heavy rain, high water, heat, and poor visibility can change the safest plan.'] },
      { title: 'Choose one main landscape experience', table: { headers: ['Experience', 'Best for', 'Main planning issue'], rows: [
        ['Li River cruise', 'Classic Guilin-to-Yangshuo scenery', 'Correct pier, fixed departure, luggage and weather'],
        ['Yulong River', 'Slower countryside and short activities', 'Section choice, rafting operation and local transfers'],
        ['Xingping', 'River viewpoints and photography', 'Separate location and station confusion'],
        ['Longji terraces', 'Rice terraces and village landscapes', 'Long transfer; add a fourth day'],
        ['Yangshuo town', 'Restaurants and convenient base', 'Crowds and distance from rural scenery'],
      ] }, items: ['A cruise and a Yulong countryside day complement each other; multiple similar boat activities may not add enough value.', 'Choose activities for the actual season and river conditions, not only for photos seen online.'] },
      { title: 'Where to stay and how to move', items: ['Stay centrally in Guilin only for the first night and an easy morning departure; verify the transfer to the actual cruise pier.', 'In Yangshuo, town is convenient for restaurants, while countryside hotels provide quieter scenery but require more transport.', 'Confirm that the hotel accepts foreign passports and save its Chinese name, phone number, location pin, and vehicle-access instructions.', 'Yangshuo railway station is closer to Xingping than to Yangshuo town. Calculate the full hotel transfer before selecting it.', 'Use China Railway 12306 for the exact station name and train, and allow time for security and passport checks.'] },
      { title: 'Book and check before travel', table: { headers: ['Item', 'What to confirm', 'When to check'], rows: [
        ['Li River cruise', 'Operator, pier, pickup, entry ID, luggage, end point', 'Before booking the Guilin hotel'],
        ['Yulong activity', 'Official operation, section, age or safety rules, weather', 'Recheck the day before'],
        ['Hotel', 'Foreign-passport check-in, road access, Chinese address', 'Before paying a non-refundable rate'],
        ['Train', 'Exact Guilin or Yangshuo-area station and passport details', 'Before fixing transfers'],
        ['Outdoor day', 'Rain, heat, visibility, water conditions, closure notices', 'Morning of the activity'],
      ] }, items: ['River schedules, piers, access, rafting sections, and safety restrictions can change. Confirm with official or authorised channels immediately before travel.', 'Keep a weather-safe alternative such as a shorter city route, café, museum, or rest block.'] },
      { title: 'Adjust this itinerary', items: ['With two full days, travel directly to Yangshuo or use the Li River transfer, then keep one countryside day.', 'With four days, add Longji, a slower Xingping day, or more time in the Yangshuo countryside—choose one.', 'With children or limited mobility, reduce cycling and steep viewpoints, confirm boat access, and arrange point-to-point transport.', 'If Guilin and Yangshuo replace Chengdu in a 14-day China route, compare the exact flight or rail connection before fixing the city order.', 'Avoid stacking a late show after a long outdoor day unless transport and group energy are secure.'] },
    ],
    faqs: [
      { question: 'Are three days enough for Guilin and Yangshuo?', answer: 'Yes for one Guilin arrival day, one river or transfer day, and one Yangshuo countryside day. Add another day for Longji or a slower Xingping visit.' },
      { question: 'Should I stay in Guilin or Yangshuo?', answer: 'For a scenery-focused trip, spend the first night in Guilin and two nights in Yangshuo. Guilin is useful for arrival and cruise access; Yangshuo is better for the Yulong River and countryside.' },
      { question: 'Can I spend all three days in Yangshuo?', answer: 'Yes if your arrival and departure connections work. Keep one day for the Yulong River countryside, one for Xingping or a second slower route, and a flexible arrival day. This skips a Guilin city night and may skip the full Guilin-to-Yangshuo cruise; check your station and hotel transfers.' },
      { question: 'Is the Li River cruise worth it?', answer: 'It is the classic Guilin-to-Yangshuo landscape journey and also functions as a transfer. Confirm the operator, pier, luggage arrangement, weather policy, and Yangshuo endpoint before booking.' },
      { question: 'What is the difference between the Li River and Yulong River?', answer: 'The Li River offers the broader Guilin-to-Yangshuo landscape journey. The Yulong River is a smaller Yangshuo-area countryside experience suited to shorter activities, walking, cycling, and regulated rafting sections.' },
      { question: 'Is Yangshuo railway station in Yangshuo town?', answer: 'No. It is closer to Xingping and requires an onward transfer to Yangshuo town. Calculate the full journey before booking a train or hotel pickup.' },
      { question: 'Should I add the Longji rice terraces?', answer: 'Add Longji only with another day or by replacing a core activity. The road transfer and village access make it a poor fit as a rushed extra in this three-day plan.' },
      { question: 'Can ChinaEase Buddy personalise this route?', answer: 'Yes. Share your dates, arrival station or airport, hotels, group, mobility, weather tolerance, and preferred river activities for a route adapted to the actual trip.' },
    ],
    related: [
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: '3-day Chengdu itinerary', href: '/3-day-chengdu-itinerary/' }, { label: '3-day Chongqing itinerary', href: '/3-day-chongqing-itinerary/' }, { label: 'China train travel guide', href: '/china-train-travel-guide/' }, { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' }, { label: 'China travel apps', href: '/china-travel-apps/' }, { label: 'Best time to visit China', href: '/best-time-to-visit-china/' }, { label: 'First trip to China', href: '/first-trip-to-china/' }, { label: 'Get a personalised Guilin and Yangshuo itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'Visit Guilin: official Guilin travel guide', href: 'https://visitguilin.org/' }, { label: 'Visit Guilin: Li River', href: 'https://visitguilin.org/things-to-do/guilin-attractions/li-river/' }, { label: 'Visit Guilin: Yulong River', href: 'https://visitguilin.org/things-to-do/yangshuo-attractions/yulong-river/' }, { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
    ],
  },
  '3-day-zhangjiajie-itinerary': {
    path: '/3-day-zhangjiajie-itinerary/', title: '3-Day Zhangjiajie Itinerary for First-Time Visitors (2026)',
    intro: 'A realistic first Zhangjiajie plan covering Wulingyuan, Zhangjiajie National Forest Park, Tianmen Mountain, entrances, hotels, transport, weather, and walking difficulty.',
    metaTitle: '3-Day Zhangjiajie Itinerary for First-Time Visitors (2026)',
    metaDescription: 'Plan three days in Zhangjiajie with Wulingyuan, the national forest park, Tianmen Mountain, hotels, park entrances, trains, weather, and alternatives.',
    quickAnswer: 'With three full days, stay near Wulingyuan for two days in Zhangjiajie National Forest Park, then use one separate day for Tianmen Mountain near Zhangjiajie city. Wulingyuan is a large UNESCO-listed scenic area, not one short trail, and Tianmen Mountain is a different attraction with its own ticket and access route. Confirm the park entrance, timed ticket, shuttle and cableway operations, weather, walking difficulty, and final transport before each day. See the dated Tianmen cableway and Line C update below.',
    ctaLabel: 'Get my personalised Zhangjiajie itinerary', ctaHref: '/#trip-plan', lastReviewed: 'September 22, 2026', lastModified: zhangjiajieTianmenUpdate.modified, isArticle: true,
    sections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Best base'], rows: [['Day 1', 'Wulingyuan entrance, Yuanjiajie area, one upper scenic route', 'Wulingyuan'], ['Day 2', 'Second forest-park route: Tianzi Mountain or a valley-level alternative', 'Wulingyuan'], ['Day 3', 'Tianmen Mountain, then Zhangjiajie city departure', 'Zhangjiajie city']] }, items: ['This plan assumes three complete sightseeing days and workable weather.', 'Do not combine Tianmen Mountain with a full Wulingyuan park day.', 'Keep one route flexible because fog, rain, wind, queues, and transport operations can change visibility and access.'] },
      zhangjiajieTianmenUpdate.section,
      { title: 'Day 1: first Wulingyuan park route', ordered: true, items: ['Enter through the gate that matches your hotel and planned route; Wulingyuan and Zhangjiajie National Forest Park gates are not interchangeable starting points.', 'Use the official park map and live shuttle information to select one upper scenic area rather than chasing every viewpoint.', 'Allow time for queues at shuttle buses, lifts, cableways, and popular viewpoints.', 'Carry water and weather protection, but keep luggage at the hotel. Return before the final internal transport service.'] },
      { title: 'Day 2: second forest-park route', items: ['Choose a contrasting route such as Tianzi Mountain, Yangjiajie, Golden Whip Stream, or another open section based on weather and walking ability.', 'Low cloud can hide upper viewpoints; a valley walk may be the better alternative, but rain can make stone paths slippery.', 'Do not assume every lift, cableway, trail, or gate is operating. Check live notices and last-service times.', 'Move to Zhangjiajie city after the park only if it improves the confirmed Tianmen Mountain entry and departure plan.'] },
      { title: 'Day 3: Tianmen Mountain', ordered: true, items: ['Check the dated Tianmen route notice above, then follow the entry time and starting point on your current booking. If Line C applies, do not use an old Line A/B route; newer operator instructions take priority.', 'Allow most of the day for check-in, queues, cableway or shuttle travel, cliff paths, weather changes, and descent.', 'Glass walkways and exposed cliff paths are optional. Choose alternatives if heights, rain, wind, or mobility make them unsuitable.', 'Keep a generous buffer before an evening train or flight; do not rely on a best-case descent time.'] },
      { title: 'Do not confuse these places', table: { headers: ['Place', 'What it is', 'Planning consequence'], rows: [['Wulingyuan', 'Main tourist base and a common park entrance area', 'Best for two forest-park days'], ['Zhangjiajie National Forest Park', 'Part of the wider Wulingyuan scenic area', 'Multiple gates and large internal transport network'], ['Tianmen Mountain', 'Separate mountain attraction by Zhangjiajie city', 'Separate ticket and dedicated day'], ['Zhangjiajie city', 'Transport hub near Tianmen Mountain', 'Not the best base for early Wulingyuan starts'], ['Zhangjiajie West station', 'Major railway station', 'Check hotel and park transfer time']] }, items: ['Save every gate, hotel, station, and ticket name in Chinese.', 'A place that looks close on a map may still require a shuttle, cableway, queue, or mountain road.'] },
      { title: 'Where to stay and how to move', items: ['Stay near Wulingyuan for the first two park days to protect early starts and reduce daily transfers.', 'Move to Zhangjiajie city only when Tianmen Mountain or an early departure makes it useful.', 'Confirm foreign-passport check-in, luggage storage, breakfast time, and late arrival before booking.', 'Use verified hotel transfers, official park transport, or ride-hailing with the destination saved in Chinese.', 'Check whether your train uses Zhangjiajie West or another station and copy the exact station from the ticket.'] },
      { title: 'Book and check before travel', table: { headers: ['Item', 'What to confirm', 'When to check'], rows: [['Wulingyuan ticket', 'Valid dates, entrance, passport, included transport, re-entry rules', 'Before choosing the hotel'], ['Tianmen Mountain', 'Route product, timed entry, cableway or shuttle sequence', 'Before fixing Day 3'], ['Weather', 'Rain, fog, wind, heat, visibility and warnings', 'Each morning'], ['Hotel', 'Correct base, foreign-passport check-in, luggage transfer', 'Before paying'], ['Train or flight', 'Exact station or airport, departure buffer and baggage', 'Before the final day']] }, items: ['Tickets, route products, park sections, lifts, cableways, shuttle buses, and safety closures can change.', 'Use current official notices and keep a lower-level or rest-day alternative.'] },
      { title: 'Adjust this itinerary', items: ['With two full days, choose one Wulingyuan day and one Tianmen Mountain day.', 'With four days, add another forest-park route or a recovery day; do not automatically add another distant attraction.', 'With children or limited mobility, shorten cliff paths, verify lift access, and protect meal and toilet breaks.', 'In heavy fog, prioritise safe lower routes and accept that famous pillar views may not appear.', 'If Zhangjiajie replaces Chengdu or Guilin in a longer China route, verify the actual flight or rail schedule before setting the city order.'] },
    ],
    faqs: [
      ...zhangjiajieTianmenUpdate.faqs,
      { question: 'Are three days enough for Zhangjiajie?', answer: 'Yes for two Wulingyuan park days and one Tianmen Mountain day. Add time for slower walking, uncertain weather, or another regional attraction.' },
      { question: 'Is Tianmen Mountain inside Zhangjiajie National Forest Park?', answer: 'No. Tianmen Mountain is a separate attraction near Zhangjiajie city with its own ticket and access route.' },
      { question: 'Where should I stay in Zhangjiajie?', answer: 'Stay near Wulingyuan for the forest-park days, then consider Zhangjiajie city for Tianmen Mountain or an early departure.' },
      { question: 'Which park entrance should I use?', answer: 'Use the entrance that matches the confirmed route and hotel. Multiple gates lead to different parts of the large scenic area, so do not choose only by the English name.' },
      { question: 'What if Zhangjiajie is foggy or raining?', answer: 'Upper viewpoints may disappear and stone paths can become slippery. Check warnings and live operations, use a safe lower route, or keep a flexible rest block.' },
      { question: 'Which railway station serves Zhangjiajie?', answer: 'Many high-speed services use Zhangjiajie West, but use the exact station printed on the ticket and calculate the transfer from your hotel.' },
      { question: 'Can ChinaEase Buddy personalise this itinerary?', answer: 'Yes. Share your dates, tickets, hotel, walking ability, heights tolerance, group, and onward transport for a route adapted to the actual trip.' },
    ],
    related: [{ label: '3-day Guilin and Yangshuo itinerary', href: '/3-day-guilin-yangshuo-itinerary/' }, { label: '3-day Chengdu itinerary', href: '/3-day-chengdu-itinerary/' }, { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: 'China train travel guide', href: '/china-train-travel-guide/' }, { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' }, { label: 'China travel apps', href: '/china-travel-apps/' }, { label: 'Best time to visit China', href: '/best-time-to-visit-china/' }, { label: 'First trip to China', href: '/first-trip-to-china/' }, { label: 'Get a personalised Zhangjiajie itinerary', href: '/#trip-plan' }],
    sources: [...zhangjiajieTianmenUpdate.sourceLinks.map(([label, href]) => ({ label, href })), { label: 'UNESCO: Wulingyuan Scenic and Historic Interest Area', href: 'https://whc.unesco.org/en/list/640/' }, { label: 'Hunan Provincial Government English website', href: 'https://enghunan.gov.cn/' }, { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' }],
  },
  '3-day-shenzhen-itinerary': {
    path: '/3-day-shenzhen-itinerary/', title: '3-Day Shenzhen Itinerary for First-Time Visitors (2026)',
    intro: 'A practical first Shenzhen plan covering Futian, Shenzhen Museum, Lianhuashan Park, OCT-LOFT, Shenzhen Bay, Nantou Ancient Town, food, hotels, metro travel, and a flexible third day.',
    metaTitle: '3-Day Shenzhen Itinerary for First-Time Visitors (2026)',
    metaDescription: 'Plan three days in Shenzhen with Futian, museums, OCT-LOFT, Shenzhen Bay, Nantou, food, hotels, Metro, airport transfers, and flexible day-three options.',
    quickAnswer: 'With three full days, use one day for Shenzhen\'s civic centre and modern skyline, one for the Nanshan creative and waterfront corridor, and one flexible day for a theme park, Dapeng coast, shopping, or another neighbourhood. Stay near a Metro interchange in Futian or Nanshan, group places by district, and do not treat distant Dapeng beaches as a quick city-centre stop. Confirm museum reservations, attraction tickets, opening hours, weather warnings, and the exact airport, railway-station, or Hong Kong border transfer before travel.',
    ctaLabel: 'Get my personalised Shenzhen itinerary', ctaHref: '/#trip-plan', lastReviewed: 'September 30, 2026', lastModified: shenzhenItineraryPlanning.modified, isArticle: true,
    sections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Area'], rows: [['Day 1', 'Shenzhen Museum, Civic Center, Lianhuashan Park, Futian evening', 'Futian'], ['Day 2', 'OCT-LOFT, Nantou Ancient Town, Shenzhen Bay waterfront', 'Nanshan'], ['Day 3', 'Choose one: theme park, Dapeng coast, electronics and shopping, or a slower local day', 'Route-specific']] }, items: ['This plan assumes three complete sightseeing days, not arrival and departure fragments.', 'Shenzhen is long from east to west. Group each day geographically instead of crossing the city repeatedly.', 'Keep Day 3 flexible because the best option depends on weather, interests, ticket availability, and onward transport.'] },
      shenzhenItineraryPlanning.durationSection,
      { title: 'Day 1: understand modern Shenzhen', ordered: true, items: ['Start around Civic Center and visit the appropriate Shenzhen Museum venue after checking its current opening, reservation, and passport rules.', 'Walk through the civic district, then use Lianhuashan Park for an elevated city view if the weather and visibility are suitable.', 'Leave time for a rest during hot or humid weather; much of this day can be split between indoor exhibits and outdoor walking.', 'Finish in Futian with a food or evening block close to your hotel instead of adding a distant attraction.'] },
      { title: 'Day 2: design, history and the bay', ordered: true, items: ['Begin at OCT-LOFT for galleries, design spaces, cafés, and adaptive industrial architecture; check individual venue opening days.', 'Continue to Nantou Ancient Town for a contrasting layer of local history and regenerated urban space.', 'Move toward Shenzhen Bay Park or another confirmed waterfront section for late afternoon. Distances along the bay are larger than they look.', 'Choose a sunset or dinner stop that keeps the return simple. Coastal weather, heat, rain, and temporary access controls can change the plan.'] },
      shenzhenItineraryPlanning.metroSection,
      { title: 'Day 3: choose one route', table: { headers: ['Option', 'Best for', 'Planning note'], rows: [['Window of the World or another theme park', 'Families, entertainment, a full attraction day', 'Check dated tickets, opening hours and show schedules'], ['Dapeng Peninsula', 'Coast, villages and a slower scenic day', 'A long transfer; verify beach or site access and return transport'], ['Huaqiangbei and central shopping', 'Technology, markets, malls and flexible indoor time', 'Compare prices and warranty terms; keep valuables secure'], ['Shekou and Sea World area', 'Waterfront, dining and a relaxed urban day', 'Useful when you want less travel than Dapeng'], ['Extra local day', 'Museums, cafés, parks or recovery', 'Best after a late arrival or before onward travel']] }, items: ['Dapeng Fortress and the eastern beaches are not on the central Metro grid; plan the full transfer and avoid a tight evening departure.', 'A theme-park day usually fills the day. Do not stack it with Futian, Nantou, or Dapeng.', 'If the weather is poor, favour museums, design venues, shopping areas, and food rather than forcing a coastal plan.'] },
      { title: 'Where to stay', items: ['Futian works well for first-time visitors who want central Metro connections, Civic Center access, business-district hotels, and straightforward travel to major stations.', 'Nanshan suits OCT, Nantou, Shenzhen Bay, Shekou, and many technology-district visits, but calculate the exact airport or railway transfer.', 'Luohu can be useful for Dongmen, traditional shopping areas, Shenzhen Railway Station, and the Luohu border, but it is less convenient for western Nanshan days.', 'Confirm that the hotel accepts foreign passports, record the Chinese name and address, and check which station exit is closest.', 'Do not choose a hotel described only as “near Hong Kong” without identifying the actual border crossing and its operating arrangements.'] },
      { title: 'Airport, trains, Metro and border planning', table: { headers: ['Journey', 'What to verify', 'Common mistake'], rows: [['Shenzhen Bao\'an Airport', 'Terminal, Metro or taxi plan, late-arrival time', 'Assuming the airport is close to Futian or Luohu'], ['High-speed rail', 'Exact station: Shenzhen North, Futian, Shenzhen, or another station', 'Going to the wrong station'], ['City Metro', 'Correct line, interchange, exit and last-train time', 'Estimating distance only from the English place name'], ['Hong Kong crossing', 'Eligible documents, chosen checkpoint, current hours and onward route', 'Treating every border point as interchangeable'], ['Dapeng or eastern coast', 'Road transfer, weather, reservation or access rules, return plan', 'Planning it as a short Metro excursion']] }, items: ['Airport Line 11 connects the airport corridor with central and western parts of the city, but the best route depends on the hotel and current service.', 'Save destinations in Chinese and use the live route in a reliable map app.', 'Use the exact station printed on a China Railway ticket; Shenzhen has several major stations.'] },
      { title: 'Food, payments and practical pacing', items: ['Try Cantonese and Chaoshan-influenced food, dim sum, roast meats, seafood, noodles, and Shenzhen\'s broad migrant-city dining scene, but choose by dietary needs and location rather than a rigid checklist.', 'For serious allergies, show a written Chinese allergy card and confirm ingredients; translation tools do not guarantee kitchen separation.', 'Prepare Alipay or WeChat Pay with a physical card and some RMB cash as backup.', 'Summer heat, humidity, heavy rain, and tropical-cyclone warnings can materially change outdoor days. Check official forecasts and local notices.', 'Shenzhen rewards a slower district-based plan. One museum, one neighbourhood, one park or waterfront, and one meal focus can be enough for a strong day.'] },
      { title: 'Book and check before travel', items: ['Check the current Shenzhen Museum venue, reservation method, closure day, passport entry, and exhibition notices.', 'Buy dated theme-park tickets only after confirming the day and cancellation terms.', 'For Dapeng, verify attraction or beach access, weather, transport, and any reservation requirement.', 'Confirm the exact hotel, railway station, airport terminal, or border checkpoint in Chinese.', 'Review official weather warnings and keep an indoor alternative for every coastal or park day.'] },
    ],
    faqs: [
      shenzhenItineraryPlanning.durationFaq,
      { question: 'Is Shenzhen worth visiting for tourists?', answer: 'Yes if you enjoy modern Chinese cities, design, technology, food, parks, waterfronts, shopping, or a contrast with older historic destinations. The city works best when planned by district.' },
      { question: 'Where should a first-time visitor stay in Shenzhen?', answer: 'Futian is the easiest all-round base for many first visits. Nanshan is strong for OCT, Nantou, Shenzhen Bay, and Shekou; Luohu suits Dongmen, Shenzhen Railway Station, and the Luohu crossing.' },
      { question: 'Can I visit Shenzhen from Hong Kong for the day?', answer: 'It may be possible if your passport, entry permission, chosen checkpoint, and timings allow it, but verify current immigration rules and checkpoint hours. Three days gives a much better view of the city.' },
      { question: 'Which Shenzhen railway station should I use?', answer: 'Use the exact station on your ticket. Shenzhen North, Futian, Shenzhen, and other stations are in different parts of the city and are not interchangeable.' },
      { question: 'Should I include Dapeng in a three-day trip?', answer: 'Choose Dapeng only if coast or heritage is a priority and you can give it most of a day. It requires more road travel than central attractions and is weather-sensitive.' },
      { question: 'Can ChinaEase Buddy personalise this Shenzhen itinerary?', answer: 'Yes. Share your dates, hotel, arrival point, interests, group, pace, weather tolerance, and onward route for a district-by-district plan.' },
    ],
    related: [{ label: '3-day Guilin and Yangshuo itinerary', href: '/3-day-guilin-yangshuo-itinerary/' }, { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' }, { label: 'China metro guide', href: '/china-metro-guide/' }, { label: 'China train travel guide', href: '/china-train-travel-guide/' }, { label: 'China food ordering guide', href: '/china-food-ordering-guide/' }, { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' }, { label: 'China travel apps', href: '/china-travel-apps/' }, { label: 'First trip to China', href: '/first-trip-to-china/' }, { label: 'Get a personalised Shenzhen itinerary', href: '/#trip-plan' }],
    sources: [...shenzhenItineraryPlanning.sources, { label: 'Shenzhen Government Online: Travel Guide', href: 'https://www.sz.gov.cn/en_szgov/travel/guide/' }, { label: 'Shenzhen Government Online: Travel', href: 'https://www.sz.gov.cn/en_szgov/travel/index.html' }, { label: 'Shenzhen Metro: Line 11', href: 'https://www.szmc.net/szmc_enm/Time_Table/Line11/202003/83269.html' }, { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' }],
  },
  '3-day-guangzhou-itinerary': {
    path: '/3-day-guangzhou-itinerary/', title: '3-Day Guangzhou Itinerary for First-Time Visitors (2026)',
    intro: 'A realistic first Guangzhou plan covering Chen Clan Ancestral Hall, Yongqingfang, Shamian Island, Canton Tower, museums, Cantonese food, hotels, Metro travel, airport transfers, and high-speed rail.',
    metaTitle: '3-Day Guangzhou Itinerary for First-Time Visitors (2026)',
    metaDescription: 'Plan three days in Guangzhou with Chen Clan Ancestral Hall, Yongqingfang, Shamian, Canton Tower, dim sum, hotels, Metro, airport and train advice.',
    quickAnswer: 'With three full days, use one day for old Guangzhou and Xiguan culture, one for the modern Pearl River and Canton Tower area, and one flexible museum, park, food, or day-trip day. Stay near a useful Metro interchange in Yuexiu, Liwan, Tianhe, or Haizhu rather than choosing only by hotel price. Reserve capacity-controlled museums or tower tickets where required, check closure days and weather, and confirm the exact Guangzhou railway station and Baiyun Airport terminal before travel.',
    ctaLabel: 'Get my personalised Guangzhou itinerary', ctaHref: '/#trip-plan', lastReviewed: 'September 23, 2026', lastModified: '2026-09-23', isArticle: true,
    sections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Area'], rows: [['Day 1', 'Chen Clan Ancestral Hall, Yongqingfang, Enning Road, Shamian Island', 'Liwan'], ['Day 2', 'Guangdong Museum or city museum, Huacheng Square, Canton Tower and Pearl River evening', 'Tianhe and Haizhu'], ['Day 3', 'Choose one: Yuexiu history, Baiyun Mountain, Chimelong, food-focused exploration, or Foshan', 'Route-specific']] }, items: ['This plan assumes three complete sightseeing days rather than partial arrival and departure days.', 'Guangzhou is large, humid for much of the year, and busy around trade fairs and public holidays. Group places by district.', 'Treat meals as part of the itinerary: dim sum and Cantonese dinner reservations can shape the most efficient route.'] },
      { title: 'Day 1: old Guangzhou and Xiguan', ordered: true, items: ['Start at Chen Clan Ancestral Hall and check the current opening hours, ticket or reservation method, passport entry, and closure notices.', 'Continue through Liwan toward Yongqingfang, Enning Road, or the Cantonese Opera Arts Museum, choosing only the venues that match your pace.', 'Use Shamian Island for a slower late-afternoon walk among historic buildings and mature trees.', 'Finish with Cantonese food in Liwan or return toward the hotel. Do not add Canton Tower merely because it looks close on a map.'] },
      { title: 'Day 2: museums, the new city and the Pearl River', ordered: true, items: ['Choose one main museum such as Guangdong Museum after confirming its current reservation system, opening days, exhibition access, and passport requirements.', 'Walk through Huacheng Square and the Zhujiang New Town civic axis when heat, rain, and visibility allow.', 'Cross toward the Canton Tower area or select a riverside viewpoint. A tower ticket and a Pearl River cruise are separate products, not automatic parts of the same visit.', 'For a night cruise, verify the pier, boarding time, route, passport rule, cancellation terms, and last Metro connection before paying.'] },
      { title: 'Day 3: choose one route', table: { headers: ['Option', 'Best for', 'Planning note'], rows: [['Yuexiu Park and historic centre', 'History, monuments, a moderate city day', 'Combine with one nearby museum or temple, not a distant theme park'], ['Baiyun Mountain', 'Green space and city views', 'Weather, heat, walking ability and transport affect the day'], ['Chimelong area', 'Families, wildlife or theme parks', 'A full attraction day in Panyu; buy the correct dated product'], ['Food-focused Guangzhou', 'Dim sum, markets, neighbourhoods and slower travel', 'Check restaurant queues and serious allergy needs'], ['Foshan extension', 'Lingnan culture, ceramics or martial-arts history', 'Confirm intercity route and keep a full return buffer']] }, items: ['Choose one Day 3 route. Chimelong, Baiyun Mountain, and Foshan should not be stacked together.', 'In heavy rain or extreme heat, use museums, covered shopping areas, and a longer meal instead of forcing outdoor sightseeing.', 'If you depart that evening, keep the final activity in the same side of the city as the correct railway station or airport route.'] },
      { title: 'Where to stay in Guangzhou', items: ['Yuexiu is practical for Beijing Road, older city sights, parks, and central Metro connections.', 'Liwan is best for Xiguan culture, Yongqingfang, Shamian, traditional food, and a slower historic atmosphere.', 'Tianhe suits modern malls, business travel, Guangzhou East connections, and the Zhujiang New Town area, but it is farther from Liwan sights.', 'Haizhu works for Canton Tower, the Pearl River, Pazhou, and Canton Fair visits; event dates can sharply change hotel prices and transport demand.', 'Confirm foreign-passport check-in, the nearest station exit, luggage storage, and the exact Chinese hotel address before paying.'] },
      { title: 'Airport, train and Metro planning', table: { headers: ['Journey', 'What to verify', 'Common mistake'], rows: [['Baiyun International Airport', 'T1, T2 or T3, live airline assignment, rail or road transfer', 'Going to the wrong terminal'], ['Guangzhou South', 'Long Metro or taxi transfer from central districts', 'Treating it as a city-centre station'], ['Guangzhou East', 'Exact train and onward Metro route', 'Confusing it with Guangzhou or Guangzhou South'], ['Guangzhou or Guangzhou Baiyun station', 'Station name printed on the ticket', 'Using “Guangzhou station” as a generic term'], ['City Metro', 'Line, interchange, exit and last-train time', 'Choosing the nearest-looking English place name']] }, items: ['Baiyun Airport now has multiple terminals and transport arrangements; check the current terminal rather than relying on an old screenshot.', 'Guangzhou has several major railway stations. Use the exact station shown in 12306 and allow time for security and passport checks.', 'Foreign visitors can use several Metro payment routes, but keep a physical bank card and some RMB cash as backup.'] },
      { title: 'How to plan Cantonese food', items: ['For dim sum, decide whether you want an early local breakfast, a hotel-friendly late morning, or a famous restaurant that may require queueing.', 'Useful categories include dim sum, roast goose or other roast meats, wonton noodles, claypot rice, congee, double-skin milk, and seasonal Cantonese dishes; availability differs by restaurant.', 'Do not order a long checklist at every meal. Choose one or two priorities and leave room for neighbourhood discoveries.', 'For allergies or strict dietary requirements, show a written Chinese card, confirm stocks and sauces, and understand that translation does not guarantee separation from allergens.', 'Save the restaurant name and branch in Chinese because chains can have several locations across the city.'] },
      { title: 'Weather, crowds and booking checks', items: ['Spring and summer can bring heat, humidity, heavy rain and tropical-cyclone disruption. Check official forecasts and warnings every day.', 'The Canton Fair and other major events can increase hotel prices, Metro crowding and taxi demand, especially around Pazhou and business districts.', 'Museums commonly have closure days, capacity limits or online reservation systems. Verify each venue shortly before the visit.', 'Canton Tower, cruises, Chimelong parks and special exhibitions may use dated or timed tickets with separate cancellation terms.', 'Keep one indoor alternative and protect transfer buffers before flights or high-speed trains.'] },
      { title: 'Adjust this itinerary', items: ['With two days, keep the Liwan old-city day and the Pearl River modern-city day.', 'With four days, add one full Day 3 option rather than spreading distant attractions across several rushed half-days.', 'For a Shenzhen–Guangzhou combination, use the real railway station pair and hotel locations to choose the city order.', 'For children, older travellers, or limited mobility, reduce long walks, check step-free exits, and plan air-conditioned breaks.', 'If food is the priority, shorten the attraction list and reserve time for breakfast, tea, dinner, and neighbourhood movement.'] },
    ],
    faqs: [
      { question: 'Are three days enough for Guangzhou?', answer: 'Yes for old Guangzhou, the modern Pearl River area, and one flexible interest day. Add time for several theme parks, a full Foshan trip, business events, or slower food exploration.' },
      { question: 'Is Guangzhou worth visiting for first-time China travellers?', answer: 'Yes if you value Cantonese food, Lingnan architecture, historic trading districts, museums, modern skyline views, or a Shenzhen and Hong Kong regional route.' },
      { question: 'Where should I stay in Guangzhou?', answer: 'Yuexiu is the easiest general base, Liwan is strongest for old-city culture, Tianhe suits modern business and shopping, and Haizhu is useful for Canton Tower or Pazhou. Choose by the exact daily route.' },
      { question: 'Should I visit Canton Tower?', answer: 'Visit if skyline views or the tower experience matter to you and visibility is suitable. Otherwise, riverside public areas can provide a strong evening without a tower ticket.' },
      { question: 'Which Guangzhou railway station should I use?', answer: 'Use the exact station printed on your ticket. Guangzhou South, Guangzhou East, Guangzhou, and Guangzhou Baiyun are different stations with different transfer times.' },
      { question: 'Can Guangzhou and Shenzhen be combined?', answer: 'Yes. High-speed trains make the cities easy to combine, but station locations, ticket availability, hotel transfers, and the actual sightseeing route determine whether a day trip or overnight stay works better.' },
      { question: 'Can ChinaEase Buddy personalise this Guangzhou itinerary?', answer: 'Yes. Share your dates, hotel, arrival station or terminal, food priorities, interests, group, pace, and onward city for a practical district-based plan.' },
    ],
    related: [{ label: '3-day Shenzhen itinerary', href: '/3-day-shenzhen-itinerary/' }, { label: '3-day Guilin and Yangshuo itinerary', href: '/3-day-guilin-yangshuo-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' }, { label: 'China metro guide', href: '/china-metro-guide/' }, { label: 'China train travel guide', href: '/china-train-travel-guide/' }, { label: 'China food ordering guide', href: '/china-food-ordering-guide/' }, { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' }, { label: 'Best time to visit China', href: '/best-time-to-visit-china/' }, { label: 'First trip to China', href: '/first-trip-to-china/' }, { label: 'Get a personalised Guangzhou itinerary', href: '/#trip-plan' }],
    sources: [{ label: 'Guangzhou International: old and new Guangzhou', href: 'https://www.eguangzhou.gov.cn/gznewsphotos/content/post_30437.html' }, { label: 'Guangzhou Government: transport guide for international visitors', href: 'https://www.gz.gov.cn/zfjg/gzsjtysj/zwfw/jtfw/content/post_9599057.html' }, { label: 'Guangzhou Government: Baiyun Airport terminal transport', href: 'https://www.gz.gov.cn/zwfw/zxfw/jtfw/content/post_10690829.html' }, { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' }],
  },
  '3-day-hangzhou-itinerary': {
    path: '/3-day-hangzhou-itinerary/', title: '3-Day Hangzhou Itinerary for First-Time Visitors (2026)',
    intro: 'A practical first Hangzhou plan covering West Lake, Lingyin Temple, Longjing tea country, Hefang Street, the Grand Canal, hotels, trains, airport transfers, reservations, crowds, and realistic weather alternatives.',
    metaTitle: '3-Day Hangzhou Itinerary for First-Time Visitors (2026)',
    metaDescription: 'Plan three days in Hangzhou with West Lake, Lingyin Temple, Longjing tea, the Grand Canal, Hefang Street, hotels, trains, airport and weather advice.',
    quickAnswer: 'With three full days, give West Lake one unhurried day, combine Lingyin and the western hills or Longjing area on another, then use the third day for the Grand Canal, Southern Song heritage, a wetland, or a water-town extension. Stay near the east or north side of West Lake, a useful Metro interchange, or Hangzhou East only when transport convenience matters more than atmosphere. Confirm temple and museum reservations, boat operations, weather, the exact railway station, and Xiaoshan Airport transfer before travel.',
    ctaLabel: 'Get my personalised Hangzhou itinerary', ctaHref: '/#trip-plan', lastReviewed: 'September 23, 2026', lastModified: '2026-09-23', isArticle: true,
    sections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Planning focus'], rows: [['Day 1', 'West Lake causeways, gardens, viewpoints and optional boat', 'Keep the route compact'], ['Day 2', 'Lingyin area, Feilai Peak and a Longjing or western-hills block', 'Reservations and road traffic'], ['Day 3', 'Grand Canal and historic streets, or one full alternative', 'Choose by weather and interests']] }, items: ['This plan assumes three complete sightseeing days rather than arrival and departure fragments.', 'West Lake is a large cultural landscape, not one viewpoint. Trying to circle every shore section usually weakens the day.', 'Weekend, holiday, blossom, lotus, autumn and temple crowds can materially change walking and road times.'] },
      { title: 'Day 1: experience West Lake without rushing', ordered: true, items: ['Choose one coherent side of West Lake based on your hotel and weather, then connect a causeway, garden, historic site, and waterside walk.', 'Use a legal sightseeing boat only if the current route, pier, timetable, weather and ticket terms fit the day. Do not treat old online prices or schedules as current.', 'Leave room for tea, lunch, rain shelter, photography and crowded paths rather than filling every hour with named viewpoints.', 'Finish on the side of the lake that gives you a simple dinner and hotel return. Night shows, cruises and tower or pagoda tickets require separate checks.'] },
      { title: 'Day 2: Lingyin and tea country', ordered: true, items: ['Start early for Lingyin and the Feilai Peak scenic area after checking the current ticket, reservation, identity-document and opening arrangements.', 'Dress and behave respectfully at religious sites; incense, prayer areas, photography and access rules can differ by zone.', 'Choose one second block: Longjing village and tea fields, Meijiawu, another western-hills walk, or an early return to the lake.', 'Use official taxis, ride-hailing or confirmed buses for hillside areas. Road congestion can make a short map distance take much longer.', 'Buy tea only when origin, grade, weight, price and seller are clear; a tasting does not create an obligation to purchase.'] },
      { title: 'Day 3: choose one Hangzhou route', table: { headers: ['Option', 'Best for', 'Planning note'], rows: [['Grand Canal and Xiaohe/Zhejiang museum area', 'Urban history, crafts and slower neighbourhoods', 'Check museum closure days and canal boat operations'], ['Hefang Street and Southern Song heritage', 'Historic lanes, snacks, medicine and shopping', 'Crowded and commercial; pair with one nearby museum'], ['Xixi Wetland', 'Nature and a quieter full block', 'Large site; confirm entrance, boat route and weather'], ['Liangzhu museums or archaeology', 'Ancient history and design', 'A separate outer-city route with reservations'], ['Water-town extension', 'Canals and traditional architecture', 'Choose one town and calculate the full road or rail transfer']] }, items: ['Do not combine the Grand Canal, Xixi, Liangzhu and a distant water town in one day.', 'If rain is heavy, prioritise museums and sheltered neighbourhoods; if visibility is poor, skip view-dependent plans.', 'Keep a generous departure buffer because scenic-area traffic and Hangzhou East station security can be busy.'] },
      { title: 'Where to stay in Hangzhou', items: ['The east and northeast sides of West Lake are convenient for first-time sightseeing, restaurants and Metro access, but prices and crowds can be higher.', 'The north or northwest side can suit Lingyin, the Grand Canal and quieter lake access, depending on the exact station and bus route.', 'Near Hangzhou East railway station is practical for a short Shanghai extension or early train but less atmospheric for evenings.', 'Qianjiang New Town suits business, modern skyline and transport connections but adds travel to classic West Lake sights.', 'Confirm foreign-passport check-in, the Chinese hotel address, nearest Metro exit, luggage storage and late-arrival instructions before paying.'] },
      { title: 'Airport, train and city transport', table: { headers: ['Journey', 'What to verify', 'Common mistake'], rows: [['Hangzhou Xiaoshan Airport', 'Terminal, Metro or road transfer and late-arrival plan', 'Assuming it is close to West Lake'], ['Hangzhou East', 'Most high-speed services, station entrance and hotel transfer', 'Underestimating the station size'], ['Hangzhou station', 'Exact service and city-centre transfer', 'Confusing it with Hangzhou East'], ['Hangzhou West or South', 'Ticket station name and long cross-city transfer', 'Going to the familiar station instead of the booked one'], ['West Lake scenic area', 'Walking, bus, taxi restrictions and live congestion', 'Expecting Metro to reach every lakeside stop']] }, items: ['Shanghai–Hangzhou trains are frequent in principle, but ticket availability, departure station, arrival station and hotel location determine the real convenience.', 'Use the exact station printed in 12306 and arrive with time for security and foreign-passport ticket checks.', 'Save key destinations in Chinese and combine Metro with walking, buses or verified ride-hailing.'] },
      { title: 'Tea, food and shopping', items: ['Longjing tea is closely associated with Hangzhou, but harvest season, origin, grade and processing affect price and taste. Do not rely on packaging alone.', 'Hangzhou dishes can include freshwater fish, pork, bamboo shoots and sweet or delicate flavours; check ingredients rather than assuming a dish name explains everything.', 'For serious allergies, show a written Chinese allergy card and confirm stocks, oils and sauces; translation does not guarantee separation.', 'Hefang Street and scenic areas are useful for browsing but not automatically the best place for every tea, silk or souvenir purchase.', 'Keep Alipay or WeChat Pay ready with a physical card and some RMB cash as backup.'] },
      { title: 'Weather, crowds and reservations', items: ['Spring rain, summer heat and humidity, typhoon-related disruption, autumn crowds and winter damp cold can all change the practical route.', 'West Lake remains attractive in imperfect weather, but boats, exposed walks, hill routes and sunset plans are condition-dependent.', 'Lingyin and popular museums may use reservation or capacity controls, especially on weekends and public holidays.', 'Check live official notices each morning and keep one indoor museum or historic-street alternative.', 'Avoid public-holiday day trips from Shanghai unless transport and crowd levels are acceptable.'] },
      { title: 'Adjust this itinerary', items: ['With two days, keep West Lake and Lingyin, then add only a short historic-street or canal block.', 'With four days, add one full third-day alternative such as Xixi, Liangzhu or a water town.', 'For Shanghai plus Hangzhou, an overnight stay protects early and evening West Lake time better than a rushed return day trip.', 'With children or limited mobility, shorten causeway walks, verify boat and step-free access, and plan frequent rest stops.', 'If tea culture is the priority, reduce lake stops and arrange one credible plantation or producer visit without committing to a purchase.'] },
    ],
    faqs: [
      { question: 'Are three days enough for Hangzhou?', answer: 'Yes for West Lake, Lingyin and one additional canal, museum, wetland or historic-area day. Add time for several outer-city sites or a distant water town.' },
      { question: 'Can Hangzhou be a day trip from Shanghai?', answer: 'Yes, but station transfers and West Lake travel reduce usable time. Staying one or two nights produces a calmer visit and gives you early morning or evening at the lake.' },
      { question: 'Where should I stay in Hangzhou?', answer: 'For a first visit, choose the east or north side of West Lake near useful transport. Stay by Hangzhou East only when an early or late train is the main constraint.' },
      { question: 'Do I need a full day for West Lake?', answer: 'A full day is appropriate if you want a causeway, gardens, historic sites, a boat or tea break without rushing. A short visit should focus on one side rather than circling the entire lake.' },
      { question: 'Do I need to reserve Lingyin Temple?', answer: 'Reservation, ticket and identity-document arrangements can change and may involve separate scenic-area access. Check the current official instructions before the visit.' },
      { question: 'Which Hangzhou railway station should I use?', answer: 'Use the exact station printed on your ticket. Hangzhou East, Hangzhou, Hangzhou West and Hangzhou South are different stations with very different transfer times.' },
      { question: 'Can ChinaEase Buddy personalise this Hangzhou itinerary?', answer: 'Yes. Share your dates, hotel, arrival station, walking ability, tea or heritage interests, group, weather tolerance, and onward city for a practical route.' },
    ],
    related: [{ label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' }, { label: '3-day Guangzhou itinerary', href: '/3-day-guangzhou-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: 'China train travel guide', href: '/china-train-travel-guide/' }, { label: 'China metro guide', href: '/china-metro-guide/' }, { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' }, { label: 'China food ordering guide', href: '/china-food-ordering-guide/' }, { label: 'China travel apps', href: '/china-travel-apps/' }, { label: 'Best time to visit China', href: '/best-time-to-visit-china/' }, { label: 'First trip to China', href: '/first-trip-to-china/' }, { label: 'Get a personalised Hangzhou itinerary', href: '/#trip-plan' }],
    sources: [{ label: 'UNESCO: West Lake Cultural Landscape of Hangzhou', href: 'https://whc.unesco.org/en/list/1334/' }, { label: 'UNESCO: The Grand Canal', href: 'https://whc.unesco.org/en/list/1443/' }, { label: 'Hangzhou city international portal', href: 'https://www.ehangzhou.gov.cn/' }, { label: 'China Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' }],
  },
  '3-day-suzhou-itinerary': {
    path: '/3-day-suzhou-itinerary/',
    title: suzhouGuide.heading,
    intro: '',
    metaTitle: suzhouGuide.metaTitle,
    metaDescription: suzhouGuide.metaDescription,
    quickAnswer: quickAnswerText(suzhouGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA.
    ctaLabel: 'Get my personalised Suzhou itinerary',
    ctaHref: '/#trip-plan',
    reviewed: suzhouGuide.reviewed,
    lastModified: suzhouGuide.modified,
    isArticle: true,
    sections: [],
    faqs: suzhouGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [
      { label: '3-day Nanjing itinerary', href: '/3-day-nanjing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: '3-day Hangzhou itinerary', href: '/3-day-hangzhou-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get my personalised Suzhou itinerary', href: '/#trip-plan' },
    ],
    sources: suzhouGuide.sources,
  },
  '3-day-nanjing-itinerary': {
    path: '/3-day-nanjing-itinerary/',
    title: nanjingGuide.heading,
    intro: '',
    metaTitle: nanjingGuide.metaTitle,
    metaDescription: nanjingGuide.metaDescription,
    quickAnswer: quickAnswerText(nanjingGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA.
    ctaLabel: 'Get my personalised Nanjing itinerary',
    ctaHref: '/#trip-plan',
    reviewed: nanjingGuide.reviewed,
    lastModified: nanjingGuide.modified,
    isArticle: true,
    sections: [],
    faqs: nanjingGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: '3-day Suzhou itinerary', href: '/3-day-suzhou-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get my personalised Nanjing itinerary', href: '/#trip-plan' },
    ],
    sources: nanjingGuide.sources,
  },
  '3-day-dali-itinerary': {
    path: '/3-day-dali-itinerary/',
    title: daliGuide.heading,
    intro: daliGuide.description,
    metaTitle: daliGuide.title,
    metaDescription: daliGuide.description,
    quickAnswer: daliGuide.quickAnswer,
    ctaLabel: 'Get my personalised Dali itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: daliGuide.lastReviewed,
    lastModified: daliGuide.lastModified,
    isArticle: true,
    sections: daliGuide.contentSections,
    faqs: daliGuide.faqs.map(([question, answer]) => ({ question, answer })),
    related: [
      { label: '3-day Guilin and Yangshuo itinerary', href: '/3-day-guilin-yangshuo-itinerary/' },
      { label: '3-day Zhangjiajie itinerary', href: '/3-day-zhangjiajie-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get my personalised Dali itinerary', href: '/#trip-plan' },
    ],
    sources: daliGuide.sourceLinks.map(([label, href]) => ({ label, href })),
  },
  'china-golden-week-2026-travel-guide': guideFromArticle(goldenWeekGuide, '/china-golden-week-2026-travel-guide/', 'Get my Golden Week China itinerary', [
    { label: 'Best time to visit China', href: '/best-time-to-visit-china/' },
    { label: 'China train travel guide', href: '/china-train-travel-guide/' },
    { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
    { label: 'China travel budget', href: '/china-travel-budget/' },
    { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
    { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
    { label: 'First trip to China', href: '/first-trip-to-china/' },
    { label: 'Get my Golden Week China itinerary', href: '/#trip-plan' },
  ]),
  'great-wall-of-china-day-trip-from-beijing': guideFromArticle(greatWallGuide, '/great-wall-of-china-day-trip-from-beijing/', 'Get my Beijing itinerary', [
    { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
    { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
    { label: 'China train travel guide', href: '/china-train-travel-guide/' },
    { label: 'China travel safety guide', href: '/china-travel-safety-guide/' },
    { label: 'China Golden Week 2026 travel guide', href: '/china-golden-week-2026-travel-guide/' },
    { label: 'First trip to China', href: '/first-trip-to-china/' },
    { label: 'Get my Beijing itinerary', href: '/#trip-plan' },
  ]),
  'chengdu-panda-base-guide': {
    path: '/chengdu-panda-base-guide/',
    title: pandaBaseGuide.heading,
    intro: '',
    metaTitle: pandaBaseGuide.metaTitle,
    metaDescription: pandaBaseGuide.metaDescription,
    quickAnswer: quickAnswerText(pandaBaseGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA, no CTA card.
    ctaLabel: 'Get my Chengdu itinerary',
    ctaHref: '/#trip-plan',
    reviewed: pandaBaseGuide.reviewed,
    lastModified: pandaBaseGuide.modified,
    isArticle: true,
    sections: [],
    faqs: pandaBaseGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: '3-day Chengdu itinerary', href: '/3-day-chengdu-itinerary/' }],
    sources: pandaBaseGuide.sources,
  },
  'didi-payment-for-foreigners': {
    path: '/didi-payment-for-foreigners/',
    title: didiPaymentGuide.heading,
    intro: '',
    metaTitle: didiPaymentGuide.metaTitle,
    metaDescription: didiPaymentGuide.metaDescription,
    quickAnswer: quickAnswerText(didiPaymentGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); these fields feed the schema.
    ctaLabel: didiPaymentGuide.cta.label,
    ctaHref: didiPaymentGuide.cta.href,
    reviewed: didiPaymentGuide.reviewed,
    lastModified: didiPaymentGuide.modified,
    isArticle: true,
    sections: [],
    faqs: didiPaymentGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'How to Use DiDi in China as a Foreigner', href: '/didi-in-china-for-foreigners/' }],
    sources: didiPaymentGuide.sources,
  },
  'beijing-airport-to-city-guide': guideFromArticle(beijingAirportGuide, '/beijing-airport-to-city-guide/', 'Get my Beijing itinerary', [
    { label: 'China Airport Arrival Guide', href: '/china-airport-arrival-guide/' },
    { label: 'DiDi Payment for Foreigners', href: '/didi-payment-for-foreigners/' },
    { label: 'China Metro Guide', href: '/china-metro-guide/' },
    { label: '3 Day Beijing Itinerary', href: '/3-day-beijing-itinerary/' },
    { label: 'China Esim Internet Guide', href: '/china-esim-internet-guide/' },
    { label: 'Get my free China itinerary', href: '/#trip-plan' },
  ]),
  'amap-vs-google-maps-china': {
    path: '/amap-vs-google-maps-china/',
    title: mapsComparisonGuide.heading,
    intro: '',
    metaTitle: mapsComparisonGuide.metaTitle,
    metaDescription: mapsComparisonGuide.metaDescription,
    quickAnswer: quickAnswerText(mapsComparisonGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA as well as the gig card.
    ctaLabel: 'Get my China itinerary',
    ctaHref: '/#trip-plan',
    reviewed: mapsComparisonGuide.reviewed,
    lastModified: mapsComparisonGuide.modified,
    isArticle: true,
    sections: [],
    faqs: mapsComparisonGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'Amap in English', href: '/amap-english-mode-guide-2026/' }],
    sources: mapsComparisonGuide.sources,
  },
  'best-time-to-visit-china': {
    path: '/best-time-to-visit-china/',
    title: 'Best Time to Visit China: Weather and Crowds by Month (2026)',
    intro:
      'A month-by-month planning guide for choosing China travel dates around regional weather, public-holiday crowds, prices, and the route you actually want.',
    metaTitle: 'Best Time to Visit China: Month-by-Month Guide (2026)',
    metaDescription:
      'For a classic Beijing, Xi\'an and Shanghai trip, April to May and September to October are useful starting windows. Compare regions, weather and crowds.',
    quickAnswer:
      'For a classic first trip through Beijing, Xi\'an, and Shanghai, late spring and autumn usually offer the easiest balance of outdoor sightseeing and manageable temperatures. April to May and September to October are useful starting windows, but avoid assuming the whole country shares one climate and check the exact public-holiday dates before booking. Northern China, the humid east and south, high-altitude western regions, and tropical Hainan can need completely different timing. Choose the route first, then compare city-level climate, current forecasts, weather warnings, holiday crowds, and live prices for your exact dates.',
    ctaLabel: 'Get my itinerary for the right season',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    isArticle: true,
    sections: [
      {
        title: 'The best season depends on your route',
        table: {
          headers: ['Season', 'Often works well for', 'Main trade-offs'],
          rows: [
            ['Spring: March–May', 'Beijing, Xi\'an, Shanghai, gardens, walking, multi-city first trips', 'Fast weather changes, rain in some regions, northern wind or dust, early-May crowds'],
            ['Summer: June–August', 'High-altitude routes, school-holiday travel, long daylight, some mountain regions', 'Heat, humidity, heavy rain, flooding, typhoons in affected coastal areas, larger crowds'],
            ['Autumn: September–November', 'Classic city routes, walking, northern landscapes, photography', 'Early-October holiday demand, shorter days later in the season, rapid cooling in the north'],
            ['Winter: December–February', 'Harbin, snow, lower-season city travel, southern escapes', 'Cold in the north, limited daylight, some seasonal closures, Spring Festival transport demand'],
          ],
        },
        items: [
          'There is no single nationwide best month. China spans tropical, temperate, arid, monsoon, mountain, and high-altitude environments.',
          'A comfortable Beijing week can coincide with very different rain, heat, or altitude conditions elsewhere, so compare every overnight stop rather than one national average.',
          'Use climate patterns for the first decision, then switch to official short-range forecasts and warnings close to departure.',
        ],
      },
      {
        title: 'China month by month',
        table: {
          headers: ['Month', 'Where it can work', 'What to plan around'],
          rows: [
            ['January', 'Harbin snow trips, Yunnan, Hainan, quieter major cities', 'Severe cold in the north, winter daylight, ice, holiday dates'],
            ['February', 'Winter culture, southern routes, selected city trips', 'Spring Festival crowds and closures vary by lunar calendar'],
            ['March', 'Yunnan, southern and eastern city trips, early spring routes', 'Unstable temperatures, rain, wind, possible northern dust'],
            ['April', 'Beijing–Xi\'an–Shanghai, gardens, walking, many classic routes', 'Cool mornings, spring rain, Qingming travel demand'],
            ['May', 'Northern and central routes, mountains before peak summer heat', 'Early-May public-holiday demand, rising heat and rain later'],
            ['June', 'Highlands, some mountain routes, early-summer travel', 'Heat, humidity, rainy seasons, exam and school-calendar effects'],
            ['July', 'Tibet and some high-altitude or northern routes', 'Peak heat, heavy rain, flooding, school holidays, strong demand'],
            ['August', 'Highlands, grasslands, family travel', 'Heat, rain, typhoon disruption in affected coastal regions, crowds'],
            ['September', 'Classic multi-city routes, northern and western scenery', 'Residual heat or rain in some regions; check Mid-Autumn dates'],
            ['October', 'Beijing, Xi\'an, Shanghai, many scenic routes', 'National Day holiday demand at the start of the month; cooling later'],
            ['November', 'Major cities, Yunnan, some southern routes', 'Shorter days, colder north, seasonal change and dry conditions'],
            ['December', 'Harbin season, southern cities, lower-season urban travel', 'Cold, ice, reduced daylight, winter attraction schedules'],
          ],
        },
        items: [
          'This table is a planning screen, not a forecast. Conditions vary by year, city, elevation, and the exact week.',
          'Do not buy non-refundable transport solely because a month is described as “best” online. Check the route and live conditions first.',
        ],
      },
      {
        title: 'Choose timing by region',
        table: {
          headers: ['Region or route', 'Useful starting window', 'Important constraint'],
          rows: [
            ['Beijing and northern China', 'April–May or September–October', 'Winter cold, summer heat and rain, wind or dust, holiday crowds'],
            ['Shanghai, Hangzhou, and eastern China', 'Spring or autumn', 'Humidity, plum-rain periods, summer heat, coastal storms'],
            ['Xi\'an and central routes', 'Spring or autumn', 'Hot summers, cold winters, outdoor walking load'],
            ['Chengdu and Sichuan Basin', 'Spring or autumn for many city routes', 'Cloud, humidity, rain, mountain conditions outside the city'],
            ['Guilin and Yangshuo', 'Spring or autumn, depending on the experience', 'Rain, river conditions, heat, visibility, outdoor activity safety'],
            ['Yunnan', 'Route-specific across much of the year', 'Elevation, large day–night temperature range, regional rainy season'],
            ['Tibet and high-altitude west', 'Specialist route and season planning', 'Altitude health, permits where applicable, snow, road and flight disruption'],
            ['Guangdong, Hainan, and the far south', 'Cooler months for many visitors', 'Summer heat, humidity, rain, and tropical-cyclone risk'],
          ],
        },
        items: [
          'A multi-region itinerary inherits the hardest weather constraint. The best dates for Shanghai do not automatically make a Tibet or Hainan extension sensible.',
          'For mountains, river cruises, hiking, cycling, or high altitude, check the operator, local authority, forecast, and safety notices rather than using a national season label.',
        ],
      },
      {
        title: 'Spring: the flexible first-trip season',
        items: [
          'Spring can work well for the classic Beijing–Xi\'an–Shanghai route because much of the sightseeing is outdoors and summer heat has not fully arrived.',
          'March may still feel wintry in northern cities while southern and eastern regions move into wetter conditions. Pack layers instead of assuming uniform mild weather.',
          'April is a strong general planning month, but reservations, weekends, Qingming travel, blossoms, and local events can still change prices and crowds.',
          'May becomes warmer and wetter in many places. Check the official early-May holiday arrangement before choosing transport or attraction dates.',
        ],
      },
      {
        title: 'Summer: possible, but build weather resilience',
        items: [
          'Summer is not automatically a bad time, especially when school holidays or high-altitude destinations determine the trip, but the itinerary needs more recovery and indoor alternatives.',
          'Heat and humidity can reduce realistic walking time. Plan one main outdoor anchor, start earlier, carry water, and protect the hottest part of the day.',
          'Heavy rain can affect urban transport, mountain access, rivers, flights, and trains. Coastal routes may also face tropical-cyclone disruption.',
          'China Meteorological Administration describes official forecasting and warnings for high-impact hazards including typhoons, heavy rain, severe convection, high temperatures, floods, and geological risks.',
          'Use refundable or changeable bookings where disruption would damage the whole route, and keep an indoor backup for every weather-sensitive day.',
        ],
      },
      {
        title: 'Autumn: excellent weather, but watch the calendar',
        items: [
          'September and October often suit classic city routes, walking, and northern scenery, but the first part of autumn can remain hot or wet in some southern and eastern regions.',
          'The National Day holiday period around early October can sharply increase domestic travel demand, accommodation prices, attraction crowds, and rail-ticket competition.',
          'Late October and November may be quieter, but northern destinations cool quickly and daylight shortens.',
          'Autumn colour timing is local and weather-dependent. Do not build a non-refundable trip around a single predicted foliage date.',
        ],
      },
      {
        title: 'Winter: lower-season value or a snow-focused trip',
        items: [
          'Winter can be rewarding for Harbin, snow experiences, museums, food, and quieter urban travel, provided you plan for cold, ice, and shorter daylight.',
          'Southern destinations such as parts of Yunnan, Guangdong, Guangxi, Fujian, and Hainan may be more comfortable than northern cities, but weather still differs by elevation and coast.',
          'Outdoor sites may operate shorter schedules or close sections in poor conditions. Verify the official opening information for each key attraction.',
          'Spring Festival dates move with the lunar calendar and can transform transport demand, business hours, hotel availability, and family travel patterns. Check the official annual schedule before booking.',
        ],
      },
      {
        title: 'Public holidays can matter more than the weather',
        items: [
          'Before paying, check the State Council\'s official holiday arrangement for your travel year. Compensatory working days and the exact break length can change annually.',
          'The highest-impact periods for many first-time routes include Spring Festival, the early-May Labor Day break, and the National Day holiday period around early October.',
          'Holiday travel is still possible, but reserve intercity transport, hotels, and capacity-controlled attractions early and expect more queueing and less flexibility.',
          'A date just outside a peak period can be more valuable than a theoretically perfect weather week inside it.',
        ],
      },
      {
        title: 'A practical booking timeline',
        ordered: true,
        items: [
          'Choose the regions and non-negotiable experiences before choosing the month.',
          'Check visa or visa-free eligibility, passport validity, permitted route, and entry conditions.',
          'Compare city-level climate patterns and the official annual public-holiday calendar.',
          'Price open-jaw international flights, hotels, and domestic transport for at least two nearby date windows.',
          'Choose refundable or changeable terms for weather-sensitive routes and peak periods.',
          'Reserve capacity-controlled attractions and intercity transport when their official sales windows open.',
          'Review official forecasts and warnings before departure and again before each mountain, river, coastal, or long-distance travel day.',
        ],
      },
      {
        title: 'Common timing mistakes',
        items: [
          'Using one city\'s monthly temperature to plan a route across several climate zones.',
          'Calling April, May, September, or October “perfect” without checking the exact holiday calendar.',
          'Treating climate averages as a guarantee for a particular week.',
          'Planning every day outdoors with no heat, rain, cold, or air-quality alternative.',
          'Booking mountains, river activities, or high-altitude travel without local safety and operator checks.',
          'Choosing the cheapest flight dates before comparing hotel prices, train availability, and attraction closures.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the best month to visit China?',
        answer:
          'For a classic Beijing, Xi\'an, and Shanghai trip, April, May, September, and October are useful months to compare. The best exact week depends on public holidays, current weather, prices, and the regions in your route.',
      },
      {
        question: 'Is spring or autumn better for China?',
        answer:
          'Both can work well. Spring brings changing temperatures and rain patterns, while autumn can bring comfortable city weather but heavy early-October demand. Choose using your route and exact dates rather than the season name alone.',
      },
      {
        question: 'When is the cheapest time to travel to China?',
        answer:
          'Lower prices are more likely outside major public holidays, school breaks, major events, and the most popular weather windows. Compare live flights and hotels because low season differs by city and experience.',
      },
      {
        question: 'Should I avoid China during Golden Week?',
        answer:
          'If you have flexible dates, avoiding the National Day holiday period around early October usually reduces competition for trains, hotels, and attractions. If you must travel then, book early and simplify the route.',
      },
      {
        question: 'Is summer too hot for a China trip?',
        answer:
          'Not always, but many eastern, central, and southern routes can be hot and humid, with heavy rain and possible coastal storm disruption. Use shorter outdoor blocks, indoor alternatives, weather warnings, and flexible bookings.',
      },
      {
        question: 'Can I visit China in winter?',
        answer:
          'Yes. Winter suits Harbin, snow experiences, museums, quieter city travel, and some southern routes. Plan around cold, ice, daylight, seasonal opening hours, and Spring Festival demand.',
      },
      {
        question: 'Can ChinaEase Buddy choose dates for my itinerary?',
        answer:
          'Yes. Share your possible dates, destinations, interests, group, pace, weather tolerance, and budget so the route can be matched to the season and practical constraints.',
      },
    ],
    related: [
      { label: '3-day Beijing itinerary', href: '/3-day-beijing-itinerary/' },
      { label: '3-day Shanghai itinerary', href: '/3-day-shanghai-itinerary/' },
      { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' },
      { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
      { label: 'China travel budget', href: '/china-travel-budget/' },
      { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' },
      { label: 'China travel safety guide', href: '/china-travel-safety-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a personalised China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'China Meteorological Administration', href: 'https://www.cma.gov.cn/en/' },
      { label: 'National Meteorological Centre forecasts and warnings', href: 'https://www.nmc.cn/publish/forecast.html' },
      { label: 'State Council policy portal', href: 'https://english.www.gov.cn/policies/' },
      { label: 'China government Visit China portal', href: 'https://english.www.gov.cn/services/visitchina/' },
    ],
  },
  'china-esim-internet-guide': {
    path: '/china-esim-internet-guide/',
    title: 'How to Get an eSIM in China (2026 Internet Guide)',
    intro:
      'A practical, provider-neutral guide to choosing, installing, activating, and troubleshooting mobile data for a trip to mainland China.',
    metaTitle: 'China eSIM for Tourists (2026): Buy, Install & Get Online',
    metaDescription:
      'China travel eSIM: check your phone is unlocked, buy a plan covering mainland China, install it on Wi-Fi before you fly, then follow the activation steps.',
    quickAnswer:
      'To get an eSIM for China, first confirm that your phone is carrier-unlocked and eSIM-compatible. Choose a travel plan that explicitly covers mainland China, buy and install it on reliable Wi-Fi before your flight, then follow the provider\'s activation timing and select it for mobile data after landing. Do not assume every China eSIM gives access to Google or other restricted services: routing, phone-number support, hotspot rules, speed limits, and activation policies differ by plan.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'October 20, 2026',
    lastModified: '2026-10-20',
    isArticle: true,
    sections: [
      {
        title: 'How to get an eSIM for China',
        ordered: true,
        items: [
          'Check that your exact phone model supports eSIM and is not locked to your home carrier.',
          'Compare provider plans that explicitly include mainland China, the trip dates, data allowance, network coverage, hotspot rules, and support channel you need.',
          'Confirm whether the plan is data-only and whether it supports the international services you rely on; do not infer either point from the word eSIM.',
          'Buy and install the plan on reliable Wi-Fi before departure, then save its QR code, order number, APN details, and setup instructions offline.',
          'After landing, enable the travel line and any provider-required data roaming, select it for mobile data, and test maps, messaging, and a normal website.',
        ],
      },
      {
        title: 'Which connection option fits your trip?',
        table: {
          headers: ['Option', 'Best for', 'Main trade-off'],
          rows: [
            ['Travel eSIM', 'Most short trips with an unlocked, compatible phone', 'Usually data-only; routing and plan rules vary'],
            ['Home-carrier roaming', 'Maximum simplicity or a very short stay', 'Can be expensive; check the allowance and international-app access'],
            ['Mainland local SIM', 'Travelers who need a Chinese phone number', 'Purchase and registration vary; local internet restrictions still apply'],
          ],
        },
        items: [
          'There is no single best option for everyone. Compare total cost, local-number needs, coverage, hotspot support, and access to the services you actually use.',
        ],
      },
      {
        title: 'Travel eSIM or mainland carrier eSIM?',
        items: [
          'An international travel eSIM and a mainland carrier eSIM are separate products. Check mainland China coverage, whether the travel plan is data-only, and when its validity starts.',
          'For a mainland carrier eSIM, Apple requires an eligible iPhone model and a visit to a carrier store. Apple says an iPhone purchased outside mainland China cannot use an eSIM from a mainland carrier. A travel eSIM from an international provider follows that provider’s compatibility and activation rules instead.',
          'iPhone eSIM capability can differ by exact model and country of purchase. Check Apple’s current model guidance before paying for a non-refundable plan.',
        ],
      },
      {
        title: 'Check these details before buying an eSIM',
        items: [
          'Your phone supports eSIM and is carrier-unlocked. On iPhone, Carrier Lock should show No SIM Restrictions.',
          'The plan explicitly covers mainland China, not only Hong Kong or Macao.',
          'When validity begins: at purchase, installation, or first connection to a supported network.',
          'Whether the plan is data-only or includes calls, SMS, or a phone number.',
          'The high-speed data allowance, fair-use or throttling rules, hotspot support, top-up options, and refund policy.',
          'Whether the provider explicitly says that your required international apps work on that exact plan. Do not infer this from the word eSIM alone.',
        ],
      },
      {
        title: 'Install it before your flight',
        ordered: true,
        items: [
          'Buy the plan from a provider you can contact if setup fails, then save the order number and support channel.',
          'Connect to reliable Wi-Fi and install the eSIM using the provider app, QR code, or manual activation details.',
          'Label the new line China Travel so you do not confuse it with your home SIM.',
          'Keep the QR code or manual installation details available on another device or offline document.',
          'Follow the provider\'s instructions about whether to leave the line off until arrival. Installation and plan activation are not always the same event.',
          'Do not delete an installed eSIM while troubleshooting unless the provider tells you to; some activation codes can be used only once.',
        ],
      },
      {
        title: 'Settings to use after landing',
        ordered: true,
        items: [
          'Turn on the travel eSIM line and select it as the cellular or mobile data line.',
          'Enable data roaming for the travel eSIM if your provider requires it; most international travel plans connect through roaming partners.',
          'Turn off data roaming for your home line and disable cellular data switching to reduce the risk of unexpected charges.',
          'Wait several minutes for network registration, then test a normal website, your map app, and your messaging app.',
          'Keep your home line active only if you need calls or verification SMS, and check what your home carrier charges for receiving or answering them abroad.',
        ],
      },
      {
        title: 'Internet access in mainland China',
        items: [
          'Ordinary mainland mobile networks and Wi-Fi are subject to local internet controls. Google, Facebook, YouTube, X, and some other services are blocked or restricted.',
          'Some international roaming and travel eSIM plans route data outside mainland China, but this is provider- and plan-specific. Confirm the claim on the exact product page and keep a backup.',
          'A travel eSIM is not automatically a VPN. Do not assume unrestricted access unless the provider explicitly supports it.',
          'If you consider a VPN or similar service, check current rules. UK travel advice notes that online services such as VPNs need to be licensed by the Chinese government.',
          'Download essential local apps, offline maps, hotel addresses, tickets, and translation phrases before departure even if your plan promises international access.',
        ],
      },
      {
        title: 'How much data should you buy?',
        table: {
          headers: ['Usage', 'Rough guide', 'Typical activities'],
          rows: [
            ['Light', '3–5 GB for a short trip', 'Messaging, payments, maps, occasional browsing'],
            ['Typical', 'Around 10 GB for 1–2 weeks', 'Frequent maps, social posting, translation, ride-hailing'],
            ['Heavy', '20 GB or more', 'Video, hotspot sharing, cloud backup, frequent calls'],
          ],
        },
        items: [
          'Turn off automatic photo backup, app updates, and high-resolution video on cellular data if your allowance is limited.',
          'Unlimited plans may reduce speed after a daily or total threshold, so read the fair-use terms rather than relying on the word unlimited.',
        ],
      },
      {
        title: 'If the eSIM has no signal or data',
        ordered: true,
        items: [
          'Confirm the eSIM line is turned on and selected for mobile data.',
          'Check that data roaming is enabled on the travel line and disabled on the home line.',
          'Toggle airplane mode for about 30 seconds, then restart the phone if needed.',
          'Use automatic network selection first; choose a partner network manually only if the provider lists one.',
          'Check the provider\'s APN instructions, activation status, validity dates, and remaining high-speed data.',
          'Contact the eSIM provider on airport or hotel Wi-Fi before deleting the plan.',
        ],
      },
      {
        title: 'Keep an offline backup',
        items: [
          'Screenshot your hotel name, address, and phone number in Chinese.',
          'Save flight and train details, your first airport transfer, and emergency contacts offline.',
          'Download an offline translation pack and the map area for your first destination.',
          'Keep a payment card, some RMB cash, and key Chinese phrases available in case both data and QR payments are temporarily unavailable.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I get an eSIM in China?',
        answer:
          'Buy a travel eSIM that explicitly covers mainland China before departure, after confirming that your phone is unlocked and eSIM-compatible. Install it on reliable Wi-Fi, follow the provider\'s activation timing, and save the QR code and setup instructions offline.',
      },
      {
        question: 'Does eSIM work in mainland China?',
        answer:
          'A travel eSIM can work if your exact phone supports eSIM, is unlocked, and the plan covers mainland China. A mainland carrier eSIM is a different product with its own device and in-store activation requirements. Check both before buying.',
      },
      {
        question: 'Can I get a mainland carrier eSIM on an iPhone bought abroad?',
        answer:
          'Apple says no: an iPhone purchased outside mainland China cannot use an eSIM from a mainland carrier. An international travel eSIM is a separate product; check your exact phone and plan before buying. If you need a +86 number, compare a registered physical SIM.',
      },
      {
        question: 'Will a China eSIM let me use Google, WhatsApp, or Instagram?',
        answer:
          'Sometimes, but not because it is an eSIM. Access depends on how that specific provider routes traffic. Confirm each required service with the provider before purchase and keep an offline backup.',
      },
      {
        question: 'Should I install the eSIM before arriving in China?',
        answer:
          'Usually yes. Install it on reliable Wi-Fi before departure, but follow the provider\'s instructions about when validity starts and whether the line should remain off until arrival.',
      },
      {
        question: 'Do I need to turn on data roaming?',
        answer:
          'Many travel eSIMs require data roaming because they connect through partner networks. Enable it only for the travel line and follow the provider\'s setup instructions.',
      },
      {
        question: 'Will I get a Chinese phone number?',
        answer:
          'Most short-term travel eSIMs are data-only. Check the plan details if you need traditional calls, SMS, or a local number.',
      },
      {
        question: 'What should I do if the eSIM does not connect?',
        answer:
          'Check the selected data line, roaming setting, network selection, APN, activation status, validity, and remaining data. Contact the provider before deleting the eSIM.',
      },
    ],
    related: [
      { label: 'Physical China SIM card with a passport', href: '/china-sim-card-for-foreigners/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'Apple: using eSIM with iPhone in China mainland', href: 'https://support.apple.com/en-us/123879' },
      {
        label: 'Apple: use eSIM while travelling internationally',
        href: 'https://support.apple.com/en-us/118227',
      },
      {
        label: 'Apple: carriers and worldwide eSIM service providers',
        href: 'https://support.apple.com/en-us/101569',
      },
      {
        label: 'UK government China travel advice: internet access',
        href: 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access',
      },
    ],
  },
  'china-sim-card-for-foreigners': {
    path: '/china-sim-card-for-foreigners/',
    title: 'China SIM Card for Foreigners (2026): How to Buy & Use Without Chinese ID',
    intro:
      'A practical guide to choosing an eSIM or physical China SIM, registering with a passport, comparing mainland carriers, and keeping mobile data active during your trip.',
    metaTitle: 'China SIM Card for Tourists (2026): Passport Guide',
    metaDescription:
      'Tourists can buy a China SIM card with a passport at an official carrier outlet. Check airport counters, phone compatibility and the plan before you pay.',
    quickAnswer:
      'Foreign visitors can buy a physical China SIM card at an official staffed carrier outlet using a valid passport; a Chinese national ID is not normally required. Confirm that your phone is unlocked, ask the carrier to complete real-name registration, and test the plan before leaving the counter. Beijing Capital, Beijing Daxing and Shanghai Pudong publish airport SIM services, but check your terminal, opening hours and stock before relying on an airport purchase. A travel eSIM or home roaming can be an arrival backup if your phone and plan support it.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'October 19, 2026',
    lastModified: '2026-10-19',
    isArticle: true,
    featuredFaqCount: 3,
    sections: [
      {
        title: 'Buy a physical China SIM with a passport',
        table: {
          headers: ['Where', 'What to bring or verify', 'If unavailable'],
          rows: [
            ['Official China Mobile, China Unicom or China Telecom outlet', 'Original passport, unlocked phone, plan details and total price', 'Try another staffed branch or use roaming until one opens'],
            ['Beijing Capital or Daxing airport service counter', 'Official Beijing guidance lists airport SIM services; confirm the exact terminal, counter and hours', 'Use an official city outlet after arrival'],
            ['Shanghai Pudong international traveler service center', 'Official Shanghai guidance describes short-term China Telecom SIM service with passport ID', 'Keep a travel eSIM or roaming backup'],
          ],
        },
        items: [
          'Ask whether the plan includes a Chinese +86 number, voice and SMS, how much high-speed data it contains, when it expires and how to top up. Do not infer the price or included service from another airport or city.',
          'Have the staff complete identity registration and activate the SIM, then test mobile data and a required SMS before leaving. An airport service listing does not guarantee your arrival-time availability or your phone model compatibility.',
        ],
      },
      {
        title: 'eSIM vs physical SIM at the airport',
        table: {
          headers: ['Option', 'Useful when', 'Important limitation'],
          rows: [
            ['Travel eSIM', 'You want data ready soon after landing', 'Requires an unlocked, eSIM-compatible phone and is often data-only'],
            ['Physical mainland SIM', 'You need a Chinese number for calls, SMS, or local services', 'Requires passport registration and remains subject to mainland internet controls'],
            ['Home-carrier roaming', 'You need the simplest arrival backup', 'Can cost more; allowance and international-service access vary by carrier'],
          ],
        },
        items: [
          'Install a travel eSIM before departure on reliable Wi-Fi, but follow the provider\'s instructions about when validity begins. Do not assume every eSIM includes a Chinese phone number or unrestricted access to international services.',
          'For a physical SIM, use an official staffed carrier counter or store. Avoid an unregistered SIM sold informally because real-name registration, ownership, support, and replacement may be unclear.',
          'Dual-SIM travelers can often keep the home line active for verification SMS while using the China line for data. Disable home-line data roaming unless your home plan explicitly includes it.',
        ],
      },
      {
        title: 'China Mobile, China Unicom, and China Telecom compared',
        table: {
          headers: ['Carrier', 'Practical strength', 'Check before paying'],
          rows: [
            ['China Mobile', 'Large nationwide network and broad retail presence', 'Confirm your phone supports the plan\'s required network bands'],
            ['China Unicom', 'Often considered by visitors using international handsets', 'Verify coverage for rural destinations and the exact prepaid plan'],
            ['China Telecom', 'Another major nationwide option with city and regional coverage', 'Device and network compatibility can vary, especially on older imported phones'],
          ],
        },
        items: [
          'Coverage differs by destination, building, route, and device. Ask the counter to verify your phone model and test mobile data before you leave.',
          'Compare the included high-speed data, domestic calls, validity, renewal rules, hotspot support, and what happens when the allowance is used.',
          'English support varies by branch. Keep your destination list in Chinese and ask the hotel which carrier works reliably in any rural area on your route.',
        ],
      },
      {
        title: 'How to buy at an official carrier counter',
        ordered: true,
        items: [
          'At an airport, check the official service directory and ask the information desk for a staffed SIM counter. Beijing Capital, Beijing Daxing and Shanghai Pudong publish visitor services; for other airports, confirm a counter before travel. Locations, opening hours and stock can change.',
          'Present the original passport you used to enter China. The carrier may photograph or scan the document and your face to complete legally required real-name registration.',
          'Show the trip length, cities, expected data use, and whether you need a Chinese number, voice calls, SMS, hotspot use, or only mobile data.',
          'Ask the staff to confirm the total price, included allowance, validity, top-up method, and whether the number expires or enters a grace period after the plan ends.',
          'Insert or activate the SIM at the counter. Test data, one website, maps, and any required SMS before leaving. Save the carrier receipt, plan name, phone number, and support number.',
          'If the airport counter is closed or unavailable, keep roaming or eSIM data active and visit an official staffed carrier store in the city with your passport.',
        ],
      },
      {
        title: 'How to top up with Alipay',
        ordered: true,
        items: [
          'Open Alipay and search for mobile top-up or phone recharge, then enter the Chinese mobile number carefully.',
          'Confirm the carrier and number shown before choosing an amount. A mistaken top-up may be difficult to reverse.',
          'Review the funding source and final amount. An international card linked to Alipay may not support every recharge product or transaction.',
          'Keep the carrier app, official store, staffed counter, or another supported payment method as a backup. Save the top-up receipt until the balance appears.',
          'Do not share a payment PIN, SMS code, or passport image with an informal seller offering to recharge the number.',
        ],
      },
      {
        title: 'VPN, Alipay, and WeChat Pay: what to prepare',
        items: [
          'Ordinary mainland SIM data is subject to local internet controls. Some international roaming and travel eSIM plans route traffic differently, but this depends on the exact provider and plan.',
          'If you intend to use a VPN or similar service, check current rules and install only a trusted, legally compliant service before departure. A China SIM does not itself provide unrestricted internet access.',
          'Set up Alipay and WeChat Pay before departure while you can receive verification messages from your usual number. Linking an international card and passing identity checks are not guaranteed for every user or transaction.',
          'Alipay and WeChat Pay do not normally require a VPN for domestic payment functions. Keep a physical card and some RMB cash because wallet, card issuer, merchant, or connectivity failures can still occur.',
          'Save the hotel address, first transfer, tickets, essential contacts, and key Chinese phrases offline so one connection or payment failure does not block the arrival plan.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners buy an eSIM for China?',
        answer:
          'Yes. Foreign visitors can buy a travel eSIM that covers mainland China if their phone is unlocked and eSIM-compatible. Check whether the plan is data-only, when validity starts, which network it uses, and whether required international services work. Install it before departure and keep the activation details offline.',
      },
      {
        question: 'Do I need a Chinese ID to buy a SIM card in China?',
        answer:
          'A foreign visitor normally uses an original passport instead of a Chinese national ID at an official staffed carrier counter. The carrier must complete real-name registration and may scan the passport and take a photo. Requirements, available prepaid plans, airport stock, and opening hours can vary by location.',
      },
      {
        question: 'Can I keep my existing phone number while using a China SIM?',
        answer:
          'Usually yes if your phone supports dual SIM or eSIM plus a physical SIM. Keep the home line active for important verification messages, select the China line for mobile data, and disable home-line data roaming unless included. Check whether receiving calls or texts on the home line creates charges.',
      },
    ],
    related: [
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'China eSIM and internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
    ],
    sources: [
      { label: 'China government: SIM cards for foreigners', href: 'https://english.www.gov.cn/2025special/bizexpatsinchina2025' },
      { label: 'Beijing government: SIM card application locations', href: 'https://english.beijing.gov.cn/quickguideservices/purchasingsimcards/' },
      { label: 'Shanghai government: Pudong international traveler services', href: 'https://english.shanghai.gov.cn/en-Latest-WhatsNew/20260424/88cde5e96ef242daa534102069450a03.html' },
      { label: 'China Mobile official website', href: 'https://www.10086.cn/' },
      { label: 'China Unicom official website', href: 'https://www.10010.com/' },
      { label: 'China Telecom official website', href: 'https://www.189.cn/' },
      { label: 'UK government China travel advice: internet access', href: 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access' },
    ],
  },
  'china-240-hour-visa-free-transit-2026': {
    ...guideFromArticle(
      transit240Guide,
      '/china-240-hour-visa-free-transit-2026/',
      'Check my visa-free transit itinerary',
      [
        { label: '7-day China itinerary', href: '/7-day-china-itinerary/' },
        { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
        { label: '14-day China itinerary', href: '/14-day-china-itinerary/' },
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
        { label: '3-day Suzhou itinerary', href: '/3-day-suzhou-itinerary/' },
        { label: '3-day Nanjing itinerary', href: '/3-day-nanjing-itinerary/' },
        { label: '3-day Dali itinerary', href: '/3-day-dali-itinerary/' },
        { label: 'First-time China itinerary guide', href: '/china-itinerary-first-time-7-10-14-days/' },
        { label: 'China SIM card for foreigners', href: '/china-sim-card-for-foreigners/' },
        { label: 'China payment guide', href: '/china-payment-guide/' },
      ],
    ),
    featuredFaqCount: 3,
    ctaBeforeFeaturedFaqs: true,
  },
  'alipay-for-foreigners': {
    path: '/alipay-for-foreigners/',
    title: 'How to Use Alipay in China as a Foreigner (2026)',
    intro: 'A practical setup, payment, and troubleshooting guide for first-time visitors using an international bank card.',
    metaTitle: 'Alipay for Foreigners: Setup & Payment Guide (2026)',
    metaDescription:
      'Set up Alipay for China: register with an overseas number, link an eligible international card, pay by QR code, and fix common payment failures.',
    quickAnswer:
      'Yes. Foreign visitors can register Alipay with an overseas mobile number and add an eligible international debit or credit card for everyday purchases in mainland China. You do not normally need a Chinese bank account, but card-issuer approval, identity checks, merchant support, and payment limits can vary. Set it up before your flight and keep a second payment method.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 16, 2026',
    lastModified: '2026-09-16',
    isArticle: true,
    sections: [
      {
        title: 'What you need before setup',
        items: [
          'A mobile number that can receive verification messages while you are abroad.',
          'An eligible credit or debit card issued outside the Chinese mainland.',
          'Your passport details if Alipay asks you to complete identity verification.',
          'Access to your bank app, SMS, or other card-verification method.',
          'A backup card and a small amount of RMB cash in case one payment route fails.',
        ],
      },
      {
        title: 'Set up Alipay before your flight',
        ordered: true,
        items: [
          'Download the standard Alipay app from your official app store. Do not choose AlipayHK or another regional version.',
          'Register with your home-country mobile number and enter the verification code.',
          'Choose the International Version if Alipay offers that option after registration.',
          'Tap Add Now or open Bank Cards, then enter or scan your international card details.',
          'Follow the in-app prompts for identity and card verification. Make sure your name and document details match.',
          'Keep access to your original phone number and bank verification method during the trip.',
        ],
      },
      {
        title: 'How to pay at a merchant',
        table: {
          headers: ['Payment situation', 'What to do'],
          rows: [
            ['The merchant scans you', 'Open Alipay, show your payment code, and let the merchant scan it.'],
            ['You scan the merchant', 'Use Scan, check the merchant name, enter the amount if needed, and confirm payment.'],
            ['The QR code is a personal transfer', 'An international card may not work because person-to-person transfers are not supported. Ask for a merchant payment code or another payment method.'],
          ],
        },
        items: [
          'Check the merchant name and amount before confirming every payment.',
          'Do not let another person take your unlocked phone or enter your payment password.',
        ],
      },
      {
        title: 'What an international card can do',
        items: [
          'Pay for eligible daily purchases in mainland China through Alipay.',
          'Use merchant QR payment flows at shops, restaurants, taxis, and other supported services.',
          'International cards do not support person-to-person transfers, red packets, wealth-management products, insurance, or some other financial services.',
          'Supported networks, limits, verification, and merchant acceptance can change, so treat the card list shown inside Alipay as the current source of truth.',
        ],
      },
      {
        title: 'If your payment fails',
        ordered: true,
        items: [
          'Confirm that the card still appears under Bank Cards and that identity verification is complete.',
          'Check your bank app or SMS for a declined or pending verification request.',
          'Make sure the QR code is for a merchant payment rather than a personal transfer.',
          'Try the other payment flow: show your payment code instead of scanning, or scan the merchant code instead.',
          'Try another eligible card or WeChat Pay if you have already set it up.',
          'Ask the merchant whether a physical card or RMB cash is accepted.',
          'For account-specific problems, use Alipay customer support because ChinaEase Buddy cannot see or change your payment account.',
        ],
      },
      {
        title: 'Fees and exchange rates',
        items: [
          'Review the payment confirmation screen before approving a transaction.',
          'For payments funded by an international bank card, the exchange rate is provided by the card network and issuing bank.',
          'Your card issuer may add a foreign-transaction or currency-conversion fee. Check the final amount on your card statement.',
          'Do not rely on an old blog post for a fixed fee or limit; check the current information shown inside Alipay and by your bank.',
        ],
      },
      {
        title: 'Useful payment phrases',
        items: [
          '可以用支付宝吗？ — Can I pay with Alipay?',
          '请扫我的付款码。 — Please scan my payment code.',
          '支付失败了，可以换一种方式吗？ — My payment failed. Can I pay another way?',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners use Alipay in China?',
        answer:
          'Yes. Overseas visitors can register Alipay and add an eligible international bank card for daily purchases in mainland China. Card-issuer approval, verification, limits, and merchant support can vary.',
      },
      {
        question: 'Do I need a Chinese bank account to use Alipay?',
        answer:
          'No Chinese bank account is normally required when you use an eligible international card issued outside the Chinese mainland.',
      },
      {
        question: 'Can I set up Alipay before arriving in China?',
        answer:
          'Yes. Download the standard Alipay app, register with your overseas mobile number, and try adding your card before your flight so you have time to resolve verification problems.',
      },
      {
        question: 'What if my Alipay payment fails?',
        answer:
          'Check that your card and identity verification are complete, look for a bank approval request, confirm the QR code is a merchant payment rather than a personal transfer, and try another prepared payment method.',
      },
      {
        question: 'Can I transfer money to another person with my international card?',
        answer:
          'Alipay states that international cards do not support person-to-person transfers or red packets. Ask for a merchant payment code or use another suitable payment method.',
      },
      {
        question: 'Should I carry cash in China?',
        answer:
          'Carry a modest amount of RMB as a backup rather than relying on a single app or card. You can also prepare WeChat Pay and a second international card.',
      },
    ],
    related: [
      { label: 'How to pay in China as a foreigner', href: '/china-payment-guide/' },
      { label: 'WeChat Pay for foreigners', href: '/wechat-pay-for-foreigners/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'FAQ', href: '/faq/' },
    ],
    sources: [
      {
        label: 'Alipay+ official guide for paying in the Chinese mainland',
        href: 'https://www.alipayplus.com/pay-in-the-chinese-mainland/',
      },
      {
        label: 'Shanghai government guide to linking international cards to Alipay',
        href: 'https://english.shanghai.gov.cn/en-FAQs-StudyinShanghai/20231211/a58d4c15179f468fb2c5d72b393f1fd4.html',
      },
    ],
  },
  'wechat-pay-for-foreigners': {
    path: '/wechat-pay-for-foreigners/',
    title: 'WeChat Pay for Foreigners: Setup and Payment Guide (2026)',
    intro: 'A practical setup, merchant QR payment, fees, and troubleshooting guide for tourists using an international bank card.',
    metaTitle: 'WeChat Pay for Foreigners (2026): Cards, Fees & Setup',
    metaDescription:
      'Foreigners can use WeChat Pay in China by linking an eligible international card. See how fees work, how to scan merchant QR codes and fix failed payments.',
    quickAnswer:
      'Foreign visitors, including US citizens, may be able to use WeChat Pay in mainland China when the payment feature is available on their account and an eligible international card passes identity, issuer, and transaction checks. Register the standard WeChat app with a mobile number you can access, open the payment or wallet area shown in your version, add the card, and complete any requested verification. Set it up before departure and keep Alipay, a physical card, and some RMB as backups.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'October 8, 2026',
    lastModified: '2026-10-08',
    isArticle: true,
    sections: [
      {
        title: 'Can foreigners use WeChat Pay in China?',
        items: [
          'Eligible foreign visitors can use WeChat Pay for supported merchant purchases after completing the account, identity, card, and issuer checks shown in the app.',
          'A Chinese bank account is not always required for eligible merchant payments funded by a supported international card.',
          'Availability can vary by account, card issuer, merchant, transaction type, app version, and current risk controls.',
          'Personal transfers, red packets, balance functions, and some mini-program payments may remain unavailable even when ordinary merchant payments work.',
        ],
      },
      {
        title: 'What foreigners need to set up WeChat Pay',
        items: [
          'The standard WeChat app from an official app store, rather than a separate regional wallet product.',
          'A mobile number that can receive verification messages while you travel.',
          'An eligible debit or credit card issued outside the Chinese mainland.',
          'Your passport details if identity verification is requested.',
          'Access to your bank app, SMS, or other card-approval method.',
          'Alipay, a physical bank card, and a modest amount of RMB as payment backups.',
        ],
      },
      {
        title: 'Set up WeChat Pay before your flight',
        ordered: true,
        items: [
          'Download the standard WeChat app from your phone\'s official app store and register with a mobile number you can continue to access.',
          'Open Me and look for Services, Pay and Services, or Wallet. The label and location can vary by region, account, and app version.',
          'Choose Wallet or Cards, then add your international card using the details requested in the app.',
          'Complete identity verification exactly as prompted. Make sure your name and passport details match your documents.',
          'Approve any verification request from your card issuer and review the terms, supported uses, limits, and fees shown in the app.',
          'Keep the registered phone number, passport, and bank-verification method available during the trip.',
        ],
      },
      {
        title: 'How to pay by QR code',
        table: {
          headers: ['Payment situation', 'What to do'],
          rows: [
            ['The merchant scans you', 'Open the payment code inside WeChat Pay and let the merchant scan it.'],
            ['You scan the merchant', 'Use Scan, confirm the merchant name, enter the amount if required, and review it before paying.'],
            ['The code is a personal transfer', 'Your international card may not be available. Ask for a merchant code or another payment method.'],
          ],
        },
        items: [
          'Never hand an unlocked phone to a stranger or share a payment password or verification code.',
        ],
      },
      {
        title: 'What may be different with an international card',
        items: [
          'Merchant purchases may be available while person-to-person transfers, red packets, wallet balance functions, or other financial features remain restricted.',
          'Availability depends on the account, card network, issuer, merchant, transaction, and current WeChat Pay rules.',
          'A card that was added successfully can still be declined later by the issuer or payment risk controls.',
          'Use the card and feature information shown inside your account as the current source of truth.',
        ],
      },
      {
        title: 'WeChat Pay cross-border access, Weixin Pay, and regional wallets',
        items: [
          'Weixin Pay is the payment service inside the Weixin or WeChat ecosystem for the Chinese mainland.',
          'For an overseas visitor, cross-border access usually means using an eligible international card or a supported regional wallet for permitted merchant payments; it does not unlock every wallet feature.',
          'Regional products such as WeChat Pay HK follow their own eligibility, funding, and cross-border rules.',
          'Do not assume instructions for a regional wallet match the standard international WeChat account on your phone.',
          'Follow the payment menu and terms shown in your exact app version and region.',
        ],
      },
      {
        title: 'Fees, limits, and exchange rates',
        items: [
          'China\'s current government guide says card brands, payment limits, and charging standards can vary by payment product. Use the current in-app prompt and service agreement for the transaction you are about to approve.',
          'Review the amount, any service fee, and the selected card on the confirmation screen before approving payment.',
          'Your card network and issuing bank may determine the exchange rate and may add a foreign-transaction or currency-conversion fee.',
          'Transaction and account limits can change after verification or risk checks.',
          'Do not rely on an old fixed fee or limit from a blog; check the current in-app notice and your card issuer.',
        ],
      },
      {
        title: 'If WeChat Pay does not work',
        ordered: true,
        items: [
          'Confirm that the payment feature and linked card still appear in your account.',
          'Check whether identity verification or an issuer approval request is incomplete.',
          'Make sure you are paying a merchant rather than trying a personal transfer.',
          'Check your mobile connection and retry only after confirming that the first attempt did not complete.',
          'Try another eligible card, Alipay, a physical card, or RMB cash.',
          'Use WeChat Pay support for account-specific restrictions because ChinaEase Buddy cannot access or change your wallet.',
        ],
      },
      {
        title: 'Useful payment phrases',
        items: [
          '可以用微信支付吗？ — Can I pay with WeChat Pay?',
          '请扫我的付款码。 — Please scan my payment code.',
          '这个是商家收款码吗？ — Is this a merchant payment code?',
          '支付失败了，可以换一种方式吗？ — My payment failed. Can I pay another way?',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners use WeChat Pay in China?',
        answer:
          'Yes, when the payment feature is available on the account and an eligible international card passes identity, issuer, and payment checks. Availability can vary by account and transaction.',
      },
      {
        question: 'Can US citizens use WeChat Pay in China?',
        answer:
          'US citizenship does not by itself prevent access. A US traveler may be able to use an eligible international card for supported merchant payments after completing the account, identity, issuer, and transaction checks shown in WeChat. Availability still varies by account, card, merchant, and payment type.',
      },
      {
        question: 'Does WeChat Pay charge fees for foreign cards?',
        answer:
          'Fees are not safely described by one universal rule. China\'s government guide says charging standards and limits can vary by payment product. Review the fee displayed before approval, the current service agreement, and any foreign-transaction or currency-conversion fee charged separately by your card issuer.',
      },
      {
        question: 'Do I need a Chinese bank account for WeChat Pay?',
        answer:
          'Foreign visitors may be able to fund eligible merchant payments with a supported international card, so a Chinese bank account is not always required. Follow the options shown in your account.',
      },
      {
        question: 'Is Weixin Pay the same as WeChat Pay for foreign visitors?',
        answer:
          'Weixin Pay is the mainland payment service within the Weixin and WeChat ecosystem. The name and menu shown can depend on your app version, account region, and product. Regional wallets such as WeChat Pay HK have separate eligibility and cross-border rules.',
      },
      {
        question: 'Can I set up WeChat Pay before arriving in China?',
        answer:
          'Yes. Install the standard WeChat app, register, look for the payment or wallet area, add your card, and complete verification before departure if the feature is available.',
      },
      {
        question: 'Why can I not see Wallet or Pay and Services?',
        answer:
          'Menu names and payment availability can differ by region, account, identity status, and app version. Update the official app and use WeChat support if the payment feature is unavailable.',
      },
      {
        question: 'Can I send money to a person with an international card?',
        answer:
          'Do not assume that you can. Merchant purchases may work while personal transfers, red packets, and balance features remain restricted for an international-card setup.',
      },
      {
        question: 'What should I do if WeChat Pay is declined?',
        answer:
          'Check verification and issuer approval, confirm that the QR code is for a merchant, then use another prepared payment method rather than repeatedly retrying an uncertain transaction.',
      },
      {
        question: 'Should I choose WeChat Pay or Alipay for China?',
        answer:
          'Prepare both if possible. Many first-time visitors use Alipay as the primary wallet and WeChat Pay as a backup, while also carrying a physical card and some RMB.',
      },
    ],
    related: [
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'How to pay in China as a foreigner', href: '/china-payment-guide/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'Tencent: cross-border payment support through Weixin Pay',
        href: 'https://www.tencent.com/tencent-showcases-future-of-finance-at-hong-kong-fintech-week-2025/',
      },
      {
        label: 'WeChat official Google Play listing',
        href: 'https://play.google.com/store/apps/details?id=com.tencent.mm',
      },
      {
        label: 'China government: Guide to Payment Services in China',
        href: 'https://english.www.gov.cn/2025special/bizexpatsinchina2025',
      },
    ],
  },
  'china-payment-guide': {
    path: '/china-payment-guide/',
    title: 'How to Pay in China as a Foreigner',
    intro:
      'A quick-answer guide to paying in China with a foreign card, Alipay, and WeChat Pay — no Chinese bank account required.',
    metaTitle: 'How to Pay in China as a Foreigner | ChinaEase Buddy',
    metaDescription:
      'To pay in China as a foreigner, set up Alipay or WeChat Pay with an eligible international card, and carry a Visa or Mastercard and some cash as backup.',
    quickAnswer:
      "Yes — foreigners can pay almost everywhere in China without a Chinese bank account. Since 2023 you can link an international Visa, Mastercard, JCB, Discover, or Diners Club card directly to Alipay or WeChat Pay and pay by scanning QR codes. Set it up before you fly, keep a little cash as backup, and tell your bank you'll be using your card in China so the verification charge isn't blocked.",
    ctaLabel: 'Open payment phrases',
    ctaHref: '/?journey=china&tool=pay',
    sections: [
      {
        title: 'Do I need a Chinese bank account or phone number?',
        items: [
          'No to both.',
          'Since 2023, the Chinese bank account requirement was removed for foreign visitors.',
          'You can register Alipay with your home-country mobile number — the SMS verification code goes to that number.',
          'A Chinese SIM is optional, not required.',
        ],
      },
      {
        title: 'Which cards work?',
        items: [
          'Visa, Mastercard, JCB, Discover, Diners Club, and Maestro are supported.',
          'American Express works inconsistently (lower limits, patchy acceptance) — bring a Visa or Mastercard as your main card.',
          'Cards with no foreign-transaction fee (such as Wise, Revolut, or travel credit cards) save you money over a longer trip.',
        ],
      },
      {
        title: 'How to set up Alipay before your trip',
        ordered: true,
        items: [
          'Download the standard Alipay app from the App Store or Google Play — not "Alipay HK" or other regional versions.',
          'Register with your home mobile number and enter the SMS code.',
          'Go to identity verification and upload your passport photo page (make sure the machine-readable strip at the bottom is clear). Verification is mostly automated and usually finishes in minutes.',
          "Add your card under Account → Bank Cards. You may be redirected to your bank's 3D-Secure (OTP) page.",
          'Alipay sends a small verification charge (usually under $1) — confirm it in the app to activate.',
        ],
      },
      {
        title: 'Alipay vs WeChat Pay — which should I use?',
        table: {
          headers: ['', 'Alipay', 'WeChat Pay'],
          rows: [
            ['Foreign card support', 'Strong, well-documented', 'Works, but setup varies more'],
            ['English interface', 'Full English', 'Partial'],
            ['Best for tourists', 'Recommended primary', 'Good as backup'],
            ['Also used for', 'Taxis, metro, shops, tickets', 'Same, plus messaging'],
          ],
        },
        items: [
          'Recommendation: set up Alipay first as your main payment method, and add WeChat Pay as a backup if you have time.',
        ],
      },
      {
        title: 'Fees and limits',
        items: [
          'Payments of ¥200 or less are usually fee-free; above that, expect roughly a 3% fee.',
          'Your own bank may also add a foreign-transaction fee.',
          'Alipay applies per-transaction and annual spending limits for foreign cards — check the current limit shown inside the Alipay app when you link your card.',
        ],
      },
      {
        title: 'What if my payment fails?',
        items: [
          "Call your bank before the trip and tell them you'll use the card in China; ask them to whitelist Alipay/China charges.",
          'Turn your VPN off while linking the card.',
          'Try a Mastercard if Visa fails, or vice versa.',
          'Last resort: cash top-up counters in the international arrival halls at major airports (Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, Hangzhou, and others) — show your passport, hand over RMB cash, and staff credit your Alipay balance.',
        ],
      },
      {
        title: 'Can I get a refund to my foreign card?',
        items: [
          'Yes. Refunds go back to the original card, typically within 3–10 business days.',
          "They're issued in RMB, so the final amount may differ slightly due to exchange-rate movement.",
        ],
      },
    ],
    faqs: [
      {
        question: 'Is China really cashless?',
        answer:
          'Mostly — in big cities the vast majority of payments are by QR code. Carry a small amount of cash for rural areas and edge cases.',
      },
      {
        question: 'Can I use Apple Pay or my foreign card directly?',
        answer:
          'At big hotels and malls sometimes; small shops and restaurants usually only take Alipay or WeChat QR codes.',
      },
      {
        question: 'Should I set up Alipay before or after arriving?',
        answer: "Before — you need your home SIM to receive your bank's verification SMS.",
      },
    ],
    related: [
      { label: 'Can foreigners use Alipay?', href: '/alipay-for-foreigners/' },
      { label: 'WeChat Pay for foreigners', href: '/wechat-pay-for-foreigners/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'How to pay for DiDi in China', href: '/didi-payment-for-foreigners/' },
      { label: 'How to order food in China', href: '/china-food-ordering-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
    ],
  },
  'china-travel-checklist': {
    path: '/china-travel-checklist/',
    title: checklistGuide.heading,
    intro: '',
    metaTitle: checklistGuide.metaTitle,
    metaDescription: checklistGuide.metaDescription,
    quickAnswer: quickAnswerText(checklistGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); keeps its own itinerary CTA as well as the gig card.
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    reviewed: checklistGuide.reviewed,
    lastModified: checklistGuide.modified,
    isArticle: true,
    sections: [],
    faqs: checklistGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
    ],
    sources: checklistGuide.sources,
  },
  'china-emergency-numbers': {
    path: '/china-emergency-numbers/',
    title: 'Emergency Numbers in China for Travelers',
    intro: 'Key emergency numbers and practical words to show locals when something goes wrong in China.',
    metaTitle: 'Emergency Numbers in China for Travelers | ChinaEase Buddy',
    metaDescription:
      'Know China emergency numbers for travelers: 110 police, 120 ambulance, 119 fire, plus hospital phrases, police help, and lost passport reminders.',
    quickAnswer: emergencyGuideContent.quickAnswer,
    ctaLabel: 'View emergency help',
    ctaHref: '/?journey=emergency',
    reviewed: emergencyGuideContent.reviewed,
    lastModified: emergencyGuideContent.modified,
    isArticle: true,
    sections: emergencyGuideContent.sections,
    faqs: emergencyGuideContent.faqs,
    related: [
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Food ordering and allergy guide', href: '/china-food-ordering-guide/' },
      { label: 'Essential Chinese travel phrases', href: '/chinese-travel-phrases/' },
      { label: 'China travel safety guide', href: '/china-travel-safety-guide/' },
      { label: 'FAQ', href: '/faq/' },
    ],
    sources: emergencyGuideContent.sources,
  },
  'china-online-arrival-card-2026': {
    ...guideFromArticle(
      arrivalCardGuide,
      '/china-online-arrival-card-2026/',
      'Plan my arrival and first China days',
      [
        { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
        { label: 'China visa-free checker', href: '/china-visa-free-checker/' },
        { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
        { label: 'First trip to China', href: '/first-trip-to-china/' },
      ],
    ),
    featuredFaqCount: 3,
    ctaBeforeFeaturedFaqs: true,
  },
  'nia-12367-online-accommodation-registration-guide': {
    path: '/nia-12367-online-accommodation-registration-guide/',
    title: 'How to Register a Non-Hotel Stay with NIA 12367',
    intro: 'Foreigners staying in private homes or other non-hotel accommodation generally need registration within 24 hours. Nationwide online handling is available through official NIA 12367 channels, while in-person registration remains valid.',
    metaTitle: 'NIA 12367 Online Accommodation Registration Guide for Foreigners (2026)',
    metaDescription: 'Learn how foreigners register a private or non-hotel stay through NIA 12367, where online registration is available, what documents you need, and when hotels register for you.',
    quickAnswer: 'Hotels register foreign guests as part of check-in. For a private home or other non-hotel stay, the guest or host generally registers within 24 hours. From September 21, 2026, nationwide online handling is available through the NIA Government Service Platform, NIA 12367 app, and official WeChat or Alipay mini-programs. In-person registration remains available.',
    ctaLabel: 'Prepare my registration details with Buddy',
    midCtaLabel: 'Format my Chinese address',
    ctaHref: '/',
    buddyPrompt: 'Help me prepare non-hotel accommodation registration details for this address: [address]. I am staying in [province/city] with [friend/family/host].',
    reviewed: 'September 27, 2026',
    sections: [
      { title: 'Hotel vs Non-Hotel Registration', table: { headers: ['Stay type', 'Who handles registration', 'Typical action'], rows: [['Hotel', 'Hotel front desk', 'Present the passport during check-in'], ['Private home or other non-hotel residence', 'Guest or accommodation host', 'Register within 24 hours through an official online or in-person channel'], ['Online registration', 'Guest or host through NIA platform', 'Complete identity, address, and residence details online']] } },
      { title: 'Where Online Registration Is Verified', items: ['The National Immigration Administration announced nationwide online handling from September 21, 2026.', 'Use the official NIA government-service platform, NIA 12367 app, or official WeChat or Alipay mini-program.', 'If online registration is unavailable or unclear, contact the local police station or call 12367.'] },
      { title: 'Online Registration Steps', ordered: true, items: ['Open the NIA Government Service Platform, NIA 12367 app, or official WeChat or Alipay mini-program.', 'Complete account and passport identity verification.', 'Open Foreigner Service and select the accommodation-registration module when available.', 'Enter the Chinese address and host or property details accurately, then upload any documents requested.', 'Submit and save the registration record; online registration has the same legal effect as on-site registration where the service applies.'] },
      { title: 'Prepare Before Starting', items: ['Passport and current entry or stay information.', 'Full Chinese address, property type, arrival date, and planned departure date.', 'Host identity and contact information when required.', 'A backup plan to visit the local police station if the platform cannot process the address.'] },
    ],
    faqs: [
      { question: 'Is NIA 12367 online accommodation registration available nationwide?', answer: 'Yes. NIA announced nationwide online handling from September 21, 2026. Check the current official platform for your exact address, or call 12367 if the online process does not work.' },
      { question: 'Do hotel guests need to register themselves?', answer: 'Normally no. Hotels collect the passport details and submit the accommodation registration during check-in.' },
      { question: 'How soon must a private stay be registered?', answer: 'The general rule is within 24 hours after arrival at the non-hotel residence.' },
      { question: 'Is online registration legally valid?', answer: 'The NIA states that completed online registration has the same legal effect as on-site registration where the online service applies.' },
    ],
    related: [{ label: 'Hotel rejection guide', href: '/china-hotels-for-foreigners/' }, { label: 'Full China hotels guide', href: '/china-hotels-for-foreigners/' }, { label: 'China travel checklist', href: '/china-travel-checklist/' }],
    sources: [{ label: 'NIA policy interpretation: online accommodation registration', href: 'https://english.www.gov.cn/services/visitchina/202603/21/content_WS69ce124cc6d00ca5f9a0a368.html' }],
  },
  'amap-english-mode-guide-2026': {
    path: '/amap-english-mode-guide-2026/',
    title: amapEnglishSetup.heading,
    intro: '',
    metaTitle: amapEnglishSetup.metaTitle,
    metaDescription: amapEnglishSetup.metaDescription,
    quickAnswer: amapEnglishSetup.quickAnswer.map(plainText).join(' '),
    // The page renders its own body, CTA card and linked FAQ answers (AmapGuide); these fields feed the schema.
    ctaLabel: amapEnglishSetup.cta.label,
    ctaHref: amapEnglishSetup.cta.href,
    reviewed: amapEnglishSetup.reviewed,
    lastModified: amapEnglishSetup.modified,
    isArticle: true,
    sections: [],
    faqs: amapEnglishSetup.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'Full Amap navigation guide', href: '/amap-english-mode-guide-2026/' }, { label: 'Google Maps alternative guide', href: '/amap-vs-google-maps-china/' }],
    sources: amapEnglishSetup.sources,
  },
  'alipay-metro-qr-transport-code-guide': {
    path: '/alipay-metro-qr-transport-code-guide/',
    title: alipayMetroGuide.heading,
    intro: '',
    metaTitle: alipayMetroGuide.metaTitle,
    metaDescription: alipayMetroGuide.metaDescription,
    quickAnswer: quickAnswerText(alipayMetroGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); these fields feed the schema.
    ctaLabel: alipayMetroGuide.cta.label,
    ctaHref: alipayMetroGuide.cta.href,
    reviewed: alipayMetroGuide.reviewed,
    lastModified: alipayMetroGuide.modified,
    isArticle: true,
    sections: [],
    faqs: alipayMetroGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'China metro guide', href: '/china-metro-guide/' }, { label: 'Amap English guide', href: '/amap-english-mode-guide-2026/' }],
    sources: alipayMetroGuide.sources,
  },
  'china-travel-ai-itinerary-generator': {
    path: '/china-travel-ai-itinerary-generator/',
    title: 'Build a Personal China Itinerary with an AI Travel Assistant',
    intro: 'Use Buddy to turn trip length, cities, interests, budget, mobility, and booking constraints into a practical first draft, then verify live schedules, prices, closures, and entry rules.',
    metaTitle: 'China Travel AI Itinerary Generator: Build a Personal Route in 30 Seconds (2026)',
    metaDescription: 'Generate a personalized China itinerary with Buddy AI. Enter days, cities, interests, budget, pace, and mobility needs for a practical route and booking checklist.',
    quickAnswer: 'Tell Buddy your dates, arrival and departure cities, interests, budget, pace, mobility needs, and must-see places. It can draft a day-by-day route, suggest train-versus-flight choices, produce Chinese addresses and travel phrases, and identify bookings to make first. Treat the output as planning support and verify time-sensitive information with official providers.',
    ctaLabel: 'Get my free itinerary',
    midCtaLabel: 'Start with my trip details',
    // The itinerary CTAs go to the trip form, not the chat.
    ctaHref: '/plan/',
    reviewed: 'September 27, 2026',
    sections: [
      { title: 'What to Tell the Planner', items: ['Exact travel dates and international arrival and departure airports.', 'Cities or sights that are fixed, optional, or unwanted.', 'History, food, nature, family, nightlife, shopping, or other interests.', 'Budget, hotel style, preferred pace, mobility limits, and tolerance for early departures.', 'Passport and visa-free context when it affects the route. Do not submit passport numbers or sensitive identifiers.'] },
      { title: 'What Buddy Can Generate', table: { headers: ['Output', 'Purpose'], rows: [['Day-by-day route', 'Group nearby sights and reduce unnecessary transfers'], ['Transport plan', 'Compare high-speed rail, flight, metro, and DiDi'], ['Booking priorities', 'Flag attractions, trains, and hotels to reserve first'], ['China-ready details', 'Provide Chinese addresses, map searches, and practical phrases'], ['Budget draft', 'Estimate daily and trip-level planning ranges']] } },
      { title: 'What You Still Need to Verify', items: ['Official entry, visa-free, transit, and accommodation-registration requirements.', 'Live Railway 12306 and airline schedules, prices, and availability.', 'Official attraction opening days, reservation rules, weather closures, and holiday restrictions.', 'Hotel acceptance, room details, payment terms, and cancellation rules.'] },
    ],
    faqs: [
      { question: 'Can AI plan a complete China trip?', answer: 'It can produce a strong planning draft and checklist, but live prices, schedules, closures, and legal requirements still need official verification.' },
      { question: 'What information should I provide?', answer: 'Provide dates, cities, interests, budget, pace, mobility needs, and fixed bookings. Do not provide passport numbers, card details, or other unnecessary sensitive data.' },
      { question: 'Can Buddy create Chinese addresses and phrases?', answer: 'Yes. Buddy can format destination names, hotel messages, pickup phrases, and planning notes for local apps.' },
    ],
    related: [{ label: '7, 10 and 14-day itinerary guide', href: '/china-itinerary-first-time-7-10-14-days/' }, { label: 'China travel budget', href: '/china-travel-budget/' }, { label: 'China train booking guide', href: '/china-train-travel-guide/' }],
  },
  'wechat-verification-without-friend-qr-2026': {
    path: '/wechat-verification-without-friend-qr-2026/',
    title: wechatVerificationGuide.heading,
    intro: '',
    metaTitle: wechatVerificationGuide.metaTitle,
    metaDescription: wechatVerificationGuide.metaDescription,
    quickAnswer: quickAnswerText(wechatVerificationGuide.quickAnswer),
    // Rendered like the Amap guide (AmapGuide components); these fields feed the schema.
    ctaLabel: wechatVerificationGuide.cta.label,
    ctaHref: wechatVerificationGuide.cta.href,
    reviewed: wechatVerificationGuide.reviewed,
    lastModified: wechatVerificationGuide.modified,
    isArticle: true,
    sections: [],
    faqs: wechatVerificationGuide.faqs.map(({ question, answer }) => ({ question, answer: plainText(answer) })),
    related: [{ label: 'How to Use TenPayGo in China: Sign Up, Link a Card, Pay', href: '/tenpaygo-for-tourists/' }],
    sources: wechatVerificationGuide.sources,
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
    reviewed: 'October 23, 2026',
    lastModified: '2026-10-23',
    sections: [
      { title: '15 Dishes to Put on Your List', items: ['Jianbing: a savory breakfast crepe with egg, sauces, herbs, and a crisp filling.', 'Xiaolongbao: steamed soup dumplings associated with Jiangnan and Shanghai.', 'Shengjianbao: pan-fried buns with a crisp base and juicy filling.', 'Peking duck: roast duck served with thin pancakes, scallion, cucumber, and sauce.', 'Zhajiangmian: Beijing-style noodles with fermented soybean meat sauce.', 'Biangbiang noodles: wide, hand-pulled Shaanxi noodles.', 'Roujiamo: chopped meat in a crisp flatbread, strongly associated with Shaanxi.', 'Hot pot: broth-based communal cooking, especially famous in Chongqing and Sichuan.', 'Mapo tofu: tofu with minced meat, chili, and Sichuan pepper in the classic version.', 'Kung pao chicken: diced chicken with chili and peanuts.', 'Lanzhou beef noodles: hand-pulled noodles in a clear beef broth.', 'Jiaozi: boiled, steamed, or pan-fried dumplings.', 'Yangzhou fried rice: rice with egg and mixed ingredients in the classic style.', 'Lamb skewers: cumin-seasoned grilled meat associated with northwestern flavors.', 'Seasonal stir-fried greens: a useful balance to richer shared dishes.'] },
      { title: 'Order by City', table: { headers: ['City or region', 'Good starting choices'], rows: [['Beijing', 'Peking duck, zhajiangmian, dumplings'], ['Shanghai / Jiangnan', 'Xiaolongbao, shengjianbao, braised dishes'], ["Xi'an / Shaanxi", 'Biangbiang noodles, roujiamo, lamb dishes'], ['Chengdu / Sichuan', 'Mapo tofu, hot pot, dry-fried dishes'], ['Guangzhou / Guangdong', 'Dim sum, roast meats, seafood, soups']] } },
      { title: 'Food Safety and Allergies', items: ['Choose busy, clean-looking vendors that cook food thoroughly and serve it hot.', 'Drink sealed bottled or properly treated water when safety is uncertain.', 'Allergy communication is difficult because sauces, broths, oils, and shared equipment may contain hidden ingredients.', 'Show a specific Chinese allergy card and confirm with staff; Buddy provides communication support, not a medical guarantee.'] },
      { title: 'How to Order', links: [{ label: 'How to order food in China', description: 'QR menus, dietary needs, serious allergies and paying at the table.', href: '/china-food-ordering-guide/' }, { label: 'Amap\'s menu translation', description: 'Turn a photo of a Chinese menu into English dish names, tags and prices.', href: '/amap-english-mode-guide-2026/#menu-translation' }], items: ['Use photo menus, displayed dishes, or a translation tool, but confirm portion size before ordering.', 'Shared dishes are common; a rough starting point is one dish per person plus one additional vegetable or staple for the table.', 'Ask whether the price is per dish, per person, per 500 grams, or by live weight when seafood and market ingredients are involved.', 'Keep Alipay or WeChat Pay ready and carry a cash backup.'] },
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
    related: [{ label: 'Full WeChat Pay guide', href: '/wechat-pay-for-foreigners/' }, { label: 'China payment setup', href: '/china-payment-guide/' }, { label: 'Best China travel apps', href: '/china-travel-apps/' }],
    sources: [{ label: 'Chinese government: payment guide for overseas visitors', href: 'https://english.www.gov.cn/news/202404/11/content_WS6617c858c6d0868f4e8e5f4d.html' }],
  },
  'beijing-shanghai-layover-240-hour-guide': {
    path: '/beijing-shanghai-layover-240-hour-guide/',
    title: layoverAirportPlanning.heading,
    intro: layoverAirportPlanning.intro,
    metaTitle: 'Beijing & Shanghai Layover Guide 2026: 240-Hour Visa-Free Transit Explained',
    metaDescription: 'Plan a Beijing or Shanghai layover with China\'s 240-hour visa-free transit. Check the third-country route, 65 ports, allowed areas and realistic plans.',
    quickAnswer: layoverAirportPlanning.quickAnswer,
    ctaLabel: 'Plan my layover with Buddy',
    midCtaLabel: 'Check whether my route qualifies',
    ctaHref: '/',
    buddyPrompt: 'Plan my China layover. I arrive at [airport] on [date/time], depart from [airport] to [country/region] on [date/time], hold a [country] passport, and want to see [interests].',
    reviewed: layoverAirportPlanning.reviewed,
    lastModified: layoverAirportPlanning.modified,
    sections: layoverAirportPlanning.sections,
    faqs: layoverAirportPlanning.faqs,
    related: [{ label: 'Complete visa-free transit guide', href: '/china-visa-free-travel-guide/' }, { label: 'China train travel guide', href: '/china-train-travel-guide/' }, { label: 'Beijing vs Shanghai', href: '/beijing-vs-shanghai/' }],
    sources: layoverAirportPlanning.sources,
  },
  'china-itinerary-first-time-7-10-14-days': {
    path: '/china-itinerary-first-time-7-10-14-days/',
    title: 'China Itinerary for First-Time Visitors: 7, 10 or 14 Days',
    intro: 'Choose two cities in seven days, the Beijing-Xi\'an-Shanghai golden triangle in ten, or add one nature or food destination for a well-paced fourteen-day first visit.',
    metaTitle: 'China Itinerary for First-Timers: 7, 10 or 14 Days (2026)',
    metaDescription: "Compare practical 7-, 10- and 14-day China itineraries, including Beijing, Xi'an, Shanghai, Chengdu and Guilin, with realistic transfer advice.",
    quickAnswer: firstTimeItineraryContent.quickAnswer,
    ctaLabel: 'Get my free itinerary',
    midCtaLabel: 'Personalize this route for my interests',
    // The itinerary CTAs go to the trip form, not the chat.
    ctaHref: '/plan/',
    reviewed: firstTimeItineraryContent.reviewed,
    lastModified: firstTimeItineraryContent.modified,
    isArticle: true,
    sections: firstTimeItineraryContent.sections,
    faqs: firstTimeItineraryContent.faqs,
    related: [{ label: '7-day China itinerary', href: '/7-day-china-itinerary/' }, { label: '10-day China itinerary', href: '/10-day-china-itinerary/' }, { label: '14-day China itinerary', href: '/14-day-china-itinerary/' }, { label: 'First trip to China guide', href: '/first-trip-to-china/' }, { label: 'China train booking guide', href: '/china-train-travel-guide/' }, { label: 'China travel budget', href: '/china-travel-budget/' }, { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' }, { label: 'China eSIM guide', href: '/china-esim-internet-guide/' }],
    sources: firstTimeItineraryContent.sources,
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
          'Paid passes are one-time digital travel passes purchased through Gumroad. Activate with the Order ID on your Gumroad receipt. Access is enabled only after server verification; returning from checkout does not activate a Pass.',
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

guidePages['china-payment-guide'].related.unshift({ label: 'How to Use TenPayGo in China: Sign Up, Link a Card, Pay', href: '/tenpaygo-for-tourists/' });
guidePages['china-hotels-for-foreigners'].related.unshift({ label: 'Online accommodation registration', href: '/nia-12367-online-accommodation-registration-guide/' });
guidePages['china-airport-arrival-guide'].related.unshift({ label: 'Register a non-hotel stay with NIA 12367', href: '/nia-12367-online-accommodation-registration-guide/' });
guidePages['china-airport-arrival-guide'].related.unshift({ label: 'China visa-free checker', href: '/china-visa-free-checker/' });
guidePages['nia-12367-online-accommodation-registration-guide'].related.unshift({ label: 'China visa-free checker', href: '/china-visa-free-checker/' });
guidePages['china-visa-free-travel-guide'].related.unshift({ label: 'China visa-free checker', href: '/china-visa-free-checker/' });
guidePages['china-240-hour-visa-free-transit-2026'].related.unshift(
  { label: '240-hour transit calculator', href: '/china-240-hour-transit-calculator/' },
  { label: 'China visa-free checker', href: '/china-visa-free-checker/' },
);

function insertAfter<T>(list: T[], index: number, item: T) {
  list.splice(index === -1 ? list.length : index + 1, 0, item);
}

type GuideContentAdditions = Record<string, {
  reviewed?: string;
  modified?: string;
  sections: Array<GuidePageData['sections'][number] & { after: string }>;
  faqs: Array<GuidePageData['faqs'][number] & { after: string }>;
  sources: NonNullable<GuidePageData['sources']>;
  sectionLinks: Array<{ section: string | string[]; links: NonNullable<GuidePageData['sections'][number]['links']> }>;
  sectionNotes?: Array<{ section: string | string[]; text: string }>;
  removeFaqs: string[];
}>;

for (const [type, additions] of Object.entries(guideContentAdditions as GuideContentAdditions)) {
  const page = guidePages[type as GuidePageType];
  Object.assign(page, { sections: [...page.sections], faqs: [...page.faqs] });
  for (const { after, ...section } of additions.sections) {
    insertAfter(page.sections, page.sections.findIndex(({ title }) => title === after), section);
  }
  for (const { after, ...faq } of additions.faqs) {
    insertAfter(page.faqs, page.faqs.findIndex(({ question }) => question === after), faq);
  }
  page.faqs = page.faqs.filter(({ question }) => !additions.removeFaqs.includes(question));
  page.sections = page.sections.map((section) => {
    // `section` may list several titles when the static page and the app name the same section differently.
    const extra = additions.sectionLinks.filter((entry) => [entry.section].flat().includes(section.title)).flatMap((entry) => entry.links);
    const notes = (additions.sectionNotes || []).filter((entry) => [entry.section].flat().includes(section.title)).map((entry) => entry.text);
    return extra.length || notes.length ? { ...section, links: [...(section.links || []), ...extra], notes: [...(section.notes || []), ...notes] } : section;
  });
  // No added sources: keep the page's own list (or its default one).
  if (additions.sources.length) page.sources = [...(page.sources || []), ...additions.sources];
  // Link-only additions leave the page's dates alone.
  if (additions.reviewed) Object.assign(page, { reviewed: additions.reviewed, lastReviewed: additions.reviewed, lastModified: additions.modified });
}

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

function PageShell({ title, intro, children, planningByline = false, byline }: { title: string; intro: string; children: ReactNode; planningByline?: boolean; byline?: ReactNode }) {
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
              {byline ?? (planningByline && <a href="#lin-help" className="mt-2 inline-block text-sm font-semibold text-[#155e63] underline underline-offset-4">{planningHelp.byline}</a>)}
            </div>
          </div>
          {intro && <p className="mb-6 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">{intro}</p>}
          {children}
        </div>
      </div>
    </main>
  );
}

function PricingPage({ passState }: { passState?: PassState | null }) {
  const { t } = useTranslation();
  useNoIndexPage(true);
  return (
    <PageShell
      title="Pricing"
      intro="Choose personal route-planning help from Lin or optional digital travel passes. The free itinerary preview remains available."
    >
      <LinBox placement="pricing" className="mb-6" />
      <h2 className="mb-2 text-xl font-bold text-gray-950">{planningHelp.digitalHeading}</h2>
      <p className="mb-5 text-sm leading-relaxed text-gray-700">{planningHelp.digitalScope}</p>
      <p id="pricing-pass-purchase-notice" className="mb-5 text-sm leading-relaxed text-gray-700">{t('pay.checkout.separatePassNotice')}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-5 shadow-sm ${
              plan.featured ? 'bg-[#155e63] text-white' : 'border border-gray-100 bg-white'
            }`}
          >
            <h2 className={`text-sm font-semibold ${plan.featured ? 'text-white' : 'text-gray-950'}`}>{plan.name}</h2>
            {isTripOrGroup(passState ?? null) && plan.plan === `${passState?.tier}_pass` && (
              <p className="mt-2 text-xs font-semibold">{t('pay.checkout.currentPass')}</p>
            )}
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
              aria-describedby={plan.plan === 'free' ? undefined : 'pricing-pass-purchase-notice'}
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
              {isTripOrGroup(passState ?? null) && plan.plan === `${passState?.tier}_pass`
                ? t('pay.checkout.buyAgain', { pass: plan.name }) : plan.cta}
            </a>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-[#155e63]/10 bg-[#155e63]/5 p-4">
        <a href="/?activate=1" className="mb-3 inline-block text-sm font-semibold text-[#155e63] underline">{t('pass.claim.title')}</a>
        <p className="mb-3 text-xs leading-relaxed text-gray-600">{t('pass.claim.receiptHint')}</p>
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

const richGuides: Partial<Record<GuidePageType, GuideContent>> = {
  'amap-english-mode-guide-2026': amapEnglishSetup as GuideContent,
  'alipay-metro-qr-transport-code-guide': alipayMetroGuide as GuideContent,
  'didi-payment-for-foreigners': didiPaymentGuide as GuideContent,
  'tenpaygo-for-tourists': tenPayGoGuide as GuideContent,
  'didi-in-china-for-foreigners': didiGuide as GuideContent,
  'wechat-verification-without-friend-qr-2026': wechatVerificationGuide as GuideContent,
  'china-airport-arrival-guide': airportArrivalGuide as GuideContent,
  'china-train-travel-guide': trainGuide as GuideContent,
  'china-travel-budget': budgetGuide as GuideContent,
  'chengdu-panda-base-guide': pandaBaseGuide as GuideContent,
  'amap-vs-google-maps-china': mapsComparisonGuide as GuideContent,
  'china-travel-apps': appsHubGuide as GuideContent,
  'china-hotels-for-foreigners': hotelsGuide as GuideContent,
  'china-travel-checklist': checklistGuide as GuideContent,
  '3-day-suzhou-itinerary': suzhouGuide as GuideContent,
  '3-day-beijing-itinerary': beijingGuide as GuideContent,
  '3-day-nanjing-itinerary': nanjingGuide as GuideContent,
};

function GuidePage({ type, userId, onAskBuddy }: { type: GuidePageType; userId?: string | null; onAskBuddy?: (prefill?: string) => void }) {
  const page = guidePages[type];
  // Guides written to a spec render their own byline, quick answer, CTA card, body and linked FAQ answers.
  const richGuide = richGuides[type];
  const isAmapGuide = Boolean(richGuide);
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
    <GuideProvider content={richGuide}>
    <PageShell title={page.title} intro={page.intro} planningByline={type !== 'guides'} byline={isAmapGuide ? <AmapByline /> : undefined}>
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
          {isAmapGuide ? <AmapQuickAnswer /> : <p className="mt-2 text-sm leading-relaxed text-gray-700 md:text-base">{page.quickAnswer}</p>}
          <p className="mt-3 text-xs font-semibold text-gray-500">Last reviewed: {page.reviewed ?? page.lastReviewed ?? 'June 12, 2026'}</p>
          {featuredFaqs.length === 0 && !isItineraryPage && (!isAmapGuide || richGuide?.keepPageCta) && (
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="mt-4 inline-flex rounded-full bg-[#155e63] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e4a4e]"
            >
              {page.ctaLabel}
            </button>
          )}
        </section>

        {type === 'china-travel-budget' && <ChinaTripCostEstimator />}
        {isAmapGuide && <>
          <AmapCtaCard />
          <AmapGuideBody />
        </>}

        {!isAmapGuide && <nav className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">On this page</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {type === 'china-travel-budget' && (
              <a href="#cost-estimator" className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">Cost estimator</a>
            )}
            {page.sections.map((section) => (
              <a key={section.title} href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
                {section.title}
              </a>
            ))}
            <a href="#faq" className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
              FAQ
            </a>
          </div>
        </nav>}

        <div className="grid gap-4 md:grid-cols-2">
          {page.sections.map((section, sectionIndex) => (
            <section
              id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              key={section.title}
              className={`rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm${section.table ? ' md:col-span-2' : ''}`}
            >
              {!['china-itinerary-first-time-7-10-14-days'].includes(type) && <span id={`guide-section-${sectionIndex}`} aria-hidden="true" />}
              <h2 className="text-lg font-bold text-gray-950">{section.title}</h2>
              {((type === 'china-visa-free-travel-guide' && section.title === '240-hour visa-free transit: the route is essential') ||
                (type === 'china-240-hour-visa-free-transit-2026' && section.title === 'How the 10-day clock is calculated')) && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">To work out your departure date, use the <a href="/china-240-hour-transit-calculator/" className="font-semibold text-[#155e63] underline underline-offset-4">China 240-hour visa-free transit calculator</a>. It calculates the next-day midnight clock in China time and checks the basic passport and route pattern; confirm the final permitted stay with border inspection.</p>
              )}
              {type === '14-day-china-itinerary' && section.title === 'Estimated budget for two weeks' && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600"><a href="/china-travel-budget/#cost-estimator" className="font-semibold text-[#155e63] underline underline-offset-4">{tripCostEstimatorContent.itineraryLinkLabel}</a>. {tripCostEstimatorContent.itineraryLinkText}</p>
              )}
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
              {section.notes?.map((note) => <p key={note} className="mt-3 text-sm leading-relaxed text-gray-600"><AmapRichText text={note} /></p>)}
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
            <RelatedGuidesForForeigners currentPath={page.path} />
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
            {isItineraryPage && <RelatedGuidesForForeigners currentPath={page.path} />}
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
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{isAmapGuide ? <AmapFaqAnswer question={faq.question} /> : faq.answer}</p>
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

        <LinBox placement="guide" />
        <section className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <h2 className="text-base font-bold text-gray-950">Related guides</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {((guideRelatedLinks as Record<string, Array<{ label: string; href: string }>>)[type] || page.related.slice(0, 8)).map((link) => (
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
    </GuideProvider>
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
  if (cleanPath.endsWith('/china-itinerary-first-time-7-10-14-days')) return 'china-itinerary-first-time-7-10-14-days';
  if (cleanPath.endsWith('/beijing-shanghai-layover-240-hour-guide')) return 'beijing-shanghai-layover-240-hour-guide';
  if (cleanPath.endsWith('/what-to-eat-in-china-first-time-guide')) return 'what-to-eat-in-china-first-time-guide';
  if (cleanPath.endsWith('/how-to-use-wechat-as-foreigner-2026')) return 'how-to-use-wechat-as-foreigner-2026';
  if (cleanPath.endsWith('/nia-12367-online-accommodation-registration-guide')) return 'nia-12367-online-accommodation-registration-guide';
  if (cleanPath.endsWith('/china-online-arrival-card-2026')) return 'china-online-arrival-card-2026';
  if (cleanPath.endsWith('/amap-english-mode-guide-2026')) return 'amap-english-mode-guide-2026';
  if (cleanPath.endsWith('/alipay-metro-qr-transport-code-guide')) return 'alipay-metro-qr-transport-code-guide';
  if (cleanPath.endsWith('/china-travel-ai-itinerary-generator')) return 'china-travel-ai-itinerary-generator';
  if (cleanPath.endsWith('/wechat-verification-without-friend-qr-2026')) return 'wechat-verification-without-friend-qr-2026';
  if (cleanPath.endsWith('/faq')) return 'faq';
  return null;
}

export default function PolicyPage({ type, userId, onAskBuddy, passState }: Props) {
  if (type === 'pricing') return <PricingPage passState={passState} />;
  if (type === 'china-visa-free-checker') return <VisaFreeCheckerPage />;
  if (type === 'china-240-hour-transit-calculator') return <TransitCalculatorPage />;
  if (isTransitAnswerSlug(type)) return <TransitAnswerPage slug={type} />;
  if (type in guidePages) return <GuidePage type={type as GuidePageType} userId={userId} onAskBuddy={onAskBuddy} />;
  return <LegalPage type={type as LegalPageType} />;
}
