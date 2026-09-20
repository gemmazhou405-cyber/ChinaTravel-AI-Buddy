import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { unsubscribeNewsletter } from '../lib/newsletter';

type LegalPageType = 'terms' | 'privacy' | 'refund' | 'contact' | 'about' | 'unsubscribe';
type GuidePageType =
  | 'guides'
  | 'china-visa-free-travel-guide'
  | 'china-airport-arrival-guide'
  | 'china-hotels-for-foreigners'
  | 'china-food-ordering-guide'
  | 'china-travel-apps'
  | 'amap-in-english'
  | 'china-metro-guide'
  | 'didi-in-china-for-foreigners'
  | 'china-train-travel-guide'
  | '10-day-china-itinerary'
  | 'china-esim-internet-guide'
  | 'alipay-for-foreigners'
  | 'wechat-pay-for-foreigners'
  | 'china-payment-guide'
  | 'china-travel-checklist'
  | 'china-emergency-numbers'
  | 'faq';
type PageType = 'pricing' | LegalPageType | GuidePageType;

interface Props {
  type: PageType;
  userId?: string | null;
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
  sections: Array<{
    title: string;
    items?: string[];
    ordered?: boolean;
    table?: {
      headers: string[];
      rows: string[][];
    };
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

const contactEmail = 'hello@chinaeasebuddy.com';
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

const guidePages: Record<GuidePageType, GuidePageData> = {
  guides: {
    path: '/guides/',
    title: 'China Travel Guides',
    intro: 'Practical guide pages for foreign visitors preparing for or traveling in China.',
    metaTitle: 'China Travel Guides | ChinaEase Buddy',
    metaDescription:
      'Practical China travel guides for foreign visitors: essential apps, Alipay, payments, checklists, emergency numbers, and frequently asked questions.',
    quickAnswer:
      'Start with the guide that matches your immediate travel question: apps before arrival, Alipay setup, payments in China, first-time checklist, emergency numbers, or common FAQ.',
    ctaLabel: 'Open the free toolkit',
    ctaHref: '/',
    sections: [
      {
        title: 'Current guide pages',
        items: [
          'China eSIM & Internet Guide: choose, install, activate, and troubleshoot mobile data.',
          'China Visa-Free Travel Guide: compare 30-day visa-free entry, 240-hour transit, routes, ports, and documents.',
          'China Airport Arrival Guide: immigration, baggage, customs, mobile data, payment, and airport transfers.',
          'China Hotels for Foreigners: passport booking, check-in, registration, deposits, and problem solving.',
          'China Food Ordering Guide: use QR and photo menus, explain dietary needs, handle allergies, and pay.',
          'China Travel Apps: prepare Alipay, WeChat, Amap, Didi, and Trip.com.',
          'AMap in English: search places, plan routes, and navigate stations and entrances.',
          'China Metro Guide: buy tickets, transfer lines, and choose the correct exit.',
          'DiDi in China for Foreigners: book rides, verify the car, communicate, and pay.',
          'China Train Travel Guide: book with a foreign passport and navigate the station.',
          '10-Day China Itinerary: follow a practical Beijing, Xi\'an, and Shanghai route.',
          'Alipay for Foreigners: understand setup reminders and backup options.',
          'WeChat Pay for Foreigners: add an eligible international card and pay by QR code.',
          'China Payment Guide: practical notes for Alipay, WeChat Pay, cards, and cash.',
          'China Travel Checklist: first-time visitor preparation before arrival.',
          'China Emergency Numbers: 110, 120, 119, and simple emergency phrases.',
          'FAQ: concise answers about ChinaEase Buddy and service limitations.',
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
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'AMap in English', href: '/amap-in-english/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'WeChat Pay for foreigners', href: '/wechat-pay-for-foreigners/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
      { label: 'FAQ', href: '/faq/' },
    ],
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
    title: 'China Airport Arrival Guide for First-Time Visitors (2026)',
    intro:
      'A step-by-step arrival plan for immigration, baggage, Customs, mobile data, payment, airport transfers, hotel check-in, and late-night backups.',
    metaTitle: 'China Airport Arrival Guide (2026) | ChinaEase Buddy',
    metaDescription:
      'Arrive in China with confidence. Follow immigration, baggage, customs, eSIM, payment, airport transfer, hotel check-in, and late-arrival steps.',
    quickAnswer:
      'Before flying, confirm the entry rules for your exact passport, route, purpose, and travel dates, then complete China\'s free official online arrival card if it applies to you. Keep your passport, visa or other entry basis, accommodation details, and onward booking accessible offline. After landing, follow the airport signs through immigration, baggage claim, and Customs; connect your phone, test a payment backup, and use an official airport train, metro, taxi queue, or verified ride-hailing pickup. The arrival card is not a visa or permission to enter, and the final entry decision belongs to the immigration authorities.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
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
      { label: 'China visa-free travel guide', href: '/china-visa-free-travel-guide/' },
      { label: 'China hotels for foreigners', href: '/china-hotels-for-foreigners/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
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
    title: 'China Hotels for Foreigners: Booking and Check-In Guide (2026)',
    intro:
      'A practical hotel guide for foreign-passport booking, check-in, accommodation registration, payments, late arrivals, and front-desk problems.',
    metaTitle: 'China Hotels for Foreigners: Booking Guide (2026) | ChinaEase Buddy',
    metaDescription:
      'Book and check in to hotels in China with a foreign passport. Learn guest rules, registration, late arrival, payment, deposits, and what to do if refused.',
    quickAnswer:
      'Foreign visitors can book and stay in hotels in China using a valid passport. In 2024, China\'s public security, commerce, and immigration authorities said hotels must not refuse overseas guests merely because the property claims to lack a special foreign-guest qualification. In practice, some front desks may still be unfamiliar with passport registration, especially at small or newly opened properties. Before a non-refundable booking, confirm the exact property can register your passport, save the written confirmation, enter every guest\'s name exactly as shown on the passport, and notify the hotel if you will arrive late. A hotel normally completes the accommodation registration for its guests; a private or non-hotel stay follows separate local registration procedures.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
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
        title: 'Check these details before booking',
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
        title: 'What happens at hotel check-in?',
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
          'From 20 March 2026, the National Immigration Administration began an online pilot for non-hotel accommodation registration in Hebei, Liaoning, Zhejiang, Hubei, Guangxi, Chongqing, and Sichuan.',
          'The pilot can be accessed through the NIA government-service website, the Immigration 12367 app, or official WeChat and Alipay mini-programs; in-person registration remains available.',
          'Outside the pilot areas, or when the online service does not cover the address, ask the host and local public security authority for the current local procedure.',
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
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'Gansu government: official response on hotel access for overseas travelers',
        href: 'https://www.gansu.gov.cn/gsszf/c100199/202406/173933391.shtml',
      },
      {
        label: 'National Immigration Administration: 2026 non-hotel registration online pilot',
        href: 'https://s.nia.gov.cn/mps/tztg/202601/t20261010_1010.html',
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
  'china-travel-apps': {
    path: '/china-travel-apps/',
    title: '8 Essential Apps for China Travel in 2026',
    intro:
      'A practical, current app stack for payments, maps, rides, trains, translation, and mobile data — with setup steps to finish before your flight.',
    metaTitle: 'Best Apps for China Travel (2026) | ChinaEase Buddy',
    metaDescription:
      'Set up Alipay, WeChat, AMap Global, DiDi, Trip.com, 12306, translation and mobile data tools before your China trip.',
    quickAnswer:
      'Before flying to mainland China, prepare a small core stack: Alipay for payments, WeChat for communication and backup payments, AMap Global for maps and public transport, DiDi for rides, Trip.com or Railway 12306 for trains, and an offline translation tool. Arrange an eSIM or roaming plan separately. Install from official stores, keep access to your home number for verification, save your hotel address in Chinese, and do not rely on Google or any single app as your only option.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 17, 2026',
    lastModified: '2026-09-17',
    isArticle: true,
    sections: [
      {
        title: 'Your China travel app stack at a glance',
        table: {
          headers: ['App or tool', 'Main use', 'Preparation'],
          rows: [
            ['Alipay', 'QR payments and travel mini-programs', 'Link an eligible international card and test login'],
            ['WeChat', 'Messaging, calls, location sharing, and possible backup payments', 'Register and check which wallet features your account offers'],
            ['AMap Global', 'Maps, public transport, walking, driving, and places', 'Test your language, search, and route-planning options'],
            ['DiDi', 'Taxi and ride-hailing', 'Save pickup and destination names in Chinese'],
            ['Trip.com', 'English booking for trains, flights, and hotels', 'Create an account and enter passport details accurately'],
            ['Railway 12306', 'Official China Railway ticketing', 'Use the English website or app and complete identity setup'],
            ['Offline translation app', 'Text, camera, and saved-language translation', 'Download Chinese language data and test offline'],
            ['ChinaEase Buddy', 'Itinerary, phrases, food, payment, and emergency references', 'Save the web app and key information before travel'],
          ],
        },
      },
      {
        title: 'Set everything up before your flight',
        ordered: true,
        items: [
          'Download each app from its official website or your phone\'s official app store, and check that you selected the correct regional version.',
          'Register with a phone number you can still access abroad, then complete any identity or card verification requested by the provider.',
          'Save your hotel name, full address, and phone number in Chinese in both your notes and screenshots.',
          'Arrange your eSIM or home-carrier roaming plan, but check the exact plan rules instead of assuming every international app will work.',
          'Test login, payments, routes, and offline translation before departure; keep a backup for every essential task.',
        ],
      },
      {
        title: 'Payments: prepare Alipay and a backup',
        items: [
          'Alipay states that foreign visitors can connect a credit card for payments at merchants across China. Eligibility, verification, limits, and fees can vary by account and transaction.',
          'WeChat includes payment features in supported regions, but availability and onboarding can differ. Treat it as a useful backup, not a guaranteed replacement for Alipay.',
          'Carry a physical bank card and some renminbi as backups. A linked card or wallet can still fail because of verification, issuer controls, merchant rules, or connectivity.',
          'For the full setup and troubleshooting steps, read Alipay for Foreigners and the China Payment Guide.',
        ],
      },
      {
        title: 'Maps: use AMap Global and save Chinese addresses',
        items: [
          'AMap Global currently advertises destination search, route planning, buses, subways, driving, walking, cycling, local places, and ride-hailing in mainland China.',
          'Language, login, and individual features can vary by phone, region, and app version. Install and test your exact version before travel.',
          'Google services are blocked on ordinary mainland internet connections, so do not make Google Maps your only navigation option.',
          'Save important destinations in Chinese characters. Searching a hotel, station, attraction, or business name is often more reliable than entering a translated street address.',
        ],
      },
      {
        title: 'Rides: prepare DiDi without assuming one payment flow',
        items: [
          'Use the standalone DiDi app or a supported mini-program path that is available on your device and account.',
          'Enter pickup and destination carefully, then match the car plate and driver details before entering the vehicle.',
          'Keep the destination name and address in Chinese in case you need to show the driver.',
          'Follow the payment choices shown in your version of the app. Availability can differ by region, account, card, and booking channel.',
        ],
      },
      {
        title: 'Trains: choose Trip.com or official Railway 12306',
        items: [
          'Trip.com offers an English booking route for China trains and other travel products.',
          'Railway 12306 is the official ticketing service and has an English website with registration, search, ticketing, refund, and travel guidance.',
          'Enter your passport name and document number exactly as shown on the passport. The passport used for the booking is also needed for travel.',
          'Check sales dates and availability for your route, especially around national holidays; do not depend on an arbitrary fixed number of days.',
        ],
      },
      {
        title: 'Translation and offline information',
        items: [
          'Choose a translation app that lets you download Chinese for offline use, and test it in airplane mode before departure.',
          'If the app supports camera translation, download any required language files and permissions in advance.',
          'Keep essential phrases, allergies, hotel details, tickets, and emergency information as screenshots as well as inside apps.',
          'ChinaEase Buddy can keep practical China travel references together in English, but it should not be your only offline backup.',
        ],
      },
      {
        title: 'Internet access changes which apps work',
        items: [
          'Ordinary mainland mobile networks and Wi-Fi are subject to local internet controls. Google, Facebook, YouTube, X, and some other services are blocked or restricted.',
          'International roaming and travel eSIM routing differ by provider and plan. Confirm access, hotspot support, data limits, and activation timing on the exact product page.',
          'A travel eSIM is not automatically a VPN, and online services such as VPNs are subject to Chinese licensing rules.',
          'Read the China eSIM & Internet Guide before choosing a connection plan.',
        ],
      },
      {
        title: 'Common setup mistakes to avoid',
        items: [
          'Downloading an unofficial clone or the wrong regional version of an app.',
          'Losing access to the phone number used for verification after changing SIM settings.',
          'Depending on one wallet, one map, or one internet connection without a backup.',
          'Arriving without the hotel address and first destination saved in Chinese.',
          'Deleting an eSIM while troubleshooting or storing all tickets only inside an online account.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What apps should I download before visiting China?',
        answer:
          'Most first-time visitors should prepare Alipay, WeChat, AMap Global, DiDi, Trip.com or Railway 12306, and an offline translation tool. Also arrange mobile data and keep offline copies of hotel, ticket, and emergency information.',
      },
      {
        question: 'Is AMap Global available in English?',
        answer:
          'AMap now markets a global version with worldwide map and route-planning services. Language and features can still vary by region, phone, and app version, so install and test your exact version before travel.',
      },
      {
        question: 'Does Google Maps work in mainland China?',
        answer:
          'Do not rely on it as your only map. Google services are blocked on ordinary mainland internet connections. Prepare AMap Global or another currently supported local navigation option and save key addresses in Chinese.',
      },
      {
        question: 'Can I book China train tickets with a foreign passport?',
        answer:
          'Yes. Travelers can use an eligible passport through services such as Trip.com or the official Railway 12306 system. Enter the name and document number exactly as shown on the passport and carry that passport when traveling.',
      },
      {
        question: 'Should I set these apps up before or after arriving?',
        answer:
          'Before. Install, register, verify, and test them before departure while you have reliable internet and access to your usual phone number. Keep backup payment, navigation, and offline information in case one setup fails.',
      },
      {
        question: 'Do I need a Chinese phone number for every app?',
        answer:
          'No, not for every app, but registration and individual features vary. Keep access to your home number for verification and check each provider\'s current requirements before departure.',
      },
    ],
    related: [
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'AMap in English', href: '/amap-in-english/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'How to order food in China', href: '/china-food-ordering-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'AMap Global official Google Play listing', href: 'https://play.google.com/store/apps/details?id=com.autonavi.minimap' },
      { label: 'Alipay official Google Play listing', href: 'https://play.google.com/store/apps/details?id=com.eg.android.AlipayGphone' },
      { label: 'WeChat official Google Play listing', href: 'https://play.google.com/store/apps/details?id=com.tencent.mm' },
      { label: 'Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
      { label: 'Trip.com official website', href: 'https://www.trip.com/' },
      { label: 'UK government China internet-access advice', href: 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access' },
    ],
  },
  'china-train-travel-guide': {
    path: '/china-train-travel-guide/',
    title: 'China Train Travel Guide for Foreigners (2026)',
    intro:
      'A step-by-step guide to booking China high-speed trains with a foreign passport, choosing the right station, and boarding without confusion.',
    metaTitle: 'China Train Guide for Foreigners (2026) | ChinaEase Buddy',
    metaDescription:
      'Book China high-speed train tickets with a foreign passport. Compare 12306 and Trip.com, complete verification, board correctly, and fix common problems.',
    quickAnswer:
      'Foreign visitors can buy China train tickets with a valid passport through the official Railway 12306 system, an authorised booking service such as Trip.com, or a station ticket counter. Enter the passenger name and passport number exactly as shown on the passport, check the full station name because many cities have several stations, and carry the same original passport to enter, board, and exit. Most journeys use an e-ticket, so an itinerary sheet or screenshot is useful for reference but does not replace the passport used for booking.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 17, 2026',
    lastModified: '2026-09-17',
    isArticle: true,
    sections: [
      {
        title: 'Choose where to book',
        table: {
          headers: ['Booking channel', 'Best for', 'Check before paying'],
          rows: [
            ['Railway 12306', 'Booking directly with the official operator', 'Account and passport verification, payment options, live change and refund rules'],
            ['Trip.com', 'A familiar English third-party booking flow', 'Final price, service fees, support, issuance status, and refund terms'],
            ['Station counter', 'Online verification failure or staff help', 'Bring the original passport for every passenger and allow extra time'],
          ],
        },
        items: [
          'Use the same booking channel to manage an order when possible, because third-party support and Railway 12306 handle their own orders differently.',
          'China Railway states that it does not handle ticketing problems caused by other websites, so save the third party\'s support details if you use one.',
        ],
      },
      {
        title: 'Prepare these details before searching',
        items: [
          'The exact passport name, passport number, nationality, and date of birth for every passenger.',
          'The full departure and arrival station names. Beijing, Shanghai, Guangzhou, Shenzhen, and many other cities have multiple major stations.',
          'A train and arrival time that still leaves enough time for hotel check-in, local transport, or a connecting flight.',
          'A payment method accepted by your chosen booking channel and access to the phone number or email used for verification.',
          'A backup train or travel time in case your preferred service sells out.',
        ],
      },
      {
        title: 'Book on the official Railway 12306 service',
        ordered: true,
        items: [
          'Use the official English website or official app, create an account, and add each traveler under the passenger list.',
          'Select passport as the identity-document type and copy every character carefully. Do not shorten, translate, or rearrange the name unless the system specifically instructs you.',
          'Complete the identity-verification steps shown for the account. If online verification does not complete, follow the current 12306 prompt or ask at a staffed station counter.',
          'Search by the exact stations and date, then compare departure time, journey length, arrival station, seat class, and transfer risk.',
          'Pay within the displayed time and save the order number, train number, carriage, seat, station names, and departure time offline.',
        ],
      },
      {
        title: 'Book through Trip.com or another sales agent',
        items: [
          'Check whether the result is an immediately issued ticket, a request to purchase when sales open, or a waitlist-style service.',
          'Review the final amount, currency, service fee, cancellation terms, and customer-support channel before payment.',
          'Enter passport details exactly as printed and check the confirmation again after the ticket is issued.',
          'For changes or refunds, begin with the company that issued the order.',
        ],
      },
      {
        title: 'Understand the ticket and train details',
        items: [
          'G, D, and C services are commonly shown for high-speed or intercity rail, while other letter prefixes and numbers can indicate conventional services. Compare journey time rather than relying only on the train letter.',
          'Second class is the standard high-speed-rail choice for most travelers; first class and business class offer more space at a higher price when available.',
          'Confirm both station names, not only the cities. A ticket to Shanghai Hongqiao is different from a ticket to Shanghai Station.',
          'Your confirmation should show the train number, date, departure and arrival stations, departure time, carriage, and seat after issuance.',
        ],
      },
      {
        title: 'Enter the station and board the train',
        ordered: true,
        items: [
          'Go to the exact station printed in the booking and allow generous time for finding the entrance, security, identity checks, and the correct waiting area.',
          'Use the original passport entered during booking. An itinerary sheet, reimbursement receipt, order screenshot, or passport copy does not replace it.',
          'At stations where the automatic gate does not read a foreign passport, use a staffed or manual verification lane and show the passport.',
          'Complete the security check, then find the waiting room or gate shown on the station displays. Gate information can appear closer to departure.',
          'When boarding opens, follow the platform and carriage signs, then match the carriage and seat number in your confirmation.',
          'Keep the passport available after arrival because it may be required again to exit the destination station.',
        ],
      },
      {
        title: 'Changes, refunds, and missed trains',
        items: [
          'Railway 12306 supports ticket changes and refunds, subject to seat availability, timing, ticket status, and the current fee rules shown for the order.',
          'A ticket can generally be changed only once under the official rules, and some destination changes must be requested before a stated deadline.',
          'If you booked through a third party, use that provider first and check whether its service fees are refundable.',
          'Do not assume a screenshot or an unused ticket lets you take a later train. Use the official change process or ask station staff immediately.',
          'Rules can be adjusted temporarily, so use the live order page and station announcements as the final authority.',
        ],
      },
      {
        title: 'Common problems and what to do',
        items: [
          'Passport will not scan: use the staffed gate or identity-verification lane rather than repeatedly trying the automatic gate.',
          'Name or passport number is wrong: contact the issuer before travel; do not assume staff can ignore a mismatch at the gate.',
          'Wrong station: check the Chinese and English station name before leaving the hotel and allow extra time when cities have multiple stations.',
          'No ticket available: check another departure time, seat class, nearby station, or route, but avoid unverified resellers.',
          'Lost passport: contact the relevant authority and station staff immediately. A phone photo alone is not a substitute for the required document.',
          'No mobile data: keep the order number, train details, hotel address, and booking-support information available offline.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners buy China train tickets with a passport?',
        answer:
          'Yes. China Railway states that foreign passengers can purchase real-name tickets with a valid passport accepted under the applicable rules. The passport details must match the passenger and the original document should be carried for travel.',
      },
      {
        question: 'Should I use Railway 12306 or Trip.com?',
        answer:
          'Use Railway 12306 if you want to book directly with the official operator and can complete its account setup. Trip.com can offer a more familiar English booking flow, but check the final price, service fees, support, and refund terms.',
      },
      {
        question: 'Do I need to collect a paper train ticket?',
        answer:
          'Usually not for an e-ticket. The valid passport used to purchase the ticket is the key travel document. An itinerary sheet or reimbursement receipt cannot be used as the ticket.',
      },
      {
        question: 'What if the station gate cannot scan my passport?',
        answer:
          'Use a staffed or manual verification lane and show the original passport. Arrive with enough time for security and identity checks rather than waiting until boarding closes.',
      },
      {
        question: 'How early should I arrive at a China railway station?',
        answer:
          'China Railway advises passengers to reserve enough time because station entrances, security, identity checks, waiting rooms, and platforms can involve queues and walking. For an unfamiliar large station, arriving roughly 45 to 60 minutes early is a practical buffer, but follow local instructions.',
      },
      {
        question: 'Can I change or refund a China train ticket?',
        answer:
          'Yes, subject to the current rules, timing, ticket status, fees, and seat availability. Manage the booking through the original issuer and read the live conditions before confirming.',
      },
      {
        question: 'Why does the exact station name matter?',
        answer:
          'Large Chinese cities often have several railway stations located far apart. Check the complete departure and arrival station names before booking and again before leaving for the station.',
      },
    ],
    related: [
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'Railway 12306 English website', href: 'https://www.12306.cn/en/index.html' },
      { label: 'Railway 12306 official English FAQ', href: 'https://www.12306.cn/en/faq.html' },
      { label: 'Trip.com official website', href: 'https://www.trip.com/' },
    ],
  },
  'amap-in-english': {
    path: '/amap-in-english/',
    title: 'How to Use AMap in English in China (2026)',
    intro: 'A practical map guide for English place search, walking and metro routes, stations, entrances, mobile data, and common navigation problems.',
    metaTitle: 'AMap in English: China Map Guide (2026) | ChinaEase Buddy',
    metaDescription:
      'Use AMap in English for China travel. Learn setup, English place search, walking and metro routes, saved addresses, ride-hailing, and navigation fixes.',
    quickAnswer:
      'AMap, also called Gaode Maps, offers an English version for overseas users and can plan walking, public-transport, driving, and other routes in mainland China. Download it from an official app store, test the English interface before departure, and save the Chinese name and address of every important destination. When searching, select the exact hotel branch, station building, terminal, entrance, or metro exit rather than relying on a general place name. Keep screenshots and a second navigation option in case mobile data, GPS, or place search fails.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    isArticle: true,
    sections: [
      {
        title: 'Download and prepare AMap before your trip',
        ordered: true,
        items: [
          'Download AMap or AMap Global only from its official website or your phone\'s official app store. Check the publisher before installing.',
          'Open the language settings and select English if it is not already active. Names and menu locations can change by phone, region, and app version.',
          'Allow location access while using the app if you want live positioning and turn-by-turn guidance; review other permissions instead of accepting them automatically.',
          'Search your first hotel, airport terminal, railway station, and key attractions while you still have reliable internet.',
          'Save the destination name, Chinese address, phone number, and a screenshot outside the app so you can show them to staff or a driver.',
          'Arrange mobile data and keep a charged phone or power bank. Live traffic, search, and route updates depend on connectivity.',
        ],
      },
      {
        title: 'Search for the correct place',
        items: [
          'Start with the full English place name, but use the Chinese name or address when English search returns no result or the wrong result.',
          'For hotels, restaurants, shops, hospitals, and attractions with several branches, compare the district, street, phone number, photos, and distance.',
          'For a large attraction, search for the ticket entrance or visitor entrance rather than the centre point of the entire site.',
          'For a railway station or airport, confirm the complete station name, terminal, departure level, arrival level, or pickup area.',
          'Do not assume the first search result is correct. Save the verified place before starting the route.',
        ],
      },
      {
        title: 'Plan walking and public-transport routes',
        items: [
          'Choose the route mode you actually need: walking, public transport, driving, cycling, or another option shown in your version.',
          'For public transport, compare the departure time, total duration, number of transfers, walking distance, and last-service information shown in the app.',
          'Check the named metro station entrance when entering and the recommended station exit at your destination. The wrong exit can add a long surface walk.',
          'For walking routes, zoom in around large roads, elevated walkways, shopping centres, parks, and compounds to confirm the accessible entrance.',
          'Route details and service availability can change. Follow official signs and staff instructions when they differ from the map.',
        ],
      },
      {
        title: 'Use AMap at airports and railway stations',
        items: [
          'Confirm the airport terminal or the full railway-station name before leaving your hotel; major cities can have several distant stations and terminals.',
          'Search for the correct entrance, departure hall, metro connection, taxi queue, or ride-hailing pickup point instead of the general station pin.',
          'Leave extra time for security, walking inside the complex, and finding the correct gate or waiting area.',
          'Once inside, treat official signs, screens, tickets, and staff instructions as the final authority. Indoor routes and access controls may change faster than the map.',
        ],
      },
      {
        title: 'AMap maps and ride-hailing are different tasks',
        items: [
          'AMap is useful for place search, route planning, live traffic, and navigation. Some versions can also display ride-hailing services.',
          'A ride-hailing entry inside AMap does not guarantee the same English support, payment methods, identity checks, or customer service as the standalone DiDi route.',
          'Before ordering a car, confirm the pickup pin, destination, service category, estimated fare, payment method, and vehicle details shown on your screen.',
          'For a dedicated step-by-step ride guide, use the separate DiDi in China for Foreigners page.',
        ],
      },
      {
        title: 'What to save for weak or missing mobile data',
        items: [
          'Take screenshots of the full route, key turns, metro line and transfer stations, destination entrance, and return route.',
          'Keep your hotel name, Chinese address, phone number, and nearest metro station in your notes.',
          'Assume that live search, traffic, and route recalculation require internet unless your exact app version clearly confirms an offline feature.',
          'Carry a second data option or know where to find official station, hotel, or visitor-service help.',
        ],
      },
      {
        title: 'Common AMap problems and fixes',
        items: [
          'No English search result: paste the Chinese place name or full Chinese address from the hotel, booking, attraction, or official website.',
          'Wrong branch: compare the district, street, phone number, photos, opening information, and distance before choosing.',
          'Location appears wrong: check GPS and location permission, confirm mobile data, step outside dense buildings, and wait for the position to refresh.',
          'Walking route ends at the wrong side: look for the named gate or entrance and zoom in for footbridges, tunnels, compounds, or road barriers.',
          'Public-transport route is unavailable or no longer practical: check a later route, another station entrance, an official taxi queue, or DiDi.',
        ],
      },
      {
        title: 'Useful Chinese map phrases',
        items: [
          '这个地址在哪里？ — Where is this address?',
          '请问最近的地铁站入口在哪里？ — Where is the nearest metro entrance?',
          '我应该从哪个出口出去？ — Which exit should I use?',
          '这是正确的火车站吗？ — Is this the correct railway station?',
          '请带我到这个地址。 — Please take me to this address.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is AMap available in English?',
        answer:
          'Yes. AMap launched an English map experience for overseas users, with English interface and place information. Exact language coverage and menus can vary by app version and location.',
      },
      {
        question: 'Can foreigners use AMap in China?',
        answer:
          'Yes. Overseas users can download AMap from supported official app stores and use it for place search and route planning. Some account-based or transaction features may require additional setup.',
      },
      {
        question: 'Do I need a Chinese phone number for AMap?',
        answer:
          'Basic map search and route planning may be available without a Chinese number, but login, saved data, ride-hailing, or other account features can vary. Follow the requirements shown in your current version and keep access to your travel phone number.',
      },
      {
        question: 'Can AMap plan metro and walking routes?',
        answer:
          'Yes. AMap provides public-transport and walking route planning. Check the station entrance, destination exit, transfers, walking distance, and current service information before starting.',
      },
      {
        question: 'Does Google Maps work in mainland China?',
        answer:
          'Do not rely on Google Maps as your only map on an ordinary mainland China connection. Access to some international services can be restricted, so prepare AMap and save essential addresses and screenshots before travel.',
      },
      {
        question: 'Does AMap work offline?',
        answer:
          'Some capabilities can vary by device and version. Unless your version clearly confirms an offline feature, assume search, live traffic, and route recalculation need mobile data and save route screenshots as a backup.',
      },
      {
        question: 'Should I use AMap or DiDi?',
        answer:
          'Use AMap mainly for maps, place search, walking and public-transport routes, and navigation. Use DiDi when you want a dedicated ride-hailing flow with pickup, vehicle, trip, payment, and support details.',
      },
    ],
    related: [
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'DiDi in China for foreigners', href: '/didi-in-china-for-foreigners/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      { label: 'AMap official mobile website', href: 'https://mobile.amap.com/' },
      { label: 'AMap official Google Play listing', href: 'https://play.google.com/store/apps/details?id=com.autonavi.minimap' },
      {
        label: 'Shanghai city guide: AMap English launch',
        href: 'https://www.meet-in-shanghai.net/en/news/gaode-maps-launches-chinas-first-english-map-for-overseas-users-600989/',
      },
      {
        label: 'Shanghai government: essential apps for visitors',
        href: 'https://english.shanghai.gov.cn/en-UsefulApps/20231214/3cac2d8cc7f847da92a72252bae06705.html',
      },
      {
        label: 'UK travel advice: internet access in China',
        href: 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access',
      },
    ],
  },
  'china-metro-guide': {
    path: '/china-metro-guide/',
    title: 'China Metro Guide for Foreigners (2026)',
    intro: 'A practical guide to tickets, overseas cards, transport QR codes, security, transfers, station exits, luggage, and late trains.',
    metaTitle: 'China Metro Guide for Foreigners (2026) | ChinaEase Buddy',
    metaDescription:
      'Ride China metros with confidence. Learn tickets, overseas card and QR payment, security checks, transfers, station exits, luggage, and late-train tips.',
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
      { label: 'AMap in English', href: '/amap-in-english/' },
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
    title: 'How to Use DiDi in China as a Foreigner (2026)',
    intro: 'A practical ride-hailing guide for app setup, pickup points, car verification, driver messages, payment, and common problems.',
    metaTitle: 'DiDi in China for Foreigners (2026) | ChinaEase Buddy',
    metaDescription:
      'Use DiDi in China with an international phone number. Learn app setup, pickup points, car verification, driver messages, payment, and problem solving.',
    quickAnswer:
      'Foreign visitors can use the DiDi China ride-hailing app with an international mobile number and an English interface, or access DiDi through supported WeChat and Alipay routes. Before requesting a car, save the exact destination in Chinese, confirm the pickup pin and meeting point, compare the service type and estimated fare, and prepare a payment method shown in your version. When the car arrives, match the licence plate and vehicle details before entering.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    isArticle: true,
    sections: [
      {
        title: 'Choose how you will open DiDi',
        table: {
          headers: ['Route', 'What to know'],
          rows: [
            ['DiDi China app', 'Official listings advertise an English interface, global mobile-number login, bilingual messages, and multiple payment methods.'],
            ['Alipay', 'The English version can provide a DiDi entry, with payment handled through the options available in Alipay.'],
            ['WeChat', 'Ride Hailing may appear inside Services, with payment handled through the available WeChat Pay route.'],
          ],
        },
        items: [
          'Menus, services, and payment choices can vary by phone, region, account, and app version. Set up and test the route you plan to use before arrival.',
        ],
      },
      {
        title: 'Prepare before requesting your first ride',
        ordered: true,
        items: [
          'Install the official DiDi China app or confirm that the DiDi entry opens inside your prepared Alipay or WeChat account.',
          'Register with a mobile number you can access and switch to English if that option is available.',
          'Complete any identity or payment verification requested by the app or wallet.',
          'Save your hotel, airport terminal, railway station, and first destinations in Chinese as well as English.',
          'Allow location access only while using the app if that matches your preference, then check that the pickup pin follows your real position.',
          'Keep mobile data, a charged phone, and a backup payment and transport option.',
        ],
      },
      {
        title: 'Book a DiDi ride step by step',
        ordered: true,
        items: [
          'Enter the destination and select the correct branch, entrance, terminal, or station building rather than relying only on the general place name.',
          'Move or confirm the pickup pin and read the pickup description before choosing a car.',
          'Compare the service category, estimated price, passenger capacity, and pickup time shown in the app.',
          'Request the ride and wait for the driver and vehicle details to appear.',
          'Use the in-app translated message function when possible instead of moving the conversation to another channel.',
          'At pickup, match the licence plate, vehicle model or colour, and driver information before entering.',
          'Confirm the destination and follow the route in the app. After arrival, check the final fare and payment status.',
        ],
      },
      {
        title: 'Airport and railway-station pickup points',
        items: [
          'Large airports and stations can have separate ride-hailing zones, floors, gates, car parks, or numbered pickup areas.',
          'Do not place the order until you know the terminal or station exit and can reach the selected pickup area.',
          'Use the pickup instructions shown in the app and send the exact zone, floor, gate, or pillar number to the driver.',
          'If the location is confusing, ask airport, station, or hotel staff to confirm the official ride-hailing pickup point.',
          'Avoid accepting an unsolicited off-platform ride from someone approaching you inside the terminal.',
        ],
      },
      {
        title: 'Verify the car and ride safely',
        items: [
          'Match the licence plate shown in the app before opening the door. Do not enter a different car because the driver knows your destination.',
          'The driver may ask for the last four digits of the registered phone number as a pickup confirmation.',
          'Wear the seat belt and keep the trip visible in the app. Use the app\'s sharing or safety functions when available.',
          'Keep communication and payment inside the platform when possible, and do not share payment passwords or verification codes.',
          'For an immediate safety emergency, leave the vehicle when safe and contact local emergency services such as police on 110.',
        ],
      },
      {
        title: 'Payment, estimates, and receipts',
        items: [
          'The payment method depends on whether you booked through the DiDi app, Alipay, or WeChat and on the options available to your account.',
          'Review the estimated fare and service category before confirming; tolls, waiting, route changes, and other displayed charges can affect the final amount.',
          'Wait for the trip to end in the app before assuming payment is complete, and check whether any action is still required.',
          'Keep the digital trip record or request a receipt when you may need to identify the vehicle, challenge a charge, or report a lost item.',
          'Carry a second digital wallet, a physical card, and some RMB rather than relying on one payment route.',
        ],
      },
      {
        title: 'If the driver calls or cannot find you',
        items: [
          'Send a translated in-app message with the exact pickup zone, gate, floor, or nearby landmark.',
          'Share a photo only if it does not expose sensitive personal information and the platform provides an appropriate route.',
          'Ask nearby staff to speak briefly with the driver if communication is blocking the pickup.',
          'Before cancelling, review any cancellation warning or fee shown in the app and confirm that the driver has not already arrived.',
          'If no car accepts the request, try an official taxi queue, public transport, or another supported ride-hailing category.',
        ],
      },
      {
        title: 'Useful driver messages',
        items: [
          '我在网约车上车点。 — I am at the ride-hailing pickup point.',
          '我在二号门。 — I am at Gate 2.',
          '请问您的车牌号是多少？ — What is your licence plate number?',
          '请送我到这个地址。 — Please take me to this address.',
          '请在这里停车。 — Please stop here.',
          '我把东西落在车上了。 — I left something in the car.',
        ],
      },
      {
        title: 'If you have a fare, support, or lost-item problem',
        ordered: true,
        items: [
          'Open the completed trip in the same app or mini-program used to book it.',
          'Save the trip number, time, route, licence plate, charge, and relevant screenshots.',
          'Use the trip-specific help or in-app customer-service route rather than contacting an unrelated regional DiDi service.',
          'For a lost item, report it promptly without publishing the driver\'s personal information.',
          'If the issue involves an urgent safety risk or suspected crime, contact local authorities as well as the platform.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners use DiDi in China?',
        answer:
          'Yes. The official DiDi China app advertises an English interface and global mobile-number login for inbound visitors. DiDi may also be available through supported Alipay and WeChat routes.',
      },
      {
        question: 'Can I register for DiDi with a foreign phone number?',
        answer:
          'The official DiDi China store listings state that global mobile-number login is supported. Keep access to that number for verification and trip communication.',
      },
      {
        question: 'Is DiDi available in English?',
        answer:
          'The DiDi China app offers an English interface for inbound users, and English availability may also depend on the Alipay or WeChat route and version you use.',
      },
      {
        question: 'How do I pay for DiDi in China?',
        answer:
          'Follow the payment choices shown in the booking route you use. The DiDi app, Alipay, and WeChat can present different options, so prepare and verify your payment method before requesting a car.',
      },
      {
        question: 'How do I find my DiDi at an airport or railway station?',
        answer:
          'Check the terminal or station exit first, then follow the app to the designated ride-hailing zone. Send the driver the floor, gate, zone, or pillar number and verify the licence plate at pickup.',
      },
      {
        question: 'What if the DiDi driver calls me in Chinese?',
        answer:
          'Use the app\'s bilingual messaging where available, send a short pickup description, or ask nearby staff to help with a brief call. Save essential pickup phrases in Chinese before traveling.',
      },
      {
        question: 'How do I report a lost item or incorrect charge?',
        answer:
          'Open the completed trip, save its details and screenshots, and use the trip-specific help or customer-service route inside the same app or mini-program used to book it.',
      },
    ],
    related: [
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'AMap in English', href: '/amap-in-english/' },
      { label: 'China metro guide', href: '/china-metro-guide/' },
      { label: 'China train travel guide', href: '/china-train-travel-guide/' },
      { label: '10-day China itinerary', href: '/10-day-china-itinerary/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
      {
        label: 'Shanghai government: How to use DiDi Chuxing',
        href: 'https://english.shanghai.gov.cn/en-UsefulApps/20240206/976515bc601f4803b9ce2f64ae9f0cd3.html',
      },
      {
        label: 'DiDi China official Google Play listing',
        href: 'https://play.google.com/store/apps/details?id=com.sdu.didi.psnger',
      },
      {
        label: 'DiDi China official Apple App Store listing',
        href: 'https://apps.apple.com/us/app/didi-china-ride-hailing/id554499054',
      },
      {
        label: 'DiDi official customer-support direction',
        href: 'https://didiglobal.com/contact',
      },
    ],
  },
  '10-day-china-itinerary': {
    path: '/10-day-china-itinerary/',
    title: '10-Day China Itinerary for First-Time Visitors',
    intro:
      'A realistic Beijing–Xi\'an–Shanghai route that balances iconic sights, intercity travel, recovery time, and the practical setup a first trip requires.',
    metaTitle: '10-Day China Itinerary for First-Time Visitors | ChinaEase Buddy',
    metaDescription:
      'Plan a classic 10-day China trip through Beijing, Xi\'an, and Shanghai with daily highlights, train advice, booking tips, and flexible alternatives.',
    quickAnswer:
      'For a first 10-day trip to China, use a simple three-city route: four nights in Beijing for imperial history and the Great Wall, three nights in Xi\'an for the Terracotta Warriors and Tang-era culture, and three nights in Shanghai for the old city, the Bund, and modern China. Travel from Beijing to Xi\'an by high-speed train, then choose a flight or longer train to Shanghai. Reserve the Palace Museum and Terracotta Warriors in advance, keep the first arrival day light, and avoid adding a fourth major city unless you are comfortable with a faster pace.',
    ctaLabel: 'Get my personalised 10-day itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    isArticle: true,
    sections: [
      {
        title: 'The 10-day route at a glance',
        table: {
          headers: ['Day', 'Base', 'Main plan'],
          rows: [
            ['1', 'Beijing', 'Arrive, check in, set up data and payments, take a short local walk'],
            ['2', 'Beijing', 'Tiananmen area, Palace Museum, and Jingshan Park'],
            ['3', 'Beijing', 'Full-day Great Wall trip'],
            ['4', 'Beijing', 'Temple of Heaven and hutongs, or swap in the Summer Palace'],
            ['5', 'Xi\'an', 'High-speed train, then City Wall or Bell and Drum Tower area'],
            ['6', 'Xi\'an', 'Terracotta Warriors and an easy evening in the city'],
            ['7', 'Xi\'an', 'History or Tang-culture sights and Giant Wild Goose Pagoda area'],
            ['8', 'Shanghai', 'Old city, Yu Garden area, the Bund, and Pudong skyline'],
            ['9', 'Shanghai', 'Neighbourhoods, a museum, or a nearby water-town day trip'],
            ['10', 'Shanghai', 'Flexible final morning and airport transfer'],
          ],
        },
      },
      {
        title: 'Days 1–4: Beijing',
        items: [
          'Day 1 should stay light. International arrival, immigration, airport transfer, payment setup, and jet lag can consume more time than expected.',
          'On Day 2, group the Tiananmen area, Palace Museum, and Jingshan because they form one logical central route. Check each site\'s current reservation and entry rules before travel.',
          'Give the Great Wall a full day. Transport time, security, walking, weather, and queues make it a poor fit for the same day as another major attraction.',
          'Use Day 4 for the Temple of Heaven and hutongs, or choose the Summer Palace instead. Trying to cover every famous Beijing sight reduces the quality of the trip.',
          'Stay near a useful metro line rather than choosing only by straight-line distance to one attraction.',
        ],
      },
      {
        title: 'Days 5–7: Xi\'an',
        items: [
          'Take a daytime high-speed train from Beijing to Xi\'an so you can experience China\'s rail system and avoid another airport transfer.',
          'After arrival, keep Day 5 flexible: walk a section of the City Wall or explore the Bell and Drum Tower area if energy allows.',
          'Reserve Day 6 for the Terracotta Warriors. The museum is outside central Xi\'an, so include the round-trip transport time and avoid stacking too many city attractions afterward.',
          'On Day 7, choose the Shaanxi History Museum or another Tang-history focus, then visit the Giant Wild Goose Pagoda area. Confirm current reservation requirements.',
          'Travel to Shanghai in the evening only if the schedule is comfortable. Otherwise leave the next morning and simplify Day 8.',
        ],
      },
      {
        title: 'Days 8–10: Shanghai',
        items: [
          'Use the first full day to contrast old and new Shanghai: Yu Garden or the old-city area, the Bund, and the Pudong skyline.',
          'Use Day 9 for slower neighbourhood exploration, a museum, contemporary architecture, or a nearby water town. Pick one theme rather than crossing the city repeatedly.',
          'Keep Day 10 partly open for weather changes, a missed attraction, shopping, or an unhurried airport transfer.',
          'Shanghai has multiple airports and railway stations. Confirm the exact departure point and allow a realistic transfer buffer.',
        ],
      },
      {
        title: 'Book these items before departure',
        ordered: true,
        items: [
          'International flights and hotels with clear foreign-guest policies, flexible cancellation, and addresses saved in Chinese.',
          'The Palace Museum through its official ticket channel, plus any other Beijing sites that currently require timed reservations.',
          'Terracotta Warriors admission through the official museum or a clearly authorised sales channel.',
          'Beijing–Xi\'an and Xi\'an–Shanghai transport when the relevant booking window opens; use the passport details exactly.',
          'A mainland China eSIM or roaming plan, Alipay, WeChat, AMap Global, and an offline translation option.',
          'Airport transfers or late-night arrival plans for any leg that ends after normal public-transport hours.',
        ],
      },
      {
        title: 'How to pace the trip well',
        items: [
          'Treat arrival and intercity travel as real itinerary time, not empty space between attractions.',
          'Plan one major anchor experience per day and add nearby optional stops only when energy, weather, and queues allow.',
          'Keep at least one flexible half-day. Weather, attraction closures, ticket availability, and fatigue can change the best plan.',
          'Avoid changing hotels inside the same city unless the location problem is severe; packing and check-in cost more time than expected.',
          'Use a personalised route if you have children, limited mobility, food allergies, a very early flight, or specialist interests.',
        ],
      },
      {
        title: 'Useful route alternatives',
        items: [
          'Nature priority: replace Shanghai with Guilin and Yangshuo, but allow for the additional transfer complexity.',
          'Food and pandas: replace Shanghai with Chengdu, especially if a slower western-China finish suits the trip.',
          'Modern cities: replace Xi\'an with Shenzhen and Hong Kong only if entry documents and cross-border plans are already clear.',
          'Slower travel: keep only Beijing and Shanghai and add day trips instead of moving through three cities.',
          'Open-jaw flights: arrive in Beijing and depart from Shanghai when fares and entry rules work, avoiding a return to the first city.',
        ],
      },
      {
        title: 'Common first-trip mistakes',
        items: [
          'Adding four or five major cities to a 10-day trip and spending too much of the holiday in transit.',
          'Booking the wrong railway station or airport because only the city name was checked.',
          'Leaving major attraction reservations until arrival during weekends or holiday periods.',
          'Planning every day from early morning to late night without accounting for jet lag, walking, heat, cold, or queues.',
          'Depending on one payment method, one map app, or constant internet access.',
          'Using a generic itinerary without adjusting it for flight times, hotel location, pace, interests, and mobility.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is 10 days enough for a first trip to China?',
        answer:
          'Yes. Ten days is enough for a focused first trip through Beijing, Xi\'an, and Shanghai if you limit hotel changes and treat intercity travel as part of the itinerary. It is not enough to see every major region comfortably.',
      },
      {
        question: 'What is the best 10-day China route for first-time visitors?',
        answer:
          'Beijing, Xi\'an, and Shanghai is the clearest classic route: imperial history and the Great Wall, the Terracotta Warriors and Tang culture, then historic and modern Shanghai.',
      },
      {
        question: 'Should I take trains or flights between the cities?',
        answer:
          'A high-speed train works well from Beijing to Xi\'an. For Xi\'an to Shanghai, compare a longer train with a flight based on the live schedule, total door-to-door time, luggage, and your preferred pace.',
      },
      {
        question: 'Do I need to reserve attractions in advance?',
        answer:
          'Yes for major timed or capacity-controlled attractions. The Palace Museum and the Terracotta Warriors should be checked through their official channels before travel, and requirements can change.',
      },
      {
        question: 'How much should I plan to spend?',
        answer:
          'Costs depend heavily on season, hotel standard, room sharing, transport, and paid experiences. Build separate allowances for hotels, intercity travel, local transport, attractions, food, and mobile data rather than relying on one universal daily figure.',
      },
      {
        question: 'Can I add Chengdu, Guilin, or Zhangjiajie to this route?',
        answer:
          'You can replace one core city, but adding another major city usually makes a 10-day trip rushed. For four cities, extend the trip or accept fewer full sightseeing days.',
      },
      {
        question: 'How can ChinaEase Buddy personalise this itinerary?',
        answer:
          'Share your dates, arrival city, trip length, interests, group size, and practical concerns. ChinaEase Buddy can turn the sample route into a personalised plan that reflects your actual flights and priorities.',
      },
    ],
    related: [
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
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
  'china-esim-internet-guide': {
    path: '/china-esim-internet-guide/',
    title: 'China eSIM & Internet Guide for Tourists (2026)',
    intro:
      'A practical, provider-neutral guide to choosing, installing, activating, and troubleshooting mobile data for a trip to mainland China.',
    metaTitle: 'China eSIM & Internet Guide for Tourists (2026)',
    metaDescription:
      'Choose and set up a China travel eSIM, avoid roaming charges, understand internet restrictions, and fix mobile data problems after arrival.',
    quickAnswer:
      'For most short trips, an international travel eSIM is the simplest way to get mobile data in mainland China if your phone is unlocked and eSIM-compatible. Buy and install it on reliable Wi-Fi before your flight, follow the provider\'s activation timing, select it for cellular data after landing, and keep your home line from using roaming data. Do not assume every China eSIM gives access to Google or other restricted services: routing, phone-number support, hotspot rules, speed limits, and activation policies differ by plan.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 17, 2026',
    lastModified: '2026-09-17',
    isArticle: true,
    sections: [
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
        question: 'Does eSIM work in mainland China?',
        answer:
          'Yes, if your phone is unlocked and eSIM-compatible and the plan explicitly includes mainland China. Apple also lists worldwide providers offering prepaid travel eSIM plans for visitors to mainland China.',
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
      { label: 'China airport arrival guide', href: '/china-airport-arrival-guide/' },
      { label: 'First trip to China', href: '/first-trip-to-china/' },
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Get a free China itinerary', href: '/#trip-plan' },
    ],
    sources: [
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
    title: 'How to Use WeChat Pay in China as a Foreigner (2026)',
    intro: 'A practical setup, QR payment, and troubleshooting guide for first-time visitors using an international bank card.',
    metaTitle: 'WeChat Pay for Foreigners: Setup Guide (2026) | ChinaEase Buddy',
    metaDescription:
      'Set up WeChat Pay for China: register with an overseas number, add an eligible international card, pay by QR code, and troubleshoot common failures.',
    quickAnswer:
      'Foreign visitors can use WeChat Pay in mainland China when the payment feature is available on their account and an eligible international card passes identity and issuer checks. Register the standard WeChat app with a mobile number you can access, open the payment or wallet area shown in your version, add the card, and complete any requested verification. Set it up before departure and keep Alipay, a physical card, and some RMB as backups.',
    ctaLabel: 'Get my free China itinerary',
    ctaHref: '/#trip-plan',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    isArticle: true,
    sections: [
      {
        title: 'What you need before setup',
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
        title: 'WeChat Pay, Weixin Pay, and regional wallets',
        items: [
          'Weixin Pay is the payment service inside the Weixin or WeChat ecosystem for the Chinese mainland.',
          'Regional products such as WeChat Pay HK follow their own eligibility, funding, and cross-border rules.',
          'Do not assume instructions for a regional wallet match the standard international WeChat account on your phone.',
          'Follow the payment menu and terms shown in your exact app version and region.',
        ],
      },
      {
        title: 'Fees, limits, and exchange rates',
        items: [
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
        question: 'Do I need a Chinese bank account for WeChat Pay?',
        answer:
          'Foreign visitors may be able to fund eligible merchant payments with a supported international card, so a Chinese bank account is not always required. Follow the options shown in your account.',
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
        href: 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html',
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
      'Learn how foreigners can pay in China using Alipay or WeChat Pay with an international Visa, Mastercard, or JCB card — no Chinese bank account needed.',
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
      { label: 'How to order food in China', href: '/china-food-ordering-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
    ],
  },
  'china-travel-checklist': {
    path: '/china-travel-checklist/',
    title: 'China Travel Checklist for First-Time Visitors',
    intro: 'A practical pre-trip checklist for apps, payments, phrases, hotel addresses, and emergency basics.',
    metaTitle: 'China Travel Checklist for First-Time Visitors | ChinaEase Buddy',
    metaDescription:
      'Prepare for China with this first-time visitor checklist: apps, payment setup, Chinese hotel address, emergency numbers, offline phrases, passport, and train reminders.',
    quickAnswer:
      'Before traveling to China, prepare key apps, payment options, your hotel address in Chinese, emergency numbers, offline phrases, passport details, and train booking information.',
    ctaLabel: 'Open the free checklist',
    ctaHref: '/?journey=before&tool=checklist',
    sections: [
      {
        title: 'Before you fly',
        items: [
          'Download Alipay, WeChat, Amap, Didi, and Trip.com.',
          'Try payment setup before arrival and keep a backup option.',
          'Save your hotel address in Chinese.',
          'Save 110, 120, and 119 emergency numbers.',
          'Prepare offline translation phrases for taxis, hotels, food, and payment.',
        ],
      },
      {
        title: 'Documents and transport',
        items: [
          'Keep your passport accessible for hotel check-in and train travel.',
          'Use your passport name consistently when booking trains or hotels.',
          'Screenshot booking confirmations and addresses.',
          'Check airport transfer options before landing.',
        ],
      },
      {
        title: 'Food and health reminders',
        items: [
          'Prepare allergy phrases in Chinese if needed.',
          'Know how to ask about peanuts, shellfish, gluten, meat, or spicy food.',
          'Bring routine medication according to applicable rules and official guidance.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What should first-time visitors prepare before going to China?',
        answer:
          'Prepare local apps, payment methods, Chinese hotel addresses, emergency numbers, offline phrases, passport details, and transport bookings.',
      },
      {
        question: 'Should I save my hotel address in Chinese?',
        answer:
          'Yes. A Chinese hotel address is helpful for taxis, ride-hailing pickups, hotel returns, and asking locals for directions.',
      },
      {
        question: 'Do I need offline phrases in China?',
        answer:
          'Offline phrases are useful when mobile data is weak, apps are unavailable, or you need to show a clear Chinese sentence quickly.',
      },
      {
        question: 'Is this checklist visa advice?',
        answer:
          'No. This checklist is general travel preparation only. Confirm entry, visa, and document requirements with official sources.',
      },
    ],
    related: [
      { label: 'Apps to download before China', href: '/china-travel-apps/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
    ],
  },
  'china-emergency-numbers': {
    path: '/china-emergency-numbers/',
    title: 'Emergency Numbers in China for Travelers',
    intro: 'Key emergency numbers and practical words to show locals when something goes wrong in China.',
    metaTitle: 'Emergency Numbers in China for Travelers | ChinaEase Buddy',
    metaDescription:
      'Know China emergency numbers for travelers: 110 police, 120 ambulance, 119 fire, plus hospital phrases, police help, and lost passport reminders.',
    quickAnswer:
      'The key emergency numbers in China are 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services and ask nearby staff, hotel reception, or authorities for help.',
    ctaLabel: 'View emergency help',
    ctaHref: '/?journey=emergency',
    sections: [
      {
        title: 'Numbers to know',
        items: ['110 Police', '120 Ambulance', '119 Fire'],
      },
      {
        title: 'What to show locals',
        items: [
          'Please help me call the police. / 请帮我报警。',
          'Please help me call an ambulance. / 请帮我叫救护车。',
          'I lost my passport. / 我的护照丢了。',
          'I lost my phone. / 我的手机丢了。',
        ],
      },
      {
        title: 'Hospital and police reminders',
        items: [
          'Use 120 for ambulance emergencies and ask hotel staff for nearby hospital help.',
          'For theft, loss, or immediate safety issues, contact police or local authorities.',
          'For lost passport issues, contact your embassy or consulate after urgent safety needs are handled.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What are the emergency numbers in China?',
        answer:
          'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. These are reference numbers and should be used according to the situation.',
      },
      {
        question: 'What should I do if I need a hospital in China?',
        answer:
          'For urgent medical emergencies, call 120 or ask nearby staff to help. ChinaEase Buddy can show simple Chinese phrases, but it does not provide medical advice.',
      },
      {
        question: 'What should I do if I lose my passport in China?',
        answer:
          'First handle immediate safety needs. Then contact local police if needed and reach your embassy or consulate for passport replacement guidance.',
      },
      {
        question: 'Can ChinaEase Buddy contact emergency services for me?',
        answer:
          'No. ChinaEase Buddy provides reference numbers and phrases. Travelers must contact emergency services, local authorities, or qualified professionals directly.',
      },
    ],
    related: [
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Food ordering and allergy guide', href: '/china-food-ordering-guide/' },
      { label: 'FAQ', href: '/faq/' },
    ],
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

function GuidePage({ type, userId }: { type: GuidePageType; userId?: string | null }) {
  const page = guidePages[type];
  useGuideSeo(page);

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
        <section className="rounded-2xl border border-[#155e63]/15 bg-[#155e63]/5 p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Quick answer</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 md:text-base">{page.quickAnswer}</p>
          <p className="mt-3 text-xs font-semibold text-gray-500">Last reviewed: {page.lastReviewed || 'June 12, 2026'}</p>
          <a
            href={page.ctaHref}
            onClick={() => {
              void trackEvent('cta_clicked', {
                ctaName: page.ctaLabel,
                destination: page.ctaHref,
                tool: type,
              }, userId);
            }}
            className="mt-4 inline-flex rounded-full bg-[#155e63] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e4a4e]"
          >
            {page.ctaLabel}
          </a>
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

        <section id="faq" className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:p-5">
          <h2 className="text-xl font-bold text-gray-950">FAQ</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {page.faqs.map((faq) => (
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
  if (cleanPath.endsWith('/china-travel-apps')) return 'china-travel-apps';
  if (cleanPath.endsWith('/amap-in-english')) return 'amap-in-english';
  if (cleanPath.endsWith('/china-metro-guide')) return 'china-metro-guide';
  if (cleanPath.endsWith('/didi-in-china-for-foreigners')) return 'didi-in-china-for-foreigners';
  if (cleanPath.endsWith('/china-train-travel-guide')) return 'china-train-travel-guide';
  if (cleanPath.endsWith('/10-day-china-itinerary')) return '10-day-china-itinerary';
  if (cleanPath.endsWith('/china-esim-internet-guide')) return 'china-esim-internet-guide';
  if (cleanPath.endsWith('/alipay-for-foreigners')) return 'alipay-for-foreigners';
  if (cleanPath.endsWith('/wechat-pay-for-foreigners')) return 'wechat-pay-for-foreigners';
  if (cleanPath.endsWith('/china-payment-guide')) return 'china-payment-guide';
  if (cleanPath.endsWith('/china-travel-checklist')) return 'china-travel-checklist';
  if (cleanPath.endsWith('/china-emergency-numbers')) return 'china-emergency-numbers';
  if (cleanPath.endsWith('/faq')) return 'faq';
  return null;
}

export default function PolicyPage({ type, userId }: Props) {
  if (type === 'pricing') return <PricingPage />;
  if (type in guidePages) return <GuidePage type={type as GuidePageType} userId={userId} />;
  return <LegalPage type={type as LegalPageType} />;
}
