import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { unsubscribeNewsletter } from '../lib/newsletter';

type LegalPageType = 'terms' | 'privacy' | 'refund' | 'contact' | 'about' | 'unsubscribe';
type GuidePageType =
  | 'guides'
  | 'china-travel-apps'
  | 'china-esim-internet-guide'
  | 'alipay-for-foreigners'
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
          'China Travel Apps: prepare Alipay, WeChat, Amap, Didi, and Trip.com.',
          'Alipay for Foreigners: understand setup reminders and backup options.',
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
      { label: 'China travel apps', href: '/china-travel-apps/' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
  'china-travel-apps': {
    path: '/china-travel-apps/',
    title: 'Essential Apps for Foreign Tourists in China (2026)',
    intro:
      'A category-by-category guide to the apps that actually work in China — payments, maps, rides, trains, translation, and what to do about blocked services.',
    metaTitle: 'Essential Apps for Foreign Tourists in China 2026 | ChinaEase Buddy',
    metaDescription:
      'Which apps do foreign tourists need in China in 2026? Alipay, WeChat Pay, Amap, DiDi, Trip.com, translation tools — plus what to know about VPNs and Google Maps.',
    quickAnswer:
      'Install before you land: Alipay (payments — link your card at home), Amap or Apple Maps (navigation — Google Maps is unreliable in China), DiDi (ride-hailing), and Trip.com (trains and hotels). Some overseas apps are not directly accessible in China; travelers commonly prepare a VPN or international eSIM before arriving. Do all setup at home while you have your regular SIM and unblocked internet.',
    ctaLabel: 'Open the app checklist',
    ctaHref: '/?journey=before&tool=apps',
    sections: [
      {
        title: 'Which apps should I install before landing?',
        items: [
          'Alipay — link your Visa or Mastercard before you fly. Needed for QR payments at shops, restaurants, metro, and taxis.',
          'WeChat — messaging and payments. Many locals will want to add you on WeChat; it also works as a backup payment method.',
          'Amap (高德地图 / Gaode) — the most reliable map for China. Download the offline map pack for your destination before arriving.',
          'DiDi — ride-hailing app for taxis and private cars across China, with an English in-app option.',
          'Trip.com — English-language booking for trains, flights, and hotels in China.',
          'Your VPN app of choice — install before arrival; VPN provider sites may also not be accessible in China.',
        ],
      },
      {
        title: 'Payments: Alipay and WeChat Pay',
        items: [
          'Alipay accepts foreign Visa, Mastercard, JCB, Discover, and Diners Club cards. Link yours before flying — you need your home SIM to receive the bank SMS verification.',
          'WeChat Pay also supports foreign cards and uses the same QR-code scan system. Set up Alipay first as your primary; add WeChat Pay as a backup.',
          'Cash is rarely used in Chinese cities. Small restaurants, market stalls, and local shops expect Alipay or WeChat QR codes — not foreign cards directly.',
          'Full setup walkthrough: see the China Payment Guide.',
        ],
      },
      {
        title: 'Maps and navigation: what actually works?',
        items: [
          'Google Maps — do not rely on it in China. Map data is intentionally offset due to government coordinate-system requirements, and Google services are blocked without a VPN. Street and satellite data can appear shifted by hundreds of metres.',
          'Amap (高德地图 / Gaode) — the standard navigation app used across China. Accurate roads, real-time traffic, and public transit directions. The interface is primarily in Chinese; foreign visitors often find Apple Maps easier for English navigation.',
          'Apple Maps — uses AutoNavi (Amap) data for mainland China. Walking and driving directions are reliable; transit routing is available but less consistent — double-check metro and bus routes locally.',
          'Save your hotel address in Chinese characters before leaving home and paste it directly into Amap or DiDi when you arrive.',
        ],
      },
      {
        title: 'Ride-hailing: DiDi',
        items: [
          'DiDi is the dominant ride-hailing app in China, covering most cities large and small.',
          'DiDi has an English-language option available in the app settings.',
          'Payment in DiDi is made via Alipay or WeChat Pay linked inside the app.',
          'Always check the car plate and driver photo in the app before getting in — drivers in China rarely speak English.',
          'Save your destination in Chinese characters and show it to the driver if needed; paste from your notes app.',
        ],
      },
      {
        title: 'Trains and travel booking: Trip.com and 12306',
        items: [
          'Trip.com (formerly Ctrip) is the easiest option for foreign tourists: full English interface, accepts foreign Visa and Mastercard, and covers trains, flights, and hotels across China.',
          '12306 is the official China Railway ticketing app and website. It is primarily in Chinese and requires registration with a foreign passport — many tourists use Trip.com instead as it draws from the same inventory and is simpler to navigate.',
          'Book popular routes (Beijing–Shanghai, Beijing–Xi\'an, Chengdu–Lhasa) several days in advance; during national holidays (Golden Week, Spring Festival), book weeks ahead.',
          'You must show your passport at the station gate or ticket window — the name must match the booking exactly.',
        ],
      },
      {
        title: 'Translation and menus',
        items: [
          'Google Translate — camera translation is very useful for menus and signs, but requires a VPN to work in China.',
          'Translation app availability in China can be inconsistent; a tool that works offline or is built for China travel is more dependable.',
          'ChinaEase Buddy — search common dishes, keep restaurant phrases ready, and review possible ingredients or common allergens to confirm with staff. Menu photo help is in private testing.',
          'Offline tip: download the Chinese language pack inside any translation app before leaving home — camera translation then works without any internet connection.',
        ],
      },
      {
        title: 'VPN and eSIM: accessing blocked apps',
        items: [
          'Some overseas apps and websites aren\'t directly accessible in China — Google services, WhatsApp, Instagram, Facebook, and X are among those commonly affected.',
          'Travelers commonly prepare a VPN or an international eSIM before arriving.',
          'Some travelers use an international eSIM or roaming plan to access apps that may be restricted, but reliability varies — don\'t rely on it as your only option.',
        ],
      },
      {
        title: 'App comparison at a glance',
        table: {
          headers: ['App', 'Category', 'English interface', 'Key use'],
          rows: [
            ['Alipay', 'Payments', 'Yes', 'QR payments everywhere'],
            ['WeChat / WeChat Pay', 'Payments + messaging', 'Partial (Pay flows)', 'Payments, local contacts'],
            ['Amap (Gaode)', 'Maps', 'Primarily Chinese', 'Navigation, transit, offline maps'],
            ['Apple Maps', 'Maps', 'Yes', 'Navigation using Amap data'],
            ['DiDi', 'Ride-hailing', 'Yes (in-app setting)', 'Taxis and private cars'],
            ['Trip.com', 'Booking', 'Yes', 'Trains, flights, hotels'],
            ['12306', 'Rail tickets', 'Primarily Chinese', 'Official train booking'],
            ['ChinaEase Buddy', 'Food reference + tools', 'Yes', 'Dish reference, possible allergen reminders, phrases'],
          ],
        },
      },
    ],
    faqs: [
      {
        question: 'Does Google Maps work in China?',
        answer:
          'Not reliably. Map data in China is intentionally offset due to government coordinate-system requirements, and Google services are blocked without a VPN. Use Amap (Gaode) or Apple Maps instead.',
      },
      {
        question: 'Do I need a VPN in China?',
        answer:
          'If you want to use Google, WhatsApp, Instagram, or other services that may not be directly accessible in China, yes. If you only need maps and payments, local apps work without one.',
      },
      {
        question: 'Can I book China train tickets without a Chinese account?',
        answer:
          'Yes — Trip.com lets you book in English with a foreign card and passport. The official 12306 app works but is primarily in Chinese and requires a foreign-passport registration that some travelers find unreliable.',
      },
      {
        question: 'Which translation app works in China without a VPN?',
        answer:
          'Google Translate requires a VPN in China. Translation app availability can be inconsistent; a tool that works offline or is built for China travel is more dependable. ChinaEase Buddy works without a VPN and is specifically built for menu translation and travel phrase situations.',
      },
      {
        question: 'Should I set these apps up before or after arriving?',
        answer:
          'Before. Alipay card linking needs your home SIM for bank SMS verification. Some apps and their download sites may not be accessible once you arrive. Downloading offline map packs is also much faster on home Wi-Fi.',
      },
    ],
    related: [
      { label: 'China eSIM & internet guide', href: '/china-esim-internet-guide/' },
      { label: 'China payment guide', href: '/china-payment-guide/' },
      { label: 'China travel checklist', href: '/china-travel-checklist/' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers/' },
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
      { label: 'China travel apps', href: '/china-travel-apps/' },
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
  if (cleanPath.endsWith('/china-travel-apps')) return 'china-travel-apps';
  if (cleanPath.endsWith('/china-esim-internet-guide')) return 'china-esim-internet-guide';
  if (cleanPath.endsWith('/alipay-for-foreigners')) return 'alipay-for-foreigners';
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
